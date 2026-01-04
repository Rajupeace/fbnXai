import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaClock, FaChalkboardTeacher, FaBook, FaMapMarkerAlt, FaUpload, FaSave, FaTimes } from 'react-icons/fa';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';

const AdminScheduleManager = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [filters, setFilters] = useState({
        year: '',
        section: '',
        branch: '',
        day: ''
    });

    const [formData, setFormData] = useState({
        day: 'Monday',
        time: '',
        subject: '',
        faculty: '',
        room: '',
        type: 'Theory',
        year: 1,
        section: 'A',
        branch: 'CSE',
        semester: 1,
        batch: '',
        courseCode: '',
        credits: 3
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const types = ['Theory', 'Lab', 'Tutorial', 'Seminar', 'Other'];
    const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML', 'IT'];
    const sections = ['A', 'B', 'C', 'D', 'E'];

    useEffect(() => {
        fetchSchedules();
    }, [filters]);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.year) queryParams.append('year', filters.year);
            if (filters.section) queryParams.append('section', filters.section);
            if (filters.branch) queryParams.append('branch', filters.branch);
            if (filters.day) queryParams.append('day', filters.day);

            const response = await apiGet(`/api/schedule?${queryParams.toString()}`);
            setSchedules(response || []);
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingSchedule) {
                await apiPut(`/api/schedule/${editingSchedule._id}`, formData);
            } else {
                await apiPost('/api/schedule', formData);
            }
            setShowModal(false);
            setEditingSchedule(null);
            resetForm();
            fetchSchedules();
        } catch (error) {
            console.error('Failed to save schedule:', error);
            alert('Failed to save schedule. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this schedule entry?')) {
            try {
                await apiDelete(`/api/schedule/${id}`);
                fetchSchedules();
            } catch (error) {
                console.error('Failed to delete schedule:', error);
                alert('Failed to delete schedule.');
            }
        }
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            day: schedule.day,
            time: schedule.time,
            subject: schedule.subject,
            faculty: schedule.faculty,
            room: schedule.room,
            type: schedule.type,
            year: schedule.year,
            section: schedule.section,
            branch: schedule.branch,
            semester: schedule.semester || 1,
            batch: schedule.batch || '',
            courseCode: schedule.courseCode || '',
            credits: schedule.credits || 3
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            day: 'Monday',
            time: '',
            subject: '',
            faculty: '',
            room: '',
            type: 'Theory',
            year: 1,
            section: 'A',
            branch: 'CSE',
            semester: 1,
            batch: '',
            courseCode: '',
            credits: 3
        });
    };

    const groupedSchedules = schedules.reduce((acc, schedule) => {
        const key = `${schedule.year}-${schedule.section}-${schedule.branch}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(schedule);
        return acc;
    }, {});

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2rem', color: '#1e293b' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.8rem',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            <FaCalendarAlt />
                        </div>
                        📅 Class Schedule Management
                    </h1>
                    <button
                        onClick={() => { resetForm(); setEditingSchedule(null); setShowModal(true); }}
                        style={{
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            fontSize: '1rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <FaPlus /> Add New Schedule
                    </button>
                </div>

                {/* Filters */}
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Year</label>
                        <select
                            value={filters.year}
                            onChange={e => setFilters({ ...filters, year: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem'
                            }}
                        >
                            <option value="">All Years</option>
                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Section</label>
                        <select
                            value={filters.section}
                            onChange={e => setFilters({ ...filters, section: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem'
                            }}
                        >
                            <option value="">All Sections</option>
                            {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Branch</label>
                        <select
                            value={filters.branch}
                            onChange={e => setFilters({ ...filters, branch: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem'
                            }}
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Day</label>
                        <select
                            value={filters.day}
                            onChange={e => setFilters({ ...filters, day: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem'
                            }}
                        >
                            <option value="">All Days</option>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Schedule Display */}
            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center', fontSize: '1.2rem', color: '#64748b' }}>
                    Loading schedules...
                </div>
            ) : Object.keys(groupedSchedules).length > 0 ? (
                Object.entries(groupedSchedules).map(([key, classSchedules]) => {
                    const [year, section, branch] = key.split('-');
                    return (
                        <div key={key} style={{ marginBottom: '3rem' }}>
                            <h2 style={{
                                fontSize: '1.4rem',
                                fontWeight: 800,
                                color: '#1e293b',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    padding: '0.6rem 1.2rem',
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                    color: 'white',
                                    borderRadius: '10px',
                                    fontSize: '0.9rem'
                                }}>
                                    Year {year} • Section {section} • {branch}
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                    {classSchedules.length} Classes
                                </span>
                            </h2>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {classSchedules.map((schedule, idx) => (
                                    <div
                                        key={schedule._id || idx}
                                        style={{
                                            background: 'white',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                            display: 'grid',
                                            gridTemplateColumns: '100px 1fr auto',
                                            gap: '1.5rem',
                                            alignItems: 'center',
                                            border: '1px solid #e2e8f0',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        {/* Day & Time */}
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                width: '70px',
                                                height: '70px',
                                                borderRadius: '14px',
                                                background: schedule.type === 'Lab' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1.5rem',
                                                margin: '0 auto 0.5rem',
                                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                            }}>
                                                <FaClock />
                                            </div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{schedule.day}</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginTop: '0.2rem' }}>{schedule.time}</div>
                                        </div>

                                        {/* Details */}
                                        <div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <FaBook style={{ color: '#6366f1' }} />
                                                {schedule.subject}
                                                {schedule.courseCode && (
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        background: 'rgba(99, 102, 241, 0.1)',
                                                        color: '#6366f1',
                                                        padding: '0.3rem 0.8rem',
                                                        borderRadius: '6px',
                                                        fontWeight: 700
                                                    }}>
                                                        {schedule.courseCode}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                                    <FaChalkboardTeacher style={{ color: '#a855f7' }} />
                                                    {schedule.faculty}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                                    <FaMapMarkerAlt style={{ color: '#10b981' }} />
                                                    {schedule.room}
                                                </div>
                                                <div style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '6px',
                                                    background: schedule.type === 'Lab' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                    color: schedule.type === 'Lab' ? '#059669' : '#6366f1',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800
                                                }}>
                                                    {schedule.type}
                                                </div>
                                                {schedule.batch && (
                                                    <div style={{
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '6px',
                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                        color: '#d97706',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800
                                                    }}>
                                                        {schedule.batch}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                                            <button
                                                onClick={() => handleEdit(schedule)}
                                                style={{
                                                    padding: '0.8rem',
                                                    background: '#f1f5f9',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    color: '#3b82f6',
                                                    fontSize: '1.1rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule._id)}
                                                style={{
                                                    padding: '0.8rem',
                                                    background: '#fef2f2',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    color: '#ef4444',
                                                    fontSize: '1.1rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div style={{
                    padding: '4rem',
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📅</div>
                    <div style={{ color: '#94a3b8', fontSize: '1.2rem' }}>No schedules found</div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                        Create a new schedule to get started
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
                                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingSchedule(null); }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#94a3b8'
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Subject Name *</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g., Software Engineering"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Day *</label>
                                <select
                                    value={formData.day}
                                    onChange={e => setFormData({ ...formData, day: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Time *</label>
                                <input
                                    type="text"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    placeholder="e.g., 09:00 - 10:00"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Faculty *</label>
                                <input
                                    type="text"
                                    value={formData.faculty}
                                    onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                                    placeholder="e.g., Dr. Sarah Smith"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Room *</label>
                                <input
                                    type="text"
                                    value={formData.room}
                                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                                    placeholder="e.g., Room 301"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Type *</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Year *</label>
                                <select
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Section *</label>
                                <select
                                    value={formData.section}
                                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Branch *</label>
                                <select
                                    value={formData.branch}
                                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Semester</label>
                                <input
                                    type="number"
                                    value={formData.semester}
                                    onChange={e => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                    min="1"
                                    max="8"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Course Code</label>
                                <input
                                    type="text"
                                    value={formData.courseCode}
                                    onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                                    placeholder="e.g., CS501"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Batch (for Labs)</label>
                                <input
                                    type="text"
                                    value={formData.batch}
                                    onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                    placeholder="e.g., Batch A"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setShowModal(false); setEditingSchedule(null); }}
                                style={{
                                    padding: '1rem 2rem',
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    fontSize: '1rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: 'white',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                <FaSave /> Save Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScheduleManager;
