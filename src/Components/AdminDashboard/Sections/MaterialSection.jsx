import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaDownload, FaDatabase, FaBoxOpen } from 'react-icons/fa';

/**
 * SENTINEL KNOWLEDGE ARCHIVE
 * Centralized repository for academic assets and intelligence materials.
 */
const MaterialSection = ({ materials, openModal, handleDeleteMaterial, getFileUrl }) => {
    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>KNOWLEDGE <span>ARCHIVES</span></h1>
                    <p>Total data modules: {materials.length} assets indexed</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('material')}>
                        <FaPlus /> UPLOAD DATA MODULE
                    </button>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 850 }}>
                        Visibility controlled by year/section permission protocols.
                    </div>
                </div>
            </header>

            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-grid-table">
                        <thead>
                            <tr>
                                <th>ASSET IDENTITY</th>
                                <th>SUBJECT ORIGIN</th>
                                <th>TARGET SECTOR</th>
                                <th>TOPICAL FOCUS</th>
                                <th>ASSET TYPE</th>
                                <th>STRATEGIC ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map((m, idx) => (
                                <tr key={m.id || idx}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="summary-icon-box" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: '#f5f3ff', color: '#7c3aed' }}>
                                                <FaDatabase />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 950 }}>{m.title}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 850 }}>UPLINK: {m.uploadedBy?.name || m.uploadedBy || 'GOVERNANCE'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="admin-badge primary">{m.subject}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <span className="admin-badge primary" style={{ background: '#eff6ff', color: '#1e40af' }}>Y{m.year}</span>
                                            <span className="admin-badge primary" style={{ background: '#f0fdf4', color: '#15803d' }}>S{m.section}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 850, fontSize: '0.85rem' }}>{m.topic}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 850 }}>MOD {m.module} | UNIT {m.unit}</div>
                                    </td>
                                    <td>
                                        <span className={`admin-badge ${m.category === 'assignment' ? 'warning' : 'accent'}`}>
                                            {(m.category || m.type || 'ASSET').toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="f-exam-card" style={{ padding: '0.5rem', background: 'white' }} title="Full Analysis" onClick={() => openModal('material-view', m)}><FaEye /></button>
                                            <button className="f-exam-card" style={{ padding: '0.5rem', background: 'white', color: '#1e40af' }} title="Recalibrate" onClick={() => openModal('material', m)}><FaEdit /></button>
                                            <button className="f-cancel-btn" style={{ padding: '0.5rem' }} title="Decommission" onClick={() => handleDeleteMaterial(m.id)}><FaTrash /></button>
                                            {m.url && m.url !== '#' && (
                                                <a href={getFileUrl(m.url)} target="_blank" rel="noreferrer" className="f-exam-card" style={{ padding: '0.5rem', background: 'var(--admin-primary)', color: 'white' }} title="Download Buffer">
                                                    <FaDownload />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {materials.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '6rem' }}>
                                        <FaBoxOpen style={{ fontSize: '4rem', color: 'var(--admin-border)', marginBottom: '1.5rem' }} />
                                        <div className="f-empty-text">Archive buffers are currently empty. No academic assets detected.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MaterialSection;
