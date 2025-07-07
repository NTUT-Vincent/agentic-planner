from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PlanType(str, Enum):
    STUDY = "study"
    WEIGHT_LOSS = "weight_loss"
    FINANCIAL = "financial"
    LIFE_TASKS = "life_tasks"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"

class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    username: str
    email: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Plan(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    title: str
    plan_type: PlanType
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class Task(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    plan_id: str
    title: str
    description: Optional[str] = None
    target_date: datetime
    status: TaskStatus = TaskStatus.PENDING
    unit: Optional[str] = None  # e.g., "pages", "kg", "USD"
    target_value: Optional[float] = None
    current_value: Optional[float] = 0
    memo: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProgressLog(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    task_id: str
    user_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
    status: TaskStatus
    value: Optional[float] = None
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
