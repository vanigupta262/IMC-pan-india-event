class Route:
    ROAD = "ROAD"
    AIR = "AIR"

    def __init__(self, u: int, v: int, route_type: str):
        self.u = u
        self.v = v
        self.type = route_type

    def connects(self, a: int, b: int) -> bool:
        return (self.u == a and self.v == b) or (self.u == b and self.v == a)
