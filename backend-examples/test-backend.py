# Test script to verify your backend works

import requests
import base64
import json

# Configuration
BACKEND_URL = "http://localhost:8000"

def test_health():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/health")
        print("Health Check:", response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_send_task():
    """Test sending a voice task"""
    try:
        # Create fake audio data
        fake_audio = b"fake audio data for testing"
        audio_base64 = base64.b64encode(fake_audio).decode('utf-8')
        
        data = {
            "voiceData": audio_base64,
            "format": "wav",
            "timestamp": "2024-01-15T10:30:00Z"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/send-task", json=data)
        print("Send Task:", response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"Send task failed: {e}")
        return False

def test_camera_wrist():
    """Test wrist camera"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/camera/wrist")
        result = response.json()
        print("Wrist Camera:", {
            "success": result.get("success"),
            "has_image": "imageData" in result,
            "error": result.get("error")
        })
        return response.status_code == 200
    except Exception as e:
        print(f"Wrist camera failed: {e}")
        return False

def test_camera_top():
    """Test top camera"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/camera/top")
        result = response.json()
        print("Top Camera:", {
            "success": result.get("success"),
            "has_image": "imageData" in result,
            "error": result.get("error")
        })
        return response.status_code == 200
    except Exception as e:
        print(f"Top camera failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Backend APIs...")
    print("-" * 40)
    
    # Run all tests
    tests = [
        ("Health Check", test_health),
        ("Send Task", test_send_task),
        ("Wrist Camera", test_camera_wrist),
        ("Top Camera", test_camera_top)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        success = test_func()
        results.append((test_name, success))
    
    print("\n" + "=" * 40)
    print("Test Results:")
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name}: {status}")
