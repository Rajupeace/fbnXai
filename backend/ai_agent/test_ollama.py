
import requests

try:
    resp = requests.get("http://localhost:11434/api/tags", timeout=5)
    if resp.status_code == 200:
        print("[OK] Ollama is running.")
        models = resp.json().get('models', [])
        if models:
            print(f"   Available models: {[m['name'] for m in models]}")
        else:
            print("   [!] No models found in Ollama.")
    else:
        print(f"[X] Ollama returned {resp.status_code}")
except Exception as e:
    print(f"[X] Ollama not reachable: {e}")
