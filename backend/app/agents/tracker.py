from typing import Dict, Any
from db.connection import get_collection
from models.models import Task, ProgressLog
from bson import ObjectId
from datetime import datetime

class TrackerAgent:
    def __init__(self):
        self.tasks_collection = get_collection("tasks")
        self.progress_collection = get_collection("progress_logs")
    
    async def save_tasks(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Save planned tasks to MongoDB"""
        
        planned_tasks = state.get("planned_tasks", [])
        plan_id = state.get("plan_id", "")
        
        try:
            saved_tasks = []
            
            for task_data in planned_tasks:
                task = Task(
                    plan_id=plan_id,
                    title=task_data["title"],
                    description=task_data.get("description", ""),
                    target_date=datetime.fromisoformat(task_data["target_date"]),
                    unit=task_data.get("unit"),
                    target_value=task_data.get("target_value")
                )
                
                result = await self.tasks_collection.insert_one(task.dict(exclude={"id"}))
                task.id = str(result.inserted_id)
                saved_tasks.append(task)
            
            state["saved_tasks"] = [task.dict() for task in saved_tasks]
            state["tasks_count"] = len(saved_tasks)
            state["status"] = "tasks_saved"
            
        except Exception as e:
            state["error"] = f"Task saving failed: {str(e)}"
            state["status"] = "error"
        
        return state
    
    async def log_progress(self, task_id: str, user_id: str, status: str, 
                          value: float = None, note: str = None) -> str:
        """Log progress for a specific task"""
        
        try:
            progress_log = ProgressLog(
                task_id=task_id,
                user_id=user_id,
                status=status,
                value=value,
                note=note
            )
            
            result = await self.progress_collection.insert_one(
                progress_log.dict(exclude={"id"})
            )
            
            # Update task current_value if value provided
            if value is not None:
                await self.tasks_collection.update_one(
                    {"_id": ObjectId(task_id)},
                    {"$set": {"current_value": value, "status": status}}
                )
            
            return str(result.inserted_id)
            
        except Exception as e:
            raise Exception(f"Progress logging failed: {str(e)}")
