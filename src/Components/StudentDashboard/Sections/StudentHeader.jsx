import React from 'react';
import { FaBookOpen, FaCog, FaUserClock, FaClipboardCheck, FaClipboardList, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';

const StudentHeader = ({
    userData,
    tasks,
    view,
    setView,
    showTaskModal,
    setShowTaskModal,
    showMsgModal,
    setShowMsgModal,
    unreadCount,
    setUnreadCount,
    messages,
    onLogout,
    toggleTaskModal,
    toggleMsgModal,
    handleLogout
}) => {

    const localHandleLogout = (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to logout?')) {
            if (onLogout) {
                onLogout();
            } else {
                localStorage.removeItem('studentToken');
                localStorage.removeItem('userData');
                window.location.reload();
            }
        }
    };

    return (
        <header className="sd-header">
            <div className="sd-brand-group">
                <FaBookOpen className="sd-brand-icon" />
                <h1 className="sd-brand-name">Friendly Notebook</h1>
            </div>

            <div className="sd-text-group">
                <h2 className="sd-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                    {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}, {userData.studentName.split(' ')[0]}
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>
                    {tasks.filter(t => !t.completed).length > 0 ? `You have ${tasks.filter(t => !t.completed).length} tasks due!` : 'You are all caught up! 🌟'}
                </p>

                {/* Academic Progress Mini-Bar will be passed as children or rendered here if overviewData is passed. 
                    For simplicity, we can let the parent render specific dynamic stats if needed, or pass progress prop.
                */}
            </div>
            <div className="sd-actions">
                <button onClick={() => setView('settings')} className="btn-icon" title="Settings">
                    <FaCog />
                </button>

                <button
                    onClick={() => setView('attendance')}
                    className="btn-icon"
                    title="Attendance"
                    style={{ color: view === 'attendance' ? '#10b981' : 'inherit' }}
                >
                    <FaUserClock />
                </button>

                <button
                    onClick={() => setView('exams')}
                    className="btn-icon"
                    title="Exams & Quizzes"
                    style={{ color: view === 'exams' ? '#10b981' : 'inherit' }}
                >
                    <FaClipboardCheck />
                </button>

                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                        onClick={toggleTaskModal}
                        className="btn-icon"
                        title="Tasks"
                    >
                        <FaClipboardList />
                    </button>
                    {tasks.filter(t => !t.completed).length > 0 &&
                        <span className="msg-badge" style={{ background: '#f59e0b' }}>{tasks.filter(t => !t.completed).length}</span>}

                    {showTaskModal && (
                        <div className="msg-dropdown" style={{ right: '-50px' }}>
                            <div className="msg-header">
                                <h4>My Tasks</h4>
                                <button onClick={() => setShowTaskModal(false)}>&times;</button>
                            </div>
                            <div className="msg-list">
                                {tasks.length > 0 ? (
                                    tasks.map((t, i) => (
                                        <div key={i} className="msg-item" style={{ borderLeft: t.completed ? '3px solid #10b981' : '3px solid #f59e0b' }}>
                                            <div className="msg-date">
                                                {t.dueDate ? `Due: ${t.dueDate}` : 'No due date'}
                                                {t.completed && <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>✓ Done</span>}
                                            </div>
                                            <div className="msg-text" style={{ textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#94a3b8' : 'inherit' }}>
                                                {t.text}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="msg-empty">No tasks assigned</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                        onClick={toggleMsgModal}
                        className="btn-icon"
                        title="Messages"
                    >
                        <FaEnvelope />
                    </button>
                    {/* Only show badge if unread > 0 */}
                    {unreadCount > 0 && <span className="msg-badge">{unreadCount}</span>}

                    {/* Messages Dropdown */}
                    {showMsgModal && (
                        <div className="msg-dropdown">
                            <div className="msg-header">
                                <h4>Messages</h4>
                                <button onClick={() => setShowMsgModal(false)}>&times;</button>
                            </div>
                            <div className="msg-list">
                                {messages.length > 0 ? (
                                    messages.map((m, i) => (
                                        <div key={i} className="msg-item" style={{ borderLeft: m.type === 'urgent' ? '4px solid #f43f5e' : m.type === 'reminder' ? '4px solid #f59e0b' : '4px solid #3b82f6' }}>
                                            <div className="msg-date" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{new Date(m.createdAt || m.date).toLocaleDateString()}</span>
                                                {m.type && <span style={{
                                                    fontSize: '0.6rem',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                }}>{m.type}</span>}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#334155', margin: '0.3rem 0' }}>
                                                {m.sender || 'ADMIN CENTER'} {m.subject ? `• ${m.subject}` : ''}
                                            </div>
                                            <div className="msg-text">{m.message || m.text}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="msg-empty">No transmissions detected</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={localHandleLogout}
                    className="btn-logout"
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </header>
    );
};

export default StudentHeader;
