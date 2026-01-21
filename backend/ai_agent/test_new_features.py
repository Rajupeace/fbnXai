
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_feature(name, role, message, user_name=None):
    print(f"\n--- Testing Feature: {name} ---")
    payload = {
        "user_id": f"test_{role}_user_v2",
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

print("🚀 Verifying New Vu AI Features...\n")

# 1. Identity Awareness Test
response_1 = test_feature(
    "Identity Awareness (Name: Bobby)", 
    "student", 
    "Who am I?", 
    user_name="Bobby"
)

if response_1 and "Bobby" in response_1:
    print("✅ IDENTITY CHECK PASSED: Agent knows the name.")
else:
    print("⚠️ IDENTITY CHECK WARNING: Agent did not explicitly mention the name.")

# 2. Navigation Logic Test (Videos)
response_2 = test_feature(
    "Navigation Logic (Videos)", 
    "student", 
    "I want to watch some learning videos."
)

if response_2 and "{{NAVIGATE: advanced-videos}}" in response_2:
    print("✅ NAV CHECK PASSED: Agent provided video navigation tag.")
else:
    print("⚠️ NAV CHECK WARNING: Agent missing navigation tag.")

# 3. Navigation Logic Test (Notes)
response_3 = test_feature(
    "Navigation Logic (Notes)", 
    "student", 
    "Please take me to my semester notes."
)

if response_3 and "{{NAVIGATE: semester-notes}}" in response_3:
    print("✅ NAV CHECK PASSED: Agent provided notes navigation tag.")
else:
    print("⚠️ NAV CHECK WARNING: Agent missing navigation tag.")
