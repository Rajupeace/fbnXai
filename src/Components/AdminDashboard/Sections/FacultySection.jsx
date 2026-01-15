import React, { useState } from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const FacultySection = ({ faculty, students, openModal, handleDeleteFaculty }) => {
    return (
        <div className="section-container">
            <div className="actions-bar">
                <button className="btn-primary" onClick={() => openModal('faculty')}>
                    <FaPlus /> Add Faculty
                </button>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Department</th>
                        <th>Subjects Teaching</th>
                        <th>Students Taught</th>
                        <th>Sections</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {faculty.length > 0 ? (
                        faculty.map(f => {
                            // Calculate accurate student count based on assignments
                            const teachingCount = students.filter(s =>
                                (f.assignments || []).some(a =>
                                    String(a.year) === String(s.year) &&
                                    (String(a.section) === String(s.section) || a.section === 'All')
                                )
                            ).length;

                            // Get unique subjects taught
                            const uniqueSubjects = [...new Set((f.assignments || []).map(a => a.subject))];

                            return (
                                <tr key={f.facultyId}>
                                    <td>{f.name}</td>
                                    <td>{f.facultyId}</td>
                                    <td>{f.department || 'CSE'}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            {uniqueSubjects.length > 0 ? (
                                                uniqueSubjects.map((subject, idx) => (
                                                    <span key={idx} className="badge" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                                                        {subject}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No subjects assigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{teachingCount}</td>
                                    <td>
                                        {/* Collapsed view of sections */}
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            {(f.assignments || []).length} Classes
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-icon" title="View Details" onClick={() => openModal('faculty-view', f)}><FaEye /></button>
                                        <button className="btn-icon" title="Edit" onClick={() => openModal('faculty', f)}><FaEdit /></button>
                                        <button className="btn-icon danger" title="Delete" onClick={() => handleDeleteFaculty(f.facultyId)}><FaTrash /></button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>No faculty members found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FacultySection;
