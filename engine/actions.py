from enum import Enum

class ActionType(Enum):
    TRADE = "TRADE"
    BUILD = "BUILD"
    ATTACK = "ATTACK"
    DESTROY = "DESTROY"
    INVEST_DEFENSE = "INVEST_DEFENSE"
    INVEST_MANUFACTURING = "INVEST_MANUFACTURING"
    BONUS_ATTACK = "BONUS_ATTACK"
    NO_OP = "NO_OP"

class Action:
    def __init__(self, action_type: ActionType, target: int):
        self.type = action_type
        self.target = target
