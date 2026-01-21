
import os
from langchain_openai import ChatOpenAI

api_key = "your_openai_api_key_here"  # Replace with your OpenAI API key

print(f"Testing OpenAI Key: {api_key[:10]}...")

try:
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.7,
        api_key=api_key
    )
    print("Invoking LLM...")
    response = llm.invoke("Hello, simple 'Yes' if you work.")
    print(f"[OK] Response: {response.content}")
except Exception as e:
    print(f"[X] Error: {e}")
