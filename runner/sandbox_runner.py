import json
import subprocess
import tempfile
import shutil
from pathlib import Path

SANDBOX_IMAGE = "igts-sandbox"
TIMEOUT_SEC = 1

def run_bot_in_sandbox(bot_path: str, state: dict):
    """
    Runs a single bot inside Docker sandbox.
    Returns raw bot output (list) or [] on failure.
    """
    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)

        # write input.json
        with open(tmpdir / "input.json", "w") as f:
            json.dump(state, f)

        # copy bot as bot.py
        shutil.copy(bot_path, tmpdir / "bot.py")

        try:
            subprocess.run(
                [
                    "docker", "run", "--rm",
                    "--network=none",
                    "--cpus=0.2",
                    "--memory=128m",
                    "--pids-limit=64",
                    "-v", f"{tmpdir}:/bot/work",
                    SANDBOX_IMAGE,
                ],
                timeout=TIMEOUT_SEC,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except subprocess.TimeoutExpired:
            return []

        # read output.json
        try:
            with open(tmpdir / "output.json") as f:
                return json.load(f)
        except Exception:
            return []
import concurrent.futures

def run_bots_parallel(bot_jobs):
    """
    bot_jobs: list of (pid, bot_path, state)
    returns dict pid -> bot_output
    """
    results = {}

    def run(job):
        pid, bot_path, state = job
        return pid, run_bot_in_sandbox(bot_path, state)

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(run, job) for job in bot_jobs]
        for f in futures:
            pid, output = f.result()
            results[pid] = output

    return results
