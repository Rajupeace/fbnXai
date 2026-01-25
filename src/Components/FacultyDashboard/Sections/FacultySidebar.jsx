import React from 'react';
import {
    FaGraduationCap, FaEnvelope, FaSignOutAlt,
    FaLayerGroup, FaBolt, FaChartLine, FaUserCheck, FaBullhorn, FaShieldAlt, FaUserGraduate,
    FaRobot
} from 'react-icons/fa';
import '../../StudentDashboard/StudentDashboard.css';

/**
 * PREMIUM NEXUS SIDEBAR (FACULTY)
 * Collapsible sidebar for faculty command.
 */
const FacultySidebar = ({
    facultyData,
    view,
    setView,
    collapsed,
    setCollapsed,
    onLogout
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
        { id: 'overview', label: 'Dashboard', icon: <FaChartLine /> },
        { id: 'materials', label: 'Materials', icon: <FaLayerGroup /> },
        { id: 'attendance', label: 'Attendance', icon: <FaUserCheck /> },
        { id: 'exams', label: 'Exams', icon: <FaShieldAlt /> },
        { id: 'schedule', label: 'Schedule', icon: <FaBolt /> },
        { id: 'students', label: 'Students', icon: <FaUserGraduate /> },
        { id: 'curriculum', label: 'Curriculum', icon: <FaLayerGroup /> },
        { id: 'broadcast', label: 'Announcements', icon: <FaBullhorn /> },
        { id: 'messages', label: 'Messages', icon: <FaEnvelope /> },
        { id: 'ai-agent', label: 'AI Assistant', icon: <FaRobot /> },
        { id: 'settings', label: 'Settings', icon: <FaGraduationCap /> }
    ];

    return (
        <aside className={`nexus-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div
                    className="brand-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    <div className="brand-icon-box">
                        <FaGraduationCap />
                    </div>
                    {!collapsed && (
                        <div className="brand-text fade-in">
                            <h1>Friendly Notebook</h1>
                            <span>Faculty Dashboard</span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`nav-item ${view === item.id ? 'active' : ''}`}
                        title={collapsed ? item.label : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!collapsed && <span className="nav-label fade-in">{item.label}</span>}
                        {view === item.id && <div className="active-indicator"></div>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                {!collapsed && (
                    <div className="user-profile-mini fade-in">
                        <div className="u-name">{facultyData.name}</div>
                        <div className="u-meta">{facultyData.department || 'ACADEMIC'}</div>
                    </div>
                )}

                <button onClick={localHandleLogout} className="logout-btn" title="Logout">
                    <FaSignOutAlt />
                    {!collapsed && <span className="fade-in">LOGOUT</span>}
                </button>
            </div>
        </aside>
    );
};

export default FacultySidebar;
