import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  FaUniversity, FaLayerGroup, FaFileAlt, FaRobot,
  FaTrash, FaEye, FaBullhorn, FaUserCheck, FaBolt, FaChartLine, FaCalendarAlt, FaClipboardList, FaArrowLeft
} from 'react-icons/fa';
import './FacultyDashboard.css';
import sseClient from '../../utils/sseClient';
import MaterialManager from './MaterialManager';
// import FacultyAnalytics from './FacultyAnalytics'; // Moved to Home
// import FacultyClassPulse from './FacultyClassPulse'; // Moved to Home
import FacultySettings from './FacultySettings';
import FacultyAttendanceManager from './FacultyAttendanceManager';
// import FacultyTeachingStats from './FacultyTeachingStats'; // Moved to Home
import FacultyScheduleView from './FacultyScheduleView';
import FacultyExams from './FacultyExams';
import AnnouncementTicker from '../AnnouncementTicker/AnnouncementTicker';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiDelete, apiPost } from '../../utils/apiClient';

// Sections
import FacultySidebar from './Sections/FacultySidebar';
import FacultyHero from './Sections/FacultyHero';
import FacultyHome from './Sections/FacultyHome';
import QuickActionsMenu from './Sections/QuickActionsMenu';

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
    const interval = setInterval(refreshAll, 3000); // 3s ultra-fast auto-refresh
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // SSE: subscribe to server push updates and refresh relevant data immediately
  useEffect(() => {
    const unsub = sseClient.onUpdate((ev) => {
      try {
        if (!ev || !ev.resource) return;
        const r = ev.resource;
        if (['materials', 'students', 'messages'].includes(r)) {
          // Quick refresh same as refreshAll
          (async () => {
            try {
              if (r === 'materials') {
                const mats = await apiGet('/api/materials');
                if (mats) setMaterialsList(mats);
              }
              if (r === 'students') {
                const studentsData = await apiGet(`/api/faculty-stats/${facultyData.facultyId}/students`);
                if (Array.isArray(studentsData)) setStudentsList(studentsData);
              }
              if (r === 'messages') {
                const adminMsgs = await apiGet('/api/messages');
                if (adminMsgs) {
                  const filteredMsgs = adminMsgs.filter(m =>
                    m.target === 'all' ||
                    m.target === 'faculty' ||
                    m.facultyId === facultyData.facultyId
                  );
                  setMessages(filteredMsgs.slice(0, 10));
                }
              }
            } catch (e) {
              console.error('SSE refresh failed', e);
            }
          })();
        }
      } catch (e) {
        console.error('SSE event error', e);
      }
    });
    return unsub;
  }, [facultyData.facultyId]);

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

  // BROADCAST SYSTEM
  const [showMsgModal, setShowMsgModal] = useState(false);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeContext || typeof activeContext === 'string') return alert("Target Link Failure: Please select a Teaching Section to broadcast.");

    const formData = new FormData(e.target);
    const message = formData.get('message');
    if (!message) return;

    try {
      await apiPost('/api/faculty/messages', {
        message,
        year: activeContext.year,
        sections: activeContext.sections,
        subject: activeContext.subject,
        type: 'announcement'
      });
      alert("Transmission Dispatched to Student Nodes.");
      setShowMsgModal(false);
      refreshAll();
    } catch (err) {
      alert("Transmission Failed: " + err.message);
    }
  };

  if (bootSequence) {
    return (
      <div className="faculty-dashboard-v2" style={{ justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          // ... shimemr animation ...
          <div className="icon-box" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--accent-primary)', color: 'white', fontSize: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaUniversity className="pulse" />
          </div>
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
      <FacultySidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeContext={activeContext}
        setActiveContext={setActiveContext}
        myClasses={myClasses}
        studentsList={studentsList}
        handleLogout={handleLogout}
        setActiveTab={setActiveTab}
      />

      {/* MAIN CONTENT STAGE */}
      <main className="main-stage" style={{ marginLeft: sidebarCollapsed ? '80px' : '300px', transition: 'margin 0.3s ease', width: sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 300px)' }}>

        <FacultyHero
          activeContext={activeContext}
          syncing={syncing}
          studentsList={studentsList}
          materialsList={materialsList}
          myClasses={myClasses}
          refreshAll={refreshAll}
          setShowQuickMenu={setShowQuickMenu}
          showQuickMenu={showQuickMenu}
          displayName={displayName}
          setActiveContext={setActiveContext}
          setShowProfile={setShowProfile}
        />

        {/* Quick Actions Menu Floating */}
        {showQuickMenu && (
          <QuickActionsMenu
            setShowQuickMenu={setShowQuickMenu}
            setActiveTab={setActiveTab}
            setActiveContext={setActiveContext}
            myClasses={myClasses}
            refreshAll={refreshAll}
            setShowMsgModal={setShowMsgModal}
          />
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
        ) : !activeContext ? (
          <div className="animate-fade-in">
            <FacultyHome
              studentsList={studentsList}
              materialsList={materialsList}
              myClasses={myClasses}
              facultyData={facultyData}
              messages={messages}
              getFileUrl={getFileUrl}
            />
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* ACTIVE TEAM/CLASS CONTEXT VIEW */}
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
      </main>

      {/* BROADCAST MODAL */}
      {showMsgModal && (
        <div className="modal-overlay" onClick={() => setShowMsgModal(false)}>
          <div className="glass-card animate-slide-up" style={{ width: '500px', padding: '2.5rem', border: '1px solid var(--cyber-cyan)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#f43f5e' }}>
              <FaBullhorn style={{ fontSize: '1.5rem' }} />
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Tactical Broadcast</h2>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Transmitting to: <strong style={{ color: 'var(--accent-primary)' }}>{(activeContext && activeContext.subject) ? `${activeContext.subject} (Year ${activeContext.year})` : 'Unknown Target'}</strong>
            </p>

            <form onSubmit={handleSendMessage}>
              <textarea
                name="message"
                placeholder="Enter mission parameters or class announcement..."
                required
                style={{ width: '100%', height: '120px', padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--pearl-border)', color: 'var(--text-main)', marginBottom: '1.5rem', resize: 'none', fontFamily: 'inherit' }}
              ></textarea>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowMsgModal(false)} className="cyber-btn" style={{ background: 'transparent', color: 'var(--text-muted)' }}>Discard</button>
                <button type="submit" className="cyber-btn primary" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>Transmit</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      <AnnouncementTicker messages={messages} />
    </div>
  );
};

FacultyDashboard.propTypes = {
  facultyData: PropTypes.object.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
  setIsFaculty: PropTypes.func.isRequired,
};

export default FacultyDashboard;
