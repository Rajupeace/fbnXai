import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaRegCopy, FaCheck } from 'react-icons/fa';
import { apiPost, apiGet } from '../../utils/apiClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import './VuAiAgent.css';

const VuAiAgent = ({ onNavigate }) => {
    const defaultBotMessage = {
        id: 'vuai-greeting',
        sender: 'bot',
        text: 'Hi! I am your Friendly Agent. Ask me anything about your subjects or studies!',
        timestamp: new Date().toISOString()
    };

    const [messages, setMessages] = useState([defaultBotMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const messagesEndRef = useRef(null);
    const historyLoadedRef = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

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
                }
            } catch (error) {
                console.error('[VuAiAgent] Failed to load chat history:', error);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [userProfile]);

    const handleActionTags = (text) => {
        // Detect {{NAVIGATE: section}} case-insensitive
        const navMatch = text.match(/{{NAVIGATE:\s*([^}]+)}}/i);
        if (navMatch && navMatch[1] && onNavigate) {
            const section = navMatch[1].trim();
            console.log('[FriendlyAgent] Executing navigation directive:', section);
            setTimeout(() => onNavigate(section), 1000);
        }
        return text.replace(/{{NAVIGATE:\s*[^}]+}}/gi, '');
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || !userProfile || isLoading) return;

        const userText = input;
        setInput('');

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: userText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const payload = {
                prompt: userText,
                userId: userProfile.userId || 'guest',
                role: userProfile.role || 'student',
                context: userProfile.context || {}
            };

            const data = await apiPost('/api/chat', payload);

            if (data && (data.response || data.text || data.message)) {
                let botResponse = data.response || data.text || data.message;
                botResponse = handleActionTags(botResponse);

                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: botResponse,
                    timestamp: new Date().toISOString()
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: "I didn't catch that. Could you rephrase?",
                    timestamp: new Date().toISOString()
                }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: "Connection lost. Please try again.",
                isError: true,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const suggestions = [
        "Explain my next exam",
        "Show my grades",
        "Where is my next class?",
        "Summarize last lecture"
    ];

    return (
        <div className="vu-ai-container">
            {/* Header */}
            <header className="vu-header">
                <div className="vu-bot-avatar">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <FaRobot size={24} className="ai-icon-spin" />
                    </motion.div>
                </div>
                <div className="vu-title-group">
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        Friendly Agent <span className="vu-version-tag">Study Companion</span>
                    </motion.h3>
                    <div className="vu-status">
                        <div className="vu-status-dot"></div>
                        <span>Online & Friendly</span>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div className="vu-messages">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`vu-msg-wrapper ${msg.sender}`}
                        >
                            <div className={`vu-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                                <div className="markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                                {msg.sender === 'bot' && !msg.isError && (
                                    <button
                                        className={`copy-btn ${copiedId === msg.id ? 'copied' : ''}`}
                                        onClick={() => copyToClipboard(msg.text, msg.id)}
                                        title="Copy response"
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                                    >
                                        {copiedId === msg.id ? <FaCheck size={12} /> : <FaRegCopy size={12} />}
                                    </button>
                                )}
                            </div>
                            <div className="vu-timestamp">
                                {msg.sender === 'user' ? 'You' : 'Friendly Agent'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="vu-typing"
                    >
                        <div className="neural-pulse-loader"></div>
                        <span>Processing...</span>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips - Only for Students */}
            {userProfile?.role === 'student' && (
                <div className="vu-suggestions">
                    {suggestions.map((s, i) => (
                        <div key={i} className="suggestion-chip" onClick={() => { setInput(s); }}>
                            {s}
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="vu-input-area">
                <div className="vu-input-wrapper">
                    <input
                        type="text"
                        className="vu-input-field"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        disabled={isLoading || isHistoryLoading}
                    />
                    <button
                        type="submit"
                        className={`vu-send-btn`}
                        disabled={isLoading || !input.trim() || isHistoryLoading}
                    >
                        <FaPaperPlane size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VuAiAgent;