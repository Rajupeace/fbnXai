import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment variables explicitly
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f"[OK] Loaded .env from: {env_path}")
else:
    load_dotenv()
    print("[WARN] Loaded .env from default location (or not found)")

def print_header(title):
    print("\n" + "=" * 60)
    print(f"[SEARCH] {title}")
    print("=" * 60)

def check_setup():
    print_header("ENVIRONMENT CONFIGURATION")
    provider = os.getenv("LLM_PROVIDER", "google").lower()
    print(f"LLM_PROVIDER: {provider}")
    
    if provider in ("openai", "gpt", "gpt4", "gpt-4"):
        return check_openai()
    elif provider in ("google", "gemini", "google_gen"):
        return check_google()
    elif provider in ("ollama", "local"):
        return check_ollama()
    else:
        print(f"[X] Unknown provider: {provider}")
        return False

def check_openai():
    print_header("TESTING OPENAI CONNECTION")
    api_key = "your_openai_api_key_here"  # Replace with your OpenAI API key
    model = os.getenv("OPENAI_MODEL", "gpt-4")
    
    if not api_key:
        print("[X] OPENAI_API_KEY is missing in .env")
        return False
        
    print(f"Model: {model}")
    print("API Key: " + "*" * 10 + api_key[-4:] if api_key else "Missing")
    
    try:
        from langchain_openai import ChatOpenAI
        print("[OK] langchain_openai package is installed.")
        
        llm = ChatOpenAI(api_key=api_key, model=model, temperature=0.5)
        print("[WAIT] Sending test prompt to OpenAI...")
        
        response = llm.invoke("Hello, are you working? Reply with 'Yes, I am working!'")
        print(f"[OK] Response received: {response.content}")
        return True
    except ImportError:
        print("[WARN] langchain_openai not found. Trying older langchain.chat_models...")
        try:
            from langchain.chat_models import ChatOpenAI
            llm = ChatOpenAI(openai_api_key=api_key, model=model, temperature=0.5)
            response = llm.invoke("Hello, are you working? Reply with 'Yes, I am working!'")
            print(f"[OK] Response received: {response.content}")
            return True
        except Exception as e:
            print(f"[X] OpenAI Import/Connection Error: {e}")
            return False
            
    except Exception as e:
        print(f"[X] OpenAI Connection Error: {e}")
        return False

def check_google():
    print_header("TESTING GOOGLE GEMINI CONNECTION")
    api_key = os.getenv("GOOGLE_API_KEY")
    model = os.getenv("GOOGLE_MODEL", "gemini-pro")
    
    if not api_key:
        print("[X] GOOGLE_API_KEY is missing in .env")
        return False
        
    print(f"Model: {model}")
    print("API Key: " + "*" * 10 + api_key[-4:] if api_key else "Missing")
    
    try:
        # Try importing Google genai directly first for a raw test
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        print("[OK] google-generativeai package installed.")
        
        print("[WAIT] Sending test prompt to Google GenAI...")
        m = genai.GenerativeModel(model)
        response = m.generate_content("Hello, simply verify you are working.")
        print(f"[OK] Response received: {response.text}")
        return True
    except ImportError:
        print("[WARN] google.generativeai package not found.")
    except Exception as e:
        print(f"[X] Google GenAI Error: {e}")

    # Fallback to LangChain test
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(google_api_key=api_key, model=model)
        response = llm.invoke("Hello")
        print(f"[OK] LangChain Response received: {response.content}")
        return True
    except Exception as e:
        print(f"[X] LangChain Google Error: {e}")
        return False

def check_ollama():
    print_header("TESTING OLLAMA CONNECTION")
    import requests
    
    url = "http://127.0.0.1:11434"
    print(f"URL: {url}")
    
    try:
        r = requests.get(url)
        if r.status_code == 200:
            print("[OK] Ollama service is UP (200 OK)")
        else:
            print(f"[WARN] Ollama service reachable but returned {r.status_code}")
    except Exception as e:
        print(f"[X] Could not connect to Ollama: {e}")
        print("   -> Make sure Ollama desktop app is running.")
        return False

    try:
        payload = {
            "model": "llama3",
            "prompt": "Hello",
            "stream": False
        }
        res = requests.post(f"{url}/api/generate", json=payload)
        if res.status_code == 200:
            print(f"[OK] Generation success: {res.json().get('response', '')}")
            return True
        else:
            print(f"[X] Generation failed: {res.text}")
            return False
    except Exception as e:
        print(f"[X] Generation Error: {e}")
        return False

def check_mongo():
    print_header("TESTING MONGODB CONNECTION")
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    print(f"URI: {uri}")
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=2000)
        async def do_ping():
            await client.admin.command('ping')
        
        loop = asyncio.get_event_loop()
        loop.run_until_complete(do_ping())
        print("[OK] MongoDB is reachable!")
        return True
    except ImportError:
        print("[X] 'motor' package not installed.")
        return False
    except Exception as e:
        print(f"[X] MongoDB Connection Failed: {e}")
        return False

if __name__ == "__main__":
    check_mongo()
    check_setup()
