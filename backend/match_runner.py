"""
Match runner orchestrator: coordinates bot execution, engine resolution, and logging.
This is the main service that ties the sandbox, engine, and backend together.
"""
import json
import subprocess
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import os
import sys

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MatchRunner:
    """Orchestrates a full game match from start to finish."""
    
    def __init__(self, match_id: int, n_players: int, bot_paths: List[str], num_rounds: int = 100):
        """
        Args:
            match_id: Unique identifier for this match.
            n_players: Number of players.
            bot_paths: List of paths to bot Python scripts (one per player).
            num_rounds: Maximum rounds to play.
        """
        self.match_id = match_id
        self.n_players = n_players
        self.bot_paths = bot_paths
        self.num_rounds = num_rounds
        self.game_state = {
            "round": 0,
            "islands": [
                {"id": i, "economy": 1000.0, "degree": 0}
                for i in range(n_players)
            ],
            "roads": []
        }
        self.log_entries = []
    
    def create_snapshot(self, player_id: int) -> Dict:
        """Create a game snapshot for a specific player."""
        return {
            "version": "1.0",
            "round": self.game_state["round"],
            "player_id": player_id,
            "n_players": self.n_players,
            "islands": self.game_state["islands"],
            "roads": self.game_state["roads"]
        }
    
    def run_bot(self, player_id: int, snapshot: Dict, timeout: float = 5.0) -> Optional[List]:
        """
        Run a bot in the sandbox and return its action row.
        
        Returns:
            List of actions from the bot, or None if error/timeout.
        """
        bot_path = self.bot_paths[player_id]
        if not Path(bot_path).exists():
            logger.error(f"Bot not found: {bot_path}")
            return None
        
        try:
            # For now, run directly (local); in production use sandbox_runner
            proc = subprocess.run(
                ["python3", bot_path],
                input=json.dumps(snapshot).encode(),
                capture_output=True,
                timeout=timeout
            )
            if proc.returncode != 0:
                logger.error(f"Bot {bot_path} failed: {proc.stderr.decode()}")
                return None
            
            response = json.loads(proc.stdout.decode())
            return response.get("actions", [None] * self.n_players)
        except subprocess.TimeoutExpired:
            logger.error(f"Bot {bot_path} timed out")
            return None
        except Exception as e:
            logger.error(f"Error running bot {bot_path}: {e}")
            return None
    
    def collect_actions(self) -> Optional[List[List[int]]]:
        """
        Run all bots and collect their actions into an ActionMatrix.
        Returns integer action codes.
        """
        action_matrix = []
        for player_id in range(self.n_players):
            snapshot = self.create_snapshot(player_id)
            actions_row = self.run_bot(player_id, snapshot)
            
            if actions_row is None:
                # Bot failed; use NO_OP (code 6)
                actions_row = [6] * self.n_players
            else:
                # Convert action type names to codes
                action_codes = []
                for action in actions_row:
                    action_type = action.get("type", "NO_OP") if isinstance(action, dict) else "NO_OP"
                    action_map = {
                        "TRADE": 0, "BUILD_ROAD": 1, "ATTACK": 2,
                        "DESTROY_ROAD": 3, "INVEST_DEFENSE": 4,
                        "INVEST_MANUFACTURING": 5, "NO_OP": 6
                    }
                    action_codes.append(action_map.get(action_type, 6))
                actions_row = action_codes
            
            action_matrix.append(actions_row)
        
        return action_matrix
    
    def write_actions_file(self, action_matrix: List[List[int]], filename: str = "actions.txt"):
        """Write action matrix to a file for the engine to read."""
        with open(filename, "w") as f:
            for row in action_matrix:
                f.write(" ".join(str(x) for x in row) + "\n")
        logger.info(f"Wrote actions to {filename}")
    
    def run_engine(self, engine_binary: str = "./game") -> bool:
        """Invoke the C++ engine to resolve the round."""
        if not Path(engine_binary).exists():
            logger.error(f"Engine binary not found: {engine_binary}")
            return False
        
        try:
            proc = subprocess.run([engine_binary], capture_output=True, timeout=10)
            output = proc.stdout.decode()
            logger.info(f"Engine output:\n{output}")
            return proc.returncode == 0
        except Exception as e:
            logger.error(f"Error running engine: {e}")
            return False
    
    def run_match(self, engine_binary: str = "./game") -> bool:
        """Run a complete match for a fixed number of rounds."""
        logger.info(f"Starting match {self.match_id} with {self.n_players} players for {self.num_rounds} rounds")
        
        for round_no in range(self.num_rounds):
            logger.info(f"--- Round {round_no + 1} ---")
            
            # Collect actions from all bots
            action_matrix = self.collect_actions()
            if action_matrix is None:
                logger.error("Failed to collect actions")
                break
            
            # Write actions file for engine
            self.write_actions_file(action_matrix)
            
            # Run engine to resolve round
            if not self.run_engine(engine_binary):
                logger.error("Engine resolution failed")
                break
            
            # Parse engine output and update game state (simplified)
            # In production, parse structured JSON output from engine
            self.game_state["round"] += 1
            
            # Log round data for replay
            self.log_entries.append({
                "round": round_no,
                "timestamp": datetime.utcnow().isoformat(),
                "actions": action_matrix,
                "state_after": self.game_state.copy()
            })
        
        logger.info(f"Match {self.match_id} completed")
        return True
    
    def save_log(self, log_path: str = None):
        """Save match log to a JSON file."""
        if log_path is None:
            log_path = f"logs/match_{self.match_id}.json"
        
        os.makedirs(os.path.dirname(log_path) or ".", exist_ok=True)
        with open(log_path, "w") as f:
            json.dump({
                "match_id": self.match_id,
                "n_players": self.n_players,
                "started_at": datetime.utcnow().isoformat(),
                "entries": self.log_entries,
                "final_state": self.game_state
            }, f, indent=2)
        logger.info(f"Saved match log to {log_path}")


if __name__ == "__main__":
    # Example: run a local match with sample bots
    runner = MatchRunner(
        match_id=1,
        n_players=5,
        bot_paths=[
            "bots/greedy_bot.py",
            "bots/random_bot.py",
            "bots/random_bot.py",
            "bots/random_bot.py",
            "bots/random_bot.py"
        ],
        num_rounds=3
    )
    
    runner.run_match()
    runner.save_log()
