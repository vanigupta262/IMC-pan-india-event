from engine.state import GameState
from engine.resolver import resolve_round
from engine.config import N_PLAYERS
from engine.bot_api import build_bot_state
from runner.bot_adapter import parse_bot_actions
# from bots.random_bot import PM
from bots.trade_bot import PM


print("Local match runner started")

state = GameState(N_PLAYERS)

for r in range(3):
    print(f"\nRound {r+1}")

    actions_by_player = {}

    for pid in range(N_PLAYERS):
        bot_state = build_bot_state(state, pid)
        bot_output = PM(bot_state)
        actions_by_player[pid] = parse_bot_actions(bot_output)

    resolve_round(state, actions_by_player)

    print("Roads:", state.roads)
    print(state.countries)
