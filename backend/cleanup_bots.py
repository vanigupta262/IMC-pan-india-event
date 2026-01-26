
from app import SessionLocal, Bot, User
from sqlalchemy import func

db = SessionLocal()

print("Cleaning up active bots...")
users = db.query(User).all()
for u in users:
    bots = db.query(Bot).filter(Bot.user_id == u.id, Bot.is_active == True).order_by(Bot.id.desc()).all()
    if len(bots) > 1:
        print(f"User {u.username} has {len(bots)} active bots. Keeping {bots[0].name} (ID {bots[0].id}).")
        for b in bots[1:]:
            b.is_active = False
            print(f"  - Deactivated {b.name} (ID {b.id})")
    elif len(bots) == 1:
        print(f"User {u.username} has 1 active bot: {bots[0].name}")
    else:
        print(f"User {u.username} has NO active bots.")

db.commit()
print("Cleanup complete.")
db.close()
