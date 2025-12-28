from engine.config import START_ECONOMY

class Country:
    def __init__(self, cid: int):
        self.id = cid
        self.economy = START_ECONOMY
        self.defense = 0.0
        self.manufacturing = 0.0

    def __repr__(self):
        return f"Country({self.id}, E={self.economy:.2f})"
