#pragma once

#include <Config.hpp>

class Country {
private:
    double m_defense;
    double m_manufacturing;

public:
    int id;
    double economy;

    Country(int id)
        : id(id),
        economy(Config::START_ECONOMY),
        m_defense(0.0),
        m_manufacturing(0.0) {
    }
};