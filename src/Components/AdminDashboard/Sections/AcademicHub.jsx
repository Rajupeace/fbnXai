import React, { useState, useMemo } from 'react';
import {
    FaPlus, FaBook, FaEdit, FaTrash,
    FaThLarge, FaColumns, FaChartPie, FaListUl,
    FaSearch, FaCheckCircle, FaExclamationCircle, FaUserGraduate, FaFileUpload, FaRobot,
    FaCloud, FaCube
} from 'react-icons/fa';
import { getYearData } from '../../StudentDashboard/branchData';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Unified Academic Hub V4
 * Professional Curriculum Management with Live Sync Indicators
 */
const AcademicHub = ({ courses, students, materials, openModal, handleDeleteCourse, initialSection, onSectionChange, openAiWithPrompt }) => {
    // Core Hub State
    const [hubView, setHubView] = useState('syllabus'); // 'syllabus', 'sections', 'management'

    // Syllabus View State
    const [selectedBranchFilter, setSelectedBranchFilter] = useState('CSE');
    const [selectedSectionFilter, setSelectedSectionFilter] = useState(initialSection || 'All');
    const [activeYearTab, setActiveYearTab] = useState(1);
    const [gridMode, setGridMode] = useState('tabs'); // 'tabs' or 'all-years'
    const [searchTerm, setSearchTerm] = useState('');

    // Sync from parent
    React.useEffect(() => {
        if (initialSection) setSelectedSectionFilter(initialSection);
    }, [initialSection]);

    const handleSectionChangeInternal = (val) => {
        setSelectedSectionFilter(val);
        if (onSectionChange) onSectionChange(val);
    };

    const SECTION_OPTIONS = useMemo(() => {
        const alpha = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i));
        const num = Array.from({ length: 20 }, (_, i) => String(i + 1));
        return [...alpha, ...num];
    }, []);

    // --- CENTRALIZED DATA MERGE (Truth Source) ---
    const getMergedCoursesForYear = (year) => {
        // 1. Get Live DB Courses
        const dynamicCourses = courses.filter(c =>
            String(c.year) === String(year) &&
            (selectedBranchFilter === 'All' || c.branch?.toLowerCase() === selectedBranchFilter.toLowerCase() || c.branch === 'All') &&
            (selectedSectionFilter === 'All' || c.section === 'All' || c.section === selectedSectionFilter)
        );

        let merged = [...dynamicCourses];

        // 2. Merge Static Data if applicable
        if (selectedBranchFilter !== 'All') {
            const staticData = getYearData(selectedBranchFilter, String(year));
            if (staticData && staticData.semesters) {
                staticData.semesters.forEach(sem => {
                    sem.subjects.forEach(staticSub => {
                        // Conflict Check: Dynamic overrides Static if Code/Sem matches
                        const exists = dynamicCourses.some(c =>
                            (c.code === staticSub.code || c.courseCode === staticSub.code) &&
                            String(c.semester) === String(sem.sem)
                        );

                        // Override Check: Explicit "Delete" marker
                        const isOverridden = dynamicCourses.some(c =>
                            c.code === 'EMPTY__OVERRIDE' &&
                            (c.name === staticSub.name || c.courseName === staticSub.name || c.name === 'Empty Semester Override') &&
                            String(c.semester) === String(sem.sem)
                        );

                        if (!exists && !isOverridden) {
                            merged.push({
                                ...staticSub,
                                year: year,
                                semester: sem.sem,
                                branch: selectedBranchFilter,
                                section: selectedSectionFilter === 'All' ? 'All' : selectedSectionFilter,
                                isStatic: true,
                                id: `static-${staticSub.code}-${year}-${sem.sem}`
                            });
                        }
                    });
                });
            }
        }

        // Return sorted list (excluding system markers for display)
        return merged.filter(c => c.code !== 'EMPTY__OVERRIDE').sort((a, b) => a.semester - b.semester);
    };

    // Helper: Find active override for a semester
    const getOverrideForSemester = (year, semester) => {
        return courses.find(c =>
            c.code === 'EMPTY__OVERRIDE' &&
            String(c.year) === String(year) &&
            String(c.semester) === String(semester) &&
            (c.branch === selectedBranchFilter || c.branch === 'All')
        );
    };

    // Helper: Restore default subjects (Delete Override)
    const handleRestoreDefaults = async (overrideId) => {
        if (window.confirm('Restore default subjects for this semester?')) {
            await handleDeleteCourse(overrideId);
        }
    };

    // Helper for Management View (All Years)
    const getAllMergedCourses = () => {
        let all = [];
        [1, 2, 3, 4].forEach(y => {
            all = [...all, ...getMergedCoursesForYear(y)];
        });
        if (searchTerm) {
            all = all.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return all;
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    // --- RENDERERS ---

    const renderSectionsAnalytics = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 900 }}>SECTION TELEMETRY</h3>
                <button
                    className="admin-btn admin-btn-primary"
                    style={{
                        gap: '0.75rem', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                        boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontStyle: 'italic', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}
                    onClick={() => {
                        const activeSections = SECTION_OPTIONS.filter(sec =>
                            ['A', 'B', 'C', 'D'].includes(sec) || students.some(s => s.section === sec) || courses.some(c => c.section === sec)
                        );
                        const prompt = `Can you provide a detailed academic performance and resource allocation report for the following active sections: ${activeSections.join(', ')}? Analyze student distribution (Total: ${students.length}) and subject coverage.`;
                        openAiWithPrompt(prompt);
                    }}
                >
                    <FaRobot /> AI PERFORMANCE REPORT
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {SECTION_OPTIONS.filter(sec =>
                    ['A', 'B', 'C', 'D'].includes(sec) || students.some(s => s.section === sec) || courses.some(c => c.section === sec)
                ).map(sec => {
                    const sCount = students.filter(s => s.section === sec).length;
                    const cCount = courses.filter(c => (c.section === sec || c.section === 'All') && c.code !== 'EMPTY__OVERRIDE').length;
                    return (
                        <motion.div
                            whileHover={{ y: -5 }}
                            key={sec}
                            onClick={() => { setHubView('management'); setSearchTerm(`Sec ${sec}`); }}
                            style={{
                                cursor: 'pointer', textAlign: 'center', background: 'white', padding: '2rem',
                                borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9'
                            }}
                        >
                            <div style={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.1em' }}>SECTION</div>
                            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#1e293b', margin: '0.5rem 0', lineHeight: 1 }}>{sec}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>
                                <span title="Students" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaUserGraduate style={{ color: '#4f46e5' }} /> {sCount}</span>
                                <span title="Subjects" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaBook style={{ color: '#0ea5e9' }} /> {cCount}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );

    const renderManagementTable = () => {
        const filtered = getAllMergedCourses();
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Subject & Branch</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Code</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Year/Sem</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Section</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Content Status</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.branch || 'Common'}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.6rem', background: '#f1f5f9', borderRadius: '6px', color: '#475569' }}>{c.code}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569' }}>Y{c.year} • S{c.semester}</td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9' }}>SEC {c.section || 'All'}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        {materials.some(m => m.subject === c.name) ?
                                            <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><FaCheckCircle /> READY</span> :
                                            <span style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><FaExclamationCircle /> EMPTY</span>
                                        }
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openModal('material', { subject: c.name, year: c.year, semester: c.semester, branch: c.branch })} style={{ cursor: 'pointer', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', padding: '0.4rem', color: '#3b82f6' }} title="Upload"><FaFileUpload /></button>
                                            <button onClick={() => openModal('course', c)} style={{ cursor: 'pointer', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', padding: '0.4rem', color: '#f59e0b' }} title="Edit"><FaEdit /></button>
                                            <button onClick={() => handleDeleteCourse(c)} style={{ cursor: 'pointer', border: '1px solid #fee2e2', background: '#fef2f2', borderRadius: '8px', padding: '0.4rem', color: '#ef4444' }} title="Delete"><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const renderSyllabusGrid = (year) => {
        const allCourses = getMergedCoursesForYear(year);
        const semesters = Array.from({ length: 2 }, (_, i) => (year - 1) * 2 + i + 1);

        return (
            <React.Fragment key={year}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        marginTop: '2rem', marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '1rem'
                    }}
                >
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>YEAR {year}</h3>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #e2e8f0 0%, transparent 100%)' }}></div>
                </motion.div>

                <div className="hub-sem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    {semesters.map(sem => {
                        const semCourses = allCourses.filter(c => String(c.semester) === String(sem));
                        return (
                            <motion.div
                                key={sem}
                                className="admin-card hub-sem-card"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                style={{
                                    border: '1px solid rgba(255,255,255,0.8)',
                                    background: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
                                    borderRadius: '24px',
                                    padding: '2rem'
                                }}
                            >
                                <div className="hub-sem-header" style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <FaListUl />
                                        </div>
                                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>SEMESTER {sem}</span>
                                    </div>
                                    <button
                                        className="admin-btn-outline"
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '10px',
                                            fontSize: '0.75rem', fontWeight: 800,
                                            border: '1px solid #cbd5e1', color: '#475569',
                                            background: 'white',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => openModal('course', { year, semester: sem, branch: selectedBranchFilter, section: selectedSectionFilter })}
                                    >
                                        <FaPlus /> ADD SUBJECT
                                    </button>
                                </div>

                                <div className="hub-subjects-list" style={{ display: 'grid', gap: '1rem' }}>
                                    {semCourses.map(c => {
                                        const hasMaterials = materials.some(m => m.subject === c.name || (m.subject && c.name && m.subject.includes(c.name)));
                                        const isLive = !c.isStatic;

                                        return (
                                            <motion.div
                                                key={c.id || c.code}
                                                variants={itemVariants}
                                                className="admin-list-item"
                                                style={{
                                                    padding: '1rem', borderRadius: '16px',
                                                    background: isLive ? 'white' : '#f8fafc',
                                                    border: isLive ? '1px solid #e0e7ff' : '1px dashed #cbd5e1',
                                                    display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem',
                                                    alignItems: 'center', position: 'relative', overflow: 'hidden'
                                                }}
                                            >
                                                {isLive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#4f46e5' }}></div>}

                                                <div className="hub-subject-info">
                                                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                        <span style={{
                                                            fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px',
                                                            background: isLive ? '#eef2ff' : '#f1f5f9', color: isLive ? '#4f46e5' : '#64748b'
                                                        }}>
                                                            {c.code}
                                                        </span>
                                                        {isLive ? (
                                                            <span title="Live Database Record" style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <FaCloud /> LIVE
                                                            </span>
                                                        ) : (
                                                            <span title="System Default" style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <FaCube /> SYSTEM
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{c.name}</h4>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>
                                                        {c.branch || 'Common'} • Sec {c.section || 'All'} • {hasMaterials ? <span style={{ color: '#10b981' }}>{materials.filter(m => m.subject === c.name).length} Resources</span> : <span style={{ color: '#ef4444' }}>No Content</span>}
                                                    </div>
                                                </div>

                                                <div className="hub-subject-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => openModal('material', { subject: c.name, year: c.year, semester: c.semester, branch: c.branch || selectedBranchFilter })} className="admin-icon-btn" title="Upload Resources" style={{ cursor: 'pointer', border: 'none', borderRadius: '8px', padding: '0.5rem', fontSize: '1rem', color: '#3b82f6', background: '#eff6ff' }}><FaFileUpload /></button>
                                                    <button onClick={() => openModal('course', c)} className="admin-icon-btn" title="Edit Subject" style={{ cursor: 'pointer', border: 'none', borderRadius: '8px', padding: '0.5rem', fontSize: '1rem', color: '#f59e0b', background: '#fffbeb' }}><FaEdit /></button>
                                                    <button onClick={() => handleDeleteCourse(c)} className="admin-icon-btn" title="Delete Subject" style={{ cursor: 'pointer', border: 'none', borderRadius: '8px', padding: '0.5rem', fontSize: '1rem', color: '#ef4444', background: '#fef2f2' }}><FaTrash /></button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    {semCourses.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '16px', color: '#94a3b8' }}>
                                            <p style={{ margin: '0 0 1rem 0', fontWeight: 600, fontSize: '0.9rem' }}>No subjects active.</p>

                                            {/* Check if this is empty because of an override */}
                                            {getOverrideForSemester(year, sem) && (
                                                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                                                    <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                                        <FaExclamationCircle /> SYSTEM DEFAULTS HIDDEN
                                                    </p>
                                                    <button
                                                        onClick={() => handleRestoreDefaults(getOverrideForSemester(year, sem)._id || getOverrideForSemester(year, sem).id)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: 'white',
                                                            border: '1px solid #fecaca',
                                                            color: '#dc2626',
                                                            borderRadius: '8px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        RESTORE DEFAULTS
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </React.Fragment>
        );
    };

    return (
        <div className="academic-hub-v4 animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header className="admin-page-header" style={{ marginBottom: '2rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ACADEMIC <span style={{ color: '#4f46e5', WebkitTextFillColor: '#4f46e5' }}>HUB</span>
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#64748b' }}>Curriculum Synchronization & Resource Management</p>
                </div>

                <div className="hub-nav-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="admin-segmented-control" style={{ background: '#f1f5f9', padding: '0.4rem', borderRadius: '14px', display: 'flex', gap: '0.4rem' }}>
                        {['syllabus', 'sections', 'management'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setHubView(mode)}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    background: hubView === mode ? 'white' : 'transparent',
                                    color: hubView === mode ? '#4f46e5' : '#64748b',
                                    boxShadow: hubView === mode ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {mode === 'syllabus' && <FaColumns />}
                                {mode === 'sections' && <FaChartPie />}
                                {mode === 'management' && <FaListUl />}
                                {mode.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* FILTERS & TOOLS */}
            <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                <select
                    className="admin-select"
                    style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, outline: 'none' }}
                    value={selectedBranchFilter}
                    onChange={e => setSelectedBranchFilter(e.target.value)}
                >
                    <option value="All">All Branches</option>
                    {['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                    className="admin-select"
                    style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, outline: 'none' }}
                    value={selectedSectionFilter}
                    onChange={e => handleSectionChangeInternal(e.target.value)}
                >
                    <option value="All">All Sections</option>
                    {SECTION_OPTIONS.map(s => <option key={s} value={s}>Sec {s}</option>)}
                </select>

                {hubView === 'management' && (
                    <div style={{ flex: 1, position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            style={{
                                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '12px',
                                border: '1px solid #e2e8f0', outline: 'none', fontWeight: 600,
                                background: '#f8fafc'
                            }}
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                <button
                    style={{
                        marginLeft: 'auto',
                        padding: '0.8rem 1.5rem',
                        background: '#4f46e5', color: 'white',
                        border: 'none', borderRadius: '12px',
                        fontWeight: 800,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                    }}
                    onClick={() => openModal('course')}
                >
                    <FaPlus /> ADD SUBJECT
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={hubView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {hubView === 'syllabus' && (
                        <div className="hub-syllabus-wrap">
                            <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                {[1, 2, 3, 4].map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setActiveYearTab(y)}
                                        style={{
                                            padding: '0.8rem 1.5rem',
                                            borderRadius: '12px',
                                            border: activeYearTab === y ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                            background: activeYearTab === y ? '#eef2ff' : 'white',
                                            color: activeYearTab === y ? '#4f46e5' : '#64748b',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        YEAR {y}
                                    </button>
                                ))}
                                <div style={{ flex: 1 }} />
                                <button
                                    onClick={() => setGridMode(gridMode === 'tabs' ? 'all-years' : 'tabs')}
                                    style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                >
                                    <FaThLarge /> {gridMode === 'tabs' ? 'Expand All' : 'Tab View'}
                                </button>
                            </div>

                            {gridMode === 'tabs' ? renderSyllabusGrid(activeYearTab) : [1, 2, 3, 4].map(y => renderSyllabusGrid(y))}
                        </div>
                    )}

                    {hubView === 'sections' && renderSectionsAnalytics()}
                    {hubView === 'management' && renderManagementTable()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AcademicHub;
