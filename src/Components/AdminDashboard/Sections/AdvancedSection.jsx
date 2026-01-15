import React from 'react';
import { FaPlus, FaEye } from 'react-icons/fa';

const AdvancedSection = ({ topics, materials, openModal }) => {
    return (
        <div className="section-container">
            <div className="actions-bar">
                <button className="btn-primary" onClick={() => openModal('material', { isAdvanced: true })}>
                    <FaPlus /> Add Advanced Content
                </button>
                <div className="info-text">
                    Manage content for Advanced Learning modules (Python, Java, React, etc.).
                </div>
            </div>

            <div className="cards-grid">
                {topics.map(topic => {
                    // Count items
                    const count = materials.filter(m => m.subject === topic).length;
                    return (
                        <div key={topic} className="info-card course-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, color: '#0f172a' }}>{topic}</h3>
                                <span className="badge" style={{ background: count > 0 ? '#3b82f6' : '#cbd5e1' }}>{count} items</span>
                            </div>
                            <div className="card-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-icon" onClick={() => openModal('syllabus-view', { name: topic, isAdvanced: true })} title="View Content">
                                    <FaEye /> View
                                </button>
                                <button className="btn-icon" onClick={() => openModal('material', { subject: topic, isAdvanced: true })} title="Add Content">
                                    <FaPlus /> Add
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdvancedSection;
