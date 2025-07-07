import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage
from typing import Dict, Any
import json
from datetime import datetime
from utils.extractjson import strip_json_markdown_block
from db.connection import get_collection
from models.models import ProgressLog, TaskStatus
from bson import ObjectId

class ProgressUpdaterAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.2
        )
        self.tasks_collection = get_collection("tasks")
        self.progress_collection = get_collection("progress_logs")
    
    async def analyze_and_update_progress(self, task_id: str, user_input: str, user_id: str) -> Dict[str, Any]:
        """Analyze user input and automatically update task progress"""
        
        try:
            # Get task details
            task = await self.tasks_collection.find_one({"_id": ObjectId(task_id)})
            if not task:
                return {"error": "Task not found", "status": "error"}
            
            # Prepare context for AI analysis
            system_prompt = """You are a progress analysis agent. Analyze the user's input about their task progress and determine:
            1. What progress value should be recorded
            2. What status the task should have
            3. Generate an appropriate note summarizing the progress
            
            Return JSON without markdown blocks:
            {
                "progress_analysis": {
                    "new_value": 0.0,
                    "new_status": "pending|in_progress|completed|skipped",
                    "confidence": 0.9,
                    "note": "Summary of progress update",
                    "reasoning": "Why this update was made"
                }
            }
            
            Task Details:
            - Title: """ + task["title"] + """
            - Description: """ + task.get("description", "N/A") + """
            - Unit: """ + str(task.get("unit", "N/A")) + """
            - Target Value: """ + str(task.get("target_value", "N/A")) + """
            - Current Value: """ + str(task.get("current_value", 0)) + """
            - Current Status: """ + task["status"]
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"User Progress Update: {user_input}")
            ]
            
            # Get AI analysis
            response = await self.llm.ainvoke(messages)
            print('Progress analysis response:', strip_json_markdown_block(response.content))
            analysis_data = json.loads(strip_json_markdown_block(response.content))
            print('Parsed analysis data:', analysis_data)
            
            progress_analysis = analysis_data["progress_analysis"]
            
            # Create progress log
            progress_log = ProgressLog(
                task_id=task_id,
                user_id=user_id,
                status=progress_analysis["new_status"],
                value=progress_analysis["new_value"],
                note=progress_analysis["note"]
            )
            
            # Save progress log
            result = await self.progress_collection.insert_one(
                progress_log.dict(exclude={"id"})
            )
            
            # Update task
            update_data = {
                "current_value": progress_analysis["new_value"],
                "status": progress_analysis["new_status"]
            }
            
            await self.tasks_collection.update_one(
                {"_id": ObjectId(task_id)},
                {"$set": update_data}
            )
            
            return {
                "status": "success",
                "progress_id": str(result.inserted_id),
                "analysis": progress_analysis,
                "task_updated": True
            }
            
        except Exception as e:
            print(f"Progress update failed: {str(e)}")
            return {
                "error": f"Progress update failed: {str(e)}",
                "status": "error"
            }
    
    async def bulk_progress_update(self, user_id: str, progress_updates: str) -> Dict[str, Any]:
        """Process multiple progress updates from user input"""
        
        try:
            # Get user's active tasks
            plans_collection = get_collection("plans")
            user_plans = await plans_collection.find({"user_id": user_id, "is_active": True}).to_list(None)
            plan_ids = [str(plan["_id"]) for plan in user_plans]
            
            if not plan_ids:
                return {"error": "No active plans found", "status": "error"}
            
            # Get active tasks
            tasks_cursor = self.tasks_collection.find({
                "plan_id": {"$in": plan_ids},
                "status": {"$in": ["pending", "in_progress"]}
            })
            tasks = await tasks_cursor.to_list(None)
            
            # Prepare context
            tasks_context = "\n".join([
                f"- Task ID: {str(task['_id'])}, Title: {task['title']}, Current: {task.get('current_value', 0)}, Target: {task.get('target_value', 'N/A')} {task.get('unit', '')}"
                for task in tasks
            ])
            
            system_prompt = """You are a bulk progress analyzer. Match the user's progress updates to their active tasks and suggest updates.
            
            Return JSON without markdown blocks:
            {
                "bulk_updates": [
                    {
                        "task_id": "task_id_here",
                        "new_value": 0.0,
                        "new_status": "pending|in_progress|completed|skipped",
                        "note": "What was accomplished",
                        "confidence": 0.9
                    }
                ],
                "summary": "Overall summary of updates"
            }
            
            Active Tasks:
            """ + tasks_context
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Progress Updates: {progress_updates}")
            ]
            
            response = await self.llm.ainvoke(messages)
            analysis_data = json.loads(strip_json_markdown_block(response.content))
            
            # Process each update
            updated_tasks = []
            for update in analysis_data["bulk_updates"]:
                if update["confidence"] >= 0.7:  # Only process high-confidence updates
                    task_id = update["task_id"]
                    
                    # Create progress log
                    progress_log = ProgressLog(
                        task_id=task_id,
                        user_id=user_id,
                        status=update["new_status"],
                        value=update["new_value"],
                        note=update["note"]
                    )
                    
                    await self.progress_collection.insert_one(
                        progress_log.dict(exclude={"id"})
                    )
                    
                    # Update task
                    await self.tasks_collection.update_one(
                        {"_id": ObjectId(task_id)},
                        {"$set": {
                            "current_value": update["new_value"],
                            "status": update["new_status"]
                        }}
                    )
                    
                    updated_tasks.append(task_id)
            
            return {
                "status": "success",
                "updated_tasks": updated_tasks,
                "summary": analysis_data["summary"],
                "total_updates": len(updated_tasks)
            }
            
        except Exception as e:
            print(f"Bulk progress update failed: {str(e)}")
            return {
                "error": f"Bulk progress update failed: {str(e)}",
                "status": "error"
            }
