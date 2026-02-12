import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './FacultyDashboard.css';
import { FaCalendarAlt, FaUserCheck, FaHistory, FaUsers, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { apiGet, apiPost } from '../../utils/apiClient';

/**
 * FACULTY ATTENDANCE MANAGER
 * Enhanced with Hour-wise tracking and Schedule Integration.
 */
const FacultyAttendanceManager = ({ facultyId, subject, year, sections, currentFaculty, openAiWithPrompt }) => {
    // 1. Setup Faculty Data Context
    const facultyData = useMemo(() => {
        if (currentFaculty && Object.keys(currentFaculty).length > 0) return currentFaculty;
        return {
            facultyId, subject, year,
            sections: Array.isArray(sections) ? sections.map(s => ({ year: String(year), section: String(s) })) : [],
            assignments: Array.isArray(sections) ? sections.map(s => ({ year: String(year), section: String(s), subject })) : []
        };
    }, [currentFaculty, facultyId, subject, year, sections]);

    // 2. State Variables
    const [availableSections, setAvailableSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState({ year: '', section: '', subject: '' });
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    // eslint-disable-next-line no-unused-vars
    const [scheduleSlots, setScheduleSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null); // { hour: 1, time: '09:00', subject: 'Math' }

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // Current marking state { studentId: 'Present' }
    const [dailyLog, setDailyLog] = useState({}); // { studentId: [{ hour: 1, status: 'Present' }] }

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('take'); // 'take' | 'history'

    // 3. Initialize Sections
    const initializeSections = useCallback(() => {
        const extracted = extractSectionsFromData(facultyData);
        setAvailableSections(extracted);
        if (extracted.length > 0) {
            setSelectedSection(extracted[0]);
        }
    }, [facultyData]);

    const extractSectionsFromData = (data) => {
        if (!data) return [];
        if (data.assignments?.length > 0) {
            const map = new Map();
            data.assignments.forEach(a => {
                const y = parseInt(a.year || a.Year);
                const s = String(a.section || a.Section || 'A').toUpperCase();
                const subj = a.subject || a.Subject || data.subject || 'General';
                if (y) map.set(`${y}-${s}-${subj}`, { year: y, section: s, subject: subj });
            });
            return Array.from(map.values());
        }
        return [];
    };

    useEffect(() => { initializeSections(); }, [initializeSections]);

    // 4. Fetch Activity Log (Overall daily activity for this section)
    const fetchDailyActivity = useCallback(async () => {
        if (!selectedSection.year || !date) return;
        try {
            // Fetch ALL attendance for this section on this date
            const res = await apiGet(`/api/attendance/all?date=${date}&section=${selectedSection.section}&year=${selectedSection.year}`);

            // Process into a map: { studentId: [ { hour: 1, status: 'P' }, ... ] }
            const log = {};
            if (Array.isArray(res)) {
                res.forEach(group => {
                    // group is by subject/section, contains records
                    group.records.forEach(r => {
                        if (!log[r.studentId]) log[r.studentId] = [];
                        // r might have 'hour' if we successfully saved it before
                        // If not, we might not be able to plot it perfectly, but let's try.
                        log[r.studentId].push({
                            hour: r.hour || 0, // 0 if unknown
                            status: r.status,
                            subject: group.subject
                        });
                    });
                });
            }
            setDailyLog(log);
        } catch (e) { console.error("Daily log error:", e); }
    }, [selectedSection, date]);


    // 6. Main Data Fetch (Students + Current Slot Attendance)
    // 6. Main Data Fetch (Students + Current Slot Attendance)
    const fetchData = useCallback(async () => {
        if (!selectedSection.year || !selectedSection.section) return;
        setLoading(true);
        try {
            // Fetch students for the selected section
            const query = `year=${selectedSection.year}&section=${selectedSection.section}`;
            // Try to use the common student search or listing endpoint
            const res = await apiGet(`/api/students?${query}`);

            if (res && res.success && res.students) {
                setStudents(res.students);
            } else if (Array.isArray(res)) {
                setStudents(res);
            }
        } catch (e) {
            console.error("Main fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, [selectedSection]);

    // Trigger Initial Fetch
    useEffect(() => {
        if (selectedSection.year && selectedSection.section) {
            fetchData();
            fetchDailyActivity();
        }
    }, [selectedSection, date, fetchData, fetchDailyActivity]);


    // Sync Attendance State with Selected Slot
    useEffect(() => {
        if (!selectedSlot || !students.length) return;

        const newAttendance = {};
        // Default to 'Present'
        students.forEach(s => newAttendance[s.sid || s.id] = 'Present');

        // Overwrite with existing data from dailyLog
        Object.keys(dailyLog).forEach(sid => {
            const studentRecords = dailyLog[sid];
            // Find record matching current hour/subject
            const match = studentRecords.find(r => r.hour === selectedSlot.hour || r.subject === selectedSlot.subject);
            if (match) {
                newAttendance[sid] = match.status;
            }
        });
        setAttendance(newAttendance);

    }, [selectedSlot, dailyLog, students]);


    // Handlers
    const handleStatusChange = (sid, status) => {
        setAttendance(prev => ({ ...prev, [sid]: status }));
    };

    const markAll = (status) => {
        const newStatus = {};
        students.forEach(s => newStatus[s.sid || s.id] = status);
        setAttendance(newStatus);
    };

    const handleSubmit = async () => {
        setSaving(true);
        const records = students.map(s => ({
            studentId: s.sid || s.id,
            studentName: s.studentName || s.name,
            status: attendance[s.sid || s.id] || 'Present',
            hour: selectedSlot?.hour // Critical: Send the hour
        }));

        try {
            await apiPost('/api/attendance', {
                date,
                subject: selectedSlot?.subject || selectedSection.subject || 'General',
                year: selectedSection.year,
                section: selectedSection.section,
                branch: students[0]?.branch || 'CSE',
                facultyId: facultyData.facultyId,
                facultyName: facultyData.name,
                records
            });
            alert("Attendance Commit Successful.");
            fetchDailyActivity(); // Refresh logs
        } catch (e) {
            alert('Save Failed: ' + e.message);
        } finally {
            setSaving(false);
        }
    };


    // Render Helpers
    const getSlotLabel = (s) => (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{s.time}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{s.subject}</span>
        </div>
    );

    // Calculate Stats for current view
    const stats = useMemo(() => {
        const total = students.length;
        const present = Object.values(attendance).filter(v => v === 'Present').length;
        return { total, present, absent: total - present, pct: total ? Math.round((present / total) * 100) : 0 };
    }, [attendance, students]);


    if (availableSections.length === 0) {
        return (
            <div className="attendance-manager f-center-empty">
                <FaExclamationTriangle size={48} color="#f59e0b" />
                <h3>No Assigned Sections</h3>
                <p>Contact admin to assign classes.</p>
            </div>
        );
    }

    return (
        <div className="attendance-manager animate-fade-in">
            <header className="f-view-header">
                <div>
                    <h2>ATTENDANCE <span>MANAGER</span></h2>
                    <p className="nexus-subtitle">Hour-wise activity tracking</p>
                </div>
                <div className="nexus-glass-pills" style={{ marginBottom: 0 }}>
                    <button className={`nexus-pill ${viewMode === 'take' ? 'active' : ''}`} onClick={() => setViewMode('take')}>
                        <FaUserCheck /> ACTIVITY
                    </button>
                    <button className={`nexus-pill ${viewMode === 'history' ? 'active' : ''}`} onClick={() => setViewMode('history')}>
                        <FaHistory /> LOGS
                    </button>
                </div>
            </header>

            {/* CONTROLS BAR */}
            <div className="f-attendance-controls animate-slide-up" style={{ padding: '1rem', background: 'white', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', border: '1px solid #e2e8f0' }}>

                {/* 1. Date Selector */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div className="summary-icon-box" style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: 'var(--accent-primary)' }}><FaCalendarAlt /></div>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ border: 'none', fontWeight: 800, bg: 'transparent', outline: 'none' }} />
                </div>

                {/* 2. Section Selector */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div className="summary-icon-box" style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', color: '#15803d' }}><FaUsers /></div>
                    <select
                        value={`${selectedSection.year}-${selectedSection.section}-${selectedSection.subject}`}
                        onChange={(e) => {
                            const [y, s, subj] = e.target.value.split('-');
                            const found = availableSections.find(sec => String(sec.year) === y && sec.section === s && sec.subject === subj);
                            if (found) setSelectedSection(found);
                        }}
                        style={{ border: 'none', fontWeight: 800, bg: 'transparent', outline: 'none', minWidth: '150px' }}
                    >
                        {availableSections.map((s, i) => (
                            <option key={i} value={`${s.year}-${s.section}-${s.subject}`}>Y{s.year} • Sec {s.section} • {s.subject}</option>
                        ))}
                    </select>
                </div>

                {/* 3. Slot Selector (The "Link") */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, overflowX: 'auto' }}>
                    <div className="summary-icon-box" style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7ed', color: '#ea580c' }}><FaClock /></div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {scheduleSlots.map(slot => (
                            <button
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot)}
                                className={`slot-pill ${selectedSlot?.id === slot.id ? 'active' : ''}`}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '8px',
                                    border: selectedSlot?.id === slot.id ? '2px solid var(--accent-primary)' : '1px solid #e2e8f0',
                                    background: selectedSlot?.id === slot.id ? '#eff6ff' : 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    minWidth: '100px'
                                }}
                            >
                                {getSlotLabel(slot)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN ROSTER AREA */}
            <div style={{ position: 'relative', minHeight: '300px' }}>
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Stats Bar */}
                <div className="f-weekly-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '0 0 1.5rem 0', background: 'transparent' }}>
                    <div className="f-stat-card" style={{ padding: '0.75rem' }}>
                        <span className="val" style={{ color: '#10b981' }}>{stats.present}</span>
                        <span className="lab">PRESENT</span>
                    </div>
                    <div className="f-stat-card" style={{ padding: '0.75rem' }}>
                        <span className="val" style={{ color: '#ef4444' }}>{stats.absent}</span>
                        <span className="lab">ABSENT</span>
                    </div>
                    <div className="f-stat-card" style={{ padding: '0.75rem' }}>
                        <span className="val" style={{ color: '#3b82f6' }}>{stats.pct}%</span>
                        <span className="lab">RATE</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => markAll('Present')} className="f-node-btn secondary" style={{ flex: 1, fontSize: '0.7rem' }}>ALL PRESENT</button>
                        <button onClick={() => markAll('Absent')} className="f-node-btn secondary" style={{ flex: 1, fontSize: '0.7rem' }}>ALL ABSENT</button>
                    </div>
                </div>

                {/* List */}
                <div className="f-roster-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                    {students.map((student, idx) => {
                        const isAbsent = attendance[student.sid || student.id] === 'Absent';
                        const history = dailyLog[student.sid || student.id] || [];

                        return (
                            <motion.div
                                layoutId={student.sid}
                                key={student.sid || student.id}
                                className={`f-node-card ${isAbsent ? 'absent-node' : ''}`}
                                style={{
                                    padding: '1rem',
                                    borderLeft: `5px solid ${isAbsent ? '#ef4444' : '#10b981'}`,
                                    background: isAbsent ? '#fef2f2' : 'white',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleStatusChange(student.sid || student.id, isAbsent ? 'Present' : 'Absent')}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: '#f1f5f9', color: '#64748b',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '0.75rem'
                                        }}>{idx + 1}</div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#1e293b' }}>{student.studentName || student.name}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>{student.sid}</div>
                                        </div>
                                    </div>
                                    <div className={`status-badge ${isAbsent ? 'absent' : 'present'}`} style={{
                                        padding: '0.25rem 0.6rem', borderRadius: 6,
                                        fontSize: '0.65rem', fontWeight: 900,
                                        background: isAbsent ? '#fee2e2' : '#dcfce7',
                                        color: isAbsent ? '#ef4444' : '#166534'
                                    }}>
                                        {isAbsent ? 'ABSENT' : 'PRESENT'}
                                    </div>
                                </div>

                                {/* Hourly Activity Log */}
                                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', marginRight: '0.5rem' }}>DAILY LOG:</span>
                                    {scheduleSlots.map(slot => {
                                        // Check if this student has a record for this slot hour
                                        const rec = history.find(h => h.hour === slot.hour);
                                        let color = '#e2e8f0'; // Gray (No Record)
                                        if (rec) color = rec.status === 'Present' ? '#10b981' : '#ef4444';

                                        // Highlight current selected slot
                                        const isCurrent = selectedSlot?.hour === slot.hour;

                                        return (
                                            <div key={slot.hour} title={`Hour ${slot.hour}: ${rec ? rec.status : 'No Data'}`} style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: color,
                                                border: isCurrent ? '2px solid var(--accent-primary)' : 'none',
                                                transform: isCurrent ? 'scale(1.2)' : 'scale(1)'
                                            }}></div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="f-submit-footer animate-slide-up" style={{
                marginTop: '2rem', position: 'sticky', bottom: '1rem', zIndex: 50,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
                padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                    TARGET: <span style={{ color: 'var(--accent-primary)' }}>{selectedSlot?.subject || selectedSection.subject}</span> • HOUR {selectedSlot?.hour}
                </div>
                <button
                    className="nexus-btn-primary"
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}
                >
                    {saving ? 'SAVING...' : 'COMMIT LOG'}
                </button>
            </div>
        </div>
    );
};

export default FacultyAttendanceManager;
