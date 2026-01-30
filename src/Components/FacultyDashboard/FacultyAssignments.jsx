// src/Components/FacultyDashboard/FacultyAssignments.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaSave, FaTrash, FaClipboardList, FaCalendarAlt, FaBook, FaUsers } from 'react-icons/fa';
import { apiGet, apiPost, apiDelete } from '../../utils/apiClient';
import './FacultyAssignments.css';

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

    return (
        <div className="animate-fade-in">
            <header className="f-view-header">
                <div>
                    <h2>ASSIGNMENT <span>CONTROL</span></h2>
                    <p className="nexus-subtitle">Create and manage coursework for your students</p>
                </div>
                <button
                    className="f-node-btn primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    <FaPlus /> {showForm ? 'Close Form' : 'New Assignment'}
                </button>
            </header>

            {showForm && (
                <div className="assignment-form-card">
                    <div className="assignment-form-header">
                        <FaClipboardList />
                        <h3>Create New Assignment</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="assignment-form-grid">
                            <div className="f-form-group">
                                <label className="f-label">
                                    <FaCalendarAlt /> Year
                                </label>
                                <input
                                    name="year"
                                    className="f-input"
                                    placeholder="e.g. 3"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="f-form-group">
                                <label className="f-label">
                                    <FaUsers /> Section
                                </label>
                                <input
                                    name="section"
                                    className="f-input"
                                    placeholder="e.g. A"
                                    value={formData.section}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="f-form-group">
                                <label className="f-label">
                                    <FaBook /> Subject
                                </label>
                                <input
                                    name="subject"
                                    className="f-input"
                                    placeholder="e.g. Neural Networks"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="f-form-group">
                                <label className="f-label">
                                    <FaClipboardList /> Title
                                </label>
                                <input
                                    name="title"
                                    className="f-input"
                                    placeholder="Assignment Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="f-form-group">
                            <label className="f-label">Description / Instructions</label>
                            <textarea
                                name="description"
                                className="f-textarea"
                                placeholder="Detailed instructions and requirements..."
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>
                        <div className="assignment-form-actions">
                            <button
                                type="button"
                                className="f-node-btn secondary"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormData({ year: '', section: '', subject: '', title: '', description: '' });
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="f-node-btn success">
                                <FaSave /> Publish Assignment
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {assignments.length === 0 ? (
                <div className="assignments-empty">
                    <FaClipboardList />
                    <h3>No Assignments Yet</h3>
                    <p>Create your first assignment to get started</p>
                </div>
            ) : (
                <div className="assignments-grid">
                    {assignments.map(a => (
                        <div key={a.id || a._id} className="assignment-card">
                            <div className="assignment-card-header">
                                <div>
                                    <h4 className="assignment-title">{a.title}</h4>
                                    <div className="assignment-meta">
                                        <span className="assignment-badge year">
                                            <FaCalendarAlt /> Year {a.year}
                                        </span>
                                        <span className="assignment-badge section">
                                            <FaUsers /> Sec {a.section}
                                        </span>
                                        <span className="assignment-badge subject">
                                            <FaBook /> {a.subject}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="assignment-description">
                                {a.description || 'No description provided.'}
                            </p>
                            <div className="assignment-actions">
                                <button
                                    onClick={() => handleDelete(a.id || a._id)}
                                    className="assignment-delete-btn"
                                    title="Delete Assignment"
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

FacultyAssignments.propTypes = {
    facultyId: PropTypes.string.isRequired
};

export default FacultyAssignments;
