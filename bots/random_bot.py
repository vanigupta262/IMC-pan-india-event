import random

def PM(state):
    self_id = state["self_id"]
    others = [i for i in state["countries"] if i != self_id]

    if not others:
        return []

    target = random.choice(others)
    return [
        {"type": "TRADE", "target": target}
    ]
