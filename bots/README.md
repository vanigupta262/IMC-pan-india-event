Bot templates and how to test locally

Files:
- `random_bot.py` — simple random-action bot demonstrating how to read snapshot from stdin and write response to stdout.
- `greedy_bot.py` — deterministic example that prefers actions with the richest visible opponent.

How to test locally
1. Prepare a snapshot JSON file, e.g. `snapshot.json`:

{
  "version": "1.0",
  "round": 0,
  "player_id": 1,
  "n_players": 5,
  "islands": [
    {"id":0,"economy":1000.0,"degree":0},
    {"id":1,"economy":950.0,"degree":0},
    {"id":2,"economy":800.0,"degree":0},
    {"id":3,"economy":700.0,"degree":0},
    {"id":4,"economy":600.0,"degree":0}
  ],
  "roads": []
}

2. Run a bot with the snapshot piped to it:

```bash
cat snapshot.json | python3 bots/random_bot.py
cat snapshot.json | python3 bots/greedy_bot.py
```

The bot will print a JSON action response to stdout. In production the match runner will call each bot separately and assemble their rows into the final `ActionMatrix`.

Sandbox expectations
- Bots run in an isolated environment with no network access and strict CPU/memory/time limits.
- Bots must not rely on external files or services.

If you want, I can:
- Add a simple `local_match_runner.py` to simulate running multiple bots and assembling their responses into the engine's `ActionMatrix`.
- Add unit tests or a CI job to verify sample bots behave as expected.
