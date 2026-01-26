# The Turtle
# Focuses purely on Defense and Economy
# Never attacks first

def get_action(state):
    my_id = state["player_id"]
    my_stats = state["players"][my_id]
    
    # 1. Ensure safety first
    if my_stats["defense"] < 10:
        return {"type": "INVEST_DEFENSE", "target": -1}
        
    # 2. Build roads for trade efficiency
    if my_stats["roads"] < 5:
        return {"type": "BUILD_ROAD", "target": -1}
        
    # 3. Maximize economy
    return {"type": "INVEST_MANUFACTURING", "target": -1}
