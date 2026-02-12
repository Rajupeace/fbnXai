import React, { useState, useEffect } from 'react';
import { apiPost } from '../../utils/apiClient';
import { FaCheckCircle, FaTimesCircle, FaClock, FaUsers, FaBook, FaCalendarDay } from 'react-icons/fa';
import './FacultyAttendanceMarker.css';

/**
 * FACULTY ATTENDANCE MARKING INTERFACE
 * Easy hourly attendance marking for classes
 * Features: Hour selection, bulk marking, quick confirmation
 */
const FacultyAttendanceMarker = ({ facultyId, facultyName }) => {
    // Form state
    const [subject, setSubject] = useState('');
    const [section, setSection] = useState('');
    const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedHour, setSelectedHour] = useState(0);
    const [year, setYear] = useState('2');
    const [branch, setBranch] = useState('CSE');

    // Data state
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // studentId -> status
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Sample data (in production, fetch from backend)
    const subjects = ['Data Structures', 'Mathematics', 'Physics', 'Chemistry', 'English'];
    const sections = ['A', 'B', 'C'];
    const years = ['1', '2', '3', '4'];
    const branches = ['CSE', 'ECE', 'ME', 'CE'];

    // Fetch students for selected class
    useEffect(() => {
        if (subject && section) {
            fetchStudents();
        }
    }, [subject, section, year, branch]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // Mock data - in production, fetch from /api/students?class=...
            const mockStudents = [
                { studentId: 'STU001', name: 'Alice Johnson', rollNo: '001' },
                { studentId: 'STU002', name: 'Bob Smith', rollNo: '002' },
                { studentId: 'STU003', name: 'Charlie Brown', rollNo: '003' },
                { studentId: 'STU004', name: 'Diana Prince', rollNo: '004' },
                { studentId: 'STU005', name: 'Eve Wilson', rollNo: '005' },
                { studentId: 'STU006', name: 'Frank Miller', rollNo: '006' },
                { studentId: 'STU007', name: 'Grace Lee', rollNo: '007' },
                { studentId: 'STU008', name: 'Henry Davis', rollNo: '008' },
            ];
            setStudents(mockStudents);
            // Initialize all as present by default
            const initialAttendance = {};
            mockStudents.forEach(s => {
                initialAttendance[s.studentId] = 'Present';
            });
            setAttendance(initialAttendance);
            setError(null);
        } catch (err) {
            setError('Failed to fetch students: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Toggle attendance for a student
    const toggleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    // Bulk mark all as present
    const bulkMarkPresent = () => {
        const updated = {};
        students.forEach(s => {
            updated[s.studentId] = 'Present';
        });
        setAttendance(updated);
    };

    // Bulk mark all as absent
    const bulkMarkAbsent = () => {
        const updated = {};
        students.forEach(s => {
            updated[s.studentId] = 'Absent';
        });
        setAttendance(updated);
    };

    // Submit attendance
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !section) {
            setError('Please select subject and section');
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        try {
            // Prepare records for submission
            const records = students.map(student => ({
                studentId: student.studentId,
                studentName: student.name,
                status: attendance[student.studentId] || 'Present',
                remarks: `Marked for hour ${selectedHour}`
            }));

            // Submit to API
            const response = await apiPost('/api/attendance', {
                date: classDate,
                subject,
                year,
                section,
                branch,
                hour: selectedHour,
                facultyId: facultyId || 'FAC_DEFAULT',
                facultyName: facultyName || 'Faculty',
                records
            });

            if (response && response.message) {
                setSuccessMessage(`✅ Attendance marked for ${records.length} students for hour ${selectedHour}`);
                setSubmitted(true);
                // Reset form
                setTimeout(() => {
                    setAttendance({});
                    setSelectedHour(0);
                    setSubmitted(false);
                }, 3000);
            }
        } catch (err) {
            setError('Failed to submit attendance: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const presentCount = Object.values(attendance).filter(s => s === 'Present').length;
    const absentCount = students.length - presentCount;

    return (
        <div className="faculty-marking-container">
            {/* Header */}
            <div className="marking-header">
                <h1><FaClock /> ATTENDANCE MARKING</h1>
                <p>Mark hourly attendance for your class</p>
            </div>

            <form onSubmit={handleSubmit} className="marking-form">
                {/* Class Selection Section */}
                <div className="form-section">
                    <h2><FaBook /> Class Selection</h2>
                    
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Subject <span className="required">*</span></label>
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} required>
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Section <span className="required">*</span></label>
                            <select value={section} onChange={(e) => setSection(e.target.value)} required>
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Year</label>
                            <select value={year} onChange={(e) => setYear(e.target.value)}>
                                {years.map(y => <option key={y} value={y}>Year {y}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Branch</label>
                            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label><FaCalendarDay /> Date</label>
                            <input 
                                type="date" 
                                value={classDate} 
                                onChange={(e) => setClassDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label><FaClock /> Class Hour (0-23)</label>
                            <select value={selectedHour} onChange={(e) => setSelectedHour(parseInt(e.target.value))}>
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        Hour {i} ({i.toString().padStart(2, '0')}:00 - {(i + 1).toString().padStart(2, '0')}:00)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                {students.length > 0 && (
                    <div className="statistics">
                        <div className="stat-card green">
                            <div className="stat-icon"><FaCheckCircle /></div>
                            <div className="stat-value">{presentCount}</div>
                            <div className="stat-label">PRESENT</div>
                        </div>
                        <div className="stat-card red">
                            <div className="stat-icon"><FaTimesCircle /></div>
                            <div className="stat-value">{absentCount}</div>
                            <div className="stat-label">ABSENT</div>
                        </div>
                        <div className="stat-card total">
                            <div className="stat-icon"><FaUsers /></div>
                            <div className="stat-value">{students.length}</div>
                            <div className="stat-label">TOTAL</div>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                {students.length > 0 && (
                    <div className="bulk-actions">
                        <button 
                            type="button" 
                            className="bulk-btn mark-all-present"
                            onClick={bulkMarkPresent}
                        >
                            Mark All Present
                        </button>
                        <button 
                            type="button" 
                            className="bulk-btn mark-all-absent"
                            onClick={bulkMarkAbsent}
                        >
                            Mark All Absent
                        </button>
                    </div>
                )}

                {/* Student List */}
                {loading ? (
                    <div className="loading">Loading students...</div>
                ) : students.length > 0 ? (
                    <div className="student-list-section">
                        <h3>Student Attendance <span className="count">({students.length} students)</span></h3>
                        <div className="student-list">
                            {students.map(student => (
                                <div 
                                    key={student.studentId}
                                    className={`student-row ${attendance[student.studentId] === 'Present' ? 'present' : 'absent'}`}
                                >
                                    <div className="student-info">
                                        <div className="roll-no">{student.rollNo}</div>
                                        <div className="student-name">{student.name}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`attendance-toggle ${attendance[student.studentId]}`}
                                        onClick={() => toggleAttendance(student.studentId)}
                                    >
                                        {attendance[student.studentId] === 'Present' ? (
                                            <>
                                                <FaCheckCircle /> Present
                                            </>
                                        ) : (
                                            <>
                                                <FaTimesCircle /> Absent
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="no-data">Select subject and section to see students</div>
                )}

                {/* Messages */}
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {/* Submit Button */}
                {students.length > 0 && (
                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading || submitted}
                        >
                            {loading ? 'Submitting...' : submitted ? 'Submitted ✓' : 'Submit Attendance'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default FacultyAttendanceMarker;
