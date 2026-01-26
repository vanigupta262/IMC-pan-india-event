#!/usr/bin/env python3
"""
Black Swan Event Implementation
Per rulebook: Randomly occurs between 1/4 and 3/4 of total rounds
- Destroys 50% of roads randomly
- Applies economy changes based on ranking (for 5 players)
"""

import random
from typing import List, Dict, Tuple


class BlackSwanEvent:
    """Configurable Black Swan event for IGTS matches."""
    
    def __init__(self, num_rounds: int, enabled: bool = True, seed: int = None):
        """
        Initialize Black Swan event.
        
        Args:
            num_rounds: Total rounds in the game
            enabled: Whether Black Swan is enabled for this match
            seed: Random seed for reproducibility (optional)
        """
        self.enabled = enabled
        self.num_rounds = num_rounds
        
        if seed is not None:
            random.seed(seed)
        
        if self.enabled:
            # Event occurs between 1/4 and 3/4 of total rounds
            min_round = num_rounds // 4
            max_round = (3 * num_rounds) // 4
            self.event_round = random.randint(min_round, max_round)
        else:
            self.event_round = -1  # Never triggers
        
        self.has_occurred = False
    
    def should_trigger(self, current_round: int) -> bool:
        """Check if Black Swan should trigger this round."""
        if not self.enabled or self.has_occurred:
            return False
        return current_round == self.event_round
    
    def destroy_roads_randomly(self, roads: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        """
        Destroy 50% of roads randomly.
        
        Args:
            roads: List of road tuples (island_a, island_b)
            
        Returns:
            List of roads that survived
        """
        surviving_roads = []
        destroyed_count = 0
        
        for road in roads:
            if random.random() > 0.5:  # 50% chance to DESTROY
                destroyed_count += 1
            else:
                surviving_roads.append(road)
        
        print(f"[Black Swan] Destroyed {destroyed_count}/{len(roads)} roads")
        return surviving_roads
    
    def apply_economy_changes(self, player_economies: Dict[int, float]) -> Dict[int, float]:
        """
        Apply economy changes based on ranking.
        
        Per rulebook (5 players):
        - Rank 1, 5: -20%
        - Rank 2, 4: 0%
        - Rank 3: +20%
        
        Args:
            player_economies: Dict of {player_id: economy}
            
        Returns:
            Dict of {player_id: delta_economy}
        """
        # Sort players by economy (descending)
        rankings = sorted(player_economies.items(), key=lambda x: x[1], reverse=True)
        
        changes = {}
        num_players = len(rankings)
        
        for rank_idx, (player_id, economy) in enumerate(rankings):
            rank = rank_idx + 1  # 1-indexed rank
            
            if num_players == 5:
                # Official rulebook for 5 players
                if rank in [1, 5]:
                    changes[player_id] = economy * -0.20  # -20%
                elif rank in [2, 4]:
                    changes[player_id] = 0.0  # 0%
                elif rank == 3:
                    changes[player_id] = economy * 0.20  # +20%
            else:
                # Generalized for other player counts
                # Top and bottom players suffer, middle players benefit
                if rank == 1 or rank == num_players:
                    changes[player_id] = economy * -0.20
                elif rank == (num_players + 1) // 2:  # Middle player
                    changes[player_id] = economy * 0.20
                else:
                    changes[player_id] = 0.0
        
        print(f"[Black Swan] Economy changes by rank:")
        for rank_idx, (player_id, _) in enumerate(rankings):
            rank = rank_idx + 1
            delta = changes[player_id]
            pct = (delta / player_economies[player_id] * 100) if player_economies[player_id] > 0 else 0
            print(f"  Rank {rank} (Player {player_id}): {delta:+.1f} ({pct:+.1f}%)")
        
        return changes
    
    def trigger(self, roads: List[Tuple[int, int]], 
                player_economies: Dict[int, float]) -> Tuple[List[Tuple[int, int]], Dict[int, float]]:
        """
        Trigger the Black Swan event.
        
        Args:
            roads: Current roads in the game
            player_economies: Current player economies
            
        Returns:
            Tuple of (surviving_roads, economy_deltas)
        """
        if not self.enabled:
            return roads, {pid: 0.0 for pid in player_economies}
        
        print(f"\n{'='*60}")
        print(f"⚠️  BLACK SWAN EVENT TRIGGERED - Round {self.event_round}")
        print(f"{'='*60}")
        
        # Destroy roads
        surviving_roads = self.destroy_roads_randomly(roads)
        
        # Apply economy changes
        economy_deltas = self.apply_economy_changes(player_economies)
        
        self.has_occurred =True
        
        print(f"{'='*60}\n")
        
        return surviving_roads, economy_deltas
    
    def get_info(self) -> Dict:
        """Get Black Swan event information."""
        return {
            "enabled": self.enabled,
            "event_round": self.event_round if self.enabled else None,
            "has_occurred": self.has_occurred,
            "total_rounds": self.num_rounds
        }


# Example usage
if __name__ == "__main__":
    # Test Black Swan
    black_swan = BlackSwanEvent(num_rounds=100, enabled=True, seed=42)
    
    print(f"Black Swan Info: {black_swan.get_info()}")
    print(f"Will trigger at round: {black_swan.event_round}")
    
    # Simulate roads
    test_roads = [(0, 1), (1, 2), (2, 3), (3, 4), (0, 4)]
    
    # Simulate economies
    test_economies = {
        0: 1500.0,  # Rank 1
        1: 1200.0,  # Rank 2
        2: 1000.0,  # Rank 3
        3: 800.0,   # Rank 4
        4: 500.0    # Rank 5
    }
    
    # Trigger event
    if black_swan.should_trigger(black_swan.event_round):
        surviving_roads, economy_changes = black_swan.trigger(test_roads, test_economies)
        
        print(f"\nSurviving roads: {surviving_roads}")
        print(f"\nEconomy changes: {economy_changes}")
