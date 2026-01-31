// Learning Analytics and Feedback Routes for VUAI Agent
const express = require('express');
const router = express.Router();
const SelfLearningAgent = require('../ai_agent/selfLearning');

// Initialize self-learning agent
const selfLearningAgent = new SelfLearningAgent();

// Get learning analytics for a user
router.get('/analytics/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const analytics = await selfLearningAgent.getLearningAnalytics(userId);
        
        res.json({
            success: true,
            data: analytics,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[LearningAnalytics] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve learning analytics'
        });
    }
});

// Submit feedback for an interaction
router.post('/feedback', async (req, res) => {
    try {
        const { userId, interactionId, satisfaction, wasHelpful, feedback } = req.body;
        
        if (!userId || !interactionId) {
            return res.status(400).json({
                success: false,
                error: 'userId and interactionId are required'
            });
        }
        
        const result = await selfLearningAgent.processFeedback(
            userId,
            interactionId,
            satisfaction,
            wasHelpful,
            feedback
        );
        
        res.json({
            success: true,
            data: result,
            message: 'Feedback submitted successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[Feedback] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit feedback'
        });
    }
});

// Get personalized learning recommendations
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const analytics = await selfLearningAgent.getLearningAnalytics(userId);
        
        // Generate recommendations based on learning profile
        const recommendations = generateRecommendations(analytics);
        
        res.json({
            success: true,
            data: recommendations,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[Recommendations] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations'
        });
    }
});

// Get knowledge gaps and improvement suggestions
router.get('/knowledge-gaps/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const analytics = await selfLearningAgent.getLearningAnalytics(userId);
        
        res.json({
            success: true,
            data: {
                knowledgeGaps: analytics.knowledgeGaps || [],
                improvementSuggestions: analytics.improvementSuggestions || [],
                weaknesses: analytics.weaknesses || [],
                strengths: analytics.strengths || []
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[KnowledgeGaps] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve knowledge gaps'
        });
    }
});

// Get learning progress over time
router.get('/progress/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;
        
        // This would typically query the learning analytics with date filtering
        // For now, return a summary based on available data
        const analytics = await selfLearningAgent.getLearningAnalytics(userId);
        
        const progress = {
            totalInteractions: analytics.interactionsCount || 0,
            averageResponseTime: analytics.averageResponseTime || 0,
            strengthsCount: analytics.strengths?.length || 0,
            weaknessesCount: analytics.weaknesses?.length || 0,
            knowledgeGapsCount: analytics.knowledgeGaps?.length || 0,
            improvementSuggestionsCount: analytics.improvementSuggestions?.length || 0,
            learningTrend: calculateLearningTrend(analytics),
            peakHours: analytics.peakHours || []
        };
        
        res.json({
            success: true,
            data: progress,
            timeframe: `${days} days`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[Progress] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve learning progress'
        });
    }
});

// Helper function to generate recommendations
function generateRecommendations(analytics) {
    const recommendations = [];
    
    // Based on knowledge gaps
    if (analytics.knowledgeGaps && analytics.knowledgeGaps.length > 0) {
        analytics.knowledgeGaps.forEach(gap => {
            if (gap.masteryLevel < 50) {
                recommendations.push({
                    type: 'knowledge_gap',
                    priority: 'high',
                    title: `Strengthen your understanding of ${gap.topic}`,
                    description: `You've asked about ${gap.topic} ${gap.frequency} times recently. Consider studying this topic more thoroughly.`,
                    action: 'study',
                    topic: gap.topic
                });
            }
        });
    }
    
    // Based on weaknesses
    if (analytics.weaknesses && analytics.weaknesses.length > 0) {
        analytics.weaknesses.forEach(weakness => {
            recommendations.push({
                type: 'improvement',
                priority: 'medium',
                title: `Improve your ${weakness} skills`,
                description: `Focus on ${weakness} to build a stronger foundation.`,
                action: 'practice',
                topic: weakness
            });
        });
    }
    
    // Based on learning patterns
    if (analytics.difficultyLevel === 'simple') {
        recommendations.push({
            type: 'challenge',
            priority: 'low',
            title: 'Challenge yourself with complex topics',
            description: 'Try asking more complex questions to deepen your understanding.',
            action: 'challenge',
            topic: 'advanced_concepts'
        });
    }
    
    // Based on strengths
    if (analytics.strengths && analytics.strengths.length > 0) {
        const strength = analytics.strengths[0];
        recommendations.push({
            type: 'advanced',
            priority: 'low',
            title: `Explore advanced ${strength} topics`,
            description: `Since you're strong in ${strength}, explore more advanced concepts in this area.`,
            action: 'explore',
            topic: strength
        });
    }
    
    return recommendations.slice(0, 5); // Return top 5 recommendations
}

// Helper function to calculate learning trend
function calculateLearningTrend(analytics) {
    // Simple trend calculation based on available data
    const interactionsCount = analytics.interactionsCount || 0;
    const strengthsCount = analytics.strengths?.length || 0;
    const weaknessesCount = analytics.weaknesses?.length || 0;
    
    if (interactionsCount < 5) {
        return 'starting_out';
    } else if (strengthsCount > weaknessesCount) {
        return 'improving';
    } else if (weaknessesCount > strengthsCount) {
        return 'needs_improvement';
    } else {
        return 'stable';
    }
}

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'VUAI Agent Learning Analytics',
        timestamp: new Date().toISOString(),
        features: [
            'Learning analytics',
            'Feedback processing',
            'Personalized recommendations',
            'Knowledge gap analysis',
            'Progress tracking'
        ]
    });
});

module.exports = router;
