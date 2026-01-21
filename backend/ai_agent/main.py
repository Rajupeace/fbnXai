import os
import datetime
from datetime import timezone
import asyncio
import random
import functools
import glob
print = functools.partial(print, flush=True)

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

# Load environment variables explicitly from .env file in the same directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f"[i] Loaded .env from: {env_path}")

# Load from parent backend directory (shared .env)
parent_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(parent_env):
    load_dotenv(parent_env)
    print(f"[i] Loaded parent .env from: {parent_env}")

# Also search in parent directories or standard locations
load_dotenv()


app = FastAPI(title="Vu AI - University AI Agent API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIG & SECURITY ---
SECRET_KEY = os.getenv("SECRET_KEY", "insecure-dev-key-please-change")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- LLM SETUP: Selectable provider ---
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "google")
llm = None
MODEL_NAME = None

class _FallbackLLM:
    async def ainvoke(self, messages, **kwargs):
        # Extract last message
        if isinstance(messages, list):
            last_msg = messages[-1].content
        else:
            last_msg = str(messages)
            
        # Basic Navigation Mock logic
        nav_tag = ""
        if "navigate" in last_msg.lower() or "go to" in last_msg.lower():
            if "notes" in last_msg.lower(): nav_tag = " {{NAVIGATE: semester-notes}}"
            elif "video" in last_msg.lower(): nav_tag = " {{NAVIGATE: advanced-videos}}"
            else: nav_tag = " {{NAVIGATE: overview}}"

        response = (
            f"I am currently in Offline/Fallback Mode because valid API keys were not found. "
            f"But I can still help you navigate! 🚀{nav_tag}"
        )
        return AIMessage(content=response)


if LLM_PROVIDER in ("openai", "gpt", "gpt4", "gpt-4"):
    try:
        MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o")
        BASE_URL = os.getenv("OPENAI_BASE_URL")
        print(f"[?] Initializing OpenAI model: {MODEL_NAME}")
        if BASE_URL:
             print(f"   (Base URL: {BASE_URL})")

        try:
            from langchain_openai import ChatOpenAI
            print("   (Using langchain_openai integration)")
            llm = ChatOpenAI(
                model=MODEL_NAME, 
                temperature=0.7, 
                max_tokens=1024,
                base_url=BASE_URL,
                api_key=os.getenv("OPENAI_API_KEY") 
            )
        except ImportError:
            print("   (Using legacy langchain.chat_models integration)")
            from langchain.chat_models import ChatOpenAI
            llm = ChatOpenAI(
                model=MODEL_NAME, 
                temperature=0.7, 
                max_tokens=1024,
                openai_api_base=BASE_URL,
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )
            
    except Exception as e:
        print(f"[!] OpenAI Chat model initialization failed: {e}")
        if "insufficient_quota" in str(e) or "billing" in str(e):
            print("   [!] CRITICAL: Your OpenAI API key has run out of credits (Insufficient Quota).")
            print("   -> Please check your billing at https://platform.openai.com/account/billing")
        print("   -> Ensure `openai` and `langchain-openai` packages are installed and `OPENAI_API_KEY` is set.")

elif LLM_PROVIDER in ("ollama", "local", "llama", "llama3"):
    try:
        from langchain_community.chat_models import ChatOllama
        
        MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3")
        print(f"[?] Initializing Ollama model: {MODEL_NAME}")
        # Default URL is http://localhost:11434
        llm = ChatOllama(model=MODEL_NAME, temperature=0.7)
    except Exception as e:
        print(f"[!] Ollama initialization failed: {e}")
        print("   -> Ensure Ollama is running (http://localhost:11434) and you have pulled a model.")

elif LLM_PROVIDER in ("sambanova", "samba"):
    try:
        from langchain_openai import ChatOpenAI
        
        SAMBANOVA_API_KEY = os.getenv("SAMBANOVA_API_KEY")
        # Default to a reliable model, but allow override
        MODEL_NAME = os.getenv("SAMBANOVA_MODEL", "Meta-Llama-3.1-70B-Instruct")
        BASE_URL = os.getenv("SAMBANOVA_BASE_URL", "https://api.sambanova.ai/v1")
        
        print(f"[(i)] Initializing SambaNova model: {MODEL_NAME}")
        
        if not SAMBANOVA_API_KEY:
             raise ValueError("SAMBANOVA_API_KEY is missing in .env")

        llm = ChatOpenAI(
            base_url=BASE_URL,
            api_key=SAMBANOVA_API_KEY,
            model=MODEL_NAME,
            temperature=0.7,
            max_tokens=1024
        )
    except ImportError:
        print("[!] SambaNova integration not found.")
        print("   -> Please install it with: pip install langchain-community")
    except Exception as e:
        print(f"[!] SambaNova initialization failed: {e}")
        print("   -> Ensure `SAMBANOVA_API_KEY` is set in .env")

elif LLM_PROVIDER in ("google", "gemini", "google_gen", "gemini-pro"):
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        MODEL_NAME = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")
        api_key = os.getenv("GOOGLE_API_KEY")
        
        if not api_key:
             print("[!] GOOGLE_API_KEY not set in .env")
        else:
             print(f"[:] Initializing Google Gemini via LangChain: {MODEL_NAME}")
             llm = ChatGoogleGenerativeAI(
                 model=MODEL_NAME,
                 google_api_key=api_key,
                 temperature=0.7,
                 top_p=0.85,
                 convert_system_message_to_human=True # Necessary for some Gemini models
             )
    except Exception as e:
        print(f"[!] Google Gemini LangChain initialization failed: {e}")
        # Custom Wrapper Fallback
        import google.generativeai as genai
        class GoogleGenAICustom:
            def __init__(self, model_name, api_key):
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel(model_name)
            async def ainvoke(self, messages, **kwargs):
                prompt = "\n".join([m.content for m in messages if hasattr(m, 'content')])
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(None, lambda: self.model.generate_content(prompt))
                return AIMessage(content=response.text)
        
        if os.getenv("GOOGLE_API_KEY"):
            llm = GoogleGenAICustom(model_name="gemini-1.5-flash", api_key=os.getenv("GOOGLE_API_KEY"))


    except Exception as e:
        print(f"[!] Google Gemini initialization failed: {e}")
        print("   -> Ensure `google-generativeai` is installed and `GOOGLE_API_KEY` is set in .env.")

elif LLM_PROVIDER in ("anthropic", "claude"):
    try:
        from langchain_anthropic import ChatAnthropic

        MODEL_NAME = os.getenv("ANTHROPIC_MODEL", "claude-3-opus-20240229")
        print(f"[:] Initializing Anthropic model: {MODEL_NAME}")

        if not os.getenv("ANTHROPIC_API_KEY"):
            raise ValueError("ANTHROPIC_API_KEY is not set in the environment.")

        llm = ChatAnthropic(model=MODEL_NAME, temperature=0.7, max_tokens=1024)
    except ImportError:
        print("[!] Anthropic integration not found.")
        print("   -> Please install it with: pip install langchain-anthropic")
    except Exception as e:
        print(f"[!] Anthropic initialization failed: {e}")

elif LLM_PROVIDER in ("mock", "dev", "test"):
    print(f"[:] Initializing MOCK LLM (Dev Mode)")
    # Use the robust fallback class defined at the top
    llm = _FallbackLLM()


# Fallback LLM stub if initialization failed
if llm is None:
    print(f"[!] Could not initialize LLM for provider: {LLM_PROVIDER}")

    class _FallbackImpl(_FallbackLLM):
        async def ainvoke(self, messages, **kwargs):
            class _R:
                def __init__(self, content):
                    self.content = content

            msg = (
                "[!] No LLM available. Initialization failed.\n"
                "Check server logs for details.\n"
                "1. Google (Default): Ensure GOOGLE_API_KEY is set.\n"
                "2. OpenAI: Check API key and quota.\n"
                "3. Ollama: Ensure it's running.\n"
                "4. SambaNova: Ensure SAMBANOVA_API_KEY is set.\n"
                "5. Anthropic: Ensure ANTHROPIC_API_KEY is set.\n"
                "6. Groq: Ensure GROQ_API_KEY is set.\n"
                f"7. Verify LLM_PROVIDER in .env (Current: {LLM_PROVIDER})"
            )
            return _R(msg)

    llm = _FallbackImpl()

# --- IN-MEMORY CACHE ---
chat_history_cache = {}

# --- PYDANTIC MODELS ---

class UserRegister(BaseModel):
    username: str
    password: str
    role: str  # student, faculty, visitor, worker, alumni

class UserLogin(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    user_id: str
    message: str
    role: str
    user_name: str = "User"  # Added optional user_name

class ChatResponse(BaseModel):
    response: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str
    username: str


# --- SECURITY HELPERS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=300)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
        if username is None or role is None:
            raise credentials_exception
        return {"username": username, "role": role}
    except JWTError:
        raise credentials_exception


def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# --- KNOWLEDGE BASE ---
def load_knowledge_base():
    """
    Dynamically loads ALL text files from the 'backend/knowledge/' directory.
    This allows easy addition of new information by simply dropping files.
    """
    combined_knowledge = ""
    knowledge_dir = os.path.join(os.path.dirname(__file__), "knowledge")
    
    # Create directory if it doesn't exist
    if not os.path.exists(knowledge_dir):
        try:
            os.makedirs(knowledge_dir)
            print(f"[i] Created knowledge directory: {knowledge_dir}")
        except Exception as e:
            print(f"[!] Failed to create knowledge dir: {e}")
            return "Vignan University (VFSTR). (Knowledge base error)"

    # Find all text-based files
    files = glob.glob(os.path.join(knowledge_dir, "*.txt")) + \
            glob.glob(os.path.join(knowledge_dir, "*.md"))
    
    if not files:
        print("[!] No knowledge files found in backend/knowledge/")
        return "Vignan University (VFSTR). Location: Guntur. (Default Fallback Info)"

    print(f"[i] Loading knowledge base from {len(files)} files...")
    for file_path in files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                filename = os.path.basename(file_path)
                combined_knowledge += f"\n\n--- Source: {filename} ---\n{content}"
        except Exception as e:
            print(f"[!] Failed to read {file_path}: {e}")
    
    return combined_knowledge


# --- INTEGRATION: Friendly Notebook Notes ---
import json

def load_friendly_notebook_notes():
    """
    Reads materials.json from the Friendly Notebook project to make the AI aware of available notes.
    """
    try:
        possible_paths = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/materials.json")),
            r"c:\Users\rajub\OneDrive\Desktop\aiXfn\Friendly-NoteBook-main\Friendly-NoteBook-main\backend\data\materials.json",
        ]


        materials_path = None
        for p in possible_paths:
            if os.path.exists(p):
                materials_path = p
                break
        
        if not materials_path:
            return "" # Silent fail to reduce log noise

        with open(materials_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not data or not isinstance(data, list):
            return ""

        notes_summary = "\n**AVAILABLE COURSE MATERIALS / NOTES:**\n"
        count = 0
        for item in data:
            if count > 50: break # Limit to avoid context overflow if too many
            title = item.get('title', 'Untitled')
            subject = item.get('subject', 'General')
            url = item.get('url', '#')
            notes_summary += f"- [{subject}] {title} (Link: {url})\n"
            count += 1
            
        return notes_summary
    except Exception as e:
        print(f"[!] Failed to load notebook materials: {e}")
        return ""

VIGNAN_KNOWLEDGE_BASE = load_knowledge_base() + "\n" + load_friendly_notebook_notes()


def get_role_prompt(role: str, user_name: str = "User") -> str:
    """
    Generate a system prompt tailored to the user's role with enhanced knowledge base.
    Features: Friendly Persona, Multi-language Support (20+), Role-based custom instructions.
    """
    role = role.lower().strip()
    
    # Personalization Logic
    greeting_context = f"The user's name is '{user_name}'. Refer to them by name occasionally to be friendly."

    base_instructions = f"""You are Vu AI, the friendly AI assistant for Vignan University (VFSTR).

**CORE RULES:**
1. **Multi-Language**: Detect user's language and respond in the SAME language (English, Telugu, Hindi, etc.).
2. **Knowledge Sources (Dual Mode)**: 
   - **University Queries**: For questions about Vignan University (fees, exams, campus, faculty), PRIORITIZE the provided "Knowledge Base" below. If specific university info is missing, THEN say "Check with admin office 🏛️".
   - **Educational & General Queries (Gemini Brain)**: For ALL study-related topics (Coding, Math, Science, History), writing tasks, or general doubts, USE YOUR OWN VAST KNOWLEDGE. Do not restrict yourself. You are an expert tutor.
3. **Tone**: Warm, encouraging, and highly interactive. Use conversational fillers like "That's a great question!", "I'm happy to help with that!", and emojis 🎓✨.
4. **Interactive Learning**: Explain concepts using analogies. For example, if explaining 'Variables', compare them to boxes in a cupboard.
5. **Personalization**: {greeting_context}
6. **Self-Awareness**: If asked "Who am I?" or similar, identify the user as {user_name} ({role.upper()}).
7. **Dashboard Knowledge**: You are embedded in the "Friendly Notebook" dashboard.

**User Role:** {role.upper()}
"""

    role_specific = {
        "student": f"""
**ROLE: STUDENT STUDY COMPANION 🎓**
- **FOCUS**: Educational Questions ONLY.
- **Goals**: 
  1. Solve doubts in subjects (Math, CSE, ECE, AIML).
  2. Help with homework and exam preparation.
  3. Navigate to notes/videos.
- **Tone**: Focused, academic, and encouraging.
""",
        "faculty": f"""
**ROLE: FACULTY PLANNING ASSISTANT 👨‍🏫**
- **FOCUS**: Subject Planning & Assignments.
- **Goals**:
  1. Create detailed **Subject Plans** and Schedules.
  2. Design **Assignment Plans** and Project Ideas.
  3. Generate Lesson Plans and Quizzes.
- **Tone**: Organized, efficient, and professional.
""",
        "admin": f"""
**ROLE: ADMIN SYSTEM CONTROLLER & INNOVATOR 🔑**
- **FOCUS**: Control, New Ideas, Tips & Tricks.
- **Goals**:
  1. **Control Ideas**: Strategies to manage the campus/system better.
  2. **Innovation**: Suggest "New Things" or features for the university.
  3. **Tips & Tricks**: Provide productivity hacks for Students and Faculty.
- **Tone**: Visionary, strategic, and authoritative.
""",
        "visitor": "Act as a welcoming Tour Guide for Vignan University 🌍.",
        "worker": " Assist with administrative or maintenance queries efficiently 🛠️.",
    }


    role_text = role_specific.get(role, "Be helpful.")


    # DYNAMIC LOAD: Reloads files fresh for every request so new data is instant
    # Friendly Notebook Specific Instructions & WORKFLOWS
    app_workflows = """
**FRIENDLY NOTEBOOK APPLICATION KNOWLEDGE:**
1. **Semester Notes**: Located in 'Semester Notes' view. Contains subject-wise notes.
2. **Advanced Learning**: Located in 'Advanced Learning' hub. Contains 'Deep Learning', 'Web Development', etc.
3. **Videos**: Located in 'Advanced Videos'. Video tutorials for subjects.
4. **My Profile/Settings**: Located in 'Settings'. Change password or profile pic.
5. **Ask AI**: You are the 'Ask AI' feature!

**CLIENT ACTIONS (IMPORTANT):**
If the user asks to "go to note", "open videos", "show me settings", or "navigate to...", you MUST include a special action tag at the end of your response.
Format: `{{NAVIGATE: <view_name>}}`

Valid Views:
- `overview` (Dashboard Home)
- `semester-notes` (Course Notes)
- `advanced-videos` (Videos)
- `advanced-learning` (Tech Skills)
- `settings` (Profile)
- `interview-qa` (Interview Questions)

Example:
User: "Take me to my notes."
AI: "Sure! Heading to your semester notes now. 📂 {{NAVIGATE: semester-notes}}"
"""

    current_knowledge = VIGNAN_KNOWLEDGE_BASE or "Vignan University (VFSTR) context unavailable."

    return f"""*** KNOWLEDGE BASE [START] ***
{current_knowledge}
*** KNOWLEDGE BASE [END] ***


{base_instructions}

{app_workflows}

{role_text}"""



# --- DATABASE SETUP ---
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
try:
    client = AsyncIOMotorClient(mongo_uri)
    db = client.vu_ai_agent
    users_collection = db.users
    chat_collection = db.chats
    print(f"[OK] MongoDB connection configured.")
except Exception as e:
    print(f"[!] MongoDB initialization failed: {e}")


@app.on_event("startup")
async def startup_checks():
    """Check MongoDB and LLM provider connections on startup."""
    print("\n" + "=" * 60)
    print("[!] VU AI AGENT - STARTUP CHECKS")
    print("=" * 60)

    checks_passed = True

    # 1. Database Check
    try:
        await client.admin.command("ping")
        print("[OK] MongoDB connected and healthy")
    except Exception as e:
        print(f"[X] MongoDB Error: {e}")
        print("   Continuing without database persistence...")
        # checks_passed = False # Keep going anyway

    # 2. LLM provider quick check
    if isinstance(llm, _FallbackLLM):
        print(f"[X] LLM provider '{LLM_PROVIDER}' is in fallback mode. Check initialization logs.")
        checks_passed = False
    else:
        try:
            print(f"[?] Checking LLM provider: {LLM_PROVIDER} (model: {MODEL_NAME})")
            test_msg = HumanMessage(content="Hello")
            # A short timeout to avoid blocking startup for too long
            resp = await asyncio.wait_for(llm.ainvoke([test_msg]), timeout=10)
            ok = getattr(resp, "content", None)

            if ok:
                print(f"[OK] LLM provider '{LLM_PROVIDER}' responding. Model: {MODEL_NAME}")
            else:
                print(f"[!] LLM provider '{LLM_PROVIDER}' did not return valid content. Model: {MODEL_NAME}")
                checks_passed = False
        except asyncio.TimeoutError:
            print(f"[!] LLM check timeout (10s) - Model might be slow or retrying connection.")
            checks_passed = False
        except Exception as e:
            print(f"[X] LLM check failed: {e}")
            checks_passed = False

    print("-" * 60)
    if checks_passed:
        print("[OK] SYSTEM STATUS: OK - Vu AI Agent Ready!\n")
    else:
        print("[X] SYSTEM STATUS: ISSUES DETECTED - Check logs above.\n")


@app.get("/")
async def root():
    # 1. Check DB
    db_ok = True
    try:
        await client.admin.command("ping")
    except:
        db_ok = False
        
    # 2. Check LLM
    llm_ok = False
    if llm and getattr(getattr(llm, "__class__", None), "__name__", "") != "_FallbackLLM":
        llm_ok = True

    # 3. Determine Overall Status
    status = "OK" if (db_ok and llm_ok) else "ISSUES"
    
    return {
        "system_status": status,
        "database": "connected" if db_ok else "disconnected",
        "llm_provider": LLM_PROVIDER if llm_ok else "unavailable",
        "selected_model": MODEL_NAME,
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_message = request.message.strip()
    user_name = request.user_name or "User"

    if not user_message:
        return ChatResponse(response="Please ask me something! [!]")

    print("\n[?] New Chat Request")

    try:
        system_text = get_role_prompt(request.role, user_name)
        messages = [SystemMessage(content=system_text)]

        if request.user_id in chat_history_cache:
            messages.extend(chat_history_cache[request.user_id])
        else:
            # Simple history load... (truncated for brevity/stability)
            pass

        current_user_message = HumanMessage(content=user_message)
        messages.append(current_user_message)

        print("   [LLM] Invoking LLM...")
        
        # --- ROBUST LLM CALL ---
        try:
             # AUTO-SWITCH LOGIC INSIDE CHAT
             request_llm = llm
             response_text = ""
             
             # Attempt 1
             try:
                 ai_response = await asyncio.wait_for(request_llm.ainvoke(messages), timeout=30)
                 response_text = ai_response.content.strip()
             except Exception as e:
                 print(f"   [!] Primary Model Error: {e}. Switching to Fallback.")
                 # DYNAMIC FALLBACK to Flash (more reliable/free)
                 fb_model = "gemini-1.5-flash"
                 
                 # Only try fallback if we aren't already using it
                 if MODEL_NAME != fb_model:
                     api_key = os.getenv("GOOGLE_API_KEY")
                     if api_key:
                         print(f"   [:] Attempting fallback to {fb_model}...")
                         request_llm = GoogleGenAICustom(model_name=fb_model, api_key=api_key)
                         ai_response = await asyncio.wait_for(request_llm.ainvoke(messages), timeout=30)
                         response_text = ai_response.content.strip()
                         print(f"   [OK] Fallback to {fb_model} worked.")
                     else:
                         print("   [!] No API key for fallback.")
                         raise e
                 else:
                    raise e

        except Exception as final_e:
             print(f"   [X] Final LLM failure: {final_e}")
             response_text = "I'm having trouble connecting to my brain right now. Please try again in a moment!"


        # SAVE Logic (simplified)
        try:
            if request.user_id not in chat_history_cache: chat_history_cache[request.user_id] = []
            chat_history_cache[request.user_id].extend([current_user_message, AIMessage(content=response_text)])
            if len(chat_history_cache[request.user_id]) > 6:
                chat_history_cache[request.user_id] = chat_history_cache[request.user_id][-6:]
        except: pass

        return ChatResponse(response=response_text)

    except Exception as e:
        print(f"   [X] Critical Error: {e}")
        return ChatResponse(response="An unexpected error occurred.")


@app.post("/login", response_model=Token)
async def login_for_access_token(user_data: UserLogin):
    user = await users_collection.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user["username"], "role": user.get("role", "user")}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user.get("_id", "")),
        role=user.get("role", "user"),
        username=user["username"],
    )


@app.get("/admin/data")
async def get_admin_data(current_user: dict = Depends(get_current_admin_user)):
    try:
        users = await users_collection.find().to_list(length=100)
        chats = (await chat_collection.find().sort("timestamp", -1).to_list(length=500))
        def serialize(doc):
            if "_id" in doc: doc["_id"] = str(doc["_id"])
            return doc
        return {
            "total_users": len(users),
            "total_chats": len(chats),
            "users": [serialize(u) for u in users],
            "chats": [serialize(c) for c in chats],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve admin data: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "ok"} # Simple health check

if __name__ == "__main__":
    import uvicorn
    import socket
    
    def is_port_in_use(port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0

    PORT = 8000
    if is_port_in_use(PORT):
        print(f"[!] Warning: Port {PORT} is already in use.")
        try:
            print(f"   Attempts to kill process on port {PORT}...")
            # Windows command to kill by port
            os.system(f"for /f \"tokens=5\" %a in ('netstat -aon ^| find \":{PORT}\"') do taskkill /f /pid %a")
        except:
            print(f"   [!] Failed to auto-kill process on port {PORT}. Please manually close it.")

    print(f"[:] Starting Uvicorn on port {PORT}...")
    # Disable reload to avoid zombie processes and improve stability
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
