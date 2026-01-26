#include <iostream>

#include "engine/GameState.hpp"
#include "engine/Config.hpp"
#include "engine/Island.hpp"
#include "engine/Action.hpp"

int main() {
    std::cout << "Game Engine Initialized." << std::endl;
    GameState gameState(Config::N_PLAYERS);

    auto printState = [&](const std::string& header) {
        std::cout << "--- " << header << " (round=" << gameState.round << ") ---\n";
        for (size_t i = 0; i < gameState.islands.size(); ++i) {
            const auto& isl = gameState.islands[i];
            std::cout << "Player " << isl.id << ": economy=" << isl.economy << ", def=" << isl.defense << ", mf=" << isl.manufacturing << ", deg=" << isl.degree << "\n";
        }
        std::cout << "Roads:\n";
        for (const auto& r : gameState.roads) {
            std::cout << " " << r.first << " <-> " << r.second << "\n";
        }
    };

    printState("Initial State");

    // Run game for configured number of rounds
    for (int r = 0; r < Config::NUM_ROUNDS; ++r) {
        gameState.handleRound();
        printState("After Round");
    }

    return 0;
}