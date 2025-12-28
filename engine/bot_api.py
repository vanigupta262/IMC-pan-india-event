def build_bot_state(state, self_id):
    return {
        "self_id": self_id,
        "round": state.round,
        "countries": {
            cid: {
                "economy": c.economy,
                "defense": c.defense,
                "manufacturing": c.manufacturing
            }
            for cid, c in state.countries.items()
        },
        "roads": list(state.roads)
    }
