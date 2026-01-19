"""
Bot 2 - Defensive Investor (moved to dev_tools)
"""
def get_action(game_state):
    """Return defense investment action"""
    return {"type": "INVEST_DEFENSE", "target": -1}

def initialize(config):
    return {"strategy": "defensive_investor"}
