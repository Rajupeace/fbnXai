import React, { useState, useEffect, useCallback } from 'react';
import {
    FaVideo, FaFileAlt, FaBrain,
    FaClock, FaRocket, FaTerminal, FaQuestionCircle,
    FaUserTie, FaCalendarAlt, FaShieldAlt,
    FaPython, FaJava, FaCode, FaNodeJs, FaCss3Alt,
    FaDatabase, FaJs, FaChevronRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '../../../utils/apiClient';
import '../AdvancedLearning.css';

/**
 * NEXUS ADVANCED LEARNING HUB
 * A premium workstation for elite programming and full-stack development.
 */
const AdvancedLearning = ({ userData, overviewData }) => {
    const [activeTab, setActiveTab] = useState('languages'); // 'languages' | 'fullstack' | 'faculty' | 'exams'
    const [selectedTech, setSelectedTech] = useState('Python');
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);

    // Dynamic Faculty Data from Synchronized Mesh
    const activeCommanders = overviewData?.myFaculty || [];

    const techCategories = {
        languages: [
            { name: 'Python', icon: <FaPython />, color: '#3776ab', desc: 'Advanced AI & Automation' },
            { name: 'Java', icon: <FaJava />, color: '#007396', desc: 'Enterprise Distributed Systems' },
            { name: 'Go', icon: <FaCode />, color: '#00add8', desc: 'Cloud-Native Concurrency' },
            { name: 'Rust', icon: <FaTerminal />, color: '#dea584', desc: 'Safe Systems Programming' },
            { name: 'C++', icon: <FaCode />, color: '#00599c', desc: 'System & Game Engineering' },
            { name: 'Swift', icon: <FaCode />, color: '#f05138', desc: 'Modern iOS Ecosystems' }
        ],
        fullstack: [
            { name: 'React', icon: <FaJs />, color: '#61dafb', desc: 'Reactive UI Architectures' },
            { name: 'Node.js', icon: <FaNodeJs />, color: '#339933', desc: 'Scalable Backend Meshes' },
            { name: 'DevOps', icon: <FaTerminal />, color: '#2496ed', desc: 'Docker & Kubernetes Infra' },
            { name: 'Cloud', icon: <FaDatabase />, color: '#ff9900', desc: 'AWS & Azure Architectures' },
            { name: 'Modern CSS', icon: <FaCss3Alt />, color: '#1572b6', desc: 'Grid/Flex & Glassmorphism' },
            { name: 'AI Engineering', icon: <FaBrain />, color: '#8e44ad', desc: 'Neural Network Deployment' }
        ]
    };

    const fetchAdvancedMaterials = useCallback(async () => {
        setLoading(true);
        try {
            // Fetching materials filtered by tech name and isAdvanced flag
            const data = await apiGet(`/api/materials?subject=${selectedTech}&isAdvanced=true`);
            setMaterials(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Advanced Sync Failed:", e);
        } finally {
            setLoading(false);
        }
    }, [selectedTech]);

    useEffect(() => {
        fetchAdvancedMaterials();
    }, [fetchAdvancedMaterials]);

    const renderResources = (type) => {
        const filtered = materials.filter(m => m.type === type);
        if (filtered.length === 0) {
            return <div className="empty-resource">NO {type.toUpperCase()} DECRYPTED FOR {selectedTech.toUpperCase()}</div>;
        }

        return (
            <div className="resource-stack">
                {filtered.map((m, i) => (
                    <div key={i} className="resource-item" onClick={() => window.open(m.fileUrl || m.url, '_blank')}>
                        <div className="res-icon">
                            {type === 'videos' ? <FaVideo /> : type === 'interviewQnA' ? <FaQuestionCircle /> : <FaFileAlt />}
                        </div>
                        <div className="res-text">
                            <h4>{m.title}</h4>
                            <span>{m.description || 'Advanced Module'}</span>
                        </div>
                        <FaChevronRight className="arrow" />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="nexus-advanced-container">
            {/* Cinematic Effects */}
            <div className="nexus-cyber-grid"></div>
            <div className="nexus-scanline"></div>

            {/* Header Area */}
            <div className="nexus-adv-header">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="nexus-page-subtitle">
                        <FaRocket /> Advanced Mastery Protocol
                    </div>
                    <h1 className="nexus-page-title">
                        STARSHIP <span>COMMAND</span>
                    </h1>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="stat-node"
                >
                    <span className="val">85%</span>
                    <span className="lab">SYNC LEVEL</span>
                </motion.div>
            </div>

            {/* Main Navigation Tabs */}
            <div className="nexus-adv-tabs">
                <button
                    className={`adv-tab ${activeTab === 'languages' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('languages'); setSelectedTech('Python'); }}
                >
                    <FaTerminal /> LANGUAGES
                </button>
                <button
                    className={`adv-tab ${activeTab === 'fullstack' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('fullstack'); setSelectedTech('React'); }}
                >
                    <FaCode /> FULL STACK
                </button>
                <button
                    className={`adv-tab ${activeTab === 'faculty' ? 'active' : ''}`}
                    onClick={() => setActiveTab('faculty')}
                >
                    <FaUserTie /> COMMANDERS
                </button>
                <button
                    className={`adv-tab ${activeTab === 'exams' ? 'active' : ''}`}
                    onClick={() => setActiveTab('exams')}
                >
                    <FaShieldAlt /> ASSESSMENTS
                </button>
            </div>

            <div className="nexus-adv-content">
                {(activeTab === 'languages' || activeTab === 'fullstack') && (
                    <div className="tech-workstation">
                        {/* Sidebar: Tech Selector */}
                        <div className="tech-selector">
                            {techCategories[activeTab].map(tech => (
                                <div
                                    key={tech.name}
                                    className={`tech-node ${selectedTech === tech.name ? 'active' : ''}`}
                                    onClick={() => setSelectedTech(tech.name)}
                                    style={{ '--tech-color': tech.color }}
                                >
                                    <div className="tech-icon">{tech.icon}</div>
                                    <div className="tech-info">
                                        <h4>{tech.name}</h4>
                                        <p>{tech.desc}</p>
                                    </div>
                                    {selectedTech === tech.name && <div className="tech-active-bar" style={{ background: tech.color }}></div>}
                                </div>
                            ))}
                        </div>

                        {/* Main Interaction Pane */}
                        <div className="interaction-pane">
                            <div className="pane-header">
                                <div className="pane-title">
                                    <h2>{selectedTech.toUpperCase()} INTERFACE</h2>
                                    <span>REAL-TIME KNOWLEDGE SYNC ACTIVE</span>
                                </div>
                                {loading && <div className="nexus-loading-ring"></div>}
                            </div>

                            <div className="resource-grid">
                                <div className="resource-column">
                                    <h3 className="col-title"><FaVideo /> VIDEO DIRECTIVES</h3>
                                    {renderResources('videos')}
                                </div>
                                <div className="resource-column">
                                    <h3 className="col-title"><FaFileAlt /> ACADEMIC NOTES</h3>
                                    {renderResources('notes')}
                                </div>
                                <div className="resource-column">
                                    <h3 className="col-title"><FaQuestionCircle /> INTERVIEW INTEL</h3>
                                    {renderResources('interviewQnA')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'faculty' && (
                    <div className="faculty-nexus">
                        <div className="faculty-header">
                            <h2 className="mission-commanders-title">Mission Commanders</h2>
                            <p className="mission-commanders-desc">Direct synchronization with faculty members assigned to your section.</p>
                        </div>
                        <div className="f-grid">
                            {activeCommanders.length > 0 ? activeCommanders.map((f, i) => (
                                <div key={i} className="f-card">
                                    <div className="f-avatar"><FaUserTie /></div>
                                    <div className="f-main">
                                        <h3>{f.name}</h3>
                                        <span className="f-subj">{f.subject}</span>
                                        <div className="f-details">
                                            <div className="f-detail"><FaUserTie className="text-primary" /> {f.email}</div>
                                            <div className="f-detail"><FaClock className="text-primary" /> {f.time || 'Office Hours Available'}</div>
                                            <div className="f-detail"><FaCalendarAlt className="text-primary" /> {f.room || 'Department Faculty Hub'}</div>
                                        </div>
                                    </div>
                                    <button className="f-connect">REACH OUT</button>
                                </div>
                            )) : (
                                <div className="nexus-empty-journal no-synced-faculty">
                                    <FaUserTie className="no-synced-icon" />
                                    <h3>NO COMMANDERS SYNCED</h3>
                                    <p>Your faculty mesh is currently awaiting assignment data.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="exam-nexus">
                        {loading ? (
                            <div className="nexus-loading-ring"></div>
                        ) : materials.filter(m => m.type === 'exam' || m.type === 'assignment').length === 0 ? (
                            <div className="nexus-empty-journal">
                                <FaShieldAlt className="no-synced-icon" />
                                <h3>NO ACTIVE ASSESSMENTS</h3>
                                <p>No scheduled evaluations detected in the neural mesh.</p>
                            </div>
                        ) : (
                            <>
                                {materials.filter(m => m.type === 'exam').sort((a, b) => new Date(a.date) - new Date(b.date))[0] && (
                                    <div className="exam-status-banner">
                                        <FaShieldAlt /> NEXT ASSESSMENT CRITICAL: {materials.filter(m => m.type === 'exam').sort((a, b) => new Date(a.date) - new Date(b.date))[0].title.toUpperCase()}
                                    </div>
                                )}
                                <div className="exam-grid">
                                    {materials.filter(m => m.type === 'exam' || m.type === 'assignment').map((exam, idx) => (
                                        <div key={idx} className="exam-card">
                                            <h3>{exam.title}</h3>
                                            <p>{exam.subject} - {exam.desc || 'Scheduled Assessment'}</p>
                                            <div className="exam-meta">
                                                <span>TIME: {exam.duration || '60m'}</span>
                                                <span>TYPE: {exam.mode || 'THEORETICAL'}</span>
                                            </div>
                                            <div className="exam-meta" style={{ marginTop: '0.5rem', color: '#64748b' }}>
                                                <FaCalendarAlt /> {new Date(exam.date || Date.now()).toLocaleDateString()}
                                            </div>
                                            <button className="exam-btn" onClick={() => window.open(exam.link || '#', '_blank')}>INITIATE TEST</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedLearning;
