#pragma once

#include "Config.hpp"

class Island {
public:
    double defense;
    double manufacturing;

    int id;
    double economy;
    int degree;

    double economyDelta;
    int degreeDelta;

    Island(int id)
        : defense(0.0),
        manufacturing(0.0),
        id(id),
        economy(Config::START_ECONOMY),
        degree(0),
        economyDelta(0.0),
        degreeDelta(0) {
    }

    void investInDefense() {
        economy -= Config::INVEST_DEFENSE_COST_FACTOR * economy;
        defense = std::min(Config::MAX_DEFENSE, defense + Config::INVEST_DEFENSE_GAIN);
    }

    void investInManufacturing() {
        economy -= Config::INVEST_MANUFACTURING_COST_FACTOR * economy;
        manufacturing = std::min(Config::MAX_MANUFACTURING, manufacturing + Config::INVEST_MANUFACTURING_GAIN);
    }

    void decayInvestments() {
        defense = std::max(0.0, defense - Config::DEFENSE_DECAY);
        manufacturing = std::max(0.0, manufacturing - Config::MANUFACTURING_DECAY);
    }

    void updateEconomy() {
        economy += economyDelta;
        economyDelta = 0.0;

        degree += degreeDelta;
        degreeDelta = 0;
    }
};