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

import json
from engine.state import GameState
from engine.resolver import resolve_round
from engine.config import N_PLAYERS
from engine.bot_api import build_bot_state
from runner.bot_adapter import parse_bot_actions
from engine.serialize import serialize_state
from runner.serialize import serialize_actions
from bots.trade_bot import PM

print("Local match runner started")

state = GameState(N_PLAYERS)

match_log = {
    "match_id": "local_test_001",
    "n_players": N_PLAYERS,
    "rounds": []
}

for r in range(3):
    print(f"\nRound {r+1}")

    actions_by_player = {}

    for pid in range(N_PLAYERS):
        bot_state = build_bot_state(state, pid)
        bot_output = PM(bot_state)
        actions_by_player[pid] = parse_bot_actions(bot_output)

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
