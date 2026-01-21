import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import { apiPost } from '../../utils/apiClient';
import { apiGet } from '../../utils/apiClient';

const VuAiAgent = () => {
    const defaultBotMessage = React.useMemo(() => ({
        id: 'vuai-greeting',
        sender: 'bot',
        text: 'Hello! I am your VuAiAgent. I can help you with syllabus, schedules, and academic queries. What\'s on your mind?'
    }), []);

    const [messages, setMessages] = useState([defaultBotMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const messagesEndRef = useRef(null);
    const historyLoadedRef = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const resolveUserProfile = () => {
        if (typeof window === 'undefined' || !window.localStorage) {
            return {
                role: 'student',
                userId: 'guest',
                context: {}
            };
        }

        const userDataStr = window.localStorage.getItem('userData');
        const studentDataStr = window.localStorage.getItem('studentData');
        const facultyDataStr = window.localStorage.getItem('facultyData');

        let userData = {};
        let userRole = 'student';

        const safeParse = (value) => {
            try {
                return JSON.parse(value);
            } catch (err) {
                console.error('[VuAiAgent] Failed to parse localStorage value:', err);
                return null;
            }
        };

        if (userDataStr) {
            const parsed = safeParse(userDataStr);
            if (parsed) {
                userData = parsed;
                userRole = parsed.role || 'student';
            }
        }

        if (!userData.role) {
            if (facultyDataStr) {
                const parsed = safeParse(facultyDataStr);
                if (parsed) {
                    userData = parsed;
                    userRole = 'faculty';
                }
            } else if (studentDataStr) {
                const parsed = safeParse(studentDataStr);
                if (parsed) {
                    userData = parsed;
                    userRole = 'student';
                }
            }
        }

        const adminToken = window.localStorage.getItem('adminToken');
        if (adminToken && userRole !== 'faculty') {
            userRole = 'admin';
        }

        const profile = {
            role: userRole,
            userId: userData.sid || userData.facultyId || userData.adminId || 'guest',
            context: {
                year: userData.year,
                branch: userData.branch,
                section: userData.section,
                name: userData.studentName || userData.name || 'User'
            }
        };

        console.log('[VuAiAgent] Detected profile:', profile, 'Raw user data:', userData);
        return profile;
    };

    useEffect(() => {
        setUserProfile(resolveUserProfile());
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userProfile || historyLoadedRef.current) return;
            historyLoadedRef.current = true;
            setIsHistoryLoading(true);
            try {
                const params = new URLSearchParams({
                    userId: userProfile.userId || 'guest',
                    role: userProfile.role || 'student',
                    limit: '50'
                });
                const history = await apiGet(`/api/chat/history?${params.toString()}`);
                if (Array.isArray(history) && history.length > 0) {
                    const reconstructed = [];
                    history.forEach(entry => {
                        if (entry.message) {
                            reconstructed.push({
                                id: `${entry.id || entry.timestamp}-user`,
                                sender: 'user',
                                text: entry.message
                            });
                        }
                        if (entry.response) {
                            reconstructed.push({
                                id: `${entry.id || entry.timestamp}-bot`,
                                sender: 'bot',
                                text: entry.response
                            });
                        }
                    });
                    setMessages(reconstructed);
                } else {
                    setMessages([defaultBotMessage]);
                }
            } catch (error) {
                console.error('[VuAiAgent] Failed to load chat history:', error);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [userProfile, defaultBotMessage]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || !userProfile) return;

        const userText = input;
        setInput('');

        const userMsg = { id: Date.now(), sender: 'user', text: userText };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const payload = {
                prompt: userText,
                query: userText,
                userId: userProfile.userId || 'guest',
                role: userProfile.role || 'student',
                context: userProfile.context || {}
            };

            console.log('[VuAiAgent] Sending payload:', payload);

            const data = await apiPost('/api/chat', payload);

            if (data && (data.response || data.text || data.message)) {
                const botResponse = data.response || data.text || data.message;
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "I processed that, but I don't have a specific answer." }]);
            }

        } catch (error) {
            console.error("[VuAiAgent] Error:", error);
            console.error("[VuAiAgent] Error details:", error.message, error.stack);

            const errorText = error.message
                ? `I'm having trouble connecting: ${error.message}`
                : "I'm having trouble connecting to my brain right now. Please try again in a moment!";

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: errorText,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="vu-ai-agent-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

            {/* Header */}
            <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                    <FaRobot size={20} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>VuAiAgent</h3>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }}></span> Online
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        <div style={{
                            padding: '0.8rem 1.2rem',
                            borderRadius: '16px',
                            borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                            borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                            background: msg.sender === 'user' ? '#3b82f6' : (msg.isError ? '#fee2e2' : 'white'),
                            color: msg.sender === 'user' ? 'white' : (msg.isError ? '#ef4444' : '#1e293b'),
                            boxShadow: msg.sender === 'bot' ? '0 2px 5px rgba(0,0,0,0.05)' : '0 2px 5px rgba(59, 130, 246, 0.3)',
                            fontSize: '0.95rem',
                            lineHeight: '1.5'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isHistoryLoading && (
                    <div style={{ alignSelf: 'center', background: '#fefce8', padding: '0.6rem 1rem', borderRadius: '999px', color: '#a16207', fontSize: '0.85rem' }}>
                        Loading your previous chats...
                    </div>
                )}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', background: 'white', padding: '0.8rem 1.2rem', borderRadius: '16px', borderTopLeftRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', color: '#94a3b8', fontStyle: 'italic' }}>
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about syllabus, tasks..." style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '50px', border: '1px solid #cbd5e1', outline: 'none' }} disabled={isLoading || isHistoryLoading} />
                <button type="submit" disabled={isLoading || !input.trim() || isHistoryLoading} style={{ width: '45px', height: '45px', borderRadius: '50%', border: 'none', background: (isLoading || !input.trim() || isHistoryLoading) ? '#e2e8f0' : '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                    <FaPaperPlane />
                </button>
            </form>

        </div>
    );
};

export default VuAiAgent;