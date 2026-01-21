import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaClock, FaChalkboardTeacher, FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';

/**
 * SENTINEL CHRONOS COMMAND
 * Strategic orchestration of academic timelines and resource allocation.
 */
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

    const fetchSchedules = React.useCallback(async () => {
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
    }, [filters]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

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
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('TERMINATE TIMELINE ENTRY?\n\nThis action will purge this schedule sequence from the neural buffers.')) {
            try {
                await apiDelete(`/api/schedule/${id}`);
                fetchSchedules();
            } catch (error) {
                console.error('Failed to delete schedule:', error);
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
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>CHRONOS <span>COMMAND</span></h1>
                    <p>Timeline orchestration and tactical resource management</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <button
                        onClick={() => { resetForm(); setEditingSchedule(null); setShowModal(true); }}
                        className="admin-btn admin-btn-primary"
                    >
                        <FaPlus /> INITIALIZE TIMELINE
                    </button>
                </div>
            </header>

            {/* Tactical Filters */}
            <div className="admin-card" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-filter-bar">
                    <div className="admin-search-wrapper">
                        <label className="admin-detail-label">COHORT YEAR</label>
                        <select
                            className="admin-filter-select"
                            value={filters.year}
                            onChange={e => setFilters({ ...filters, year: e.target.value })}
                        >
                            <option value="">All Years</option>
                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                    </div>
                    <div className="admin-search-wrapper">
                        <label className="admin-detail-label">TARGET SECTION</label>
                        <select
                            className="admin-filter-select"
                            value={filters.section}
                            onChange={e => setFilters({ ...filters, section: e.target.value })}
                        >
                            <option value="">All Sections</option>
                            {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                    <div className="admin-search-wrapper">
                        <label className="admin-detail-label">SECTOR BRANCH</label>
                        <select
                            className="admin-filter-select"
                            value={filters.branch}
                            onChange={e => setFilters({ ...filters, branch: e.target.value })}
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="admin-search-wrapper">
                        <label className="admin-detail-label">OPERATIONAL DAY</label>
                        <select
                            className="admin-filter-select"
                            value={filters.day}
                            onChange={e => setFilters({ ...filters, day: e.target.value })}
                        >
                            <option value="">All Days</option>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Timeline Stream */}
            {loading ? (
                <div style={{ padding: '6rem', textAlign: 'center' }}>
                    <div className="f-empty-text">SYNCING TEMPORAL BUFFER...</div>
                </div>
            ) : Object.keys(groupedSchedules).length > 0 ? (
                Object.entries(groupedSchedules).map(([key, classSchedules]) => {
                    const [year, section, branch] = key.split('-');
                    return (
                        <div key={key} className="f-node-card" style={{ marginBottom: '3.5rem' }}>
                            <div className="f-node-head" style={{ borderBottom: '1px solid var(--admin-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                                <h2 className="f-node-title" style={{ fontSize: '1.3rem' }}>
                                    YEAR {year} <span>•</span> SECTION {section} <span>•</span> {branch}
                                </h2>
                                <span className="admin-badge primary">{classSchedules.length} SEQUENCES</span>
                            </div>

                            <div className="admin-card-grid">
                                {classSchedules.map((schedule, idx) => (
                                    <div key={schedule._id || idx} className="admin-summary-card sentinel-animate" style={{ padding: '1.75rem', animationDelay: `${idx * 0.05}s` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                            <div className="summary-icon-box" style={{
                                                width: '50px', height: '50px', borderRadius: '14px',
                                                background: schedule.type === 'Lab' ? '#ecfdf5' : '#eff6ff',
                                                color: schedule.type === 'Lab' ? 'var(--admin-success)' : 'var(--admin-primary)'
                                            }}>
                                                <FaClock style={{ fontSize: '1.2rem' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{schedule.day}</div>
                                                <div style={{ fontSize: '1.15rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>{schedule.time}</div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--admin-secondary)', marginBottom: '1rem', lineHeight: 1.2 }}>
                                                {schedule.subject}
                                            </h3>

                                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 850, color: 'var(--admin-text-muted)' }}>
                                                    <FaChalkboardTeacher style={{ color: 'var(--admin-accent)' }} /> {schedule.faculty}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 850, color: 'var(--admin-text-muted)' }}>
                                                    <FaMapMarkerAlt style={{ color: 'var(--admin-success)' }} /> {schedule.room}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                                                <span className={`admin-badge ${schedule.type === 'Lab' ? 'success' : 'primary'}`} style={{ fontSize: '0.65rem' }}>{schedule.type.toUpperCase()}</span>
                                                {schedule.batch && <span className="admin-badge warning" style={{ fontSize: '0.65rem' }}>PATCH {schedule.batch}</span>}
                                                {schedule.courseCode && <span className="admin-badge primary" style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#64748b' }}>{schedule.courseCode}</span>}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', borderTop: '1px solid var(--admin-border)', paddingTop: '1.25rem' }}>
                                            <button className="f-exam-card" style={{ padding: '0.5rem', background: 'white' }} onClick={() => handleEdit(schedule)} title="Recalibrate"><FaEdit /></button>
                                            <button className="f-cancel-btn" style={{ padding: '0.5rem' }} onClick={() => handleDelete(schedule._id)} title="Purge Sequence"><FaTrash /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="admin-card" style={{ textAlign: 'center', padding: '6rem' }}>
                    <FaCalendarAlt style={{ fontSize: '4rem', color: 'var(--admin-border)', marginBottom: '1.5rem' }} />
                    <h2 style={{ fontWeight: 950, color: 'var(--admin-secondary)' }}>TEMPORAL BUFFER EMPTY</h2>
                    <p style={{ color: 'var(--admin-text-muted)', fontWeight: 850 }}>No timeline sequences detected for current parameters. Initialize a new schedule deploy.</p>
                </div>
            )}

            {/* Tactical Modal Overlay */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <div className="f-node-head" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontWeight: 950, fontSize: '1.5rem', margin: 0 }}>
                                {editingSchedule ? 'RECALIBRATE TIMELINE' : 'INITIALIZE CHRONOS'}
                            </h2>
                            <button onClick={() => { setShowModal(false); setEditingSchedule(null); }} className="f-node-btn" style={{ border: 'none' }}><FaTimes /></button>
                        </div>

                        <div className="admin-form-grid">
                            <div className="admin-form-group full-width">
                                <label className="admin-form-label">SUBJECT IDENTITY *</label>
                                <input className="admin-filter-select" style={{ width: '100%' }} value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="Enter subject name..." required />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">OPERATIONAL DAY *</label>
                                <select className="admin-filter-select" style={{ width: '100%' }} value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })}>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">TIME SLOT (UTC/IST) *</label>
                                <input className="admin-filter-select" style={{ width: '100%' }} value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} placeholder="e.g., 09:00 - 10:00" required />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">INSTRUCTOR IDENTITY *</label>
                                <input className="admin-filter-select" style={{ width: '100%' }} value={formData.faculty} onChange={e => setFormData({ ...formData, faculty: e.target.value })} placeholder="Enter instructor name..." required />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">RESOURCE COORDINATES (ROOM) *</label>
                                <input className="admin-filter-select" style={{ width: '100%' }} value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} placeholder="e.g., Nexus 301" required />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">SEQUENCE TYPE *</label>
                                <select className="admin-filter-select" style={{ width: '100%' }} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">COHORT YEAR *</label>
                                <select className="admin-filter-select" style={{ width: '100%' }} value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}>
                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">SECTOR SECTION *</label>
                                <select className="admin-filter-select" style={{ width: '100%' }} value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}>
                                    {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">SECTOR BRANCH *</label>
                                <select className="admin-filter-select" style={{ width: '100%' }} value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="admin-modal-actions">
                            <button onClick={() => { setShowModal(false); setEditingSchedule(null); }} className="f-cancel-btn">CANCEL</button>
                            <button onClick={handleSave} className="admin-btn admin-btn-primary">
                                <FaSave /> COMMIT TIMELINE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScheduleManager;
