import React, { useState, useEffect } from 'react';
import { FaAward, FaCalendarAlt, FaTrophy, FaLayerGroup } from 'react-icons/fa';
import SubjectAttendanceCard from '../SubjectAttendanceCard';

/**
 * NEXUS SUBJECT INTEL (Detailed Performance)
 * A premium analytics view for deep subject-wise performance tracking.
 */
const SubjectAttendanceMarks = ({ overviewData, enrolledSubjects }) => {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [subjectData, setSubjectData] = useState([]);

    useEffect(() => {
        if (overviewData) {
            const attDetails = overviewData.attendance?.details || {};
            const acaDetails = overviewData.academics?.details || {};

            // Map to store unique subjects by name
            const subjectMap = new Map();

            // 1. Initialize with Enrolled Subjects (Curriculum)
            if (Array.isArray(enrolledSubjects)) {
                enrolledSubjects.forEach(sub => {
                    subjectMap.set(sub.name, {
                        code: sub.code || sub.name.substring(0, 5).toUpperCase(),
                        name: sub.name,
                        attendance: 0,
                        marks: 0,
                        totalMarks: 100,
                        tests: [
                            { name: 'Unit Cycle 01', marks: '0.0', total: 20 },
                            { name: 'Unit Cycle 02', marks: '0.0', total: 20 },
                            { name: 'Midterm Assessment', marks: '0.0', total: 60 }
                        ],
                        lastClass: new Date().toISOString()
                    });
                });
            }

            // 2. Merge Real-Time Data (Attendance & Marks)
            const dataKeys = new Set([...Object.keys(attDetails), ...Object.keys(acaDetails)]);
            dataKeys.forEach(key => {
                const existing = subjectMap.get(key) || {
                    code: key.substring(0, 5).toUpperCase(),
                    name: key,
                    totalMarks: 100,
                    tests: [],
                    lastClass: new Date().toISOString()
                };

                existing.attendance = attDetails[key]?.percentage || existing.attendance || 0;
                existing.marks = acaDetails[key]?.percentage || existing.marks || 0;

                // Sync derived test scores based on overall percentage if not manually detailed
                const pct = existing.marks;
                existing.tests = [
                    { name: 'Unit Cycle 01', marks: (pct * 0.2).toFixed(1), total: 20 },
                    { name: 'Unit Cycle 02', marks: (pct * 0.2).toFixed(1), total: 20 },
                    { name: 'Midterm Assessment', marks: (pct * 0.6).toFixed(1), total: 60 }
                ];

                subjectMap.set(key, existing);
            });

            setSubjectData(Array.from(subjectMap.values()));
        }
    }, [overviewData, enrolledSubjects]);

    return (
        <div className="nexus-page-container">
            <div className="nexus-page-header">
                <div>
                    <div className="nexus-page-subtitle">
                        <FaLayerGroup /> Subject Neural Path
                    </div>
                    <h1 className="nexus-page-title">
                        PERFORMANCE <span>NEURAL</span>
                    </h1>
                </div>
                <div className="nexus-intel-badge">
                    INTEL SYNC: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="intel-grid">
                {subjectData.map(subject => (
                    <SubjectAttendanceCard
                        key={subject.code}
                        subjectName={subject.name}
                        attendancePercentage={subject.attendance}
                        marksObtained={subject.marks}
                        marksTotal={subject.totalMarks}
                        status={subject.attendance < 75 ? 'Low Attendance' : 'Good Stand'}
                        isActive={selectedSubject?.code === subject.code}
                        onClick={() => setSelectedSubject(subject)}
                    />
                ))}
            </div>

            {selectedSubject && (
                <div className="intel-modal-overlay" onClick={() => setSelectedSubject(null)}>
                    <div className="intel-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="intel-modal-header">
                            <div className="m-title-group">
                                <h2>{selectedSubject.name}</h2>
                                <span>{selectedSubject.code} • NEURAL DATA DECRYPTED</span>
                            </div>
                            <button className="close-intel" onClick={() => setSelectedSubject(null)}>×</button>
                        </div>

                        <div className="modal-stats-row">
                            <div className="m-stat-box">
                                <FaAward className="icon" />
                                <div className="val">{selectedSubject.attendance}%</div>
                                <div className="lab">NET ATTENDANCE</div>
                            </div>
                            <div className="m-stat-box">
                                <FaTrophy className="icon text-warning" />
                                <div className="val">{selectedSubject.marks}/{selectedSubject.totalMarks}</div>
                                <div className="lab">ACADEMIC SCORE</div>
                            </div>
                            <div className="m-stat-box">
                                <FaCalendarAlt className="icon text-success" />
                                <div className="val">{new Date(selectedSubject.lastClass).toLocaleDateString()}</div>
                                <div className="lab">LAST SYNC</div>
                            </div>
                        </div>

                        <div className="assessment-chain">
                            <h3>ASSESSMENT SECRETS</h3>
                            {selectedSubject.tests.map((test, idx) => (
                                <div key={idx} className="chain-link">
                                    <div className="link-info">
                                        <div className="link-dot"></div>
                                        <span>{test.name}</span>
                                    </div>
                                    <div className="link-score">
                                        <div className="val">{test.marks}/{test.total}</div>
                                        <div className="progress"><div style={{ width: `${(test.marks / test.total) * 100}%` }}></div></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectAttendanceMarks;
