import React, { useState, useEffect, useCallback } from 'react';
import { FaMapMarkerAlt, FaChalkboardTeacher, FaBook, FaBolt, FaHistory, FaChevronRight, FaPlayCircle, FaCheckCircle, FaFlask } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';
import StudentLabsSchedule from './StudentLabsSchedule';

/**
 * CHRONOS PROTOCOL v4 (Student Schedule)
 * A mission-critical timeline interface for daily academic objectives.
 */
const StudentSchedule = ({ studentData }) => {
    const [subView, setSubView] = useState('theory'); // 'theory' or 'labs'
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1); // Monday if Sunday

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekDays = daysOfWeek.filter(day => day !== 'Sunday');

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                year: studentData.year,
                section: studentData.section,
                branch: studentData.branch
            });
            const response = await apiGet(`/api/schedule?${queryParams.toString()}`);
            if (response && response.length > 0) {
                setSchedule(response);
            } else {
                setSchedule([]);
            }
        } catch (error) {
            console.error('Chronos Sync Failed:', error);
            setSchedule([]);
        } finally {
            setLoading(false);
        }
    }, [studentData]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const isClassOngoing = (timeRange) => {
        if (!timeRange) return false;
        try {
            const [startStr, endStr] = timeRange.split(' - ');
            const now = new Date();
            const start = new Date();
            const end = new Date();

            const [sH, sM] = startStr.split(':');
            const [eH, eM] = endStr.split(':');

            start.setHours(parseInt(sH), parseInt(sM), 0);
            end.setHours(parseInt(eH), parseInt(eM), 0);

            return now >= start && now <= end;
        } catch (e) {
            return false;
        }
    };

    const isClassPast = (timeRange) => {
        if (!timeRange) return false;
        try {
            const [, endStr] = timeRange.split(' - ');
            const now = new Date();
            const end = new Date();
            const [eH, eM] = endStr.split(':');
            end.setHours(parseInt(eH), parseInt(eM), 0);
            return now > end;
        } catch (e) {
            return false;
        }
    };

    const getTodaySchedule = () => {
        const todayStr = daysOfWeek[selectedDay];
        return schedule.filter(item => item.day === todayStr)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    if (loading) {
        return (
            <div className="nexus-schedule-loading">
                <div className="nexus-loading-ring"></div>
                <div className="loading-text">CALIBRATING TEMPORAL MAP...</div>
            </div>
        );
    }

    const todayClasses = getTodaySchedule();

    return (
        <div className="chronos-protocol-container">
            {/* Header Area */}
            <div className="chronos-header">
                <div className="header-left">
                    <div className="protocol-tag"><FaBolt /> Temporal Directives</div>
                    <h1>CHRONOS <span className="highlight">MAP</span></h1>
                </div>
                <div className="chronos-meta">
                    <div className="meta-item">
                        <span className="lab">SYSTEM STATUS</span>
                        <span className="val pulse-green">ACTIVE</span>
                    </div>
                    <div className="meta-item">
                        <span className="lab">SECTOR</span>
                        <span className="val">{studentData.section}</span>
                    </div>
                </div>
            </div>

            {/* Sub-view Selector */}
            <div className="nexus-glass-pills mb-10">
                <button
                    onClick={() => setSubView('theory')}
                    className={`nexus-pill ${subView === 'theory' ? 'active' : ''}`}
                >
                    <FaBook /> THEORY DIRECTIVES
                </button>
                <button
                    onClick={() => setSubView('labs')}
                    className={`nexus-pill ${subView === 'labs' ? 'active' : ''}`}
                >
                    <FaFlask /> FORGE SESSIONS
                </button>
            </div>

            {subView === 'theory' ? (
                <>
                    {/* Day Selector Navigation */}
                    <div className="chronos-day-nav">
                        {weekDays.map((day) => {
                            const idx = daysOfWeek.indexOf(day);
                            const isToday = new Date().getDay() === idx;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(idx)}
                                    className={`chronos-day-btn ${selectedDay === idx ? 'active' : ''}`}
                                >
                                    <span className="day-name">{day.toUpperCase()}</span>
                                    {isToday && <span className="today-badge">SYNCED</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Timeline View */}
                    <div className="chronos-timeline">
                        {todayClasses.length > 0 ? (
                            todayClasses.map((item, index) => {
                                const ongoing = isClassOngoing(item.time);
                                const past = isClassPast(item.time);
                                return (
                                    <div key={index} className={`chronos-event-card ${ongoing ? 'ongoing' : ''} ${past ? 'past' : ''}`}>
                                        <div className="event-time">
                                            <span className="time-val">{item.time}</span>
                                            <div className="time-line">
                                                <div className={`time-dot ${ongoing ? 'glowing' : ''} ${past ? 'completed' : ''}`}>
                                                    {ongoing && <FaPlayCircle />}
                                                    {past && <FaCheckCircle />}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="event-content">
                                            <div className="event-header">
                                                <span className={`event-tag ${item.type?.toLowerCase() || 'theory'}`}>{item.type?.toUpperCase() || 'THEORY'}</span>
                                                {ongoing && <span className="event-tag live">LIVE NOW</span>}
                                                {past && <span className="event-tag done">COMPLETED</span>}
                                            </div>
                                            <h3 className="event-title">{item.subject}</h3>
                                            <div className="event-footer">
                                                <div className="ef-item"><FaChalkboardTeacher /> {item.faculty}</div>
                                                <div className="ef-item"><FaMapMarkerAlt /> ROOM: {item.room}</div>
                                            </div>
                                        </div>
                                        <div className="event-action">
                                            <button className="nexus-context-btn"><FaChevronRight /></button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="chronos-empty-state">
                                <div className="empty-icon"><FaHistory /></div>
                                <h3>TEMPORAL ANOMALY</h3>
                                <p>No active directives detected for this timestamp. Optimal for deep study or system recharge.</p>
                                <button onClick={fetchSchedule} className="re-sync-btn">RE-SYNC TEMPORAL STREAM</button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <StudentLabsSchedule studentData={studentData} />
            )}
        </div>
    );
};

export default StudentSchedule;
