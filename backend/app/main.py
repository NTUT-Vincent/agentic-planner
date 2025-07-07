from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.connection import init_db, close_db
from api import plans, tasks, progress_simple as progress, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()

app = FastAPI(
    title="Agentic Planner API",
    description="Multi-goal planning system with LangGraph agents",
    version="1.0.0",
    lifespan=lifespan
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(plans.router, prefix="/api", tags=["plans"])
app.include_router(tasks.router, prefix="/api", tags=["tasks"])  
app.include_router(progress.router, prefix="/api", tags=["progress"])

@app.get("/")
async def root():
    return {"message": "Agentic Planner API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
