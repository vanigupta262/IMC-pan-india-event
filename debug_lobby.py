import requests
import sqlite3
import json

API_URL = "http://localhost:8000"
DB_PATH = "igts.db"

def check_api():
    print("--- API Response ---")
    try:
        resp = requests.get(f"{API_URL}/lobbies")
        data = resp.json()
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"API Error: {e}")

def check_db():
    print("\n--- DB Schema ---")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(lobbies)")
        columns = cursor.fetchall()
        for col in columns:
            print(col)
        
        print("\n--- DB Rows ---")
        cursor.execute("SELECT id, name, max_players FROM lobbies")
        rows = cursor.fetchall()
        for row in rows:
            print(row)
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}")

if __name__ == "__main__":
    check_api()
    check_db()
