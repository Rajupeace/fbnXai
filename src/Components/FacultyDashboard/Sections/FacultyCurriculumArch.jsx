import React, { useState } from 'react';
import { FaSave, FaEdit, FaLayerGroup, FaClock, FaCheckCircle, FaBookOpen, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../FacultyDashboard.css';

/**
 * FACULTY CURRICULUM MANAGEMENT SECTION
 * Professional "Nexus" Style Update
 * Faculty can manage curriculum sections A-T and topics 1-20
 */
const FacultyCurriculumArch = () => {
  const [curriculumData, setCurriculumData] = useState(() => {
    const stored = localStorage.getItem('curriculumArch');
    if (stored) return JSON.parse(stored);

    const initial = {};
    const sections = 'ABCDEFGHIJKLMNOPQRST'.split('');
    sections.forEach(section => {
      initial[section] = {
        name: `Section ${section}`,
        description: 'Comprehensive curriculum module focusing on core competencies and advanced topics.',
        subsections: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          title: `Topic ${i + 1}`,
          content: '',
          credits: 3,
          duration: '4 weeks'
        }))
      };
    });
    return initial;
  });

  const [activeSection, setActiveSection] = useState('A');
  const [editMode, setEditMode] = useState(false);

  const updateSubsection = (section, subsectionId, field, value) => {
    setCurriculumData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        subsections: prev[section].subsections.map(sub =>
          sub.id === subsectionId ? { ...sub, [field]: value } : sub
        )
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('curriculumArch', JSON.stringify(curriculumData));
    // Optional: Add visual feedback toast here
    setEditMode(false);
  };

  const sections = Object.keys(curriculumData).sort();

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <header className="f-view-header">
        <div>
          <h2>CURRICULUM <span>ARCHITECTURE</span></h2>
          <p className="nexus-subtitle">Manage syllabus, modules, and credit distribution</p>
        </div>
        <div className="f-node-actions">
          {editMode ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="f-logout-btn"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}
                onClick={() => setEditMode(false)}
              >
                <FaTimes /> CANCEL
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="f-logout-btn"
                style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
                onClick={handleSave}
              >
                <FaCheckCircle /> SAVE CHANGES
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="f-logout-btn"
              style={{ background: 'white', color: 'var(--nexus-primary)', border: '1px solid var(--nexus-primary)' }}
              onClick={() => setEditMode(true)}
            >
              <FaEdit /> EDIT CURRICULUM
            </motion.button>
          )}
        </div>
      </header>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>

        {/* Navigation Sidebar */}
        <div className="f-node-card bounce-in" style={{ padding: '1.5rem', height: 'fit-content', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <div className="f-node-head" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <h4 className="f-node-title" style={{ fontSize: '1rem' }}><FaLayerGroup /> SECTIONS</h4>
            <span className="f-meta-badge unit">{sections.length} TOTAL</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
            {sections.map(section => (
              <motion.button
                key={section}
                whileHover={{ scale: 1.1, backgroundColor: 'var(--nexus-primary)', color: 'white' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveSection(section)}
                className={`
                  f-student-index 
                  ${activeSection === section ? 'active-section' : ''}
                `}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  border: activeSection === section ? 'none' : '1px solid #e2e8f0',
                  background: activeSection === section ? 'var(--nexus-primary)' : 'white',
                  color: activeSection === section ? 'white' : '#64748b',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {section}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-slide-up">
          <div className="f-node-card" style={{ padding: '2.5rem', minHeight: '600px' }}>

            {/* Section Info Header */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--text-main)', margin: '0 0 0.5rem 0', letterSpacing: '-1px' }}>
                    {curriculumData[activeSection]?.name}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '800px', fontWeight: 500 }}>
                    {curriculumData[activeSection]?.description}
                  </p>
                </div>
                <div className="f-node-type-icon" style={{ fontSize: '2rem', width: '64px', height: '64px' }}>
                  {activeSection}
                </div>
              </div>
            </div>

            {/* Topics Grid/Table */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <FaBookOpen style={{ color: 'var(--nexus-primary)' }} />
                <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: '#1e293b' }}>
                  TOPICS & MODULES
                </h4>
              </div>

              <div className="f-roster-wrap">
                <table className="f-roster-list" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead className="f-roster-head">
                    <tr>
                      <th style={{ textAlign: 'left', padding: '1rem 1.5rem' }}>ID</th>
                      <th style={{ textAlign: 'left', padding: '1rem 1.5rem' }}>TOPIC TITLE</th>
                      <th style={{ textAlign: 'left', padding: '1rem 1.5rem' }}>CONTENT SUMMARY</th>
                      <th style={{ textAlign: 'center', padding: '1rem 1.5rem' }}>CREDITS</th>
                      <th style={{ textAlign: 'right', padding: '1rem 1.5rem' }}>DURATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculumData[activeSection]?.subsections.map((topic, index) => (
                      <motion.tr
                        key={topic.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                      >
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <span className="f-student-index" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>{topic.id}</span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: '#1e293b' }}>
                          {editMode ? (
                            <input
                              className="f-form-select" // Reusing input style
                              style={{ padding: '0.6rem', marginBottom: 0, fontSize: '0.9rem' }}
                              value={topic.title}
                              onChange={(e) => updateSubsection(activeSection, topic.id, 'title', e.target.value)}
                            />
                          ) : topic.title}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem', maxWidth: '300px' }}>
                          {editMode ? (
                            <input
                              className="f-form-select"
                              style={{ padding: '0.6rem', marginBottom: 0, fontSize: '0.9rem' }}
                              value={topic.content}
                              placeholder="Enter description..."
                              onChange={(e) => updateSubsection(activeSection, topic.id, 'content', e.target.value)}
                            />
                          ) : (topic.content || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>No content defined</span>)}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                          {editMode ? (
                            <input
                              type="number"
                              className="f-form-select"
                              style={{ padding: '0.6rem', marginBottom: 0, textAlign: 'center', width: '80px', margin: '0 auto' }}
                              value={topic.credits}
                              onChange={(e) => updateSubsection(activeSection, topic.id, 'credits', e.target.value)}
                            />
                          ) : (
                            <span className="f-meta-badge unit">{topic.credits} CR</span>
                          )}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#475569' }}>
                          {editMode ? (
                            <input
                              className="f-form-select"
                              style={{ padding: '0.6rem', marginBottom: 0, textAlign: 'right' }}
                              value={topic.duration}
                              onChange={(e) => updateSubsection(activeSection, topic.id, 'duration', e.target.value)}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <FaClock style={{ color: '#94a3b8' }} size={12} /> {topic.duration}
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyCurriculumArch;
