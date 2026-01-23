const express = require('express');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Import role-specific knowledge bases
const Student = require('../models/Student');
const studentKnowledge = require('../knowledge/studentKnowledge');
const facultyKnowledge = require('../knowledge/facultyKnowledge');
const adminKnowledge = require('../knowledge/adminKnowledge');

console.log('✅ Chat routes initialized with role-specific knowledge bases');

const dataDir = path.join(__dirname, '..', 'data');
const chatHistoryPath = path.join(dataDir, 'chatHistory.json');

function ensureChatHistoryStore() {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(chatHistoryPath)) {
            fs.writeFileSync(chatHistoryPath, JSON.stringify([]));
        }
    } catch (err) {
        console.error('[VuAiAgent] Failed to initialize chat history store:', err.message);
    }
}

function readChatHistory() {
    try {
        ensureChatHistoryStore();
        const raw = fs.readFileSync(chatHistoryPath, 'utf8') || '[]';
        return JSON.parse(raw);
    } catch (err) {
        console.error('[VuAiAgent] Failed to read chat history:', err.message);
        return [];
    }
}

function writeChatHistory(history) {
    try {
        ensureChatHistoryStore();
        fs.writeFileSync(chatHistoryPath, JSON.stringify(history, null, 2));
    } catch (err) {
        console.error('[VuAiAgent] Failed to write chat history:', err.message);
    }
}

function appendChatEntry(entry) {
    const history = readChatHistory();
    history.push(entry);
    // Keep the file from growing indefinitely (retain latest 500 conversations)
    const MAX_ENTRIES = 500;
    const trimmed = history.length > MAX_ENTRIES ? history.slice(history.length - MAX_ENTRIES) : history;
    writeChatHistory(trimmed);
}

// Helper function to find matching knowledge
function findKnowledgeMatch(userMessage, knowledgeBase, context) {
    const lowerMessage = userMessage.toLowerCase();

    // Check each knowledge category
    for (const [category, data] of Object.entries(knowledgeBase)) {
        if (category === 'default') continue; // Skip default for now

        if (data.keywords) {
            // Check if any keyword matches
            const hasMatch = data.keywords.some(keyword =>
                lowerMessage.includes(keyword.toLowerCase())
            );

            if (hasMatch) {
                // Return the response (call it if it's a function)
                return typeof data.response === 'function'
                    ? data.response(context)
                    : data.response;
            }
        }
    }

    // Return default response if no match found
    return typeof knowledgeBase.default.response === 'function'
        ? knowledgeBase.default.response(userMessage)
        : knowledgeBase.default.response;
}

// Get appropriate knowledge base based on role
function getKnowledgeBase(role) {
    const normalizedRole = (role || 'student').toLowerCase();

    if (normalizedRole === 'admin' || normalizedRole === 'administrator') {
        return adminKnowledge;
    } else if (normalizedRole === 'faculty' || normalizedRole === 'teacher' || normalizedRole === 'professor') {
        return facultyKnowledge;
    } else {
        return studentKnowledge;
    }
}

// Retrieve stored chat history
router.get('/history', (req, res) => {
    try {
        const { userId, role, limit } = req.query;
        const history = readChatHistory();
        let filtered = history;

        if (userId) {
            filtered = filtered.filter(entry => String(entry.userId || 'guest') === String(userId));
        }
        if (role) {
            filtered = filtered.filter(entry => (entry.role || 'student').toLowerCase() === role.toLowerCase());
        }

        const cap = Math.max(1, Math.min(parseInt(limit, 10) || 50, 200));
        const result = filtered.slice(-cap);
        res.json(result);
    } catch (error) {
        console.error('[VuAiAgent] Failed to fetch history:', error);
        res.status(500).json({ message: 'Unable to fetch chat history', error: error.message });
    }
});

router.post('/', async (req, res) => {
    console.log('🤖 Received VuAiAgent request:', req.body);

    try {
        // Destructure the payload sent from VuAiAgent.jsx
        const { userId, prompt, role, context, query } = req.body;
        const userMessage = prompt || query || '';
        const rawMessage = userMessage;

        if (!userMessage) return res.status(400).json({ error: 'Please provide a message' });

        console.log(`[VuAiAgent] Request from ${role || 'student'} (${userId || 'guest'}): ${rawMessage}`);

        const knowledgeBase = getKnowledgeBase(role);
        let reply = '';

        // 1. DYNAMIC INTEGRATION: Try Python VuAI Agent (LangChain + Local Knowledge)
        try {
            console.log('[VuAiAgent] Attempting to reach Python Agent on port 8000...');
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId || 'guest',
                    message: userMessage,
                    role: role || 'student',
                    user_name: context?.name || 'User'
                }),
                signal: AbortSignal.timeout(10000) // 10s timeout
            });

            if (response.ok) {
                const pythonData = await response.json();
                if (pythonData && pythonData.response) {
                    console.log('[VuAiAgent] Success: Response from Python Agent.');
                    reply = pythonData.response;
                }
            }
        } catch (pythonErr) {
            console.warn('[VuAiAgent] Python Agent unavailable or timed out. Falling back to Node-native LLM.');
        }

        // 1.5. Fallback: Try OpenAI or Gemini directly from Node
        if (!reply && process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                // Build role-specific system context
                let systemContext = '';
                if (role === 'admin') {
                    systemContext = `You are VuAiAgent, a helpful university administrative assistant.
            You are speaking with an Administrator.
            Help them with system management, user administration, and oversight tasks.
            Be professional and efficient.`;
                } else if (role === 'faculty') {
                    systemContext = `You are VuAiAgent, a helpful university assistant for faculty.
            You are speaking with a Faculty Member.
            Help them with student management, material uploads, and teaching tasks.
            Be respectful and supportive.`;
                } else {
                    systemContext = `You are VuAiAgent, a friendly university assistant for students.
            You are speaking with a Year ${context?.year || 'N/A'} student in ${context?.branch || 'Engineering'}, Section ${context?.section || 'N/A'}.
            Help them with studies, schedules, and academic queries.
            Be encouraging and helpful.`;
                }

                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: systemContext },
                        { role: "user", content: rawMessage }
                    ],
                    model: "gpt-3.5-turbo",
                    temperature: 0.7,
                    max_tokens: 200
                });

                reply = completion.choices[0].message.content;
                console.log('[VuAiAgent] Response from OpenAI');
            } catch (aiError) {
                console.error("[VuAiAgent] OpenAI API Error (Falling back to other models):", aiError.message);
            }
        }

        // 1.5. Try Google Gemini if API Key is present
        if (!reply && process.env.GOOGLE_API_KEY) {
            try {
                console.log('[VuAiAgent] Attempting Google Gemini...');
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                let systemContext = '';
                if (role === 'admin') {
                    systemContext = `You are VuAiAgent (ADMIN MODE 🔑). 
                    Your goal is to assist the University Administrator in strategic oversight.
                    1. Focus on system health, user analytics, and INNOVATION.
                    2. Suggest tips for managing faculty and students efficiently.
                    3. Act as a visionary strategic partner.
                    Tone: Authoritative, strategic, and professional.`;
                } else if (role === 'faculty') {
                    systemContext = `You are VuAiAgent (FACULTY MODE 👨‍🏫). 
                    Your goal is to assist a Professor/Faculty member.
                    1. Help with lesson planning, student performance tracking, and material management.
                    2. Assist in creating quizzes, assignments, and curriculum updates.
                    3. Act as an efficient teaching assistant.
                    Tone: Respectful, organized, and academic.`;
                } else {
                    systemContext = `You are VuAiAgent (STUDENT MODE 🎓). 
                    Your goal is to assist a Year ${context?.year || 'N/A'} student in ${context?.branch || 'Engineering'}.
                    1. Be extremely WARM, FRIENDLY, and ENCOURAGING. Use emojis like ✨🎓🚀.
                    2. Prioritize solving subject doubts (Math, CSE, ECE, AI). Use analogies for complex concepts.
                    3. Help with homework and navigating course notes.
                    4. Identify the user as ${context?.name || 'Friend'}. 
                    Tone: Encouraging, motivating study companion.`;
                }

                const promptWithContext = `SYSTEM INSTRUCTIONS: ${systemContext}\n\nKNOWLEDGE BASE MATCH: ${findKnowledgeMatch(userMessage, knowledgeBase, context)}\n\nUser Message: ${userMessage}`;
                console.log('[VuAiAgent] Dispatched to Gemini with role-specific persona:', role);
                const result = await model.generateContent(promptWithContext);
                reply = result.response.text();
                console.log('[VuAiAgent] Response from Google Gemini');
            } catch (geminiError) {
                console.error("[VuAiAgent] Google Gemini Error:", geminiError.message);
            }
        }

        // 2. Fallback: Use role-specific knowledge base
        if (!reply) {
            reply = findKnowledgeMatch(userMessage, knowledgeBase, context);
            console.log('[VuAiAgent] Response from knowledge base');
        }

        // 3. Return the response in the format expected by the frontend
        const responsePayload = {
            response: reply,
            timestamp: new Date().toISOString(),
            role: role || 'student'
        };

        appendChatEntry({
            id: uuidv4(),
            userId: userId || 'guest',
            role: role || 'student',
            message: userMessage,
            response: reply,
            context: context || {},
            timestamp: responsePayload.timestamp
        });

        // 4. Update Student Stats (Link Data)
        if ((role === 'student' || !role) && userId && userId !== 'guest') {
            try {
                // Find student by SID and increment stats.aiUsageCount
                // Using findOneAndUpdate with upsert option just in case, but usually student exists
                await Student.findOneAndUpdate(
                    { sid: userId },
                    {
                        $inc: { "stats.aiUsageCount": 1 },
                        $set: { "stats.lastLogin": new Date() } // Also update activity
                    }
                );
                console.log(`[VuAiAgent] 📈 Stats updated for student ${userId}`);
            } catch (statErr) {
                console.warn('[VuAiAgent] Failed to update student stats:', statErr.message);
            }
        }

        res.status(200).json(responsePayload);

    } catch (error) {
        console.error("[VuAiAgent] Backend Error:", error);
        res.status(500).json({
            message: "I'm having trouble processing your request right now. Please try again in a moment!",
            error: error.message
        });
    }
});

module.exports = router;
