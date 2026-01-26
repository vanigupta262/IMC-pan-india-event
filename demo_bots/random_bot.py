# Random Walker Bot
# Takes completely random actions
# Good for testing robustness of other bots

import random

def get_action(state):
    my_id = state["player_id"]
    n = state["n_players"]
    
    actions = [
        "TRADE", "BUILD_ROAD", "ATTACK", "DESTROY_ROAD",
        "INVEST_DEFENSE", "INVEST_MANUFACTURING", "NO_OP"
    ]
    
    action = random.choice(actions)
    target = -1
    
    if action in ["TRADE", "ATTACK", "DESTROY_ROAD"]:
        opponents = [i for i in range(n) if i != my_id]
        if opponents:
            target = random.choice(opponents)
        else:
            action = "NO_OP"
            
    return {"type": action, "target": target}
