import React from 'react';
import {
    FaGraduationCap, FaEnvelope, FaClipboardList, FaSignOutAlt,
    FaChartLine, FaUserGraduate, FaChalkboardTeacher, FaBook, FaLayerGroup, FaBullhorn, FaRobot, FaCog, FaCalendarAlt, FaFileAlt, FaShieldAlt
} from 'react-icons/fa';

/**
 * ADMIN SENTINEL HEADER
 * High-fidelity command interface for system governance.
 * Theme: Sentinel Enterprise
 */
const AdminHeader = ({
    adminData = { name: 'System Administrator', role: 'Governance Level 1' },
    view,
    setView,
    openModal,
    onLogout
}) => {
    const localHandleLogout = (e) => {
        e.preventDefault();
        if (window.confirm('Terminate Sentinel session and purge local buffers?')) {
            if (onLogout) {
                onLogout();
            } else {
                localStorage.clear();
                window.location.reload();
            }
        }
    };

    const navGroups = [
        {
            label: 'CORE SYSTEMS',
            items: [
                { id: 'overview', label: 'COMMAND HUB', icon: <FaChartLine /> },
                { id: 'students', label: 'CADET REGISTRY', icon: <FaUserGraduate /> },
                { id: 'faculty', label: 'INSTRUCTOR GARRISON', icon: <FaChalkboardTeacher /> },
                { id: 'courses', label: 'CURRICULUM ARCH', icon: <FaBook /> },
            ]
        },
        {
            label: 'OPERATIONAL LOGISTICS',
            items: [
                { id: 'attendance', label: 'PRESENCE LOGS', icon: <FaClipboardList /> },
                { id: 'schedule', label: 'TEMPORAL SYNC', icon: <FaCalendarAlt /> },
                { id: 'exams', label: 'SIMULATION CONTROL', icon: <FaFileAlt /> },
                { id: 'materials', label: 'KNOWLEDGE ARCHIVE', icon: <FaLayerGroup /> },
            ]
        },
        {
            label: 'COMMUNICATIONS',
            items: [
                { id: 'todos', label: 'DIRECTIVES', icon: <FaClipboardList /> },
                { id: 'broadcast', label: 'GLOBAL BROADCAST', icon: <FaBullhorn /> },
                { id: 'messages', label: 'SIGNAL LOGS', icon: <FaEnvelope /> },
                { id: 'ai-agent', label: 'NEURAL CORE', icon: <FaRobot /> },
            ]
        }
    ];

    return (
        <aside className="admin-sidebar sentinel-animate" style={{ animationDelay: '0s' }}>
            <div className="admin-sidebar-header">
                <div className="admin-brand-group">
                    <div className="admin-brand-icon"><FaShieldAlt /></div>
                    <div>
                        <h1 className="admin-brand-name">FBN XAI</h1>
                        <span style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--admin-text-muted)', letterSpacing: '0.2rem' }}>SENTINEL ADMIN</span>
                    </div>
                </div>
            </div>

            <nav className="admin-nav">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="admin-nav-group">
                        <span className="admin-nav-label">{group.label}</span>
                        {group.items.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`admin-nav-item ${view === item.id ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="admin-sidebar-footer">
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>{adminData.name}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 850, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>{adminData.role}</div>
                </div>
                <button
                    onClick={() => openModal('about')}
                    className="admin-btn admin-btn-outline"
                    style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem', height: '45px' }}
                >
                    <FaCog /> SYSTEM CONFIG
                </button>
                <button
                    onClick={localHandleLogout}
                    className="admin-btn"
                    style={{ width: '100%', justifyContent: 'center', background: '#fef2f2', color: '#dc2626', border: 'none', height: '45px' }}
                >
                    <FaSignOutAlt /> TERMINATE
                </button>
            </div>
        </aside>
    );
};

export default AdminHeader;
