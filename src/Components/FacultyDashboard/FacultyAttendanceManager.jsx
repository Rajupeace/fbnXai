import React, { useState, useEffect } from 'react';
import './FacultyDashboard.css'; // Reuse existing styles or create new ones
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSave, FaUserCheck, FaHistory } from 'react-icons/fa';
import { apiGet, apiPost } from '../../utils/apiClient';

import AcademicPulse from '../StudentDashboard/AcademicPulse';

const FacultyAttendanceManager = ({ subject, sections, year, branch, facultyId }) => {
    // Default to first section if available
    const [selectedSection, setSelectedSection] = useState(sections && sections.length > 0 ? sections[0] : '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState([]);
    const [viewMode, setViewMode] = useState('take'); // 'take' or 'history'

    // Overview Stats State
    const [showOverview, setShowOverview] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [overviewData, setOverviewData] = useState(null);

    useEffect(() => {
        if (selectedSection) {
            fetchStudentsAndAttendance();
            fetchHistory();
        }
    }, [subject, selectedSection, year, date]);

    // Handle initial props change (if activeContext changes in parent)
    useEffect(() => {
        if (sections && sections.length > 0 && !sections.includes(selectedSection)) {
            setSelectedSection(sections[0]);
        }
    }, [sections]);

    const fetchOverview = async (studentId, studentName) => {
        setSelectedStudent({ id: studentId, name: studentName });
        setOverviewData(null); // Clear previous
        setShowOverview(true);
        try {
            const data = await apiGet(`/api/students/${studentId}/overview`);
            if (data) setOverviewData(data);
        } catch (e) {
            console.error("Failed to fetch overview", e);
        }
    };

    const fetchStudentsAndAttendance = async () => {
        setLoading(true);
        try {
            const allStudents = await apiGet(`/api/faculty-stats/${facultyId}/students`);

            const filteredStudents = allStudents.filter(s => {
                const sYear = String(s.year || '').trim();
                const qYear = String(year || '').trim();
                const sSec = String(s.section || '').trim().toUpperCase();
                const qSec = String(selectedSection || '').trim().toUpperCase();

                return sYear === qYear && sSec === qSec;
            });

            // Sort by ID/Roll Number
            filteredStudents.sort((a, b) => String(a.sid).localeCompare(String(b.sid)));

            setStudents(filteredStudents);

            // Dynamically determine branch from students if not passed precisely, or default to CSE
            const targetBranch = filteredStudents[0]?.branch || 'CSE';

            const existing = await apiGet(`/api/attendance/all?year=${year}&section=${selectedSection}&subject=${subject}&date=${date}&branch=${targetBranch}`);

            if (existing && existing.length > 0) {
                const record = existing[0];
                const statusMap = {};
                record.records.forEach(r => {
                    statusMap[r.studentId] = r.status;
                });
                setAttendance(statusMap);
            } else {
                const initialStatus = {};
                filteredStudents.forEach(s => {
                    initialStatus[s.sid || s.id] = 'Present';
                });
                setAttendance(initialStatus);
            }

        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await apiGet(`/api/attendance/all?year=${year}&section=${selectedSection}&subject=${subject}`);
            setHistory(res || []);
        } catch (err) {
            console.error("History fetch fail", err);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAll = (status) => {
        const newStatus = {};
        students.forEach(s => {
            newStatus[s.sid || s.id] = status;
        });
        setAttendance(newStatus);
    };

    const handleSubmit = async () => {
        // OPTIMISTIC UI: Assume success immediately for instant feedback
        setSaving(true);
        const originalAttendance = { ...attendance }; // Backup for rollback if needed

        // 1. Instant Visual Feedback
        const savedMessage = document.createElement('div');
        savedMessage.innerText = " Attendance Saved! Syncing...";
        savedMessage.style.position = 'fixed';
        savedMessage.style.bottom = '20px';
        savedMessage.style.right = '20px';
        savedMessage.style.background = '#22c55e';
        savedMessage.style.color = 'white';
        savedMessage.style.padding = '12px 24px';
        savedMessage.style.borderRadius = '8px';
        savedMessage.style.fontWeight = 'bold';
        savedMessage.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        savedMessage.style.zIndex = '9999';
        savedMessage.style.animation = 'slideIn 0.3s ease-out';
        document.body.appendChild(savedMessage);

        // 2. Prepare Data
        const records = students.map(s => ({
            studentId: s.sid || s.id,
            studentName: s.studentName || s.name,
            status: attendance[s.sid || s.id] || 'Present'
        }));

        const payload = {
            date,
            subject,
            year,
            section: selectedSection,
            branch: students[0]?.branch || 'CSE',
            facultyId,
            records
        };

        try {
            // 3. Perform Network Request (Non-blocking for UI interactions, but we await enough to confirm for saving state)
            await apiPost('/api/attendance', payload);

            // 4. Success State
            setTimeout(() => {
                savedMessage.innerText = "☁️ Synced to Student Dashboards";
                savedMessage.style.background = '#0ea5e9'; // Blue for synced
            }, 800);

            setTimeout(() => {
                savedMessage.style.opacity = '0';
                setTimeout(() => document.body.removeChild(savedMessage), 500);
            }, 2500);

            fetchHistory(); // Refresh history quietly
        } catch (error) {
            // 5. Rollback on Error
            console.error("Save failed", error);
            setAttendance(originalAttendance); // Revert state

            savedMessage.innerText = "❌ Save Failed. Please Retry.";
            savedMessage.style.background = '#ef4444';
            setTimeout(() => {
                savedMessage.remove();
                alert('Connection Error: Your attendance could not be saved. ' + error.message);
            }, 2000);
        } finally {
            setSaving(false);
        }
    };

    const calculateStats = () => {
        const total = students.length;
        if (total === 0) return { present: 0, absent: 0, percentage: 0 };
        const present = Object.values(attendance).filter(s => s === 'Present').length;
        const absent = Object.values(attendance).filter(s => s === 'Absent').length;
        return { present, absent, percentage: Math.round((present / total) * 100) };
    };

    const stats = calculateStats();

    return (
        <div className="attendance-manager animate-fade-in" style={{ padding: '1rem' }}>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--pearl-border)' }}>
                <button
                    className={`tab-btn ${viewMode === 'take' ? 'active' : ''}`}
                    onClick={() => setViewMode('take')}
                    style={{ padding: '1rem', background: 'transparent', border: 'none', borderBottom: viewMode === 'take' ? '2px solid var(--accent-primary)' : 'none', color: viewMode === 'take' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                >
                    <FaUserCheck /> Take Attendance
                </button>
                <button
                    className={`tab-btn ${viewMode === 'history' ? 'active' : ''}`}
                    onClick={() => setViewMode('history')}
                    style={{ padding: '1rem', background: 'transparent', border: 'none', borderBottom: viewMode === 'history' ? '2px solid var(--accent-primary)' : 'none', color: viewMode === 'history' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                >
                    <FaHistory /> History
                </button>
            </div>

            {viewMode === 'take' ? (
                <>
                    <div className="controls-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Section Selector */}
                            <div className="section-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--pearl-border)' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Section:</span>
                                <select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    style={{ border: 'none', outline: 'none', fontWeight: 800, color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                                >
                                    {sections.map(sec => (
                                        <option key={sec} value={sec}>{sec}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="date-picker-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--pearl-border)' }}>
                                <FaCalendarAlt color="var(--text-muted)" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={{ border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--text-main)', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div className="stats-pill" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                Target: {students.length} Students
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => markAll('Present')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #10b981', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Mark All Present</button>
                            <button onClick={() => markAll('Absent')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Mark All Absent</button>
                        </div>
                    </div>

                    <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="glass-card" style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <h4 style={{ margin: 0, color: '#16a34a', fontSize: '1.8rem', fontWeight: 800 }}>{stats.present}</h4>
                            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, letterSpacing: '0.5px' }}>PRESENT</span>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
                            <h4 style={{ margin: 0, color: '#dc2626', fontSize: '1.8rem', fontWeight: 800 }}>{stats.absent}</h4>
                            <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 700, letterSpacing: '0.5px' }}>ABSENT</span>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center', padding: '1rem', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                            <h4 style={{ margin: 0, color: '#0284c7', fontSize: '1.8rem', fontWeight: 800 }}>{stats.percentage}%</h4>
                            <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, letterSpacing: '0.5px' }}>ATTENDANCE RATE</span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                            Loading student roster...
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>STUDENT DETAILS</span>
                                <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>MARK ABSENT</span>
                            </div>

                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {students.map((student, index) => {
                                    const isAbsent = attendance[student.sid || student.id] === 'Absent';
                                    return (
                                        <div key={student.sid || student.id}
                                            style={{
                                                padding: '1rem 1.5rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderBottom: '1px solid #f1f5f9',
                                                background: isAbsent ? '#fef2f2' : 'white',
                                                transition: 'background 0.2s'
                                            }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: isAbsent ? '#fee2e2' : '#e0f2fe', color: isAbsent ? '#ef4444' : '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#334155', fontSize: '1rem' }}>
                                                        {student.studentName || student.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                        {student.sid || student.id}
                                                    </div>
                                                </div>
                                            </div>

                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.8rem' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isAbsent ? '#ef4444' : '#cbd5e1' }}>
                                                    {isAbsent ? 'ABSENT' : 'PRESENT'}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={isAbsent}
                                                    onChange={(e) => handleStatusChange(student.sid || student.id, e.target.checked ? 'Absent' : 'Present')}
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        cursor: 'pointer',
                                                        accentColor: '#ef4444'
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    );
                                })}
                                {students.length === 0 && (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                        No students found in Section {selectedSection}.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            <FaCheckCircle style={{ color: '#10b981', marginRight: '0.4rem' }} />
                            Autosaved data will reflect on student portals instantly.
                        </div>
                        <button
                            className="cyber-btn primary"
                            onClick={handleSubmit}
                            disabled={saving || students.length === 0}
                            style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {saving ? 'Saving...' : <><FaSave /> Submit Final Attendance</>}
                        </button>
                    </div>
                </>
            ) : (
                <div className="history-view">
                    <h3>Previous Records</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {history.map(record => {
                            const p = record.records.filter(r => r.status === 'Present').length;
                            const t = record.records.length;
                            const pct = t > 0 ? Math.round((p / t) * 100) : 0;
                            return (
                                <div key={record._id || record.id || record.date} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{new Date(record.date).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recorded by {record.facultyName || 'Faculty'}</div>
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 800, color: pct > 75 ? '#10b981' : pct > 50 ? 'orange' : '#ef4444' }}>{pct}% Attendance</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({p}/{t})</span>
                                    </div>
                                </div>
                            )
                        })}
                        {history.length === 0 && <p>No history found.</p>}
                    </div>
                </div>
            )}

            {/* Student Overview Modal */}
            {showOverview && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-card animate-scale-in" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>
                                <span style={{ opacity: 0.5 }}>Profile: </span>
                                {selectedStudent?.name}
                            </h2>
                            <button onClick={() => setShowOverview(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {overviewData ? (
                            <AcademicPulse data={overviewData} />
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center' }}>Loading 360° Profile...</div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default FacultyAttendanceManager;
