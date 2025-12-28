For each bot, we give:

state = {
    "self_id": int,
    "round": int,
    "countries": {
        id: {
            "economy": float,
            "defense": float,
            "manufacturing": float
        }
    },
    "roads": [(i, j), ...]
}