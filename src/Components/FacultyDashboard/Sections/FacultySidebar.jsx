import React from 'react';
import { FaUniversity, FaRobot, FaProjectDiagram, FaCalendarAlt, FaCog, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';

const FacultySidebar = ({
    sidebarCollapsed,
    setSidebarCollapsed,
    activeContext,
    setActiveContext,
    myClasses,
    studentsList,
    handleLogout,
    setActiveTab // needed to switch to schedule
}) => {
    return (
        <aside className={`sidebar-v2 ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width: sidebarCollapsed ? '80px' : '300px', transition: 'width 0.3s ease' }}>
            {/* Toggle Button */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{
                    position: 'absolute',
                    right: sidebarCollapsed ? '10px' : '20px',
                    top: '20px',
                    zIndex: 100,
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.3s ease'
                }}
            >
                {sidebarCollapsed ? <FaBars /> : <FaTimes />}
            </button>

            <div className="sidebar-header-v2" style={{ padding: sidebarCollapsed ? '2.5rem 0.5rem' : '2.5rem 1.8rem', textAlign: sidebarCollapsed ? 'center' : 'left', transition: 'all 0.3s ease' }}>
                <div className="icon-box" style={{ background: 'var(--accent-primary)', color: 'white', margin: sidebarCollapsed ? '0 auto 1rem' : '0 0 1rem', width: '42px', height: '42px' }}>
                    <FaUniversity />
                </div>
                {!sidebarCollapsed && (
                    <>
                        <h2 className="brand-shimmer">FBN XAI</h2>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', opacity: 0.8 }}>FACULTY NEXUS</p>
                    </>
                )}
            </div>

            <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <button
                    className={`nav-link-v2 ${!activeContext ? 'active' : ''}`}
                    onClick={() => setActiveContext(null)}
                    style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem 1.8rem' }}
                    title={sidebarCollapsed ? 'Dashboard Home' : ''}
                >
                    <div className="icon-box"><FaUniversity /></div>
                    {!sidebarCollapsed && <span>Dashboard Home</span>}
                </button>

                <button
                    className={`nav-link-v2 ${activeContext === 'ai-agent' ? 'active' : ''}`}
                    onClick={() => setActiveContext('ai-agent')}
                    style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem 1.8rem' }}
                    title={sidebarCollapsed ? 'AI Assistant' : ''}
                >
                    <div className="icon-box"><FaRobot /></div>
                    {!sidebarCollapsed && <span>AI Assistant</span>}
                </button>

                {!sidebarCollapsed && (
                    <div style={{ padding: '2rem 1.8rem 0.8rem', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Teaching Sections</div>
                )}

                {sidebarCollapsed && (
                    <div style={{ height: '1px', background: 'var(--pearl-border)', margin: '1rem 0.5rem' }}></div>
                )}

                {myClasses.map((cls) => {
                    const subjectStudents = studentsList.filter(s =>
                        String(s.year) === String(cls.year) &&
                        cls.sections.some(sec => String(sec).toUpperCase() === String(s.section).toUpperCase())
                    ).length;

                    return (
                        <button
                            key={cls.id}
                            className={`nav-link-v2 ${activeContext?.id === cls.id ? 'active' : ''}`}
                            onClick={() => setActiveContext(cls)}
                            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem 1.8rem' }}
                            title={sidebarCollapsed ? `${cls.subject} - ${subjectStudents} Students` : ''}
                        >
                            <div className="icon-box"><FaProjectDiagram /></div>
                            {!sidebarCollapsed && (
                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activeContext?.id === cls.id ? 'var(--accent-primary)' : 'inherit' }}>{cls.subject}</span>
                                    <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{cls.sections.length} Sections • {subjectStudents} Students</span>
                                </div>
                            )}
                        </button>
                    );
                })}

                <button
                    className={`nav-link-v2 ${activeContext === 'my-schedule' ? 'active' : ''}`}
                    onClick={() => { setActiveContext('my-schedule'); setActiveTab('schedule'); }}
                    style={{ marginTop: '2rem', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem 1.8rem' }}
                    title={sidebarCollapsed ? 'My Schedule' : ''}
                >
                    <div className="icon-box"><FaCalendarAlt /></div>
                    {!sidebarCollapsed && <span>My Schedule</span>}
                </button>

                <button
                    className={`nav-link-v2 ${activeContext === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveContext('settings')}
                    style={{ marginTop: '1rem', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem 1.8rem' }}
                    title={sidebarCollapsed ? 'Settings' : ''}
                >
                    <div className="icon-box"><FaCog /></div>
                    {!sidebarCollapsed && <span>Settings</span>}
                </button>
            </nav>

            <div style={{ padding: sidebarCollapsed ? '1.2rem 0.5rem' : '1.2rem', borderTop: '1px solid var(--pearl-border)' }}>
                <button
                    className="nav-link-v2"
                    onClick={handleLogout}
                    style={{
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.05)',
                        margin: 0,
                        width: '100%',
                        borderRadius: '16px',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        padding: sidebarCollapsed ? '1rem' : '1rem'
                    }}
                    title={sidebarCollapsed ? 'Logout' : ''}
                >
                    <FaSignOutAlt />
                    {!sidebarCollapsed && <span>Terminate Access</span>}
                </button>
            </div>
        </aside>
    );
};

export default FacultySidebar;
