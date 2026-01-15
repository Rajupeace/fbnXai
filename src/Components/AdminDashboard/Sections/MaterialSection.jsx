import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaDownload } from 'react-icons/fa';

const MaterialSection = ({ materials, openModal, handleDeleteMaterial, getFileUrl }) => {
    return (
        <div className="section-container">
            <div className="actions-bar">
                <button className="btn-primary" onClick={() => openModal('material')}>
                    <FaPlus /> Upload Material
                </button>
                <div className="info-text">
                    Materials will be visible to Students & Faculty based on Year/Section.
                </div>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Target</th>
                        <th>Topic</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {materials.map((m, idx) => (
                        <tr key={m.id || idx}>
                            <td>
                                <div style={{ fontWeight: 500 }}>{m.title}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>By: {m.uploadedBy?.name || m.uploadedBy || 'Unknown'}</div>
                            </td>
                            <td>{m.subject}</td>
                            <td>
                                <span className="badge syllabus">Y:{m.year}</span>
                                <span className="badge" style={{ marginLeft: 4 }}>Sec:{m.section}</span>
                            </td>
                            <td>{m.topic} <span style={{ fontSize: '0.75rem', color: '#888' }}>(M{m.module}/U{m.unit})</span></td>
                            <td><span className={`badge ${m.category || m.type}`}>{m.category || m.type}</span></td>
                            <td>
                                <button className="btn-icon" title="View Details" onClick={() => openModal('material-view', m)}><FaEye /></button>
                                <button className="btn-icon" title="Edit" onClick={() => openModal('material', m)}><FaEdit /></button>
                                <button className="btn-icon danger" title="Delete" onClick={() => handleDeleteMaterial(m.id)}><FaTrash /></button>
                                {m.url && m.url !== '#' && <a href={getFileUrl(m.url)} target="_blank" rel="noreferrer" className="btn-icon"><FaDownload /></a>}
                            </td>
                        </tr>
                    ))}
                    {materials.length === 0 && <tr><td colSpan="6" className="empty-state">No materials uploaded yet.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

export default MaterialSection;
