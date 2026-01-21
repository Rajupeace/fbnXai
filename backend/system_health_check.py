
import requests
import os
import json

def check_service(name, url, expected_status=200):
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == expected_status:
            return True, f"✅ {name}: ONLINE ({url})"
        else:
            return False, f"⚠️ {name}: RESPONDED with {response.status_code}"
    except Exception as e:
        return False, f"❌ {name}: OFFLINE/UNREACHABLE ({e})"

print("\n🔍 INITIATING FULL SYSTEM DIAGNOSTIC...\n")

# 1. Frontend Check (Assuming running on 3000)
fe_ok, fe_msg = check_service("Frontend (React)", "http://localhost:3000")
print(fe_msg)

# 2. Backend Check (Node.js - Port 5000)
# Corrected endpoint to a generic one or root if available, otherwise just check port connectivity
be_ok, be_msg = check_service("Backend API (Node.js)", "http://localhost:5000/api/faculty-stats/stats", 200) 
print(be_msg)

# 3. Database Check (Node.js Fallback/Mongo)
# We check if we can fetch materials
db_ok = False
try:
    mat_res = requests.get("http://localhost:5000/api/materials")
    if mat_res.status_code == 200:
        data = mat_res.json()
        count = len(data) if isinstance(data, list) else 0
        print(f"✅ Main Database: ONLINE (Retrieved {count} materials)")
        db_ok = True
    else:
        print(f"⚠️ Main Database: API Error {mat_res.status_code}")
except:
    print("❌ Main Database: API Unreachable")

# 4. AI Agent Check (Python - Port 8000)
ai_ok, ai_msg = check_service("Vu AI Agent (FastAPI)", "http://localhost:8000/")
print(ai_msg)

# 5. LLM & LangChain Check (via Agent Health)
llm_ok = False
try:
    health_res = requests.get("http://localhost:8000/health") 
    if health_res.status_code == 200:
        health_data = health_res.json()
        components = health_data.get("components", {})
        
        # LLM Status
        llm_status = components.get("llm", "unknown")
        if "healthy" in llm_status:
            print(f"✅ LLM (Gemini): CONNECTED & RESPONDING ({llm_status})")
            llm_ok = True
        else:
            print(f"⚠️ LLM (Gemini): ISSUES DETECTED ({llm_status})")
            
        # Agent DB Status
        mongo_status = components.get("mongodb", "unknown")
        print(f"ℹ️ Agent DB (Mongo): {mongo_status}")
    else:
        print(f"❌ AI Health Check: Failed {health_res.status_code}")
except:
    print("❌ AI Agent Health Endpoint Unreachable")

print("\n" + "="*40)
print("🏁 FINAL SYSTEM STATUS REPORT")
print("="*40)

if fe_ok and be_ok and db_ok and ai_ok and llm_ok:
    print("🟢 SYSTEM STATUS: ALL SYSTEMS OPERATIONAL")
    print("   The Friendly Notebook ecosystem is robust and ready.")
else:
    print("🟡 SYSTEM STATUS: PARTIAL DEGRADATION")
    print("   Some components may be offline or unreachable. Check logs.")
    
print("="*40 + "\n")
