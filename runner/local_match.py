# from engine.state import GameState
# from engine.resolver import resolve_round
# from engine.config import N_PLAYERS
# from engine.bot_api import build_bot_state
# from runner.bot_adapter import parse_bot_actions
# # from bots.random_bot import PM
# from bots.trade_bot import PM


# print("Local match runner started")

# state = GameState(N_PLAYERS)

# for r in range(3):
#     print(f"\nRound {r+1}")

#     actions_by_player = {}

#     for pid in range(N_PLAYERS):
#         bot_state = build_bot_state(state, pid)
#         bot_output = PM(bot_state)
#         actions_by_player[pid] = parse_bot_actions(bot_output)

#     resolve_round(state, actions_by_player)

#     print("Roads:", state.roads)
#     print(state.countries)

# import json
# from engine.state import GameState
# from engine.resolver import resolve_round
# from engine.config import N_PLAYERS
# from engine.bot_api import build_bot_state
# from runner.bot_adapter import parse_bot_actions
# from engine.serialize import serialize_state
# from runner.serialize import serialize_actions
# # from bots.trade_bot import PM
# # from runner.sandbox_runner import run_bot_in_sandbox
# from runner.sandbox_runner import run_bot_in_sandbox, run_bots_parallel



# print("Local match runner started")

# state = GameState(N_PLAYERS)

# match_log = {
#     "match_id": "local_test_001",
#     "n_players": N_PLAYERS,
#     "rounds": []
# }
# BOT_PATHS = {
#     0: "bots/trade_bot.py",
#     1: "bots/trade_bot.py",
#     2: "bots/random_bot.py",
#     3: "bots/random_bot.py",
#     # others default later
# }

# for r in range(3):
#     print(f"\nRound {r+1}")

#     actions_by_player = {}

#     for pid in range(N_PLAYERS):
#         bot_state = build_bot_state(state, pid)

#         bot_path = BOT_PATHS.get(pid)
#         if bot_path is None:
#             actions_by_player[pid] = []
#             continue

#         bot_output = run_bot_in_sandbox(bot_path, bot_state)
#         actions = parse_bot_actions(bot_output)

#         actions_by_player[pid] = actions



#     state_before = serialize_state(state)
#     actions_serialized = serialize_actions(actions_by_player)

#     resolve_round(state, actions_by_player)

#     state_after = serialize_state(state)

#     match_log["rounds"].append({
#         "round": r + 1,
#         "actions": actions_serialized,
#         "state_before": state_before,
#         "state_after": state_after
#     })

#     print("Roads:", state.roads)
#     print(state.countries)

# match_log["final_state"] = serialize_state(state)

# with open("match_log.json", "w") as f:
#     json.dump(match_log, f, indent=2)

# print("\nMatch log written to match_log.json")
import json
import os
import shutil
from engine.state import GameState
from engine.resolver import resolve_round
from engine.config import N_PLAYERS
from engine.bot_api import build_bot_state
from runner.bot_adapter import parse_bot_actions
from engine.serialize import serialize_state
from runner.serialize import serialize_actions
from runner.sandbox_runner import run_bots_parallel
from bots.trade_bot import PM as trade_PM
from bots.random_bot import PM as random_PM

print("Local match runner started")

state = GameState(N_PLAYERS)

match_log = {
    "match_id": "local_test_001",
    "n_players": N_PLAYERS,
    "rounds": []
}

BOT_PATHS = {
    0: "bots/trade_bot.py",
    1: "bots/trade_bot.py",
    2: "bots/random_bot.py",
    3: "bots/random_bot.py",
    4: "bots/random_bot.py",
    5: "bots/random_bot.py",
    6: "bots/random_bot.py",
    7: "bots/random_bot.py",
    8: "bots/random_bot.py",
    9: "bots/random_bot.py"
}

# Fallback: allow running bots in-process if sandbox/docker is unavailable.
USE_SANDBOX = os.environ.get("USE_SANDBOX", "auto")  # "true" | "false" | "auto"

def docker_available() -> bool:
    # quick check: is docker executable present
    return shutil.which("docker") is not None

for r in range(3):
    print(f"\nRound {r+1}")

    actions_by_player = {}

    run_in_sandbox = (
        (USE_SANDBOX.lower() == "true") or
        (USE_SANDBOX.lower() == "auto" and docker_available())
    )

    if run_in_sandbox:
        # 1. Build sandbox jobs
        jobs = []
        for pid in range(N_PLAYERS):
            bot_path = BOT_PATHS.get(pid)
            if bot_path is None:
                actions_by_player[pid] = []
                continue

            bot_state = build_bot_state(state, pid)
            jobs.append((pid, bot_path, bot_state))

        # 2. Run bots in parallel via Docker sandbox
        outputs = run_bots_parallel(jobs)

        # 3. Parse bot outputs
        for pid in range(N_PLAYERS):
            raw = outputs.get(pid, [])
            actions_by_player[pid] = parse_bot_actions(raw)
    else:
        # In-process bot calls as fallback
        for pid in range(N_PLAYERS):
            bot_state = build_bot_state(state, pid)
            # Map by path for consistency
            bot_path = BOT_PATHS.get(pid)
            if bot_path is None:
                actions_by_player[pid] = []
                continue
            if "trade_bot.py" in bot_path:
                raw = trade_PM(bot_state)
            else:
                raw = random_PM(bot_state)
            actions_by_player[pid] = parse_bot_actions(raw)

    state_before = serialize_state(state)
    actions_serialized = serialize_actions(actions_by_player)

    resolve_round(state, actions_by_player)

    state_after = serialize_state(state)

    match_log["rounds"].append({
        "round": r + 1,
        "actions": actions_serialized,
        "state_before": state_before,
        "state_after": state_after
    })

    print("Roads:", state.roads)
    print(state.countries)

match_log["final_state"] = serialize_state(state)

with open("match_log.json", "w") as f:
    json.dump(match_log, f, indent=2)

print("\nMatch log written to match_log.json")
