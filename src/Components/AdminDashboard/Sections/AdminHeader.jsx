import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEnvelope, FaClipboardList, FaSignOutAlt,
    FaChartLine, FaUserGraduate, FaChalkboardTeacher, FaBook, FaLayerGroup, FaBullhorn, FaRobot, FaCog, FaCalendarAlt, FaFileAlt, FaShieldAlt,
    FaBars
} from 'react-icons/fa';

/**
 * Admin Sidebar
 * Main navigation for admin system.
 * Theme: Friendly Notebook
 */
const AdminHeader = ({
    adminData = { name: 'System Administrator', role: 'Administrator' },
    view,
    setView,
    openModal,
    onLogout,
    collapsed,
    setCollapsed
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

    const navGroups = [
        {
            label: 'Core',
            items: [
                { id: 'overview', label: 'Dashboard', icon: <FaChartLine /> },
                { id: 'students', label: 'Students', icon: <FaUserGraduate /> },
                { id: 'faculty', label: 'Faculty', icon: <FaChalkboardTeacher /> },
                { id: 'courses', label: 'Academic Hub', icon: <FaLayerGroup /> },
            ]
        },
        {
            label: 'Management',
            items: [
                { id: 'attendance', label: 'Attendance', icon: <FaClipboardList /> },
                { id: 'schedule', label: 'Schedule', icon: <FaCalendarAlt /> },
                { id: 'exams', label: 'Exams', icon: <FaFileAlt /> },
                { id: 'materials', label: 'Materials', icon: <FaLayerGroup /> },
            ]
        },
        {
            label: 'Communications',
            items: [
                { id: 'todos', label: 'Tasks', icon: <FaClipboardList /> },
                { id: 'broadcast', label: 'Announcements', icon: <FaBullhorn /> },
                { id: 'messages', label: 'Messages', icon: <FaEnvelope /> },
                { id: 'ai-agent', label: 'AI Assistant', icon: <FaRobot /> },
            ]
        }
    ];

    return (
        <motion.aside
            className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}
            initial={false}
            animate={{ width: collapsed ? 90 : 280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="admin-sidebar-header">
                <motion.div
                    className="admin-brand-group"
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ cursor: 'pointer' }}
                    layout
                >
                    <motion.div className="admin-brand-icon" layout>
                        {collapsed ? <FaBars /> : <FaShieldAlt />}
                    </motion.div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="fade-in-text"
                            >
                                <h1 className="admin-brand-name" style={{ margin: 0, whiteSpace: 'nowrap' }}>FNB Admin</h1>
                                <span style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--admin-text-muted)', letterSpacing: '0.1rem', whiteSpace: 'nowrap' }}>Friendly Notebook</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <nav className="admin-nav" style={{ padding: collapsed ? '1rem 0.75rem' : '1.5rem' }}>
                {navGroups.map((group, idx) => (
                    <div key={idx} className="admin-nav-group">
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="admin-nav-label"
                                >
                                    {group.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                        {group.items.map(item => (
                            <motion.div
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`
                                    admin-nav-item 
                                    ${view === item.id ? 'active' : ''}
                                    ${item.id === 'ai-agent' ? 'ai-core-item' : ''}
                                `}
                                layout
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="nav-icon">{item.icon}</div>
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {!collapsed && item.id === 'ai-agent' && <div className="ai-pulse-dot"></div>}
                            </motion.div>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="admin-sidebar-footer" style={{ padding: collapsed ? '1rem' : '1.5rem' }}>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid var(--admin-border)' }}
                        >
                            <div style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>{adminData.name}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 850, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>{adminData.role}</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => openModal('about')}
                    className="admin-btn admin-btn-outline"
                    style={{ width: '100%', marginBottom: '0.75rem', height: '45px' }}
                    layout
                >
                    <FaCog /> {!collapsed && "SETTINGS"}
                </motion.button>

                <motion.button
                    onClick={localHandleLogout}
                    className="admin-btn"
                    style={{ width: '100%', background: '#fef2f2', color: '#dc2626', border: 'none', height: '45px' }}
                    layout
                >
                    <FaSignOutAlt /> {!collapsed && "LOGOUT"}
                </motion.button>
            </div>
        </motion.aside>
    );
};

export default AdminHeader;
