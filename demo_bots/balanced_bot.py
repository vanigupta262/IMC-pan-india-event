# Balanced Strategist
# Adapts strategy based on state

import random

def get_action(state):
    my_id = state["player_id"]
    n = state["n_players"]
    my = state["players"][my_id]
    
    # Calculate average economy
    total_eco = sum(p["economy"] for p in state["players"].values())
    avg_eco = total_eco / n
    
    # If we are poor -> Invest Manufacturing
    if my["economy"] < avg_eco * 0.8:
        return {"type": "INVEST_MANUFACTURING", "target": -1}
        
    # If we are rich -> Attacking is an option, but keep defense up
    if my["defense"] < 5:
        return {"type": "INVEST_DEFENSE", "target": -1}
        
    # Trade if roads are low
    if my["roads"] < 3:
        # Trade with someone random to boost relations (conceptual)
        opponents = [i for i in range(n) if i != my_id]
        if opponents:
            return {"type": "TRADE", "target": random.choice(opponents)}
            
    # Default: Balanced mix
    r = random.random()
    if r < 0.4:
        return {"type": "INVEST_MANUFACTURING", "target": -1}
    elif r < 0.7:
        return {"type": "BUILD_ROAD", "target": -1}
    else:
        # Attack random weakness
        opponents = [i for i in range(n) if i != my_id]
        weakest = min(opponents, key=lambda i: state["players"][i]["defense"])
        return {"type": "ATTACK", "target": weakest}
