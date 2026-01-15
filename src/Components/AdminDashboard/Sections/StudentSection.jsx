import React, { useState } from 'react';
import { FaPlus, FaFileUpload, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const StudentSection = ({ students, openModal, handleDeleteStudent }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(s =>
        s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sid?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="section-container">
            <div className="actions-bar">
                <button className="btn-primary" onClick={() => openModal('student')}>
                    <FaPlus /> Add Student
                </button>
                <button className="btn-secondary" onClick={() => openModal('bulk-student')} style={{ marginLeft: '0.5rem' }}>
                    <FaFileUpload /> Bulk Upload
                </button>
                <div className="search-box">
                    <FaSearch />
                    <input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Branch</th>
                        <th>Year</th>
                        <th>Section</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(s => (
                            <tr key={s.sid}>
                                <td>{s.studentName}</td>
                                <td>{s.sid}</td>
                                <td>{s.branch}</td>
                                <td>{s.year}</td>
                                <td>{s.section || 'N/A'}</td>
                                <td>
                                    <button className="btn-icon" title="View Details" onClick={() => openModal('student-view', s)}><FaEye /></button>
                                    <button className="btn-icon" title="Edit" onClick={() => openModal('student', s)}><FaEdit /></button>
                                    <button className="btn-icon danger" title="Delete" onClick={() => handleDeleteStudent(s.sid)}><FaTrash /></button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>No students found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StudentSection;
