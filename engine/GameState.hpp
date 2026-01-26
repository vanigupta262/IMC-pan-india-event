#pragma once

#include <vector>
#include <set>
#include <cassert>
#include <algorithm>

#include "Island.hpp"
#include "Config.hpp"
#include "IOHandler.hpp"

#include <random>
#include <numeric>

class GameState {
public:
    int round{};
    std::vector<Island> islands{};
    std::set<std::pair<int, int>> roads;

    IOHandler ioHandler{};

    GameState(int nPlayers) {
        for (int i = 0; i < nPlayers; ++i) {
            islands.emplace_back(i);
        }
    }

    bool hasRoad(int islandA, int islandB) const {
        return roads.count(std::minmax(islandA, islandB)) > 0;
    }

    void buildRoad(int islandA, int islandB) {
        assert(islandA != islandB);

        Island& a{ islands[islandA] };
        Island& b{ islands[islandB] };

        double minEcon{ std::min(a.economy, b.economy) };

        double costA{ Config::ROAD_BUILD_COST_FACTOR * minEcon * (Config::ROAD_BUILD_MANUFACTURING_LIMIT - a.manufacturing) };
        a.economyDelta -= costA;

        double costB{ Config::ROAD_BUILD_COST_FACTOR * minEcon * (Config::ROAD_BUILD_MANUFACTURING_LIMIT - b.manufacturing) };
        b.economyDelta -= costB;

        roads.insert(std::minmax(islandA, islandB));
        a.degreeDelta++;
        b.degreeDelta++;
    }

    void destroyRoad(int islandA, int islandB) {
        assert(islandA != islandB);
        roads.erase(std::minmax(islandA, islandB));
        islands[islandA].degreeDelta--;
        islands[islandB].degreeDelta--;
    }

    void trade(int islandA, int islandB) {
        Island& a{ islands[islandA] };
        Island& b{ islands[islandB] };

        auto [minE, maxE] = std::minmax(a.economy, b.economy);

        double tradePool{};
        if (hasRoad(islandA, islandB))
            tradePool = -Config::TRADE_ROAD_MIN_FACTOR * minE + Config::TRADE_ROAD_MAX_FACTOR * maxE;
        else
            tradePool = -Config::TRADE_SEA_MIN_FACTOR * minE + Config::TRADE_SEA_MAX_FACTOR * maxE;

        double delta{ tradePool / (a.degree + b.degree + 1) };
        a.economyDelta += delta * a.degree;
        b.economyDelta += delta * b.degree;
    }

    void attack(int attacker, int defender) {
        assert(hasRoad(attacker, defender));

        double delta{ Config::ATTACK_FACTOR * islands[defender].economy * (Config::ATTACK_DEFENSE_LIMIT - islands[defender].defense) };

        islands[attacker].economyDelta += delta;
        islands[defender].economyDelta -= delta;
    }

    void resolveRound(ActionMatrix& actions) {
        for (size_t i = 0; i < islands.size(); ++i) {
            if (actions[i][i].type == Action::INVEST_DEFENSE) {
                islands[i].investInDefense();
            }
            else if (actions[i][i].type == Action::INVEST_MANUFACTURING) {
                islands[i].investInManufacturing();
            }

            for (size_t j = i + 1; j < islands.size(); ++j) {
                if ((actions[i][j].type == Action::DESTROY_ROAD ||
                     actions[j][i].type == Action::DESTROY_ROAD) && 
                     hasRoad(i, j)) {
                    destroyRoad(i, j);
                }

                else if (actions[i][j].type == Action::TRADE &&
                    actions[j][i].type == Action::TRADE) {
                    trade(i, j);
                }

                else if (actions[i][j].type == Action::BUILD_ROAD &&
                    actions[j][i].type == Action::BUILD_ROAD) {
                    buildRoad(i, j);
                }

                else if (hasRoad(i, j)) {
                    bool attacked{ false };

                    if (actions[i][j].type == Action::ATTACK) {
                        attack(i, j);
                        attacked = true;
                    }

                    if (actions[j][i].type == Action::ATTACK) {
                        attack(j, i);
                        attacked = true;
                    }

                    if (attacked) {
                        destroyRoad(i, j);
                    }
                }
            }
        }

        for (auto& island : islands) {
            island.decayInvestments();
            island.updateEconomy();

            assert(island.economy >= 0.0);
            assert(island.degree >= 0.0);
        }
    }



    void triggerBlackSwan() {
        std::cout << "!!! BLACK SWAN EVENTS TRIGGERED (Round " << round << ") !!!" << std::endl;
        std::mt19937 gen(ioHandler.blackSwanSeed);
        std::bernoulli_distribution dist(0.5);

        // 1. Destroy Roads
        auto it = roads.begin();
        while (it != roads.end()) {
            if (dist(gen)) {
                std::cout << "Black Swan destroyed road " << it->first << "-" << it->second << "\n";
                islands[it->first].degree--;
                islands[it->second].degree--;
                it = roads.erase(it);
            } else {
                ++it;
            }
        }
        
        // 2. Economy Impact
        std::vector<int> sortedIndices(islands.size());
        std::iota(sortedIndices.begin(), sortedIndices.end(), 0);
        std::sort(sortedIndices.begin(), sortedIndices.end(), [&](int a, int b) {
            return islands[a].economy > islands[b].economy;
        });

        std::cout << "Black Swan Economy Impact applied." << std::endl;
        if (sortedIndices.size() >= 1) islands[sortedIndices[0]].economy *= 0.8; // 1st
        if (sortedIndices.size() >= 3) islands[sortedIndices[2]].economy *= 1.2; // 3rd
        if (sortedIndices.size() >= 5) islands[sortedIndices[4]].economy *= 0.8; // 5th
        
        // Ensure economy doesn't go negative (though multiplication usually safe, strict rules might say otherwise? Assuming safe)
    }

    void handleRound() {
        ActionMatrix actions{ ioHandler.getActions(static_cast<int>(islands.size())) };
        resolveRound(actions);

        if (round == ioHandler.blackSwanRound) {
            triggerBlackSwan();
        }

        round++;
    }
};