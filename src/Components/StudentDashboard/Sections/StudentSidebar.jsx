import React from 'react';
import {
    FaGraduationCap, FaSignOutAlt, FaRocket, FaBook, FaChartBar, FaPen, FaShieldAlt, FaClipboardList, FaRobot
} from 'react-icons/fa';

/**
 * Student Sidebar
 * Collapsible sidebar for streamlined navigation.
 */
const StudentSidebar = ({
    userData,
    view,
    setView,
    collapsed,
    setCollapsed,
    onLogout
}) => {

    const localHandleLogout = (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to log out?')) {
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
                            <span>Student Dashboard</span>
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
                        <div className="u-name">{userData.studentName}</div>
                        <div className="u-meta">{userData.sid} • Y{userData.year}</div>
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

export default StudentSidebar;
