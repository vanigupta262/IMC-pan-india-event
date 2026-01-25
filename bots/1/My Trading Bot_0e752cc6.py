import json
import random
import sys

# Basic Random Bot
# Chooses a random valid action each turn

def get_action(state):
    """
    Main entry point for your bot.
    
    Args:
        state: dict containing game state
    Returns:
        dict with type and target
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

# ==========================================
# DO NOT MODIFY THE CODE BELOW THIS LINE
# ==========================================
if __name__ == "__main__":
    try:
        # Read game state from stdin
        input_data = sys.stdin.read()
        state = json.loads(input_data)
        
        # Get action
        action = get_action(state)
        
        # Print action as JSON to stdout
        print(json.dumps(action))
    except Exception as e:
        # If anything goes wrong, print empty JSON or a dummy action
        print(json.dumps({"type": "NO_OP", "target": -1}))
