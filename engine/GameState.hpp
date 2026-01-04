#pragma once;

#include <vector>
#include <set>
#include <cassert>

#include <Country.hpp>
#include <Config.hpp>

class GameState {
public:
    int round{};
    std::vector<Country> countries{};
    std::set<std::pair<int, int>> roads;

    GameState(int nPlayers) {
        for (int i = 0; i < nPlayers; ++i) {
            countries.emplace_back(i);
        }
    }

    bool hasRoad(int countryA, int countryB) const {
        return roads.count({ countryA, countryB }) || roads.count({ countryB, countryA });
    }

    void addRoad(int countryA, int countryB) {
        assert(countryA != countryB);
        roads.insert(countryA < countryB ? std::make_pair(countryA, countryB) : std::make_pair(countryB, countryA));
    }

    void removeRoad(int countryA, int countryB) {
        assert(countryA != countryB);
        roads.erase(countryA < countryB ? std::make_pair(countryA, countryB) : std::make_pair(countryB, countryA));
    }

    int getDegree(int countryID) const {
        int degree = 0;
        for (const auto& road : roads) {
            if (road.first == countryID || road.second == countryID) {
                ++degree;
            }
        }
        return degree;
    }
};