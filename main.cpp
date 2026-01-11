#include <iostream>

#include "engine/GameState.hpp"
#include "engine/Config.hpp"
#include "engine/Island.hpp"
#include "engine/Action.hpp"

int main() {
    std::cout << "Game Engine Initialized." << std::endl;

    GameState gameState(Config::N_PLAYERS);

    return 0;
}