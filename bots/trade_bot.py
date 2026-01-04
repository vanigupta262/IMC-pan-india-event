def PM(state):
    self_id = state["self_id"]
    if self_id == 0:
        if not state["roads"]:
            return [{"type": "BUILD", "target": 1}]
        return [{"type": "TRADE", "target": 1}]
    if self_id == 1:
        if not state["roads"]:
            return [{"type": "BUILD", "target": 0}]
        return [{"type": "TRADE", "target": 0}]
    return []
