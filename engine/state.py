import random
from engine.country import Country
from engine.config import BLACK_SWAN_START, BLACK_SWAN_END, SEED

class GameState:
    def __init__(self, n_players: int):
        self.round = 0
        self.countries = {i: Country(i) for i in range(n_players)}
        self.roads = set()  # set of (u, v) tuples where u < v
        self.history = []   # list of round summaries
        
        # Pre-determine black swan round
        rng = random.Random(SEED)
        self.black_swan_round = rng.randint(BLACK_SWAN_START, BLACK_SWAN_END)

    def has_road(self, u: int, v: int) -> bool:
        u, v = (u, v) if u < v else (v, u)
        return (u, v) in self.roads

    def add_road(self, u: int, v: int):
        u, v = (u, v) if u < v else (v, u)
        self.roads.add((u, v))

    def remove_road(self, u: int, v: int):
        u, v = (u, v) if u < v else (v, u)
        self.roads.discard((u, v))

    def get_degree(self, cid: int) -> int:
        count = 0
        for u, v in self.roads:
            if u == cid or v == cid:
                count += 1
        return count
