#pragma once

#include <vector>

class Action {
public:
    enum ActionType {
        TRADE, BUILD_ROAD, ATTACK, DESTROY_ROAD, INVEST_DEFENSE, INVEST_MANUFACTURING, NO_OP
    };

    ActionType type;
    int target;

    Action(ActionType type, int target) : type(type), target(target) {}
};

using ActionMatrix = std::vector<std::vector<Action>>;