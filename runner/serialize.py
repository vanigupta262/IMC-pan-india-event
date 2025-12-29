def serialize_actions(actions_by_player):
    out = {}
    for pid, actions in actions_by_player.items():
        out[str(pid)] = [
            {"type": a.type.value, "target": a.target}
            for a in actions
        ]
    return out
