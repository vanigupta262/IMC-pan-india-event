# Bot Sandbox

This directory contains the Docker-based sandbox for secure execution of untrusted participant bots.

## Files

- `Dockerfile`: Minimal Python 3.11 image with no network, no unnecessary tools, non-root user execution.
- `sandbox_runner.py`: Python runner script that:
  - Accepts a bot Python script and a snapshot JSON file.
  - Mounts the bot into a Docker container (read-only).
  - Enforces memory, CPU, and timeout limits.
  - Passes snapshot on stdin and captures bot output on stdout.
  - Returns parsed JSON response or raises error.

## Security Model

Each bot runs in a separate container with:
- **No network access**: `--network none`
- **Read-only filesystem**: `--read-only` except `/tmp` (limited to 10MB)
- **Memory limit**: 256MB by default (configurable)
- **CPU limit**: 0.5 cores by default (configurable)
- **Timeout**: 2 seconds per round (enforced by runner)
- **Non-root user**: bots run as `botrunner` (UID/GID, no sudo)
- **No shell access**: entrypoint is directly to Python

## Building the Image

```bash
docker build -t igts-bot-sandbox sandbox/
```

## Running a Bot Manually

```bash
# Create a test snapshot
echo '{
  "version": "1.0",
  "round": 0,
  "player_id": 0,
  "n_players": 5,
  "islands": [{"id":0,"economy":1000.0,"degree":0}, ...],
  "roads": []
}' > /tmp/snapshot.json

# Run a bot via sandbox_runner
python3 sandbox/sandbox_runner.py bots/random_bot.py /tmp/snapshot.json --timeout 2 --memory 256m --cpus 0.5
```

## Using in Match Runner

Update `local_match_runner.py` to use `sandbox_runner.py` instead of direct subprocess for production safety:

```python
from sandbox.sandbox_runner import run_bot_in_sandbox

for pid in range(n_players):
    bot = BOT_FOR_PLAYER[pid]
    snapshot = make_snapshot(pid, round_no)
    try:
        response = run_bot_in_sandbox(bot, snapshot, timeout=2.0)
        # extract actions from response
    except Exception as e:
        # log error and record timeout/failure for match
```

## Resource Limits

Default limits per bot:
- **Memory**: 256 MB
- **CPU**: 0.5 cores
- **Time**: 2 seconds per round
- **/tmp size**: 10 MB

These can be tuned based on tournament needs and DigitalOcean droplet capacity.

## Notes

- The sandbox does NOT provide perfect security (container escape is theoretically possible). Use Docker in a trusted environment or add additional host-level isolation (AppArmor, SELinux).
- For production tournaments, consider adding:
  - Audit logging (bot stderr/stdout capture per match)
  - Resource usage telemetry
  - Retry and fallback strategies for crashed bots
  - Bot image caching to reduce startup overhead

## Testing Locally

Build the image and test with sample bots:

```bash
docker build -t igts-bot-sandbox sandbox/
python3 sandbox/sandbox_runner.py bots/greedy_bot.py /tmp/snapshot.json
```
