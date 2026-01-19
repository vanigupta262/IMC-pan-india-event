#!/usr/bin/env python3
"""Test both bots coordinating in a match (moved to dev_tools)."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent.parent

print("=" * 70)
print("TESTING BOTH BOTS WITH COORDINATION")
print("=" * 70)

for round_num in range(1, 6):
    print(f"\n--- ROUND {round_num} ---")
    
    # Test Player 0 (Trader Bot)
    snapshot_p0 = {
        "version": "1.0",
        "round": round_num,
        "player_id": 0,
        "n_players": 2,
        "islands": [],
        "roads": []
    }
    
    result_p0 = subprocess.run(
        ["python3", "bots/trader_bot.py"],
        input=json.dumps(snapshot_p0),
        capture_output=True,
        text=True,
        cwd=str(ROOT)
    )
    
    try:
        action_p0 = json.loads(result_p0.stdout)
        player0_action = action_p0["actions"][0]["type"]
        print(f"Player 0 (Trader): {player0_action}")
    except Exception as e:
        print(f"Player 0 ERROR: {e}")
        player0_action = "ERROR"
    
    # Test Player 1 (Defensive Bot)
    snapshot_p1 = {
        "version": "1.0",
        "round": round_num,
        "player_id": 1,
        "n_players": 2,
        "islands": [],
        "roads": []
    }
    
    result_p1 = subprocess.run(
        ["python3", "bots/defensive_bot.py"],
        input=json.dumps(snapshot_p1),
        capture_output=True,
        text=True,
        cwd=str(ROOT)
    )
    
    try:
        action_p1 = json.loads(result_p1.stdout)
        player1_action = action_p1["actions"][1]["type"]
        print(f"Player 1 (Defensive): {player1_action}")
    except Exception as e:
        print(f"Player 1 ERROR: {e}")
        player1_action = "ERROR"
    
    # Show coordination
    if player0_action == "BUILD_ROAD" and player1_action == "BUILD_ROAD":
        print("✓ COORDINATION: Both build road!")
    elif player0_action == "TRADE" and player1_action == "TRADE":
        print("✓ COORDINATION: Both trade!")
    else:
        print(f"✗ Different actions: {player0_action} vs {player1_action}")

print("\n" + "=" * 70)
