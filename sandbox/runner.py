import json
import importlib.util
import sys
from pathlib import Path

WORK_DIR = Path("work")

def load_bot():
    bot_path = WORK_DIR / "bot.py"

    spec = importlib.util.spec_from_file_location("bot", bot_path)
    bot = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(bot)

    return bot

def main():
    try:
        with open(WORK_DIR / "input.json") as f:
            state = json.load(f)

        bot = load_bot()
        actions = bot.PM(state)

        with open(WORK_DIR / "output.json", "w") as f:
            json.dump(actions, f)

    except Exception as e:
        with open(WORK_DIR / "output.json", "w") as f:
            json.dump([], f)

if __name__ == "__main__":
    main()
