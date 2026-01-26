# Smart Aggressive Bot
# Scans for rich opponents with weak defenses and attacks them.
# Otherwise invests in economy.

import json
import sys

def get_action(state):
    my_id = state["player_id"]
    n = state["n_players"]
    my_stats = state["players"][my_id]
    
    # 1. Identify best target (Rich but weak)
    best_target = -1
    max_score = -1
    
    for pid in range(n):
        if pid == my_id: continue
        
        p = state["players"][pid]
        # Score = Economy / (Defense + 1) -> High reward, low risk
        score = p["economy"] / (p["defense"] + 1)
        
        if score > max_score:
            max_score = score
            best_target = pid
            
    # 2. Decide action
    # If we have enough money and a good target, ATTACK
    if my_stats["economy"] > 500 and best_target != -1:
        return {"type": "ATTACK", "target": best_target}
        
    # If our defense is low, boost it
    if my_stats["defense"] < 5:
        return {"type": "INVEST_DEFENSE", "target": -1}
        
    # Otherwise, grow economy
    return {"type": "INVEST_MANUFACTURING", "target": -1}

# ==========================================
# DO NOT MODIFY THE CODE BELOW THIS LINE
# ==========================================
if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        state = json.loads(input_data)
        action = get_action(state)
        print(json.dumps(action))
    except Exception as e:
        print(json.dumps({"type": "NO_OP", "target": -1}))
