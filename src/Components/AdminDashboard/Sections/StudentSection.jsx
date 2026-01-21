import React, { useState } from 'react';
import { FaPlus, FaFileUpload, FaSearch, FaEye, FaEdit, FaTrash, FaUserGraduate } from 'react-icons/fa';

/**
 * SENTINEL STUDENT MANAGEMENT
 * High-fidelity cadet registry with strategic action controls.
 */
const StudentSection = ({ students, openModal, handleDeleteStudent }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(s =>
        s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sid?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>CADET <span>REGISTRY</span></h1>
                    <p>Total operational personnel: {students.length} students</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('student')}>
                        <FaPlus /> DEPLOY NEW CADET
                    </button>
                    <button className="admin-btn admin-btn-outline" onClick={() => openModal('bulk-student')}>
                        <FaFileUpload /> BATCH UPLOAD
                    </button>
                    <div className="admin-search-wrapper" style={{ width: '300px' }}>
                        <FaSearch />
                        <input
                            className="admin-search-input"
                            placeholder="Enter cadet identity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-grid-table">
                        <thead>
                            <tr>
                                <th>CADET IDENTITY</th>
                                <th>SID TOKEN</th>
                                <th>SECTOR (BRANCH)</th>
                                <th>COHORT (YEAR)</th>
                                <th>SECTION</th>
                                <th>STRATEGIC ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map(s => (
                                    <tr key={s.sid} className="sentinel-animate">
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="summary-icon-box" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: '#f8fafc' }}>
                                                    <FaUserGraduate />
                                                </div>
                                                <span style={{ fontWeight: 950 }}>{s.studentName}</span>
                                            </div>
                                        </td>
                                        <td><span className="admin-badge primary">{s.sid}</span></td>
                                        <td>{s.branch}</td>
                                        <td>YEAR {s.year}</td>
                                        <td>SEC {s.section || '---'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="admin-action-btn view" title="Full Profile" onClick={() => openModal('student-view', s)}><FaEye /></button>
                                                <button className="admin-action-btn edit" title="Modify" onClick={() => openModal('student', s)}><FaEdit /></button>
                                                <button className="admin-action-btn delete" title="Deactivate" onClick={() => handleDeleteStudent(s.sid)}><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">
                                        <div className="admin-empty-state" style={{ padding: '4rem' }}>
                                            <FaUserGraduate className="admin-empty-icon" />
                                            <p className="admin-empty-text">No cadets found in current sector buffers.</p>
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

export default StudentSection;
