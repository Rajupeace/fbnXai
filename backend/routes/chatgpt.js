// Direct ChatGPT Integration for Student Dashboard
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const mongoose = require('mongoose');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Chat history model for ChatGPT conversations
const ChatGPTConversation = mongoose.model('ChatGPTConversation', new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    messages: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    context: {
        name: String,
        year: String,
        branch: String,
        section: String
    },
    sessionMetadata: {
        sessionId: String,
        startTime: { type: Date, default: Date.now },
        lastActivity: { type: Date, default: Date.now },
        messageCount: { type: Number, default: 0 }
    }
}, {
    timestamps: true
}));

// Direct ChatGPT chat endpoint for students
router.post('/chatgpt', async (req, res) => {
    try {
        const { userId, studentId, message, context, sessionId } = req.body;

        if (!message || !studentId) {
            return res.status(400).json({ 
                error: 'Message and studentId are required' 
            });
        }

        console.log(`[ChatGPT] Student ${studentId} (${userId}): ${message}`);

        // Find or create conversation session
        let conversation = await ChatGPTConversation.findOne({
            userId,
            studentId,
            'sessionMetadata.sessionId': sessionId
        });

        if (!conversation) {
            conversation = new ChatGPTConversation({
                userId,
                studentId,
                messages: [],
                context: context || {},
                sessionMetadata: {
                    sessionId: sessionId || `session_${Date.now()}`,
                    startTime: new Date(),
                    lastActivity: new Date(),
                    messageCount: 0
                }
            });
        }

        // Add user message to conversation
        conversation.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // Prepare ChatGPT messages with context
        const chatGPTMessages = [
            {
                role: 'system',
                content: `You are ChatGPT, a helpful AI assistant for students at Vignan University. 

Student Profile:
- Name: ${context?.name || 'Student'}
- Year: ${context?.year || 'Not specified'}
- Branch: ${context?.branch || 'Not specified'}
- Section: ${context?.section || 'Not specified'}

Your role is to provide helpful, educational responses that support the student's learning journey. Be encouraging, clear, and provide practical advice when relevant. Focus on academic success, personal development, and career guidance.

Guidelines:
- Be friendly and conversational
- Provide accurate, helpful information
- Encourage learning and critical thinking
- Offer study tips and strategies
- Support personal and professional growth
- Maintain a positive, supportive tone`
            },
            ...conversation.messages.slice(-10) // Keep last 10 messages for context
        ];

        // Call ChatGPT API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: chatGPTMessages,
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.9,
            frequency_penalty: 0.2,
            presence_penalty: 0.2
        });

        const assistantResponse = completion.choices[0].message.content;

        // Add assistant response to conversation
        conversation.messages.push({
            role: 'assistant',
            content: assistantResponse,
            timestamp: new Date()
        });

        // Update session metadata
        conversation.sessionMetadata.lastActivity = new Date();
        conversation.sessionMetadata.messageCount += 1;

        await conversation.save();

        res.json({
            response: assistantResponse,
            sessionId: conversation.sessionMetadata.sessionId,
            messageCount: conversation.sessionMetadata.messageCount,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[ChatGPT] Error:', error);
        
        if (error.code === 'insufficient_quota') {
            return res.status(429).json({ 
                error: 'API quota exceeded. Please try again later.' 
            });
        }
        
        if (error.code === 'invalid_api_key') {
            return res.status(500).json({ 
                error: 'ChatGPT API key is invalid or missing.' 
            });
        }

        res.status(500).json({ 
            error: 'Failed to get response from ChatGPT. Please try again.' 
        });
    }
});

// Get conversation history for a student
router.get('/history/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { userId, sessionId } = req.query;

        let query = { studentId };
        if (userId) query.userId = userId;
        if (sessionId) query['sessionMetadata.sessionId'] = sessionId;

        const conversations = await ChatGPTConversation.find(query)
            .sort({ 'sessionMetadata.lastActivity': -1 })
            .limit(10);

        const history = conversations.map(conv => ({
            sessionId: conv.sessionMetadata.sessionId,
            messageCount: conv.sessionMetadata.messageCount,
            lastActivity: conv.sessionMetadata.lastActivity,
            messages: conv.messages,
            context: conv.context
        }));

        res.json({ history });

    } catch (error) {
        console.error('[ChatGPT] History Error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve conversation history' 
        });
    }
});

// Clear conversation history
router.delete('/history/:studentId/:sessionId', async (req, res) => {
    try {
        const { studentId, sessionId } = req.params;
        const { userId } = req.query;

        const result = await ChatGPTConversation.deleteMany({
            studentId,
            userId,
            'sessionMetadata.sessionId': sessionId
        });

        res.json({ 
            message: 'Conversation history cleared successfully',
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('[ChatGPT] Clear History Error:', error);
        res.status(500).json({ 
            error: 'Failed to clear conversation history' 
        });
    }
});

// Get ChatGPT usage statistics for a student
router.get('/stats/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { userId } = req.query;

        const stats = await ChatGPTConversation.aggregate([
            {
                $match: {
                    studentId: studentId,
                    ...(userId && { userId: userId })
                }
            },
            {
                $group: {
                    _id: '$studentId',
                    totalSessions: { $sum: 1 },
                    totalMessages: { $sum: '$sessionMetadata.messageCount' },
                    lastActivity: { $max: '$sessionMetadata.lastActivity' },
                    firstActivity: { $min: '$sessionMetadata.startTime' }
                }
            }
        ]);

        res.json({ 
            stats: stats[0] || {
                totalSessions: 0,
                totalMessages: 0,
                lastActivity: null,
                firstActivity: null
            }
        });

    } catch (error) {
        console.error('[ChatGPT] Stats Error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve usage statistics' 
        });
    }
});

// ChatGPT health check
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'ChatGPT Integration',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.OPENAI_API_KEY
    });
});

module.exports = router;
