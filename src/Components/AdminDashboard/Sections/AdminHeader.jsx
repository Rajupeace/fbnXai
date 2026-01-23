import React, { useState } from 'react';
import {
    FaGraduationCap, FaEnvelope, FaClipboardList, FaSignOutAlt,
    FaChartLine, FaUserGraduate, FaChalkboardTeacher, FaBook, FaLayerGroup, FaBullhorn, FaRobot, FaCog, FaCalendarAlt, FaFileAlt, FaShieldAlt,
    FaChevronLeft, FaChevronRight, FaBars
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
    onLogout,
    collapsed,
    setCollapsed
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
                { id: 'curriculum', label: 'CURRICULUM MGMT', icon: <FaLayerGroup /> },
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
        <aside className={`admin-sidebar sentinel-animate ${collapsed ? 'collapsed' : ''}`} style={{ animationDelay: '0s' }}>
            <div className="admin-sidebar-header">
                <div
                    className="admin-brand-group"
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start' }}
                    title={collapsed ? "Expand Dashboard" : "Collapse Dashboard"}
                >
                    <div className="admin-brand-icon">
                        {collapsed ? <FaBars /> : <FaShieldAlt />}
                    </div>
                    {!collapsed && (
                        <div className="fade-in-text">
                            <h1 className="admin-brand-name">FBN XAI</h1>
                            <span style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--admin-text-muted)', letterSpacing: '0.2rem' }}>SENTINEL ADMIN</span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="admin-nav">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="admin-nav-group">
                        {!collapsed && <span className="admin-nav-label fade-in-text">{group.label}</span>}
                        {group.items.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`
                                    admin-nav-item 
                                    ${view === item.id ? 'active' : ''}
                                    ${item.id === 'ai-agent' ? 'ai-core-item' : ''}
                                    ${collapsed ? 'collapsed' : ''}
                                `}
                                title={collapsed ? item.label : ''}
                            >
                                <div className="nav-icon">{item.icon}</div>
                                {!collapsed && <span className="fade-in-text">{item.label}</span>}
                                {!collapsed && item.id === 'ai-agent' && <div className="ai-pulse-dot"></div>}
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="admin-sidebar-footer">
                {!collapsed && (
                    <div className="fade-in-text" style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>{adminData.name}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 850, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>{adminData.role}</div>
                    </div>
                )}

                <button
                    onClick={() => openModal('about')}
                    className={`admin-btn admin-btn-outline ${collapsed ? 'icon-only' : ''}`}
                    style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem', height: '45px' }}
                    title="System Config"
                >
                    <FaCog /> {!collapsed && "SYSTEM CONFIG"}
                </button>
                <button
                    onClick={localHandleLogout}
                    className={`admin-btn ${collapsed ? 'icon-only' : ''}`}
                    style={{ width: '100%', justifyContent: 'center', background: '#fef2f2', color: '#dc2626', border: 'none', height: '45px' }}
                    title="Terminate Session"
                >
                    <FaSignOutAlt /> {!collapsed && "TERMINATE"}
                </button>
            </div>
        </aside>
    );
};

export default AdminHeader;
