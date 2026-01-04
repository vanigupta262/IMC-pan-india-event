#pragma once

class Action {
public:
    enum ActionType {
        TRADE, BUILD, ATTACK, DESTROY, INVEST_DEFENSE, INVEST_MANUFACTURING, BONUS_ATTACK, NO_OP
    };

    ActionType type;
    int target;

    Action(ActionType type, int target) : type(type), target(target) {}
};