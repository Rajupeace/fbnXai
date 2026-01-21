
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_feature(name, role, message, user_name=None):
    print(f"\n--- Testing Feature: {name} ---")
    payload = {
        "user_id": f"test_{role}_gen_knowledge",
        "role": role,
        "message": message
    }
    if user_name:
        payload["user_name"] = user_name
        
    try:
        start_time = time.time()
        print(f"Sending Payload: {json.dumps(payload)}")
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

print("🚀 Verifying Gemini General Knowledge...\n")

# 1. General Knowledge Test (Physics)
response_1 = test_feature(
    "General Knowledge (Physics)", 
    "student", 
    "Explain Quantum Entanglement simply."
)

if response_1 and "Check with admin" not in response_1:
    print("✅ GK CHECK PASSED: Agent answered using general knowledge.")
else:
    print("⚠️ GK CHECK WARNING: Agent might be restricted.")

# 2. General Knowledge Test (Coding)
response_2 = test_feature(
    "General Knowledge (Coding)", 
    "faculty", 
    "Write a Python function to check for prime numbers."
)

if response_2 and "def is_prime" in response_2:
    print("✅ CODING CHECK PASSED: Agent provided code.")
else:
    print("⚠️ CODING CHECK WARNING: Agent did not provide clear code.")
