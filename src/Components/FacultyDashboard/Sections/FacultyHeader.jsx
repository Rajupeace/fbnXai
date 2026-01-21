import React from 'react';
import {
    FaGraduationCap, FaEnvelope, FaSignOutAlt,
    FaLayerGroup, FaBolt, FaChartLine, FaUserCheck, FaBullhorn, FaShieldAlt, FaUserGraduate
} from 'react-icons/fa';

/**
 * PREMIUM NEXUS HEADER (FACULTY EDITION)
 * Glassmorphism, interactive navigation, and real-time alerts.
 * Matches StudentDashboard UI/UX with Luxe Pearl theme.
 */
const FacultyHeader = ({
    facultyData,
    view,
    setView,
    onLogout,
    toggleMsgModal
}) => {

    const localHandleLogout = (e) => {
        e.preventDefault();
        if (window.confirm('Terminate faculty session and logout?')) {
            if (onLogout) {
                onLogout();
            } else {
                localStorage.clear();
                window.location.reload();
            }
        }
    };

    const navItems = [
        { id: 'overview', label: 'COMMAND HUB', icon: <FaChartLine />, color: '#6366f1' },
        { id: 'materials', label: 'MATERIALS', icon: <FaLayerGroup />, color: '#3b82f6' },
        { id: 'attendance', label: 'ATTENDANCE', icon: <FaUserCheck />, color: '#10b981' },
        { id: 'exams', label: 'EXAMS', icon: <FaShieldAlt />, color: '#f59e0b' },
        { id: 'schedule', label: 'SCHEDULE', icon: <FaBolt />, color: '#ec4899' },
        { id: 'students', label: 'STUDENTS', icon: <FaUserGraduate />, color: '#3b82f6' },
        { id: 'broadcast', label: 'BROADCAST', icon: <FaBullhorn />, color: '#f43f5e' },
        { id: 'messages', label: 'ANNOUNCEMENTS', icon: <FaEnvelope />, color: '#8b5cf6' },
        { id: 'settings', label: 'SYSTEM', icon: <FaGraduationCap />, color: '#64748b' }
    ];

    return (
        <header className="sd-header animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <div className="sd-brand-group">
                    <FaGraduationCap className="sd-brand-icon" style={{ fontSize: '2.4rem' }} />
                    <div>
                        <h1 className="sd-brand-name">FBN XAI</h1>
                        <span className="sd-brand-tag">FACULTY NEXUS</span>
                    </div>
                </div>

                <div className="sd-nav-scroll-container">
                    <nav className="sd-nav-bar">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`sd-nav-btn ${view === item.id ? 'active' : ''}`}
                                style={{ '--nav-color': item.color }}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="sd-actions">
                <div className="f-header-userinfo">
                    <div className="f-header-username">{facultyData.name || 'Faculty Member'}</div>
                    <div className="f-header-userdept">{facultyData.department || 'Academic Dept'}</div>
                </div>

                <div className="header-icon-stack" style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="f-msg-btn" onClick={toggleMsgModal}>
                        <FaEnvelope />
                        {/* {unreadCount > 0 && <span className="nexus-badge">1</span>} */}
                    </button>
                </div>

                <div style={{ width: '1px', height: '30px', background: '#f1f5f9', margin: '0 0.5rem' }}></div>

                <button onClick={localHandleLogout} className="f-logout-btn">
                    <FaSignOutAlt /> LOGOUT
                </button>
            </div>
        </header>
    );
};

export default FacultyHeader;
