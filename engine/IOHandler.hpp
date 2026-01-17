#include <vector>
#include <iostream>
#include <fstream>
#include <sstream>
#include <cstdio>

#include "Action.hpp"

class IOHandler {
private:
    std::vector<std::vector<int>> allRoundActions;  // [player][round] = action_code
    size_t currentRound = 0;
    bool actionsLoaded = false;

public:

    IOHandler() {
        loadAllRoundsFromFile();
    }

    // Load all rounds of actions from actions.txt file.
    // Format: one row per player, whitespace-separated integer ActionType values (one per round)
    // Example for 2 players, 3 rounds:
    //   0 1 5
    //   2 1 4
    // Player 0: BUILD_ROAD, TRADE, NO_OP
    // Player 1: INVEST_DEFENSE, TRADE, ATTACK
    void loadAllRoundsFromFile() {
        const char* fname = "actions.txt";
        std::ifstream fin(fname);
        if (!fin.good()) {
            return;
        }

        allRoundActions.clear();
        std::string line;
        
        while (std::getline(fin, line)) {
            std::vector<int> playerActions;
            std::istringstream iss(line);
            int code;
            while (iss >> code) {
                if (code < 0 || code > Action::NO_OP) {
                    std::cerr << "[IOHandler] Invalid action code " << code << ", using NO_OP\n";
                    code = Action::NO_OP;
                }
                playerActions.push_back(code);
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
                int actionCode = allRoundActions[player][currentRound];
                auto actionType = static_cast<Action::ActionType>(actionCode);
                
                // For each player, set their action toward all other players
                // The target is determined by the action (for simplicity, use round-robin or first opponent)
                int target = (player + 1) % nPlayers;  // Simple target selection
                mat[player][target] = Action(actionType, target);
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