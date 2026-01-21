#!/usr/bin/env python3
"""
Random bot example for IGTS IMC Event.
Reads a JSON snapshot from stdin and writes a JSON response to stdout.
This is a demonstration bot — participating bots should be more careful about invalid actions.
"""
import sys
import json
import random

ACTIONS = ["NO_OP","TRADE","BUILD_ROAD","DESTROY_ROAD","ATTACK","INVEST_DEFENSE","INVEST_MANUFACTURING"]


def pick_action(snapshot):
    n = snapshot["n_players"]
    me = snapshot["player_id"]
    roads = set(tuple(sorted(r)) for r in snapshot.get("roads", []))

    row = []
    for target in range(n):
        if target == me:
            # occasionally invest in defense or manufacturing
            if random.random() < 0.15:
                row.append({"type": "INVEST_DEFENSE", "target": me})
            else:
                row.append({"type": "NO_OP", "target": -1})
            continue

        # only choose ATTACK if a road exists
        if tuple(sorted((me, target))) in roads and random.random() < 0.05:
            row.append({"type": "ATTACK", "target": target})
            continue

        # randomly attempt trade or build road
        r = random.random()
        if r < 0.15:
            row.append({"type": "TRADE", "target": target})
        elif r < 0.25:
            row.append({"type": "BUILD_ROAD", "target": target})
        else:
            row.append({"type": "NO_OP", "target": -1})

    return {"version": snapshot.get("version","1.0"), "actions": row}


if __name__ == "__main__":
    data = sys.stdin.read()
    try:
        snapshot = json.loads(data)
    except Exception:
        snapshot = {"version":"1.0","round":0,"player_id":0,"n_players":5,"islands":[],"roads":[]}

    random.seed(snapshot.get("round", 0) + snapshot.get("player_id", 0))
    out = pick_action(snapshot)
    sys.stdout.write(json.dumps(out))
