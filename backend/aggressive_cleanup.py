
import os
import shutil
from app import SessionLocal, Bot, User, MatchParticipant

db = SessionLocal()

print("🔍 Inspecting bots for cleanup...")

# 1. Delete all INACTIVE bots
inactive_bots = db.query(Bot).filter(Bot.is_active == False).all()
print(f"Found {len(inactive_bots)} inactive bots to delete.")
for bot in inactive_bots:
    print(f"  - Deleting inactive bot: {bot.name} (ID {bot.id}, User {bot.user_id})")
    # Remove file if exists
    if os.path.exists(bot.file_path):
        try:
            os.remove(bot.file_path)
            print(f"    Deleted file: {bot.file_path}")
        except Exception as e:
            print(f"    Error deleting file: {e}")
    db.delete(bot)

# 2. Delete any bot named 'abot' specifically if it still exists (even if active, it's 'fishy')
abots = db.query(Bot).filter(Bot.name == "abot").all()
for bot in abots:
    print(f"  - Deleting 'fishy' bot 'abot': (ID {bot.id}, User {bot.user_id})")
    if os.path.exists(bot.file_path):
        try:
            os.remove(bot.file_path)
        except:
            pass
    db.delete(bot)

# 3. Double check: Ensure only ONE active bot per user
users = db.query(User).all()
for u in users:
    active_bots = db.query(Bot).filter(Bot.user_id == u.id, Bot.is_active == True).order_by(Bot.id.desc()).all()
    if len(active_bots) > 1:
        print(f"User {u.username} still has {len(active_bots)} active bots. Keeping latest only.")
        # Keep index 0, delete others
        for bot in active_bots[1:]:
            print(f"  - Deleting extra active bot: {bot.name} (ID {bot.id})")
            if os.path.exists(bot.file_path):
                try:
                    os.remove(bot.file_path)
                except:
                    pass
            db.delete(bot)

db.commit()
print("✅ Cleanup complete. All inactive and fishy bots removed.")
db.close()
