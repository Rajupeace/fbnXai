
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_feature(name, role, message):
    print(f"\n--- Testing Feature: {name} ---")
    payload = {
        "user_id": f"test_{role}_focus",
        "role": role,
        "message": message
    }
    try:
        start_time = time.time()
        print(f"Role: {role} | Q: {message}")
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            ans = response.json().get("response", "")
            print(f"⏱️ Time: {duration:.2f}s")
            print(f"🤖 AI Response:\n{ans}\n")
            return ans
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return None

print("🚀 Verifying Explicit Role Focus...\n")

# 1. Student (Educational Only)
test_feature(
    "Student Educational Focus", 
    "student", 
    "How do I solve linear equations?"
)

# 2. Faculty (Subject Plans)
test_feature(
    "Faculty Planning Focus", 
    "faculty", 
    "I need a subject plan for Data Structures."
)

# 3. Admin (Innovation & Tips)
test_feature(
    "Admin Innovation Focus", 
    "admin", 
    "Give me some new ideas for the campus and student productivity tips."
)
