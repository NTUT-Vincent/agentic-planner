import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage
from typing import Dict, Any
import json

from utils.extractjson import strip_json_markdown_block

class GoalParserAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.1
        )
    
    async def parse_goal(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Parse natural language goal into structured format"""
        
        goal_description = state.get("goal_description", "")
        plan_type = state.get("plan_type", "")
        
        system_prompt = """You are a goal parsing agent. Parse the user's goal description into structured data.
        
        Return a JSON object string without using ```json with the following structure:
        {
            "parsed_goal": {
                "main_objective": "clear objective statement",
                "target_metrics": [{"metric": "name", "target": "value", "unit": "unit"}],
                "timeline": "duration or specific dates",
                "key_milestones": ["milestone1", "milestone2"],
                "success_criteria": "how to measure success"
            }
        }
        
        Plan type: """ + plan_type
        
        
        print('Goal parsing system prompt:', system_prompt)
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Goal: {goal_description}")
        ]
        print('Goal parsing messages:', messages)
        
        try:
            response = await self.llm.ainvoke(messages)
            print('Goal parsing response:', strip_json_markdown_block(response.content))
            parsed_data = json.loads(strip_json_markdown_block(response.content))
            print('Parsed goal data:', parsed_data)
            state["parsed_goal"] = parsed_data["parsed_goal"]
            state["status"] = "goal_parsed"
            
        except Exception as e:
            print(f"Goal parsing failed: {str(e)}")
            state["error"] = f"Goal parsing failed: {str(e)}"
            state["status"] = "error"
        
        return state
