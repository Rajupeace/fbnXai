import React, { useState } from 'react';
import { FaPlus, FaBook, FaBookOpen, FaEdit, FaTrash, FaLayerGroup } from 'react-icons/fa';
import { getYearData } from '../../StudentDashboard/branchData';

/**
 * SENTINEL CURRICULUM COMMAND
 * Oversight and orchestration of academic subjects and structural modules.
 */
const CourseSection = ({ courses, materials, openModal, handleDeleteCourse }) => {
    const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>CURRICULUM <span>COMMAND</span></h1>
                    <p>Total operational modules: {courses.length} subjects active</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('course')}>
                        <FaPlus /> INITIALIZE SUBJECT
                    </button>
                    <div className="admin-search-wrapper" style={{ width: '240px' }}>
                        <select
                            className="admin-search-input"
                            value={selectedBranchFilter}
                            onChange={(e) => setSelectedBranchFilter(e.target.value)}
                            style={{ paddingLeft: '1.25rem' }}
                        >
                            <option value="All">All Branches</option>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="IT">IT</option>
                            <option value="AIML">AIML</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="subjects-view">
                {[1, 2, 3, 4].map(year => {
                    const dynamicCourses = courses.filter(c =>
                        String(c.year) === String(year) &&
                        (
                            selectedBranchFilter === 'All' ||
                            (c.branch && c.branch.toLowerCase() === selectedBranchFilter.toLowerCase()) ||
                            (c.branch && c.branch.toLowerCase() === 'all')
                        )
                    );

                    let allCourses = [...dynamicCourses];

                    if (selectedBranchFilter !== 'All') {
                        const staticData = getYearData(selectedBranchFilter, String(year));
                        if (staticData && staticData.semesters) {
                            staticData.semesters.forEach(s => {
                                s.subjects.forEach(sub => {
                                    const isDynamic = dynamicCourses.some(dc => dc.code === sub.code);
                                    if (!isDynamic) {
                                        allCourses.push({
                                            ...sub,
                                            year: year,
                                            semester: s.sem,
                                            branch: selectedBranchFilter,
                                            isStatic: true
                                        });
                                    }
                                });
                            });
                        }
                    }

                    if (allCourses.length === 0) return null;

                    const semesters = [...new Set(allCourses.map(c => c.semester))].sort();

                    return (
                        <div key={year} className="admin-card sentinel-animate" style={{ marginBottom: '3.5rem', padding: '2rem' }}>
                            <div style={{ borderBottom: '1px solid var(--admin-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 950, color: 'var(--admin-secondary)' }}>ACADEMIC YEAR {year}</h2>
                                <span className="admin-badge primary">PHASE {year}</span>
                            </div>

                            {semesters.map(sem => (
                                <div key={sem} style={{ marginBottom: '2.5rem' }}>
                                    <h4 style={{
                                        color: 'var(--admin-text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 950,
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <div className="admin-telemetry-dot"></div>
                                        SEMESTER {sem}
                                    </h4>

                                    <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                                        {allCourses.filter(c => String(c.semester) === String(sem)).map(c => {
                                            const hasContent = materials.some(m => m.subject === c.name || m.subject === c.code);
                                            return (
                                                <div key={c.id || c.code} className="admin-summary-card" style={{
                                                    padding: '1.75rem',
                                                    borderStyle: c.isStatic ? 'dashed' : 'solid',
                                                    background: c.isStatic ? '#fdfdfe' : 'white'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.7rem', fontWeight: 950, letterSpacing: '0.05em', margin: '0 0 0.4rem 0' }}>{c.code}</p>
                                                            <h3 style={{ fontSize: '1.15rem', fontWeight: 950, color: 'var(--admin-secondary)', margin: 0, lineHeight: 1.2 }}>{c.name}</h3>
                                                        </div>
                                                        <div className="summary-icon-box" style={{ width: '36px', height: '36px', background: '#f8fafc' }}>
                                                            {c.isStatic ? <FaLayerGroup style={{ fontSize: '0.9rem', color: '#94a3b8' }} /> : <FaBook style={{ fontSize: '0.9rem', color: 'var(--admin-primary)' }} />}
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                        <span className="admin-badge primary" style={{ fontSize: '0.6rem' }}>{c.branch || 'Common'}</span>
                                                        {c.isStatic && <span className="admin-badge warning" style={{ fontSize: '0.6rem' }}>CORE</span>}
                                                    </div>

                                                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                            {!c.isStatic && (
                                                                <>
                                                                    <button className="f-exam-card" style={{ padding: '0.5rem', background: 'white' }} onClick={() => openModal('course', c)} title="Recalibrate Details"><FaEdit /></button>
                                                                    <button className="f-cancel-btn" style={{ padding: '0.5rem' }} onClick={() => handleDeleteCourse(c.id)} title="Purge Subject"><FaTrash /></button>
                                                                </>
                                                            )}
                                                        </div>

                                                        <button
                                                            className={`admin-btn ${hasContent ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                                                            onClick={() => openModal('syllabus-view', c)}
                                                            style={{
                                                                padding: '0.6rem 1.2rem',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            {hasContent ? <><FaBookOpen /> ARCHIVE</> : <><FaPlus /> ASSETS</>}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
                {courses.length === 0 && selectedBranchFilter === 'All' &&
                    <div className="admin-empty-state">
                        <FaBook className="admin-empty-icon" />
                        <h2 className="admin-empty-title">NO OPERATIONAL SEQUENCES DETECTED</h2>
                        <p className="admin-empty-text">Select a <strong>Branch</strong> to initialize default curriculum or deploy a custom subject.</p>
                    </div>
                }
            </div>
        </div>
    );
};

export default CourseSection;
