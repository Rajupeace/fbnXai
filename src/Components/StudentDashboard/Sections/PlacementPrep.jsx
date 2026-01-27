import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBriefcase, FaUserTie, FaChevronRight, FaSpinner, FaArrowLeft, FaLaptopCode, FaServer, FaCodeBranch, FaCloud, FaChartBar
} from 'react-icons/fa';
import api from '../../../utils/apiClient';

/**
 * PLACEMENT PREP HUB
 * Supports: Company Selection -> Domain Selection -> Domain Specific Questions
 */
const PlacementPrep = ({ userData }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Navigation State
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const data = await api.apiGet('/api/placements');
            if (Array.isArray(data)) setCompanies(data);
        } catch (err) {
            console.error('Failed to fetch placement data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Filter questions based on domain
    const getFilteredQuestions = () => {
        if (!selectedCompany) return [];
        // If "General" or no domain selected, showed mixed or default?
        // Actually the UI forces a domain selection.
        if (!selectedDomain) return [];

        return selectedCompany.questions.filter(q =>
            q.domain === selectedDomain || q.domain === 'General' || q.domain === 'Aptitude'
        );
    };

    // Icons for domains
    const getDomainIcon = (domain) => {
        const d = (domain || '').toLowerCase();
        if (d.includes('frontend')) return <FaCodeBranch />;
        if (d.includes('backend') || d.includes('java') || d.includes('node')) return <FaServer />;
        if (d.includes('cloud') || d.includes('aws')) return <FaCloud />;
        if (d.includes('data') || d.includes('analytics')) return <FaChartBar />;
        if (d.includes('net') || d.includes('security')) return <FaUserTie />;
        return <FaLaptopCode />;
    };

    const QuestionCard = ({ q, idx, color }) => {
        const [isOpen, setIsOpen] = useState(false);
        return (
            <motion.div
                layout
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                    transition: 'all 0.2s', background: isOpen ? '#ffffff' : '#fafafa',
                    cursor: 'pointer', boxShadow: isOpen ? '0 10px 15px -3px rgba(0,0,0,0.05)' : 'none',
                    borderColor: isOpen ? color : '#e2e8f0'
                }}
            >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                        minWidth: '28px', height: '28px', borderRadius: '8px',
                        background: isOpen ? color : '#cbd5e1', color: 'white', fontWeight: 700, fontSize: '0.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s'
                    }}>
                        Q{idx + 1}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#334155', fontWeight: 600, flex: 1 }}>
                        {q.question}
                    </h4>
                    <FaChevronRight style={{
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s', fontSize: '0.7rem', color: '#94a3b8'
                    }} />
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="answer-box" style={{
                                marginLeft: 'calc(28px + 1rem)', marginTop: '1rem',
                                paddingLeft: '1rem', borderLeft: `3px solid ${color}40`
                            }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                                    {q.answer}
                                </p>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b' }}>{q.category}</span>
                                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b' }}>{q.difficulty}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="nexus-loading-center">
                <FaSpinner className="spinner-icon" />
                <p>Loading Career Hub...</p>
            </div>
        );
    }

    // VIEW 1: COMPANY SELECTION (GRID)
    if (!selectedCompany) {
        return (
            <div className="nexus-page-container fade-in">
                {/* Hero Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '24px', padding: '3rem 2rem', marginBottom: '2.5rem',
                    position: 'relative', overflow: 'hidden', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}>
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span style={{
                                display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '50px',
                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)', marginBottom: '1rem', fontSize: '0.85rem'
                            }}>
                                🚀 PLACEMENT SEASON 2026
                            </span>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1 }}>
                                Crack Your Dream <br /><span style={{ color: '#818cf8', textShadow: '0 0 20px rgba(129, 140, 248, 0.5)' }}>Dream Company</span>
                            </h2>
                            <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.6 }}>
                                Hello <span style={{ fontWeight: 700, color: '#c7d2fe' }}>{userData?.studentName || 'Student'}</span>, access premium interview resources for top MNCs.
                            </p>
                        </motion.div>
                    </div>
                    {/* Abstract Graphic Right */}
                    <div style={{
                        position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px',
                        background: 'linear-gradient(45deg, #4f46e5, #ec4899)', filter: 'blur(80px)', opacity: 0.4, borderRadius: '50%'
                    }}></div>
                </div>

                <div className="company-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem',
                    paddingBottom: '2rem'
                }}>
                    {companies.map((company, i) => {
                        const keyId = company._id || company.id || company.slug || i;
                        return (
                            <motion.div
                                key={keyId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                                onClick={() => { setSelectedCompany(company); setSelectedDomain((company.domains || [])[0] || null); }}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(0,0,0,0.04)',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    height: '100%'
                                }}
                            >
                                <div style={{ height: '80px', background: `${company.color}15`, position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', bottom: '-25px', left: '25px',
                                        width: '60px', height: '60px', borderRadius: '16px',
                                        background: 'white',
                                        border: `1px solid ${company.color}20`,
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                        overflow: 'hidden'
                                    }}>
                                        {company.logo ? (
                                            <img
                                                src={company.logo}
                                                onError={(e) => {
                                                    try {
                                                        const img = e && e.target;
                                                        if (!img) return;
                                                        img.style.display = 'none';
                                                        const parent = img.parentNode;
                                                        if (!parent) return;
                                                        parent.style.background = company.color || '#000';
                                                        parent.textContent = (company && company.name) ? company.name.substring(0, 1) : '';
                                                        parent.style.color = 'white';
                                                        parent.style.fontSize = '1.75rem';
                                                        parent.style.fontWeight = '900';
                                                        parent.style.display = 'flex';
                                                        parent.style.alignItems = 'center';
                                                        parent.style.justifyContent = 'center';
                                                    } catch (err) {
                                                        console.warn('Placement logo onError:', err);
                                                    }
                                                }}
                                                alt={company.name}
                                                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%', height: '100%', background: company.color,
                                                color: 'white', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900
                                            }}>
                                                {company.name.substring(0, 1)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ padding: '3rem 1.75rem 1.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{company.name}</h3>
                                        <FaArrowLeft style={{ transform: 'rotate(135deg)', color: company.color, opacity: 0 }} className="icon-hover" />
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                        {company.description ? company.description.substring(0, 60) : 'Top MNC'}...
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px' }}>
                                        <FaUserTie style={{ color: company.color }} />
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>ROLE</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{company.hiringRole}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 'auto' }}>
                                        <div className="domain-tags" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {(company.domains || []).slice(0, 3).map(d => (
                                                <span key={d} style={{ fontSize: '0.7rem', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '4px 10px', borderRadius: '30px' }}>
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // VIEW 2: DOMAIN SELECTION & QUESTIONS
    return (
        <div className="nexus-page-container fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="prep-header" style={{
                background: 'white', padding: '1.5rem', borderRadius: '16px',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
                border: '1px solid #e2e8f0'
            }}>
                <button
                    onClick={() => { setSelectedCompany(null); setSelectedDomain(null); }}
                    style={{
                        background: '#f8fafc', border: 'none', width: '40px', height: '40px',
                        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#64748b'
                    }}
                >
                    <FaArrowLeft />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{selectedCompany.name} <span style={{ fontWeight: 400, opacity: 0.5 }}>Preparation</span></h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{selectedCompany.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedCompany.color }}>{selectedCompany.package}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Est. Package</div>
                </div>
            </div>

            <div className="prep-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                {/* Sidebar: Domain Selection */}
                <aside className="domain-sidebar" style={{
                    background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                    padding: '1.5rem', overflowY: 'auto'
                }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                        SELECT DOMAIN
                    </h4>
                    <div className="domain-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(selectedCompany.domains || ['General']).map(domain => (
                            <button
                                key={domain}
                                onClick={() => setSelectedDomain(domain)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '1rem', borderRadius: '8px',
                                    background: selectedDomain === domain ? `${selectedCompany.color}15` : 'transparent', // 15% opacity
                                    color: selectedDomain === domain ? selectedCompany.color : '#475569',
                                    border: selectedDomain === domain ? `1px solid ${selectedCompany.color}40` : '1px solid transparent',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                    fontWeight: selectedDomain === domain ? 700 : 500
                                }}
                            >
                                {getDomainIcon(domain)}
                                <span>{domain}</span>
                                {selectedDomain === domain && <FaChevronRight style={{ marginLeft: 'auto', fontSize: '0.7rem' }} />}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>🎯 Pro Tip</h5>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: '1.5' }}>
                            Start with "Software Engineer" or "Aptitude" for the initial rounds.
                        </p>
                    </div>
                </aside>

                {/* Main: Questions */}
                <main className="qna-area" style={{
                    background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                    padding: '2rem', overflowY: 'auto'
                }}>
                    {selectedDomain ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedDomain}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, color: '#1e293b' }}>
                                        {selectedDomain} Questions
                                        <span style={{ fontSize: '0.85rem', fontWeight: 400, marginLeft: '0.75rem', color: '#94a3b8' }}>
                                            {getFilteredQuestions().length} Questions Available
                                        </span>
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '20px', background: '#ecfdf5', color: '#059669', fontWeight: 600 }}>Active Session</span>
                                </div>

                                <div className="questions-stack" style={{ display: 'grid', gap: '1rem' }}>
                                    {getFilteredQuestions().map((q, idx) => (
                                        <QuestionCard key={idx} q={q} idx={idx} color={selectedCompany.color} />
                                    ))}

                                    {getFilteredQuestions().length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                            <FaBriefcase size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            <p>No specific questions tagged for this domain yet.</p>
                                            <p style={{ fontSize: '0.85rem' }}>Try "General" or another domain.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: '#cbd5e1' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
                            }}>
                                <FaCodeBranch size={24} />
                            </div>
                            <h3>Select a domain from the sidebar</h3>
                            <p style={{ maxWidth: '300px', textAlign: 'center', fontSize: '0.9rem' }}>
                                Browse tailored interview questions for specific roles like Frontend, Backend, or SDE.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PlacementPrep;
