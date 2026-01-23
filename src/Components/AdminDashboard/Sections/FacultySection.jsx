import React, { useState, useEffect } from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash, FaChalkboardTeacher, FaUsers, FaBook } from 'react-icons/fa';

/**
 * SENTINEL INSTRUCTOR MANAGEMENT
 * Strategic oversight of instructional personnel and curriculum delivery.
 */
const FacultySection = ({ faculty, students, openModal, handleDeleteFaculty }) => {
    useEffect(() => {
        console.log('🎓 FacultySection Rendered - Faculty Data:', faculty);
        faculty.forEach(f => {
            console.log(`  👤 ${f.name} (${f.facultyId}):`, {
                assignments: f.assignments,
                department: f.department
            });
        });
    }, [faculty]);

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>INSTRUCTOR <span>GARRISON</span></h1>
                    <p>Commanding staff: {faculty.length} educators active</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('faculty')}>
                        <FaPlus /> ENLIST NEW INSTRUCTOR
                    </button>
                </div>
            </header>

            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-grid-table">
                        <thead>
                            <tr>
                                <th>INSTRUCTOR IDENTITY</th>
                                <th>STAFF TOKEN</th>
                                <th>DEPARTMENT</th>
                                <th>ASSIGNED CURRICULUM</th>
                                <th>PERSONNEL REACH</th>
                                <th>CLASS LOAD</th>
                                <th>STRATEGIC ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faculty.length > 0 ? (
                                faculty.map(f => {
                                    // Ensure assignments is an array
                                    const assignments = Array.isArray(f.assignments) ? f.assignments : [];
                                    
                                    // Calculate accurate student count based on assignments
                                    const teachingCount = students.filter(s =>
                                        assignments.some(a =>
                                            String(a.year) === String(s.year) &&
                                            (String(a.section) === String(s.section) || a.section === 'All')
                                        )
                                    ).length;

                                    // Get unique subjects taught
                                    const uniqueSubjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))];

                                    return (
                                        <tr key={f.facultyId} className="sentinel-animate">
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div className="summary-icon-box" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: '#f0fdf4', color: '#15803d' }}>
                                                        <FaChalkboardTeacher />
                                                    </div>
                                                    <span style={{ fontWeight: 950 }}>{f.name}</span>
                                                </div>
                                            </td>
                                            <td><span className="admin-badge primary">{f.facultyId}</span></td>
                                            <td>{f.department || 'GENERAL'}</td>
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                    {uniqueSubjects.length > 0 ? (
                                                        uniqueSubjects.map((subject, idx) => (
                                                            <span key={idx} className="admin-badge primary" style={{ fontSize: '0.65rem', textTransform: 'none' }}>
                                                                {subject}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>Unassigned</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaUsers style={{ color: '#94a3b8' }} />
                                                    <span style={{ fontWeight: 850 }}>{teachingCount}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaBook style={{ color: '#94a3b8' }} />
                                                    <span style={{ fontWeight: 850 }}>{assignments.length} Classes</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="f-exam-card" style={{ padding: '0.5rem', background: 'white' }} title="Full Profile" onClick={() => openModal('faculty-view', f)}><FaEye /></button>
                                                    <button className="f-exam-card" style={{ padding: '0.5rem', background: 'white', color: '#1e40af' }} title="Modify" onClick={() => openModal('faculty', f)}><FaEdit /></button>
                                                    <button className="f-cancel-btn" style={{ padding: '0.5rem' }} title="Deactivate" onClick={() => handleDeleteFaculty(f.facultyId)}><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7">
                                        <div className="admin-empty-state" style={{ padding: '4rem' }}>
                                            <FaChalkboardTeacher className="admin-empty-icon" />
                                            <p className="admin-empty-text">No instructors detected in sector Garrison.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultySection;
