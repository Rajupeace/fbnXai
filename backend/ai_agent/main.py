import os
import datetime
from datetime import timezone
import asyncio
import functools
import glob
import re
import shutil
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

# --- PERFORMANT RAG IMPORTS ---
# Temporarily disabled for quick setup - Node.js layer handles fast responses
RAG_AVAILABLE = False
try:
    from langchain_community.vectorstores import FAISS
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain.chains import RetrievalQA
    from langchain_core.documents import Document
    # RAG_AVAILABLE = True  # Enable after verifying dependencies
except ImportError as e:
    print(f"[!] RAG dependencies missing: {e}")
    RAG_AVAILABLE = False

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
    
    # 3. Try OPENAI
    try:
        from langchain_openai import ChatOpenAI
        print("[:] initializing OpenAI...")
        return ChatOpenAI(temperature=0.3, model_name="gpt-4o-mini")
    except:
        pass
        
    # 4. Mock
    print("[!] No LLM found. Using Stub.")
    return None

# --- RAG INITIALIZATION (THE FAST PART) ---
def initialize_fast_rag():
    global vector_store, qa_chain, llm, embeddings
    
    print("\n" + "="*50)
    print("🚀 STARTING FAST RAG ENGINE")
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
    print("⚡ Loading Embeddings (all-MiniLM-L6-v2)...")
    try:
        # Use a small, fast local model. No API calls needed for embeddings!
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    except Exception as e:
        print(f"[!] Embedding Load Fail: {e}")
        print("    -> Assuming this is due to missing libraries. Will run without RAG.")
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
    # Check for existing index
    index_path = "faiss_index_v1"
    
    try:
        # For simplicity in this demo, strict rebuild ensures freshness
        # In prod, we would load_local if exists
        print("🧠 Building Vector Index (In-Memory FAISS)...")
        vector_store = FAISS.from_documents(split_docs, embeddings)
        print("✅ Vector Index Ready.")
    except Exception as e:
        print(f"[!] FAISS Build Failed: {e}")
        return

    # F. CREATE RETRIEVAL CHAIN
    # k=2 -> Only retrieve top 2 most relevant chunks = VERY FAST LLM processing
    retriever = vector_store.as_retriever(search_kwargs={"k": 2})
    
    from langchain.chains import RetrievalQA
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff", # 'stuff' simply puts docs in prompt
        retriever=retriever,
        return_source_documents=False
    )
    print("🚀 FAST RAG ENGINE READY.\n")


# --- ROUTING LOGIC ---

# Pydantic Models
class ChatRequest(BaseModel):
    message: str | None = None
    prompt: str | None = None
    role: str = "student"
    user_name: str = "User"
    user_id: str = "guest"

class ChatResponse(BaseModel):
    response: str

# Endpoints
@app.on_event("startup")
async def startup_event():
    # Run initialization in thread to not block
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, initialize_fast_rag)
    
    # DB Connect
    global users_collection
    try:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        client = AsyncIOMotorClient(mongo_uri)
        db = client.vu_ai_agent
        users_collection = db.users
        print("[OK] MongoDB Connected.")
    except:
        print("[!] MongoDB Failed.")

@app.get("/")
def health():
    return {"status": "active", "mode": "high_performance", "rag_enabled": qa_chain is not None}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    user_msg = req.message or req.prompt
    if not user_msg: return ChatResponse(response="?")
    
    # 1. Fast Patterns (Simple Logic handled by Node layer, but good check here too)
    
    # 2. RAG Execution
    if qa_chain:
        try:
            # We inject a persona into the query to keep the style
            # But RetrievalQA is rigid. We rely on the LLM's system prompt capability if possible, 
            # Or prepending to the query.
            
            # Simple wrapper to enforce style
            style_instruction = " (Answer concisely as a friendly university assistant in < 50 words)"
            
            # Run in thread
            res = await asyncio.to_thread(qa_chain.invoke, user_msg + style_instruction)
            answer = res.get('result', "I'm not sure.")
            
            return ChatResponse(response=answer)
        except Exception as e:
            print(f"[!] RAG Query Error: {e}")
            # Fallback
            pass
            
    # 3. Fallback (Direct LLM)
    if llm:
        try:
            resp = await llm.ainvoke([HumanMessage(content=user_msg)])
            return ChatResponse(response=resp.content)
        except:
            return ChatResponse(response="System is busy. Please try again.")
            
    return ChatResponse(response="AI Service Offline. Please check server logs.")

# --- AUTH (Simplified for performance file) ---
@app.post("/login")
async def login_placeholder():
    # Login handled by Node.js primarily, this is stub for Python-only usage
    raise HTTPException(status_code=501, detail="Please use Node.js backend for auth.")

if __name__ == "__main__":
    import uvicorn
    # Optimized Uvicorn settings
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="error")
