from langgraph.graph import StateGraph, END
from typing import Dict, Any, TypedDict
from agents.goal_parser import GoalParserAgent
from agents.planner import PlannerAgent
from agents.tracker import TrackerAgent

class PlanningState(TypedDict):
    goal_description: str
    plan_type: str
    user_id: str
    plan_id: str
    start_date: str
    end_date: str
    parsed_goal: Dict[str, Any]
    planned_tasks: list
    saved_tasks: list
    tasks_count: int
    status: str
    error: str

class PlanningWorkflow:
    def __init__(self):
        self.goal_parser = GoalParserAgent()
        self.planner = PlannerAgent()
        self.tracker = TrackerAgent()
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build the planning workflow graph"""
        
        workflow = StateGraph(PlanningState)
        
        # Add nodes
        workflow.add_node("parse_goal", self.goal_parser.parse_goal)
        workflow.add_node("create_plan", self.planner.create_plan)
        workflow.add_node("save_tasks", self.tracker.save_tasks)
        
        # Add edges
        workflow.add_edge("parse_goal", "create_plan")
        workflow.add_edge("create_plan", "save_tasks")
        workflow.add_edge("save_tasks", END)
        
        # Set entry point
        workflow.set_entry_point("parse_goal")
        
        return workflow.compile()
    
    async def execute_planning(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the complete planning workflow"""
        
        try:
            print('aaaa', initial_state)
            result = await self.workflow.ainvoke(initial_state)
            return result
        except Exception as e:
            print('aaaa', e)
            return {
                **initial_state,
                "error": f"Workflow execution failed: {str(e)}",
                "status": "error"
            }
