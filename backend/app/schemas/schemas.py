from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models.models import PlanType, TaskStatus

# Authentication schemas
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class CreatePlanRequest(BaseModel):
    user_id: str
    title: str
    plan_type: PlanType
    description: str
    start_date: datetime
    end_date: datetime

class CreatePlanResponse(BaseModel):
    plan_id: str
    message: str
    tasks_created: int

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    target_date: datetime
    status: TaskStatus
    unit: Optional[str]
    target_value: Optional[float]
    current_value: Optional[float]
    memo: Optional[str] = None

class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    current_value: Optional[float] = None
    memo: Optional[str] = None

class ProgressRequest(BaseModel):
    task_id: str
    user_id: str
    status: TaskStatus
    value: Optional[float] = None
    note: Optional[str] = None

class ProgressResponse(BaseModel):
    message: str
    progress_id: str

class PlanStatusResponse(BaseModel):
    plan_id: str
    title: str
    completion_rate: float
    days_remaining: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int

class AIProgressUpdateRequest(BaseModel):
    task_id: str
    user_id: str
    user_input: str  # Natural language progress description

class AIProgressUpdateResponse(BaseModel):
    status: str
    progress_id: Optional[str] = None
    analysis: Optional[dict] = None
    task_updated: bool = False
    error: Optional[str] = None

class BulkProgressUpdateRequest(BaseModel):
    user_id: str
    progress_updates: str  # Natural language describing multiple progress updates

class BulkProgressUpdateResponse(BaseModel):
    status: str
    updated_tasks: List[str] = []
    summary: str = ""
    total_updates: int = 0
    error: Optional[str] = None

class PlanResponse(BaseModel):
    plan_id: str
    user_id: str
    title: str
    plan_type: PlanType
    description: Optional[str]
    start_date: datetime
    end_date: datetime
    completion_rate: float
    days_remaining: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    created_at: datetime
    is_active: bool
