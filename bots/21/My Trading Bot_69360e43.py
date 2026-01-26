# Basic Random Bot
# Chooses a random valid action each turn

import random

def get_action(state):
    """
    Main entry point for your bot.
    
    Args:
        state: dict containing game state
            - round: current round number
            - n_players: number of players
            - player_id: your player ID (0 to n-1)
            - players: dict of player states {id: {economy, defense, ...}}
    
    Returns:
        dict with:
            - type: "TRADE", "BUILD_ROAD", "ATTACK", "DESTROY_ROAD", 
                   "INVEST_DEFENSE", "INVEST_MANUFACTURING", "NO_OP"
            - target: player_id (or -1 for self/none)
    """
    my_id = state["player_id"]
    n = state["n_players"]
    
    # List of possible actions
    actions = [
        "TRADE", "BUILD_ROAD", "ATTACK", "DESTROY_ROAD",
        "INVEST_DEFENSE", "INVEST_MANUFACTURING"
    ]
    
    # Choose random action
    action = random.choice(actions)
    target = -1
    
    # Select target for interactive actions
    if action in ["TRADE", "ATTACK", "DESTROY_ROAD"]:
        # Pick a random opponent
        opponents = [i for i in range(n) if i != my_id]
        if opponents:
            target = random.choice(opponents)
        else:
            action = "NO_OP"
            
    return {"type": action, "target": target}
