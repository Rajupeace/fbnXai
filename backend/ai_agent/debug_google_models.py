
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    # Key should be provided via environment variable
    pass

genai.configure(api_key=api_key)

with open("models_debug.txt", "w") as f:
    f.write(f"Key: {api_key[:5]}...\n")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
