import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

db = MongoDB()

async def init_db() -> None:
    """Initialize MongoDB connection"""
    db.client = AsyncIOMotorClient(os.getenv("uri"))
    db.database = db.client.agentic_planner
    print("Connected to MongoDB Atlas")

async def close_db() -> None:
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db.database

def get_collection(name: str) -> AsyncIOMotorCollection:
    """Get collection by name"""
    return db.database[name]
