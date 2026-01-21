
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_feature(name, role, message, user_name=None):
    print(f"\n--- Testing Feature: {name} ---")
    payload = {
        "user_id": f"test_{role}_curriculum",
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

print("🚀 Verifying Curriculum Knowledge...\n")

# 1. CSE Test
response_1 = test_feature(
    "CSE Subjects", 
    "student", 
    "What subjects are there in CSE?"
)

if response_1 and "Compiler Design" in response_1:
    print("✅ CSE CHECK PASSED.")
else:
    print("⚠️ CSE CHECK WARNING.")

# 2. AIML Test
response_2 = test_feature(
    "AIML Subjects", 
    "student", 
    "Tell me about the AIML curriculum."
)

if response_2 and "Machine Learning" in response_2:
    print("✅ AIML CHECK PASSED.")
else:
    print("⚠️ AIML CHECK WARNING.")
