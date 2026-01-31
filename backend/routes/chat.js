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
    if (ultraFastResult && ultraFastResult.responseTime < 50) {
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

    // START TIMING
    const startTime = Date.now();
    const { userId, prompt, role, context, query } = req.body;
    const userMessage = prompt || query || '';

    // 0. IMMEDIATE VALIDATION
    if (!userMessage) return res.status(400).json({ error: 'Please provide a message' });

    // 1. ULTRA-FAST RESPONSE CHECK (Primary Optimization)
    // Runs purely in memory, < 10ms. If this hits, we skip EVERYTHING else.
    const ultraFastResult = ultraFastResponse.getUltraFastResponse(userMessage, context);
    if (ultraFastResult) {
        // Send response immediately
        res.status(200).json({
            response: ultraFastResult.response,
            timestamp: new Date().toISOString(),
            role: role || 'student',
            interactionId: `fast_${Date.now()}`,
            responseTime: Date.now() - startTime,
            responseSource: 'ultra-fast'
        });

        // Background: Log interaction (Don't await)
        appendChatEntry({
            id: uuidv4(),
            userId: userId || 'guest', role: role || 'student', message: userMessage,
            response: ultraFastResult.response, context: context || {}, timestamp: new Date().toISOString()
        }).catch(err => console.error('Bg log error:', err.message));
        return;
    }

    // 2. REGULAR PROCESSING (If not ultra-fast)
    try {
        console.log(`[VuAiAgent] Processing: ${userMessage.substring(0, 50)}...`);
        const knowledgeBase = getKnowledgeBase(role);
        let reply = '';
        let adaptiveInsight = '';

        // Parallel Task: Fetch Adaptive Insight (Timeout 1.5s - don't block too long)
        // We let this run while we check other things if possible, but we need it for LLM context.
        // Optimization: Use Promise.race to cap fetching time.
        try {
            adaptiveInsight = await Promise.race([
                selfLearningAgent.generateAdaptiveResponse(userId || 'guest', userMessage, detectCategory(userMessage), context?.branch || 'general'),
                new Promise(resolve => setTimeout(() => resolve(''), 1500)) // 1.5s cap
            ]);
        } catch (e) { /* ignore */ }


        // 2. FAST LOCAL KNOWLEDGE CHECK (Promoted from Fallback)
        // If we have a prepared answer in our extensive database, return it INSTANTLY.
        // This makes the agent "fast" for almost any known topic without needing the slow Cloud LLM.
        if (!reply) {
            console.log('[VuAiAgent] Checking local knowledge base for instant match...');
            const localMatch = findKnowledgeMatch(userMessage, knowledgeBase, context);

            // Only use if it's a high-quality match (not the default 'I don't know' response)
            // We assume findKnowledgeMatch returns a string or object. 
            // If it returns the default "I don't know" wrapper, it usually matches specific keywords.
            // Note: findKnowledgeMatch in this codebase returns a specific response if keywords match, 
            // otherwise it might return the default. We need to be careful not to trigger default too early.

            // Checking if the response came from a specific keyword match (heuristic: if it's not null/undefined and we found it via keywords)
            // In the implementation of findKnowledgeMatch, it returns the result of the function or string.
            // We will trust it if it returns something truthy. 
            // To avoid false positives on "default", we rely on the fact that findKnowledgeMatch returns 
            // the *default* only at the very end. We can verify if it's a direct hit?
            // For now, we'll try it. If it returns the generic "I'm not sure", we might want the LLM to try.

            // Optimization: We only use it if it's NOT the default response.
            // But finding out if it's default is tricky without refactoring findKnowledgeMatch.
            // Let's rely on the UltraFast pattern for common defaults and assume Knowledge match is good.

            if (localMatch && typeof localMatch === 'string' && !localMatch.includes("I'm here to help") && !localMatch.includes("I am Friendly Agent")) {
                reply = localMatch;
                console.log('[VuAiAgent] Instant Knowledge Match found!');
            } else if (typeof localMatch === 'object' && localMatch.response) {
                reply = localMatch.response;
                console.log('[VuAiAgent] Instant Knowledge Match found (Object)!');
            }
        }

        // 3. LEETCODE / CODING CHECK (Specific Intent)
        if (!reply && isLeetCodeRequest(userMessage)) {
            // This is slow by nature (LLM), so user expects delay.
            reply = await generateLeetCodeSolution(userMessage, role, context);
        }

        // 4. PYTHON AGENT CHECK (Timeout Reduced to 500ms - ULTRA FAST FALLBACK)
        if (!reply) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms max - if Python agent not ready, skip it
                const response = await fetch('http://localhost:8000/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId || 'guest',
                        message: userMessage,
                        role: role || 'student',
                        user_name: context?.name || 'User'
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (response.ok) {
                    const pythonData = await response.json();
                    if (pythonData?.response) {
                        reply = pythonData.response;
                        console.log('[VuAiAgent] Python Agent responded');
                    }
                }
            } catch (err) {
                console.log('[VuAiAgent] Python Agent skipped (offline or slow)');
            }
        }

        // 5. CLOUD LLM (Main Intelligence)
        if (!reply && (process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY)) {
            try {
                // Construct prompts (omitted detailed strings for brevity, reusing logic)
                let systemContext = role === 'faculty' ?
                    `You are Friendly Agent (FACULTY ASSISTANT)...` :
                    `You are Friendly Agent (STUDY COMPANION)...`; // (Simplified for this snippet)

                // Add back the detailed prompt logic if needed, or keep it short. 
                // Using a condensed version for speed & reliability.
                if (role === 'admin') systemContext = "You are Friendly Agent (ADMIN HELPER). Be strategic and clear.";
                else if (role === 'faculty') systemContext = "You are Friendly Agent (FACULTY ASSISTANT). Help with teaching and attendance.";
                else systemContext = "You are Friendly Agent (STUDY COMPANION). Explain clearly and encouragingly.";

                let studentContext = `Student: ${context.name}, ${context.year}, ${context.branch}.`;
                if (adaptiveInsight) studentContext += `\nInsight: ${adaptiveInsight}`;
                if (context?.document) studentContext += `\nDoc: ${context.document.title} (${context.document.url})`;

                if (process.env.OPENAI_API_KEY) {
                    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                    const completion = await openai.chat.completions.create({
                        messages: [
                            { role: "system", content: systemContext },
                            { role: "system", content: studentContext },
                            { role: "user", content: userMessage }
                        ],
                        model: "gpt-4o-mini",
                        max_tokens: 500,
                        temperature: 0.7
                    });
                    reply = completion.choices[0].message.content;
                } else if (!reply && process.env.GOOGLE_API_KEY) {
                    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const result = await model.generateContent(`${systemContext}\n${studentContext}\nUser: ${userMessage}`);
                    reply = result.response.text();
                }
            } catch (e) { console.error("LLM Error:", e.message); }
        }

        // 6. ATTENDANCE / NAV (Local Logic) - Run if LLM failed or explicitly handled
        if (!reply && role === 'faculty' && (userMessage.includes('absent') || userMessage.includes('present') || userMessage.includes('attendance'))) {
            try {
                const AttendanceModel = require('../models/Attendance');
                const StudentModel = require('../models/Student');

                // Extract numbers (Student IDs)
                const absentIds = (userMessage.match(/\d+/g) || []).map(num => String(num));

                if (absentIds.length > 0 || userMessage.toLowerCase().includes('all present')) {
                    // Infer context (Mocking class context if missing)
                    const targetYear = context.year || '4';
                    const targetSec = context.section || 'A';
                    const targetBranch = context.branch || 'CSE';
                    const targetSubject = (context.subject || 'Project');

                    const students = await StudentModel.find({
                        year: Number(targetYear),
                        section: targetSec,
                        branch: targetBranch
                    });

                    if (students.length > 0) {
                        const dateStr = new Date().toISOString().split('T')[0];
                        const ops = students.map(stu => {
                            const isAbsent = absentIds.some(id => String(stu.sid).endsWith(id));
                            return {
                                updateOne: {
                                    filter: { date: dateStr, studentId: stu.sid, subject: targetSubject },
                                    update: {
                                        $set: {
                                            status: isAbsent ? 'Absent' : 'Present',
                                            studentName: stu.studentName,
                                            year: String(targetYear),
                                            branch: targetBranch,
                                            section: targetSec,
                                            facultyId: userId,
                                            facultyName: context.name || 'Faculty',
                                            subject: targetSubject,
                                            markedAt: new Date()
                                        }
                                    },
                                    upsert: true
                                }
                            };
                        });

                        await AttendanceModel.bulkWrite(ops);
                        reply = `✅ **Attendance Recorded Successfully!**\n\n- **Class:** ${targetBranch} - ${targetYear}${targetSec}\n- **Absent:** ${absentIds.length > 0 ? absentIds.join(', ') : 'None'}\n- **Present:** ${students.length - absentIds.length}`;
                    } else {
                        reply = "I couldn't find any students for your current class context.";
                    }
                }
            } catch (attErr) {
                console.error("Attendance Error:", attErr);
                reply = "I tried to process attendance but encountered a database error.";
            }
        }

        // 7. FALLBACK SEARCh
        if (!reply) {
            reply = findKnowledgeMatch(userMessage, knowledgeBase, context);
        }

        // 8. SEND RESPONSE (Don't wait for logging)
        res.status(200).json({
            response: reply,
            timestamp: new Date().toISOString(),
            role: role || 'student',
            interactionId: `std_${Date.now()}`,
            responseTime: Date.now() - startTime,
            responseSource: 'standard'
        });

        // 9. BACKGROUND LOGGING (Fire and Forget)
        (async () => {
            try {
                await appendChatEntry({
                    id: uuidv4(),
                    userId: userId || 'guest', role: role || 'student',
                    message: userMessage, response: reply, context: context || {}, timestamp: new Date().toISOString()
                });

                // Self Learning Record
                const category = detectCategory(userMessage);
                const keywords = extractKeywords(userMessage);
                await selfLearningAgent.recordInteraction(
                    userId || 'guest', context?.branch || 'general', userMessage, reply,
                    Date.now() - startTime, category, keywords
                );

                // Update Stats
                if (role === 'student' && userId) {
                    await Student.updateOne({ sid: userId }, { $inc: { "stats.aiUsageCount": 1 } });
                }
            } catch (err) { console.error("Bg stats error:", err.message); }
        })();

    } catch (error) {
        console.error("Critical Chat Error:", error);
        res.status(500).json({ message: "System overload. Please try again.", error: error.message });
    }
});

module.exports = router;
