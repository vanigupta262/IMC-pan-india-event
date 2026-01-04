#pragma once

namespace Config {
    constexpr int N_PLAYERS{ 10 };
    constexpr double START_ECONOMY{ 100.0 };
    constexpr double MAX_DEFENSE{ 1.0 };
    constexpr double MAX_MANUFACTURING{ 1.0 };
    constexpr double DEFENSE_DECAY{ 0.1 };
    constexpr double MANUFACTURING_DECAY{ 0.1 };

    constexpr double ATTACK_FACTOR{ 0.4 };
    constexpr double DEFENSE_LIMIT{ 0.85 };

    constexpr double ROAD_BUILD_COST_FACTOR{ 0.2 };
    constexpr double TRADE_ROAD_MAX_FACTOR{ 0.1 };
    constexpr double TRADE_ROAD_MIN_FACTOR{ 0.05 };
    constexpr double TRADE_AIR_MAX_FACTOR{ 0.1 };
    constexpr double TRADE_AIR_MIN_FACTOR{ 0.1 };

    constexpr double INVEST_COST_FACTOR{ 0.1 };
    constexpr double INVEST_GAIN{ 1.0 };
}