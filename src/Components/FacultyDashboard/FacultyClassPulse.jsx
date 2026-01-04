import React from 'react';
import { FaGraduationCap, FaUserCheck, FaBookReader } from 'react-icons/fa';
import './FacultyClassPulse.css';

const FacultyClassPulse = ({ studentsCount = 0, materialsCount = 0 }) => {
    return (
        <div className="faculty-pulse-grid">
            <div className="f-pulse-card glass-panel">
                <div className="f-pulse-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}><FaGraduationCap /></div>
                <div className="f-pulse-info">
                    <span className="f-pulse-val">{studentsCount}</span>
                    <span className="f-pulse-label">Assigned Students</span>
                </div>
            </div>
            <div className="f-pulse-card glass-panel">
                <div className="f-pulse-icon" style={{ background: '#fdfce7', color: '#a16207' }}><FaBookReader /></div>
                <div className="f-pulse-info">
                    <span className="f-pulse-val">{materialsCount}</span>
                    <span className="f-pulse-label">Active Deployments</span>
                </div>
            </div>
            <div className="f-pulse-card glass-panel">
                <div className="f-pulse-icon" style={{ background: '#f0fdf4', color: '#15803d' }}><FaUserCheck /></div>
                <div className="f-pulse-info">
                    <span className="f-pulse-val">94%</span>
                    <span className="f-pulse-label">Positive Feedback</span>
                </div>
            </div>
        </div>
    );
};

export default FacultyClassPulse;
