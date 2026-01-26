"""
Deterministic bot - takes actions based on fixed rules.
"""

def get_action(game_state):
    """Return a deterministic action based on game state."""
    # Simple deterministic strategy: allocate resources evenly
    return {
        "action": "allocate",
        "resources": {
            "food": 100,
            "wood": 100,
            "stone": 100
        }
    }

def initialize(config):
    """Initialize bot with config."""
    return {"status": "ready"}
