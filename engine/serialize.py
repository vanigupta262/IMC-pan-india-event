def serialize_state(state):
    return {
        "round": state.round,
        "black_swan_round": state.black_swan_round,
        "countries": {
            cid: {
                "economy": c.economy,
                "defense": c.defense,
                "manufacturing": c.manufacturing
            }
            for cid, c in state.countries.items()
        },
        "roads": list(state.roads),
        "history": state.history
    }
