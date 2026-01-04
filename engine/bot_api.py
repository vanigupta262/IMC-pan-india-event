def build_bot_state(state, self_id):
    countries_data = {}
    for cid, c in state.countries.items():
        data = {
            "economy": c.economy,
        }
        # Hidden info only for self
        if cid == self_id:
            data["defense"] = c.defense
            data["manufacturing"] = c.manufacturing
        else:
            data["defense"] = None # Hidden
            data["manufacturing"] = None # Hidden
        
        countries_data[cid] = data

    return {
        "self_id": self_id,
        "round": state.round,
        "countries": countries_data,
        "roads": list(state.roads),
        "history": state.history
    }
