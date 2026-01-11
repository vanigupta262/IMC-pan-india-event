#pragma once

#include <vector>

#include "Action.hpp"

class IOHandler {
public:

    IOHandler() = default;

    ActionMatrix getActions(int nPlayers) {
        // Placeholder implementation
        return ActionMatrix(nPlayers, std::vector<Action>(nPlayers, Action(Action::NO_OP, -1)));
    }
};