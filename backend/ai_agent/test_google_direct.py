
import google.generativeai as genai

import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("No GOOGLE_API_KEY found in .env")
    exit(1)
print(f"Testing Google Key: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')
    response = model.generate_content("Hello, just say OK.")
    print(f"[OK] Response: {response.text}")
except Exception as e:
    print(f"[X] Error: {e}")
