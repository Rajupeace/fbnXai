// Self-Learning VUAI Agent - Autonomous Learning and Adaptation
const mongoose = require('mongoose');

// Learning Analytics Schema
const LearningAnalyticsSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    branch: { type: String, required: true },
    interactions: [{
        timestamp: { type: Date, default: Date.now },
        query: { type: String, required: true },
        response: { type: String, required: true },
        satisfaction: { type: Number, min: 1, max: 5 },
        responseTime: { type: Number }, // in milliseconds
        category: { type: String },
        keywords: [String],
        wasHelpful: { type: Boolean },
        followUpQuestions: [String]
    }],
    learningProfile: {
        strengths: [String],
        weaknesses: [String],
        preferredTopics: [String],
        difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
        learningStyle: { type: String, enum: ['visual', 'auditory', 'kinesthetic', 'reading'] },
        interactionPatterns: {
            peakHours: [Number],
            sessionDuration: { type: Number },
            questionComplexity: { type: String, enum: ['simple', 'moderate', 'complex'] }
        }
    },
    knowledgeGaps: [{
        topic: { type: String },
        frequency: { type: Number, default: 1 },
        lastAsked: { type: Date, default: Date.now },
        masteryLevel: { type: Number, min: 0, max: 100, default: 0 }
    }],
    improvementSuggestions: [{
        topic: { type: String },
        suggestion: { type: String },
        priority: { type: String, enum: ['low', 'medium', 'high'] },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Knowledge Base Updates Schema
const KnowledgeUpdateSchema = new mongoose.Schema({
    updateId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['new_knowledge', 'improvement', 'correction'], required: true },
    branch: { type: String, required: true },
    category: { type: String, required: true },
    oldContent: { type: String },
    newContent: { type: String, required: true },
    reason: { type: String },
    source: { type: String }, // 'user_feedback', 'auto_learning', 'manual'
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    approved: { type: Boolean, default: false },
    appliedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Adaptive Response Schema
const AdaptiveResponseSchema = new mongoose.Schema({
    patternId: { type: String, required: true, unique: true },
    keywords: [String],
    contexts: [String],
    branches: [String],
    responseTemplate: { type: String, required: true },
    usageCount: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    lastUsed: { type: Date },
    adaptationHistory: [{
        timestamp: { type: Date, default: Date.now },
        changeType: { type: String },
        oldResponse: { type: String },
        newResponse: { type: String },
        reason: { type: String }
    }]
}, {
    timestamps: true
});

class SelfLearningAgent {
    constructor() {
        this.LearningAnalytics = mongoose.model('LearningAnalytics', LearningAnalyticsSchema);
        this.KnowledgeUpdate = mongoose.model('KnowledgeUpdate', KnowledgeUpdateSchema);
        this.AdaptiveResponse = mongoose.model('AdaptiveResponse', AdaptiveResponseSchema);
        this.learningThresholds = {
            minInteractions: 5,
            satisfactionThreshold: 3.5,
            responseTimeThreshold: 3000, // 3 seconds
            knowledgeGapThreshold: 3
        };
    }

    // Record user interaction for learning
    async recordInteraction(userId, branch, query, response, responseTime, category, keywords) {
        try {
            let learningProfile = await this.LearningAnalytics.findOne({ userId });
            
            if (!learningProfile) {
                learningProfile = new this.LearningAnalytics({
                    userId,
                    branch,
                    interactions: [],
                    learningProfile: {
                        strengths: [],
                        weaknesses: [],
                        preferredTopics: [],
                        difficultyLevel: 'intermediate',
                        learningStyle: 'visual',
                        interactionPatterns: {
                            peakHours: [],
                            sessionDuration: 0,
                            questionComplexity: 'moderate'
                        }
                    },
                    knowledgeGaps: [],
                    improvementSuggestions: []
                });
            }

            // Add new interaction
            const interaction = {
                timestamp: new Date(),
                query,
                response,
                responseTime,
                category,
                keywords,
                wasHelpful: true, // Default, will be updated with feedback
                followUpQuestions: []
            };

            learningProfile.interactions.push(interaction);

            // Update learning profile based on interaction
            await this.updateLearningProfile(learningProfile, interaction);

            // Identify knowledge gaps
            await this.identifyKnowledgeGaps(learningProfile);

            // Generate improvement suggestions
            await this.generateImprovementSuggestions(learningProfile);

            await learningProfile.save();
            
            console.log(`[SelfLearning] Recorded interaction for user ${userId}`);
            return learningProfile;
        } catch (error) {
            console.error('[SelfLearning] Error recording interaction:', error);
            throw error;
        }
    }

    // Update learning profile based on interactions
    async updateLearningProfile(profile, interaction) {
        const hour = new Date().getHours();
        
        // Update peak hours
        if (!profile.learningProfile.interactionPatterns.peakHours.includes(hour)) {
            profile.learningProfile.interactionPatterns.peakHours.push(hour);
        }

        // Update preferred topics based on frequency
        interaction.keywords.forEach(keyword => {
            const existingIndex = profile.learningProfile.preferredTopics.indexOf(keyword);
            if (existingIndex === -1) {
                profile.learningProfile.preferredTopics.push(keyword);
            }
        });

        // Update difficulty level based on query complexity
        const complexity = this.assessQueryComplexity(interaction.query);
        profile.learningProfile.interactionPatterns.questionComplexity = complexity;

        // Update strengths and weaknesses based on performance
        await this.updateStrengthsAndWeaknesses(profile, interaction);
    }

    // Assess query complexity
    assessQueryComplexity(query) {
        const wordCount = query.split(' ').length;
        const technicalTerms = (query.match(/\b(algorithm|equation|formula|theorem|proof|analysis|design|implement|optimize)\b/gi) || []).length;
        
        if (wordCount > 20 || technicalTerms > 3) return 'complex';
        if (wordCount > 10 || technicalTerms > 1) return 'moderate';
        return 'simple';
    }

    // Update strengths and weaknesses
    async updateStrengthsAndWeaknesses(profile, interaction) {
        const category = interaction.category;
        
        // This would be updated based on user feedback
        // For now, we'll use a simple heuristic
        if (interaction.responseTime < this.learningThresholds.responseTimeThreshold) {
            if (!profile.learningProfile.strengths.includes(category)) {
                profile.learningProfile.strengths.push(category);
            }
            // Remove from weaknesses if present
            const weaknessIndex = profile.learningProfile.weaknesses.indexOf(category);
            if (weaknessIndex > -1) {
                profile.learningProfile.weaknesses.splice(weaknessIndex, 1);
            }
        }
    }

    // Identify knowledge gaps
    async identifyKnowledgeGaps(profile) {
        const recentInteractions = profile.interactions.slice(-20); // Last 20 interactions
        const categoryFrequency = {};

        recentInteractions.forEach(interaction => {
            if (interaction.category) {
                categoryFrequency[interaction.category] = (categoryFrequency[interaction.category] || 0) + 1;
            }
        });

        // Identify categories with high frequency (potential knowledge gaps)
        Object.entries(categoryFrequency).forEach(([category, frequency]) => {
            if (frequency >= this.learningThresholds.knowledgeGapThreshold) {
                const existingGap = profile.knowledgeGaps.find(gap => gap.topic === category);
                
                if (existingGap) {
                    existingGap.frequency += frequency;
                    existingGap.lastAsked = new Date();
                } else {
                    profile.knowledgeGaps.push({
                        topic: category,
                        frequency,
                        lastAsked: new Date(),
                        masteryLevel: Math.max(0, 100 - (frequency * 10))
                    });
                }
            }
        });

        // Sort knowledge gaps by frequency
        profile.knowledgeGaps.sort((a, b) => b.frequency - a.frequency);
    }

    // Generate improvement suggestions
    async generateImprovementSuggestions(profile) {
        const suggestions = [];

        // Based on knowledge gaps
        profile.knowledgeGaps.forEach(gap => {
            if (gap.masteryLevel < 50) {
                suggestions.push({
                    topic: gap.topic,
                    suggestion: `Consider studying ${gap.topic} more thoroughly. You've asked about this ${gap.frequency} times recently.`,
                    priority: gap.masteryLevel < 30 ? 'high' : 'medium'
                });
            }
        });

        // Based on interaction patterns
        if (profile.learningProfile.interactionPatterns.questionComplexity === 'simple') {
            suggestions.push({
                topic: 'Advanced Concepts',
                suggestion: 'Try asking more complex questions to challenge yourself and deepen your understanding.',
                priority: 'low'
            });
        }

        // Update suggestions (keep only top 5)
        profile.improvementSuggestions = suggestions.slice(0, 5);
    }

    // Adaptive response generation
    async generateAdaptiveResponse(userId, query, category, branch) {
        try {
            const profile = await this.LearningAnalytics.findOne({ userId });
            
            if (!profile) {
                return null; // Fall back to standard response
            }

            // Check for existing adaptive patterns
            const adaptivePattern = await this.AdaptiveResponse.findOne({
                $and: [
                    { keywords: { $in: this.extractKeywords(query) } },
                    { branches: branch },
                    { successRate: { $gte: 0.7 } }
                ]
            }).sort({ lastUsed: -1 });

            if (adaptivePattern) {
                // Update usage statistics
                adaptivePattern.usageCount += 1;
                adaptivePattern.lastUsed = new Date();
                await adaptivePattern.save();

                return adaptivePattern.responseTemplate;
            }

            // Generate personalized response based on learning profile
            return this.generatePersonalizedResponse(profile, query, category);
        } catch (error) {
            console.error('[SelfLearning] Error generating adaptive response:', error);
            return null;
        }
    }

    // Extract keywords from query
    extractKeywords(query) {
        // Simple keyword extraction - can be enhanced with NLP
        const words = query.toLowerCase().split(/\s+/);
        const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be'];
        return words.filter(word => word.length > 3 && !stopWords.includes(word));
    }

    // Generate personalized response
    generatePersonalizedResponse(profile, query, category) {
        const strengths = profile.learningProfile.strengths;
        const weaknesses = profile.learningProfile.weaknesses;
        const preferredTopics = profile.learningProfile.preferredTopics;

        let personalizedPrefix = '';
        
        if (weaknesses.includes(category)) {
            personalizedPrefix = "I notice you're still learning about this topic. Let me explain this step-by-step to help you master it. ";
        } else if (strengths.includes(category)) {
            personalizedPrefix = "Since you're already strong in this area, let me provide some advanced insights to deepen your understanding. ";
        }

        // Add connections to preferred topics
        const relatedTopics = preferredTopics.filter(topic => 
            query.toLowerCase().includes(topic.toLowerCase())
        );

        if (relatedTopics.length > 0) {
            personalizedPrefix += `I see you're interested in ${relatedTopics.join(', ')}. Let me connect this to your interests. `;
        }

        return personalizedPrefix;
    }

    // Update knowledge base based on learning
    async updateKnowledgeBase(updateData) {
        try {
            const update = new this.KnowledgeUpdate({
                updateId: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...updateData,
                source: 'auto_learning'
            });

            await update.save();
            
            console.log(`[SelfLearning] Knowledge update queued: ${update.updateId}`);
            return update;
        } catch (error) {
            console.error('[SelfLearning] Error updating knowledge base:', error);
            throw error;
        }
    }

    // Get learning analytics
    async getLearningAnalytics(userId) {
        try {
            const profile = await this.LearningAnalytics.findOne({ userId });
            
            if (!profile) {
                return {
                    message: 'No learning data available yet. Keep interacting to build your learning profile!',
                    interactionsCount: 0
                };
            }

            const recentInteractions = profile.interactions.slice(-10);
            const avgResponseTime = recentInteractions.reduce((sum, interaction) => 
                sum + (interaction.responseTime || 0), 0) / recentInteractions.length;

            return {
                strengths: profile.learningProfile.strengths,
                weaknesses: profile.learningProfile.weaknesses,
                preferredTopics: profile.learningProfile.preferredTopics,
                difficultyLevel: profile.learningProfile.interactionPatterns.questionComplexity,
                knowledgeGaps: profile.knowledgeGaps.slice(0, 5),
                improvementSuggestions: profile.improvementSuggestions,
                interactionsCount: profile.interactions.length,
                averageResponseTime: Math.round(avgResponseTime),
                peakHours: profile.learningProfile.interactionPatterns.peakHours
            };
        } catch (error) {
            console.error('[SelfLearning] Error getting analytics:', error);
            throw error;
        }
    }

    // Process user feedback
    async processFeedback(userId, interactionId, satisfaction, wasHelpful, feedback) {
        try {
            const profile = await this.LearningAnalytics.findOne({ userId });
            
            if (!profile) {
                throw new Error('User profile not found');
            }

            // Find the specific interaction
            const interaction = profile.interactions.id(interactionId);
            if (interaction) {
                interaction.satisfaction = satisfaction;
                interaction.wasHelpful = wasHelpful;
                
                // Update learning profile based on feedback
                if (wasHelpful && satisfaction >= 4) {
                    if (!profile.learningProfile.strengths.includes(interaction.category)) {
                        profile.learningProfile.strengths.push(interaction.category);
                    }
                } else if (!wasHelpful || satisfaction <= 2) {
                    if (!profile.learningProfile.weaknesses.includes(interaction.category)) {
                        profile.learningProfile.weaknesses.push(interaction.category);
                    }
                    
                    // Create knowledge update suggestion
                    await this.updateKnowledgeBase({
                        type: 'improvement',
                        branch: profile.branch,
                        category: interaction.category,
                        oldContent: interaction.response,
                        newContent: `Improved response based on feedback: ${feedback}`,
                        reason: `User feedback: ${feedback}`,
                        confidence: 0.8
                    });
                }

                await profile.save();
            }

            console.log(`[SelfLearning] Processed feedback for user ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('[SelfLearning] Error processing feedback:', error);
            throw error;
        }
    }
}

module.exports = SelfLearningAgent;
