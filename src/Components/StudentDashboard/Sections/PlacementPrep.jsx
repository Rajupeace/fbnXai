import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBriefcase, FaUserTie, FaChevronRight, FaSpinner, FaArrowLeft, FaLaptopCode, FaServer, FaCodeBranch, FaCloud, FaChartBar, FaCheckCircle, FaLightbulb, FaUniversity
} from 'react-icons/fa';
import api from '../../../utils/apiClient';
import './PlacementPrep.css';

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
                className={`q-card-premium ${isOpen ? 'open' : ''}`}
                style={{
                    padding: '1.5rem', borderRadius: '18px', border: '1px solid #f1f5f9',
                    background: isOpen ? '#ffffff' : '#f8fafc',
                    cursor: 'pointer', transition: 'all 0.3s',
                    boxShadow: isOpen ? `0 20px 40px -10px ${color}20` : 'none',
                    borderLeft: `5px solid ${isOpen ? color : '#e2e8f0'}`,
                    marginBottom: '1rem'
                }}
            >
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <div style={{
                        minWidth: '32px', height: '32px', borderRadius: '10px',
                        background: isOpen ? color : '#cbd5e1', color: 'white', fontWeight: 900, fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s'
                    }}>
                        {idx + 1}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#334155', fontWeight: 750, flex: 1, lineHeight: 1.4 }}>
                        {q.question}
                    </h4>
                    <FaChevronRight style={{
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', fontSize: '0.8rem', color: '#94a3b8'
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
                            <div style={{
                                marginLeft: 'calc(32px + 1.25rem)', marginTop: '1.5rem',
                                paddingLeft: '1.5rem', borderLeft: `3px dashed ${color}30`
                            }}>
                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.8' }}>
                                    {q.answer}
                                </p>
                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: '6px', background: '#f1f5f9', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>{q.category}</span>
                                    <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: '6px', background: '#f1f5f9', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>{q.difficulty}</span>
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
                <p>Establishing Pipeline...</p>
            </div>
        );
    }

    if (!selectedCompany) {
        return (
            <div className="placement-container">
                <div className="placement-hero">
                    <div className="hero-content">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="hero-badge">
                                <FaBriefcase /> PLACEMENT COMMAND CENTER
                            </div>
                            <h2 className="hero-title">
                                Master Your <br /><span>Strategic Career</span>
                            </h2>
                            <p className="hero-subtitle">
                                Welcome, <strong>{userData?.studentName}</strong>. Your roadmap to Google, Microsoft, and Amazon begins here. Access curated interview intelligence.
                            </p>
                        </motion.div>
                    </div>
                </div>

                <div className="company-grid">
                    {companies.map((company, i) => (
                        <motion.div
                            key={company._id || i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="premium-company-card"
                            onClick={() => {
                                setSelectedCompany(company);
                                setSelectedDomain((company.domains || [])[0] || null);
                            }}
                        >
                            <div className="card-banner" style={{ background: `linear-gradient(135deg, ${company.color} 0%, ${company.color}dd 100%)` }}>
                                <div className="logo-wrapper">
                                    <div style={{ width: '100%', height: '100%', background: company.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 950 }}>
                                        {company.name.substring(0, 1)}
                                    </div>
                                </div>
                            </div>

                            <div className="card-main-content">
                                <div className="company-name-row">
                                    <h3>{company.name}</h3>
                                    <div className="package-pill">{company.package || '6.5 LPA'}</div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                    {company.description ? company.description.substring(0, 70) : 'Elite recruitment partner for technology roles.'}...
                                </p>

                                <div className="role-info-box">
                                    <FaUserTie className="role-icon" style={{ color: company.color }} />
                                    <div className="role-details">
                                        <label>Active Role</label>
                                        <span>{company.hiringRole || 'SDE / Intern'}</span>
                                    </div>
                                </div>

                                <div className="domain-tags-row">
                                    {(company.domains || ['General']).slice(0, 3).map(d => (
                                        <span key={d} className="tag-lite">{d}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="placement-container">
            <header className="prep-header-premium">
                <button className="back-circle-btn" onClick={() => { setSelectedCompany(null); setSelectedDomain(null); }}>
                    <FaArrowLeft />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#1e293b' }}>
                        {selectedCompany.name} <span style={{ fontWeight: 400, color: '#94a3b8' }}>Ecosystem</span>
                    </h2>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>{selectedCompany.hiringRole} • Prep Materials</p>
                </div>
                <div style={{ textAlign: 'right', padding: '0.75rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 950, color: selectedCompany.color }}>{selectedCompany.package}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Top Package</div>
                </div>
            </header>

            <div className="prep-main-layout">
                <aside className="prep-sidebar-glass">
                    <h4 style={{ margin: '0 0 1.5rem', fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Neural Filters
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(selectedCompany.domains || ['General']).map(domain => (
                            <button
                                key={domain}
                                onClick={() => setSelectedDomain(domain)}
                                className={`domain-nav-item ${selectedDomain === domain ? 'active' : ''}`}
                            >
                                <div className="nav-icon">{getDomainIcon(domain)}</div>
                                <span className="nav-label">{domain}</span>
                                {selectedDomain === domain && <FaCheckCircle style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#6366f1' }} />}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 850 }}>🚀 AI STRATEGY</h5>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6', fontWeight: 500 }}>
                            Most students spend <strong>7.4 hours</strong> on software domains. Start with Aptitude for the screening round.
                        </p>
                    </div>
                </aside>

                <main className="prep-content-area">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDomain}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>
                                        {selectedDomain} Intelligence
                                    </h3>
                                    <p style={{ margin: '0.3rem 0 0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {getFilteredQuestions().length} High-Probability Questions
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', padding: '0.5rem 1rem', borderRadius: '100px', color: '#10b981', fontSize: '0.8rem', fontWeight: 900 }}>
                                    <FaCheckCircle /> SECURE SYNC
                                </div>
                            </div>

                            <div className="questions-container">
                                {getFilteredQuestions().map((q, idx) => (
                                    <QuestionCard key={idx} q={q} idx={idx} color={selectedCompany.color} />
                                ))}

                                {getFilteredQuestions().length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                                        <FaUniversity size={60} style={{ color: '#f1f5f9', marginBottom: '1.5rem' }} />
                                        <h3 style={{ color: '#cbd5e1' }}>Pipeline Empty</h3>
                                        <p style={{ color: '#94a3b8' }}>No specific data tags for this domain. Select another filter.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default PlacementPrep;
