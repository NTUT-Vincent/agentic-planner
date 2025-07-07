from fastapi import APIRouter, HTTPException
from schemas.schemas import CreatePlanRequest, CreatePlanResponse, PlanStatusResponse, PlanResponse
from models.models import Plan
from db.connection import get_collection
from graph.workflow import PlanningWorkflow
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/create", response_model=CreatePlanResponse)
async def create_plan(request: CreatePlanRequest):
    """Create a new plan and trigger LangGraph workflow"""
    
    try:
        plans_collection = get_collection("plans")
        
        # Create plan document
        plan = Plan(
            user_id=request.user_id,
            title=request.title,
            plan_type=request.plan_type,
            description=request.description,
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        # Save plan to MongoDB
        result = await plans_collection.insert_one(plan.dict(exclude={"id"}))
        plan_id = str(result.inserted_id)
        
        # Execute LangGraph workflow
        workflow = PlanningWorkflow()
        initial_state = {
            "goal_description": request.description,
            "plan_type": request.plan_type.value,
            "user_id": request.user_id,
            "plan_id": plan_id,
            "start_date": request.start_date.isoformat(),
            "end_date": request.end_date.isoformat(),
            "status": "initialized"
        }
        
        workflow_result = await workflow.execute_planning(initial_state)
        
        if workflow_result.get("status") == "error":
            raise HTTPException(status_code=500, detail=workflow_result.get("error"))
        
        return CreatePlanResponse(
            plan_id=plan_id,
            message=workflow_result.get("message", "Plan created successfully"),
            tasks_created=workflow_result.get("tasks_count", 0)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{plan_id}", response_model=PlanStatusResponse)
async def get_plan_status(plan_id: str):
    """Get plan status and completion statistics"""
    
    try:
        plans_collection = get_collection("plans")
        tasks_collection = get_collection("tasks")
        
        # Get plan
        plan = await plans_collection.find_one({"_id": ObjectId(plan_id)})
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        # Get tasks statistics
        tasks = await tasks_collection.find({"plan_id": plan_id}).to_list(None)
        total_tasks = len(tasks)
        completed_tasks = sum(1 for task in tasks if task["status"] == "completed")
        pending_tasks = total_tasks - completed_tasks
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Calculate days remaining
        end_date = plan["end_date"]
        days_remaining = max(0, (end_date - datetime.utcnow()).days)
        
        return PlanStatusResponse(
            plan_id=plan_id,
            title=plan["title"],
            completion_rate=round(completion_rate, 2),
            days_remaining=days_remaining,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            pending_tasks=pending_tasks
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans/user/{user_id}", response_model=List[PlanResponse])
async def get_user_plans(user_id: str):
    """Get all plans for a specific user with completion statistics"""
    
    try:
        plans_collection = get_collection("plans")
        tasks_collection = get_collection("tasks")
        
        # Get user's plans
        plans_cursor = plans_collection.find({"user_id": user_id, "is_active": True})
        plans = await plans_cursor.to_list(None)
        
        if not plans:
            return []
        
        plan_responses = []
        
        for plan in plans:
            plan_id = str(plan["_id"])
            
            # Get tasks statistics for this plan
            tasks = await tasks_collection.find({"plan_id": plan_id}).to_list(None)
            total_tasks = len(tasks)
            completed_tasks = sum(1 for task in tasks if task["status"] == "completed")
            pending_tasks = total_tasks - completed_tasks
            
            completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            # Calculate days remaining
            end_date = plan["end_date"]
            days_remaining = max(0, (end_date - datetime.utcnow()).days)
            
            plan_response = PlanResponse(
                plan_id=plan_id,
                user_id=plan["user_id"],
                title=plan["title"],
                plan_type=plan["plan_type"],
                description=plan.get("description"),
                start_date=plan["start_date"],
                end_date=plan["end_date"],
                completion_rate=round(completion_rate, 2),
                days_remaining=days_remaining,
                total_tasks=total_tasks,
                completed_tasks=completed_tasks,
                pending_tasks=pending_tasks,
                created_at=plan["created_at"],
                is_active=plan["is_active"]
            )
            plan_responses.append(plan_response)
        
        # Sort by creation date (newest first)
        plan_responses.sort(key=lambda x: x.created_at, reverse=True)
        
        return plan_responses
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
