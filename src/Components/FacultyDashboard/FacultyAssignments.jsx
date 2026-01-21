// src/Components/FacultyDashboard/FacultyAssignments.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import { apiGet, apiPost, apiDelete } from '../../utils/apiClient';

const FacultyAssignments = ({ facultyId, facultyToken }) => {
    const [assignments, setAssignments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        year: '',
        section: '',
        subject: '',
        title: '',
        description: ''
    });

    const fetchAssignments = async () => {
        try {
            const data = await apiGet(`/api/teaching-assignments/faculty/${facultyId}`);
            setAssignments(data || []);
        } catch (e) {
            console.error('Failed to load assignments', e);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const payload = { ...formData, facultyId };
        try {
            await apiPost('/api/teaching-assignments', payload);
            setShowForm(false);
            setFormData({ year: '', section: '', subject: '', title: '', description: '' });
            fetchAssignments();
        } catch (err) {
            console.error('Error creating assignment', err);
        }
    };

    const handleDelete = async assignmentId => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await apiDelete(`/api/teaching-assignments/${assignmentId}`);
            fetchAssignments();
        } catch (e) {
            console.error('Delete failed', e);
        }
    };

    return (
        <div className="assignments-section animate-fade-in" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '1rem' }}>Teaching Assignments</h3>
            <button
                className="btn-primary"
                onClick={() => setShowForm(!showForm)}
                style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <FaPlus /> {showForm ? 'Cancel' : 'Add Assignment'}
            </button>

            {showForm && (
                <form className="assignment-form" onSubmit={handleSubmit} style={{ marginBottom: '2rem', background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <input name="year" placeholder="Year (e.g., 3)" value={formData.year} onChange={handleChange} required style={inputStyle} />
                        <input name="section" placeholder="Section (e.g., 11)" value={formData.section} onChange={handleChange} required style={inputStyle} />
                        <input name="subject" placeholder="Subject (e.g., cn)" value={formData.subject} onChange={handleChange} required style={inputStyle} />
                        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={3} style={{ ...inputStyle, marginTop: '1rem' }} />
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaSave /> Save Assignment
                    </button>
                </form>
            )}

            <div className="assignments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {assignments.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No assignments yet.</p>
                ) : (
                    assignments.map(a => (
                        <div key={a.id || a._id} className="assignment-card" style={{ background: '#fff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'relative' }}>
                            <h4 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>{a.title || a.subject}</h4>
                            <p style={{ margin: '0 0 0.5rem', color: '#64748b' }}><strong>Year:</strong> {a.year} • <strong>Section:</strong> {a.section}</p>
                            {a.description && <p style={{ margin: 0, color: '#475569' }}>{a.description}</p>}
                            <button onClick={() => handleDelete(a.id || a._id)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete">
                                <FaTrash />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.9rem'
};

FacultyAssignments.propTypes = {
    facultyId: PropTypes.string.isRequired,
    facultyToken: PropTypes.string.isRequired
};

export default FacultyAssignments;
