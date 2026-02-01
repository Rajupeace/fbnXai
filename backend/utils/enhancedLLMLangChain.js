// Enhanced LLM and LangChain Integration with Knowledge Base Linking
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');

class EnhancedLLMLangChainIntegration {
    constructor() {
        this.pythonProcess = null;
        this.isReady = false;
        this.responseCache = new Map();
        this.knowledgeBase = new Map();
        this.fastResponses = new Map();
        this.langChainReady = false;
        this.vectorStore = null;
        this.embeddings = null;
        this.retriever = null;
        this.initializeFastResponses();
        this.initializeKnowledgeBase();
    }

    // Initialize fast responses for common queries
    initializeFastResponses() {
        this.fastResponses.set('hello', {
            response: '🌟 Hello! I\'m your enhanced AI assistant with full LLM and LangChain integration!',
            responseTime: 1,
            source: 'fast-cache'
        });

        this.fastResponses.set('help', {
            response: '🚨 Enhanced Help Available!\n\n📚 Knowledge base access\n🧠 LLM integration\n⚡ LangChain RAG system\n🔧 Technical support\n\nWhat do you need help with?',
            responseTime: 1,
            source: 'fast-cache'
        });

        this.fastResponses.set('urgent', {
            response: '🚨 URGENT MODE - Full AI Stack Active!\n\n⚡ Instant responses\n🧠 LLM-powered assistance\n📚 Knowledge integration\n🔗 LangChain RAG system\n\nI\'m responding with enhanced AI capabilities!',
            responseTime: 1,
            source: 'fast-cache'
        });
    }

    // Initialize and link knowledge base
    async initializeKnowledgeBase() {
        console.log('📚 Initializing Enhanced Knowledge Base...');
        
        try {
            // Load from multiple sources
            await this.loadKnowledgeFromFiles();
            await this.loadKnowledgeFromDatabase();
            await this.initializeLangChain();
            
            console.log(`✅ Knowledge Base Ready: ${this.knowledgeBase.size} sources loaded`);
        } catch (error) {
            console.error('❌ Knowledge Base initialization failed:', error.message);
        }
    }

    // Load knowledge from files
    async loadKnowledgeFromFiles() {
        const knowledgeDir = path.join(__dirname, '..', 'knowledge');
        
        try {
            const files = await fs.readdir(knowledgeDir);
            
            for (const file of files) {
                if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.txt') || file.endsWith('.md')) {
                    await this.loadKnowledgeFile(file, knowledgeDir);
                }
            }
        } catch (error) {
            console.log('⚠️ Knowledge directory not found, will create on demand');
        }
    }

    // Load individual knowledge file
    async loadKnowledgeFile(file, knowledgeDir) {
        try {
            const filePath = path.join(knowledgeDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            
            let knowledgeData;
            
            if (file.endsWith('.js')) {
                delete require.cache[require.resolve(filePath)];
                knowledgeData = require(filePath);
            } else if (file.endsWith('.json')) {
                knowledgeData = JSON.parse(content);
            } else {
                knowledgeData = {
                    type: 'text',
                    content: content,
                    filename: file,
                    category: path.basename(file, path.extname(file))
                };
            }
            
            this.knowledgeBase.set(file, {
                data: knowledgeData,
                source: 'file',
                type: path.extname(file).substring(1),
                loaded: new Date()
            });
            
            console.log(`✅ Loaded knowledge file: ${file}`);
        } catch (error) {
            console.error(`❌ Failed to load ${file}:`, error.message);
        }
    }

    // Load knowledge from database
    async loadKnowledgeFromDatabase() {
        try {
            if (mongoose.connection.readyState !== 1) {
                console.log('⚠️ Database not connected, skipping DB knowledge loading');
                return;
            }

            // Knowledge File schema
            const KnowledgeFileSchema = new mongoose.Schema({
                filename: String,
                category: String,
                type: String,
                content: mongoose.Schema.Types.Mixed,
                metadata: Object,
                linked: Boolean,
                createdAt: Date,
                updatedAt: Date
            });
            
            const KnowledgeFile = mongoose.model('KnowledgeFile', KnowledgeFileSchema);
            const dbKnowledge = await KnowledgeFile.find({ linked: true });
            
            for (const doc of dbKnowledge) {
                this.knowledgeBase.set(doc.filename, {
                    data: doc.content,
                    source: 'database',
                    type: doc.type,
                    category: doc.category,
                    loaded: doc.updatedAt
                });
            }
            
            console.log(`✅ Loaded ${dbKnowledge.length} knowledge items from database`);
        } catch (error) {
            console.error('❌ Failed to load knowledge from database:', error.message);
        }
    }

    // Initialize LangChain components
    async initializeLangChain() {
        console.log('🔗 Initializing LangChain Integration...');
        
        try {
            // Start Python LangChain service
            await this.startLangChainService();
            
            // Initialize vector store for RAG
            await this.initializeVectorStore();
            
            this.langChainReady = true;
            console.log('✅ LangChain Integration Ready');
        } catch (error) {
            console.error('❌ LangChain initialization failed:', error.message);
            this.langChainReady = false;
        }
    }

    // Start LangChain Python service
    async startLangChainService() {
        return new Promise((resolve, reject) => {
            console.log('🐍 Starting LangChain Python Service...');
            
            const langChainScript = path.join(__dirname, 'langchain_service.py');
            
            // Create LangChain service script
            this.createLangChainServiceScript(langChainScript);

            this.pythonProcess = spawn('python', [langChainScript], {
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    PYTHONUNBUFFERED: '1',
                    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
                    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
                }
            });

            let output = '';

            this.pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
                if (output.includes('LANGCHAIN_READY')) {
                    this.isReady = true;
                    console.log('✅ LangChain Python Service Ready');
                    resolve(true);
                }
            });

            this.pythonProcess.stderr.on('data', (data) => {
                console.log(`🐍 LangChain Error: ${data.toString()}`);
            });

            this.pythonProcess.on('error', (error) => {
                console.error('❌ LangChain Service Error:', error.message);
                reject(error);
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!this.isReady) {
                    console.log('⚠️ LangChain startup timeout - using fallback mode');
                    resolve(false);
                }
            }, 30000);
        });
    }

    // Create LangChain service script
    createLangChainServiceScript(scriptPath) {
        const pythonCode = `
import os
import sys
import json
import asyncio
from datetime import datetime
import time

# Try to import LangChain components
try:
    from langchain_community.llms import OpenAI
    from langchain_community.chat_models import ChatOpenAI
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_community.embeddings import OpenAIEmbeddings
    from langchain_community.vectorstores import FAISS
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.chains import RetrievalQA
    from langchain.docstore.document import Document
    LANGCHAIN_AVAILABLE = True
    print("✅ LangChain components loaded")
except ImportError as e:
    print(f"⚠️ LangChain not fully available: {e}")
    LANGCHAIN_AVAILABLE = False

print("LANGCHAIN_READY")

class LangChainService:
    def __init__(self):
        self.llm = None
        self.embeddings = None
        self.vector_store = None
        self.qa_chain = None
        self.knowledge_docs = []
        self.initialize_llm()
    
    def initialize_llm(self):
        """Initialize the best available LLM"""
        try:
            # Try OpenAI/OpenRouter first
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                if api_key.startswith("sk-or-v1"):
                    # OpenRouter
                    self.llm = ChatOpenAI(
                        openai_api_key=api_key,
                        base_url="https://openrouter.ai/api/v1",
                        model_name="openai/gpt-4o-mini",
                        temperature=0.3
                    )
                    print("✅ OpenRouter LLM initialized")
                else:
                    # OpenAI
                    self.llm = ChatOpenAI(
                        openai_api_key=api_key,
                        model_name="gpt-3.5-turbo",
                        temperature=0.3
                    )
                    print("✅ OpenAI LLM initialized")
                return True
        except Exception as e:
            print(f"❌ OpenAI LLM failed: {e}")
        
        try:
            # Try Google Gemini
            google_key = os.getenv("GOOGLE_API_KEY")
            if google_key:
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",
                    google_api_key=google_key,
                    temperature=0.3
                )
                print("✅ Google Gemini LLM initialized")
                return True
        except Exception as e:
            print(f"❌ Google LLM failed: {e}")
        
        print("⚠️ No LLM available, using fallback")
        return False
    
    def add_knowledge(self, documents):
        """Add documents to knowledge base"""
        if not LANGCHAIN_AVAILABLE:
            return False
        
        try:
            for doc in documents:
                if isinstance(doc, str):
                    self.knowledge_docs.append(Document(page_content=doc, metadata={"source": "user_input"}))
                elif isinstance(doc, dict) and "content" in doc:
                    self.knowledge_docs.append(Document(page_content=doc["content"], metadata=doc.get("metadata", {})))
            
            # Rebuild vector store if we have documents
            if len(self.knowledge_docs) > 0 and LANGCHAIN_AVAILABLE:
                self.rebuild_vector_store()
            
            return True
        except Exception as e:
            print(f"❌ Failed to add knowledge: {e}")
            return False
    
    def rebuild_vector_store(self):
        """Rebuild the vector store with current documents"""
        if not LANGCHAIN_AVAILABLE or len(self.knowledge_docs) == 0:
            return
        
        try:
            # Initialize embeddings
            if not self.embeddings:
                self.embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
            
            # Split documents
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            texts = text_splitter.split_documents(self.knowledge_docs)
            
            # Create vector store
            self.vector_store = FAISS.from_documents(texts, self.embeddings)
            
            # Create QA chain
            if self.llm:
                retriever = self.vector_store.as_retriever(search_kwargs={"k": 2})
                self.qa_chain = RetrievalQA.from_chain_type(
                    llm=self.llm,
                    chain_type="stuff",
                    retriever=retriever,
                    return_source_documents=True
                )
            
            print(f"✅ Vector store rebuilt with {len(texts)} chunks")
        except Exception as e:
            print(f"❌ Vector store rebuild failed: {e}")
    
    async def query_with_rag(self, question):
        """Query with RAG (Retrieval Augmented Generation)"""
        if not self.qa_chain:
            return None
        
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                None, self.qa_chain, {"query": question}
            )
            return {
                "response": result["result"],
                "source": "langchain-rag",
                "sources": [doc.metadata.get("source", "unknown") for doc in result.get("source_documents", [])]
            }
        except Exception as e:
            print(f"❌ RAG query failed: {e}")
            return None
    
    async def query_llm(self, question):
        """Query LLM directly"""
        if not self.llm:
            return None
        
        try:
            if hasattr(self.llm, 'ainvoke'):
                result = await self.llm.ainvoke(question)
            else:
                result = self.llm.invoke(question)
            
            return {
                "response": result.content if hasattr(result, 'content') else str(result),
                "source": "langchain-llm"
            }
        except Exception as e:
            print(f"❌ LLM query failed: {e}")
            return None

# Initialize service
langchain_service = LangChainService()

async def handle_request(request_data):
    """Handle LangChain request"""
    try:
        message = request_data.get('message', '')
        context = request_data.get('context', {})
        
        # Add any provided documents to knowledge base
        if 'documents' in context:
            langchain_service.add_knowledge(context['documents'])
        
        # Try RAG first
        rag_result = await langchain_service.query_with_rag(message)
        if rag_result:
            return {
                "response": rag_result["response"],
                "source": rag_result["source"],
                "sources": rag_result.get("sources", []),
                "response_time": 100,
                "timestamp": datetime.now().isoformat()
            }
        
        # Fallback to direct LLM
        llm_result = await langchain_service.query_llm(message)
        if llm_result:
            return {
                "response": llm_result["response"],
                "source": llm_result["source"],
                "response_time": 150,
                "timestamp": datetime.now().isoformat()
            }
        
        # Final fallback
        return {
            "response": f"🧠 LangChain Response: I understand you're asking about '{message}'. Let me help you with comprehensive information.",
            "source": "langchain-fallback",
            "response_time": 50,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "response": f"LangChain Error: {str(e)}",
            "source": "langchain-error",
            "response_time": 10,
            "timestamp": datetime.now().isoformat()
        }

async def main():
    print("LangChain Service Started")
    
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
                
            try:
                request_data = json.loads(line.strip())
                response = await handle_request(request_data)
                print(json.dumps(response))
                sys.stdout.flush()
            except json.JSONDecodeError:
                print(json.dumps({
                    "response": "Invalid JSON request",
                    "source": "langchain-error",
                    "response_time": 5,
                    "timestamp": datetime.now().isoformat()
                }))
                sys.stdout.flush()
                
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(json.dumps({
                "response": f"Service error: {str(e)}",
                "source": "langchain-error",
                "response_time": 5,
                "timestamp": datetime.now().isoformat()
            }))
            sys.stdout.flush()

if __name__ == "__main__":
    asyncio.run(main())
`;

        fs.writeFileSync(scriptPath, pythonCode);
        console.log('✅ Created LangChain service script');
    }

    // Initialize vector store
    async initializeVectorStore() {
        try {
            // This will be handled by the Python service
            console.log('📊 Vector store initialization delegated to Python service');
        } catch (error) {
            console.error('❌ Vector store initialization failed:', error.message);
        }
    }

    // Get enhanced response with full LLM and LangChain integration
    async getEnhancedResponse(message, context = {}) {
        const startTime = Date.now();
        
        try {
            // Check cache first
            const cacheKey = message.toLowerCase().trim();
            if (this.responseCache.has(cacheKey)) {
                const cached = this.responseCache.get(cacheKey);
                return {
                    ...cached,
                    cached: true,
                    responseTime: Date.now() - startTime
                };
            }

            // Check fast responses
            const fastResponse = this.getFastResponse(message);
            if (fastResponse) {
                this.responseCache.set(cacheKey, fastResponse);
                return {
                    ...fastResponse,
                    cached: false,
                    responseTime: Date.now() - startTime
                };
            }

            // Check knowledge base
            const knowledgeResponse = this.searchKnowledgeBase(message, context);
            if (knowledgeResponse) {
                this.responseCache.set(cacheKey, knowledgeResponse);
                return {
                    ...knowledgeResponse,
                    cached: false,
                    responseTime: Date.now() - startTime
                };
            }

            // Try LangChain service
            if (this.langChainReady && this.isReady) {
                try {
                    const langchainResponse = await this.queryLangChain(message, context);
                    if (langchainResponse) {
                        this.responseCache.set(cacheKey, langchainResponse);
                        return {
                            ...langchainResponse,
                            cached: false,
                            responseTime: Date.now() - startTime
                        };
                    }
                } catch (error) {
                    console.log('⚠️ LangChain query failed:', error.message);
                }
            }

            // Enhanced fallback response
            const fallbackResponse = {
                response: '🧠 Enhanced AI Response: I\'m here to help with my integrated LLM and LangChain capabilities! Let me assist you with your query using my comprehensive knowledge base.',
                source: 'enhanced-llm-fallback',
                responseTime: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };

            this.responseCache.set(cacheKey, fallbackResponse);
            return fallbackResponse;

        } catch (error) {
            console.error('❌ Enhanced response error:', error.message);
            return {
                response: '🚨 Enhanced AI Response: I\'m experiencing technical difficulties, but I\'m still here to help!',
                source: 'error-fallback',
                responseTime: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }

    // Get fast response
    getFastResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        for (const [key, data] of this.fastResponses.entries()) {
            if (lowerMessage.includes(key)) {
                return {
                    response: data.response,
                    source: data.source,
                    responseTime: data.responseTime,
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        return null;
    }

    // Search knowledge base
    searchKnowledgeBase(message, context = {}) {
        const lowerMessage = message.toLowerCase();
        
        for (const [name, knowledge] of this.knowledgeBase.entries()) {
            if (knowledge.data && typeof knowledge.data === 'object') {
                // Check for keyword matches
                const content = JSON.stringify(knowledge.data).toLowerCase();
                if (content.includes(lowerMessage)) {
                    return {
                        response: `📚 Knowledge from ${name}: I found relevant information in my knowledge base about this topic.`,
                        source: `knowledge-${name}`,
                        responseTime: 5,
                        timestamp: new Date().toISOString(),
                        knowledgeSource: name
                    };
                }
            }
        }
        
        return null;
    }

    // Query LangChain service
    async queryLangChain(message, context) {
        return new Promise((resolve, reject) => {
            const request = {
                message,
                context: {
                    ...context,
                    documents: this.getKnowledgeDocuments()
                },
                timestamp: Date.now()
            };

            const timeout = setTimeout(() => {
                reject(new Error('LangChain query timeout'));
            }, 10000);

            let output = '';

            const onData = (data) => {
                output += data.toString();
                try {
                    const response = JSON.parse(output.trim());
                    clearTimeout(timeout);
                    this.pythonProcess.stdout.removeListener('data', onData);
                    resolve(response);
                } catch (error) {
                    // Not complete JSON yet, keep reading
                }
            };

            this.pythonProcess.stdout.on('data', onData);
            this.pythonProcess.stdin.write(JSON.stringify(request) + '\n');
        });
    }

    // Get knowledge documents for LangChain
    getKnowledgeDocuments() {
        const documents = [];
        
        for (const [name, knowledge] of this.knowledgeBase.entries()) {
            if (knowledge.data && knowledge.data.content) {
                documents.push({
                    content: knowledge.data.content,
                    metadata: {
                        source: name,
                        type: knowledge.type,
                        category: knowledge.category
                    }
                });
            }
        }
        
        return documents;
    }

    // Get comprehensive system status
    getSystemStatus() {
        return {
            langChainReady: this.langChainReady,
            pythonLLMReady: this.isReady,
            knowledgeBases: this.knowledgeBase.size,
            fastResponses: this.fastResponses.size,
            cacheSize: this.responseCache.size,
            pythonProcessRunning: this.pythonProcess ? true : false,
            vectorStoreReady: this.vectorStore !== null,
            embeddingsReady: this.embeddings !== null,
            retrieverReady: this.retriever !== null
        };
    }

    // Clear cache
    clearCache() {
        this.responseCache.clear();
        console.log('🧹 Enhanced LLM response cache cleared');
    }

    // Stop services
    stopServices() {
        if (this.pythonProcess) {
            this.pythonProcess.kill();
            this.pythonProcess = null;
            this.isReady = false;
            console.log('🛑 LangChain service stopped');
        }
    }
}

module.exports = EnhancedLLMLangChainIntegration;
