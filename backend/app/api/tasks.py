from fastapi import APIRouter, HTTPException
from typing import List
from schemas.schemas import TaskResponse, TaskUpdate
from db.connection import get_collection
from bson import ObjectId

router = APIRouter()

@router.get("/tasks/{plan_id}", response_model=List[TaskResponse])
async def get_tasks(plan_id: str):
    """Get all tasks for a specific plan"""
    
    try:
        tasks_collection = get_collection("tasks")
        
        # Find tasks for the plan
        tasks_cursor = tasks_collection.find({"plan_id": plan_id})
        tasks = await tasks_cursor.to_list(None)
        
        if not tasks:
            return []
        
        # Convert to response format
        task_responses = []
        for task in tasks:
            task_response = TaskResponse(
                id=str(task["_id"]),
                title=task["title"],
                description=task.get("description"),
                target_date=task["target_date"],
                status=task["status"],
                unit=task.get("unit"),
                target_value=task.get("target_value"),
                current_value=task.get("current_value", 0),
                memo=task.get("memo")
            )
            task_responses.append(task_response)
        
        return task_responses
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/user/{user_id}", response_model=List[TaskResponse])
async def get_user_tasks(user_id: str):
    """Get all tasks for a specific user across all plans"""
    
    try:
        plans_collection = get_collection("plans")
        tasks_collection = get_collection("tasks")
        
        # Get user's plans
        user_plans = await plans_collection.find({"user_id": user_id}).to_list(None)
        plan_ids = [str(plan["_id"]) for plan in user_plans]
        
        if not plan_ids:
            return []
        
        # Get tasks for all user plans
        tasks_cursor = tasks_collection.find({"plan_id": {"$in": plan_ids}})
        tasks = await tasks_cursor.to_list(None)
        
        # Convert to response format
        task_responses = []
        for task in tasks:
            task_response = TaskResponse(
                id=str(task["_id"]),
                title=task["title"],
                description=task.get("description"),
                target_date=task["target_date"],
                status=task["status"],
                unit=task.get("unit"),
                target_value=task.get("target_value"),
                current_value=task.get("current_value", 0),
                memo=task.get("memo")
            )
            task_responses.append(task_response)
        
        return task_responses
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update a task's status, progress, and memo"""
    
    try:
        tasks_collection = get_collection("tasks")
        
        # Prepare update data
        update_data = {}
        if task_update.status is not None:
            update_data["status"] = task_update.status
        if task_update.current_value is not None:
            update_data["current_value"] = task_update.current_value
        if task_update.memo is not None:
            update_data["memo"] = task_update.memo
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
        
        # Update the task
        result = await tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Get the updated task
        updated_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
        
        return TaskResponse(
            id=str(updated_task["_id"]),
            title=updated_task["title"],
            description=updated_task.get("description"),
            target_date=updated_task["target_date"],
            status=updated_task["status"],
            unit=updated_task.get("unit"),
            target_value=updated_task.get("target_value"),
            current_value=updated_task.get("current_value", 0),
            memo=updated_task.get("memo")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
