import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaBullhorn, FaFileAlt, FaEye, FaTrash, FaDownload, FaFilter, FaRobot, FaVideo, FaChevronRight } from 'react-icons/fa';
import sseClient from '../../utils/sseClient';
import MaterialManager from './MaterialManager';
import FacultySettings from './FacultySettings';
import FacultyAttendanceManager from './FacultyAttendanceManager';
import FacultyAttendanceMarker from './FacultyAttendanceMarker';
import FacultyScheduleView from './FacultyScheduleView';
import FacultyExams from './FacultyExams';
import FacultyAssignments from './FacultyAssignments';
import FacultyMarks from './FacultyMarks';
import FacultyAnalytics from './FacultyAnalytics';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import Whiteboard from '../Whiteboard/Whiteboard';
import { apiGet, apiDelete, apiPost } from '../../utils/apiClient';

// Sections
import FacultySidebar from './Sections/FacultySidebar';
import FacultyHome from './Sections/FacultyHome';
import FacultyCurriculumArch from './Sections/FacultyCurriculumArch';
import FacultyMessages from './Sections/FacultyMessages';
import FacultyStudents from './Sections/FacultyStudents';
import PersonalDetailsBall from '../PersonalDetailsBall/PersonalDetailsBall';

// Styles
import './FacultyDashboard.css';

const FacultyDashboard = ({ facultyData, setIsAuthenticated, setIsFaculty }) => {
  const [currentFaculty, setCurrentFaculty] = useState(facultyData);
  const [view, setView] = useState('overview');
  const [activeContext, setActiveContext] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [whiteboardHistory, setWhiteboardHistory] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBoard, setPreviewBoard] = useState(null);

  const openAiWithPrompt = (prompt) => {
    setAiInitialPrompt(prompt);
    setShowAiModal(true);
  };

  const toggleAiModal = () => {
    setShowAiModal(prev => {
      if (prev) setAiInitialPrompt('');
      return !prev;
    });
  };

  const navigate = useNavigate();

  const refreshAll = async () => {
    try {
      // Try aggregated dashboard endpoint for faculty first
      try {
        const agg = await apiGet(`/api/faculty-data/${facultyData.facultyId}/dashboard`);
        if (agg) {
          if (agg.faculty) setCurrentFaculty(agg.faculty);
          if (Array.isArray(agg.materials)) setMaterialsList(agg.materials);
          if (Array.isArray(agg.students)) setStudentsList(agg.students);
          if (Array.isArray(agg.schedule)) setSchedule(agg.schedule);
          if (Array.isArray(agg.messages)) setMessages(agg.messages);
          return;
        }
      } catch (e) {
        // aggregator missing or failed - fall back
      }

      const freshFac = await apiGet(`/api/faculty/${facultyData.facultyId}`);
      if (freshFac) setCurrentFaculty(freshFac);
    } catch (e) { console.warn('Fac profile refresh failed', e); }

    try {
      const mats = await apiGet('/api/materials');
      if (mats) setMaterialsList(mats);

      const query = new URLSearchParams({
        userId: facultyData.facultyId,
        role: 'faculty'
      }).toString();
      const adminMsgs = await apiGet(`/api/messages?${query}`);
      if (adminMsgs) {
        setMessages(adminMsgs.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)).slice(0, 10));
      }

      const studentsData = await apiGet(`/api/faculty-stats/${facultyData.facultyId}/students`);
      if (Array.isArray(studentsData)) setStudentsList(studentsData);

      const scheduleData = await apiGet(`/api/schedule?faculty=${encodeURIComponent(facultyData.facultyName || facultyData.name)}`);
      if (Array.isArray(scheduleData)) setSchedule(scheduleData);
    } catch (e) {
      console.error("❌ FacultyDashboard: Sync Failed", e);
    }
  };

  useEffect(() => {
    refreshAll();
    const timer = setTimeout(() => setInitialLoad(false), 800);
    const interval = setInterval(refreshAll, 3000); // Faster polling (3s)
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = sseClient.onUpdate((ev) => {
      if (!ev || !ev.resource) return;
      // Add 'marks', 'attendance', 'studentData', 'achievements', 'exams', 'fees' to trigger refresh
      if (['materials', 'students', 'messages', 'faculty', 'marks', 'attendance', 'studentData', 'achievements', 'exams', 'examResults', 'fees', 'notes', 'courses'].includes(ev.resource)) {
        refreshAll();
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyData.facultyId]);

  const myClasses = useMemo(() => {
    const grouped = {};
    const assignments = currentFaculty.assignments || [];
    assignments.forEach(assign => {
      const key = `${assign.year}-${assign.subject}`;
      if (!grouped[key]) {
        grouped[key] = { id: key, year: assign.year, subject: assign.subject, sections: new Set() };
      }
      grouped[key].sections.add(assign.section);
    });
    return Object.values(grouped).map(g => ({ ...g, sections: Array.from(g.sections).sort() }));
  }, [currentFaculty.assignments]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsFaculty(false);
    navigate('/');
  };

  const getFileUrl = (url) => {
    if (!url || url === '#') return '#';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await apiDelete(`/api/materials/${id}`);
      refreshAll();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get('message');
    const targetClass = formData.get('targetClass');

    const contextToUse = targetClass ?
      myClasses.find(c => `${c.year}-${c.subject}` === targetClass) :
      (activeContext || myClasses[0]);

    if (!message) return;
    if (!contextToUse) return alert("Error: No classes assigned.");

    try {
      await apiPost('/api/faculty/messages', {
        message,
        year: contextToUse.year,
        sections: contextToUse.sections,
        subject: contextToUse.subject,
        type: 'announcement'
      });
      alert("Announcement sent to students.");
      setShowMsgModal(false);
      refreshAll();
    } catch (err) {
      alert("Failed to send: " + err.message);
    }
  };

  const handleSaveWhiteboard = async (dataUrl) => {
    const ctx = ensureContext();
    if (!ctx) return alert("Select a class first.");

    try {
      const payload = {
        subject: ctx.subject,
        year: ctx.year,
        branch: currentFaculty.department || 'Academic',
        section: ctx.sections[0] || 'All',
        title: `Class Notes - ${new Date().toLocaleDateString()}`,
        imageData: dataUrl
      };

      await apiPost('/api/whiteboard', payload);
      alert("Paint board saved to student dashboards.");
      fetchWhiteboardHistory();
    } catch (err) {
      alert("Failed to save board: " + err.message);
    }
  };

  const fetchWhiteboardHistory = async () => {
    try {
      const res = await apiGet('/api/whiteboard/faculty');
      setWhiteboardHistory(res || []);
    } catch (err) {
      console.warn("History fetch failed", err);
    }
  };

  const deleteWhiteboard = async (boardId) => {
    if (!window.confirm('Delete this board? This cannot be undone.')) return;

    try {
      await apiDelete(`/api/whiteboard/${boardId}`);
      alert('Board deleted successfully.');
      fetchWhiteboardHistory();
    } catch (err) {
      alert('Failed to delete board: ' + err.message);
    }
  };

  useEffect(() => {
    if (view === 'whiteboard') fetchWhiteboardHistory();
  }, [view]);

  if (initialLoad) {
    return (
      <div className="faculty-load-overlay">
        <div className="load-content">
          <div className="load-icon-box">
            <FaUniversity className="pulse" />
          </div>
          <h2 className="load-shimmer">Accessing Faculty Node...</h2>
          <div className="load-progress-wrap">
            <div className="load-progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  const ensureContext = () => {
    if (!activeContext && myClasses.length > 0) {
      setActiveContext(myClasses[0]);
    }
    return activeContext || (myClasses.length > 0 ? myClasses[0] : null);
  };

  return (
    <div className={`faculty-dashboard-layout loaded ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
      <button className="mobile-sidebar-toggle" onClick={() => setMobileSidebarOpen(true)}>☰</button>
      {mobileSidebarOpen && <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)}></div>}

      <FacultySidebar
        facultyData={facultyData}
        view={view}
        setView={setView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
        onNavigate={() => setMobileSidebarOpen(false)}
      />

      <div className="dashboard-content-area">
        <div className="nexus-mesh-bg content-bg-fixed"></div>

        <header className="nexus-glass-header">
          <div className="header-left">
            <div className="breadcrumb-box">
              <span className="bc-main">FACULTY</span>
              <FaChevronRight className="bc-sep" />
              <span className="bc-active">{view.toUpperCase()}</span>
            </div>
          </div>
          <div className="header-right">
            <div className="header-time-box">
              <span className="time-val">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="date-val">{new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
        </header>

        <div className="view-content-layer">
          {view === 'overview' && (
            <FacultyHome
              studentsList={studentsList}
              materialsList={materialsList}
              myClasses={myClasses}
              schedule={schedule}
              facultyData={facultyData}
              messages={messages}
              getFileUrl={getFileUrl}
              setView={setView}
              openAiWithPrompt={openAiWithPrompt}
            />
          )}

          {view === 'materials' && (() => {
            const ctx = ensureContext();
            return ctx ? (
              <div className="nexus-hub-viewport">
                <header className="f-view-header">
                  <div>
                    <h2>COURSE <span>MATERIALS</span></h2>
                    <p className="nexus-subtitle">Manage study materials for {ctx.subject}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaFilter style={{ color: '#94a3b8' }} />
                    <select
                      className="f-context-select"
                      onChange={(e) => {
                        const [yr, subj] = e.target.value.split('-');
                        const cls = myClasses.find(c => String(c.year) === yr && c.subject === subj);
                        if (cls) setActiveContext(cls);
                      }}
                      value={ctx ? `${ctx.year}-${ctx.subject}` : ''}
                    >
                      {myClasses.map(c => (
                        <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                          {c.subject} (YEAR {c.year})
                        </option>
                      ))}
                    </select>
                  </div>
                </header>

                <div className="f-upload-stage animate-slide-up">
                  <MaterialManager
                    selectedSubject={`${ctx.subject} - Year ${ctx.year}`}
                    selectedSections={ctx.sections}
                    onUploadSuccess={refreshAll}
                  />
                </div>

                <div className="f-materials-grid">
                  {materialsList.filter(m => String(m.year) === String(ctx.year) && m.subject.includes(ctx.subject)).map((node, index) => (
                    <div key={node.id || node._id} className="f-node-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="f-node-head">
                        <div className="f-node-type-icon">
                          {node.type === 'videos' ? <FaVideo /> : <FaFileAlt />}
                        </div>
                        <div className="f-node-actions">
                          <a href={getFileUrl(node.url)} target="_blank" rel="noreferrer" className="f-node-btn view" title="View File"><FaEye /></a>
                          <button onClick={() => handleDeleteNode(node.id || node._id)} className="f-node-btn delete" title="Delete File"><FaTrash /></button>
                        </div>
                      </div>
                      <h4 className="f-node-title">{node.title}</h4>
                      <div className="f-node-meta">
                        <span className="f-meta-badge type">{node.type.toUpperCase()}</span>
                        <span className="f-meta-badge unit">UNIT {node.unit || 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="no-content">No classes assigned.</div>;
          })()}

          {view === 'assignments' && <FacultyAssignments facultyId={facultyData.facultyId} openAiWithPrompt={openAiWithPrompt} />}
          {view === 'marks' && <FacultyMarks facultyData={currentFaculty} openAiWithPrompt={openAiWithPrompt} />}
          {view === 'analytics' && <FacultyAnalytics facultyId={facultyData.facultyId} materialsList={materialsList} studentsList={studentsList} />}

          {view === 'attendance' && (() => {
            const ctx = ensureContext();
            return ctx ? (
              <div className="nexus-hub-viewport">
                <header className="f-view-header">
                  <div>
                    <h2>ATTENDANCE <span>ROSTER</span></h2>
                    <p className="nexus-subtitle">Daily tracking for {ctx.subject}</p>
                  </div>
                  <select
                    className="f-context-select"
                    onChange={(e) => {
                      const [yr, subj] = e.target.value.split('-');
                      const cls = myClasses.find(c => String(c.year) === yr && c.subject === subj);
                      if (cls) setActiveContext(cls);
                    }}
                    value={ctx ? `${ctx.year}-${ctx.subject}` : ''}
                  >
                    {myClasses.map(c => (
                      <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                        {c.subject} (YEAR {c.year})
                      </option>
                    ))}
                  </select>
                </header>
                <FacultyAttendanceManager
                  facultyId={facultyData.facultyId}
                  subject={ctx.subject}
                  year={ctx.year}
                  sections={ctx.sections}
                  currentFaculty={currentFaculty}
                  openAiWithPrompt={openAiWithPrompt}
                />
              </div>
            ) : <div className="no-content">No classes assigned.</div>;
          })()}

          {view === 'mark-attendance' && (
            <FacultyAttendanceMarker
              facultyId={facultyData.facultyId}
              facultyName={facultyData.facultyName || facultyData.name}
            />
          )}

          {view === 'exams' && (() => {
            const ctx = ensureContext();
            return ctx ? (
              <div className="nexus-hub-viewport">
                <header className="f-view-header">
                  <div>
                    <h2>EXAM <span>MANAGEMENT</span></h2>
                    <p className="nexus-subtitle">Manage assessments for {ctx.subject}</p>
                  </div>
                  <select
                    className="f-context-select"
                    onChange={(e) => {
                      const [yr, subj] = e.target.value.split('-');
                      const cls = myClasses.find(c => String(c.year) === yr && c.subject === subj);
                      if (cls) setActiveContext(cls);
                    }}
                    value={ctx ? `${ctx.year}-${ctx.subject}` : ''}
                  >
                    {myClasses.map(c => (
                      <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                        {c.subject} (YEAR {c.year})
                      </option>
                    ))}
                  </select>
                </header>
                <FacultyExams
                  subject={ctx.subject}
                  year={ctx.year}
                  sections={ctx.sections}
                  facultyId={currentFaculty.facultyId}
                  branch={currentFaculty.department}
                  openAiWithPrompt={openAiWithPrompt}
                />
              </div>
            ) : <div className="no-content">No classes assigned.</div>;
          })()}

          {view === 'schedule' && <FacultyScheduleView facultyData={currentFaculty} schedule={schedule} openAiWithPrompt={openAiWithPrompt} />}
          {view === 'curriculum' && (
            <FacultyCurriculumArch
              myClasses={myClasses}
              materialsList={materialsList}
              currentFaculty={currentFaculty}
              getFileUrl={getFileUrl}
              openAiWithPrompt={openAiWithPrompt}
            />
          )}
          {view === 'settings' && <FacultySettings facultyData={currentFaculty} onProfileUpdate={setCurrentFaculty} openAiWithPrompt={openAiWithPrompt} />}
          {view === 'messages' && <FacultyMessages messages={messages} openAiWithPrompt={openAiWithPrompt} />}
          {view === 'students' && <FacultyStudents studentsList={studentsList} openAiWithPrompt={openAiWithPrompt} />}


          {view === 'whiteboard' && (() => {
            const ctx = ensureContext();
            return (
              <div className="nexus-hub-viewport">
                <header className="f-view-header">
                  <div>
                    <h2>SMART PAINT <span>BOARD</span></h2>
                    <p className="nexus-subtitle">Write, draw and share directly to students of {ctx?.subject || 'Class'}</p>
                  </div>
                  {myClasses.length > 0 && (
                    <select
                      className="f-context-select"
                      onChange={(e) => {
                        const [yr, subj] = e.target.value.split('-');
                        const cls = myClasses.find(c => String(c.year) === yr && c.subject === subj);
                        if (cls) setActiveContext(cls);
                      }}
                      value={ctx ? `${ctx.year}-${ctx.subject}` : ''}
                    >
                      {myClasses.map(c => (
                        <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                          {c.subject} (YEAR {c.year})
                        </option>
                      ))}
                    </select>
                  )}
                </header>

                <div className="whiteboard-fullscreen-layout" style={{ position: 'relative', height: 'calc(100vh - 180px)' }}>
                  <Whiteboard
                    onSave={handleSaveWhiteboard}
                    onPreview={() => setShowPreviewModal(true)}
                    historyCount={whiteboardHistory.length}
                  />
                </div>

                {/* Preview Modal */}
                {showPreviewModal && (
                  <div
                    className="preview-modal-overlay"
                    onClick={() => setShowPreviewModal(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.95)',
                      zIndex: 9999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div
                      className="preview-modal-content"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '2rem',
                        maxWidth: '1200px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                          <FaFileAlt style={{ marginRight: '0.75rem' }} />
                          Previous Sessions
                        </h2>
                        <button
                          onClick={() => setShowPreviewModal(false)}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            color: '#64748b'
                          }}
                        >
                          ×
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {whiteboardHistory.map(board => (
                          <div
                            key={board._id}
                            className="preview-board-card"
                            style={{
                              borderRadius: '16px',
                              border: '2px solid #f1f5f9',
                              overflow: 'hidden',
                              transition: 'all 0.3s',
                              background: 'white'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-5px)';
                              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
                              e.currentTarget.style.borderColor = '#667eea';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.borderColor = '#f1f5f9';
                            }}
                          >
                            <div onClick={() => setPreviewBoard(board)} style={{ cursor: 'pointer' }}>
                              <img src={board.imageData} alt="preview" style={{ width: '100%', height: '200px', objectFit: 'contain', background: '#f8fafc' }} />
                              <div style={{ padding: '1rem' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>{board.subject}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(board.createdAt).toLocaleDateString()}</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                              display: 'flex',
                              gap: '0.5rem',
                              padding: '0 1rem 1rem 1rem',
                              borderTop: '1px solid #f1f5f9'
                            }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const link = document.createElement('a');
                                  link.href = board.imageData;
                                  link.download = `${board.subject}_${new Date(board.createdAt).toLocaleDateString()}.png`;
                                  link.click();
                                }}
                                style={{
                                  flex: 1,
                                  padding: '0.75rem',
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                <FaDownload /> Download
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteWhiteboard(board._id);
                                }}
                                style={{
                                  flex: 1,
                                  padding: '0.75rem',
                                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                        {whiteboardHistory.length === 0 && (
                          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            <FaFileAlt size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No saved sessions yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Preview Modal */}
                {previewBoard && (
                  <div
                    className="full-preview-overlay"
                    onClick={() => setPreviewBoard(null)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.98)',
                      zIndex: 10000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem'
                    }}
                  >
                    <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95%', maxHeight: '95%' }}>
                      <button
                        onClick={() => setPreviewBoard(null)}
                        style={{
                          position: 'absolute',
                          top: '2rem',
                          right: '2rem',
                          background: '#f1f5f9',
                          border: 'none',
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          color: '#64748b',
                          zIndex: 10
                        }}
                      >
                        ×
                      </button>
                      <img
                        src={previewBoard.imageData}
                        alt="Full preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '90vh',
                          borderRadius: '16px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {view === 'broadcast' && (
            <div className="nexus-hub-viewport" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="f-node-card animate-slide-up">
                <div className="f-modal-header">
                  <FaBullhorn style={{ fontSize: '2rem' }} />
                  <h2>SYSTEM BROADCAST</h2>
                </div>
                <form onSubmit={handleSendMessage} className="f-broadcast-form">
                  <div className="nexus-group">
                    <label className="f-form-label">Target Course Pipeline</label>
                    <select name="targetClass" className="f-form-select">
                      {myClasses.map(c => (
                        <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                          {c.subject} (YEAR {c.year})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="nexus-group">
                    <label className="f-form-label">Transmission Signal</label>
                    <textarea name="message" placeholder="Type your announcement..." required className="f-form-textarea" style={{ height: '200px' }}></textarea>
                  </div>
                  <div className="f-modal-actions">
                    <button type="submit" className="f-quick-btn primary" style={{ width: '100%', borderRadius: '16px' }}>INITIATE BROADCAST</button>
                  </div>
                </form>
              </div>
            </div>
          )}


        </div>
      </div>

      <PersonalDetailsBall role="faculty" data={facultyData} />
      <div className="ai-fab" onClick={toggleAiModal} title="AI Assistant">
        <FaRobot />
        <span className="fab-label">Ask AI</span>
      </div>

      {showAiModal && (
        <div className="nexus-modal-overlay" onClick={toggleAiModal}>
          <div className="nexus-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', width: '90%', position: 'relative' }}>
            <button className="nexus-modal-close" onClick={toggleAiModal}>
              &times;
            </button>
            <div className="nexus-modal-body" style={{ padding: 0 }}>
              <VuAiAgent onNavigate={(path) => {
                const target = String(path).toLowerCase();
                setShowAiModal(false);
                setAiInitialPrompt('');

                const viewMap = {
                  'overview': 'overview',
                  'materials': 'materials',
                  'assignment': 'assignments',
                  'assignments': 'assignments',
                  'mark': 'marks',
                  'marks': 'marks',
                  'analytics': 'analytics',
                  'intel': 'analytics',
                  'intelligence': 'analytics',
                  'attend': 'attendance',
                  'attendance': 'attendance',
                  'exam': 'exams',
                  'exams': 'exams',
                  'schedule': 'schedule',
                  'settings': 'settings',
                  'message': 'messages',
                  'messages': 'messages',
                  'students': 'students',
                  'achievement': 'students',
                  'achievements': 'students',
                  'broadcast': 'broadcast',
                  'curriculum': 'curriculum'
                };

                let matched = false;
                Object.keys(viewMap).forEach(key => {
                  if (target.includes(key)) {
                    setView(viewMap[key]);
                    matched = true;
                  }
                });

                if (!matched) {
                  console.log('AI requested unknown path:', path);
                }
              }} initialMessage={aiInitialPrompt} />
            </div>
          </div>
        </div>
      )}

      {showMsgModal && (
        <div className="nexus-modal-overlay" onClick={() => setShowMsgModal(false)}>
          <div className="nexus-modal-content" onClick={e => e.stopPropagation()}>
            <div className="f-modal-header" style={{ padding: '2rem 2rem 0', marginBottom: '1rem' }}>
              <FaBullhorn /><h2>QUICK ALERT</h2>
            </div>
            <div className="nexus-modal-body" style={{ padding: '0 2rem 2rem' }}>
              <form onSubmit={handleSendMessage} className="f-broadcast-form">
                <div className="nexus-group">
                  <label className="f-form-label">Target Class</label>
                  <select name="targetClass" className="f-form-select">
                    {myClasses.map(c => (
                      <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                        {c.subject} (YEAR {c.year})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="nexus-group">
                  <label className="f-form-label">Message</label>
                  <textarea name="message" placeholder="Type info..." required className="f-form-textarea" style={{ height: '100px' }}></textarea>
                </div>
                <div className="f-modal-actions">
                  <button type="button" onClick={() => setShowMsgModal(false)} className="f-cancel-btn">CLOSE</button>
                  <button type="submit" className="f-quick-btn primary">SEND</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};
FacultyDashboard.propTypes = {
  facultyData: PropTypes.object.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
  setIsFaculty: PropTypes.func.isRequired,
};

export default FacultyDashboard;
