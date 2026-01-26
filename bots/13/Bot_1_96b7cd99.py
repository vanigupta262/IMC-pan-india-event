#!/usr/bin/env python3
"""
Defensive Bot Strategy - Focuses on defense and manufacturing.
Will trade opportunistically when roads exist, but prioritizes defense.
"""

import sys
import json


def get_action(snapshot):
    """
    Defensive bot strategy:
    - Round 1: Invest in defense (self-protect)
    - Round 2: Trade if road exists (profit opportunity)
    - Round 3: Trade again (continue profit)
    - Round 4: Attack opponent if economy allows
    - Rounds 5+: No action (preserve resources)
    """
    
    round_num = snapshot.get("round", 0)
    player_id = snapshot.get("player_id", 0)
    n_players = snapshot.get("n_players", 2)
    
    # Target opponent
    target_opponent = 1 if player_id == 0 else 0
    
    if round_num == 1:
        # Round 1: Build road to enable trading
        action_type = "BUILD_ROAD"
        target = target_opponent
    elif round_num == 2:
        # Round 2: Trade if opponent built road
        action_type = "TRADE"
        target = target_opponent
    elif round_num == 3:
        # Round 3: Trade for second profit
        action_type = "TRADE"
        target = target_opponent
    elif round_num == 4:
        # Round 4: Attack opponent to damage economy
        action_type = "ATTACK"
        target = target_opponent
    else:
        # Other rounds: No action
        action_type = "NO_OP"
        target = -1
    
    # Build action matrix (one row per player, one action per column)
    actions = []
    for i in range(n_players):
        if i == player_id:
            # This player's action
            actions.append({"type": action_type, "target": target})
        else:
            # Other players: NO_OP (we don't know their action)
            actions.append({"type": "NO_OP", "target": -1})
    
    return {
        "version": "1.0",
        "actions": actions
    }


if __name__ == "__main__":
    data = sys.stdin.read()
    try:
        snapshot = json.loads(data)
    except Exception:
        snapshot = {"version":"1.0","round":0,"player_id":0,"n_players":2,"islands":[],"roads":[]}
    
    out = get_action(snapshot)
    sys.stdout.write(json.dumps(out))
