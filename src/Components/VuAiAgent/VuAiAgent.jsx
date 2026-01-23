import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import { apiPost, apiGet } from '../../utils/apiClient';
import './VuAiAgent.css';

const VuAiAgent = () => {
    const defaultBotMessage = React.useMemo(() => ({
        id: 'vuai-greeting',
        sender: 'bot',
        text: 'Hello! I am your VuAiAgent (Neural Core). I can assist with syllabus, schedules, and academic intelligence. How may I help?'
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
            return { role: 'student', userId: 'guest', context: {} };
        }

        const userDataStr = window.localStorage.getItem('userData');
        const studentDataStr = window.localStorage.getItem('studentData');
        const facultyDataStr = window.localStorage.getItem('facultyData');

        let userData = {};
        let userRole = 'student';

        const safeParse = (value) => {
            try { return JSON.parse(value); }
            catch (err) { return null; }
        };

        if (userDataStr) {
            const parsed = safeParse(userDataStr);
            if (parsed) { userData = parsed; userRole = parsed.role || 'student'; }
        }

        if (!userData.role) {
            if (facultyDataStr) {
                const parsed = safeParse(facultyDataStr);
                if (parsed) { userData = parsed; userRole = 'faculty'; }
            } else if (studentDataStr) {
                const parsed = safeParse(studentDataStr);
                if (parsed) { userData = parsed; userRole = 'student'; }
            }
        }

        const adminToken = window.localStorage.getItem('adminToken');
        if (adminToken && userRole !== 'faculty') {
            userRole = 'admin';
        }

        return {
            role: userRole,
            userId: userData.sid || userData.facultyId || userData.adminId || 'guest',
            context: {
                year: userData.year,
                branch: userData.branch,
                section: userData.section,
                name: userData.studentName || userData.name || 'User'
            }
        };
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
                                text: entry.message,
                                timestamp: entry.timestamp
                            });
                        }
                        if (entry.response) {
                            reconstructed.push({
                                id: `${entry.id || entry.timestamp}-bot`,
                                sender: 'bot',
                                text: entry.response,
                                timestamp: entry.timestamp
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

            const data = await apiPost('/api/chat', payload);

            if (data && (data.response || data.text || data.message)) {
                const botResponse = data.response || data.text || data.message;
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "I processed that, but I don't have a specific answer." }]);
            }

        } catch (error) {
            const errorText = error.message
                ? `Connection error: ${error.message}`
                : "Neural Core offline. Please retry.";

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
        <div className="vu-ai-container">
            {/* Header */}
            <div className="vu-header">
                <div className="vu-bot-avatar">
                    <FaRobot size={22} />
                </div>
                <div className="vu-title-group">
                    <h3>VuAiAgent</h3>
                    <div className="vu-status">
                        <div className="vu-status-dot"></div>
                        <span>Neural Core Online</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="vu-messages">
                {isHistoryLoading && (
                    <div style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.8rem' }}>Syncing Neural Archives...</div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`vu-msg-wrapper ${msg.sender}`}>
                        <div className={`vu-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                            {msg.text}
                        </div>
                        <div className="vu-timestamp">
                            {msg.sender === 'user' ? 'You' : 'AI Core'}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="vu-typing">
                        <span>Thinking</span>
                        <span className="dot-pulse">...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="vu-input-area">
                <input
                    type="text"
                    className="vu-input-field"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about syllabus, schedules, or analytics..."
                    disabled={isLoading || isHistoryLoading}
                />
                <button
                    type="submit"
                    className="vu-send-btn"
                    disabled={isLoading || !input.trim() || isHistoryLoading}
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default VuAiAgent;