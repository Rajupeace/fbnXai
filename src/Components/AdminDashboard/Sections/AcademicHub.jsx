import React, { useState } from 'react';
import {
    FaPlus, FaBook, FaEdit, FaTrash,
    FaThLarge, FaColumns, FaChartPie, FaListUl,
    FaSearch, FaCheckCircle, FaExclamationCircle, FaUserGraduate, FaFileUpload
} from 'react-icons/fa';
import { getYearData } from '../../StudentDashboard/branchData';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Unified Academic Hub
 * Combines Courses (Syllabus), Sections (Telemetry), and Semester Subjects (Management).
 */
const AcademicHub = ({ courses, students, materials, openModal, handleDeleteCourse, initialSection, onSectionChange }) => {
    // Core Hub State
    const [hubView, setHubView] = useState('syllabus'); // 'syllabus', 'sections', 'management'

    // Syllabus View State
    const [selectedBranchFilter, setSelectedBranchFilter] = useState('CSE');
    const [selectedSectionFilter, setSelectedSectionFilter] = useState(initialSection || 'All');
    const [activeYearTab, setActiveYearTab] = useState(1);
    const [gridMode, setGridMode] = useState('tabs'); // 'tabs' or 'all-years'

    // Sync from parent
    React.useEffect(() => {
        if (initialSection) setSelectedSectionFilter(initialSection);
    }, [initialSection]);

    const handleSectionChangeInternal = (val) => {
        setSelectedSectionFilter(val);
        if (onSectionChange) onSectionChange(val);
    };

    // Management View State
    const [manageYear, setManageYear] = useState('1');
    const [searchTerm, setSearchTerm] = useState('');

    const alphaSections = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i)); // A-P
    const numSections = Array.from({ length: 20 }, (_, i) => String(i + 1)); // 1-20
    const SECTION_OPTIONS = [...alphaSections, ...numSections];

    // Animation Variants
    const hubVariants = {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
    };

    // --- RENDERERS ---

    const renderSyllabusGrid = (year) => {
        const dynamicCourses = courses.filter(c =>
            String(c.year) === String(year) &&
            (selectedBranchFilter === 'All' || c.branch?.toLowerCase() === selectedBranchFilter.toLowerCase() || c.branch === 'All') &&
            (selectedSectionFilter === 'All' || c.section === 'All' || c.section === selectedSectionFilter)
        );

        let allCourses = [...dynamicCourses];
        if (selectedBranchFilter !== 'All') {
            const staticData = getYearData(selectedBranchFilter, String(year));
            staticData?.semesters?.forEach(s => {
                s.subjects.forEach(sub => {
                    if (!dynamicCourses.some(dc => dc.code === sub.code)) {
                        allCourses.push({ ...sub, year, semester: s.sem, branch: selectedBranchFilter, isStatic: true, section: 'All' });
                    }
                });
            });
        }

        const semesters = Array.from({ length: 2 }, (_, i) => (year - 1) * 2 + i + 1);

        return (
            <div key={year} className="hub-year-block">
                {gridMode === 'all-years' && <h3 className="hub-year-title">YEAR {year}</h3>}
                <div className="hub-sem-grid">
                    {semesters.map(sem => {
                        const semCourses = allCourses.filter(c => String(c.semester) === String(sem));
                        return (
                            <div key={sem} className="admin-card hub-sem-card">
                                <div className="hub-sem-header">
                                    <span className="hub-sem-badge">SEMESTER {sem}</span>
                                    <button className="hub-add-btn" onClick={() => openModal('course', { year, semester: sem, branch: selectedBranchFilter, section: selectedSectionFilter })}>
                                        <FaPlus /> ADD
                                    </button>
                                </div>
                                <div className="hub-subjects-list">
                                    {semCourses.map(c => {
                                        return (
                                            <div key={c.id || c.code} className={`hub-subject-item ${c.isStatic ? 'static' : ''}`}>
                                                <div className="hub-subject-info">
                                                    <span className="hub-subject-code">{c.code}</span>
                                                    <h4 className="hub-subject-name">{c.name}</h4>
                                                    <div className="hub-subject-meta">
                                                        <span>{c.branch || 'Common'}</span> • <span>Sec {c.section || 'All'}</span>
                                                    </div>
                                                </div>
                                                <div className="hub-subject-actions">
                                                    <button onClick={() => openModal('material', { subject: c.name, year: c.year, semester: c.semester, branch: c.branch || selectedBranchFilter })} className="hub-icon-btn upload" title="Upload Resources"><FaFileUpload /></button>
                                                    <button onClick={() => openModal('course', c)} className="hub-icon-btn" title="Edit Subject"><FaEdit /></button>
                                                    <button onClick={() => handleDeleteCourse(c._id || c.id)} className="hub-icon-btn delete" title="Delete Subject"><FaTrash /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSectionsAnalytics = () => (
        <div className="hub-sections-analytics animate-slide-up">
            <div className="section-stats-grid">
                {SECTION_OPTIONS.filter(sec =>
                    ['A', 'B', 'C', 'D'].includes(sec) ||
                    students.some(s => s.section === sec) ||
                    courses.some(c => c.section === sec)
                ).map(sec => {
                    const sCount = students.filter(s => s.section === sec).length;
                    const cCount = courses.filter(c => c.section === sec || c.section === 'All').length;
                    return (
                        <div key={sec} className="section-card" onClick={() => { setHubView('management'); setManageYear('1'); setSearchTerm(`Sec ${sec}`); }}>
                            <div className="label">SECTION {sec}</div>
                            <div className="count">{sec}</div>
                            <div className="stats-row">
                                <span title="Students"><FaUserGraduate /> {sCount}</span>
                                <span title="Subjects"><FaBook /> {cCount}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderManagementTable = () => {
        let filtered = courses.filter(c =>
            (selectedBranchFilter === 'All' || c.branch === selectedBranchFilter) &&
            (selectedSectionFilter === 'All' || c.section === selectedSectionFilter)
        );

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.section && `Sec ${c.section}`.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return (
            <div className="hub-management-view animate-slide-up">
                <div className="admin-card">
                    <div className="admin-table-wrap">
                        <table className="admin-grid-table">
                            <thead>
                                <tr>
                                    <th>SUBJECT & BRANCH</th>
                                    <th>CODE</th>
                                    <th>YEAR/SEM</th>
                                    <th>SECTION</th>
                                    <th>CONTENT</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ fontWeight: 950 }}>{c.name}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{c.branch || 'Common'}</div>
                                        </td>
                                        <td><span className="admin-badge primary">{c.code}</span></td>
                                        <td>Y{c.year} • S{c.semester}</td>
                                        <td><span className="admin-badge accent">SEC {c.section || 'All'}</span></td>
                                        <td>
                                            {materials.some(m => m.subject === c.name) ?
                                                <span style={{ color: '#10b981', fontWeight: 800 }}><FaCheckCircle /> READY</span> :
                                                <span style={{ color: '#94a3b8' }}><FaExclamationCircle /> EMPTY</span>
                                            }
                                        </td>
                                        <td>
                                            <div className="hub-table-actions">
                                                <button onClick={() => openModal('material', { subject: c.name, year: c.year, semester: c.semester, branch: c.branch })} className="hub-icon-btn upload" title="Upload Resources"><FaFileUpload /></button>
                                                <button onClick={() => openModal('course', c)} className="hub-icon-btn"><FaEdit /></button>
                                                <button onClick={() => handleDeleteCourse(c._id || c.id)} className="hub-icon-btn delete"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="academic-hub-v2">
            <header className="hub-main-header">
                <div className="hub-title-section">
                    <h1>ACADEMIC <span>STRATEGY HUB</span></h1>
                    <p>Orchestrate curriculum, section telemetry, and deployment logic from a single interface.</p>
                </div>

                <div className="hub-nav-controls">
                    <div className="hub-view-switcher">
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={hubView === 'syllabus' ? 'active' : ''}
                            onClick={() => setHubView('syllabus')}
                        >
                            <FaColumns /> SYLLABUS
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={hubView === 'sections' ? 'active' : ''}
                            onClick={() => setHubView('sections')}
                        >
                            <FaChartPie /> TELEMETRY
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={hubView === 'management' ? 'active' : ''}
                            onClick={() => setHubView('management')}
                        >
                            <FaListUl /> DEPLOYMENT
                        </motion.button>
                    </div>

                    <div className="hub-filter-strip">
                        <select value={selectedBranchFilter} onChange={e => setSelectedBranchFilter(e.target.value)}>
                            <option value="All">All Branches</option>
                            {['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select value={selectedSectionFilter} onChange={e => handleSectionChangeInternal(e.target.value)}>
                            <option value="All">All Sections</option>
                            {SECTION_OPTIONS.map(s => <option key={s} value={s}>Sec {s}</option>)}
                        </select>
                        {hubView === 'management' && (
                            <div className="hub-search">
                                <FaSearch />
                                <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="admin-btn admin-btn-primary hub-global-add"
                            onClick={() => openModal('course')}
                        >
                            <FaPlus /> DEPLOY SUBJECT
                        </motion.button>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={hubView}
                    variants={hubVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="hub-viewport"
                >
                    {hubView === 'syllabus' && (
                        <div className="hub-syllabus-wrap">
                            <div className="hub-sub-nav">
                                {[1, 2, 3, 4].map(y => (
                                    <button key={y} className={activeYearTab === y ? 'active' : ''} onClick={() => setActiveYearTab(y)}>
                                        YEAR {y}
                                    </button>
                                ))}
                                <div className="spacer" />
                                <button className={`mode-toggle ${gridMode === 'all-years' ? 'active' : ''}`} onClick={() => setGridMode(gridMode === 'tabs' ? 'all-years' : 'tabs')}>
                                    <FaThLarge /> {gridMode === 'tabs' ? 'SHOW ALL YEARS' : 'SHOW TABS'}
                                </button>
                            </div>
                            {gridMode === 'tabs' ? renderSyllabusGrid(activeYearTab) : [1, 2, 3, 4].map(y => renderSyllabusGrid(y))}
                        </div>
                    )}

                    {hubView === 'sections' && renderSectionsAnalytics()}
                    {hubView === 'management' && renderManagementTable()}
                </motion.div>
            </AnimatePresence>

            <style jsx>{`
                .academic-hub-v2 {
                    width: 100%;
                }
                .hub-main-header {
                    margin-bottom: 2.5rem;
                }
                .hub-title-section h1 {
                    font-size: 2.4rem;
                    font-weight: 950;
                    margin: 0;
                    letter-spacing: -1px;
                }
                .hub-title-section h1 span {
                    color: var(--admin-primary);
                    opacity: 0.8;
                }
                .hub-title-section p {
                    color: var(--admin-text-muted);
                    font-weight: 850;
                    margin: 0.5rem 0 0;
                }
                .hub-nav-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    gap: 1.5rem;
                    background: white;
                    padding: 1rem;
                    border-radius: 20px;
                    border: 1px solid var(--admin-border);
                }
                .hub-view-switcher {
                    display: flex;
                    background: #f1f5f9;
                    padding: 0.4rem;
                    border-radius: 14px;
                    gap: 0.4rem;
                }
                .hub-view-switcher button {
                    border: none;
                    background: transparent;
                    padding: 0.6rem 1.2rem;
                    border-radius: 10px;
                    font-weight: 900;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }
                .hub-view-switcher button.active {
                    background: white;
                    color: var(--admin-primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .hub-filter-strip {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }
                .hub-filter-strip select {
                    padding: 0.6rem 1rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    font-weight: 850;
                    font-size: 0.8rem;
                    color: var(--admin-secondary);
                    outline: none;
                }
                .hub-search {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .hub-search input {
                    padding: 0.6rem 1rem 0.6rem 2.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    font-weight: 850;
                    width: 200px;
                }
                .hub-search svg {
                    position: absolute;
                    left: 1rem;
                    color: #94a3b8;
                }

                .hub-sub-nav {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 0.5rem;
                }
                .hub-sub-nav button {
                    background: transparent;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    font-weight: 950;
                    color: #94a3b8;
                    cursor: pointer;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s;
                }
                .hub-sub-nav button.active {
                    color: var(--admin-secondary);
                    border-bottom-color: var(--admin-primary);
                }
                .hub-sub-nav .mode-toggle {
                    font-size: 0.7rem;
                    background: #f8fafc;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                    margin-left: auto;
                }

                .hub-year-title {
                    margin: 4rem 0 2rem;
                    font-size: 1.8rem;
                    font-weight: 950;
                    color: var(--admin-secondary);
                    border-left: 6px solid var(--admin-primary);
                    padding-left: 1rem;
                }
                .hub-sem-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }
                .hub-sem-card {
                    padding: 1.5rem;
                    background: white;
                }
                .hub-sem-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .hub-sem-badge {
                    background: var(--admin-primary);
                    color: white;
                    padding: 0.4rem 1rem;
                    border-radius: 8px;
                    font-weight: 950;
                    font-size: 0.8rem;
                }
                .hub-add-btn {
                    background: transparent;
                    border: 1px dashed var(--admin-primary);
                    color: var(--admin-primary);
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    font-weight: 850;
                    cursor: pointer;
                }

                .hub-subjects-list {
                    display: grid;
                    gap: 1rem;
                }
                .hub-subject-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-radius: 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                }
                .hub-subject-item.static {
                    background: #fff;
                    border-style: dashed;
                    opacity: 0.8;
                }
                .hub-subject-code {
                    font-size: 0.65rem;
                    font-weight: 950;
                    color: var(--admin-primary);
                    background: rgba(99,102,241,0.1);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                }
                .hub-subject-name {
                    margin: 0.3rem 0;
                    font-size: 0.95rem;
                    font-weight: 900;
                    color: var(--admin-secondary);
                }
                .hub-subject-meta {
                    font-size: 0.7rem;
                    font-weight: 850;
                    color: #94a3b8;
                }
                .hub-subject-actions {
                    display: flex;
                    gap: 0.4rem;
                }
                .hub-icon-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .hub-icon-btn:hover {
                    color: var(--admin-primary);
                    border-color: var(--admin-primary);
                }
                .hub-icon-btn.delete:hover {
                    color: #ef4444;
                    border-color: #ef4444;
                }

                .section-card {
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .section-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
                    border-color: var(--admin-primary);
                }
                .stats-row {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 1rem;
                    color: var(--admin-primary);
                    font-size: 0.75rem;
                    font-weight: 950;
                }

                @media (max-width: 768px) {
                    .hub-nav-controls {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .hub-sem-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AcademicHub;
