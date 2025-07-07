#!/bin/bash
# Startup script for the backend server

# Navigate to backend directory
cd /Users/zhongsixian/Desktop/Vincent/playground/agentic-planner/backend/app

# Activate virtual environment
source venv/bin/activate

# Start the FastAPI server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
