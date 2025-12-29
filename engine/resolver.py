from engine.actions import ActionType
from engine.config import ATTACK_FACTOR, DEFENSE_FACTOR, ROAD_BUILD_COST
from engine.config import TRADE_POOL_FACTOR, AIR_TRADE_PENALTY

def resolve_round(state, actions_by_player):
    state.round += 1
    _resolve_destroy(state, actions_by_player)
    _resolve_attack(state, actions_by_player)
    _resolve_trade(state, actions_by_player)
    _resolve_build(state, actions_by_player)
    _resolve_decay(state)

def _resolve_destroy(state, actions_by_player):
    """
    Destroy roads unilaterally.
    DESTROY has highest priority.
    """
    roads_to_remove = set()

    for i, actions in actions_by_player.items():
        for action in actions:
            if action.type != ActionType.DESTROY:
                continue

            j = action.target

            if state.has_road(i, j):
                roads_to_remove.add((i, j))

    for u, v in roads_to_remove:
        state.remove_road(u, v)


def _resolve_attack(state, actions_by_player):
    """
    Handle unilateral attacks.
    Attack only succeeds if a road exists.
    Road is destroyed after attack.
    """
    roads_to_remove = set()

    for attacker_id, actions in actions_by_player.items():
        attacker = state.countries[attacker_id]

        for action in actions:
            if action.type != ActionType.ATTACK:
                continue

            defender_id = action.target

            # road must exist
            if not state.has_road(attacker_id, defender_id):
                continue

            defender = state.countries[defender_id]

            # compute damage
            damage = (
                ATTACK_FACTOR
                * defender.economy
                * (DEFENSE_FACTOR - defender.defense)
            )

            # apply economy transfer
            attacker.economy += damage
            defender.economy -= damage

            # mark road for removal
            roads_to_remove.add((attacker_id, defender_id))

    # remove roads after processing all attacks
    for u, v in roads_to_remove:
        state.remove_road(u, v)


def _resolve_trade(state, actions_by_player):
    """
    Handle bilateral trade.
    Prefer road trade if road exists, else allow air trade.
    """
    processed = set()

    for i, actions_i in actions_by_player.items():
        for action in actions_i:
            if action.type != ActionType.TRADE:
                continue

            j = action.target

            if (j, i) in processed:
                continue

            # reciprocal trade required
            actions_j = actions_by_player.get(j, [])
            reciprocal = any(
                a.type == ActionType.TRADE and a.target == i
                for a in actions_j
            )

            if not reciprocal:
                continue

            ci = state.countries[i]
            cj = state.countries[j]

            base = min(ci.economy, cj.economy)

            if state.has_road(i, j):
                gain = TRADE_POOL_FACTOR * base
            else:
                gain = AIR_TRADE_PENALTY * TRADE_POOL_FACTOR * base

            ci.economy += gain
            cj.economy += gain

            processed.add((i, j))

def _resolve_build(state, actions_by_player):
    """
    Build a road between i and j if:
    - i wants to build with j
    - j wants to build with i
    - no road already exists
    """
    built = set()  # to avoid double-processing

    for i, actions_i in actions_by_player.items():
        for action in actions_i:
            if action.type != ActionType.BUILD:
                continue

            j = action.target

            # avoid double counting (i,j) and (j,i)
            if (j, i) in built:
                continue

            # check reciprocal build
            actions_j = actions_by_player.get(j, [])
            reciprocal = any(
                a.type == ActionType.BUILD and a.target == i
                for a in actions_j
            )

            if not reciprocal:
                continue

            # check road does not already exist
            if state.has_road(i, j):
                continue

            # apply cost (simple version)
            ci = state.countries[i]
            cj = state.countries[j]

            cost_i = ROAD_BUILD_COST * min(ci.economy, cj.economy)
            cost_j = ROAD_BUILD_COST * min(ci.economy, cj.economy)

            ci.economy -= cost_i
            cj.economy -= cost_j

            state.add_road(i, j)
            built.add((i, j))
            
def _resolve_decay(state): 
    pass
