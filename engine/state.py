from engine.country import Country

class GameState:
    def __init__(self, n_players: int):
        self.round = 0
        self.countries = {i: Country(i) for i in range(n_players)}
        self.roads = set()  # set of (u, v) tuples

    def has_road(self, u: int, v: int) -> bool:
        return (u, v) in self.roads or (v, u) in self.roads

    def add_road(self, u: int, v: int):
        self.roads.add((u, v))

    def remove_road(self, u: int, v: int):
        self.roads.discard((u, v))
        self.roads.discard((v, u))
