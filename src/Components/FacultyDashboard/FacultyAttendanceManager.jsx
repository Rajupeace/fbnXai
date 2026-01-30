import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './FacultyDashboard.css';
import { FaCalendarAlt, FaCheckCircle, FaSave, FaUserCheck, FaHistory, FaFilter, FaUsers, FaExclamationTriangle } from 'react-icons/fa';
import { apiGet, apiPost } from '../../utils/apiClient';

/**
 * FACULTY ATTENDANCE MANAGER
 * Attendance tracking and management interface with section-based filtering.
 */
const FacultyAttendanceManager = ({ facultyData }) => {
    const [availableSections, setAvailableSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState({ year: '', section: '' });
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState([]);
    const [viewMode, setViewMode] = useState('take');

    useEffect(() => {
        initializeSections();
    }, [facultyData, initializeSections]);

    useEffect(() => {
        if (selectedSection.year && selectedSection.section) {
            fetchStudentsAndAttendance();
            fetchHistory();
        }
    }, [selectedSection, date, fetchStudentsAndAttendance, fetchHistory]);

    const initializeSections = useCallback(() => {
        console.log('=== INITIALIZING ATTENDANCE SECTIONS ===');
        const sections = extractSectionsFromData(facultyData);
        console.log('Extracted sections for attendance:', sections);
        setAvailableSections(sections);

        if (sections.length > 0) {
            setSelectedSection(sections[0]);
        }
    }, [facultyData]);

    const extractSectionsFromData = (data) => {
        if (!data) return [];

        console.log('Extracting sections from:', Object.keys(data));

        // Method 1: Check assignments array (YOUR DATABASE HAS THIS!)
        if (data.assignments && Array.isArray(data.assignments) && data.assignments.length > 0) {
            const sectionsMap = new Map();
            data.assignments.forEach(assignment => {
                const year = parseInt(assignment.year || assignment.Year || assignment.classYear);
                const section = String(assignment.section || assignment.Section || assignment.classSection).toUpperCase();

                if (year && section && section !== 'UNDEFINED') {
                    const key = `${year}-${section}`;
                    if (!sectionsMap.has(key)) {
                        sectionsMap.set(key, { year, section });
                    }
                }
            });
            const sections = Array.from(sectionsMap.values());
            if (sections.length > 0) {
                console.log('✅ Sections from assignments:', sections);
                return sections;
            }
        }

        // Method 2: Check sections array
        if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
            return data.sections.map(s => ({
                year: String(s.year || s.Year),
                section: String(s.section || s.Section).toUpperCase()
            }));
        }

        // Method 3: Check direct fields
        if (data.year && data.section) {
            return [{
                year: String(data.year),
                section: String(data.section).toUpperCase()
            }];
        }

        console.error('❌ NO SECTIONS FOUND for attendance');
        return [];
    };

    const fetchStudentsAndAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const allStudents = await apiGet(`/api/faculty/${facultyData.facultyId}/students`);
            console.log('Fetched students for attendance:', allStudents);

            // Filter by selected section
            const filteredStudents = allStudents.filter(s => {
                const studentYear = String(s.year || s.Year);
                const studentSection = String(s.section || s.Section).toUpperCase();
                return studentYear === selectedSection.year && studentSection === selectedSection.section;
            });

            filteredStudents.sort((a, b) => String(a.sid).localeCompare(String(b.sid)));
            setStudents(filteredStudents);

            console.log(`Filtered ${filteredStudents.length} students for attendance in Year ${selectedSection.year} Section ${selectedSection.section}`);

            // Fetch existing attendance
            const subject = facultyData?.subject || '';
            const branch = filteredStudents[0]?.branch || 'CSE';
            const existing = await apiGet(
                `/api/attendance/all?year=${selectedSection.year}&section=${selectedSection.section}&subject=${subject}&date=${date}&branch=${branch}`
            );

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
    }, [facultyData, selectedSection, date]);

    const fetchHistory = useCallback(async () => {
        try {
            const subject = facultyData?.subject || '';
            const res = await apiGet(
                `/api/attendance/all?year=${selectedSection.year}&section=${selectedSection.section}&subject=${subject}`
            );
            setHistory(res || []);
        } catch (err) {
            console.error("History fetch fail:", err);
        }
    }, [facultyData, selectedSection]);

    const handleSectionChange = (newSection) => {
        setSelectedSection(newSection);
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
                date,
                subject: facultyData?.subject || '',
                year: selectedSection.year,
                section: selectedSection.section,
                branch: students[0]?.branch || 'CSE',
                facultyId: facultyData?.facultyId,
                facultyName: facultyData?.name || '',
                records
            });
            alert("Attendance Saved Successfully.");
            fetchHistory();
        } catch (error) {
            alert('Save Error: ' + error.message);
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

    // Show error if no sections
    if (availableSections.length === 0) {
        return (
            <div className="attendance-manager">
                <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                    <FaExclamationTriangle size={64} style={{ color: '#f59e0b' }} />
                    <h3>No Sections Assigned</h3>
                    <p>Your faculty account doesn't have sections assigned for attendance.</p>
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>
                        Please check the Marks section for debugging information or contact admin.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="attendance-manager animate-fade-in">

            <div className="nexus-glass-pills f-spacer-xl">
                <button className={`nexus-pill ${viewMode === 'take' ? 'active' : ''}`} onClick={() => setViewMode('take')}>
                    <FaUserCheck /> MARK ATTENDANCE
                </button>
                <button className={`nexus-pill ${viewMode === 'history' ? 'active' : ''}`} onClick={() => setViewMode('history')}>
                    <FaHistory /> ATTENDANCE HISTORY
                </button>
            </div>

            {viewMode === 'take' ? (
                <>
                    {/* Section Filter */}
                    <div className="section-filter-bar" style={{ marginBottom: '1.5rem' }}>
                        <div className="filter-label">
                            <FaFilter /> <strong>Select Section:</strong>
                        </div>
                        <div className="section-buttons">
                            {availableSections.map((sec, index) => (
                                <button
                                    key={index}
                                    className={`section-btn ${selectedSection.year === sec.year && selectedSection.section === sec.section ? 'active' : ''}`}
                                    onClick={() => handleSectionChange(sec)}
                                >
                                    <FaUsers /> Year {sec.year} - Section {sec.section}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="f-attendance-controls animate-slide-up">
                        <div className="f-control-group">
                            <div className="f-pill-control">
                                <label>CURRENT SECTION</label>
                                <div style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', borderRadius: '8px', fontWeight: '700', color: '#667eea' }}>
                                    Year {selectedSection.year} - Section {selectedSection.section}
                                </div>
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
                            <span>PRESENT STUDENTS</span>
                        </div>
                        <div className="f-summary-node absent">
                            <h4>{stats.absent}</h4>
                            <span>ABSENT STUDENTS</span>
                        </div>
                        <div className="f-summary-node rate">
                            <h4>{stats.percentage}%</h4>
                            <span>ATTENDANCE RATE</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="no-content">Loading Roster...</div>
                    ) : (
                        <div className="f-roster-wrap animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="f-roster-head">
                                <span>STUDENT NAME / ID</span>
                                <span>STATUS</span>
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
                                {students.length === 0 && <div className="no-content">No students found in Year {selectedSection.year} Section {selectedSection.section}.</div>}
                            </div>
                        </div>
                    )}

                    <div className="f-submit-footer animate-slide-up">
                        <div className="f-flex-gap f-text-muted">
                            <FaCheckCircle className="text-success" style={{ fontSize: '1.2rem' }} />
                            <span style={{ fontWeight: 850, fontSize: '0.85rem' }}>Attendance for Year {selectedSection.year} Section {selectedSection.section} on {new Date(date).toLocaleDateString()}.</span>
                        </div>
                        <button
                            className="nexus-btn-primary"
                            onClick={handleSubmit}
                            disabled={saving || students.length === 0}
                        >
                            {saving ? 'SAVING...' : <><FaSave /> SAVE ATTENDANCE</>}
                        </button>
                    </div>
                </>
            ) : (
                <div className="history-view animate-fade-in">
                    <h2 className="nexus-page-subtitle f-spacer-lg">ATTENDANCE HISTORY - Year {selectedSection.year} Section {selectedSection.section}</h2>
                    <div className="f-history-list">
                        {history.map(record => {
                            const p = record.records.filter(r => r.status === 'Present').length;
                            const t = record.records.length;
                            const pct = t > 0 ? Math.round((p / t) * 100) : 0;
                            return (
                                <div key={record._id || record.id} className="f-history-item">
                                    <div>
                                        <div style={{ fontWeight: 950, color: '#1e293b', fontSize: '1.1rem' }}>{new Date(record.date).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 850, marginTop: '0.2rem' }}>SECTION {record.section} • {record.facultyName || 'FACULTY'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 950, color: pct > 75 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444' }}>{pct}% ATTENDANCE</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 900, marginTop: '0.2rem' }}>({p} / {t} STUDENTS)</div>
                                    </div>
                                </div>
                            )
                        })}
                        {history.length === 0 && <div className="no-content">No attendance history found for this section.</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyAttendanceManager;
