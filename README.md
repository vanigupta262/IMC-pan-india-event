# 🎮 IGTS × IMC Algo Trading Platform

Welcome to the **IGTS × IMC Algo Trading Platform**, a local development environment tailored for the 2026 Inter-IIT Tech Meet. This platform allows you to write, test, and compete with Python trading bots in a simulated island economy.

## 🚀 Quick Start

### 1. Prerequisites
- **Linux** (or WSL2 on Windows)
- **Docker Desktop / Docker Engine** (Required for sandboxing)
- **Python 3.8+**
- **G++** (GCC C++ Compiler)

### 2. Setup
Run the setup script to install dependencies, compile the engine, and **build the sandbox image**.
```bash
./setup.sh
```

> **Note**: You must have Docker running. If `setup.sh` fails at step 2, start Docker and try again.

### 3. Launch
Start the platform (frontend + backend).
```bash
./launch.sh
```
The dashboard will open automatically at [http://localhost:3000](http://localhost:3000).

---

## 🤖 Writing Your Bot

Bots are simple Python scripts that implement a `get_action(state)` function.

### Basic Structure
Create a `.py` file (e.g., `my_bot.py`) with the following structure:

```python
import random

def get_action(game_state):
    """
    Decide the next action for your player.
    
    Args:
        game_state (dict): Contains 'round', 'player_id', 'n_players', 'players', 'roads'
    
    Returns:
        dict: {'type': 'ACTION_TYPE', 'target': target_id}
    """
    my_id = game_state["player_id"]
    
    # Example: Randomly trade or build roads
    actions = ["TRADE", "BUILD_ROAD", "INVEST_DEFENSE", "INVEST_MANUFACTURING", "NO_OP"]
    action_type = random.choice(actions)
    
    # Choose a target (must be a valid player ID)
    target = random.choice([p for p in range(game_state["n_players"]) if p != my_id])
    
    return {
        "type": action_type,
        "target": target
    }
```

### Available Actions
| Action Type | Description |
| :--- | :--- |
| `BUILD_ROAD` | Build a road to another player (Cost depends on economy) |
| `TRADE` | Trade with another player to boost both economies |
| `ATTACK` | Attack a connected player (Requires road) |
| `DESTROY_ROAD` | Destroy an existing road to cut off a player |
| `INVEST_DEFENSE` | Increase your defense stat |
| `INVEST_MANUFACTURING` | Increase manufacturing (reduces road costs) |
| `NO_OP` | Do nothing this round |

---

## 🏗️ Architecture

The platform consists of three main components:

1.  **Frontend (Port 3000)**: A `http.server` hosting a vanilla JS/HTML dashboard for managing bots and lobbies.
2.  **Backend (Port 8000)**: A **FastAPI** application handling users, authentication, matchmaking, and orchestration.
3.  **Game Engine (C++)**: A high-performance compiled binary (`./game`) that runs the actual simulation logic.

### Data Flow
1.  **Orchestrator**: The backend collects bot scripts for a match.
2.  **Execution**: Bots are executed (locally or sandboxed) to generate actions for each round.
3.  **Simulation**: Actions are written to `actions.txt`, and the C++ engine processes them to calculate economy changes.
4.  **Results**: The backend parses the engine output and serves the match logs to the frontend.

---

## 🛠️ Troubleshooting

-   **"Engine not found"**: Run `./setup.sh` to recompile the C++ engine.
-   **"Backend failed to start"**: Check `/tmp/backend.log` for Python errors.
-   **"NO_OP issues"**: Ensure your bot file has the correct `get_action(state)` signature.

---

**Built for IGTS × IMC Event.**
