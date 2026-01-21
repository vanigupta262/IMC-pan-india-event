#pragma once

namespace Config {
    constexpr int N_PLAYERS{ 5 };       // Tournament standard: 5-6 players
    constexpr int NUM_ROUNDS{ 100 };    // Tournament standard rounds

    constexpr double START_ECONOMY{ 1000.0 };

    constexpr double MAX_DEFENSE{ 1.0 };
    constexpr double DEFENSE_DECAY{ 0.1 };
    constexpr double INVEST_DEFENSE_COST_FACTOR{ 0.1 };
    constexpr double INVEST_DEFENSE_GAIN{ 1.0 };

    constexpr double MAX_MANUFACTURING{ 1.0 };
    constexpr double MANUFACTURING_DECAY{ 0.1 };
    constexpr double INVEST_MANUFACTURING_COST_FACTOR{ 0.1 };
    constexpr double INVEST_MANUFACTURING_GAIN{ 1.0 };

    constexpr double ATTACK_FACTOR{ 0.4 };
    constexpr double ATTACK_DEFENSE_LIMIT{ 0.85 };

    constexpr double ROAD_BUILD_COST_FACTOR{ 0.1 };
    constexpr double ROAD_BUILD_MANUFACTURING_LIMIT{ 2.0 };

    constexpr double TRADE_ROAD_MAX_FACTOR{ 0.1 };
    constexpr double TRADE_ROAD_MIN_FACTOR{ 0.05 };
    constexpr double TRADE_SEA_MAX_FACTOR{ 0.1 };
    constexpr double TRADE_SEA_MIN_FACTOR{ 0.1 };
}