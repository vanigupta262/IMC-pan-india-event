# Bot API (v1.0)

This document specifies the JSON snapshot sent to participant bots each round and the JSON response bots must return. This is a stable contract: once published, bots will build strategies around it.

Version: 1.0

---

Input (engine -> bot)

- Content-Type: `application/json`
- Delivered over stdin to the bot process (or via HTTP POST to a sandbox endpoint)

JSON schema (high level):

{
  "version": "1.0",
  "round": 0,
  "player_id": 2,
  "n_players": 5,
  "islands": [
    { "id": 0, "economy": 1000.0, "degree": 1 },
    { "id": 1, "economy": 900.0,  "degree": 0 },
    ...
  ],
  "roads": [[0,1], [2,3]],
  "history": [ /* optional per-round history for analysis */ ]
}

Notes on visibility
- Bots receive only public information. `defense` and `manufacturing` values are NOT included in `islands` (they are hidden per rules).
- `roads` is a list of road pairs present at the time of snapshot.
- `history` may contain previous rounds' public actions and resolved events; keep this optional and bounded in size.


Bot Output (bot -> engine)

- Content-Type: `application/json`
- Bot must write a single JSON object to stdout within the per-round timeout.

High-level format:

{
  "version": "1.0",
  "actions": [
    { "type": "NO_OP", "target": -1 },
    { "type": "TRADE", "target": 1 },
    ...  // length == n_players
  ]
}

- `actions` is an array of length `n_players` where index `j` denotes the action the bot requests *from this player* directed at player `j`. The engine will assemble all players' rows into the `ActionMatrix`.
- The bot should set `target` to the target player's id (or -1 for self/no-op). The engine ignores the `target` field if it conflicts with the array index; `target` is present for clarity.

Allowed action `type` values (strings):
- `TRADE`
- `BUILD_ROAD`
- `DESTROY_ROAD`
- `ATTACK`
- `INVEST_DEFENSE` (self-target only)
- `INVEST_MANUFACTURING` (self-target only)
- `NO_OP`

Constraints and recommendations
- Bots must return JSON within the round timeout (e.g., 1 second). Late responses are treated as `NO_OP`.
- Bots should not attempt actions that are obviously invalid (e.g., `ATTACK` when no road exists); the engine will silently ignore invalid actions or mark them in logs.
- Self-target actions (`INVEST_*`) should be placed in the array at the bot's own index (i.e., `actions[player_id]`).
- For deterministic matches, bots should be seeded by the match/round seed if they use randomness.

Example input and output

Input (engine -> bot):
{
  "version": "1.0",
  "round": 3,
  "player_id": 1,
  "n_players": 5,
  "islands": [
    {"id":0,"economy":1200.0,"degree":1},
    {"id":1,"economy":950.0,"degree":0},
    {"id":2,"economy":800.0,"degree":2},
    {"id":3,"economy":1100.0,"degree":1},
    {"id":4,"economy":700.0,"degree":0}
  ],
  "roads": [[0,2],[2,3]]
}

Output (bot -> engine):
{
  "version": "1.0",
  "actions": [
    {"type":"NO_OP","target":-1},
    {"type":"INVEST_DEFENSE","target":1},
    {"type":"NO_OP","target":-1},
    {"type":"TRADE","target":3},
    {"type":"NO_OP","target":-1}
  ]
}


Security and sandbox notes
- Bots will execute in an isolated sandbox (no network, limited filesystem, CPU and memory quotas).
- Bots should treat stdin/stdout as the only communication channel. Any other attempt (network sockets, uploads) will be blocked and may disqualify the team.


Versioning and compatibility
- Add a `version` field to snapshots and responses. Engine will support minor schema extensions via version negotiation.


Contact
- For clarifications or bugs in the Bot API, contact the organizing committee. The API may be extended between stages but breaking changes will be announced well before the stage starts.
