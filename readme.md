# IMC Pan-India Event - Trading Game Simulation

A multiplayer economic strategy game engine where bots representing countries compete by trading, building roads, attacking, and managing their economies.

## 🎮 Overview

This is a turn-based simulation where multiple countries (controlled by bots) interact through:
- **Trading** - Bilateral trade agreements that boost both economies
- **Building Roads** - Infrastructure that enhances trade efficiency
- **Attacking** - Raid connected countries to steal economy
- **Destroying Roads** - Break connections with other countries

## 📁 Project Structure

```
├── bots/              # Bot implementations
│   ├── random_bot.py  # Random action bot
│   └── trade_bot.py   # Simple trade-focused bot
├── engine/            # Core game engine
│   ├── actions.py     # Action types (TRADE, BUILD, ATTACK, DESTROY, NO_OP)
│   ├── bot_api.py     # Builds state dict for bots
│   ├── config.py      # Game configuration constants
│   ├── country.py     # Country class with economy/defense/manufacturing
│   ├── resolver.py    # Resolves all actions each round
│   ├── route.py       # Road/route utilities
│   ├── serialize.py   # State serialization
│   └── state.py       # GameState management
├── runner/            # Match execution
│   ├── bot_adapter.py # Parses bot output into actions
│   ├── local_match.py # Local match runner
│   └── serialize.py   # Action serialization
└── match_log.json     # Output log of match results
```

## ⚙️ Game Mechanics

### Country Stats
- **Economy** - Starting value: 100.0 (main resource)
- **Defense** - Reduces attack damage (max: 1.0)
- **Manufacturing** - Production capability (max: 1.0)

### Actions

| Action | Type | Requirement | Effect |
|--------|------|-------------|--------|
| **TRADE** | Bilateral | Both must agree | Both gain economy (10% of min economy, 5% if no road) |
| **BUILD** | Bilateral | Both must agree | Creates road, costs 20% of min economy each |
| **ATTACK** | Unilateral | Road must exist | Steals economy based on defender's economy & defense, destroys road |
| **DESTROY** | Unilateral | Road must exist | Removes road immediately |

### Resolution Order
1. **Destroy** - Roads are removed first
2. **Attack** - Attacks processed (road destroyed after)
3. **Trade** - Mutual trades resolved
4. **Build** - New roads constructed
5. **Decay** - Stat decay applied

## 🤖 Bot Interface

Each bot receives a state dictionary and returns a list of actions:

### Input State
```python
state = {
    "self_id": int,           # Your country ID
    "round": int,             # Current round number
    "countries": {
        id: {
            "economy": float,
            "defense": float,
            "manufacturing": float
        }
    },
    "roads": [(i, j), ...]    # Existing roads
}
```

### Bot Output
```python
# Return a list of action dictionaries
[
    {"type": "TRADE", "target": 1},
    {"type": "BUILD", "target": 2},
    {"type": "ATTACK", "target": 3},
    {"type": "DESTROY", "target": 4}
]
```

## 🚀 Running a Match

```bash
python runner/local_match.py
```

This runs a 3-round match with 10 players and outputs results to `match_log.json`.

## 📊 Configuration

Edit `engine/config.py` to adjust game parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `N_PLAYERS` | 10 | Number of countries |
| `START_ECONOMY` | 100.0 | Initial economy |
| `ATTACK_FACTOR` | 0.4 | Attack damage multiplier |
| `DEFENSE_FACTOR` | 0.85 | Defense effectiveness |
| `ROAD_BUILD_COST` | 0.2 | Cost to build roads (% of min economy) |
| `TRADE_POOL_FACTOR` | 0.1 | Trade gain (% of min economy) |
| `AIR_TRADE_PENALTY` | 0.5 | Penalty for trading without road |

## 📝 Creating a Bot

1. Create a new file in `bots/` directory
2. Implement a `PM(state)` function that returns actions
3. Update the import in `runner/local_match.py`

Example minimal bot:
```python
def PM(state):
    self_id = state["self_id"]
    # Trade with the next player
    target = (self_id + 1) % len(state["countries"])
    return [{"type": "TRADE", "target": target}]
```