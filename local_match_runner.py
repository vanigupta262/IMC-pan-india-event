#!/usr/bin/env python3
"""
Local match runner for testing bots locally and feeding actions to the C++ engine demo.

- Runs each bot subprocess with a per-player snapshot on stdin.
- Collects JSON responses (expected: {"version":..., "actions": [...]})
- Assembles an `actions.txt` file (one row per player, integer ActionType codes)
  where ActionType mapping follows `engine/Action.hpp` ordering:
    TRADE=0, BUILD_ROAD=1, ATTACK=2, DESTROY_ROAD=3, INVEST_DEFENSE=4,
    INVEST_MANUFACTURING=5, NO_OP=6
- Invokes `./game` to consume `actions.txt` (engine reads then deletes it).

Usage: python3 local_match_runner.py

Edit the `BOT_FOR_PLAYER` mapping below to choose which bot to run for each player.
"""
import json
import subprocess
import sys
import os
import shutil
from pathlib import Path

# Where bots live
BOTS_DIR = Path(__file__).parent / "bots"

# Map player id -> bot script (relative to workspace)
# Use absolute path to the interpreter for safety
PYTHON = shutil.which("python3") or sys.executable
BOT_FOR_PLAYER = {
    0: BOTS_DIR / "greedy_bot.py",
    1: BOTS_DIR / "random_bot.py",
    2: BOTS_DIR / "random_bot.py",
    3: BOTS_DIR / "random_bot.py",
    4: BOTS_DIR / "random_bot.py",
}

# Action type mapping (string -> int) must match engine/Action.hpp
ACTION_MAP = {
    "TRADE": 0,
    "BUILD_ROAD": 1,
    "ATTACK": 2,
    "DESTROY_ROAD": 3,
    "INVEST_DEFENSE": 4,
    "INVEST_MANUFACTURING": 5,
    "NO_OP": 6,
}

N_PLAYERS = 5
START_ECON = 1000.0


def make_snapshot(player_id, round_no=0):
    islands = [{"id": i, "economy": START_ECON, "degree": 0} for i in range(N_PLAYERS)]
    return {
        "version": "1.0",
        "round": round_no,
        "player_id": player_id,
        "n_players": N_PLAYERS,
        "islands": islands,
        "roads": []
    }


def run_bot(bot_path, snapshot, timeout=2.0):
    if not bot_path.exists():
        raise FileNotFoundError(f"Bot not found: {bot_path}")

    proc = subprocess.run([PYTHON, str(bot_path)], input=json.dumps(snapshot).encode(), capture_output=True, timeout=timeout)
    if proc.returncode != 0:
        print(f"Bot {bot_path} exited with code {proc.returncode}")
        print(proc.stderr.decode())
        raise RuntimeError("Bot failed")

    try:
        out = json.loads(proc.stdout.decode())
    except Exception as e:
        print(f"Failed to parse bot output (player {snapshot['player_id']}): {e}")
        print("Raw output:")
        print(proc.stdout.decode())
        raise

    return out


def validate_and_collect(n_players):
    # For each player, run its bot and collect the 'actions' row
    rows = []
    for pid in range(n_players):
        bot = BOT_FOR_PLAYER.get(pid, BOTS_DIR / "random_bot.py")
        snap = make_snapshot(pid, round_no=0)
        print(f"Running bot for player {pid}: {bot}")
        res = run_bot(bot, snap)
        actions = res.get("actions")
        if not isinstance(actions, list) or len(actions) != n_players:
            raise ValueError(f"Invalid actions from bot {bot} for player {pid}")
        # convert to integer codes
        int_row = []
        for a in actions:
            if isinstance(a, dict):
                t = a.get("type")
            else:
                t = a
            if t not in ACTION_MAP:
                raise ValueError(f"Unknown action type '{t}' from bot {bot}")
            int_row.append(ACTION_MAP[t])
        rows.append(int_row)
    return rows


def write_actions_file(rows, fname="actions.txt"):
    with open(fname, "w") as f:
        for row in rows:
            f.write(" ".join(str(x) for x in row) + "\n")
    print(f"Wrote actions to {fname}")


if __name__ == "__main__":
    try:
        rows = validate_and_collect(N_PLAYERS)
    except Exception as e:
        print("Failed to collect actions:", e)
        sys.exit(1)

    write_actions_file(rows)

    # Run the C++ engine (compiled as ./game)
    if not Path("./game").exists():
        print("Engine binary './game' not found. Compile with: g++ -std=c++17 main.cpp -I. -o game")
        sys.exit(0)

    print("Invoking ./game (it will consume actions.txt if present)")
    p = subprocess.run(["./game"])
    sys.exit(p.returncode)
