# Trading vs Defensive Bot Match - Expected Outcome

## Bot Strategies

### Player 0: Trader Bot
```
Round 1: BUILD_ROAD (target=1)    → Costs 100 economy to build connection
Round 2: TRADE (target=1)          → Exchanges via road
Round 3: TRADE (target=1)          → Second trade
Round 4: INVEST_MANUFACTURING (target=0) → Diversify
Rounds 5+: NO_OP                   → Preserve resources
```

### Player 1: Defensive Bot
```
Round 1: INVEST_DEFENSE (target=1) → Invest 100 in defense
Round 2: TRADE (target=0)          → Trade via established road
Round 3: TRADE (target=0)          → Second trade
Round 4: ATTACK (target=0)         → Attack to damage opponent
Rounds 5+: NO_OP                   → Preserve resources
```

---

## Expected Game Flow

### Initial State (Round 0):
```
Player 0: economy=1000, def=0.0, mf=0, roads=0
Player 1: economy=1000, def=0.0, mf=0, roads=0
Roads: []
```

### Round 1 Execution:

**Actions:**
- Player 0: BUILD_ROAD (1) 
- Player 1: INVEST_DEFENSE (1)

**What Happens:**
1. Player 0 builds road to Player 1
   - Cost: 10% of economy = 100
   - Player 0 economy: 1000 → 900
   - Roads built: degree increases

2. Player 1 invests in defense
   - Cost: 10% of economy = 100
   - Player 1 economy: 1000 → 900
   - Defense stat: 0 → 1.0

**State After Round 1:**
```
Player 0: economy=900, def=0.0, mf=0, roads=1
Player 1: economy=900, def=1.0, mf=0, roads=0
Roads: [0 <-> 1]
```

---

### Round 2 Execution:

**Actions:**
- Player 0: TRADE (1)
- Player 1: TRADE (0)

**What Happens:**
1. Both players trade via established road
   - Trade factor based on road = 0.05-0.1 of sending player's economy
   - Each receives ~50-150 economy from other
   - Exact amount determined by C++ engine trade logic

2. Example calculation:
   - Player 0 sends ~50-100 to Player 1
   - Player 1 sends ~50-100 to Player 0
   - Net effect: Both gain resource

**Expected State After Round 2 (approximate):**
```
Player 0: economy=950-1000, def=0.0, mf=0, roads=1
Player 1: economy=950-1000, def=1.0, mf=0, roads=0
Roads: [0 <-> 1]
```

---

### Round 3 Execution:

**Actions:**
- Player 0: TRADE (1)
- Player 1: TRADE (0)

**What Happens:**
1. Second trade occurs (both benefit again)
2. Similar resource transfer as Round 2

**Expected State After Round 3:**
```
Player 0: economy=1000-1100 (gained from trades), def=0.0, mf=0, roads=1
Player 1: economy=1000-1100 (gained from trades), def=1.0, mf=0, roads=0
Roads: [0 <-> 1]
```

---

### Round 4 Execution (Different Actions):

**Actions:**
- Player 0: INVEST_MANUFACTURING (0)
- Player 1: ATTACK (0)

**What Happens:**

1. **Player 0 invests in manufacturing:**
   - Cost: 10% of current economy = ~100-110
   - Manufacturing stat: 0 → increases toward 1.0
   - Economy: ~1050-1090 → ~950-990

2. **Player 1 attacks Player 0:**
   - Damage factor: 40% of Player 0's economy
   - Player 0 current economy: ~950-990
   - Damage dealt: ~380-396
   - Player 0's defense reduces this
   - Defense stat 1.0 provides protection (caps damage at 85% of defense limit)
   - Actual damage: ~200-300 (attack factor 40% scaled by defense)
   - Player 0 economy: ~650-790

**Expected State After Round 4:**
```
Player 0: economy=650-800, def=0.0, mf=0.5-1.0, roads=1
Player 1: economy=1000-1100, def=1.0, mf=0, roads=0
Roads: [0 <-> 1]
```

---

## Final Rankings (After 3 Rounds in C++ engine)

Since the C++ engine only runs 3 rounds in the demo:

**Final Result:**
```
Rank 1: Player 1 (economy: 1000-1100)
Rank 2: Player 0 (economy: 1000-1100)
```

Both players benefit from trade, so economies are similar.

---

## Expected Match Log JSON Output

```json
{
  "match_id": 1,
  "num_players": 2,
  "num_rounds": 3,
  "start_time": "2026-01-17T...",
  "rounds": [
    {
      "round": 1,
      "actions": [
        {
          "player_id": 0,
          "player_name": "player0",
          "action": {"type": "BUILD_ROAD", "target": 1}
        },
        {
          "player_id": 1,
          "player_name": "player1",
          "action": {"type": "INVEST_DEFENSE", "target": 1}
        }
      ],
      "events": [
        "Round 1: Processed 2 actions",
        "  - 1 BUILD_ROAD action(s)",
        "  - 1 INVEST_DEFENSE action(s)"
      ]
    },
    {
      "round": 2,
      "actions": [
        {"player_id": 0, "player_name": "player0", "action": {"type": "TRADE", "target": 1}},
        {"player_id": 1, "player_name": "player1", "action": {"type": "TRADE", "target": 0}}
      ],
      "events": [
        "Round 2: Processed 2 actions",
        "  - 2 TRADE action(s)"
      ]
    },
    {
      "round": 3,
      "actions": [
        {"player_id": 0, "player_name": "player0", "action": {"type": "TRADE", "target": 1}},
        {"player_id": 1, "player_name": "player1", "action": {"type": "TRADE", "target": 0}}
      ],
      "events": [
        "Round 3: Processed 2 actions",
        "  - 2 TRADE action(s)"
      ]
    }
  ],
  "final_state": {
    "player_economies": {
      "0": 1000.0,
      "1": 1000.0
    },
    "player_states": {
      "0": {"id": 0, "economy": 1000.0, "defense": 0.0, "manufacturing": 0, "roads": 1},
      "1": {"id": 1, "economy": 1000.0, "defense": 1.0, "manufacturing": 0, "roads": 0}
    },
    "rankings": [
      {"player_id": 1, "economy": 1000.0, "rank": 1},
      {"player_id": 0, "economy": 1000.0, "rank": 2}
    ]
  },
  "end_time": "2026-01-17T..."
}
```

---

## Key Observations

1. **Rounds 1-3 (As Designed):**
   - Player 0 (Trader) builds road first
   - Both players trade successfully (rounds 2-3)
   - Mutual benefit from trade

2. **Round 4 (Different Strategy):**
   - Player 0 diverts to manufacturing
   - Player 1 attacks, trying to capitalize
   - Mixed outcomes due to diverging strategies

3. **Economic Impact:**
   - Trade is profitable (both gain)
   - Attack can damage opponent if defense is low
   - Investment has clear cost-benefit tradeoff

4. **Why This Demonstrates Strategy:**
   - Shows coordinated trading (rounds 1-3)
   - Shows strategy divergence (round 4+)
   - Shows economic mechanics in action

---

## Testing This Match

To test these bots via the web UI:

1. Start system:
   ```bash
   # Backend running on :8000
   # Frontend running on :3000
   ```

2. Register two users (or use existing)

3. Upload both bots:
   - `bots/trader_bot.py`
   - `bots/defensive_bot.py`

4. Create lobby with 2 players

5. Assign bots to each player

6. Start match

7. View results and game log

Expected behavior: Both players cooperate in rounds 1-3 (trading), then diverge in strategy afterward.
