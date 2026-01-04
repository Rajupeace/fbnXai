
import os
import asyncio
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# Load env
load_dotenv()

async def test_agent():
    print("--- Testing Agent Logic (LangChain + Google) ---")
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("[!] GOOGLE_API_KEY missing.")
        return

    print(f"API Key found: {api_key[:5]}...")

    try:
        # Initialize Google GenAI
        print("[*] Initializing ChatGoogleGenerativeAI...")
        # IMPORTANT: Explicitly set the environment variable for the library
        os.environ["GOOGLE_API_KEY"] = api_key
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            temperature=0.7,
            google_api_key=api_key,
            transport="rest"
        )
        
        # Create message
        msg = HumanMessage(content="Hello! Briefly introduce yourself as Vu AI.")
        
        # Invoke
        print("[*] Sending request...")
        response = await llm.ainvoke([msg])
        
        print("\n[SUCCESS] Response received:")
        print(response.content)
        
    except Exception as e:
        print(f"\n[!] Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_agent())
