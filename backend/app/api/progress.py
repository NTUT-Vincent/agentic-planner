from fastapi import APIRouter, HTTPException
from schemas.schemas import (
    ProgressRequest, ProgressResponse, 
    AIProgressUpdateRequest, AIProgressUpdateResponse,
    BulkProgressUpdateRequest, BulkProgressUpdateResponse
)
from db.connection import get_collection
from agents.tracker import TrackerAgent
from agents.progress_updater import ProgressUpdaterAgent
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/progress", response_model=ProgressResponse)
async def log_progress(request: ProgressRequest):
    """Log progress for a specific task"""
    
    try:
        tracker = TrackerAgent()
        progress_id = await tracker.log_progress(
            task_id=request.task_id,
            user_id=request.user_id,
            status=request.status.value,
            value=request.value,
            note=request.note
        )
        
        return ProgressResponse(
            message="Progress logged successfully",
            progress_id=progress_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/progress/ai-update", response_model=AIProgressUpdateResponse)
async def ai_update_progress(request: AIProgressUpdateRequest):
    """Update progress using AI analysis of natural language input"""
    
    try:
        progress_updater = ProgressUpdaterAgent()
        result = await progress_updater.analyze_and_update_progress(
            task_id=request.task_id,
            user_input=request.user_input,
            user_id=request.user_id
        )
        
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        return AIProgressUpdateResponse(**result)
        
    except Exception as e:
        return AIProgressUpdateResponse(
            status="error",
            error=str(e),
            task_updated=False
        )

@router.post("/progress/bulk-ai-update", response_model=BulkProgressUpdateResponse)
async def bulk_ai_update_progress(request: BulkProgressUpdateRequest):
    """Update multiple tasks using AI analysis of natural language input"""
    
    try:
        progress_updater = ProgressUpdaterAgent()
        result = await progress_updater.bulk_progress_update(
            user_id=request.user_id,
            progress_updates=request.progress_updates
        )
        
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        return BulkProgressUpdateResponse(**result)
        
    except Exception as e:
        return BulkProgressUpdateResponse(
            status="error",
            error=str(e),
            total_updates=0
        )