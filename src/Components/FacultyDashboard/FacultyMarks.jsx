import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaUserGraduate, FaBook, FaCheck, FaFilter, FaUsers, FaExclamationTriangle, FaFileDownload } from 'react-icons/fa';
import { apiGet, apiPost } from '../../utils/apiClient';
import './FacultyMarks.css';

const FacultyMarks = ({ facultyData }) => {
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedSection, setSelectedSection] = useState({ year: '', section: '' });
    const [availableSections, setAvailableSections] = useState([]);
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



    const initializeData = async () => {
        try {
            console.log('=== INITIALIZING FACULTY MARKS ===');
            console.log('Full facultyData received:', JSON.stringify(facultyData, null, 2));

            // Get faculty's sections from multiple sources
            let sections = extractSectionsFromData(facultyData);

            // If no sections found in facultyData, try fetching fresh from API
            if (sections.length === 0 && facultyData?.facultyId) {
                console.log('⚠️ No sections in facultyData, fetching from API...');
                try {
                    const response = await apiGet(`/api/faculty/${facultyData.facultyId}`);
                    console.log('Faculty API response:', response);
                    sections = extractSectionsFromData(response);
                } catch (apiError) {
                    console.error('Failed to fetch faculty from API:', apiError);
                }
            }

            console.log('✅ Final sections to use:', sections);
            setAvailableSections(sections);

            // Auto-select first section if available
            if (sections.length > 0) {
                setSelectedSection(sections[0]);
                console.log('✅ Auto-selected section:', sections[0]);
            } else {
                console.error('❌ NO SECTIONS AVAILABLE!');
                console.log('💡 Check database - Faculty document should have assignments field with year/section');
            }

            // Fetch all students
            await fetchStudents();
        } catch (error) {
            console.error('Error initializing:', error);
            showMessage('Failed to load initial data', 'error');
        }
    };

    const extractSectionsFromData = (data) => {
        if (!data) return [];

        // Method 1: Check assignments array (includes Subject)
        if (data.assignments && Array.isArray(data.assignments) && data.assignments.length > 0) {
            const sectionsMap = new Map();
            data.assignments.forEach(assignment => {
                const year = parseInt(assignment.year || assignment.Year || assignment.classYear);
                const section = String(assignment.section || assignment.Section || assignment.classSection).toUpperCase();
                const subject = assignment.subject || assignment.Subject || data.subject || 'General';

                if (year && section && section !== 'UNDEFINED') {
                    const key = `${year}-${section}-${subject}`;
                    if (!sectionsMap.has(key)) {
                        sectionsMap.set(key, { year, section, subject });
                    }
                }
            });
            return Array.from(sectionsMap.values());
        }

        // Method 2: Check sections array (Fallbacks)
        const possibleArrays = [data.sections, data.assignedSections, data.teaching];
        for (const arr of possibleArrays) {
            if (arr && Array.isArray(arr) && arr.length > 0) {
                return arr.map(s => ({
                    year: parseInt(s.year || s.Year),
                    section: String(s.section || s.Section).toUpperCase(),
                    subject: data.subject || 'General'
                }));
            }
        }

        // Method 3: Direct fields
        if (data.year && data.section) {
            return [{
                year: parseInt(data.year),
                section: String(data.section).toUpperCase(),
                subject: data.subject || 'General'
            }];
        }

        if (data.Year && data.Section) {
            return [{
                year: parseInt(data.Year),
                section: String(data.Section).toUpperCase(),
                subject: data.subject || 'General'
            }];
        }

        return [];
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            console.log('=== FETCHING STUDENTS ===');
            console.log('Faculty ID:', facultyData.facultyId);

            const data = await apiGet(`/api/faculty-stats/${facultyData.facultyId}/students`);
            console.log(`✅ Fetched ${data?.length || 0} total students`);

            if (data && data.length > 0) {
                console.log('Sample student data:', data[0]);
                console.log('Student fields:', Object.keys(data[0]));
            }

            setAllStudents(data || []);
            filterStudentsBySection(data || [], selectedSection);
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            setAllStudents([]);
            showMessage('Failed to fetch students', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterStudentsBySection = (studentList, section) => {
        if (!section.year || !section.section) {
            console.log('⚠️ No section selected');
            setStudents([]);
            return;
        }

        console.log('=== FILTERING STUDENTS ===');
        console.log(`Target: Year ${section.year}, Section ${section.section}`);
        console.log(`Total students to filter: ${studentList.length}`);

        const filtered = studentList.filter(student => {
            // Try multiple field name variations
            const studentYear = student.year || student.Year || student.currentYear || student.academicYear;
            const studentSection = student.section || student.Section || student.class || student.classSection;

            const yearMatch = String(studentYear) === String(section.year);
            const sectionMatch = String(studentSection).toUpperCase().trim() === String(section.section).toUpperCase().trim();

            const matches = yearMatch && sectionMatch;

            if (!matches && studentList.indexOf(student) < 5) {
                // Log first 5 non-matching students for debugging
                console.log(`Student ${student.sid || student.studentId}: Year=${studentYear}, Section=${studentSection}, Match=${matches}`);
            }

            return matches;
        });

        console.log(`✅ Filtered: ${filtered.length} students for Year ${section.year} Section ${section.section}`);

        if (filtered.length === 0) {
            console.warn('⚠️ NO STUDENTS MATCHED!');
            console.log('Available year/section combinations in data:');
            const combinations = new Set();
            studentList.slice(0, 10).forEach(s => {
                const y = s.year || s.Year || s.currentYear;
                const sec = s.section || s.Section || s.class;
                combinations.add(`Year ${y}, Section ${sec}`);
            });
            console.log([...combinations]);
        }

        setStudents(filtered);
    };

    const handleSectionChange = (newSection) => {
        setSelectedSection(newSection);
        filterStudentsBySection(allStudents, newSection);
        setEditMode(false);
    };

    const fetchMarks = async () => {
        try {
            setLoading(true);
            const subject = selectedSection.subject || facultyData?.subject || '';
            console.log('Fetching marks for:', { subject, year: selectedSection.year, section: selectedSection.section });

            const data = await apiGet(`/api/marks/${encodeURIComponent(subject)}/all`);
            console.log('Fetched marks data:', data);

            // Initialize marks structure
            const organized = {};
            students.forEach(student => {
                const sid = student.sid || student.studentId;
                organized[sid] = {};
                [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2].forEach(assessment => {
                    organized[sid][assessment.id] = '';
                });
            });

            // Fill in existing marks
            if (Array.isArray(data)) {
                data.forEach(mark => {
                    const sid = mark.studentId || mark.sid;
                    if (organized[sid]) {
                        organized[sid][mark.assessmentType] = mark.marks;
                    }
                });
            }

            setMarksData(organized);
            setOriginalMarksData(JSON.parse(JSON.stringify(organized)));
        } catch (error) {
            console.error('Error fetching marks:', error);

            // Initialize empty
            const empty = {};
            students.forEach(student => {
                const sid = student.sid || student.studentId;
                empty[sid] = {};
                [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2].forEach(assessment => {
                    empty[sid][assessment.id] = '';
                });
            });
            setMarksData(empty);
            setOriginalMarksData(JSON.parse(JSON.stringify(empty)));
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, assessmentId, value) => {
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
            const marksArray = [];

            Object.keys(marksData).forEach(studentId => {
                Object.keys(marksData[studentId]).forEach(assessmentId => {
                    const markValue = marksData[studentId][assessmentId];
                    if (markValue !== '' && markValue !== null && markValue !== undefined) {
                        marksArray.push({
                            studentId,
                            subject: selectedSection.subject || facultyData?.subject || '',
                            year: selectedSection.year,
                            section: selectedSection.section,
                            assessmentType: assessmentId,
                            marks: parseFloat(markValue)
                        });
                    }
                });
            });

            if (marksArray.length === 0) {
                showMessage('No marks to save', 'warning');
                return;
            }

            const response = await apiPost('/api/marks/bulk-save', { marks: marksArray });
            if (response.success || response.modified >= 0) {
                showMessage(`✅ Successfully saved marks for ${marksArray.length} entries`, 'success');
                setEditMode(false);
                setOriginalMarksData(JSON.parse(JSON.stringify(marksData)));
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
        Object.values(marks).forEach(mark => {
            if (mark !== '' && mark !== null && mark !== undefined) {
                total += parseFloat(mark);
            }
        });
        return { total };
    };

    const showMessage = (text, type) => {
        setSaveMessage({ text, type });
        setTimeout(() => setSaveMessage({ text: '', type: '' }), 4000);
    };

    // Show debug message if no sections
    useEffect(() => {
        initializeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facultyData]);

    useEffect(() => {
        if (selectedSection.year && selectedSection.section && students.length > 0) {
            fetchMarks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSection, students]);

    // CSV Export Logic
    const handleDownloadCSV = () => {
        if (!students || students.length === 0) return alert('No students to export');

        const headers = ['Student ID', 'Student Name'];
        // Use assessmentStructure to build dynamic columns
        if (assessmentStructure.cla) assessmentStructure.cla.forEach(a => headers.push(a.label));
        if (assessmentStructure.module1) assessmentStructure.module1.forEach(a => headers.push(a.label));
        if (assessmentStructure.module2) assessmentStructure.module2.forEach(a => headers.push(a.label));

        let csv = headers.join(',') + '\n';

        students.forEach(s => {
            const sid = s.sid || s.studentId;
            const name = s.studentName || s.name || 'Unknown';
            // Escape name for CSV
            const row = [sid, `"${name}"`];

            if (assessmentStructure.cla) assessmentStructure.cla.forEach(a => row.push(marksData[sid]?.[a.id] || 0));
            if (assessmentStructure.module1) assessmentStructure.module1.forEach(a => row.push(marksData[sid]?.[a.id] || 0));
            if (assessmentStructure.module2) assessmentStructure.module2.forEach(a => row.push(marksData[sid]?.[a.id] || 0));

            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Marks_${selectedSection.subject || 'Subject'}_${selectedSection.year}-${selectedSection.section}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (availableSections.length === 0) {
        return (
            <div className="faculty-marks-container">
                <div className="nexus-mesh-bg"></div>
                <div className="empty-state">
                    <FaExclamationTriangle size={64} style={{ color: '#f59e0b' }} />
                    <h3>No Teaching Assignments Found</h3>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>To enter marks, you need to set up your teaching assignments first.</p>

                    <div style={{ marginTop: '2rem', padding: '2rem', background: '#eff6ff', borderRadius: '16px', border: '2px solid #3b82f6', maxWidth: '600px', textAlign: 'left' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaBook /> How to Set Up Teaching Assignments:
                        </h4>
                        <ol style={{ margin: '0', paddingLeft: '1.5rem', color: '#1e293b', lineHeight: '1.8' }}>
                            <li>Click on <strong>"Settings"</strong> in the sidebar</li>
                            <li>Go to the <strong>"Teaching"</strong> tab</li>
                            <li>Add your classes by entering:
                                <ul style={{ marginTop: '0.5rem' }}>
                                    <li>Year (1-4)</li>
                                    <li>Branch (CSE, IT, ECE, etc.)</li>
                                    <li>Section (1-20 or A-G)</li>
                                    <li>Subject Name</li>
                                </ul>
                            </li>
                            <li>Click <strong>"Add Class"</strong></li>
                            <li>Return to this Marks section</li>
                        </ol>
                    </div>

                    <button
                        onClick={() => window.location.hash = '#settings'}
                        className="f-node-btn primary"
                        style={{ marginTop: '2rem', padding: '1rem 2rem', fontSize: '1.1rem' }}
                    >
                        <FaEdit /> Go to Settings
                    </button>
                </div>
            </div>
        );
    }

    if (loading && students.length === 0) {
        return (
            <div className="faculty-marks-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading students data...</p>
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
                    <p className="nexus-subtitle">Section-wise marks entry for {facultyData?.subject || 'your subject'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {editMode ? (
                        <>
                            <button className="f-node-btn success" onClick={saveMarks} disabled={saving}>
                                {saving ? '⏳ Saving...' : <><FaSave /> Save All Marks</>}
                            </button>
                            <button className="f-node-btn secondary" onClick={cancelEdit} disabled={saving}>
                                <FaTimes /> Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="f-node-btn outline" onClick={handleDownloadCSV} disabled={students.length === 0} style={{ marginRight: '0.5rem', background: '#e2e8f0', color: '#0f172a' }}>
                                <FaFileDownload /> CSV Export
                            </button>
                            <button className="f-node-btn primary" onClick={() => setEditMode(true)} disabled={students.length === 0}>
                                <FaEdit /> Edit Marks
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Save Message */}
            {saveMessage.text && (
                <div className={`save-message ${saveMessage.type}`}>
                    <FaCheck /> {saveMessage.text}
                </div>
            )}

            {/* Section Filter */}
            <div className="section-filter-bar">
                <div className="filter-label">
                    <FaFilter /> <strong>Your Assigned Sections:</strong>
                </div>
                <div className="section-buttons">
                    {availableSections.map((sec, index) => (
                        <button
                            key={index}
                            className={`section-btn ${selectedSection.year === sec.year && selectedSection.section === sec.section && selectedSection.subject === sec.subject ? 'active' : ''}`}
                            onClick={() => handleSectionChange(sec)}
                        >
                            <FaUsers /> Year {sec.year} - Section {sec.section}
                            {sec.subject && <span style={{ display: 'block', fontSize: '0.8em', opacity: 0.8 }}>{sec.subject}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subject Info Bar */}
            <div className="subject-info-bar">
                <FaBook />
                <span>Subject: <strong>{selectedSection.subject || facultyData?.subject || 'N/A'}</strong></span>
                <span className="section-badge">
                    Year {selectedSection.year} - Section {selectedSection.section}
                </span>
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
                                {assessmentStructure.cla.map(a => <th key={a.id} className="sub-header">{a.label}</th>)}
                                {assessmentStructure.module1.map(a => <th key={a.id} className="sub-header">{a.label}</th>)}
                                {assessmentStructure.module2.map(a => <th key={a.id} className="sub-header">{a.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const sid = student.sid || student.studentId;
                                const { total } = calculateTotal(sid);
                                const maxTotal = 180;
                                const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

                                return (
                                    <tr key={sid}>
                                        <td className="sticky-col">{sid}</td>
                                        <td className="sticky-col-2 student-name-cell">
                                            <FaUserGraduate />
                                            {student.studentName || student.name}
                                        </td>

                                        {assessmentStructure.cla.map(assessment => (
                                            <td key={assessment.id} className="mark-cell cla-cell">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={assessment.max}
                                                        step="0.5"
                                                        value={marksData[sid]?.[assessment.id] || ''}
                                                        onChange={(e) => handleMarkChange(sid, assessment.id, e.target.value)}
                                                        className="mark-input"
                                                        placeholder="0"
                                                    />
                                                ) : (
                                                    <span className="mark-display">{marksData[sid]?.[assessment.id] || '-'}</span>
                                                )}
                                            </td>
                                        ))}

                                        {assessmentStructure.module1.map(assessment => (
                                            <td key={assessment.id} className="mark-cell module1-cell">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={assessment.max}
                                                        step="0.5"
                                                        value={marksData[sid]?.[assessment.id] || ''}
                                                        onChange={(e) => handleMarkChange(sid, assessment.id, e.target.value)}
                                                        className="mark-input"
                                                        placeholder="0"
                                                    />
                                                ) : (
                                                    <span className="mark-display">{marksData[sid]?.[assessment.id] || '-'}</span>
                                                )}
                                            </td>
                                        ))}

                                        {assessmentStructure.module2.map(assessment => (
                                            <td key={assessment.id} className="mark-cell module2-cell">
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={assessment.max}
                                                        step="0.5"
                                                        value={marksData[sid]?.[assessment.id] || ''}
                                                        onChange={(e) => handleMarkChange(sid, assessment.id, e.target.value)}
                                                        className="mark-input"
                                                        placeholder="0"
                                                    />
                                                ) : (
                                                    <span className="mark-display">{marksData[sid]?.[assessment.id] || '-'}</span>
                                                )}
                                            </td>
                                        ))}

                                        <td className="total-col"><strong>{total.toFixed(1)}</strong></td>
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
                    <p>No students found for Year {selectedSection.year} Section {selectedSection.section}</p>
                </div>
            )}

            {/* Help Info */}
            <div className="marks-info-footer">
                <p><strong>Note:</strong> You are viewing marks for <strong>Year {selectedSection.year} Section {selectedSection.section}</strong>. Change section using buttons above.</p>
                <p><strong>Assessment:</strong> CLA tests are 20 marks each, Module targets are 10 marks each. Total: 180 marks.</p>
            </div>
        </div>
    );
};

export default FacultyMarks;
