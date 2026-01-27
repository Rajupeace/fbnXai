import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaRoad, FaCode, FaLaptopCode, FaJava, FaPython, FaServer, FaCheckCircle, FaSpinner,
    FaChevronRight, FaArrowLeft, FaTrophy, FaWindows, FaGoogle, FaShieldAlt, FaGem, FaCogs,
    FaLock, FaAndroid, FaSearch, FaFilter, FaPalette, FaPhp, FaSwift, FaReact, FaVuejs, FaAngular, FaDocker, FaAws, FaDatabase, FaLeaf
} from 'react-icons/fa';
import api from '../../../utils/apiClient';

/**
 * STUDENT ROADMAPS
 * Comprehensive learning paths (Zero to Hero) for various technologies.
 * Features:
 * - Interactive Progress Tracking (Local Storage)
 * - Visual Progress Bar
 * - Level-based filtering
 * - Category Filtering & Search
 */
const StudentRoadmaps = () => {
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);

    // Filtering State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // State for tracking progress (simple local persistence)
    // State for tracking progress. Start with local storage fallback, but will sync with DB.
    const [completedTopics, setCompletedTopics] = useState({});

    // Fetch Roadmaps & Progress
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch available roadmaps
                const maps = await api.apiGet('/api/roadmaps');
                if (Array.isArray(maps)) setRoadmaps(maps);

                // 2. Fetch logged-in user's progress
                const studentId = localStorage.getItem('user_id'); // Assuming stored on login
                if (studentId) {
                    const studentData = await api.apiGet(`/api/students/${studentId}/overview`);
                    if (studentData && studentData.roadmapProgress) {
                        setCompletedTopics(studentData.roadmapProgress);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch roadmaps or progress:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleTopic = async (roadmapSlug, topicName) => {
        // Optimistic Update
        const prevTopics = { ...completedTopics };
        const roadmapProgress = prevTopics[roadmapSlug] || [];
        const isCompleted = roadmapProgress.includes(topicName);

        const newProgress = isCompleted
            ? roadmapProgress.filter(t => t !== topicName)
            : [...roadmapProgress, topicName];

        const newState = { ...prevTopics, [roadmapSlug]: newProgress };
        setCompletedTopics(newState); // Create immediate UI feedback

        // Sync with Backend
        try {
            const studentId = localStorage.getItem('user_id');
            if (studentId) {
                await api.apiPost(`/api/students/${studentId}/roadmap-progress`, {
                    roadmapSlug,
                    completedTopics: newProgress
                });
            } else {
                // Fallback to local storage if no user ID (e.g. guest mode)
                localStorage.setItem('roadmap_progress', JSON.stringify(newState));
            }
        } catch (err) {
            console.error('Failed to save progress:', err);
            // Revert on failure (optional, but good practice)
            setCompletedTopics(prevTopics);
        }
    };

    // Helper to get icon component safely
    const getIcon = (iconName) => {
        if (!iconName) return <FaCode />;
        switch (iconName) {
            case 'FaPython': return <FaPython />;
            case 'FaJava': return <FaJava />;
            case 'FaServer': return <FaServer />;
            case 'FaLaptopCode': return <FaLaptopCode />;
            case 'FaRoad': return <FaRoad />;
            case 'FaWindows': return <FaWindows />;
            case 'FaGoogle': return <FaGoogle />;
            case 'FaShieldAlt': return <FaShieldAlt />;
            case 'FaGem': return <FaGem />;
            case 'FaCogs': return <FaCogs />;
            case 'FaLock': return <FaLock />;
            case 'FaAndroid': return <FaAndroid />;
            case 'FaPalette': return <FaPalette />;
            case 'FaPhp': return <FaPhp />;
            case 'FaSwift': return <FaSwift />;
            case 'FaReact': return <FaReact />;
            case 'FaVuejs': return <FaVuejs />;
            case 'FaAngular': return <FaAngular />;
            case 'FaDocker': return <FaDocker />;
            case 'FaAws': return <FaAws />;
            case 'FaDatabase': return <FaDatabase />;
            case 'FaLeaf': return <FaLeaf />;
            default: return <FaCode />;
        }
    };

    // Filter Logic
    const categories = ['All', 'Web Development', 'App Development', 'Systems', 'Mobile', 'AI & Data', 'Security', 'Design'];

    const filteredRoadmaps = roadmaps.filter(map => {
        // robust search normalization
        const query = searchQuery.toLowerCase().trim();
        const matchData = `${map.title} ${map.description} ${map.category} ${map.slug}`.toLowerCase();

        // Split query into significant terms (ignore common noise words)
        const stopWords = ['roadmap', 'roadmaps', 'road', 'map', 'maps', 'learning', 'path', 'paths', 'course', 'courses', 'tutorial', 'tutorials'];
        const terms = query.split(/\s+/).filter(t => t.length > 0 && !stopWords.includes(t));

        const matchesSearch = terms.length === 0 || terms.every(term => matchData.includes(term));

        // If searching (terms exist), ignore category filter to ensure global visibility
        const isSearching = terms.length > 0;
        const matchesCategory = isSearching || activeCategory === 'All' || map.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="nexus-loading-center">
                <FaSpinner className="spinner-icon" />
                <p>Loading Learning Paths...</p>
            </div>
        );
    }

    if (!roadmaps || roadmaps.length === 0) {
        return (
            <div className="nexus-page-container fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
                <FaSearch size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                <h3 style={{ color: '#475569' }}>No Learning Paths Found</h3>
                <p style={{ color: '#94a3b8' }}>The roadmap library is currently empty. Please initialize the database.</p>
                <button
                    onClick={fetchRoadmaps}
                    style={{
                        marginTop: '1rem', padding: '10px 20px', borderRadius: '12px',
                        background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer'
                    }}
                >
                    Retry Fetching
                </button>
            </div>
        );
    }

    // LIST VIEW
    if (!selectedRoadmap) {
        return (
            <div className="nexus-page-container fade-in">
                <header className="hub-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h2 className="nexus-page-title">LEARNING <span>ROADMAPS</span></h2>
                        <p className="nexus-page-subtitle">Select a technology stack to master from Zero to Advanced.</p>
                    </div>
                </header>

                {/* Filters & Search */}
                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative', maxWidth: '600px' }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search technologies (e.g., Python, C++, Security)..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value) setActiveCategory('All');
                            }}
                            style={{
                                width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '16px',
                                border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'border-color 0.2s'
                            }}
                            className="input-focus-effect"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: '8px 16px', borderRadius: '20px', border: 'none',
                                    background: activeCategory === cat ? '#2563eb' : 'white',
                                    color: activeCategory === cat ? 'white' : '#64748b',
                                    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                                    boxShadow: activeCategory === cat ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s', whiteSpace: 'nowrap'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    <AnimatePresence mode='popLayout'>
                        {filteredRoadmaps.map((map, i) => (
                            <motion.div
                                key={map._id || i}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ y: -8, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)' }}
                                onClick={() => setSelectedRoadmap(map)}
                                style={{
                                    background: 'white', borderRadius: '24px', padding: '2rem',
                                    border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
                                    position: 'relative', overflow: 'hidden',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '16px',
                                    background: `${map.color}20`, color: map.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.75rem', marginBottom: '1.5rem'
                                }}>
                                    {getIcon(map.icon)}
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <span style={{
                                        display: 'inline-block', fontSize: '0.75rem', fontWeight: 700,
                                        color: map.color, background: `${map.color}10`, padding: '4px 8px', borderRadius: '8px',
                                        marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px'
                                    }}>
                                        {map.category || 'Development'}
                                    </span>
                                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem', marginTop: 0 }}>{map.title}</h3>
                                </div>

                                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                    {map.description}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                                        {map.levels?.length || 0} Levels
                                    </span>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: map.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaChevronRight size={12} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredRoadmaps.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#cbd5e1' }}>
                        <FaSearch size={48} style={{ marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>No roadmaps found for "{searchQuery}"</p>
                    </div>
                )}
            </div>
        );
    }

    // DETAIL VIEW
    const mapSlug = selectedRoadmap.slug || selectedRoadmap._id;
    // Safely calculate progress
    let totalTopics = 0;
    if (selectedRoadmap.levels && Array.isArray(selectedRoadmap.levels)) {
        selectedRoadmap.levels.forEach(lvl => {
            if (lvl.topics && Array.isArray(lvl.topics)) {
                totalTopics += lvl.topics.length;
            }
        });
    }

    const completedCount = completedTopics[mapSlug]?.length || 0;
    const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    return (
        <div className="nexus-page-container fade-in">
            {/* Header Area */}
            <header style={{
                marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
                background: 'white', padding: '1.5rem', borderRadius: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                <button
                    onClick={() => setSelectedRoadmap(null)}
                    style={{
                        background: '#f8fafc', border: 'none', borderRadius: '12px',
                        width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#64748b', transition: 'all 0.2s',
                        fontSize: '1.2rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                >
                    <FaArrowLeft />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h2 className="nexus-page-title" style={{ margin: 0, fontSize: '1.8rem' }}>
                            {selectedRoadmap?.title || 'Unknown Roadmap'}
                        </h2>
                        <span style={{
                            fontSize: '0.9rem', fontWeight: 700,
                            color: progressPercent === 100 ? '#10b981' : selectedRoadmap?.color || '#4f46e5'
                        }}>
                            {progressPercent}% Mastered
                        </span>
                    </div>
                    {/* Progress Bar Container */}
                    <div style={{
                        background: '#f1f5f9', borderRadius: '10px', height: '12px',
                        width: '100%', overflow: 'hidden', position: 'relative'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                            style={{
                                height: '100%',
                                background: progressPercent === 100 ? '#10b981' : (selectedRoadmap?.color || '#4f46e5'),
                                borderRadius: '10px'
                            }}
                        />
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2.5rem', alignItems: 'start' }}>
                {/* Visual / Info Card (Left Column) */}
                <div style={{ position: 'sticky', top: '1.5rem' }}>
                    <div style={{
                        background: selectedRoadmap?.color || '#4f46e5',
                        color: 'white', borderRadius: '24px',
                        padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        {/* Background Decoration */}
                        <div style={{
                            position: 'absolute', top: -50, right: -50, width: 200, height: 200,
                            background: 'white', opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)'
                        }} />

                        <div style={{
                            fontSize: '4rem', marginBottom: '1.5rem',
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                        }}>
                            {getIcon(selectedRoadmap?.icon)}
                        </div>

                        <h3 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.1 }}>
                            Zero to Hero
                        </h3>
                        <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6', marginBottom: '2.5rem' }}>
                            {selectedRoadmap?.description || 'Follow this path to achieve mastery.'}
                        </p>

                        <div style={{
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                            padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem'
                        }}>
                            <div style={{ background: 'white', color: selectedRoadmap?.color, padding: '10px', borderRadius: '12px' }}>
                                <FaTrophy size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '1px' }}>Current Rank</div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                    {progressPercent < 25 ? 'Novice' :
                                        progressPercent < 50 ? 'Apprentice' :
                                            progressPercent < 75 ? 'Contributor' :
                                                progressPercent < 100 ? 'Expert' : 'Master'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Content (Right Column) */}
                <div className="roadmap-timeline">
                    {(selectedRoadmap?.levels || []).map((level, lvlIdx) => (
                        <motion.div
                            key={lvlIdx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: lvlIdx * 0.15 }}
                            style={{
                                background: 'white', borderRadius: '24px', padding: '2rem',
                                marginBottom: '2rem',
                                borderLeft: `6px solid ${lvlIdx < (progressPercent / 20) ? '#10b981' : '#e2e8f0'}`,
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                position: 'relative'
                            }}
                        >
                            {/* Connector Line (Visual only) */}
                            {lvlIdx !== (selectedRoadmap.levels.length - 1) && (
                                <div style={{
                                    position: 'absolute', left: '-23px', top: '50%', height: 'calc(100% + 2rem)',
                                    width: '2px', background: '#e2e8f0', zIndex: -1
                                }} />
                            )}

                            {/* Level Header */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'start',
                                marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed #e2e8f0'
                            }}>
                                <div>
                                    <div style={{
                                        display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                                        background: `${selectedRoadmap?.color}15`, color: selectedRoadmap?.color,
                                        fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.5rem',
                                        textTransform: 'uppercase', letterSpacing: '0.5px'
                                    }}>
                                        Phase {lvlIdx + 1}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0, fontWeight: 700 }}>
                                        {level?.title}
                                    </h3>
                                    <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
                                        {level?.description}
                                    </p>
                                </div>
                                <span style={{
                                    background: '#f8fafc', padding: '6px 12px', borderRadius: '8px',
                                    fontSize: '0.8rem', fontWeight: 600, color: '#475569'
                                }}>
                                    {level?.subtitle}
                                </span>
                            </div>

                            {/* Topics Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {(level?.topics || []).map((topicObj, tIdx) => {
                                    const topicName = typeof topicObj === 'string' ? topicObj : topicObj.topic;
                                    const isDone = (completedTopics[mapSlug] || []).includes(topicName);

                                    return (
                                        <div
                                            key={tIdx}
                                            onClick={() => toggleTopic(mapSlug, topicName)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '1rem',
                                                padding: '1rem', borderRadius: '16px',
                                                background: isDone ? '#f0fdf4' : 'white',
                                                border: isDone ? '1px solid #86efac' : '1px solid #e2e8f0',
                                                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: isDone ? 'none' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                                                transform: isDone ? 'scale(0.98)' : 'scale(1)'
                                            }}
                                            className="topic-card-hover"
                                        >
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                border: isDone ? 'none' : `2px solid ${selectedRoadmap.color || '#cbd5e1'}`,
                                                background: isDone ? '#22c55e' : 'transparent',
                                                color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.85rem', flexShrink: 0, transition: 'all 0.3s'
                                            }}>
                                                {isDone && <FaCheckCircle />}
                                            </div>
                                            <span style={{
                                                fontSize: '0.95rem',
                                                color: isDone ? '#15803d' : '#334155',
                                                fontWeight: isDone ? 500 : 400,
                                                textDecoration: isDone ? 'line-through' : 'none',
                                                transition: 'color 0.2s'
                                            }}>
                                                {topicName}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}

                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <div style={{
                            display: 'inline-flex', padding: '1.5rem', borderRadius: '50%',
                            background: progressPercent === 100 ? '#dcfce7' : '#f1f5f9',
                            marginBottom: '1rem', color: progressPercent === 100 ? '#10b981' : '#cbd5e1'
                        }}>
                            <FaTrophy size={40} />
                        </div>
                        <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>
                            {progressPercent === 100 ? '🎓 Roadmap Completed!' : 'Keep Pushing Forward!'}
                        </h3>
                        <p>{progressPercent}% mastered. Greatness awaits.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRoadmaps;
