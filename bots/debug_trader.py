#!/usr/bin/env python3
import sys
import json

data = sys.stdin.read()
sys.stderr.write(f"INPUT: {repr(data)}\n")

try:
    snapshot = json.loads(data)
    sys.stderr.write(f"PARSED: round={snapshot.get('round')}, player_id={snapshot.get('player_id')}\n")
except Exception as e:
    sys.stderr.write(f"ERROR: {e}\n")
    snapshot = {"round": 0}

round_num = snapshot.get("round", 0)
player_id = snapshot.get("player_id", 0)

if round_num == 1:
    action_type = "BUILD_ROAD"
    target = 1
else:
    action_type = "NO_OP"
    target = -1

sys.stderr.write(f"OUTPUT: {action_type}\n")

result = {
    "version": "1.0",
    "actions": [
        {"type": action_type, "target": target},
        {"type": "NO_OP", "target": -1}
    ]
}
sys.stdout.write(json.dumps(result))
