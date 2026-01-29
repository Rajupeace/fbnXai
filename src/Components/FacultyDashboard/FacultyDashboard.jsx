import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  FaUniversity, FaBullhorn, FaFileAlt, FaEye, FaTrash, FaLayerGroup, FaFilter, FaRobot
} from 'react-icons/fa';
// Global Styles
import sseClient from '../../utils/sseClient';
import MaterialManager from './MaterialManager';
import FacultySettings from './FacultySettings';
import FacultyAttendanceManager from './FacultyAttendanceManager';
import FacultyScheduleView from './FacultyScheduleView';
import FacultyExams from './FacultyExams';
import FacultyAssignments from './FacultyAssignments';
import FacultyMarks from './FacultyMarks';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiDelete, apiPost } from '../../utils/apiClient';

// Sections
import FacultySidebar from './Sections/FacultySidebar';
import FacultyHome from './Sections/FacultyHome';
import FacultyCurriculumArch from './Sections/FacultyCurriculumArch';
import FacultyMessages from './Sections/FacultyMessages';
import FacultyStudents from './Sections/FacultyStudents';
import PersonalDetailsBall from '../PersonalDetailsBall/PersonalDetailsBall';

const FacultyDashboard = ({ facultyData, setIsAuthenticated, setIsFaculty }) => {
  const [view, setView] = useState('overview');
  const [activeContext, setActiveContext] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [, setSyncing] = useState(false); // syncing unused
  const [initialLoad, setInitialLoad] = useState(true);
  const [showMsgModal, setShowMsgModal] = useState(false);

  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refreshAll = async () => {
    setSyncing(true);
    try {
      // console.debug('📊 FacultyDashboard: Fetching data from database...');

      const mats = await apiGet('/api/materials');
      if (mats) {
        // console.debug(`   ✅ Materials fetched: ${mats.length} items`);
        setMaterialsList(mats);
      }

      const adminMsgs = await apiGet('/api/messages');
      if (adminMsgs) {
        const filteredMsgs = adminMsgs.filter(m =>
          m.target === 'all' ||
          m.target === 'faculty' ||
          m.facultyId === facultyData.facultyId
        );
        // console.debug(`   ✅ Messages fetched: ${filteredMsgs.length} items`);
        setMessages(filteredMsgs.slice(0, 10));
      }

      const studentsData = await apiGet(`/api/faculty-stats/${facultyData.facultyId}/students`);
      if (Array.isArray(studentsData)) {
        // console.debug(`   ✅ Students fetched: ${studentsData.length} items`);
        setStudentsList(studentsData);
      }

      // console.debug('✅ FacultyDashboard: All data loaded successfully');
      setTimeout(() => setSyncing(false), 800);
    } catch (e) {
      console.error("❌ FacultyDashboard: Sync Failed", e);
      setSyncing(false);
    }
  };

  useEffect(() => {
    // console.debug('🚀 FacultyDashboard: Initial data load started');
    refreshAll();
    const timer = setTimeout(() => setInitialLoad(false), 1500);

    // Optimized polling: 5 seconds (more efficient than 3s)
    const interval = setInterval(() => {
      // console.debug('🔄 FacultyDashboard: Polling data from database...');
      refreshAll();
    }, 5000);

    // Fast messages update every 5s
    const msgInterval = setInterval(async () => {
      try {
        const query = new URLSearchParams({
          userId: facultyData.facultyId,
          role: 'faculty'
        }).toString();
        const adminMsgs = await apiGet(`/api/messages?${query}`);
        if (adminMsgs) {
          setMessages(adminMsgs.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)).slice(0, 10));
        }
      } catch (e) {
        console.debug('Faculty messages update failed', e);
      }
    }, 5000);

    return () => {
      // console.debug('🛑 FacultyDashboard: Cleaning up intervals');
      clearTimeout(timer);
      clearInterval(interval);
      clearInterval(msgInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = sseClient.onUpdate((ev) => {
      if (!ev || !ev.resource) return;
      // Refresh when materials, students, messages or faculty assignments change
      if (['materials', 'students', 'messages', 'faculty'].includes(ev.resource)) {
        refreshAll();
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const contextToUse = activeContext || myClasses[0];

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

  if (initialLoad) {
    return (
      <div className="faculty-load-overlay">
        <div className="load-content">
          <div className="load-icon-box">
            <FaUniversity className="pulse" />
          </div>
          <h2 className="load-shimmer">Loading Dashboard...</h2>
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
    <div className="student-dashboard-layout animate-fade-in">
      <FacultySidebar
        facultyData={facultyData}
        view={view}
        setView={setView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
      />

      <div className="dashboard-content-area">
        {view === 'overview' && (
          <FacultyHome
            studentsList={studentsList}
            materialsList={materialsList}
            myClasses={myClasses}
            facultyData={facultyData}
            messages={messages}
            getFileUrl={getFileUrl}
            setView={setView}
          />
        )}

        {view === 'materials' && (() => {
          const ctx = ensureContext();
          return ctx ? (
            <div className="nexus-hub-viewport">
              <header className="f-view-header">
                <div>
                  <h2>COURSE <span>MATERIALS</span></h2>
                  <p className="nexus-subtitle">Manage study materials for your courses</p>
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
                        {node.type === 'videos' ? <FaLayerGroup /> : <FaFileAlt />}
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
                      <div className="f-sync-active"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="no-content">No classes assigned.</div>;
        })()}

        {view === 'assignments' && (
          <div className="nexus-hub-viewport">
            <FacultyAssignments facultyId={facultyData.facultyId} />
          </div>
        )}

        {view === 'marks' && (
          <div className="nexus-hub-viewport">
            <FacultyMarks facultyData={facultyData} />
          </div>
        )}

        {view === 'attendance' && (() => {
          const ctx = ensureContext();
          return ctx ? (
            <div className="nexus-hub-viewport">
              <header className="f-view-header">
                <div>
                  <h2>ATTENDANCE <span>ROSTER</span></h2>
                  <p className="nexus-subtitle">Track student attendance</p>
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
                subject={ctx.subject}
                year={ctx.year}
                sections={ctx.sections}
                facultyId={facultyData.facultyId}
                facultyName={facultyData.name}
                branch={facultyData.department}
              />
            </div>
          ) : <div className="no-content">No classes assigned.</div>;
        })()}

        {view === 'exams' && (() => {
          const ctx = ensureContext();
          return ctx ? (
            <div className="nexus-hub-viewport">
              <header className="f-view-header">
                <div>
                  <h2>EXAM <span>MANAGEMENT</span></h2>
                  <p className="nexus-subtitle">Create and manage exams</p>
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
                facultyId={facultyData.facultyId}
                branch={facultyData.department}
              />
            </div>
          ) : <div className="no-content">No classes assigned.</div>;
        })()}

        {view === 'schedule' && (
          <div className="nexus-hub-viewport">
            <FacultyScheduleView facultyData={facultyData} />
          </div>
        )}

        {view === 'curriculum' && (
          <div className="nexus-hub-viewport">
            <FacultyCurriculumArch />
          </div>
        )}

        {view === 'settings' && (
          <div className="nexus-hub-viewport">
            <FacultySettings facultyData={facultyData} />
          </div>
        )}

        {view === 'broadcast' && (
          <div className="nexus-hub-viewport">
            <div className="f-node-card animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="f-modal-header">
                <FaBullhorn style={{ fontSize: '2rem' }} />
                <h2>MAKE ANNOUNCEMENT</h2>
              </div>

              <p style={{ color: '#64748b', marginBottom: '2.5rem', fontWeight: 850 }}>
                Send announcements to your classes.
              </p>

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
                  <textarea
                    name="message"
                    placeholder="Enter announcement text..."
                    required
                    className="f-form-textarea"
                  ></textarea>
                </div>

                <div className="f-modal-actions">
                  <button type="submit" className="nexus-btn-primary">POST ANNOUNCEMENT</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'messages' && (
          <div className="nexus-hub-viewport">
            <FacultyMessages messages={messages} />
          </div>
        )}

        {view === 'students' && (
          <div className="nexus-hub-viewport">
            <FacultyStudents studentsList={studentsList} />
          </div>
        )}
      </div>

      {/* QUICK ANNOUNCEMENT MODAL */}
      {showMsgModal && (
        <div className="nexus-modal-overlay" onClick={() => setShowMsgModal(false)}>
          <div className="nexus-modal-content" onClick={e => e.stopPropagation()}>
            <div className="f-modal-header">
              <FaBullhorn />
              <h2>QUICK ANNOUNCEMENT</h2>
            </div>
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
                <textarea
                  name="message"
                  placeholder="Enter message..."
                  required
                  className="f-form-textarea"
                  style={{ height: '100px' }}
                ></textarea>
              </div>

              <div className="f-modal-actions">
                <button type="button" onClick={() => setShowMsgModal(false)} className="f-cancel-btn">CANCEL</button>
                <button type="submit" className="nexus-btn-primary">SEND</button>
              </div>
            </form>
          </div>
        </div>
      )}


      <PersonalDetailsBall role="faculty" data={facultyData} />

      <div className="ai-fab" onClick={() => setView('ai-agent')} title="Open AI Assistant">
        <FaRobot />
      </div>
      {
        view === 'ai-agent' && (
          <div className="nexus-modal-overlay" onClick={() => setView('overview')}>
            <div className="nexus-modal-content" onClick={e => e.stopPropagation()}>
              <VuAiAgent onNavigate={setView} />
            </div>
          </div>
        )
      }
    </div >
  );
};

FacultyDashboard.propTypes = {
  facultyData: PropTypes.object.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
  setIsFaculty: PropTypes.func.isRequired,
};

export default FacultyDashboard;
