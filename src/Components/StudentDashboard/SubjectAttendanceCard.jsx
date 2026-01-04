import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

const SubjectAttendanceCard = ({ subject, studentId, year, section }) => {
    const [attendanceData, setAttendanceData] = useState({
        present: 0,
        total: 0,
        percentage: 0,
        status: 'unknown',
        lastUpdated: null
    });

    useEffect(() => {
        fetchAttendance();
        const interval = setInterval(fetchAttendance, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, [subject, studentId]);

    const fetchAttendance = async () => {
        try {
            const records = await apiGet(`/api/attendance/student/${studentId}`);

            // Filter records for this specific subject
            const subjectRecords = records.filter(record =>
                record.subject === subject.name || record.subject === subject.code
            );

            if (subjectRecords.length > 0) {
                const presentCount = subjectRecords.reduce((count, record) => {
                    const studentRecord = record.students.find(s => s.studentId === studentId);
                    return count + (studentRecord && studentRecord.status === 'Present' ? 1 : 0);
                }, 0);

                const pct = (presentCount / subjectRecords.length) * 100;

                setAttendanceData({
                    present: presentCount,
                    total: subjectRecords.length,
                    percentage: pct,
                    status: pct >= 75 ? 'good' : pct >= 50 ? 'warning' : 'critical',
                    lastUpdated: new Date().toLocaleTimeString()
                });
            } else {
                setAttendanceData({
                    present: 0,
                    total: 0,
                    percentage: 0,
                    status: 'no-data',
                    lastUpdated: new Date().toLocaleTimeString()
                });
            }
        } catch (error) {
            console.error("Failed to fetch attendance for subject", error);
        }
    };

    const getStatusColor = () => {
        switch (attendanceData.status) {
            case 'good': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'critical': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    const getStatusIcon = () => {
        switch (attendanceData.status) {
            case 'good': return <FaCheckCircle />;
            case 'warning': return <FaExclamationTriangle />;
            case 'critical': return <FaTimesCircle />;
            default: return null;
        }
    };

    const getStatusText = () => {
        switch (attendanceData.status) {
            case 'good': return 'Good Standing';
            case 'warning': return 'Below Average';
            case 'critical': return 'Critical';
            default: return 'No Data';
        }
    };

    return (
        <div className="subject-card" style={{
            padding: '1.5rem',
            background: 'white',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            {/* Status indicator bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: getStatusColor(),
                transition: 'background 0.3s ease'
            }}></div>

            {/* Subject info */}
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
                    {subject.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{subject.code}</div>
            </div>

            {/* Attendance info */}
            {attendanceData.status !== 'no-data' ? (
                <div style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                            Attendance
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            color: getStatusColor(),
                            fontWeight: 600
                        }}>
                            {getStatusIcon()}
                            {getStatusText()}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.8rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: getStatusColor() }}>
                            {attendanceData.percentage.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            {attendanceData.present}/{attendanceData.total} classes
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${attendanceData.percentage}%`,
                            height: '100%',
                            background: getStatusColor(),
                            transition: 'all 0.5s ease',
                            borderRadius: '10px'
                        }}></div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'right' }}>
                        Updated: {attendanceData.lastUpdated}
                    </div>
                </div>
            ) : (
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No attendance records yet
                </div>
            )}

            {/* Action button */}
            <button style={{
                width: '100%',
                padding: '0.7rem',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
                onClick={() => window.location.hash = `#subject-${subject.id}`}
            >
                View Details →
            </button>
        </div>
    );
};

export default SubjectAttendanceCard;
