import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  FaUniversity, FaSignOutAlt, FaLayerGroup, FaFileAlt, FaCog, FaRobot,
  FaTrash, FaEye, FaPlus, FaBullhorn, FaHistory, FaProjectDiagram,
  FaUserCircle, FaSyncAlt, FaShieldAlt, FaUserCheck,
  FaBars, FaTimes, FaBolt, FaChartLine, FaCalendarAlt, FaClipboardList
} from 'react-icons/fa';
import './FacultyDashboard.css';
import MaterialManager from './MaterialManager';
import FacultyAnalytics from './FacultyAnalytics';
import FacultyClassPulse from './FacultyClassPulse';
import FacultySettings from './FacultySettings';
import FacultyAttendanceManager from './FacultyAttendanceManager';
import FacultyTeachingStats from './FacultyTeachingStats';
import FacultyScheduleView from './FacultyScheduleView';
import FacultyExams from './FacultyExams';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiDelete } from '../../utils/apiClient';

const FacultyDashboard = ({ facultyData, setIsAuthenticated, setIsFaculty }) => {
  const [activeContext, setActiveContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' or 'attendance'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Collapsible sidebar
  const [showQuickMenu, setShowQuickMenu] = useState(false); // Quick actions menu

  const displayName = facultyData.name || 'Core Instructor';
  const navigate = useNavigate();

  const refreshAll = async () => {
    setSyncing(true);
    try {
      const mats = await apiGet('/api/materials');
      if (mats) setMaterialsList(mats);

      const adminMsgs = await apiGet('/api/messages');
      if (adminMsgs) {
        // Filter for: Admin messages to Faculty/All OR messages sent BY this faculty
        const filteredMsgs = adminMsgs.filter(m =>
          m.target === 'all' ||
          m.target === 'faculty' ||
          m.facultyId === facultyData.facultyId
        );
        setMessages(filteredMsgs.slice(0, 10));
      }

      const studentsData = await apiGet(`/api/faculty-stats/${facultyData.facultyId}/students`);
      if (Array.isArray(studentsData)) setStudentsList(studentsData);

      setTimeout(() => setSyncing(false), 800);
    } catch (e) {
      console.error("Mesh Synchronization Failed", e);
      setSyncing(false);
    }
  };

  useEffect(() => {
    refreshAll();
    const timer = setTimeout(() => setBootSequence(false), 1500);
    const interval = setInterval(refreshAll, 10000); // 10s auto-refresh for faster updates
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const myClasses = useMemo(() => {
    const grouped = {};
    const assignments = facultyData.assignments || [];
    assignments.forEach(assign => {
      const key = `${assign.year}-${assign.subject}`;
      if (!grouped[key]) {
        grouped[key] = { id: key, year: assign.year, subject: assign.subject, sections: new Set() };
      }
      grouped[key].sections.add(assign.section);
    });
    return Object.values(grouped).map(g => ({ ...g, sections: Array.from(g.sections).sort() }));
  }, [facultyData.assignments]);

  const handleLogout = () => {
    if (window.confirm('Initiate terminal shutdown and logout?')) {
      localStorage.clear();
      setIsAuthenticated(false);
      setIsFaculty(false);
      navigate('/');
    }
  };

  const getFileUrl = (url) => {
    if (!url || url === '#') return '#';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm("Purge data node from central buffer?")) return;
    try {
      await apiDelete(`/api/materials/${id}`);
      refreshAll();
    } catch (err) {
      alert("System Conflict: " + err.message);
    }
  };

  if (bootSequence) {
    return (
      <div className="faculty-dashboard-v2" style={{ justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <FaUserCircle style={{ fontSize: '4rem', color: 'var(--accent-primary)', animation: 'pulse 1s infinite' }} />
          <h2 className="brand-shimmer" style={{ marginTop: '1.5rem' }}>Securing Faculty Console...</h2>
          <div style={{ width: '200px', height: '3px', background: 'rgba(99, 102, 241, 0.1)', margin: '1rem auto', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: 'var(--accent-primary)', animation: 'meshFlow 2s infinite' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard-v2">
      {/* CYBER SIDEBAR WITH COLLAPSE */}
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
              <h2 className="brand-shimmer">friendlyNotebook</h2>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', opacity: 0.8 }}>FACULTY CONSOLE V2.0</p>
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

      {/* MAIN CONTENT STAGE */}
      <main className="main-stage" style={{ marginLeft: sidebarCollapsed ? '80px' : '300px', transition: 'margin 0.3s ease', width: sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 300px)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div className="icon-box" style={{ background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)', color: 'white', width: '56px', height: '56px', fontSize: '1.5rem' }}><FaShieldAlt /></div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#0ea5e9', fontWeight: 900, letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }}></div>
                SECURE FACULTY NODE {syncing && '• SYNCING...'}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', marginTop: '0.3rem' }}>
                {activeContext ? activeContext.subject : 'Main Systems Aggregate'}
              </div>

              {/* Quick Stats Badges */}
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#059669' }}>
                  <FaUserCheck /> {studentsList.length} Students
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  <FaLayerGroup /> {materialsList.length} Materials
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#a855f7' }}>
                  <FaChartLine /> {myClasses.length} Classes
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <button className="cyber-btn primary" onClick={refreshAll} style={{ padding: '0.9rem 1.8rem', fontSize: '0.85rem', fontWeight: 700 }}>
              {syncing ? <FaSyncAlt className="spin-fast" /> : <FaSyncAlt />}
              {syncing ? 'SYNCING...' : 'REFRESH'}
            </button>

            {/* Quick Actions Toggle */}
            <button
              className="cyber-btn"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              style={{ padding: '0.9rem 1.8rem', fontSize: '0.85rem', fontWeight: 700, background: showQuickMenu ? 'var(--accent-primary)' : 'white', color: showQuickMenu ? 'white' : 'var(--text-main)', border: '1px solid var(--pearl-border)' }}
            >
              <FaBolt /> QUICK ACTIONS
            </button>
          </div>
        </header>

        {/* Quick Actions Menu Floating */}
        {showQuickMenu && (
          <div style={{
            position: 'fixed',
            top: '120px',
            right: '30px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid var(--pearl-border)',
            padding: '1.5rem',
            zIndex: 1000,
            minWidth: '280px',
            animation: 'slideInRight 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Quick Actions</h3>
              <button onClick={() => setShowQuickMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button
                onClick={() => { setActiveTab('attendance'); setActiveContext(myClasses[0]); setShowQuickMenu(false); }}
                className="cyber-btn"
                style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(99, 102, 241, 0.05)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
              >
                <FaUserCheck /> Take Attendance
              </button>

              <button
                onClick={() => { setActiveTab('materials'); setActiveContext(myClasses[0]); setShowQuickMenu(false); }}
                className="cyber-btn"
                style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(16, 185, 129, 0.05)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' }}
              >
                <FaPlus /> Upload Material
              </button>

              <button
                onClick={() => { setActiveContext('ai-agent'); setShowQuickMenu(false); }}
                className="cyber-btn"
                style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(168, 85, 247, 0.05)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)' }}
              >
                <FaRobot /> AI Assistant
              </button>

              <button
                onClick={() => { refreshAll(); setShowQuickMenu(false); }}
                className="cyber-btn"
                style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(14, 165, 233, 0.05)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)' }}
              >
                <FaSyncAlt /> Refresh Data
              </button>
            </div>
          </div>
        )}

        {activeContext === 'ai-agent' ? (
          <div className="glass-card animate-fade-in" style={{ height: 'calc(100% - 100px)', padding: 0, overflow: 'hidden', border: '1px solid var(--cyber-cyan)' }}>
            <VuAiAgent />
          </div>
        ) : activeContext === 'settings' ? (
          <div className="animate-fade-in"><FacultySettings facultyData={facultyData} /></div>
        ) : activeContext === 'my-schedule' ? (
          <div className="animate-fade-in">
            <FacultyScheduleView facultyData={facultyData} />
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* LARGE HERO SECTION */}
            <section className="hero-banner">
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '50px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#059669',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    letterSpacing: '1px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 10px #10b981',
                      animation: 'pulse 2s infinite'
                    }}></div>
                    SYSTEM SECURE
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(99, 102, 241, 0.08)',
                    borderRadius: '50px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: 'var(--accent-primary)',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    letterSpacing: '1px'
                  }}>
                    <FaSyncAlt className={syncing ? 'spin-fast' : ''} style={{ fontSize: '0.8rem' }} />
                    {syncing ? 'DATA SYNC ACTIVE' : 'MESH SYNCHRONIZED'}
                  </div>
                </div>
                <h1>Welcome back,<br />Prof. {displayName}</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '600px', marginTop: '1.5rem' }}>
                  {activeContext ? `Managing deployment for ${activeContext.subject}. All nodes synchronized across ${activeContext.sections.join(', ')} sections.` : 'Global dashboard active. Overviewing material deployment, student affinity, and system transmissions.'}
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem' }}>
                  <div className="cyber-btn primary" onClick={() => setActiveContext(myClasses[0])} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '1.2rem 2.8rem' }}>
                    <FaPlus /> Deploy Node Material
                  </div>
                  <div className="cyber-btn" style={{ background: 'white', color: 'var(--text-main)', border: '1px solid var(--pearl-border)', padding: '1.2rem 2.8rem' }} onClick={() => setShowProfile(true)}>
                    <FaUserCircle style={{ color: 'var(--accent-vibrant)' }} /> My Identity Mesh
                  </div>
                </div>
              </div>
            </section>

            {!activeContext ? (
              <div className="dashboard-v2-grid">
                <FacultyClassPulse
                  studentsCount={studentsList.length}
                  materialsCount={materialsList.length}
                />
                <FacultyAnalytics myClasses={myClasses} materialsList={materialsList} facultyId={facultyData.facultyId} />

                {/* Teaching Statistics */}
                <div style={{ marginTop: '2rem', gridColumn: '1 / -1' }}>
                  <FacultyTeachingStats facultyId={facultyData.facultyId} />
                </div>

                <div className="glass-grid" style={{ marginTop: '2.5rem' }}>
                  {/* SYSTEM INTEL / NEW FEATURES */}
                  <div className="glass-card" style={{ borderLeft: '6px solid var(--accent-secondary)', background: 'linear-gradient(135deg, white 0%, rgba(168, 85, 247, 0.05) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem' }}><FaShieldAlt color="var(--accent-secondary)" /> System Intelligence</h3>
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent-secondary)', background: 'rgba(168, 85, 247, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>FACULTY ONLY</span>
                    </div>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--pearl-border)', boxShadow: 'var(--soft-shadow)' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Update: Version 2.0 Terminal Active</div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        The new Faculty Broadcast system is now online. You can now dispatch urgent messages directly to your sections via the Deployment Hub.
                      </p>
                    </div>
                  </div>

                  {/* ACTIVITY FEED */}
                  <div className="glass-card" style={{ borderLeft: '6px solid var(--accent-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}><FaHistory color="var(--accent-primary)" /> Deployment Logs</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {materialsList.slice(0, 5).map((m, i) => (
                        <div key={m.id || m._id} className="feed-item" style={{ padding: '1.2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.2rem', background: '#f8fafc', border: '1px solid var(--pearl-border)' }}>
                          <div className="icon-box" style={{ background: 'white', color: 'var(--accent-primary)', border: '1px solid var(--pearl-border)' }}>
                            {m.type === 'videos' ? <FaLayerGroup /> : <FaFileAlt />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{m.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.subject} • {new Date(m.createdAt || m.uploadedAt).toLocaleDateString()}</div>
                          </div>
                          <a href={getFileUrl(m.url)} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}><FaEye /></a>
                        </div>
                      ))}
                      {materialsList.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No recent deployments detected.</p>}
                    </div>
                  </div>

                  {/* TRANSMISSIONS */}
                  <div className="glass-card" style={{ borderLeft: '6px solid #f43f5e' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}><FaBullhorn color="#f43f5e" /> Tactical Transmissions</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {messages.map((msg, i) => (
                        <div key={msg.id} style={{ borderLeft: '3px solid #f43f5e', paddingLeft: '1.5rem', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#f43f5e', textTransform: 'uppercase' }}>
                              {msg.facultyId === facultyData.facultyId ? 'SENT BY YOU' : (msg.sender || 'ADMIN CENTER')}
                            </div>
                            {msg.type && (
                              <span style={{
                                fontSize: '0.6rem',
                                fontWeight: 900,
                                background: 'rgba(244, 63, 94, 0.1)',
                                color: '#f43f5e',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}>
                                {msg.type}
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-main)', fontWeight: 600 }}>{msg.message || msg.text}</p>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            {new Date(msg.createdAt || msg.date).toLocaleString()}
                            {msg.sections && ` • To Section: ${msg.sections.join(', ')}`}
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No active transmissions.</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">

                {/* TABS HEADER */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--pearl-border)' }}>
                  <button
                    onClick={() => setActiveTab('materials')}
                    style={{
                      padding: '1rem 2rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'materials' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                      color: activeTab === 'materials' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    <FaLayerGroup style={{ marginRight: '0.5rem' }} /> Course Materials
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    style={{
                      padding: '1rem 2rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'attendance' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                      color: activeTab === 'attendance' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    <FaUserCheck style={{ marginRight: '0.5rem' }} /> Attendance & Roster
                  </button>
                  <button
                    onClick={() => setActiveTab('exams')}
                    style={{
                      padding: '1rem 2rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'exams' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                      color: activeTab === 'exams' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    <FaClipboardList style={{ marginRight: '0.5rem' }} /> Exams
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    style={{
                      padding: '1rem 2rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'schedule' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                      color: activeTab === 'schedule' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    <FaBolt style={{ marginRight: '0.5rem' }} /> My Schedule
                  </button>
                </div>

                {activeTab === 'materials' ? (
                  <>
                    <div className="glass-card" style={{ marginBottom: '2.5rem', background: 'var(--nebula-glow)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <MaterialManager
                        selectedSubject={`${activeContext.subject} - Year ${activeContext.year}`}
                        selectedSections={activeContext.sections}
                        onUploadSuccess={refreshAll}
                      />
                    </div>

                    <div className="glass-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}><FaLayerGroup color="var(--cyber-cyan)" /> Managed Node Data</h2>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.4 }}>YEAR {activeContext.year} AGGREGATE</span>
                          <div style={{ padding: '0.4rem 1rem', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--cyber-cyan)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900 }}>{materialsList.filter(m => String(m.year) === String(activeContext.year) && m.subject.includes(activeContext.subject)).length} NODES</div>
                        </div>
                      </div>

                      <div className="glass-grid">
                        {materialsList.filter(m => String(m.year) === String(activeContext.year) && m.subject.includes(activeContext.subject)).map(node => (
                          <div key={node.id || node._id} className="glass-card" style={{ padding: '2rem', background: '#f8fafc', border: '1px solid var(--pearl-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                              <div className="icon-box" style={{ background: 'white', color: 'var(--accent-primary)' }}>
                                {node.type === 'videos' ? <FaLayerGroup /> : <FaFileAlt />}
                              </div>
                              <div style={{ display: 'flex', gap: '0.6rem' }}>
                                <a href={getFileUrl(node.url)} target="_blank" rel="noreferrer" className="icon-box" style={{ width: '36px', height: '36px', background: 'white' }}><FaEye /></a>
                                <button onClick={() => handleDeleteNode(node.id || node._id)} className="icon-box" style={{ width: '36px', height: '36px', color: '#ef4444', border: 'none', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer' }}><FaTrash /></button>
                              </div>
                            </div>
                            <h4 style={{ margin: '0 0 0.8rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>{node.title}</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', fontWeight: 800 }}>{node.type.toUpperCase()}</span>
                              <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-muted)', fontWeight: 800 }}>U{node.unit || 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : activeTab === 'attendance' ? (
                  // Attendance Tab Content
                  <FacultyAttendanceManager
                    subject={activeContext.subject}
                    year={activeContext.year}
                    sections={activeContext.sections}
                    facultyId={facultyData.facultyId}
                    branch={facultyData.department}
                  />
                ) : activeTab === 'exams' ? (
                  <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                    <FacultyExams
                      subject={activeContext.subject}
                      year={activeContext.year}
                      sections={activeContext.sections}
                      facultyId={facultyData.facultyId}
                      branch={facultyData.department}
                    />
                  </div>
                ) : activeTab === 'schedule' ? (
                  // Schedule Tab Content
                  <FacultyScheduleView facultyData={facultyData} />
                ) : null}
              </div>
            )}
          </div>
        )}
      </main>

      {/* IDENTITY MODAL */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="glass-card animate-fade-in" style={{ width: '400px', textAlign: 'center', padding: '4rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '120px', height: '120px', borderRadius: '40px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3.5rem', fontWeight: 800, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}>
              {displayName[0]}
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>{displayName}</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 800, letterSpacing: '1px', marginTop: '0.6rem' }}>ACADEMIC PROFESSOR</div>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', textAlign: 'left', border: '1px solid var(--pearl-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>FACULTY BRANCH</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{facultyData.department || 'CORE DEPARTMENT'}</div>
            </div>

            <button className="cyber-btn primary" style={{ width: '100%', marginTop: '2.5rem', justifyContent: 'center' }} onClick={() => setShowProfile(false)}>Close Interface</button>
          </div>
        </div>
      )}
    </div>
  );
};

FacultyDashboard.propTypes = {
  facultyData: PropTypes.object.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
  setIsFaculty: PropTypes.func.isRequired,
};

export default FacultyDashboard;
