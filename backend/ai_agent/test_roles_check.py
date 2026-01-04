
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_chat(role, message):
    output = f"\n--- Testing Role: {role.upper()} ---\n"
    payload = {
        "user_id": f"test_{role}_user",
        "role": role,
        "message": message
    }
    try:
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            ans = response.json().get("response", "")
            output += f"⏱️ Time: {duration:.2f}s\n"
            output += f"🤖 AI Response:\n{ans}\n"
        else:
            output += f"❌ Error {response.status_code}: {response.text}\n"
    except Exception as e:
        output += f"❌ Connection Error: {e}\n"
    return output

full_log = "🚀 Verifying Vu AI Agent responses...\n"

# 1. Student Test
full_log += test_chat("student", "Hello, I am a student.")

# 2. Faculty Test
full_log += test_chat("faculty", "Hello, I am a faculty member.")

# 3. Admin Test
full_log += test_chat("admin", "Hello, I am an admin.")

with open("role_test_output.txt", "w", encoding="utf-8") as f:
    f.write(full_log)

print("Done. Check role_test_output.txt")
