#!/usr/bin/env python3
import sys
import json

# Read input
data = sys.stdin.read()

# Write debug to stderr
sys.stderr.write(f"DEBUG: Received input: {data}\n")
sys.stderr.flush()

try:
    snapshot = json.loads(data)
    sys.stderr.write(f"DEBUG: Parsed snapshot: {snapshot}\n")
    sys.stderr.write(f"DEBUG: Round: {snapshot.get('round')}\n")
    sys.stderr.flush()
except Exception as e:
    sys.stderr.write(f"DEBUG: Parse error: {e}\n")
    sys.stderr.flush()
    snapshot = {}

# Output
output = {"version": "1.0", "actions": [{"type": "TEST", "target": 99}]}
sys.stdout.write(json.dumps(output))
sys.stdout.flush()
