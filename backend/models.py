from pydantic import BaseModel
from typing import List, Optional
import uuid

class PlayerProfile(BaseModel):
    riot_id: str
    bio: str

class PlayerStats(BaseModel):
    avg_cs_per_minute: Optional[float] = None
    most_played_champions: Optional[List[str]] = []
    primary_lane: Optional[str] = None

class Player(BaseModel):
    puuid: str
    riot_id: str
    bio: str
    stats: PlayerStats
    embedding: Optional[List[float]] = None

class GroupCreate(BaseModel):
    name: str
    description: str
    looking_for: str  # What kind of player they're looking for

class Group(BaseModel):
    id: str
    name: str
    description: str
    looking_for: str
    members: List[str]  # List of PUUIDs
    embedding: Optional[List[float]] = None  # Group's collective embedding
    
    def __init__(self, **data):
        if 'id' not in data:
            data['id'] = str(uuid.uuid4())
        super().__init__(**data) 