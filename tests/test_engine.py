import pytest
from engine.state import GameState
from engine.actions import Action, ActionType
from engine.resolver import resolve_round
from engine.config import START_ECONOMY

def test_trade_formula():
    state = GameState(2)
    # Give them some economy
    state.countries[0].economy = 100
    state.countries[1].economy = 200
    
    # di = 0 for both
    # emax = 200, emin = 100
    # Air trade pool: 0.1 * 200 - 0.1 * 100 = 20 - 10 = 10
    # Gain for each: (10 / 2) * (1 / (0 + 1)) = 5
    
    actions = {
        0: [Action(ActionType.TRADE, 1)],
        1: [Action(ActionType.TRADE, 0)]
    }
    
    resolve_round(state, actions)
    
    assert state.countries[0].economy == 105
    assert state.countries[1].economy == 205

def test_build_formula():
    state = GameState(2)
    state.countries[0].economy = 100
    state.countries[1].economy = 100
    state.countries[0].manufacturing = 0.6 # Decays to 0.5 at round start
    
    # After decay: manufacturing = 0.5
    # cost_i = 0.2 * 100 * (1 - 0.5) = 10
    # cost_j = 0.2 * 100 * (1 - 0) = 20
    
    actions = {
        0: [Action(ActionType.BUILD, 1)],
        1: [Action(ActionType.BUILD, 0)]
    }
    
    resolve_round(state, actions)
    
    assert state.has_road(0, 1)
    assert state.countries[0].economy == 90
    assert state.countries[1].economy == 80

def test_attack_and_destroy():
    state = GameState(2)
    state.add_road(0, 1)
    state.countries[1].defense = 0.6 # Decays to 0.5 at round start
    
    # After decay: defense = 0.5
    # Attack gain = 0.4 * 100 * (0.85 - 0.5) = 40 * 0.35 = 14
    # Attacker (0) economy: 100 + 14 = 114
    # Defender (1) economy: 100 - 14 = 86
    
    actions = {
        0: [Action(ActionType.ATTACK, 1)]
    }
    
    resolve_round(state, actions)
    
    assert not state.has_road(0, 1)
    assert state.countries[0].economy == 114
    assert state.countries[1].economy == 86

def test_invest():
    state = GameState(1)
    state.countries[0].economy = 100
    
    # cost = 0.1 * 100 = 10
    # gain = 1.0 (capped at 1.0)
    
    actions = {
        0: [Action(ActionType.INVEST_DEFENSE, -1)]
    }
    
    resolve_round(state, actions)
    
    assert state.countries[0].economy == 90
    assert state.countries[0].defense == 1.0 # 0 + 1.0
    
    # Next round decay
    resolve_round(state, {})
    assert state.countries[0].defense == 0.9
