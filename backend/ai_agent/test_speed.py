
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_speed(role, message):
    print(f"\n--- Testing Speed: {role} ---")
    payload = {
        "user_id": f"speed_test_{role}",
        "role": role,
        "message": message
    }
    
    start_time = time.time()
    try:
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            print(f"⏱️ Response Time: {duration:.2f}s")
            return duration
        else:
            print(f"❌ Error {response.status_code}")
            return 999
    except Exception as e:
        print(f"❌ Exception: {e}")
        return 999

print("🚀 Verifying AI Speed (Model: gemini-1.5-flash)...\n")

times = []
times.append(test_speed("student", "Hello, quick check!"))
times.append(test_speed("faculty", "Quick subject plan idea."))
times.append(test_speed("admin", "Quick status update."))

avg_time = sum(times) / len(times)
print(f"\n⚡ Average Response Time: {avg_time:.2f}s")

if avg_time < 5.0:
    print("✅ SPEED CHECK PASSED: Agent is fast.")
else:
    print("⚠️ SPEED CHECK WARNING: Still a bit slow (>5s avg).")
