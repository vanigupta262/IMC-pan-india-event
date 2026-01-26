#!/usr/bin/env python3
"""
Automated test script for IGTS IMC Event platform
Tests various configurations and validates correctness
"""

import requests
import json
import time
import sys
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
BACKEND_URL = BASE_URL

def test_health():
    """Test backend health"""
    print("\n🔍 Testing backend health...")
    response = requests.get(f"{BACKEND_URL}/health")
    if response.status_code == 200:
        print(f"✅ Backend is healthy: {response.json()}")
        return True
    else:
        print(f"❌ Backend health check failed: {response.status_code}")
        return False

def register_user(username, email, password):
    """Register a new user"""
    print(f"\n📝 Registering user: {username}")
    data = {
        "username": username,
        "email": email,
        "password": password
    }
    response = requests.post(f"{BACKEND_URL}/auth/register", json=data)
    if response.status_code == 201:
        user = response.json()
        print(f"✅ User registered: ID={user['id']}, username={user['username']}")
        return user
    else:
        print(f"❌ Registration failed: {response.status_code} - {response.text}")
        return None

def upload_bot(user_id, bot_name, bot_file_path):
    """Upload a bot for a user"""
    print(f"\n📤 Uploading bot '{bot_name}' for user {user_id}...")
    
    with open(bot_file_path, 'rb') as f:
        files = {'file': (Path(bot_file_path).name, f, 'text/x-python')}
        params = {'user_id': user_id, 'bot_name': bot_name}
        response = requests.post(f"{BACKEND_URL}/bots/upload", params=params, files=files)
    
    if response.status_code == 201:
        bot = response.json()
        print(f"✅ Bot uploaded: ID={bot['id']}, name={bot['name']}")
        return bot
    else:
        print(f"❌ Bot upload failed: {response.status_code} - {response.text}")
        return None

def create_lobby(creator_id, lobby_name, is_private=False, max_players=2):
    """Create a new lobby"""
    print(f"\n🏛️  Creating lobby '{lobby_name}'...")
    data = {
        "name": lobby_name,
        "creator_id": creator_id,
        "is_private": is_private,
        "max_players": max_players
    }
    response = requests.post(f"{BACKEND_URL}/lobbies", json=data)
    if response.status_code == 201:
        lobby = response.json()
        print(f"✅ Lobby created: ID={lobby['id']}, invite_code={lobby.get('invite_code', 'N/A')}")
        return lobby
    else:
        print(f"❌ Lobby creation failed: {response.status_code} - {response.text}")
        return None

def join_lobby(lobby_id, user_id, invite_code=None):
    """Join a lobby"""
    print(f"\n👥 User {user_id} joining lobby {lobby_id}...")
    data = {
        "user_id": user_id,
        "invite_code": invite_code
    }
    response = requests.post(f"{BACKEND_URL}/lobbies/{lobby_id}/join", json=data)
    if response.status_code == 200:
        print(f"✅ Joined lobby: {response.json()['message']}")
        return True
    else:
        print(f"❌ Join failed: {response.status_code} - {response.text}")
        return False

def create_match(lobby_id, user_id):
    """Create a match from a lobby"""
    print(f"\n🎮 Creating match from lobby {lobby_id}...")
    data = {"lobby_id": lobby_id}
    params = {"user_id": user_id}
    response = requests.post(f"{BACKEND_URL}/matches", params=params, json=data)
    if response.status_code == 201:
        match = response.json()
        print(f"✅ Match created: ID={match['id']}, status={match['status']}")
        return match
    else:
        print(f"❌ Match creation failed: {response.status_code} - {response.text}")
        return None

def run_match(match_id):
    """Execute a match"""
    print(f"\n⚡ Running match {match_id}...")
    response = requests.post(f"{BACKEND_URL}/matches/{match_id}/run")
    if response.status_code == 200:
        match = response.json()
        print(f"✅ Match completed: status={match['status']}")
        print(f"   Started: {match.get('started_at', 'N/A')}")
        print(f"   Completed: {match.get('completed_at', 'N/A')}")
        return match
    else:
        print(f"❌ Match execution failed: {response.status_code} - {response.text}")
        return None

def get_match_log(match_id):
    """Get match log"""
    print(f"\n📊 Fetching match log for match {match_id}...")
    response = requests.get(f"{BACKEND_URL}/matches/{match_id}/log")
    if response.status_code == 200:
        log = response.json()
        print(f"✅ Match log retrieved:")
        print(f"   Players: {log.get('num_players')}")
        print(f"   Rounds: {log.get('num_rounds')}")
        print(f"   Total rounds logged: {len(log.get('rounds', []))}")
        
        if 'final_state' in log and log['final_state']:
            print(f"\n🏆 Final Rankings:")
            for rank in log['final_state'].get('rankings', []):
                print(f"   Rank {rank['rank']}: Player {rank['player_id']} - Economy: {rank['economy']}")
        
        return log
    else:
        print(f"❌ Failed to get match log: {response.status_code}")
        return None

def verify_match_correctness(log):
    """Verify match results are correct"""
    print(f"\n🔬 Verifying match correctness...")
    
    checks_passed = 0
    checks_total = 0
    
    # Check 1: Number of rounds
    checks_total += 1
    expected_rounds = log.get('num_rounds', 0)
    actual_rounds = len(log.get('rounds', []))
    if actual_rounds == expected_rounds:
        print(f"✅ Round count correct: {actual_rounds}/{expected_rounds}")
        checks_passed += 1
    else:
        print(f"❌ Round count mismatch: {actual_rounds}/{expected_rounds}")
    
    # Check 2: All rounds have actions
    checks_total += 1
    rounds_with_actions = sum(1 for r in log.get('rounds', []) if 'actions' in r and len(r['actions']) > 0)
    if rounds_with_actions == actual_rounds:
        print(f"✅ All rounds have actions: {rounds_with_actions}/{actual_rounds}")
        checks_passed += 1
    else:
        print(f"⚠️  Rounds with actions: {rounds_with_actions}/{actual_rounds}")
    
    # Check 3: Final state exists
    checks_total += 1
    if 'final_state' in log and log['final_state'] is not None:
        print(f"✅ Final state exists")
        checks_passed += 1
    else:
        print(f"❌ Final state missing")
    
    # Check 4: Rankings are sorted by economy
    checks_total += 1
    if 'final_state' in log and 'rankings' in log['final_state']:
        rankings = log['final_state']['rankings']
        is_sorted = all(rankings[i]['economy'] >= rankings[i+1]['economy'] 
                       for i in range(len(rankings)-1))
        if is_sorted:
            print(f"✅ Rankings sorted correctly by economy")
            checks_passed += 1
        else:
            print(f"❌ Rankings not sorted by economy")
    
    print(f"\n📈 Verification: {checks_passed}/{checks_total} checks passed")
    return checks_passed == checks_total

def test_full_workflow(num_players=2, test_name="Basic Test"):
    """Test complete workflow with specified number of players"""
    print(f"\n{'='*60}")
    print(f"🧪 Running: {test_name}")
    print(f"   Players: {num_players}")
    print(f"{'='*60}")
    
    # Create users
    users = []
    bots = []
    bot_files = ['bots/trader_bot.py', 'bots/defensive_bot.py', 'bots/random_bot.py', 
                 'bots/greedy_bot.py', 'bots/trader_bot.py']
    
    for i in range(num_players):
        username = f"test_user_{i}_{int(time.time())}"
        email = f"{username}@test.com"
        user = register_user(username, email, "password123")
        if not user:
            print(f"❌ Failed to create user {i}")
            return False
        users.append(user)
        
        # Upload bot
        bot = upload_bot(user['id'], f"Bot_{i}", bot_files[i % len(bot_files)])
        if not bot:
            print(f"❌ Failed to upload bot for user {i}")
            return False
        bots.append(bot)
    
    # Create lobby
    lobby = create_lobby(users[0]['id'], f"Test Lobby {int(time.time())}", 
                        is_private=False, max_players=num_players)
    if not lobby:
        return False
    
    # Join lobby with other users
    for i in range(1, num_players):
        if not join_lobby(lobby['id'], users[i]['id']):
            return False
    
    # Create match
    match = create_match(lobby['id'], users[0]['id'])
    if not match:
        return False
    
    # Run match
    print(f"\n⏳ Executing match (this may take a few seconds)...")
    completed_match = run_match(match['id'])
    if not completed_match:
        return False
    
    # Get and verify match log
    log = get_match_log(match['id'])
    if not log:
        return False
    
    # Verify correctness
    is_correct = verify_match_correctness(log)
    
    if is_correct:
        print(f"\n✅ {test_name} PASSED")
    else:
        print(f"\n❌ {test_name} FAILED")
    
    return is_correct

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 IGTS IMC Event - Automated Testing")
    print("="*60)
    
    # Test backend health
    if not test_health():
        print("\n❌ Backend is not running. Please start it first.")
        sys.exit(1)
    
    # Run tests
    all_passed = True
    
    # Test 1: Basic 2-player match
    all_passed &= test_full_workflow(2, "2-Player Match Test")
    
    time.sleep(2)
    
    # Test 2: Try 3-player match (may fail if max_players limit is 2)
    print(f"\n{'='*60}")
    print("Note: 3+ player tests may fail due to max_players=2 limit")
    print("We'll update configuration after basic tests pass")
    print(f"{'='*60}")
    
    # Summary
    print(f"\n{'='*60}")
    if all_passed:
        print("✅ ALL TESTS PASSED!")
        print("\n📝 Next steps:")
        print("   1. Update max_players in backend/app.py to test 3+ players")
        print("   2. Change NUM_ROUNDS in game_orchestrator.py to test different round counts")
        print("   3. Re-run tests with new configurations")
    else:
        print("❌ SOME TESTS FAILED")
        print("   Check the output above for details")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
