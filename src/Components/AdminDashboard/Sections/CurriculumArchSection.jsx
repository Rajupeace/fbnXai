import React, { useState } from 'react';
import { FaEdit, FaSave } from 'react-icons/fa';
import '../AdminDashboard.css';

/**
 * CURRICULUM ARCHITECTURE SECTION
 * Manage curriculum sections A-T and subsections 1-20
 */
const CurriculumArchSection = () => {
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

  const saveCurriculum = () => {
    localStorage.setItem('curriculumArch', JSON.stringify(curriculumData));
  };

  const updateSection = (section, field, value) => {
    setCurriculumData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

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
    saveCurriculum();
    alert('✅ Curriculum Architecture saved successfully!');
  };

  const sections = Object.keys(curriculumData).sort();

  return (
    <div className="admin-section curriculum-arch-section">
      <div className="section-header">
        <h2>📚 CURRICULUM ARCHITECTURE</h2>
        <p>Manage curriculum sections (A-T) and topics (1-20)</p>
      </div>

      <div className="curriculum-layout">
        {/* Section Navigation */}
        <div className="section-nav">
          <h3>Sections</h3>
          <div className="section-buttons">
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

        {/* Section Details */}
        <div className="section-details">
          <div className="section-header-form">
            <div className="form-group">
              <label>Section Name</label>
              <input
                type="text"
                value={curriculumData[activeSection]?.name || ''}
                onChange={(e) => updateSection(activeSection, 'name', e.target.value)}
                placeholder="Section name"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={curriculumData[activeSection]?.description || ''}
                onChange={(e) => updateSection(activeSection, 'description', e.target.value)}
                placeholder="Section description"
                rows="3"
              />
            </div>
          </div>

          {/* Subsections Table */}
          <div className="subsections-container">
            <h4>Topics (1-20) for Section {activeSection}</h4>
            <div className="subsections-table-wrapper">
              <table className="subsections-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Content</th>
                    <th>Credits</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {curriculumData[activeSection]?.subsections.map((subsection) => (
                    <tr key={subsection.id} className="subsection-row">
                      <td className="subsection-id">{subsection.id}</td>
                      <td>
                        <input
                          type="text"
                          value={subsection.title}
                          onChange={(e) => updateSubsection(activeSection, subsection.id, 'title', e.target.value)}
                          className="subsection-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={subsection.content}
                          onChange={(e) => updateSubsection(activeSection, subsection.id, 'content', e.target.value)}
                          placeholder="Content description"
                          className="subsection-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={subsection.credits}
                          onChange={(e) => updateSubsection(activeSection, subsection.id, 'credits', parseFloat(e.target.value))}
                          className="subsection-input credits-input"
                          min="0"
                          max="10"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={subsection.duration}
                          onChange={(e) => updateSubsection(activeSection, subsection.id, 'duration', e.target.value)}
                          placeholder="e.g., 4 weeks"
                          className="subsection-input"
                        />
                      </td>
                      <td>
                        <button className="action-btn edit-btn" title="Edit">
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="section-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          <FaSave /> Save Curriculum
        </button>
        <button className="btn btn-secondary" onClick={() => {
          if (window.confirm('Reset to defaults?')) {
            setCurriculumData(prev => {
              const reset = {};
              const sections = 'ABCDEFGHIJKLMNOPQRST'.split('');
              sections.forEach(section => {
                reset[section] = {
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
              return reset;
            });
          }
        }}>
          Reset to Defaults
        </button>
      </div>

      <style jsx>{`
        .curriculum-arch-section {
          padding: 2rem;
          background: #f8fafc;
          border-radius: 12px;
          margin: 1rem 0;
        }

        .section-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .section-header h2 {
          margin: 0;
          color: #1e293b;
          font-size: 1.5rem;
        }

        .section-header p {
          margin: 0.5rem 0 0 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .curriculum-layout {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .section-nav {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          height: fit-content;
          max-height: 80vh;
          overflow-y: auto;
        }

        .section-nav h3 {
          margin: 0 0 1rem 0;
          color: #1e293b;
          font-size: 1rem;
        }

        .section-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .section-btn {
          padding: 0.5rem;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .section-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .section-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .section-details {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .section-header-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #1e293b;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.9rem;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .subsections-container {
          margin-top: 2rem;
        }

        .subsections-container h4 {
          margin: 0 0 1rem 0;
          color: #1e293b;
          font-size: 1rem;
        }

        .subsections-table-wrapper {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .subsections-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .subsections-table thead tr {
          background: #f1f5f9;
          border-bottom: 2px solid #e2e8f0;
        }

        .subsections-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #1e293b;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .subsections-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .subsection-id {
          font-weight: 600;
          color: #3b82f6;
          text-align: center;
          width: 50px;
        }

        .subsection-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.9rem;
        }

        .subsection-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .credits-input {
          text-align: center;
          max-width: 80px;
        }

        .action-btn {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #f0f9ff;
        }

        .edit-btn {
          color: #3b82f6;
        }

        .section-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
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

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #1e293b;
        }

        .btn-secondary:hover {
          background: #cbd5e1;
        }

        @media (max-width: 1024px) {
          .curriculum-layout {
            grid-template-columns: 1fr;
          }

          .section-nav {
            max-height: auto;
          }

          .section-buttons {
            grid-template-columns: repeat(4, 1fr);
          }

          .section-header-form {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .curriculum-arch-section {
            padding: 1rem;
          }

          .section-buttons {
            grid-template-columns: repeat(3, 1fr);
          }

          .subsections-table {
            font-size: 0.85rem;
          }

          .subsections-table th,
          .subsections-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CurriculumArchSection;
