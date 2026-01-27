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
const mongoose = require('mongoose');
const ChatModel = require('../models/Chat');

function ensureChatHistoryStore() {
    try {
        // If MongoDB is available, prefer DB and avoid local file creation
        if (mongoose.connection && mongoose.connection.readyState === 1) return;
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

async function readChatHistory() {
    // Prefer MongoDB storage when available
    if (mongoose.connection.readyState === 1) {
        try {
            const docs = await ChatModel.find({}).sort({ timestamp: -1 }).limit(500).lean();
            return docs.reverse(); // oldest first
        } catch (err) {
            console.warn('[VuAiAgent] Mongo readChatHistory failed:', err.message);
        }
    }

    try {
        ensureChatHistoryStore();
        const raw = fs.readFileSync(chatHistoryPath, 'utf8') || '[]';
        return JSON.parse(raw);
    } catch (err) {
        console.error('[VuAiAgent] Failed to read chat history:', err.message);
        return [];
    }
}

async function writeChatHistory(history) {
    // If Mongo connected, write each entry into DB (replace file storage)
    if (mongoose.connection.readyState === 1) {
        try {
            // Bulk insert but ensure we don't duplicate: insert new ones only
            const ops = history.map(h => ({ insertOne: { document: h } }));
            if (ops.length) await ChatModel.bulkWrite(ops);
            return;
        } catch (err) {
            console.warn('[VuAiAgent] Mongo writeChatHistory failed:', err.message);
        }
    }

    try {
        ensureChatHistoryStore();
        fs.writeFileSync(chatHistoryPath, JSON.stringify(history, null, 2));
    } catch (err) {
        console.error('[VuAiAgent] Failed to write chat history:', err.message);
    }
}

async function appendChatEntry(entry) {
    if (mongoose.connection.readyState === 1) {
        try {
            const doc = new ChatModel(entry);
            await doc.save();
            return;
        } catch (err) {
            console.warn('[VuAiAgent] Failed to append chat to Mongo:', err.message);
            // fallback to file append
        }
    }

    const history = await readChatHistory();
    history.push(entry);
    const MAX_ENTRIES = 500;
    const trimmed = history.length > MAX_ENTRIES ? history.slice(history.length - MAX_ENTRIES) : history;
    await writeChatHistory(trimmed);
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
router.get('/history', async (req, res) => {
    try {
        const { userId, role, limit } = req.query;
        // Require MongoDB for chat history used in dashboards and analytics
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'MongoDB not connected. Chat history unavailable.' });
        }

        const history = await readChatHistory();
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
                    systemContext = `You are VuAiAgent (SENTINEL ADMIN MODE 🦾). 
                    Focus on strategic oversight, system analytics, and governance. 
                    If relevant, use {{NAVIGATE: section}} where section is one of: overview, students, faculty, courses, materials, attendance, schedule, todos, messages, broadcast, exams.
                    Use Markdown and professional tone.`;
                } else if (role === 'faculty') {
                    systemContext = `You are VuAiAgent (FACULTY NEXUS MODE 🎓). 
                    Assist with curriculum, student performance, and material management.
                    If relevant, use {{NAVIGATE: section}} where section is one of: overview, materials, attendance, exams, schedule, students, broadcast, messages.
                    Use Markdown and academic tone.`;
                } else {
                    systemContext = `You are VuAiAgent (LUMINA STUDENT MODE ✨). 
                    Help students with studies, syllabus, and academic queries.
                    If relevant, use {{NAVIGATE: section}} where section is one of: overview, semester, journal, advanced, attendance, exams, faculty, schedule, marks.
                    Use Markdown, emojis, and encouraging tone.`;
                }

                const localKnowledge = findKnowledgeMatch(userMessage, knowledgeBase, context);
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: systemContext },
                        { role: "system", content: `Local Knowledge Base Match: ${localKnowledge}` },
                        { role: "user", content: rawMessage }
                    ],
                    model: "gpt-4o-mini", // Higher capability
                    temperature: 0.7,
                    max_tokens: 400
                });

                reply = completion.choices[0].message.content;
                console.log('[VuAiAgent] Response from OpenAI (Integrated with local knowledge)');
            } catch (aiError) {
                console.error("[VuAiAgent] OpenAI API Error:", aiError.message);
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
                    systemContext = `You are VuAiAgent (SENTINEL ADMIN MODE 🦾). 
                    Goal: Strategic oversight and system health.
                    Action: Use {{NAVIGATE: section}} for fast jumping. Sections: overview, students, faculty, courses, materials, attendance, schedule, todos, messages, broadcast, exams.
                    Tone: Strategic, professional, concise. Use Markdown.`;
                } else if (role === 'faculty') {
                    systemContext = `You are VuAiAgent (FACULTY NEXUS MODE 🎓). 
                    Goal: Assist teaching and content management.
                    Action: Use {{NAVIGATE: section}} for navigation. Sections: overview, materials, attendance, exams, schedule, students, broadcast, messages.
                    Tone: Organized, academic, helpful. Use Markdown.`;
                } else {
                    systemContext = `You are VuAiAgent (LUMINA STUDENT MODE ✨). 
                    Goal: Motivating academic companion. 
                    Action: Use {{NAVIGATE: section}} to guide the student. Sections: overview, semester, journal, advanced, attendance, exams, faculty, schedule, marks.
                    Tone: Encouraging, friendly, emoji-rich. Use Markdown.`;
                }

                const promptWithContext = `SYSTEM INSTRUCTIONS: ${systemContext}\n\nKNOWLEDGE BASE MATCH: ${findKnowledgeMatch(userMessage, knowledgeBase, context)}\n\nUser Message: ${userMessage}`;
                console.log('[VuAiAgent] Dispatched to Gemini with navigation-aware persona:', role);
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

        await appendChatEntry({
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
