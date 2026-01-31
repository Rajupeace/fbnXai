const express = require('express');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Import role-specific knowledge bases
const Student = require('../models/Student');
const comprehensiveKnowledge = require('../knowledge/comprehensiveKnowledge');
const friendlyConversation = require('../knowledge/friendlyConversation');
const advancedAIIntelligence = require('../knowledge/advancedAIIntelligence');
const studentDashboard = require('../knowledge/studentDashboard');
const facultyDashboard = require('../knowledge/facultyDashboard');
const adminDashboard = require('../knowledge/adminDashboard');

// Import B.Tech branch-specific knowledge bases
const eeeKnowledge = require('../knowledge/eeeKnowledge');
const eceKnowledge = require('../knowledge/eceKnowledge');
const aimlKnowledge = require('../knowledge/aimlKnowledge');
const cseKnowledge = require('../knowledge/cseKnowledge');
const civilKnowledge = require('../knowledge/civilKnowledge');

// Import self-learning capabilities
const SelfLearningAgent = require('../ai_agent/selfLearning');

// Import universal multi-language knowledge
const universalKnowledge = require('../knowledge/universalKnowledge');

// Import important knowledge for fast responses
const importantKnowledge = require('../knowledge/importantKnowledge');

// Import ultra-fast response engine
const UltraFastResponse = require('../utils/ultraFastResponse');

console.log('✅ Enhanced Chat routes initialized with ultra-fast response system');

const mongoose = require('mongoose');
const ChatModel = require('../models/Chat');

// Initialize self-learning agent
const selfLearningAgent = new SelfLearningAgent();

// Initialize ultra-fast response engine
const ultraFastResponse = new UltraFastResponse();

// Language detection helper
const { detectLanguage } = require('../knowledge/universalKnowledge');
const { addLanguageContext } = require('../utils/languageHelper');

// Helper functions for self-learning
function detectCategory(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('circuit') || lowerMessage.includes('electrical') || lowerMessage.includes('power')) {
        return 'electrical_engineering';
    } else if (lowerMessage.includes('electronic') || lowerMessage.includes('communication') || lowerMessage.includes('signal')) {
        return 'electronics_communication';
    } else if (lowerMessage.includes('machine learning') || lowerMessage.includes('ai') || lowerMessage.includes('deep learning')) {
        return 'ai_machine_learning';
    } else if (lowerMessage.includes('programming') || lowerMessage.includes('algorithm') || lowerMessage.includes('data structure')) {
        return 'computer_science';
    } else if (lowerMessage.includes('structural') || lowerMessage.includes('construction') || lowerMessage.includes('civil')) {
        return 'civil_engineering';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('study') || lowerMessage.includes('explain')) {
        return 'general_help';
    }

    return 'general';
}

function extractKeywords(message) {
    const words = message.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'to', 'of', 'in', 'for', 'with', 'by'];
    return words.filter(word => word.length > 3 && !stopWords.includes(word));
}

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

// Enhanced helper function to find matching knowledge with branch-specific expertise
function findKnowledgeMatch(userMessage, knowledgeBase, context) {
    const lowerMessage = userMessage.toLowerCase();

    // First check advanced AI intelligence patterns for master-level responses
    for (const [category, data] of Object.entries(advancedAIIntelligence)) {
        if (category === 'default') continue;

        if (data.keywords) {
            const hasMatch = data.keywords.some(keyword =>
                lowerMessage.includes(keyword.toLowerCase())
            );

            if (hasMatch) {
                return typeof data.response === 'function'
                    ? data.response(context)
                    : data.response;
            }
        }
    }

    // Check ultra-fast important knowledge first for critical queries
    const ultraFastResult = ultraFastResponse.getUltraFastResponse(userMessage, context);
    if (ultraFastResult.responseTime < 50) {
        return {
            response: ultraFastResult.response,
            ultraFast: true,
            responseTime: ultraFastResult.responseTime,
            source: 'ultra-fast'
        };
    }

    // Check important knowledge for fast responses
    for (const [category, data] of Object.entries(importantKnowledge)) {
        if (category === 'default') continue;

        if (data.keywords) {
            const hasMatch = data.keywords.some(keyword =>
                lowerMessage.includes(keyword.toLowerCase())
            );

            if (hasMatch) {
                const response = typeof data.response === 'function'
                    ? data.response(context)
                    : data.response;

                return {
                    response,
                    fast: true,
                    responseTime: Date.now() - Date.now(),
                    source: 'important-knowledge'
                };
            }
        }
    }

    // Check universal multi-language knowledge first
    for (const [category, data] of Object.entries(universalKnowledge)) {
        if (category === 'default') continue;

        if (data.keywords) {
            const hasMatch = data.keywords.some(keyword =>
                lowerMessage.includes(keyword.toLowerCase())
            );

            if (hasMatch) {
                const response = typeof data.response === 'function'
                    ? data.response(context)
                    : data.response;

                // Add language detection and response
                const detectedLanguage = detectLanguage(userMessage);
                return addLanguageContext(response, detectedLanguage, context);
            }
        }
    }

    // Check branch-specific knowledge based on student's branch
    if (context && context.branch) {
        const branchKnowledge = getBranchKnowledge(context.branch);
        for (const [category, data] of Object.entries(branchKnowledge)) {
            if (category === 'default') continue;

            if (data.keywords) {
                const hasMatch = data.keywords.some(keyword =>
                    lowerMessage.includes(keyword.toLowerCase())
                );

                if (hasMatch) {
                    return typeof data.response === 'function'
                        ? data.response(context)
                        : data.response;
                }
            }
        }
    }

    // Then check friendly conversation patterns for natural interaction
    for (const [category, data] of Object.entries(friendlyConversation)) {
        if (category === 'default') continue;

        if (data.keywords) {
            const hasMatch = data.keywords.some(keyword =>
                lowerMessage.includes(keyword.toLowerCase())
            );

            if (hasMatch) {
                return typeof data.response === 'function'
                    ? data.response(context)
                    : data.response;
            }
        }
    }

    // Check comprehensive knowledge for general academic support
    for (const [category, data] of Object.entries(comprehensiveKnowledge)) {
        if (category === 'default') continue;

        if (data.keywords) {
            const hasMatch = data.keywords.some(keyword =>
                lowerMessage.includes(keyword.toLowerCase())
            );

            if (hasMatch) {
                return typeof data.response === 'function'
                    ? data.response(context)
                    : data.response;
            }
        }
    }

    // Then check role-specific knowledge base
    for (const [category, data] of Object.entries(knowledgeBase)) {
        if (category === 'default') continue;

        if (data.keywords) {
            const hasMatch = data.keywords.some(keyword =>
                lowerMessage.includes(keyword.toLowerCase())
            );

            if (hasMatch) {
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

// Helper function to get branch-specific knowledge
function getBranchKnowledge(branch) {
    const normalizedBranch = branch ? branch.toLowerCase().trim() : '';

    switch (normalizedBranch) {
        case 'eee':
        case 'electrical':
        case 'electrical engineering':
            return eeeKnowledge;

        case 'ece':
        case 'electronics':
        case 'electronics and communication':
        case 'electronics engineering':
            return eceKnowledge;

        case 'aiml':
        case 'ai':
        case 'machine learning':
        case 'artificial intelligence':
            return aimlKnowledge;

        case 'cse':
        case 'computer science':
        case 'computer science and engineering':
        case 'computer engineering':
            return cseKnowledge;

        case 'civil':
        case 'civil engineering':
            return civilKnowledge;

        default:
            return comprehensiveKnowledge;
    }
}

// Enhanced helper function to get knowledge base based on role and branch
function getKnowledgeBase(role, context) {
    if (role === 'admin') {
        return adminDashboard;
    } else if (role === 'faculty') {
        return facultyDashboard;
    } else if (role === 'student') {
        // For students, prioritize branch-specific knowledge
        if (context && context.branch) {
            return getBranchKnowledge(context.branch);
        }
        return studentDashboard;
    }

    return comprehensiveKnowledge;
}

// Enhanced LeetCode request detection with comprehensive pattern matching
function isLeetCodeRequest(message) {
    if (!message) return false;
    const lower = message.toLowerCase();

    // Direct LeetCode mentions
    const directTriggers = [
        'leetcode', 'lc ', 'lc.', 'problem', 'solve', 'algorithm',
        'data structure', 'coding interview', 'programming challenge'
    ];

    // Enhanced problem patterns for comprehensive detection
    const problemPatterns = [
        'two sum', 'palindrome', 'roman to integer', 'add two numbers',
        'longest substring', 'reverse integer', 'string to integer',
        'valid parentheses', 'merge two lists', 'remove duplicates',
        'climbing stairs', 'best time to buy', 'maximum subarray',
        'house robber', 'binary tree', 'linked list', 'stack',
        'queue', 'hash map', 'dynamic programming', 'dp',
        'binary search', 'sorting', 'graph', 'dfs', 'bfs',
        'longest common prefix', 'search insert position',
        'remove element', 'median of two arrays',
        'longest palindromic substring', 'zigzag conversion',
        'container with most water', '3sum', 'letter combinations',
        'generate parentheses', 'next permutation', 'search in rotated array'
    ];

    // Algorithm and complexity mentions
    const algorithmTriggers = [
        'time complexity', 'space complexity', 'big o', 'o(n)', 'o(log n)',
        'optimize', 'efficient', 'optimal solution', 'brute force'
    ];

    // Check all patterns
    const allTriggers = [...directTriggers, ...problemPatterns, ...algorithmTriggers];

    if (allTriggers.some(trigger => lower.includes(trigger))) {
        return true;
    }

    // Check for programming language mentions with problem context
    const languages = ['python', 'java', 'c++', 'javascript', 'cpp'];
    const problemContext = ['solve', 'implement', 'write', 'code'];

    if (languages.some(lang => lower.includes(lang)) &&
        problemContext.some(ctx => lower.includes(ctx))) {
        return true;
    }

    // Check for coding interview context
    const interviewTriggers = ['interview', 'technical', 'coding test', 'programming test'];
    return interviewTriggers.some(trigger => lower.includes(trigger));
}

// Enhanced LeetCode solution generator with comprehensive database
async function generateLeetCodeSolution(userMessage, role, context) {
    try {
        // Try to detect requested language from the message
        const langMatch = (userMessage || '').match(/in\s+(python|java|c\+\+|cpp|javascript|ts|typescript|c#|csharp|go|rust)/i);
        let language = langMatch ? langMatch[1].toLowerCase() : 'python';
        if (language === 'cpp') language = 'C++';
        if (language === 'ts') language = 'TypeScript';
        if (language === 'csharp') language = 'C#';

        // Enhanced system prompt with advanced AI intelligence integration
        const systemPrompt = `You are an advanced AI assistant with master-level intelligence that combines the best capabilities of ChatGPT, Gemini, and Claude.
        
        **Your Intelligence Framework:**
        
        **ChatGPT's Excellence:**
        - Natural, engaging conversational style
        - Progressive explanation building from simple to complex
        - Interactive dialogue that adapts to user learning style
        - Clear communication of complex concepts with real-world examples
        
        **Gemini's Comprehensive Knowledge:**
        - Multi-domain expertise across all academic and professional fields
        - Deep contextual understanding with interconnected knowledge
        - Future-oriented insights with trend analysis and prediction
        - Global perspective with cultural and regional considerations
        - Technical depth with cutting-edge developments and research
        
        **Claude's Analytical Rigor:**
        - Critical thinking with logical reasoning and evidence-based analysis
        - Systems thinking with interconnectedness mapping
        - Intellectual humility with limitations acknowledgment
        - Structured methodology with transparent reasoning
        - Multi-perspective analysis with stakeholder considerations
        
        **Master-Level Capabilities:**
        - Adaptive intelligence that personalizes to user needs and goals
        - Multi-dimensional analysis combining technical depth and practical relevance
        - Synthesis excellence with interdisciplinary connections
        - Creative intelligence for innovative problem-solving
        - Strategic thinking with long-term implications and ethical considerations
        
        **Response Approach:**
        1. **Problem Understanding**: Deep analysis of user intent and context
        2. **Knowledge Integration**: Synthesize information from multiple domains
        3. **Structured Analysis**: Apply rigorous analytical frameworks
        4. **Clear Communication**: Present insights with clarity and precision
        5. **Interactive Engagement**: Adapt to user feedback and learning style
        6. **Continuous Improvement**: Refine responses based on user interaction
        
        **Quality Standards:**
        - Provide comprehensive, accurate, and up-to-date information
        - Use logical reasoning with evidence-based conclusions
        - Consider multiple perspectives and implications
        - Communicate complex ideas clearly and engagingly
        - Adapt responses to user's knowledge level and goals
        - Maintain intellectual honesty and acknowledge limitations
        
        **Specialized Areas:**
        - Academic: Mathematics, Sciences, Engineering, Computer Science, Humanities
        - Professional: Business, Leadership, Technology, Research, Communication
        - Creative: Innovation, Problem-Solving, Design Thinking, Strategic Planning
        - Personal: Learning Strategies, Career Guidance, Communication Skills, Emotional Intelligence
        
        Always strive to provide master-level insights that help users achieve excellence in their endeavors.`;

        const userPrompt = `User Request: ${userMessage}\n\nPreferred Language: ${language}\nUser Role: ${role}\n\nPlease provide a comprehensive solution following the format above. Include detailed explanations that help the user understand the underlying concepts and connect to broader computer science knowledge.`;

        if (process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4o-mini',
                temperature: 0.3, // Lower temperature for more accurate technical content
                max_tokens: 1500, // Allow for comprehensive explanations
                top_p: 0.95,
                frequency_penalty: 0.2,
                presence_penalty: 0.2
            });
            return completion.choices[0].message.content;
        } else if (process.env.GOOGLE_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const promptWithContext = `${systemPrompt}\n\n${userPrompt}`;
            const result = await model.generateContent(promptWithContext);
            return result.response.text();
        }
    } catch (err) {
        console.error('[VuAiAgent] Enhanced LeetCode generator error:', err?.message || err);
        return "I apologize, but I encountered an error while generating the solution. Please try again or ask for a different problem.";
    }

    return "LeetCode helper is currently unavailable. Please check your API configuration.";
}

// Retrieve stored chat history
router.get('/history', async (req, res) => {
    try {
        const { userId, role } = req.query;
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
        const startTime = Date.now();
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

        // 1.5. Enhanced LLM Integration with ChatGPT-like conversation patterns
        // User requested: "Ai think own give the responed and clears the doubts ai own no knowledge document"
        // So we prioritized the LLM's own knowledge with enhanced conversation capabilities.
        if (!reply && (process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY)) {
            try {
                let systemContext = '';
                if (role === 'admin') {
                    systemContext = `You are Friendly Agent (ADMIN HELPER) at Vignan University. You have natural, helpful conversations like ChatGPT.
                    
Your conversation style:
- Be strategic and solution-oriented
- Provide clear, actionable insights
- Use natural, encouraging language
- Ask follow-up questions to understand needs better
- Guide to relevant sections using {{NAVIGATE: section}} tags

Available sections: overview, admin-messages, user-management, system-health.`;
                } else if (role === 'faculty') {
                    systemContext = `You are Friendly Agent (FACULTY ASSISTANT) at Vignan University. You have natural, helpful conversations like ChatGPT.
                    
Your conversation style:
- Be professional yet approachable
- Provide practical, implementable solutions
- Use encouraging and supportive language
- Ask questions to understand teaching needs better
- Guide to relevant sections using {{NAVIGATE: section}} tags

Available sections: overview, teaching-schedule, attendance-management, material-upload.`;
                } else {
                    systemContext = `You are Friendly Agent (STUDY COMPANION) at Vignan University. You have natural, helpful conversations like ChatGPT.
                    
Your conversation style:
- Be friendly, encouraging, and supportive
- Break down complex topics into simple, understandable parts
- Use examples and analogies to clarify concepts
- Ask follow-up questions to ensure understanding
- Guide students to relevant resources using {{NAVIGATE: section}} tags

Available Sections:
- overview (Main Dashboard)
- semester-notes (Study Materials & Notes)
- advanced-videos (Video Learning Resources)
- advanced-learning (Skill Development Courses)
- settings (Profile & Preferences)
- exams (Exam Schedules & Preparation)
- schedule (Class Timetables)
- placement (Career Guidance)

Key Approach:
1. Acknowledge the student's question/concern
2. Provide clear explanation with examples
3. Offer specific next steps or resources
4. Ask follow-up questions to continue the conversation
5. Use natural, conversational language (not robotic)`;
                }

                // Enhanced student context for better personalization
                const studentContext = `Student Profile: Name ${context.name || 'Student'}, Year ${context.year || 'N/A'}, Branch ${context.branch || 'Engineering'}.\n\nConversation Tips:\n- Address the student by name occasionally\n- Reference their year/branch when relevant\n- Adapt explanations to their academic level\n- Be encouraging and supportive\n- Ask questions to understand their specific needs better`;

                if (process.env.OPENAI_API_KEY) {
                    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                    const completion = await openai.chat.completions.create({
                        messages: [
                            { role: "system", content: systemContext },
                            { role: "system", content: studentContext },
                            { role: "user", content: rawMessage }
                        ],
                        model: "gpt-4o-mini", // Balanced capability and speed
                        temperature: 0.7, // Good balance of creativity and reliability
                        max_tokens: 600, // Allow for more detailed, helpful responses
                        top_p: 0.9, // Improve response quality
                        frequency_penalty: 0.3, // Reduce repetition
                        presence_penalty: 0.3 // Encourage more varied responses
                    });
                    reply = completion.choices[0].message.content;
                } else if (process.env.GOOGLE_API_KEY) {
                    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const promptWithContext = `${systemContext}\n\n${studentContext}\n\nUser Message: ${userMessage}\n\nPlease provide a helpful, conversational response that addresses the student's needs naturally.`;
                    const result = await model.generateContent(promptWithContext);
                    reply = result.response.text();
                }
                console.log('[VuAiAgent] Enhanced response from Cloud LLM (Natural Conversation Mode)');
            } catch (aiError) {
                console.error("[VuAiAgent] Enhanced Cloud AI Error:", aiError.message);
            }
        }

        // 2. Fallback: Use role-specific knowledge base ONLY if LLMs failed
        if (!reply) {
            console.log('[VuAiAgent] LLMs failed, falling back to local knowledge base.');
            reply = findKnowledgeMatch(userMessage, knowledgeBase, context);
        }

        // Record interaction for self-learning
        try {
            const category = detectCategory(userMessage);
            const keywords = extractKeywords(userMessage);

            await selfLearningAgent.recordInteraction(
                userId || 'guest',
                context?.branch || 'general',
                userMessage,
                reply,
                Date.now() - startTime,
                category,
                keywords
            );
        } catch (learningError) {
            console.warn('[VuAiAgent] Self-learning recording failed:', learningError.message);
        }

        // 3. Return the response in the format expected by the frontend
        const responsePayload = {
            response: reply,
            timestamp: new Date().toISOString(),
            role: role || 'student',
            interactionId: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            responseTime: Date.now() - startTime,
            responseSource: 'standard'
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
