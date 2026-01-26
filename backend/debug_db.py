
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import SessionLocal, User, Bot, Match
from sqlalchemy import func

db = SessionLocal()

print("Users:")
users = db.query(User).all()
for u in users:
    print(f"ID: {u.id}, Username: {u.username}")

print("\nBots:")
bots = db.query(Bot).all()
for b in bots:
    print(f"ID: {b.id}, UserID: {b.owner.username}, Name: {b.name}, Active: {b.is_active}, File: {b.file_path}")

print("\nMatches:")
matches = db.query(Match).order_by(Match.id.desc()).limit(5).all()
for m in matches:
    print(f"Match {m.id}, Status: {m.status}")
    if m.participants:
        print(f"  Participants: {[p.player_id for p in m.participants]}")

db.close()
