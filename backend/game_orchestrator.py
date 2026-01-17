"""
Game Orchestrator - Manages game simulation with C++ engine integration.
Collects bot actions and feeds them to the C++ game engine executable.
Bots run in Docker sandbox for security and resource isolation.
"""

import json
import subprocess
import os
import re
from typing import List, Dict, Any
from datetime import datetime
import sys
from pathlib import Path

# Try to import sandbox runner; fall back to direct execution if not available
try:
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from sandbox.sandbox_runner import run_bot_in_sandbox
    SANDBOX_AVAILABLE = True
except ImportError:
    SANDBOX_AVAILABLE = False


class GameOrchestrator:
    """Orchestrates a full 10-round game with C++ engine."""
    
    NUM_ROUNDS = 10
    ACTIONS_PER_BOT = 1  # Each bot submits 1 action per round
    
    # Action types matching C++ engine
    ACTION_TYPES = {
        "TRADE": 0,
        "BUILD_ROAD": 1,
        "ATTACK": 2,
        "DESTROY_ROAD": 3,
        "INVEST_DEFENSE": 4,
        "INVEST_MANUFACTURING": 5,
        "NO_OP": 6
    }
    
    # Path to compiled C++ engine
    ENGINE_PATH = "./game"
    
    def __init__(self, match_id: int, players: List[Dict[str, Any]], bots: Dict[int, str]):
        """
        Initialize game orchestrator.
        
        Args:
            match_id: Match ID for logging
            players: List of player dicts with id, username
            bots: Dict mapping player_id to bot_file_path
        """
        self.match_id = match_id
        self.players = players
        self.bots = bots
        self.num_players = len(players)
        self.game_log = {
            "match_id": match_id,
            "num_players": self.num_players,
            "num_rounds": self.NUM_ROUNDS,
            "start_time": datetime.utcnow().isoformat(),
            "rounds": [],
            "final_state": None
        }
        self.bot_states = {p["id"]: {} for p in players}
        self.player_economies = {p["id"]: 1000 for p in players}  # Initial economy
        
    def get_bot_action(self, player_id: int, game_state: Dict) -> Dict:
        """
        Execute bot code to get action for this player via sandbox.
        
        Args:
            player_id: Player ID
            game_state: Current game state
            
        Returns:
            Action dict with type and target
        """
        bot_file = self.bots.get(player_id)
        if not bot_file:
            return {"type": "NO_OP", "target": -1}
        
        try:
            # Use sandbox if available
            if SANDBOX_AVAILABLE:
                result = run_bot_in_sandbox(
                    bot_file,
                    game_state,
                    timeout=2.0,
                    memory="256m",
                    cpus=0.5
                )
                
                # Handle different response formats
                # Format 1: {"type": "...", "target": ...}
                if "type" in result:
                    action_type = result.get("type", "NO_OP")
                    target = result.get("target", -1)
                # Format 2: {"version": "1.0", "actions": [...]}
                elif "actions" in result:
                    actions = result.get("actions", [])
                    # Find the action for this player_id
                    if player_id < len(actions):
                        player_action = actions[player_id]
                        action_type = player_action.get("type", "NO_OP")
                        target = player_action.get("target", -1)
                    else:
                        action_type = "NO_OP"
                        target = -1
                else:
                    action_type = "NO_OP"
                    target = -1
                
                print(f"[Sandbox] Player {player_id} bot returned: {action_type}")
                return {"type": action_type, "target": target}
            
            # Fallback: Import bot module dynamically
            import importlib.util
            spec = importlib.util.spec_from_file_location(f"bot_{player_id}", bot_file)
            bot_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(bot_module)
            
            # Call bot's get_action function
            if hasattr(bot_module, "get_action"):
                result = bot_module.get_action(game_state)
                # Extract action type and target from result
                action_type = result.get("type", "NO_OP")
                target = result.get("target", -1)
                # For deterministic bot, select a random valid target
                if target == -1 and self.num_players > 1:
                    import random
                    target = random.choice([p for p in range(self.num_players) if p != player_id])
                return {"type": action_type, "target": target}
        except Exception as e:
            print(f"Error executing bot {player_id}: {e}")
        
        return {"type": "NO_OP", "target": -1}
    
    def run_round(self, round_num: int) -> Dict:
        """
        Execute one round of the game.
        
        Args:
            round_num: Current round number (0-indexed)
            
        Returns:
            Round log with all actions and state changes
        """
        round_log = {
            "round": round_num + 1,
            "actions": [],
            "events": []
        }
        
        # Build game state for bot queries
        game_state = {
            "round": round_num + 1,
            "num_players": self.num_players,
            "player_economies": self.player_economies.copy()
        }
        
        # Collect actions from all bots simultaneously
        all_actions = {}
        for player in self.players:
            player_id = player["id"]
            action = self.get_bot_action(player_id, game_state)
            all_actions[player_id] = action
            round_log["actions"].append({
                "player_id": player_id,
                "player_name": player.get("username", f"Player {player_id}"),
                "action": action
            })
        
        # Process actions (simplified for now)
        # In real implementation, this would feed to C++ engine
        events = self._process_actions(all_actions, round_num)
        round_log["events"].extend(events)
        
        # Update player economies (mock implementation)
        for player_id in self.player_economies:
            delta = sum(-50 if all_actions.get(player_id, {}).get("type") != "NO_OP" else 0 for _ in range(1))
            self.player_economies[player_id] = max(100, self.player_economies[player_id] + 50 + delta)
        
        return round_log
    
    def _process_actions(self, actions: Dict, round_num: int) -> List[str]:
        """
        Process all collected actions and update game state.
        
        Args:
            actions: Dict mapping player_id to action
            round_num: Current round
            
        Returns:
            List of event strings
        """
        events = []
        
        # Count action types
        action_counts = {}
        for player_id, action in actions.items():
            action_type = action.get("type", "NO_OP")
            action_counts[action_type] = action_counts.get(action_type, 0) + 1
        
        events.append(f"Round {round_num + 1}: Processed {len(actions)} actions")
        for action_type, count in action_counts.items():
            if action_type != "NO_OP":
                events.append(f"  - {count} {action_type} action(s)")
        
        return events
    
    def run(self) -> Dict:
        """
        Run the full 10-round game using C++ engine with bot actions.
        
        Returns:
            Complete game log with all rounds and final state
        """
        print(f"[Match {self.match_id}] Starting game with {self.num_players} players for {self.NUM_ROUNDS} rounds")
        
        # Change to workspace directory to access engine
        original_dir = os.getcwd()
        workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        try:
            os.chdir(workspace_root)
            
            # Collect bot actions for all rounds
            print(f"[Match {self.match_id}] Collecting bot actions...")
            actions_matrix = self._collect_bot_actions_for_all_rounds()
            
            # Write actions.txt for C++ engine
            self._write_actions_file(actions_matrix)
            
            # Run engine and capture output
            result = subprocess.run(
                [self.ENGINE_PATH],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            output = result.stdout
            print(f"[Match {self.match_id}] Engine output:\n{output}")
            
            # Parse the C++ engine output to extract game state
            game_log = self._parse_engine_output(output)
            game_log["match_id"] = self.match_id
            
            # Add collected actions to each round in the game log
            for round_num, round_actions in enumerate(actions_matrix, 1):
                if round_num <= len(game_log["rounds"]):
                    game_log["rounds"][round_num - 1]["actions"] = round_actions
            
            print(f"[Match {self.match_id}] Game complete! Final rankings:")
            if "final_state" in game_log and "rankings" in game_log["final_state"]:
                for r in game_log["final_state"]["rankings"]:
                    print(f"  Rank {r['rank']}: Player {r['player_id']} with economy {r['economy']}")
            
            self.game_log = game_log
            return game_log
            
        except subprocess.TimeoutExpired:
            print(f"[Match {self.match_id}] Engine execution timed out")
            return self._create_error_log("Engine execution timed out")
        except FileNotFoundError:
            print(f"[Match {self.match_id}] Engine executable not found at {self.ENGINE_PATH}")
            return self._create_error_log("Engine executable not found")
        except Exception as e:
            print(f"[Match {self.match_id}] Error running engine: {e}")
            return self._create_error_log(str(e))
        finally:
            os.chdir(original_dir)
    
    def _collect_bot_actions_for_all_rounds(self) -> list:
        """
        Collect actions from all bots for all rounds.
        Since bots need game state, we'll run them sequentially per round.
        For now, collect actions for each round with a simplified game state.
        
        Returns:
            List of action matrices (one per round)
        """
        all_rounds_actions = []
        
        print(f"[Match {self.match_id}] Bot mapping: {self.bots}")
        
        # Simulate basic game state that evolves
        simulated_state = {
            "round": 0,
            "player_id": 0,
            "players": {
                i: {"economy": 1000, "defense": 0, "manufacturing": 0, "roads": 0}
                for i in range(self.num_players)
            }
        }
        
        for round_num in range(self.NUM_ROUNDS):
            simulated_state["round"] = round_num + 1
            round_actions = []
            
            for player_id in range(self.num_players):
                simulated_state["player_id"] = player_id
                action = self.get_bot_action(player_id, simulated_state)
                print(f"[Match {self.match_id}] Round {round_num+1}, Player {player_id}: {action}")
                round_actions.append(action)
            
            all_rounds_actions.append(round_actions)
        
        return all_rounds_actions
    
    def _write_actions_file(self, actions_matrix: list):
        """
        Write actions to actions.txt file for C++ engine.
        
        Format: One row per player, with NUM_ROUNDS action codes.
        Action codes: 0=BUILD_ROAD, 1=TRADE, 2=INVEST_DEFENSE, 3=INVEST_MANUFACTURING, 4=ATTACK, 5=NO_OP
        
        Args:
            actions_matrix: List of rounds, each containing list of player actions
        """
        # Map action types to C++ enum values
        action_type_map = {
            "BUILD_ROAD": 0,
            "TRADE": 1,
            "INVEST_DEFENSE": 2,
            "INVEST_MANUFACTURING": 3,
            "ATTACK": 4,
            "NO_OP": 5
        }
        
        # Transpose: organize actions by player (rows) across rounds (columns)
        player_actions = [[] for _ in range(self.num_players)]
        
        for round_actions in actions_matrix:
            for player_id, action in enumerate(round_actions):
                action_type = action.get("type", "NO_OP")
                action_code = action_type_map.get(action_type, 5)
                player_actions[player_id].append(action_code)
        
        # Write to actions.txt
        with open("actions.txt", "w") as f:
            for player_id, actions in enumerate(player_actions):
                line = " ".join(str(code) for code in actions)
                f.write(line + "\n")
        
        print(f"[Match {self.match_id}] Wrote {len(player_actions)} player action sequences to actions.txt")
    
    def _parse_engine_output(self, output: str) -> Dict:
        """
        Parse C++ engine output and convert to game log format.
        
        Args:
            output: Raw stdout from C++ engine
            
        Returns:
            Parsed game log dictionary
        """
        game_log = {
            "num_players": self.num_players,
            "num_rounds": self.NUM_ROUNDS,
            "start_time": datetime.utcnow().isoformat(),
            "rounds": [],
            "final_state": None
        }
        
        lines = output.split("\n")
        current_round = None
        player_states = {}
        
        for line in lines:
            # Parse round headers like "--- After Round (round=1) ---"
            round_match = re.search(r"After Round \(round=(\d+)\)", line)
            if round_match:
                round_num = int(round_match.group(1))
                current_round = {
                    "round": round_num,
                    "actions": [],
                    "events": [f"Round {round_num} executed"]
                }
                game_log["rounds"].append(current_round)
            
            # Parse player state lines like "Player 0: economy=800, def=0, mf=0, deg=1"
            player_match = re.search(
                r"Player (\d+): economy=([0-9.]+), def=([0-9.]+), mf=([0-9.]+), deg=([0-9.]+)",
                line
            )
            if player_match:
                player_id = int(player_match.group(1))
                economy = float(player_match.group(2))
                defense = float(player_match.group(3))
                manufacturing = float(player_match.group(4))
                degree = int(player_match.group(5))
                
                player_states[player_id] = {
                    "id": player_id,
                    "economy": economy,
                    "defense": defense,
                    "manufacturing": manufacturing,
                    "roads": degree
                }
        
        # Calculate final rankings from player states
        if player_states:
            rankings = sorted(
                [
                    {
                        "player_id": p["id"],
                        "economy": p["economy"],
                        "rank": 0
                    }
                    for p in player_states.values()
                ],
                key=lambda x: x["economy"],
                reverse=True
            )
            
            for rank, entry in enumerate(rankings, 1):
                entry["rank"] = rank
            
            game_log["final_state"] = {
                "player_economies": {p["id"]: p["economy"] for p in player_states.values()},
                "player_states": player_states,
                "rankings": rankings
            }
        
        game_log["end_time"] = datetime.utcnow().isoformat()
        return game_log
    
    def _create_error_log(self, error_msg: str) -> Dict:
        """Create a minimal game log for error cases."""
        return {
            "match_id": self.match_id,
            "num_players": self.num_players,
            "num_rounds": 0,
            "start_time": datetime.utcnow().isoformat(),
            "end_time": datetime.utcnow().isoformat(),
            "rounds": [],
            "final_state": None,
            "error": error_msg
        }
