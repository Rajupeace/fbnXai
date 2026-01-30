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

const mongoose = require('mongoose');
const ChatModel = require('../models/Chat');

async function readChatHistory(userId, role) {
    if (mongoose.connection.readyState !== 1) {
        console.warn('[VuAiAgent] MongoDB not connected for history fetch');
        return [];
    }
    try {
        const query = userId ? { userId } : {};
        if (role) query.role = role;

        const docs = await ChatModel.find(query).sort({ timestamp: -1 }).limit(50).lean();
        return docs.reverse(); // oldest first for context
    } catch (err) {
        console.error('[VuAiAgent] Mongo readChatHistory failed:', err.message);
        return [];
    }
}

async function appendChatEntry(entry) {
    if (mongoose.connection.readyState === 1) {
        try {
            const doc = new ChatModel(entry);
            await doc.save();
            return;
        } catch (err) {
            console.error('[VuAiAgent] Failed to append chat to Mongo:', err.message);
        }
    }
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

// Detect LeetCode-style requests and extract requested language/level
function isLeetCodeRequest(message) {
    if (!message) return false;
    const lower = message.toLowerCase();
    return lower.includes('leetcode') || lower.match(/solve\s+problem/i) || lower.match(/two sum|reverse linked list|binary tree|longest substring|median of two/i);
}

async function generateLeetCodeSolution(userMessage, role, context) {
    if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_API_KEY) {
        return "LeetCode helper unavailable — no LLM API configured. Please set OPENAI_API_KEY or GOOGLE_API_KEY.";
    }

    // Try to detect requested language from the message
    const langMatch = (userMessage || '').match(/in\s+(python|java|c\+\+|cpp|javascript|ts|typescript|c#|csharp|go|rust)/i);
    let language = langMatch ? langMatch[1].toLowerCase() : 'python';
    if (language === 'cpp') language = 'C++';
    if (language === 'ts') language = 'TypeScript';
    if (language === 'csharp') language = 'C#';

    const systemPrompt = `You are a programming tutor that provides original, non-infringing solutions to common algorithm problems (like LeetCode).\nConstraints:\n- Do NOT copy proprietary problem statements or solutions verbatim.\n- Produce a brief problem summary, an algorithm explanation, time/space complexity, and a runnable solution in the requested language.\n- If the user requests a "hard" problem or asks for premium content, offer to provide a high-level approach instead of full copyrighted content.\n- Target audience: students learning algorithms; be concise and educative.`;

    const userPrompt = `User Request:\n${userMessage}\n\nRespond with: (1) Short summary (2) Algorithm approach (3) Complexity (4) Code in ${language}. Use fenced code blocks and keep the code runnable.`;

    try {
        if (process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4o-mini',
                temperature: 0.2,
                max_tokens: 1200
            });
            return completion.choices[0].message.content;
        } else if (process.env.GOOGLE_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5' });
            const promptWithContext = `${systemPrompt}\n\n${userPrompt}`;
            const result = await model.generateContent(promptWithContext);
            return result.response.text();
        }
    } catch (err) {
        console.error('[VuAiAgent] LeetCode generator error:', err?.message || err);
        return "Sorry — the code generator failed. Try again later or ask for a different language.";
    }

    return "LeetCode helper is currently unavailable.";
}

// Retrieve stored chat history
router.get('/history', async (req, res) => {
    try {
        const { userId, role, limit } = req.query;
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'MongoDB not connected. Chat history unavailable.' });
        }

        const history = await readChatHistory(userId, role);
        res.json(history);
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

        // If this looks like a LeetCode / algorithm problem request, route to the generator first
        try {
            if (isLeetCodeRequest(userMessage)) {
                console.log('[VuAiAgent] Detected LeetCode-style request. Generating solution via LLM generator.');
                reply = await generateLeetCodeSolution(userMessage, role, context);
            }
        } catch (lcErr) {
            console.warn('[VuAiAgent] LeetCode generator failed:', lcErr?.message || lcErr);
        }

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
        // User requested: "Ai think own give the responed and clears the doubts ai own no knowledge document"
        // So we prioritized the LLM's own knowledge.
        if (!reply && (process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY)) {
            try {
                let systemContext = '';
                if (role === 'admin') {
                    systemContext = `You are Friendly Agent (ADMIN HELPER). Provide fast, clear, and strategic answers. Use {{NAVIGATE: section}} if needed.`;
                } else if (role === 'faculty') {
                    systemContext = `You are Friendly Agent (FACULTY ASSISTANT). Assist efficiently with curriculum and teaching. Use {{NAVIGATE: section}} if needed.`;
                } else {
                    systemContext = `You are Friendly Agent (STUDY COMPANION). 
                    Goal: Provide fast, clear, and accurate answers to students. Clear doubts and explain concepts simply.
                    Action: Use {{NAVIGATE: section}} to guide the student. Sections: overview, semester, journal, advanced, attendance, exams, faculty, schedule, marks.
                    Tone: Super friendly, helpful, and concise.`;
                }

                // Append local context purely as "Contextual Data" (e.g., student name, year), NOT hardcoded FAQ answers.
                const studentContext = `Student Profile: Year ${context.year}, Branch ${context.branch}, Name ${context.name}.`;

                if (process.env.OPENAI_API_KEY) {
                    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                    const completion = await openai.chat.completions.create({
                        messages: [
                            { role: "system", content: systemContext },
                            { role: "system", content: studentContext },
                            { role: "user", content: rawMessage }
                        ],
                        model: "gpt-4o-mini", // Higher capability
                        temperature: 0.8, // Higher creativity
                        max_tokens: 500
                    });
                    reply = completion.choices[0].message.content;
                } else if (process.env.GOOGLE_API_KEY) {
                    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const promptWithContext = `${systemContext}\n\n${studentContext}\n\nUser Message: ${userMessage}`;
                    const result = await model.generateContent(promptWithContext);
                    reply = result.response.text();
                }
                console.log('[VuAiAgent] Response from Cloud LLM (Thinking Mode)');
            } catch (aiError) {
                console.error("[VuAiAgent] Cloud AI Error:", aiError.message);
            }
        }

        // 2. Fallback: Use role-specific knowledge base ONLY if LLMs failed
        if (!reply) {
            console.log('[VuAiAgent] LLMs failed, falling back to local knowledge base.');
            reply = findKnowledgeMatch(userMessage, knowledgeBase, context);
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

        // 4. Update Student Stats (Link Data & Streak)
        if ((role === 'student' || !role) && userId && userId !== 'guest') {
            try {
                // Fetch student to calculate streak
                const student = await Student.findOne({ sid: userId });

                if (student) {
                    const now = new Date();
                    const lastLogin = student.stats?.lastLogin ? new Date(student.stats.lastLogin) : null;
                    let newStreak = student.stats?.streak || 0;

                    if (lastLogin) {
                        // Compare dates at midnight (ignore time)
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                        const last = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
                        const diffTime = Math.abs(today - last);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            // Visited yesterday: Increment streak
                            newStreak += 1;
                        } else if (diffDays > 1) {
                            // Missing a day or more: Reset streak to 1 (starting today)
                            newStreak = 1;
                        } else if (newStreak === 0) {
                            newStreak = 1;
                        }
                        // If diffDays === 0 (visited today), keep currrent streak
                    } else {
                        // First time login
                        newStreak = 1;
                    }

                    // Update Weekly Activity (Study Hours)
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const currentDayName = dayNames[now.getDay()];

                    // Increment hours for today
                    await Student.updateOne(
                        { sid: userId, "stats.weeklyActivity.day": currentDayName },
                        { $inc: { "stats.weeklyActivity.$.hours": 0.2 } }
                    );

                    await Student.updateOne(
                        { sid: userId },
                        {
                            $inc: { "stats.aiUsageCount": 1 },
                            $set: {
                                "stats.lastLogin": now,
                                "stats.streak": newStreak
                            }
                        }
                    );
                    console.log(`[VuAiAgent] 📈 Stats updated for student ${userId} (Streak: ${newStreak} days)`);
                }
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
