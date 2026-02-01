import os
import sys
import datetime
from datetime import timezone
import asyncio
import functools
import glob
import re
import shutil

# Force UTF-8 for Windows to prevent crashes with special characters
if sys.platform == "win32":
    try:
        import io
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8')
    except:
        pass

print = functools.partial(print, flush=True)

from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
import logging

# Globals for RAG
FAISS = None
HuggingFaceEmbeddings = None
RecursiveCharacterTextSplitter = None
RetrievalQA = None
Document = None

# --- PERFORMANT RAG IMPORTS ---
def check_rag_available():
    """Checks if required RAG libraries are available with compatibility fallback."""
    global FAISS, HuggingFaceEmbeddings, RecursiveCharacterTextSplitter, RetrievalQA, Document
    try:
        try:
            from langchain_community.vectorstores import FAISS
        except ImportError:
            from langchain.vectorstores import FAISS
        
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
        except ImportError:
            from langchain.embeddings import HuggingFaceEmbeddings
            
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
        except ImportError:
            try:
                from langchain.text_splitter import RecursiveCharacterTextSplitter
            except ImportError:
                from langchain_community.text_splitters import RecursiveCharacterTextSplitter
            
        from langchain.chains import RetrievalQA
        
        try:
            from langchain_core.documents import Document
        except ImportError:
            from langchain.docstore.document import Document
            
        return True
    except Exception as e:
        print(f"[!] RAG modules failing: {e}")
        return False

# Initialize status once
RAG_AVAILABLE = check_rag_available()
if RAG_AVAILABLE:
    print("[i] RAG status: Optimized & Ready")
else:
    print("[!] RAG status: Disabled (Missing dependencies)")

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path): load_dotenv(env_path)
parent_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(parent_env): load_dotenv(parent_env)
load_dotenv()

app = FastAPI(title="Vu AI Agent - High Performance Mode")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIG ---
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "google") # Default to Google (Fast)
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-1.5-flash") # Default to Flash

# --- GLOBAL AI COMPONENTS ---
vector_store = None
qa_chain = None
llm = None
embeddings = None

# --- LLM FACTORY ---
def get_llm():
    """Initializes the fastest available LLM based on config."""
    global LLM_PROVIDER
    
    # 1. Try OLLAMA (Local & Fastest if GPU)
    if LLM_PROVIDER == "ollama":
        try:
            from langchain_community.chat_models import ChatOllama
            print(f"[:] initializing OLLAMA ({MODEL_NAME})...")
            return ChatOllama(model=MODEL_NAME or "llama3", temperature=0.1)
        except:
            print("[!] Ollama not available, falling back to Google.")
            LLM_PROVIDER = "google"

    # 2. Try GOOGLE (Fast Cloud)
    if LLM_PROVIDER == "google" or "gemini" in LLM_PROVIDER:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key: raise ValueError("No Google API Key")
            print(f"[:] initializing GEMINI ({MODEL_NAME})...")
            return ChatGoogleGenerativeAI(
                model=MODEL_NAME or "gemini-1.5-flash", 
                google_api_key=api_key, 
                temperature=0.3,
                convert_system_message_to_human=True
            )
        except Exception as e:
            print(f"[!] Google Init Failed: {e}")
    
    # 3. Try OPENAI / OPENROUTER
    try:
        from langchain_openai import ChatOpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            print("[:] initializing OpenAI/OpenRouter...")
            # Detect OpenRouter
            base_url = None
            model = "gpt-4o-mini"
            if api_key.startswith("sk-or-v1"):
                base_url = "https://openrouter.ai/api/v1"
                # Use a common OpenRouter model if specific one not provided
                model = os.getenv("MODEL_NAME") or "openai/gpt-4o-mini"
                print(f"    -> OpenRouter detected. Hub: {model}")
            
            return ChatOpenAI(
                api_key=api_key,
                base_url=base_url,
                model_name=model,
                temperature=0.3
            )
    except Exception as e:
        print(f"[!] OpenAI Init Failed: {e}")
        
    # 4. Mock
    print("[!] No LLM found. Using Stub.")
    return None

# --- RAG INITIALIZATION (THE FAST PART) ---
def initialize_fast_rag():
    global vector_store, qa_chain, llm, embeddings
    
    print("\n" + "="*50)
    print("STARTING FAST RAG ENGINE")
    print("="*50)

    # A. INITIALIZE LLM
    llm = get_llm()
    if not llm:
        print("[X] LLM failed to start.")
        return

    if not RAG_AVAILABLE:
        print("[X] FAISS/LangChain not installed. RAG disabled.")
        return

    # B. INITIALIZE EMBEDDINGS (Local = Fast)
    print("Loading Embeddings (all-MiniLM-L6-v2)...")
    try:
        # Use a small, fast local model. No API calls needed for embeddings!
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    except Exception as e:
        print(f"[!] Embedding Load Fail: {e}")
        print("    -> Running without RAG.")
        return

    # C. LOAD DOCUMENTS
    knowledge_dir = os.path.join(os.path.dirname(__file__), "knowledge")
    docs = []
    
    # 1. Load Text Files
    txt_files = glob.glob(os.path.join(knowledge_dir, "*.txt")) + glob.glob(os.path.join(knowledge_dir, "*.md"))
    
    # 2. Add Parent Knowledge (fallback)
    if not txt_files:
        parent_docs = glob.glob(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "*.md"))
        txt_files.extend(parent_docs)
    
    total_chars = 0
    print(f"📂 Found {len(txt_files)} knowledge files.")
    
    for fpath in txt_files:
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
                if content.strip():
                    docs.append(Document(page_content=content, metadata={"source": os.path.basename(fpath)}))
                    total_chars += len(content)
        except: pass

    if not docs:
        print("[!] No knowledge content found.")
        # Create a dummy doc to initialize system
        docs.append(Document(page_content="Vignan University is a premier institution.", metadata={"source": "dummy"}))

    # D. OPTIMIZED CHUNKING (Key to Speed)
    # Chunk = 500 (Small Context) -> Faster Retrieval & Less Token Usage
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    split_docs = text_splitter.split_documents(docs)
    print(f"🧩 Split into {len(split_docs)} chunks (Size: 500).")

    # E. BUILD VECTOR DB (FAISS)
    try:
        print("🧠 Building Vector Index (In-Memory FAISS)...")
        vector_store = FAISS.from_documents(split_docs, embeddings)
        print("✅ Vector Index Ready.")
    except Exception as e:
        print(f"[!] FAISS Build Failed: {e}")
        return

    # F. CREATE RETRIEVAL CHAIN
    retriever = vector_store.as_retriever(search_kwargs={"k": 2})
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=False
    )
    print("FAST RAG ENGINE READY.\n")


# --- ROUTING LOGIC ---

class ChatRequest(BaseModel):
    message: str | None = None
    prompt: str | None = None
    role: str = "student"
    user_id: str = "guest"
    user_name: str = "Student"

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    global qa_chain
    user_message = req.message or req.prompt
    if not user_message: return {"response": "No message received."}

    # If RAG is ready, use it
    if qa_chain:
        try:
            print(f"[*] RAG Query: {user_message[:50]}...")
            # Langchain 0.1+ use invoke
            if hasattr(qa_chain, 'invoke'):
                result = await asyncio.to_thread(qa_chain.invoke, {"query": user_message})
                return {"response": result["result"]}
            else:
                result = await asyncio.to_thread(qa_chain, user_message)
                return {"response": result["result"]}
        except Exception as e:
            print(f"[!] RAG Fail: {e}")

    # Fallback to direct LLM if RAG fails
    try:
        print(f"[*] Direct LLM Query: {user_message[:50]}...")
        if llm:
            msg = HumanMessage(content=user_message)
            response = await asyncio.to_thread(llm.invoke, [msg])
            return {"response": response.content}
    except Exception as e:
        print(f"[!] LLM Fail: {e}")

    return {"response": "I'm having trouble connecting to my brain right now. Please try again later!"}

@app.get("/")
def health_check():
    return {
        "status": "active", 
        "mode": "high_performance", 
        "rag_ready": qa_chain is not None,
        "llm_ready": llm is not None
    }

@app.on_event("startup")
async def startup_event():
    # Initialize RAG in background thread to not block FastAPI boot
    asyncio.create_task(asyncio.to_thread(initialize_fast_rag))

if __name__ == "__main__":
    import uvicorn
    print("Starting VuAiAgent Server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
