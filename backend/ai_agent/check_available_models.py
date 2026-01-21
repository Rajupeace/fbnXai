
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env manually to ensure we get the key
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    # Try loading from parent .env
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
    api_key = os.getenv("GOOGLE_API_KEY")

print(f"API Key found: {'Yes' if api_key else 'No'}")

if api_key:
    genai.configure(api_key=api_key)
    print("\n--- Available Models ---")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")
else:
    print("Cannot list models without API KEY")
