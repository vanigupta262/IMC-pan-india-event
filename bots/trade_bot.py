def PM(state):
    if state["self_id"] == 0:
        return [{"type": "TRADE", "target": 1}]
    if state["self_id"] == 1:
        return [{"type": "TRADE", "target": 0}]
    return []
