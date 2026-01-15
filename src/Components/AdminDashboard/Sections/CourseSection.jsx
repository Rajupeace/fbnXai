import React, { useState } from 'react';
import { FaPlus, FaBook, FaBookOpen, FaEdit, FaTrash } from 'react-icons/fa';
import { getYearData } from '../../StudentDashboard/branchData';

const CourseSection = ({ courses, materials, openModal, handleDeleteCourse }) => {
    const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');

    return (
        <div className="section-container">
            <div className="actions-bar">
                <button className="btn-primary" onClick={() => openModal('course')}>
                    <FaPlus /> Add Subject
                </button>
                <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label>Filter Branch:</label>
                    <select
                        value={selectedBranchFilter}
                        onChange={(e) => setSelectedBranchFilter(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
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

            <div className="subjects-view">
                {[1, 2, 3, 4].map(year => {
                    // 1. Get Dynamic Courses (Admin Added)
                    const dynamicCourses = courses.filter(c =>
                        String(c.year) === String(year) &&
                        (
                            selectedBranchFilter === 'All' ||
                            (c.branch && c.branch.toLowerCase() === selectedBranchFilter.toLowerCase()) ||
                            (c.branch && c.branch.toLowerCase() === 'all')
                        )
                    );

                    // 2. Get Static Courses (Default Curriculum) - Only if a branch is selected
                    let allCourses = [...dynamicCourses];

                    /* 
                       Fix: Ensure static courses are merged correctly without duplicates 
                       and respected properly when viewing specific branches.
                    */
                    if (selectedBranchFilter !== 'All') {
                        const staticData = getYearData(selectedBranchFilter, String(year));
                        if (staticData && staticData.semesters) {
                            staticData.semesters.forEach(s => {
                                s.subjects.forEach(sub => {
                                    // Check if admin has already added this subject (dynamic override)
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
                    } else {
                        // When 'All' is selected, show only Dynamic courses to keep view clean.
                        // This is intended behavior for the Admin Overview.
                    }

                    if (allCourses.length === 0) return null;

                    // Group by semester
                    const semesters = [...new Set(allCourses.map(c => c.semester))].sort();

                    return (
                        <div key={year} className="year-group" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', color: '#334155' }}>Year {year}</h2>
                            {semesters.map(sem => (
                                <div key={sem} className="semester-group" style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                                    <h4 style={{ color: '#64748b' }}>Semester {sem}</h4>
                                    <div className="cards-grid">
                                        {allCourses.filter(c => String(c.semester) === String(sem)).map(c => (
                                            <div key={c.id || c.code} className="info-card course-card" style={c.isStatic ? { background: '#f8fafc', border: '1px dashed #cbd5e1' } : {}}>
                                                <h3>{c.name}</h3>
                                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{c.code}</p>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <span className="badge">{c.branch || 'Common'}</span>
                                                        {c.isStatic && <span className="badge" style={{ background: '#94a3b8' }}>Default</span>}
                                                    </div>
                                                    {(() => {
                                                        const hasContent = materials.some(m => m.subject === c.name || m.subject === c.code);
                                                        return (
                                                            <div
                                                                onClick={() => openModal('syllabus-view', c)}
                                                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                                                                title={hasContent ? "Content Available - Click to View" : "No Content - Click to Add"}
                                                            >
                                                                {hasContent ?
                                                                    <FaBookOpen style={{ color: '#10b981', fontSize: '1.3rem' }} /> :
                                                                    <FaBook style={{ color: '#3b82f6', fontSize: '1.3rem' }} />
                                                                }
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                <div className="card-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn-icon" onClick={() => openModal('course', c)} title="Edit"><FaEdit /></button>
                                                    <button className="btn-icon danger" onClick={() => handleDeleteCourse(c.id)} title="Delete"><FaTrash /></button>
                                                    {(() => {
                                                        const hasContent = materials.some(m => m.subject === c.name || m.subject === c.code);
                                                        return (
                                                            <button
                                                                className="btn-icon"
                                                                onClick={() => openModal('syllabus-view', c)}
                                                                title={hasContent ? "View Content" : "No Content - Click to Add"}
                                                                style={{ color: hasContent ? '#10b981' : '#cbd5e1' }}
                                                            >
                                                                {hasContent ? <FaBookOpen /> : <FaBook />}
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
                {courses.length === 0 && selectedBranchFilter === 'All' && <p className="empty-state">No subjects found. Add a subject or select a branch filter.</p>}
            </div>
        </div>
    );
};

export default CourseSection;
