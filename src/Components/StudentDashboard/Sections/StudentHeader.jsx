import React from 'react';
import {
    FaGraduationCap, FaSignOutAlt, FaRocket, FaBook, FaChartBar, FaPen, FaShieldAlt, FaClipboardList, FaBullhorn
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
        { id: 'overview', label: 'HUB', icon: <FaChartBar /> },
        { id: 'semester', label: 'ACADEMIA', icon: <FaBook /> },
        { id: 'journal', label: 'JOURNAL', icon: <FaPen /> },
        { id: 'marks', label: 'PERF', icon: <FaChartBar /> },
        { id: 'schedule', label: 'CHRONOS', icon: <FaClipboardList /> },
        { id: 'faculty', label: 'MENTORS', icon: <FaGraduationCap /> },
        { id: 'exams', label: 'EXAMS', icon: <FaShieldAlt /> },
        { id: 'advanced', label: 'STARSHIP', icon: <FaRocket /> },
        { id: 'settings', label: 'CORE', icon: <FaShieldAlt /> }
    ];

    return (
        <header className="sd-header">
            <div className="sd-header-left">
                <div className="sd-brand-group">
                    <FaGraduationCap className="sd-brand-icon" />
                    <div>
                        <h1 className="sd-brand-name brand-title">FRIENDLY</h1>
                        <span className="brand-subtitle">Notebook v4</span>
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
