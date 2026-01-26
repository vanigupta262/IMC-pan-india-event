#!/usr/bin/env python3
"""
Greedy example bot: prefers to trade with the richest visible player, otherwise builds roads to them.
This bot is deterministic given the snapshot and is intended as a clear example of the Bot API.
"""
import sys
import json


def greedy_action(snapshot):
    n = snapshot["n_players"]
    me = snapshot["player_id"]
    islands = snapshot.get("islands", [])
    roads = set(tuple(sorted(r)) for r in snapshot.get("roads", []))

    # find richest other player
    richest = None
    richest_econ = -1.0
    for isl in islands:
        if isl["id"] == me:
            continue
        if isl["economy"] > richest_econ:
            richest_econ = isl["economy"]
            richest = isl["id"]

    row = []
    for target in range(n):
        if target == me:
            # invest defense if economy is above a threshold
            myecon = next((x["economy"] for x in islands if x["id"] == me), 0.0)
            if myecon > 500 and myecon < 2000:
                row.append({"type": "INVEST_DEFENSE", "target": me})
            else:
                row.append({"type": "NO_OP", "target": -1})
            continue

        if richest is not None and target == richest:
            # if we have a road, try trade, else attempt build road
            if tuple(sorted((me, target))) in roads:
                row.append({"type": "TRADE", "target": target})
            else:
                row.append({"type": "BUILD_ROAD", "target": target})
            continue

        row.append({"type": "NO_OP", "target": -1})

    return {"version": snapshot.get("version","1.0"), "actions": row}


if __name__ == "__main__":
    data = sys.stdin.read()
    try:
        snapshot = json.loads(data)
    except Exception:
        snapshot = {"version":"1.0","round":0,"player_id":0,"n_players":5,"islands":[],"roads":[]}

    out = greedy_action(snapshot)
    sys.stdout.write(json.dumps(out))
