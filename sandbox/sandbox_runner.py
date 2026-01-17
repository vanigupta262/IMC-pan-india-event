#!/usr/bin/env python3
"""
Sandbox bot runner: executes a bot in Docker with strict resource limits and timeout.
Returns the bot output (expected JSON) or error status.

Usage:
  python3 sandbox_runner.py /path/to/bot.py snapshot.json --timeout 2 --memory 256m --cpus 0.5

The runner:
1. Mounts the bot script (read-only) into the container at /bot/
2. Passes the snapshot JSON to stdin
3. Enforces memory, CPU, and timeout limits
4. Captures stdout/stderr
5. Returns the bot's JSON output on success or raises an error on failure
"""
import subprocess
import json
import sys
import argparse
from pathlib import Path
import shutil


def run_bot_in_sandbox(bot_path, snapshot, timeout=2.0, memory="256m", cpus=0.5, image="igts-bot-sandbox"):
    """
    Executes a bot in Docker sandbox and returns the bot's JSON response.
    
    Args:
        bot_path: Path to the Python bot script (absolute or relative).
        snapshot: Dict to pass as JSON on stdin.
        timeout: Max seconds to wait for bot (enforced by Docker's --cpus and timeout cmd).
        memory: Memory limit (e.g., "256m").
        cpus: CPU limit (e.g., 0.5 for half a core).
        image: Docker image name (default: igts-bot-sandbox).
    
    Returns:
        Parsed JSON output from bot.
    
    Raises:
        subprocess.TimeoutExpired: If bot doesn't respond within timeout.
        subprocess.CalledProcessError: If container exits with error.
        json.JSONDecodeError: If bot output is not valid JSON.
    """
    bot_path = Path(bot_path).resolve()
    if not bot_path.exists():
        raise FileNotFoundError(f"Bot not found: {bot_path}")

    # Docker run command
    docker_cmd = [
        "docker",
        "run",
        "--rm",
        "-i",  # Interactive mode to pass stdin
        "--memory", memory,
        "--cpus", str(cpus),
        "--read-only",
        "--tmpfs", "/tmp:size=10m",
        "--network", "none",
        "-v", f"{bot_path}:/bot/{bot_path.name}:ro",
        image,
        f"/bot/{bot_path.name}"
    ]

    snapshot_json = json.dumps(snapshot)
    try:
        proc = subprocess.run(
            docker_cmd,
            input=snapshot_json.encode(),
            capture_output=True,
            timeout=timeout,
            check=True
        )
    except subprocess.TimeoutExpired:
        raise TimeoutError(f"Bot {bot_path.name} exceeded timeout of {timeout}s")
    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode() if e.stderr else ""
        raise RuntimeError(f"Bot container failed: {stderr}")

    bot_output = proc.stdout.decode().strip()
    try:
        return json.loads(bot_output)
    except json.JSONDecodeError as e:
        raise json.JSONDecodeError(f"Bot {bot_path.name} returned invalid JSON", bot_output, 0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run a bot in Docker sandbox")
    parser.add_argument("bot_path", help="Path to bot Python script")
    parser.add_argument("snapshot_file", help="Path to snapshot JSON file (or - for stdin)")
    parser.add_argument("--timeout", type=float, default=5.0, help="Timeout in seconds (default 5s for Docker overhead)")
    parser.add_argument("--memory", default="256m", help="Memory limit (e.g., 256m)")
    parser.add_argument("--cpus", type=float, default=0.5, help="CPU limit (e.g., 0.5)")
    parser.add_argument("--image", default="igts-bot-sandbox", help="Docker image name")

    args = parser.parse_args()

    # Load snapshot
    if args.snapshot_file == "-":
        snapshot_data = sys.stdin.read()
        snapshot = json.loads(snapshot_data)
    else:
        with open(args.snapshot_file, "r") as f:
            snapshot = json.load(f)

    # Run bot in sandbox
    try:
        result = run_bot_in_sandbox(
            args.bot_path,
            snapshot,
            timeout=args.timeout,
            memory=args.memory,
            cpus=args.cpus,
            image=args.image
        )
        print(json.dumps(result))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
