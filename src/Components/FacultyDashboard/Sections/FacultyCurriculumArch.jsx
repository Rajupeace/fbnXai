import React, { useState } from 'react';
import { FaSave, FaEdit } from 'react-icons/fa';
import '../FacultyDashboard.css';

/**
 * FACULTY CURRICULUM MANAGEMENT SECTION
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
        description: '',
        subsections: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          title: `Topic ${i + 1}`,
          content: '',
          credits: 0,
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
    alert('✅ Curriculum updates saved!');
    setEditMode(false);
  };

  const sections = Object.keys(curriculumData).sort();

  return (
    <div className="faculty-curriculum-arch">
      <div className="curriculum-header">
        <h2>📚 Curriculum Architecture Management</h2>
        <div className="curriculum-header-actions">
          {editMode ? (
            <>
              <button className="btn btn-success" onClick={handleSave}>
                <FaSave /> Save Changes
              </button>
              <button className="btn btn-cancel" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-edit" onClick={() => setEditMode(true)}>
              <FaEdit /> Edit Curriculum
            </button>
          )}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="curriculum-nav">
        <h3>Sections (A - T)</h3>
        <div className="section-grid">
          {sections.map(section => (
            <button
              key={section}
              className={`section-btn ${activeSection === section ? 'active' : ''}`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="curriculum-content">
        <div className="section-info">
          <h3>{curriculumData[activeSection]?.name}</h3>
          <p>{curriculumData[activeSection]?.description}</p>
        </div>

        {/* Topics Table */}
        <div className="topics-container">
          <h4>Topics (1-20) for Section {activeSection}</h4>
          <div className="table-wrapper">
            <table className="topics-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Topic Title</th>
                  <th>Content</th>
                  <th>Credits</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {curriculumData[activeSection]?.subsections.map((topic) => (
                  <tr key={topic.id} className={editMode ? 'editable' : ''}>
                    <td className="topic-number">{topic.id}</td>
                    <td>
                      {editMode ? (
                        <input
                          type="text"
                          value={topic.title}
                          onChange={(e) => updateSubsection(activeSection, topic.id, 'title', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        <span>{topic.title}</span>
                      )}
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="text"
                          value={topic.content}
                          onChange={(e) => updateSubsection(activeSection, topic.id, 'content', e.target.value)}
                          className="edit-input"
                          placeholder="Content description"
                        />
                      ) : (
                        <span>{topic.content || '-'}</span>
                      )}
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="number"
                          value={topic.credits}
                          onChange={(e) => updateSubsection(activeSection, topic.id, 'credits', parseFloat(e.target.value))}
                          className="edit-input credit-input"
                          min="0"
                          max="10"
                        />
                      ) : (
                        <span>{topic.credits}</span>
                      )}
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="text"
                          value={topic.duration}
                          onChange={(e) => updateSubsection(activeSection, topic.id, 'duration', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        <span>{topic.duration}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .faculty-curriculum-arch {
          padding: 2rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
          border-radius: 12px;
          margin: 1rem 0;
        }

        .curriculum-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e0e7ff;
        }

        .curriculum-header h2 {
          margin: 0;
          color: #1e3a8a;
          font-size: 1.5rem;
        }

        .curriculum-header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #3b82f6;
          color: white;
        }

        .btn-edit:hover {
          background: #2563eb;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-cancel {
          background: #ef4444;
          color: white;
        }

        .btn-cancel:hover {
          background: #dc2626;
        }

        .curriculum-nav {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e0e7ff;
          margin-bottom: 2rem;
        }

        .curriculum-nav h3 {
          margin: 0 0 1rem 0;
          color: #1e3a8a;
          font-size: 1rem;
          font-weight: 600;
        }

        .section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          gap: 0.75rem;
        }

        .section-btn {
          padding: 0.75rem;
          border: 2px solid #e0e7ff;
          background: white;
          color: #1e3a8a;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .section-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #f0f9ff;
        }

        .section-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .curriculum-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #e0e7ff;
        }

        .section-info {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e0e7ff;
        }

        .section-info h3 {
          margin: 0;
          color: #1e3a8a;
          font-size: 1.2rem;
        }

        .section-info p {
          margin: 0.5rem 0 0 0;
          color: #64748b;
          font-size: 0.95rem;
        }

        .topics-container {
          margin-top: 2rem;
        }

        .topics-container h4 {
          margin: 0 0 1rem 0;
          color: #1e3a8a;
          font-size: 1rem;
          font-weight: 600;
        }

        .table-wrapper {
          overflow-x: auto;
          border: 1px solid #e0e7ff;
          border-radius: 8px;
        }

        .topics-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .topics-table thead tr {
          background: #f0f9ff;
          border-bottom: 2px solid #e0e7ff;
        }

        .topics-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #1e3a8a;
          font-size: 0.9rem;
        }

        .topics-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e0e7ff;
          color: #334155;
        }

        .topic-number {
          font-weight: 600;
          color: #3b82f6;
          text-align: center;
          width: 50px;
        }

        .topics-table tr.editable {
          background: #f0f9ff;
        }

        .edit-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e0e7ff;
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.9rem;
          color: #1e3a8a;
        }

        .edit-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .credit-input {
          text-align: center;
          max-width: 80px;
        }

        @media (max-width: 768px) {
          .curriculum-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .curriculum-header-actions {
            width: 100%;
          }

          .curriculum-header-actions button {
            flex: 1;
          }

          .section-grid {
            grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
          }

          .topics-table {
            font-size: 0.85rem;
          }

          .topics-table th,
          .topics-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FacultyCurriculumArch;
