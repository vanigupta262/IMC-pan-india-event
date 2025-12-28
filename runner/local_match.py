from engine.state import GameState
from engine.resolver import resolve_round
from engine.config import N_PLAYERS
from engine.actions import Action, ActionType

print("Local match runner started")

state = GameState(N_PLAYERS)

def trade_actions():
    actions = {i: [] for i in range(N_PLAYERS)}
    actions[0].append(Action(ActionType.TRADE, 1))
    actions[1].append(Action(ActionType.TRADE, 0))
    return actions

for r in range(3):
    print(f"\nRound {r+1}")

    actions = trade_actions()
    resolve_round(state, actions)

    print("Roads:", state.roads)
    print(state.countries)
