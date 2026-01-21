# The Aggressor
# relentlessly attacks the player with the most money

def get_action(state):
    my_id = state["player_id"]
    n = state["n_players"]
    
    # Find richest opponent
    richest_id = -1
    max_money = -1
    
    for pid, pdata in state["players"].items():
        if int(pid) == my_id: continue
        
        if pdata["economy"] > max_money:
            max_money = pdata["economy"]
            richest_id = pid
            
    # Attack if we have money, else save up (Manufacturing)
    my_stats = state["players"][my_id]
    
    if my_stats["economy"] > 200 and richest_id != -1:
        return {"type": "ATTACK", "target": int(richest_id)}
    
    return {"type": "INVEST_MANUFACTURING", "target": -1}
