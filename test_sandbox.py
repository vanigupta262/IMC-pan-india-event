#!/usr/bin/env python3
"""
Comprehensive Sandbox Testing Script
Tests Docker sandbox availability and bot execution
"""

import subprocess
import json
import sys
import os
from pathlib import Path

def test_docker_availability():
    """Test if Docker is installed and running"""
    print("=" * 60)
    print("🐳 Testing Docker Availability")
    print("=" * 60)
    
    try:
        result = subprocess.run(["docker", "--version"], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ Docker installed: {result.stdout.strip()}")
            
            # Test if Docker daemon is running
            result = subprocess.run(["docker", "ps"], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                print("✅ Docker daemon is running")
                return True
            else:
                print("❌ Docker daemon not running")
                print(f"   Error: {result.stderr.strip()}")
                return False
        else:
            print("❌ Docker command failed")
            return False
    except FileNotFoundError:
        print("❌ Docker not installed")
        print("   Install with: sudo apt-get install docker.io")
        return False
    except subprocess.TimeoutExpired:
        print("❌ Docker command timed out")
        return False
    except Exception as e:
        print(f"❌ Error checking Docker: {e}")
        return False

def test_docker_image():
    """Test if the sandbox Docker image exists"""
    print("\n" + "=" * 60)
    print("🎯 Testing Docker Image")
    print("=" * 60)
    
    try:
        result = subprocess.run(
            ["docker", "images", "igts-bot-sandbox", "--format", "{{.Repository}}:{{.Tag}}"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0 and result.stdout.strip():
            print(f"✅ Docker image exists: {result.stdout.strip()}")
            return True
        else:
            print("❌ Docker image 'igts-bot-sandbox' not found")
            print("   Build it with: docker build -t igts-bot-sandbox sandbox/")
            return False
    except Exception as e:
        print(f"❌ Error checking Docker image: {e}")
        return False

def build_docker_image():
    """Build the Docker sandbox image"""
    print("\n" + "=" * 60)
    print("🔨 Building Docker Image")
    print("=" * 60)
    
    dockerfile_path = Path("sandbox/Dockerfile")
    if not dockerfile_path.exists():
        print(f"❌ Dockerfile not found at {dockerfile_path}")
        return False
    
    try:
        print("Building igts-bot-sandbox image...")
        result = subprocess.run(
            ["docker", "build", "-t", "igts-bot-sandbox", "sandbox/"],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes
        )
        
        if result.returncode == 0:
            print("✅ Docker image built successfully")
            return True
        else:
            print(f"❌ Docker build failed")
            print(f"   Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("❌ Docker build timed out")
        return False
    except Exception as e:
        print(f"❌ Error building Docker image: {e}")
        return False

def test_sandbox_with_bot():
    """Test sandbox execution with a real bot"""
    print("\n" + "=" * 60)
    print("🤖 Testing Sandbox with Bot")
    print("=" * 60)
    
    # Create test snapshot
    test_snapshot = {
        "version": "1.0",
        "round": 1,
        "player_id": 0,
        "n_players": 2,
        "islands": [
            {"id": 0, "economy": 1000.0, "degree": 0},
            {"id": 1, "economy": 1000.0, "degree": 0}
        ],
        "roads": []
    }
    
    # Test with trader_bot
    bot_path = Path("bots/trader_bot.py")
    if not bot_path.exists():
        print(f"❌ Test bot not found: {bot_path}")
        return False
    
    try:
        from sandbox.sandbox_runner import run_bot_in_sandbox
        
        print(f"Running {bot_path.name} in sandbox...")
        result = run_bot_in_sandbox(
            str(bot_path),
            test_snapshot,
            timeout=10.0,  # Generous timeout for testing
            memory="256m",
            cpus=0.5
        )
        
        print(f"✅ Sandbox execution successful!")
        print(f"   Bot output: {json.dumps(result, indent=2)}")
        
        # Verify output format
        if "actions" in result or "type" in result:
            print("✅ Bot output format is valid")
            return True
        else:
            print("⚠️  Bot output format unexpected")
            return False
            
    except ImportError as e:
        print(f"❌ Cannot import sandbox_runner: {e}")
        return False
    except Exception as e:
        print(f"❌ Sandbox execution failed: {e}")
        return False

def test_bot_direct_execution():
    """Test bot execution without Docker (fallback mode)"""
    print("\n" + "=" * 60)
    print("🐍 Testing Direct Bot Execution (Fallback)")
    print("=" * 60)
    
    # Create test snapshot
    test_snapshot = {
        "version": "1.0",
        "round": 1,
        "player_id": 0,
        "n_players": 2,
        "islands": [],
        "roads": []
    }
    
    bot_path = Path("bots/trader_bot.py")
    if not bot_path.exists():
        print(f"❌ Test bot not found: {bot_path}")
        return False
    
    try:
        # Direct execution via subprocess
        result = subprocess.run(
            ["python3", str(bot_path)],
            input=json.dumps(test_snapshot),
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            output = json.loads(result.stdout.strip())
            print("✅ Direct bot execution successful!")
            print(f"   Bot output: {json.dumps(output, indent=2)}")
            return True
        else:
            print(f"❌ Bot execution failed")
            print(f"   Error: {result.stderr}")
            return False
            
    except json.JSONDecodeError:
        print(f"❌ Bot output is not valid JSON: {result.stdout}")
        return False
    except Exception as e:
        print(f"❌ Direct execution failed: {e}")
        return False

def test_bot_import_execution():
    """Test bot execution via Python import (alternative fallback)"""
    print("\n" + "=" * 60)
    print("📦 Testing Bot Import Execution (Alternative Fallback)")
    print("=" * 60)
    
    test_snapshot = {
        "version": "1.0",
        "round": 1,
        "player_id": 0,
        "n_players": 2,
        "islands": [],
        "roads": []
    }
    
    bot_path = Path("bots/trader_bot.py")
    if not bot_path.exists():
        print(f"❌ Test bot not found: {bot_path}")
        return False
    
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("test_bot", str(bot_path))
        bot_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(bot_module)
        
        if hasattr(bot_module, "get_action"):
            result = bot_module.get_action(test_snapshot)
            print("✅ Bot import execution successful!")
            print(f"   Bot output: {json.dumps(result, indent=2)}")
            return True
        else:
            print("❌ Bot module doesn't have get_action function")
            return False
            
    except Exception as e:
        print(f"❌ Import execution failed: {e}")
        return False

def main():
    """Run all sandbox tests"""
    print("\n" + "="*60)
    print("🧪 IGTS Sandbox Comprehensive Test")
    print("="*60 + "\n")
    
    results = {}
    
    # Test 1: Docker availability
    docker_available = test_docker_availability()
    results["docker_available"] = docker_available
    
    if docker_available:
        # Test 2: Docker image
        image_exists = test_docker_image()
        results["image_exists"] = image_exists
        
        # Test 3: Build image if needed
        if not image_exists:
            print("\n⚠️  Docker image not found. Attempting to build...")
            build_success = build_docker_image()
            results["image_built"] = build_success
            image_exists = build_success
        
        # Test 4: Sandbox execution
        if image_exists:
            sandbox_works = test_sandbox_with_bot()
            results["sandbox_works"] = sandbox_works
    
    # Test 5: Fallback methods (always test these)
    direct_works = test_bot_direct_execution()
    results["direct_execution_works"] = direct_works
    
    import_works = test_bot_import_execution()
    results["import_execution_works"] = import_works
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test}")
    
    print("\n" + "="*60)
    print("💡 Recommendations")
    print("="*60)
    
    if results.get("sandbox_works"):
        print("✅ Use Docker sandbox for maximum security")
        print("   Set SANDBOX_AVAILABLE = True in game_orchestrator.py")
    elif results.get("import_execution_works"):
        print("⚠️  Docker not available, using import fallback")
        print("   Set SANDBOX_AVAILABLE = False in game_orchestrator.py")
        print("   ⚠️  WARNING: Bots run with full system access (security risk)")
    elif results.get("direct_execution_works"):
        print("⚠️  Use subprocess execution as fallback")
        print("   Modify game_orchestrator.py to use subprocess instead")
    else:
        print("❌ No execution method works! Fix bot scripts or Python environment")
    
    print("="*60 + "\n")
    
    return results

if __name__ == "__main__":
    results = main()
    
    # Exit with error if critical tests fail
    if not (results.get("sandbox_works") or results.get("import_execution_works") or results.get("direct_execution_works")):
        sys.exit(1)
