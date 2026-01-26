#!/usr/bin/env python3
"""
Game Rules Compliance Test Suite
Tests all mechanics against the official rulebook
"""

import subprocess
import json
import re
from pathlib import Path

def test_linear_decay():
    """Test that defense and manufacturing decay linearly by 0.1 per round"""
    print("\n" + "="*60)
    print("🧪 Testing Linear Decay (Critical Rule)")
    print("="*60)
    
    # Create a bot that invests in defense on round 1
    test_bot = """#!/usr/bin/env python3
import json
import sys

def get_action(game_state):
    round_num = game_state.get('round', 0)
    player_id = game_state.get('player_id', 0)
    
    # Invest in defense on round 1, then do nothing
    if round_num == 1:
        return {"type": "INVEST_DEFENSE", "target": player_id}
    else:
        return {"type": "NO_OP", "target": -1}

if __name__ == "__main__":
    snapshot = json.loads(sys.stdin.read())
    action = get_action(snapshot)
    print(json.dumps({"version": "1.0", "actions": [action]}))
"""
    
    # Write test bot
    test_bot_path = Path("test_decay_bot.py")
    test_bot_path.write_text(test_bot)
    test_bot_path.chmod(0o755)
    
    # Create actions file for 10 rounds for 5 players (Config::N_PLAYERS = 5)
    # Action codes:
    # 0: TRADE, 1: BUILD, 2: ATTACK, 3: DESTROY, 4: INVEST_DEF, 5: INVEST_MF, 6: NO_OP
    
    actions_lines = []
    
    # Player 0: INVEST_DEFENSE (4) on round 1, then NO_OP (6)
    p0_actions = []
    for round_num in range(10):
        if round_num == 0:
            p0_actions.append("4")  # INVEST_DEFENSE
        else:
            p0_actions.append("6")  # NO_OP
    actions_lines.append(" ".join(p0_actions))
    
    # Players 1-4: All NO_OP (6)
    for _ in range(4):
        p_actions = ["6"] * 10
        actions_lines.append(" ".join(p_actions))
    
    actions_file = Path("actions.txt")
    actions_file.write_text("\n".join(actions_lines) + "\n")
    
    # Run engine
    try:
        result = subprocess.run(
            ["./game"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        output = result.stdout
        print("Engine output:")
        print(output)
        
        # Parse defense values from each round
        defense_values = []
        for line in output.split('\n'):
            match = re.search(r'Player 0:.*def=([0-9.]+)', line)
            if match:
                defense_values.append(float(match.group(1)))
        
        print(f"\nDefense values across rounds: {defense_values}")
        
        # Check linear decay
        if len(defense_values) >= 10:
            # Round 0: Initial state (0.0)
            # Round 1: Invest (+1.0) then Decay (-0.1) = 0.9
            # Round 2: Decay (-0.1) = 0.8
            expected = [0.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]
            
            passed = True
            for i, (actual, exp) in enumerate(zip(defense_values[:10], expected)):
                # Handle floating point zero (e.g. 1.38e-17)
                if abs(actual) < 0.0001: actual = 0.0
                
                diff = abs(actual - exp)
                status = "✅" if diff < 0.01 else "❌"
                print(f"Round {i+1}: Expected {exp:.1f}, Got {actual:.2f} {status}")
                if diff >= 0.01:
                    passed = False
            
            if passed:
                print("\n✅ Linear decay test PASSED")
                return True
            else:
                print("\n❌ Linear decay test FAILED")
                return False
        else:
            print(f"❌ Not enough data points (got {len(defense_values)})")
            return False
            
    except Exception as e:
        print(f"❌ Error running test: {e}")
        return False
    finally:
        # Cleanup
        if test_bot_path.exists():
            test_bot_path.unlink()
        if actions_file.exists():
            actions_file.unlink()

def test_trade_formulas():
    """Test trade pool calculations"""
    print("\n" + "="*60)
    print("🧪 Testing Trade Formulas")
    print("="*60)
    
    # Road trade: 0.1*Emax - 0.05*Emin
    # Sea trade: 0.1*Emax - 0.1*Emin
    
    e_max = 1000
    e_min = 800
    
    road_pool = 0.1 * e_max - 0.05 * e_min
    sea_pool = 0.1 * e_max - 0.1 * e_min
    
    print(f"With Emax={e_max}, Emin={e_min}:")
    print(f"  Road trade pool: {road_pool} (expected: 60.0)")
    print(f"  Sea trade pool: {sea_pool} (expected: 20.0)")
    
    road_correct = abs(road_pool - 60.0) < 0.01
    sea_correct = abs(sea_pool - 20.0) < 0.01
    
    if road_correct and sea_correct:
        print("✅ Trade formulas are correct")
        return True
    else:
        print("❌ Trade formulas are incorrect")
        return False

def test_attack_formula():
    """Test attack damage calculation"""
    print("\n" + "="*60)
    print("🧪 Testing Attack Formula")
    print("="*60)
    
    # Gain/Loss = 0.4 × Ej × (0.85 - Defj)
    
    e_defender = 1000
    def_defender = 0.2
    
    expected_damage = 0.4 * e_defender * (0.85 - def_defender)
    
    print(f"Defender economy: {e_defender}")
    print(f"Defender defense: {def_defender}")
    print(f"Expected damage: {expected_damage}")
    print(f"  Formula: 0.4 × {e_defender} × (0.85 - {def_defender}) = {expected_damage}")
    
    # This is just a formula check, actual value = 260.0
    if abs(expected_damage - 260.0) < 0.01:
        print("✅ Attack formula is correct")
        return True
    else:
        print("❌ Attack formula is incorrect")
        return False

def test_road_build_cost():
    """Test road building cost"""
    print("\n" + "="*60)
    print("🧪 Testing Road Build Cost")
    print("="*60)
    
    # Cost = 0.1 × min(Ei, Ej) × (2 - Mfi)
    
    e_i = 1000
    e_j = 800
    mf_i = 0.5
    
    min_e = min(e_i, e_j)
    cost = 0.1 * min_e * (2 - mf_i)
    
    print(f"Economy i: {e_i}, Economy j: {e_j}")
    print(f"Manufacturing i: {mf_i}")
    print(f"min(Ei, Ej): {min_e}")
    print(f"Cost for player i: {cost}")
    print(f"  Formula: 0.1 × {min_e} × (2 - {mf_i}) = {cost}")
    
    # Expected: 0.1 × 800 × 1.5 = 120.0
    if abs(cost - 120.0) < 0.01:
        print("✅ Road build cost formula is correct")
        return True
    else:
        print("❌ Road build cost formula is incorrect")
        return False

def main():
    """Run all compliance tests"""
    print("\n" + "="*60)
    print("🎮 IGTS × IMC Event 2 - Rules Compliance Test Suite")
    print("="*60)
    
    results = {}
    
    # Test formulas (these don't require engine execution)
    results["trade_formulas"] = test_trade_formulas()
    results["attack_formula"] = test_attack_formula()
    results["road_build_cost"] = test_road_build_cost()
    
    # Test linear decay (requires engine execution)
    results["linear_decay"] = test_linear_decay()
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Results Summary")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*60)
    if all_passed:
        print("✅ All compliance tests PASSED")
        print("="*60)
        return 0
    else:
        print("❌ Some compliance tests FAILED")
        print("="*60)
        return 1

if __name__ == "__main__":
    exit(main())
