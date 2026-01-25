import React from 'react';
import {
    FaGraduationCap, FaSignOutAlt, FaRocket, FaBook, FaChartBar, FaPen, FaShieldAlt, FaClipboardList, FaBullhorn, FaRobot
} from 'react-icons/fa';

/**
 * PREMIUM NEXUS HEADER
 * Glassmorphism, interactive navigation, and real-time alerts.
 */
const StudentHeader = ({
    userData,
    tasks,
    view,
    setView,
    unreadCount,
    onLogout
}) => {

    const localHandleLogout = (e) => {
        e.preventDefault();
        if (window.confirm('Terminate current session and logout?')) {
            if (onLogout) {
                onLogout();
            } else {
                localStorage.clear();
                window.location.reload();
            }
        }
    };

    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: <FaChartBar /> },
        { id: 'semester', label: 'Classroom', icon: <FaBook /> },
        { id: 'journal', label: 'My Notes', icon: <FaPen /> },
        { id: 'marks', label: 'Grades', icon: <FaChartBar /> },
        { id: 'schedule', label: 'Schedule', icon: <FaClipboardList /> },
        { id: 'faculty', label: 'Faculty', icon: <FaGraduationCap /> },
        { id: 'exams', label: 'Exams', icon: <FaShieldAlt /> },
        { id: 'ai-agent', label: 'AI Tutor', icon: <FaRobot /> },
        { id: 'advanced', label: 'Advanced', icon: <FaRocket /> },
        { id: 'settings', label: 'Settings', icon: <FaShieldAlt /> }
    ];

    return (
        <header className="sd-header">
            <div className="sd-header-left">
                <div className="sd-brand-group">
                    <FaGraduationCap className="sd-brand-icon" />
                    <div>
                        <h1 className="sd-brand-name brand-title">Friendly Notebook</h1>
                        <span className="brand-subtitle">Student Dashboard</span>
                    </div>
                </div>

                <div className="sd-nav-scroll-container">
                    <nav className="sd-nav-bar">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`sd-nav-btn ${view === item.id ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="sd-actions">
                <div className="header-user-info">
                    <div className="user-name">{userData.studentName}</div>
                    <div className="user-meta">{userData.sid} • YEAR {userData.year}</div>
                </div>

                <div className="header-icon-stack">
                    {/* Buttons removed as modals are not implemented/used */}
                </div>

                <button onClick={localHandleLogout} className="nexus-logout-btn">
                    <FaSignOutAlt /> <span>LOGOUT</span>
                </button>
            </div>
        </header>
    );
};

export default StudentHeader;
