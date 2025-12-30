from engine.actions import ActionType
from engine.config import (
    ATTACK_FACTOR, DEFENSE_LIMIT, ROAD_BUILD_COST_FACTOR,
    TRADE_ROAD_MAX_FACTOR, TRADE_ROAD_MIN_FACTOR,
    TRADE_AIR_MAX_FACTOR, TRADE_AIR_MIN_FACTOR,
    INVEST_COST_FACTOR, INVEST_GAIN,
    DEFENSE_DECAY, MANUFACTURING_DECAY,
    MAX_DEFENSE, MAX_MANUFACTURING
)

def resolve_round(state, actions_by_player):
    state.round += 1
    _resolve_decay(state)
    
    # Record history (obscured)
    round_history = {}
    for pid, actions in actions_by_player.items():
        obscured_actions = []
        for a in actions:
            action_data = {"type": a.type.value, "target": a.target}
            if a.type in [ActionType.INVEST_DEFENSE, ActionType.INVEST_MANUFACTURING]:
                action_data["type"] = "INVEST"
            obscured_actions.append(action_data)
        round_history[pid] = obscured_actions
    state.history.append(round_history)

    # Check for Black Swan
    if state.round == state.black_swan_round:
        _resolve_black_swan(state)
    
    _resolve_destroy(state, actions_by_player)
    _resolve_attack(state, actions_by_player)
    _resolve_trade(state, actions_by_player)
    _resolve_build(state, actions_by_player)
    _resolve_invest(state, actions_by_player)

def _resolve_black_swan(state):
    """
    One of the round (chosen randomly from 25 to 75) will be a black swan event. 
    All roads will be destroyed. A hidden superpower attacks all countries. 
    For every player_i , change = −0.4 × Ei × (0.85 − Defi).
    """
    state.roads.clear()
    for country in state.countries.values():
        loss = 0.4 * country.economy * (DEFENSE_LIMIT - country.defense)
        country.economy -= loss

def _resolve_destroy(state, actions_by_player):
    roads_to_remove = set()
    for i, actions in actions_by_player.items():
        for action in actions:
            if action.type == ActionType.DESTROY:
                j = action.target
                if state.has_road(i, j):
                    roads_to_remove.add(tuple(sorted((i, j))))
    
    for u, v in roads_to_remove:
        state.remove_road(u, v)

def _resolve_attack(state, actions_by_player):
    """
    Attack (can be done via road only).
    If player i attacks player j:
    Attacker gain: +0.4 * Ej * (0.85 - Defj)
    Attackee loss: -0.4 * Ej * (0.85 - Defj)
    Road is destroyed.
    """
    roads_to_remove = set()
    changes = {cid: 0.0 for cid in state.countries}

    # First pass: calculate all changes based on initial state
    for i, actions in actions_by_player.items():
        for action in actions:
            if action.type == ActionType.ATTACK:
                j = action.target
                if state.has_road(i, j):
                    cj = state.countries[j]
                    amount = ATTACK_FACTOR * cj.economy * (DEFENSE_LIMIT - cj.defense)
                    changes[i] += amount
                    changes[j] -= amount
                    roads_to_remove.add(tuple(sorted((i, j))))

    # Second pass: apply changes
    for cid, change in changes.items():
        state.countries[cid].economy += change

    for u, v in roads_to_remove:
        state.remove_road(u, v)

def _resolve_trade(state, actions_by_player):
    """
    ΔEi = (Pool / 2) * 1/(di + 1)
    Road trade pool: 0.1*Emax - 0.05*Emin
    Air trade pool: 0.1*Emax - 0.1*Emin
    """
    processed = set()
    for i, actions_i in actions_by_player.items():
        for action in actions_i:
            if action.type != ActionType.TRADE:
                continue
            j = action.target
            pair = tuple(sorted((i, j)))
            if pair in processed:
                continue

            # check reciprocal
            actions_j = actions_by_player.get(j, [])
            if any(a.type == ActionType.TRADE and a.target == i for a in actions_j):
                ci = state.countries[i]
                cj = state.countries[j]
                emax = max(ci.economy, cj.economy)
                emin = min(ci.economy, cj.economy)
                
                if state.has_road(i, j):
                    pool = TRADE_ROAD_MAX_FACTOR * emax - TRADE_ROAD_MIN_FACTOR * emin
                else:
                    pool = TRADE_AIR_MAX_FACTOR * emax - TRADE_AIR_MIN_FACTOR * emin
                
                # Gain for i
                di = state.get_degree(i)
                ci.economy += (pool / 2) * (1.0 / (di + 1))
                
                # Gain for j
                dj = state.get_degree(j)
                cj.economy += (pool / 2) * (1.0 / (dj + 1))
                
                processed.add(pair)

def _resolve_build(state, actions_by_player):
    """
    cost to build = 0.2 * min(Ei,Ej) * (1-mf_i) per player
    """
    processed = set()
    for i, actions_i in actions_by_player.items():
        for action in actions_i:
            if action.type != ActionType.BUILD:
                continue
            j = action.target
            pair = tuple(sorted((i, j)))
            if pair in processed or state.has_road(i, j):
                continue

            # check reciprocal
            actions_j = actions_by_player.get(j, [])
            if any(a.type == ActionType.BUILD and a.target == i for a in actions_j):
                ci = state.countries[i]
                cj = state.countries[j]
                base = min(ci.economy, cj.economy)
                
                cost_i = ROAD_BUILD_COST_FACTOR * base * (1.0 - ci.manufacturing)
                cost_j = ROAD_BUILD_COST_FACTOR * base * (1.0 - cj.manufacturing)
                
                ci.economy -= cost_i
                cj.economy -= cost_j
                state.add_road(i, j)
                processed.add(pair)

def _resolve_invest(state, actions_by_player):
    """
    0.1 * Ei can be spent in defence/manufacturing to get 1 unit.
    """
    for i, actions in actions_by_player.items():
        ci = state.countries[i]
        for action in actions:
            if action.type == ActionType.INVEST_DEFENSE:
                cost = INVEST_COST_FACTOR * ci.economy
                ci.economy -= cost
                ci.defense = min(MAX_DEFENSE, ci.defense + INVEST_GAIN)
            elif action.type == ActionType.INVEST_MANUFACTURING:
                cost = INVEST_COST_FACTOR * ci.economy
                ci.economy -= cost
                ci.manufacturing = min(MAX_MANUFACTURING, ci.manufacturing + INVEST_GAIN)

def _resolve_decay(state):
    for ci in state.countries.values():
        ci.defense = max(0.0, ci.defense - DEFENSE_DECAY)
        ci.manufacturing = max(0.0, ci.manufacturing - MANUFACTURING_DECAY)
