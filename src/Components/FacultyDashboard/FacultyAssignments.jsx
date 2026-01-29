// src/Components/FacultyDashboard/FacultyAssignments.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaSave, FaTrash, FaClipboardList, FaBullhorn } from 'react-icons/fa';
import { apiGet, apiPost, apiDelete } from '../../utils/apiClient';
import './FacultyDashboard.css';

const FacultyAssignments = ({ facultyId }) => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facultyId]);

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

    const inputClass = "f-input-field"; // Assuming this class exists or will be styled

    return (
        <div className="animate-fade-in">
            <header className="f-view-header">
                <div>
                    <h2>ASSIGNMENT <span>CONTROL</span></h2>
                    <p className="nexus-subtitle">Manage coursework and tasks for your students</p>
                </div>
                <button
                    className="f-node-btn primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                >
                    <FaPlus /> {showForm ? 'Cancel' : 'New Assignment'}
                </button>
            </header>

            {showForm && (
                <div className="f-node-card animate-slide-up" style={{ marginTop: '1.5rem', padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="f-form-group">
                                <label className="f-label">Year</label>
                                <input name="year" className="f-input" placeholder="e.g. 3" value={formData.year} onChange={handleChange} required />
                            </div>
                            <div className="f-form-group">
                                <label className="f-label">Section</label>
                                <input name="section" className="f-input" placeholder="e.g. A" value={formData.section} onChange={handleChange} required />
                            </div>
                            <div className="f-form-group">
                                <label className="f-label">Subject</label>
                                <input name="subject" className="f-input" placeholder="e.g. Neural Networks" value={formData.subject} onChange={handleChange} required />
                            </div>
                            <div className="f-form-group">
                                <label className="f-label">Title</label>
                                <input name="title" className="f-input" placeholder="Assignment Title" value={formData.title} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="f-form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="f-label">Description / Instructions</label>
                            <textarea name="description" className="f-input" placeholder="Detailed instructions..." value={formData.description} onChange={handleChange} rows={4} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="f-node-btn primary">
                                <FaSave /> Publish Assignment
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="f-grid-v2" style={{ marginTop: '2rem' }}>
                {assignments.length === 0 ? (
                    <div className="f-node-card f-center-empty" style={{ gridColumn: '1 / -1' }}>
                        <FaClipboardList style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '1rem' }} />
                        <p className="f-text-muted">No active assignments found.</p>
                    </div>
                ) : (
                    assignments.map(a => (
                        <div key={a.id || a._id} className="f-node-card f-hover-effect">
                            <div className="f-node-head">
                                <h4 className="f-card-title">{a.title}</h4>
                                <div className="f-node-actions">
                                    <button onClick={() => handleDelete(a.id || a._id)} className="f-node-btn delete-icon" title="Delete">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '0 1rem 1rem' }}>
                                <div className="f-schedule-meta-row" style={{ marginBottom: '1rem' }}>
                                    <span className="f-meta-badge">YEAR {a.year}</span>
                                    <span className="f-meta-badge">SEC {a.section}</span>
                                    <span className="f-meta-badge type">{a.subject}</span>
                                </div>
                                <p className="f-text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    {a.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

FacultyAssignments.propTypes = {
    facultyId: PropTypes.string.isRequired
};

export default FacultyAssignments;
