"""
Bot 1 - Conservative Trader (moved to dev_tools)
"""
def get_action(game_state):
    """Return trading action"""
    return {"type": "TRADE", "target": 0}

def initialize(config):
    return {"strategy": "conservative_trader"}
