#include <vector>
#include <iostream>
#include <fstream>
#include <sstream>
#include <cstdio>

#include "Action.hpp"

class IOHandler {
private:
    std::vector<std::vector<std::pair<int, int>>> allRoundActions;  // [player][round] = {action_code, target}
    size_t currentRound = 0;
    bool actionsLoaded = false;

public:

    int blackSwanRound = -1;
    int blackSwanSeed = 0;

    IOHandler() {
        loadAllRoundsFromFile();
    }

    // Load all rounds from actions.txt. Format: "code:target"
    void loadAllRoundsFromFile() {
        const char* fname = "actions.txt";
        std::ifstream fin(fname);
        if (!fin.good()) {
            return;
        }

        allRoundActions.clear();
        std::string line;
        
        while (std::getline(fin, line)) {
            if (line.empty()) continue;

            // Check for Black Swan config
            if (line.substr(0, 3) == "BS:") {
                std::istringstream iss(line.substr(3));
                if (iss >> blackSwanRound >> blackSwanSeed) {
                    std::cout << "[IOHandler] Black Swan config loaded: round=" << blackSwanRound << ", seed=" << blackSwanSeed << "\n";
                }
                continue;
            }

            std::vector<std::pair<int, int>> playerActions;
            std::istringstream iss(line);
            std::string token;
            while (iss >> token) {
                int code = 6; // NO_OP
                int target = -1;
                
                size_t colonPos = token.find(':');
                if (colonPos != std::string::npos) {
                    try {
                        code = std::stoi(token.substr(0, colonPos));
                        target = std::stoi(token.substr(colonPos + 1));
                    } catch (...) {
                        code = 6; target = -1;
                    }
                } else {
                    // Fallback for old format
                    try { code = std::stoi(token); } catch(...) { code = 6; }
                }

                if (code < 0 || code > Action::NO_OP) code = Action::NO_OP;
                playerActions.push_back({code, target});
            }
            if (!playerActions.empty()) {
                allRoundActions.push_back(playerActions);
            }
        }
        fin.close();

        if (!allRoundActions.empty()) {
            actionsLoaded = true;
            std::cout << "[IOHandler] Loaded " << allRoundActions.size() 
                      << " players with " << allRoundActions[0].size() 
                      << " rounds of actions from '" << fname << "'\n";
        }
    }

    ActionMatrix getActions(int nPlayers) {
        ActionMatrix mat(nPlayers, std::vector<Action>(nPlayers, Action(Action::NO_OP, -1)));

        if (actionsLoaded && currentRound < allRoundActions[0].size()) {
            // Use loaded actions for this round
            for (int player = 0; player < nPlayers && player < (int)allRoundActions.size(); ++player) {
                int actionCode = allRoundActions[player][currentRound].first;
                int target = allRoundActions[player][currentRound].second;
                auto actionType = static_cast<Action::ActionType>(actionCode);
                
                mat[player][target == -1 ? player : target] = Action(actionType, target);
            }
            std::cout << "[IOHandler] Using loaded actions for round " << currentRound + 1 << "\n";
            currentRound++;
            return mat;
        }

        // Deterministic fallback for demo/testing
        if (nPlayers >= 2) {
            mat[0][1] = Action(Action::BUILD_ROAD, 1);
            mat[1][0] = Action(Action::BUILD_ROAD, 0);
        }

        if (nPlayers >= 4) {
            mat[2][3] = Action(Action::TRADE, 3);
            mat[3][2] = Action(Action::TRADE, 2);
        }

        if (nPlayers >= 5) {
            mat[4][4] = Action(Action::INVEST_DEFENSE, 4);
        }

        std::cout << "[IOHandler] Using fallback deterministic actions for round " << currentRound + 1 << "\n";
        currentRound++;
        return mat;
    }
};