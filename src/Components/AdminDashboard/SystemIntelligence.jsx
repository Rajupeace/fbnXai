import React from 'react';
import { FaBrain, FaRegLightbulb, FaShieldAlt, FaBolt } from 'react-icons/fa';
import './SystemIntelligence.css';

const SystemIntelligence = () => {
    return (
        <div className="intel-grid">
            <div className="intel-card glass-panel highlight-intel">
                <div className="intel-icon"><FaBrain /></div>
                <div className="intel-content">
                    <h4>Learning Efficiency</h4>
                    <p>Student engagement in Year 2 CSE is up by 14% this week. Consider releasing Module 5 early.</p>
                </div>
                <div className="intel-badge">AI INSIGHT</div>
            </div>

            <div className="intel-card glass-panel">
                <div className="intel-icon" style={{ color: '#f59e0b' }}><FaRegLightbulb /></div>
                <div className="intel-content">
                    <h4>Content Optimization</h4>
                    <p>Video materials for "Data Structures" are being frequently paused at 12:40. Clarity check recommended.</p>
                </div>
            </div>

            <div className="intel-card glass-panel">
                <div className="intel-icon" style={{ color: '#10b981' }}><FaShieldAlt /></div>
                <div className="intel-content">
                    <h4>Security Status</h4>
                    <p>Cluster 3 is running at 99.9% uptime. No unauthorized access attempts detected in 48h.</p>
                </div>
            </div>

            <div className="intel-card glass-panel">
                <div className="intel-icon" style={{ color: '#3b82f6' }}><FaBolt /></div>
                <div className="intel-content">
                    <h4>Automated Tasks</h4>
                    <p>Successfully processed 42 bulk uploads and synchronized 128 material nodes today.</p>
                </div>
            </div>
        </div>
    );
};

export default SystemIntelligence;
