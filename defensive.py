"""
Bot 2 - Defensive Builder
Strategy: Focuses on INVEST_DEFENSE actions to build strong defense
"""
def get_action(game_state):
    """Always perform INVEST_DEFENSE action"""
    return {"type": "INVEST_DEFENSE", "target": -1}

def initialize(config):
    return {"strategy": "defensive_builder", "name": "Bot2"}