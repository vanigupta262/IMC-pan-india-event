"""
Bot 2 - Defensive Builder (moved to dev_tools)
"""
def get_action(game_state):
    """Always perform INVEST_DEFENSE action"""
    return {"type": "INVEST_DEFENSE", "target": -1}

def initialize(config):
    return {"strategy": "defensive_builder", "name": "Bot2"}
