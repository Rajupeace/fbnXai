import React, { useState, useEffect, useMemo } from 'react';
import './FacultyDashboard.css';
import { FaCalendarAlt, FaCheckCircle, FaSave, FaUserCheck, FaHistory } from 'react-icons/fa';
import { apiGet, apiPost } from '../../utils/apiClient';

/**
 * FACULTY ATTENDANCE MANAGER
 * High-fidelity roster control and attendance tracking.
 * Theme: Luxe Pearl / Nexus
 */
const FacultyAttendanceManager = ({ subject, sections, year, facultyId }) => {
    const [selectedSection, setSelectedSection] = useState(sections && sections.length > 0 ? sections[0] : '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState([]);
    const [viewMode, setViewMode] = useState('take');

    useEffect(() => {
        if (selectedSection) {
            fetchStudentsAndAttendance();
            fetchHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subject, selectedSection, year, date, facultyId]);

    useEffect(() => {
        if (sections && sections.length > 0 && !sections.includes(selectedSection)) {
            setSelectedSection(sections[0]);
        }
    }, [sections, selectedSection]);

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

            filteredStudents.sort((a, b) => String(a.sid).localeCompare(String(b.sid)));
            setStudents(filteredStudents);

            const targetBranch = filteredStudents[0]?.branch || 'CSE';
            const existing = await apiGet(`/api/attendance/all?year=${year}&section=${selectedSection}&subject=${subject}&date=${date}&branch=${targetBranch}`);

            if (existing && existing.length > 0) {
                const record = existing[0];
                const statusMap = {};
                record.records.forEach(r => { statusMap[r.studentId] = r.status; });
                setAttendance(statusMap);
            } else {
                const initialStatus = {};
                filteredStudents.forEach(s => { initialStatus[s.sid || s.id] = 'Present'; });
                setAttendance(initialStatus);
            }
        } catch (error) {
            console.error("Error loading roster:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await apiGet(`/api/attendance/all?year=${year}&section=${selectedSection}&subject=${subject}`);
            setHistory(res || []);
        } catch (err) {
            console.error("History fetch fail:", err);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const markAll = (status) => {
        const newStatus = {};
        students.forEach(s => { newStatus[s.sid || s.id] = status; });
        setAttendance(newStatus);
    };

    const handleSubmit = async () => {
        setSaving(true);
        const records = students.map(s => ({
            studentId: s.sid || s.id,
            studentName: s.studentName || s.name,
            status: attendance[s.sid || s.id] || 'Present'
        }));

        try {
            await apiPost('/api/attendance', {
                date, subject, year, section: selectedSection,
                branch: students[0]?.branch || 'CSE',
                facultyId, records
            });
            alert("Attendance Synced to Nexus Cloud.");
            fetchHistory();
        } catch (error) {
            alert('Transmission Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const stats = useMemo(() => {
        const total = students.length;
        if (total === 0) return { present: 0, absent: 0, percentage: 0 };
        const present = Object.values(attendance).filter(s => s === 'Present').length;
        const absent = Object.values(attendance).filter(s => s === 'Absent').length;
        return { present, absent, percentage: Math.round((present / total) * 100) };
    }, [students, attendance]);

    return (
        <div className="attendance-manager animate-fade-in">

            <div className="nexus-glass-pills f-spacer-xl">
                <button className={`nexus-pill ${viewMode === 'take' ? 'active' : ''}`} onClick={() => setViewMode('take')}>
                    <FaUserCheck /> LIVE ROSTER
                </button>
                <button className={`nexus-pill ${viewMode === 'history' ? 'active' : ''}`} onClick={() => setViewMode('history')}>
                    <FaHistory /> SESSION LOGS
                </button>
            </div>

            {viewMode === 'take' ? (
                <>
                    <div className="f-attendance-controls animate-slide-up">
                        <div className="f-control-group">
                            <div className="f-pill-control">
                                <label>SECTION</label>
                                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                    {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                                </select>
                            </div>

                            <div className="f-pill-control">
                                <FaCalendarAlt className="f-text-muted" />
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="f-flex-gap">
                            <button onClick={() => markAll('Present')} className="f-cancel-btn text-success">MARK ALL PRESENT</button>
                            <button onClick={() => markAll('Absent')} className="f-cancel-btn text-danger">MARK ALL ABSENT</button>
                        </div>
                    </div>

                    <div className="f-summary-row animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="f-summary-node present">
                            <h4>{stats.present}</h4>
                            <span>PRESENT NODES</span>
                        </div>
                        <div className="f-summary-node absent">
                            <h4>{stats.absent}</h4>
                            <span>ABSENT NODES</span>
                        </div>
                        <div className="f-summary-node rate">
                            <h4>{stats.percentage}%</h4>
                            <span>MASTER RATE</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="no-content">Synchronizing Roster...</div>
                    ) : (
                        <div className="f-roster-wrap animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="f-roster-head">
                                <span>STUDENT IDENTITY</span>
                                <span>OPERATIONAL STATUS</span>
                            </div>

                            <div className="f-roster-list">
                                {students.map((student, index) => {
                                    const isAbsent = attendance[student.sid || student.id] === 'Absent';
                                    return (
                                        <div key={student.sid || student.id} className={`f-roster-item ${isAbsent ? 'absent' : 'present'}`}>
                                            <div className="f-student-identity">
                                                <div className="f-student-index">{index + 1}</div>
                                                <div>
                                                    <div className="f-student-name">{student.studentName || student.name}</div>
                                                    <div className="f-student-sid">{student.sid || student.id}</div>
                                                </div>
                                            </div>

                                            <label className="f-status-trigger">
                                                <span className="f-status-label">{isAbsent ? 'ABSENT' : 'PRESENT'}</span>
                                                <input
                                                    type="checkbox"
                                                    className="f-status-checkbox"
                                                    checked={isAbsent}
                                                    onChange={(e) => handleStatusChange(student.sid || student.id, e.target.checked ? 'Absent' : 'Present')}
                                                />
                                            </label>
                                        </div>
                                    );
                                })}
                                {students.length === 0 && <div className="no-content">No units found in Section {selectedSection}.</div>}
                            </div>
                        </div>
                    )}

                    <div className="f-submit-footer animate-slide-up">
                        <div className="f-flex-gap f-text-muted">
                            <FaCheckCircle className="text-success" style={{ fontSize: '1.2rem' }} />
                            <span style={{ fontWeight: 850, fontSize: '0.85rem' }}>Data syncs to Nexus Central automatically upon submission.</span>
                        </div>
                        <button
                            className="nexus-btn-primary"
                            onClick={handleSubmit}
                            disabled={saving || students.length === 0}
                        >
                            {saving ? 'SYNCING...' : <><FaSave /> COMMIT ATTENDANCE</>}
                        </button>
                    </div>
                </>
            ) : (
                <div className="history-view animate-fade-in">
                    <h2 className="nexus-page-subtitle f-spacer-lg">HISTORICAL SESSION LOGS</h2>
                    <div className="f-history-list">
                        {history.map(record => {
                            const p = record.records.filter(r => r.status === 'Present').length;
                            const t = record.records.length;
                            const pct = t > 0 ? Math.round((p / t) * 100) : 0;
                            return (
                                <div key={record._id || record.id} className="f-history-item">
                                    <div>
                                        <div style={{ fontWeight: 950, color: '#1e293b', fontSize: '1.1rem' }}>{new Date(record.date).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 850, marginTop: '0.2rem' }}>SECTION {record.section} • {record.facultyName || 'COMMANDER'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 950, color: pct > 75 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444' }}>{pct}% EFFICIENCY</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 900, marginTop: '0.2rem' }}>({p} / {t} NODES)</div>
                                    </div>
                                </div>
                            )
                        })}
                        {history.length === 0 && <div className="no-content">No historical logs decrypted.</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyAttendanceManager;
