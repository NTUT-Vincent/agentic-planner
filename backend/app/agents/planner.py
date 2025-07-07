import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage
from typing import Dict, Any, List
from datetime import datetime, timedelta
import json

from utils.extractjson import strip_json_markdown_block

class PlannerAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.3
        )
    
    async def create_plan(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed task plan based on parsed goal"""
        
        parsed_goal = state.get("parsed_goal", {})
        start_date = state.get("start_date")
        end_date = state.get("end_date")
        plan_type = state.get("plan_type", "")
        
        system_prompt = """You are a planning agent. Create a detailed task breakdown for the given goal.
        
        Based on the parsed goal, create a list of specific, actionable tasks with the following structure:
        {
            "tasks": [
                {
                    "title": "Task title",
                    "description": "Detailed description",
                    "target_date": "YYYY-MM-DD",
                    "unit": "measurement unit (pages, kg, USD, etc.)",
                    "target_value": 0.0,
                    "priority": "high|medium|low"
                }
            ],
            "plan_summary": "Overall plan summary"
        }
        
        Plan type: """ + plan_type + """
        Duration: """ + start_date + """ to """ + end_date + """
        
        Make tasks specific, measurable, and time-bound. Distribute them evenly across the timeline.
        Return JSON without using ```json markdown blocks."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Parsed Goal: {json.dumps(parsed_goal, indent=2)}")
        ]
        
        try:
            response = await self.llm.ainvoke(messages)
            print('Planning response:', strip_json_markdown_block(response.content))
            plan_data = json.loads(strip_json_markdown_block(response.content))
            print('Parsed plan data:', plan_data)
            
            state["planned_tasks"] = plan_data["tasks"]
            state["plan_summary"] = plan_data.get("plan_summary", "")
            state["status"] = "plan_created"
            
        except Exception as e:
            print(f"Planning failed: {str(e)}")
            state["error"] = f"Planning failed: {str(e)}"
            state["status"] = "error"
        
        return state
