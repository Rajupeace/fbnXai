
import os
import asyncio
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import google.generativeai as genai

# Load env
load_dotenv()

# Copy of the Custom Class for testing
class AIMessage:
    def __init__(self, content):
        self.content = content

class GoogleGenAICustom:
    def __init__(self, model_name, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
    
    async def ainvoke(self, messages, **kwargs):
        # Convert LangChain messages to Gemini format
        prompt_parts = []
        system_instruction = ""
        
        for msg in messages:
            if hasattr(msg, 'type') and msg.type == 'system':
                system_instruction += msg.content + "\n"
            elif hasattr(msg, 'content'):
                role_label = "Student" if hasattr(msg, 'type') and msg.type == 'human' else "AI"
                prompt_parts.append(f"{role_label}: {msg.content}")
        
        full_prompt = system_instruction + "\n\n" + "\n".join(prompt_parts) + "\nAI:"
        
        # Run in executor to be async compatible
        loop = asyncio.get_event_loop() 
        response = await loop.run_in_executor(None, lambda: self.model.generate_content(full_prompt))
        
        # Return compatible object
        return AIMessage(content=response.text)

async def test_agent():
    print("--- Testing Agent Logic (Direct SDK Custom Wrapper) ---")
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("[!] GOOGLE_API_KEY missing.")
        return

    print(f"API Key found: {api_key[:5]}...")

    try:
        print("[*] Initializing GoogleGenAICustom...")
        llm = GoogleGenAICustom(
            model_name="gemini-1.5-pro",
            api_key=api_key
        )
        
        # Create messages
        messages = [
            SystemMessage(content="You are a helpful assistant."),
            HumanMessage(content="Hello! Briefly introduce yourself.")
        ]
        
        # Invoke
        print("[*] Sending request...")
        response = await llm.ainvoke(messages)
        
        print("\n[SUCCESS] Response received:")
        print(response.content)
        
    except Exception as e:
        print(f"\n[!] Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_agent())
