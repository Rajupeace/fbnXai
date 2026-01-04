
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("[X] No GOOGLE_API_KEY found")
    exit(1)

print(f"Key found: {api_key[:5]}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content("Hello, are you working?")
    print(f"[OK] Response: {response.text}")
except Exception as e:
    print(f"[X] Error: {e}")
