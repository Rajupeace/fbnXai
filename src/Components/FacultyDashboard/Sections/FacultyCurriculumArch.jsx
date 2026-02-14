import React, { useState, useEffect, useMemo } from 'react';
import { FaEdit, FaCheckCircle, FaBookOpen, FaTimes, FaFilter, FaEye, FaLayerGroup, FaFileAlt, FaVideo, FaClipboardList, FaExclamationTriangle, FaCloudUploadAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../FacultyDashboard.css';

/**
 * FACULTY CURRICULUM MANAGEMENT SECTION
 * Professional V4 Upgrade: Gap Analysis & Resource Tracking
 */
import { apiGet, apiPut } from '../../../utils/apiClient';

/**
 * FACULTY CURRICULUM MANAGEMENT SECTION
 * Professional V4 Upgrade: Gap Analysis & Resource Tracking
 */
const FacultyCurriculumArch = ({ myClasses = [], materialsList = [], currentFaculty = {}, getFileUrl = (url) => url }) => {
  // Use first assigned subject or fallback
  const initialSubject = myClasses.length > 0 ? myClasses[0].subject : 'General';
  const [activeSubject, setActiveSubject] = useState(initialSubject);
  const [activeSection, setActiveSection] = useState('UNIT 1');
  const [editMode, setEditMode] = useState(false);
  const [allCourses, setAllCourses] = useState([]);

  // Initialize data structure
  const [curriculumData, setCurriculumData] = useState({});

  // Fetch Courses from Backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiGet('/api/courses');
        if (Array.isArray(data)) {
          setAllCourses(data);
        }
      } catch (e) {
        console.error("Failed to fetch courses for curriculum:", e);
      }
    };
    fetchCourses();
  }, []);

  // Sync activeSubject with Backend Data
  useEffect(() => {
    if (!activeSubject) return;

    // Find the course object for this subject
    const courseObj = allCourses.find(c =>
      (c.name === activeSubject) ||
      (c.subject === activeSubject) ||
      (c.code && c.code.includes(activeSubject))
    );

    if (courseObj && courseObj.modules && courseObj.modules.length > 0) {
      // Transform Backend Modules to UI Structure
      const mappedData = {};
      courseObj.modules.forEach(mod => {
        mappedData[mod.name] = {
          name: mod.name,
          description: mod.description || `Educational modules for ${activeSubject} - ${mod.name}`,
          subsections: mod.units || Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            title: `Topic ${i + 1}`,
            content: '',
            credits: 2,
            duration: '1 week'
          }))
        };
      });
      setCurriculumData(prev => ({ ...prev, [activeSubject]: mappedData }));
    } else if (!curriculumData[activeSubject]) {
      // Fallback to Default Structure if no API data exists
      const initial = {};
      const units = ['UNIT 1', 'UNIT 2', 'UNIT 3', 'UNIT 4', 'UNIT 5'];
      units.forEach(unit => {
        initial[unit] = {
          name: `${unit}`,
          description: `Educational modules for ${activeSubject} - ${unit}`,
          subsections: Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            title: `Topic ${i + 1}`,
            content: '',
            credits: 2,
            duration: '1 week'
          }))
        };
      });
      setCurriculumData(prev => ({ ...prev, [activeSubject]: initial }));
    }
  }, [activeSubject, allCourses, curriculumData]);

  const updateSubsection = (subj, unit, subsectionId, field, value) => {
    setCurriculumData(prev => ({
      ...prev,
      [subj]: {
        ...prev[subj],
        [unit]: {
          ...prev[subj][unit],
          subsections: prev[subj][unit].subsections.map(sub =>
            sub.id === subsectionId ? { ...sub, [field]: value } : sub
          )
        }
      }
    }));
  };

  const handleSave = async () => {
    // 1. Find Course ID
    const courseObj = allCourses.find(c =>
      (c.name === activeSubject) ||
      (c.subject === activeSubject) ||
      (c.code && c.code.includes(activeSubject))
    );

    if (!courseObj) {
      alert("Error: Course not found in database. Cannot save.");
      return;
    }

    const currentSubjectData = curriculumData[activeSubject];
    if (!currentSubjectData) return;

    // 2. Transform UI Structure back to Backend Modules
    const modulesPayload = Object.keys(currentSubjectData).map(unitKey => ({
      name: unitKey, // 'UNIT 1'
      description: currentSubjectData[unitKey].description,
      units: currentSubjectData[unitKey].subsections // Save topics as 'units' array
    }));

    try {
      await apiPut(`/api/courses/${courseObj.id || courseObj._id}`, { modules: modulesPayload });
      alert("Curriculum Plan Saved to Database!");
      setEditMode(false);
      // Refresh local course list to keep sync
      const refreshed = await apiGet('/api/courses');
      if (Array.isArray(refreshed)) setAllCourses(refreshed);
    } catch (e) {
      console.error("Save failed:", e);
      alert("Failed to save curriculum: " + e.message);
    }
  };

  const currentSubjectData = curriculumData[activeSubject] || {};
  const units = Object.keys(currentSubjectData).sort();

  // --- GAP ANALYSIS LOGIC ---
  const currentUnitNum = activeSection.replace(/\D/g, '');

  // Filter materials for the current Subject and Unit
  const unitMaterials = useMemo(() => {
    return materialsList.filter(m => {
      const subMatch = (m.subject || '').toLowerCase() === activeSubject.toLowerCase();
      // Loose unit matching
      const unitMatch = String(m.unit) === String(currentUnitNum);
      return subMatch && unitMatch;
    });
  }, [materialsList, activeSubject, currentUnitNum]);

  // Function to check coverage for a specific topic title
  const getTopicCoverage = (topicTitle) => {
    if (!topicTitle || topicTitle.includes('Topic')) return { notes: false, video: false, paper: false }; // Ignore default placeholders

    // Fuzzy Search: Check if material title contains topic keywords (simplified)
    const matches = unitMaterials.filter(m => {
      const mTitle = (m.title || '').toLowerCase();
      const tTitle = topicTitle.toLowerCase();
      // Match if material title contains topic title OR topic title contains material title (overlap)
      return mTitle.includes(tTitle) || tTitle.includes(mTitle);
    });

    return {
      notes: matches.some(m => m.type === 'notes'),
      video: matches.some(m => m.type === 'videos'),
      paper: matches.some(m => ['modelPapers', 'previousQuestions'].includes(m.type))
    };
  };

  return (
    <div className="animate-fade-in dashboard-glass-panel">
      <header className="f-view-header">
        <div>
          <h2>CURRICULUM <span>ARCHITECT</span></h2>
          <p className="nexus-subtitle">
            Planning & Content Gap Analysis for: <strong>{activeSubject}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="f-pill-control" style={{ minWidth: '220px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <FaFilter style={{ color: 'var(--nexus-primary)' }} />
            <select
              value={activeSubject}
              onChange={(e) => {
                setActiveSubject(e.target.value);
                setActiveSection('UNIT 1');
                setEditMode(false);
              }}
              style={{ padding: '0.4rem', fontWeight: 800, color: '#334155' }}
            >
              {myClasses.length > 0 ? (
                myClasses.map(c => (
                  <option key={`${c.subject}-${c.year}`} value={c.subject}>
                    {c.subject} (YR {c.year})
                  </option>
                ))
              ) : (
                <option value="General">General Curriculum</option>
              )}
            </select>
          </div>

          <div className="f-node-actions">
            {editMode ? (
              <>
                <button className="f-logout-btn" style={{ background: '#fef2f2', color: '#dc2626' }} onClick={() => setEditMode(false)}>
                  <FaTimes /> CANCEL
                </button>
                <button className="f-logout-btn" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #10b981' }} onClick={handleSave}>
                  <FaCheckCircle /> SAVE PLAN
                </button>
              </>
            ) : (
              <button className="f-logout-btn" style={{ background: 'var(--nexus-primary)', color: 'white', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }} onClick={() => setEditMode(true)}>
                <FaEdit /> PLAN TOPICS
              </button>
            )}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        {/* SIDEBAR: CHAPTERS */}
        <div className="f-node-card" style={{ padding: '0', overflow: 'hidden', height: 'fit-content' }}>
          <div className="f-node-head" style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <h4 className="f-node-title" style={{ fontSize: '0.95rem', letterSpacing: '0.05em' }}><FaLayerGroup /> CHAPTERS</h4>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {units.map(unit => (
              <motion.button
                key={unit}
                whileHover={{ x: 4 }}
                onClick={() => setActiveSection(unit)}
                className={`f-segment-btn ${activeSection === unit ? 'active' : ''}`}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid ' + (activeSection === unit ? 'var(--nexus-primary)' : '#f1f5f9'),
                  background: activeSection === unit ? 'linear-gradient(135deg, var(--nexus-primary) 0%, var(--nexus-secondary) 100%)' : 'white',
                  color: activeSection === unit ? 'white' : '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: activeSection === unit ? '0 8px 16px rgba(79, 70, 229, 0.2)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                {unit}
                {activeSection === unit && <FaCheckCircle style={{ opacity: 0.5 }} />}
              </motion.button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT: DETAILS & COVERAGE */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="f-node-card"
            style={{ padding: '2rem', minHeight: '600px', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 950, color: '#1e293b', margin: '0 0 0.5rem' }}>
                {activeSection} <span style={{ fontWeight: 400, color: '#94a3b8' }}>Planner</span>
              </h3>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>
                {currentSubjectData[activeSection]?.description}
              </p>
            </div>

            {/* TOPIC PLANNER TABLE */}
            <div className="f-roster-wrap" style={{ flex: 1, boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead className="f-roster-head" style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1.25rem' }}>TOPIC TITLE</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem', width: '30%' }}>LEARNING OBJECTIVE</th>
                    <th style={{ textAlign: 'center', padding: '1.25rem' }}>RESOURCES (GAP ANALYSIS)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSubjectData[activeSection]?.subsections.map((topic) => {
                    const coverage = getTopicCoverage(topic.title);
                    const isMissing = !coverage.notes && !coverage.video && !coverage.paper;
                    const isDefault = topic.title.includes('Topic');

                    return (
                      <tr key={topic.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1.25rem', fontWeight: 800, color: '#334155' }}>
                          {editMode ? (
                            <input
                              className="f-form-select"
                              style={{ padding: '0.6rem', marginBottom: 0, fontWeight: 700 }}
                              value={topic.title}
                              onChange={(e) => updateSubsection(activeSubject, activeSection, topic.id, 'title', e.target.value)}
                              placeholder="Enter Topic Name..."
                            />
                          ) : (
                            <span style={{ fontSize: '0.95rem' }}>{topic.title}</span>
                          )}
                        </td>
                        <td style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                          {editMode ? (
                            <input
                              className="f-form-select"
                              style={{ padding: '0.6rem', marginBottom: 0 }}
                              value={topic.content}
                              onChange={(e) => updateSubsection(activeSubject, activeSection, topic.id, 'content', e.target.value)}
                              placeholder="Brief description..."
                            />
                          ) : (topic.content || <em style={{ opacity: 0.5 }}>No objective defined</em>)}
                        </td>
                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
                            {/* Resource Indicators */}
                            <div title={coverage.notes ? "Notes Uploaded" : "Notes Missing"} style={{ opacity: coverage.notes ? 1 : 0.2, color: coverage.notes ? '#10b981' : '#cbd5e1', fontSize: '1.2rem' }}>
                              <FaFileAlt />
                            </div>
                            <div title={coverage.video ? "Video Uploaded" : "Video Missing"} style={{ opacity: coverage.video ? 1 : 0.2, color: coverage.video ? '#f59e0b' : '#cbd5e1', fontSize: '1.2rem' }}>
                              <FaVideo />
                            </div>
                            <div title={coverage.paper ? "Model Paper Uploaded" : "Paper Missing"} style={{ opacity: coverage.paper ? 1 : 0.2, color: coverage.paper ? '#ec4899' : '#cbd5e1', fontSize: '1.2rem' }}>
                              <FaClipboardList />
                            </div>

                            {/* Upload Prompt for Missing */}
                            {!editMode && !isDefault && isMissing && (
                              <span style={{ marginLeft: '1rem', fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#fef2f2', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                                <FaExclamationTriangle /> MISSING
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MATCHED RESOURCES FOOTER */}
            <div style={{ marginTop: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#64748b' }}>
                  SYSTEM DETECTED RESOURCES ({unitMaterials.length})
                </h4>
              </div>

              {unitMaterials.length > 0 ? (
                <div className="f-materials-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {unitMaterials.map((m, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={i}
                      className="f-node-card"
                      style={{ padding: '1rem', border: '1px solid #e2e8f0' }}
                    >
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                        <div style={{
                          padding: '0.6rem',
                          borderRadius: '8px',
                          background: m.type === 'videos' ? '#fffbeb' : '#f0fdf4',
                          color: m.type === 'videos' ? '#f59e0b' : '#10b981',
                          fontSize: '1.1rem'
                        }}>
                          {m.type === 'videos' ? <FaVideo /> : <FaBookOpen />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.title}>
                            {m.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Match: Subject + Unit {m.unit}
                          </div>
                        </div>
                        <button onClick={() => window.open(getFileUrl(m.url), '_blank')} className="f-node-btn view" style={{ width: '28px', height: '28px' }}>
                          <FaEye />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
                  <FaCloudUploadAlt style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, color: '#94a3b8', fontWeight: 600 }}>No materials found linked to {activeSubject} {activeSection}</p>
                </div>
              )}
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FacultyCurriculumArch;
