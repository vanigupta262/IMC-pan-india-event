from engine.actions import Action, ActionType

def parse_bot_actions(bot_output):
    actions = []

    for a in bot_output:
        try:
            action_type = ActionType(a["type"])
            target = int(a["target"])
            actions.append(Action(action_type, target))
        except Exception:
            continue  # invalid action ignored (for now)

    return actions
