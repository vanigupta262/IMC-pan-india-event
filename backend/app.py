"""
IGTS IMC Event Backend API
FastAPI-based platform for team registration, bot uploads, lobbies, and match orchestration.
"""
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Float, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import secrets
import os
import json
from typing import Optional, List
from game_orchestrator import GameOrchestrator

# ============ Database Setup ============
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./igts.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============ Models ============

class User(Base):
    """Represents a team/user in the system."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    bots = relationship("Bot", back_populates="owner")
    lobbies = relationship("Lobby", back_populates="creator")
    lobby_members = relationship("LobbyMember", back_populates="user")
    matches = relationship("Match", back_populates="user")


class Bot(Base):
    """Represents a submitted bot file."""
    __tablename__ = "bots"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    version = Column(Integer, default=1)
    file_path = Column(String)  # path in object storage or local disk
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    owner = relationship("User", back_populates="bots")
    match_participants = relationship("MatchParticipant", back_populates="bot")


class Lobby(Base):
    """Represents a private or public lobby for a match."""
    __tablename__ = "lobbies"
    
    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    is_private = Column(Boolean, default=True)
    invite_code = Column(String, unique=True, index=True, nullable=True)  # null if public
    max_players = Column(Integer, default=5)
    status = Column(String, default="open")  # open, full, started, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User", back_populates="lobbies")
    members = relationship("LobbyMember", back_populates="lobby", cascade="all, delete-orphan")
    match = relationship("Match", uselist=False, back_populates="lobby")


class LobbyMember(Base):
    """Represents a player in a lobby."""
    __tablename__ = "lobby_members"
    
    id = Column(Integer, primary_key=True, index=True)
    lobby_id = Column(Integer, ForeignKey("lobbies.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    lobby = relationship("Lobby", back_populates="members")
    user = relationship("User", back_populates="lobby_members")


class Match(Base):
    """Represents a running or completed game instance."""
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, index=True)
    lobby_id = Column(Integer, ForeignKey("lobbies.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # creator/organizer
    status = Column(String, default="pending")  # pending, running, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    log_file_path = Column(String, nullable=True)  # path to match log (JSON)
    log_data = Column(Text, nullable=True)  # JSON match log data
    final_result = Column(Text, nullable=True)  # JSON with final economies/ranking
    
    lobby = relationship("Lobby", back_populates="match")
    user = relationship("User", back_populates="matches")
    participants = relationship("MatchParticipant", back_populates="match", cascade="all, delete-orphan")


class MatchParticipant(Base):
    """Represents a player + bot pair in a match."""
    __tablename__ = "match_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    player_id = Column(Integer)  # 0-based player index in the match
    bot_id = Column(Integer, ForeignKey("bots.id"), nullable=True)
    final_economy = Column(Float, nullable=True)
    rank = Column(Integer, nullable=True)
    
    match = relationship("Match", back_populates="participants")
    bot = relationship("Bot", back_populates="match_participants")


# ============ Schemas (Pydantic) ============

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class BotCreate(BaseModel):
    name: str


class BotResponse(BaseModel):
    id: int
    user_id: int
    name: str
    version: int
    uploaded_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


class LobbyCreate(BaseModel):
    name: str
    creator_id: int
    is_private: bool = False
    max_players: int = 2  # Changed from 5 to 2


class LobbyJoin(BaseModel):
    user_id: int
    invite_code: Optional[str] = None


class LobbyResponse(BaseModel):
    id: int
    name: str
    creator_id: int
    is_private: bool
    invite_code: Optional[str]
    status: str
    max_players: int
    
    @property
    def member_count(self) -> int:
        return len(self.members) if hasattr(self, 'members') else 0
    
    class Config:
        from_attributes = True


class MatchCreate(BaseModel):
    lobby_id: Optional[int] = None
    player_ids: Optional[List[int]] = None  # for direct match creation


class MatchParticipantResponse(BaseModel):
    id: int
    match_id: int
    player_id: int
    rank: int
    final_economy: int
    
    class Config:
        from_attributes = True


class MatchResponse(BaseModel):
    id: int
    status: str
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    participants: List['MatchParticipantResponse'] = []
    
    class Config:
        from_attributes = True


# ============ FastAPI App ============

app = FastAPI(title="IGTS IMC Event API", version="1.0")

# Add CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency: get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============ Endpoints ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Backend is running"}

@app.on_event("startup")
async def startup():
    """Create tables on startup."""
    Base.metadata.create_all(bind=engine)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# --- Authentication / User Management ---

@app.post("/auth/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new team."""
    # Check if user already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user (in production, hash password properly with bcrypt)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=user_data.password  # TODO: hash with bcrypt
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# --- Bot Management ---

@app.post("/bots/upload", response_model=BotResponse, status_code=201)
async def upload_bot(
    user_id: int,
    bot_name: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a bot file."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate file is Python
    if not file.filename.endswith(".py"):
        raise HTTPException(status_code=400, detail="Bot must be a .py file")
    
    # Read and store file (in production, use S3 or similar)
    content = await file.read()
    file_path = f"bots/{user_id}/{bot_name}_{secrets.token_hex(4)}.py"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(content)
    
    new_bot = Bot(
        user_id=user_id,
        name=bot_name,
        file_path=file_path,
        version=1
    )
    db.add(new_bot)
    db.commit()
    db.refresh(new_bot)
    return new_bot


@app.get("/bots", response_model=List[BotResponse])
async def list_bots(user_id: int, db: Session = Depends(get_db)):
    """List all bots for a user."""
    bots = db.query(Bot).filter(Bot.user_id == user_id).all()
    return bots


@app.post("/bots/{bot_id}/activate")
async def activate_bot(bot_id: int, db: Session = Depends(get_db)):
    """Activate a bot."""
    bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    bot.is_active = True
    db.commit()
    return {"message": "Bot activated"}


@app.post("/bots/{bot_id}/deactivate")
async def deactivate_bot(bot_id: int, db: Session = Depends(get_db)):
    """Deactivate a bot."""
    bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    bot.is_active = False
    db.commit()
    return {"message": "Bot deactivated"}


# --- Lobby Management ---

@app.post("/lobbies", response_model=LobbyResponse, status_code=201)
async def create_lobby(lobby_data: LobbyCreate, db: Session = Depends(get_db)):
    """Create a new lobby."""
    user = db.query(User).filter(User.id == lobby_data.creator_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Enforce max 2 players per lobby
    if lobby_data.max_players > 2:
        raise HTTPException(status_code=400, detail="Lobby max_players cannot exceed 2")
    
    # Generate invite code if private
    invite_code = None
    if lobby_data.is_private:
        invite_code = secrets.token_urlsafe(8)
    
    new_lobby = Lobby(
        creator_id=lobby_data.creator_id,
        name=lobby_data.name,
        is_private=lobby_data.is_private,
        invite_code=invite_code,
        max_players=lobby_data.max_players
    )
    db.add(new_lobby)
    db.commit()
    db.refresh(new_lobby)
    
    # Add creator to members
    member = LobbyMember(lobby_id=new_lobby.id, user_id=lobby_data.creator_id)
    db.add(member)
    db.commit()
    
    return new_lobby


@app.get("/lobbies", response_model=List[dict])
async def list_lobbies(db: Session = Depends(get_db)):
    """List all open lobbies with member counts."""
    lobbies = db.query(Lobby).filter(Lobby.status == "open").all()
    result = []
    for lobby in lobbies:
        member_count = db.query(LobbyMember).filter(LobbyMember.lobby_id == lobby.id).count()
        result.append({
            "id": lobby.id,
            "name": lobby.name,
            "creator_id": lobby.creator_id,
            "is_private": lobby.is_private,
            "invite_code": lobby.invite_code,
            "status": lobby.status,
            "max_players": lobby.max_players,
            "member_count": member_count
        })
    return result


@app.get("/lobbies/{lobby_id}", response_model=LobbyResponse)
async def get_lobby(lobby_id: int, db: Session = Depends(get_db)):
    """Get lobby details."""
    lobby = db.query(Lobby).filter(Lobby.id == lobby_id).first()
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return lobby


@app.post("/lobbies/{lobby_id}/join")
async def join_lobby_by_id(lobby_id: int, join_data: LobbyJoin, db: Session = Depends(get_db)):
    """Join a lobby by ID with optional invite code for private lobbies."""
    lobby = db.query(Lobby).filter(Lobby.id == lobby_id).first()
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    # If private, require invite code
    if lobby.is_private:
        if not join_data.invite_code or join_data.invite_code != lobby.invite_code:
            raise HTTPException(status_code=403, detail="Invalid invite code")
    
    if lobby.status != "open":
        raise HTTPException(status_code=400, detail="Lobby is not accepting new players")
    
    user_id = join_data.user_id
    member_count = db.query(LobbyMember).filter(LobbyMember.lobby_id == lobby.id).count()
    if member_count >= lobby.max_players:
        raise HTTPException(status_code=400, detail="Lobby is full")
    
    # Check if already a member
    existing = db.query(LobbyMember).filter(
        LobbyMember.lobby_id == lobby.id,
        LobbyMember.user_id == user_id
    ).first()
    if existing:
        return {"message": "Already a member of this lobby"}
    
    new_member = LobbyMember(lobby_id=lobby.id, user_id=user_id)
    db.add(new_member)
    db.commit()
    db.refresh(lobby)
    
    return {"message": "Successfully joined lobby"}


# --- Match Management ---

@app.post("/matches", response_model=MatchResponse, status_code=201)
async def create_match(match_data: MatchCreate, user_id: int, db: Session = Depends(get_db)):
    """Create a match from a lobby or direct player list."""
    new_match = Match(user_id=user_id, status="pending")
    
    if match_data.lobby_id:
        lobby = db.query(Lobby).filter(Lobby.id == match_data.lobby_id).first()
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby not found")
        new_match.lobby_id = lobby.id
        lobby.status = "started"
    
    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    return new_match


@app.get("/matches", response_model=List[MatchResponse])
async def list_matches(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """List all matches, optionally filtered by user."""
    query = db.query(Match)
    if user_id:
        # Filter matches where user is a participant
        query = query.join(MatchParticipant).filter(MatchParticipant.player_id == user_id)
    matches = query.order_by(Match.created_at.desc()).all()
    return matches


@app.get("/matches/{match_id}", response_model=MatchResponse)
async def get_match(match_id: int, db: Session = Depends(get_db)):
    """Get match details and status with participants."""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Fetch participants
    participants = db.query(MatchParticipant).filter(MatchParticipant.match_id == match.id).all()
    match.participants = participants
    return match


@app.post("/matches/{match_id}/run", response_model=MatchResponse)
async def run_match(match_id: int, db: Session = Depends(get_db)):
    """Execute a pending match with 100-round game simulation."""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.status != "pending":
        raise HTTPException(status_code=400, detail=f"Match is already {match.status}")
    
    match.status = "completed"
    match.completed_at = datetime.utcnow()
    
    # Get lobby and participants
    lobby = db.query(Lobby).filter(Lobby.id == match.lobby_id).first() if match.lobby_id else None
    if lobby:
        members = db.query(LobbyMember).filter(LobbyMember.lobby_id == lobby.id).all()
        
        # Prepare player and bot data
        # Map player indices (0, 1, ...) to user IDs and bot file paths
        players = []
        bots = {}
        player_index = 0
        for member in members:
            user = db.query(User).filter(User.id == member.user_id).first()
            if user:
                # Use player index (0, 1, ...) as the key for game engine
                players.append({"id": player_index, "username": user.username, "user_id": user.id})
                bot = db.query(Bot).filter(Bot.user_id == user.id).first()
                if bot:
                    bots[player_index] = bot.file_path
                    print(f"[Match {match_id}] Player {player_index} ({user.username}): bot file = {bot.file_path}")
                player_index += 1
        
        # Run the 100-round game simulation
        orchestrator = GameOrchestrator(match_id, players, bots)
        game_log = orchestrator.run()
        
        # Create reverse mapping: player_index -> user_id
        player_to_user = {p["id"]: p["user_id"] for p in players}
        
        # Create match participants with final rankings
        for result in game_log["final_state"]["rankings"]:
            player_id = result["player_id"]
            user_id = player_to_user.get(player_id)
            
            participant = MatchParticipant(
                match_id=match.id,
                player_id=player_id,
                rank=result["rank"],
                final_economy=int(result["economy"])
            )
            # Assign bot if available (lookup by user_id)
            if user_id:
                bot = db.query(Bot).filter(Bot.user_id == user_id).first()
                if bot:
                    participant.bot_id = bot.id
            db.add(participant)
        
        # Store the complete game log
        match.log_data = json.dumps(game_log)
    
    db.commit()
    db.refresh(match)
    return match


@app.get("/matches/{match_id}/log")
async def get_match_log(match_id: int, db: Session = Depends(get_db)):
    """Get match log (JSON with round-by-round replay data)."""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if not match.log_data:
        raise HTTPException(status_code=404, detail="Match log not available yet")
    
    try:
        return json.loads(match.log_data)
    except:
        raise HTTPException(status_code=500, detail="Error parsing match log")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
