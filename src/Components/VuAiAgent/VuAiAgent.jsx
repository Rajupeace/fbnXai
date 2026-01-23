import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaMicrophone, FaRegCopy, FaCheck } from 'react-icons/fa';
import { apiPost, apiGet } from '../../utils/apiClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import './VuAiAgent.css';

const VuAiAgent = ({ onNavigate }) => {
    const defaultBotMessage = {
        id: 'vuai-greeting',
        sender: 'bot',
        text: 'Neural Core Online. Strategic interface initialized. How can I assist with your objectives today?',
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
        // Detect {{NAVIGATE: section}}
        const navMatch = text.match(/{{NAVIGATE:\s*([^}]+)}}/);
        if (navMatch && navMatch[1] && onNavigate) {
            const section = navMatch[1].trim();
            console.log('[NeuralCore] Executing navigation directive:', section);
            setTimeout(() => onNavigate(section), 1000);
        }

        // Clean text from tags for cleaner UI if needed, 
        // or just let the markdown handle it if they are invisible
        return text.replace(/{{NAVIGATE:\s*[^}]+}}/, '');
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

                // Process navigation tags
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
                    text: "Strategic buffer empty. Command not recognized.",
                    timestamp: new Date().toISOString()
                }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: "Neural Link Interrupted. Strategic assets unreachable.",
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

    return (
        <div className="vu-ai-container sentinel-animate">
            {/* Header */}
            <div className="vu-header">
                <div className="vu-bot-avatar">
                    <FaRobot size={22} className="ai-icon-spin" />
                </div>
                <div className="vu-title-group">
                    <h3>NEURAL CORE <span className="vu-version-tag">v7.0</span></h3>
                    <div className="vu-status">
                        <div className="vu-status-dot"></div>
                        <span>SYNCED WITH SENTINEL</span>
                    </div>
                </div>
                <div className="vu-header-decor">
                    <div className="vu-decor-dot"></div>
                    <div className="vu-decor-dot"></div>
                    <div className="vu-decor-dot"></div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="vu-messages sentinel-scrollbar">
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
                                    >
                                        {copiedId === msg.id ? <FaCheck /> : <FaRegCopy />}
                                    </button>
                                )}
                            </div>
                            <div className="vu-timestamp">
                                {msg.sender === 'user' ? 'AUTHD_USER' : 'CORE_INTEL'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        <span>SYNTHESIZING...</span>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="vu-input-area">
                <div className="vu-input-wrapper">
                    <input
                        type="text"
                        className="vu-input-field"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Inquire Neural Core personnel archives or curriculum maps..."
                        disabled={isLoading || isHistoryLoading}
                    />
                    <button
                        type="submit"
                        className={`vu-send-btn ${input.trim() && !isLoading ? 'active' : 'inactive'}`}
                        disabled={isLoading || !input.trim() || isHistoryLoading}
                    >
                        <FaPaperPlane size={18} />
                    </button>
                </div>
            </form>

            <div className="vu-footer-bar"></div>
        </div>
    );
};

export default VuAiAgent;