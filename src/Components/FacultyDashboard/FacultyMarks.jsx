import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaUserGraduate, FaBook, FaCheck } from 'react-icons/fa';
import { apiGet, apiPost } from '../../utils/apiClient';
import './FacultyMarks.css';

const FacultyMarks = ({ facultyData }) => {
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [marksData, setMarksData] = useState({});
    const [originalMarksData, setOriginalMarksData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

    // Assessment structure with max marks
    const assessmentStructure = {
        cla: [
            { id: 'cla1', label: 'CLA 1', max: 20 },
            { id: 'cla2', label: 'CLA 2', max: 20 },
            { id: 'cla3', label: 'CLA 3', max: 20 },
            { id: 'cla4', label: 'CLA 4', max: 20 },
            { id: 'cla5', label: 'CLA 5', max: 20 }
        ],
        module1: [
            { id: 'm1t1', label: 'T1', max: 10 },
            { id: 'm1t2', label: 'T2', max: 10 },
            { id: 'm1t3', label: 'T3', max: 10 },
            { id: 'm1t4', label: 'T4', max: 10 }
        ],
        module2: [
            { id: 'm2t1', label: 'T1', max: 10 },
            { id: 'm2t2', label: 'T2', max: 10 },
            { id: 'm2t3', label: 'T3', max: 10 },
            { id: 'm2t4', label: 'T4', max: 10 }
        ]
    };

    useEffect(() => {
        initializeData();
    }, [facultyData]);

    useEffect(() => {
        if (selectedSubject && students.length > 0) {
            fetchMarks();
        }
    }, [selectedSubject, students]);

    const initializeData = async () => {
        try {
            // Get faculty's subject
            if (facultyData?.subject) {
                setSelectedSubject(facultyData.subject);
                setSubjects([{ id: facultyData.subject, name: facultyData.subject }]);
            }

            // Fetch students
            await fetchStudents();
        } catch (error) {
            console.error('Error initializing:', error);
            showMessage('Failed to load initial data', 'error');
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await apiGet(`/api/faculty/${facultyData.facultyId}/students`);
            console.log('Fetched students:', data);
            setStudents(data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
            showMessage('Failed to fetch students', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMarks = async () => {
        try {
            setLoading(true);
            console.log('Fetching marks for subject:', selectedSubject);

            const data = await apiGet(`/api/marks/${selectedSubject}/all`);
            console.log('Fetched marks data:', data);

            // Initialize marks structure for all students
            const organized = {};
            students.forEach(student => {
                organized[student.sid] = {};
                // Initialize all possible marks fields
                [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2].forEach(assessment => {
                    organized[student.sid][assessment.id] = '';
                });
            });

            // Fill in existing marks from database
            if (Array.isArray(data)) {
                data.forEach(mark => {
                    if (organized[mark.studentId]) {
                        organized[mark.studentId][mark.assessmentType] = mark.marks;
                    }
                });
            }

            setMarksData(organized);
            setOriginalMarksData(JSON.parse(JSON.stringify(organized)));
        } catch (error) {
            console.error('Error fetching marks:', error);

            // Initialize empty if fetch fails
            const empty = {};
            students.forEach(student => {
                empty[student.sid] = {};
                [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2].forEach(assessment => {
                    empty[student.sid][assessment.id] = '';
                });
            });
            setMarksData(empty);
            setOriginalMarksData(JSON.parse(JSON.stringify(empty)));
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, assessmentId, value) => {
        // Validate input
        const assessment = [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2]
            .find(a => a.id === assessmentId);

        if (assessment && value !== '' && (parseFloat(value) < 0 || parseFloat(value) > assessment.max)) {
            showMessage(`Marks cannot exceed ${assessment.max}`, 'error');
            return;
        }

        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [assessmentId]: value
            }
        }));
    };

    const saveMarks = async () => {
        try {
            setSaving(true);
            console.log('Saving marks...');

            // Prepare marks array for bulk save
            const marksArray = [];

            Object.keys(marksData).forEach(studentId => {
                Object.keys(marksData[studentId]).forEach(assessmentId => {
                    const markValue = marksData[studentId][assessmentId];

                    // Only include marks that have values
                    if (markValue !== '' && markValue !== null && markValue !== undefined) {
                        marksArray.push({
                            studentId,
                            subject: selectedSubject,
                            assessmentType: assessmentId,
                            marks: parseFloat(markValue)
                        });
                    }
                });
            });

            console.log('Marks to save:', marksArray);

            if (marksArray.length === 0) {
                showMessage('No marks to save', 'warning');
                return;
            }

            // Call API to save marks
            const response = await apiPost('/api/marks/bulk-save', { marks: marksArray });
            console.log('Save response:', response);

            if (response.success || response.modified >= 0) {
                showMessage(`Successfully saved marks for ${marksArray.length} entries`, 'success');
                setEditMode(false);
                setOriginalMarksData(JSON.parse(JSON.stringify(marksData)));

                // Refresh marks data
                await fetchMarks();
            } else {
                showMessage('Failed to save marks', 'error');
            }
        } catch (error) {
            console.error('Error saving marks:', error);
            showMessage('Error saving marks: ' + (error.message || 'Unknown error'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setMarksData(JSON.parse(JSON.stringify(originalMarksData)));
        setEditMode(false);
        showMessage('Changes cancelled', 'info');
    };

    const calculateTotal = (studentId) => {
        const marks = marksData[studentId] || {};
        let total = 0;
        let count = 0;

        Object.values(marks).forEach(mark => {
            if (mark !== '' && mark !== null && mark !== undefined) {
                total += parseFloat(mark);
                count++;
            }
        });

        return { total, count };
    };

    const showMessage = (text, type) => {
        setSaveMessage({ text, type });
        setTimeout(() => setSaveMessage({ text: '', type: '' }), 4000);
    };

    if (loading) {
        return (
            <div className="faculty-marks-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading marks data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="faculty-marks-container animate-fade-in">
            <div className="nexus-mesh-bg"></div>

            {/* Header */}
            <header className="f-view-header">
                <div>
                    <h2>MARKS <span>MANAGEMENT</span></h2>
                    <p className="nexus-subtitle">Subject-wise marks entry: CLA 1-5, Module 1 & 2 Targets</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {editMode ? (
                        <>
                            <button
                                className="f-node-btn success"
                                onClick={saveMarks}
                                disabled={saving}
                            >
                                {saving ? '⏳ Saving...' : <><FaSave /> Save All Marks</>}
                            </button>
                            <button
                                className="f-node-btn secondary"
                                onClick={cancelEdit}
                                disabled={saving}
                            >
                                <FaTimes /> Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className="f-node-btn primary"
                            onClick={() => setEditMode(true)}
                        >
                            <FaEdit /> Edit Marks
                        </button>
                    )}
                </div>
            </header>

            {/* Save Message */}
            {saveMessage.text && (
                <div className={`save-message ${saveMessage.type}`}>
                    <FaCheck /> {saveMessage.text}
                </div>
            )}

            {/* Subject Info Bar */}
            <div className="subject-info-bar">
                <FaBook />
                <span>Subject: <strong>{selectedSubject}</strong></span>
                <span className="student-count">
                    <FaUserGraduate /> {students.length} Students
                </span>
            </div>

            {/* Marks Table */}
            {students.length > 0 ? (
                <div className="marks-table-wrapper">
                    <table className="comprehensive-marks-table">
                        <thead>
                            <tr>
                                <th rowSpan="2" className="sticky-col">Roll No</th>
                                <th rowSpan="2" className="sticky-col-2">Student Name</th>
                                <th colSpan="5" className="section-header cla-header">CLA Tests (20 each)</th>
                                <th colSpan="4" className="section-header module1-header">Module 1 Targets (10 each)</th>
                                <th colSpan="4" className="section-header module2-header">Module 2 Targets (10 each)</th>
                                <th rowSpan="2" className="total-col">Total</th>
                                <th rowSpan="2" className="percent-col">%</th>
                            </tr>
                            <tr>
                                {assessmentStructure.cla.map(a => (
                                    <th key={a.id} className="sub-header">{a.label}</th>
                                ))}
                                {assessmentStructure.module1.map(a => (
                                    <th key={a.id} className="sub-header">{a.label}</th>
                                ))}
                                {assessmentStructure.module2.map(a => (
                                    <th key={a.id} className="sub-header">{a.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const { total } = calculateTotal(student.sid);
                                const maxTotal = 180; // 100 + 40 + 40
                                const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

                                return (
                                    <tr key={student.sid}>
                                        <td className="sticky-col">{student.sid}</td>
                                        <td className="sticky-col-2 student-name-cell">
                                            <FaUserGraduate />
                                            {student.studentName || student.name}
                                        </td>

                                        {/* CLA Marks */}
                                        {assessmentStructure.cla.map(assessment => (
                                            <td key={assessment.id} className="mark-cell cla-cell">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={assessment.max}
                                                        step="0.5"
                                                        value={marksData[student.sid]?.[assessment.id] || ''}
                                                        onChange={(e) => handleMarkChange(student.sid, assessment.id, e.target.value)}
                                                        className="mark-input"
                                                        placeholder="0"
                                                    />
                                                ) : (
                                                    <span className="mark-display">
                                                        {marksData[student.sid]?.[assessment.id] || '-'}
                                                    </span>
                                                )}
                                            </td>
                                        ))}

                                        {/* Module 1 Targets */}
                                        {assessmentStructure.module1.map(assessment => (
                                            <td key={assessment.id} className="mark-cell module1-cell">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={assessment.max}
                                                        step="0.5"
                                                        value={marksData[student.sid]?.[assessment.id] || ''}
                                                        onChange={(e) => handleMarkChange(student.sid, assessment.id, e.target.value)}
                                                        className="mark-input"
                                                        placeholder="0"
                                                    />
                                                ) : (
                                                    <span className="mark-display">
                                                        {marksData[student.sid]?.[assessment.id] || '-'}
                                                    </span>
                                                )}
                                            </td>
                                        ))}

                                        {/* Module 2 Targets */}
                                        {assessmentStructure.module2.map(assessment => (
                                            <td key={assessment.id} className="mark-cell module2-cell">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={assessment.max}
                                                        step="0.5"
                                                        value={marksData[student.sid]?.[assessment.id] || ''}
                                                        onChange={(e) => handleMarkChange(student.sid, assessment.id, e.target.value)}
                                                        className="mark-input"
                                                        placeholder="0"
                                                    />
                                                ) : (
                                                    <span className="mark-display">
                                                        {marksData[student.sid]?.[assessment.id] || '-'}
                                                    </span>
                                                )}
                                            </td>
                                        ))}

                                        <td className="total-col">
                                            <strong>{total.toFixed(1)}</strong>
                                        </td>
                                        <td className="percent-col">
                                            <span className={`percentage-badge ${percentage >= 75 ? 'high' : percentage >= 50 ? 'medium' : 'low'}`}>
                                                {percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <FaUserGraduate size={64} />
                    <h3>No Students Found</h3>
                    <p>No students assigned to this subject yet.</p>
                </div>
            )}

            {/* Help Info */}
            <div className="marks-info-footer">
                <p><strong>Note:</strong> CLA tests are 20 marks each, Module targets are 10 marks each. Total maximum: 180 marks per student per subject.</p>
            </div>
        </div>
    );
};

export default FacultyMarks;
