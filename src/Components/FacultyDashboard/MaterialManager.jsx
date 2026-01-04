import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaLink, FaHistory, FaFileAlt, FaVideo, FaClipboardList, FaQuestionCircle, FaLayerGroup, FaCalendarAlt, FaPaperPlane, FaEye } from 'react-icons/fa';
import { apiUpload, apiPost, apiGet } from '../../utils/apiClient';

const MaterialManager = ({ selectedSubject, selectedSections, onUploadSuccess }) => {
    const [uploadType, setUploadType] = useState('notes');
    const [materials, setMaterials] = useState({
        notes: null,
        videos: null,
        modelPapers: null,
        syllabus: null,
        assignments: null,
        importantQuestions: null
    });
    const [assignmentDetails, setAssignmentDetails] = useState({ dueDate: '', message: '' });
    const [activeTab, setActiveTab] = useState('upload');
    const [globalResources, setGlobalResources] = useState([]);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastType, setBroadcastType] = useState('announcement');

    useEffect(() => {
        if (selectedSubject && selectedSections.length > 0) {
            fetchGlobalResources();
        }
    }, [selectedSubject, selectedSections]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchGlobalResources = async () => {
        if (!selectedSubject) return;
        const parts = selectedSubject.split(' - Year ');
        const subject = parts[parts.length - 2] || 'General';
        const year = parts[parts.length - 1] || '1';

        try {
            const data = await apiGet(`/api/materials?year=${year}&subject=${encodeURIComponent(subject)}`);
            if (data) {
                setGlobalResources(data.filter(m => String(m.year) === String(year)));
            }
        } catch (err) {
            console.error("Error fetching materials:", err);
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setMaterials(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const getContext = () => {
        const parts = selectedSubject.split(' - Year ');
        const year = parts[parts.length - 1] || '1';
        const subject = parts.slice(0, parts.length - 1).join(' - Year ') || 'General';
        return { subject, year };
    };

    const handleUpload = async () => {
        if (selectedSections.length === 0) {
            alert('Mesh Alert: Select at least one active section target.');
            return;
        }

        const { subject, year } = getContext();
        const file = materials[uploadType];
        if (!file) return alert('Input Required: No data node selected for upload.');

        const module = document.getElementById(`mod-${uploadType}`)?.value || '1';
        const unit = document.getElementById(`uni-${uploadType}`)?.value || '1';
        const topic = document.getElementById(`top-${uploadType}`)?.value || '';

        try {
            for (const section of selectedSections) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('year', year);
                formData.append('section', section);
                formData.append('subject', subject);
                formData.append('type', uploadType);
                formData.append('title', file.name);
                formData.append('module', module);
                formData.append('unit', unit);
                if (topic) formData.append('topic', topic);

                if (uploadType === 'assignments') {
                    formData.append('dueDate', assignmentDetails.dueDate);
                    formData.append('message', assignmentDetails.message);
                }
                await apiUpload('/api/materials', formData);
            }
            alert('✅ Deployment Successful: Content synced to mesh.');
            setMaterials(prev => ({ ...prev, [uploadType]: null }));
            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();
        } catch (error) {
            alert(`Deployment Failed: ${error.message}`);
        }
    };

    const handleLinkAdd = async () => {
        const title = document.getElementById('link-title').value;
        const url = document.getElementById('link-url').value;
        const type = document.getElementById('link-type').value;

        if (!title || !url) return alert('Input Required: Title and URL missing.');
        const { subject, year } = getContext();

        try {
            for (const section of selectedSections) {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('year', year);
                formData.append('section', section);
                formData.append('subject', subject);
                formData.append('type', type);
                formData.append('link', url);
                formData.append('module', '1');
                formData.append('unit', '1');
                formData.append('topic', 'Cloud Resource');
                await apiUpload('/api/materials', formData);
            }
            alert('✅ Cloud Link Synced');
            document.getElementById('link-title').value = '';
            document.getElementById('link-url').value = '';
            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();
        } catch (error) {
            alert('Cloud Sync Failed.');
        }
    };

    return (
        <div className="deployment-hub animate-fade-in">
            <div className="hub-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div className="icon-box" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', width: '48px', height: '48px', fontSize: '1.4rem' }}><FaLayerGroup /></div>
                    <div>
                        <h2 style={{ margin: 0 }}>Content Deployment Hub</h2>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 900, letterSpacing: '1px', marginTop: '0.2rem' }}>CENTRAL NODE DISPATCH E-SYSTEM</div>
                    </div>
                </div>

                <div className="quantum-tabs">
                    <button className={`quantum-tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
                        <FaCloudUploadAlt /> DEPLOYMENT
                    </button>
                    <button className={`quantum-tab-btn ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>
                        <FaLink /> LINKS
                    </button>
                    <button className={`quantum-tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={() => setActiveTab('broadcast')}>
                        <FaPaperPlane /> BROADCAST
                    </button>
                    <button className={`quantum-tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
                        <FaHistory /> REGISTRY
                    </button>
                </div>
            </div>

            <div className="hub-stage">
                {activeTab === 'upload' && (
                    <div className="upload-nexus animate-fade-in">
                        <div className="type-nexus-grid">
                            {[
                                { id: 'notes', label: 'Notes', icon: <FaFileAlt /> },
                                { id: 'videos', label: 'Video', icon: <FaVideo /> },
                                { id: 'assignments', label: 'Task', icon: <FaClipboardList /> },
                                { id: 'modelPapers', label: 'Paper', icon: <FaLayerGroup /> },
                                { id: 'importantQuestions', label: 'Q&A', icon: <FaQuestionCircle /> }
                            ].map(t => (
                                <button key={t.id} className={`nexus-card ${uploadType === t.id ? 'active' : ''}`} onClick={() => setUploadType(t.id)}>
                                    <div className="nexus-icon">{t.icon}</div>
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="nexus-dropzone" onClick={() => document.getElementById(uploadType).click()} style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, background: 'var(--accent-primary)', pointerEvents: 'none' }}></div>
                            <input
                                type="file"
                                id={uploadType}
                                name={uploadType}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept={uploadType === 'videos' ? 'video/*' : '.pdf,.doc,.docx,.txt'}
                            />
                            <div className="drop-status">
                                {materials[uploadType] ?
                                    <div style={{ color: '#10b981', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }}><FaCloudUploadAlt /></div> :
                                    <div style={{ opacity: 0.1, color: 'var(--text-main)' }}><FaCloudUploadAlt /></div>
                                }
                            </div>
                            <h3>{materials[uploadType] ? materials[uploadType].name : `SELECT ${uploadType.toUpperCase()} PAYLOAD`}</h3>
                            <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{materials[uploadType] ? 'NODE DATA VERIFIED' : 'SUPPORTED PROTOCOLS: PDF, DOCX, MP4'}</p>
                        </div>

                        <div className="nexus-form-grid">
                            <div className="nexus-group">
                                <label>Target Module</label>
                                <select id={`mod-${uploadType}`} className="cyber-input">
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Module {n}</option>)}
                                </select>
                            </div>
                            <div className="nexus-group">
                                <label>Target Unit</label>
                                <select id={`uni-${uploadType}`} className="cyber-input">
                                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>Unit {n}</option>)}
                                </select>
                            </div>
                            <div className="nexus-group full">
                                <label>Topic Identifier</label>
                                <input id={`top-${uploadType}`} placeholder="e.g. Distributed Ledger Technology" className="cyber-input" />
                            </div>

                            {uploadType === 'assignments' && (
                                <div className="nexus-group full" style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                    <label><FaCalendarAlt /> Deadlines & Procedures</label>
                                    <input type="datetime-local" className="cyber-input" value={assignmentDetails.dueDate} onChange={(e) => setAssignmentDetails({ ...assignmentDetails, dueDate: e.target.value })} style={{ marginBottom: '1rem' }} />
                                    <textarea className="cyber-input" placeholder="Enter instructional protocols..." rows="3" value={assignmentDetails.message} onChange={(e) => setAssignmentDetails({ ...assignmentDetails, message: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <button className="cyber-btn primary" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }} onClick={handleUpload}>
                            <FaPaperPlane /> Initiate Deployment to {selectedSections.length} Nodes
                        </button>
                    </div>
                )}
                {activeTab === 'links' && (
                    <div className="upload-nexus animate-fade-in" style={{ background: '#f8fafc', padding: '3rem', borderRadius: '32px' }}>
                        <div className="nexus-form-grid">
                            <div className="nexus-group full">
                                <label style={{ color: 'var(--accent-primary)' }}>Resource Label</label>
                                <input id="link-title" placeholder="e.g. Cloud API Documentation" className="cyber-input" style={{ background: 'white' }} />
                            </div>
                            <div className="nexus-group full">
                                <label style={{ color: 'var(--accent-secondary)' }}>Target Cloud URL</label>
                                <input id="link-url" placeholder="https://" className="cyber-input" style={{ background: 'white' }} />
                            </div>
                            <div className="nexus-group">
                                <label>Internal Mapping Type</label>
                                <select id="link-type" className="cyber-input" style={{ background: 'white' }}>
                                    <option value="videos">Video Stream</option>
                                    <option value="notes">Data Notes</option>
                                    <option value="syllabus">Syllabus Node</option>
                                </select>
                            </div>
                        </div>
                        <button className="cyber-btn primary" style={{ width: '100%', marginTop: '2.5rem', justifyContent: 'center' }} onClick={handleLinkAdd}>
                            <FaLink /> Establish Cloud Link
                        </button>
                    </div>
                )}
                {activeTab === 'broadcast' && (
                    <div className="upload-nexus animate-fade-in" style={{ background: '#f8fafc', padding: '3rem', borderRadius: '32px' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 800 }}>Dispatch Section Broadcast</h3>
                            <p style={{ color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>Send urgent notes or updates to all students in {selectedSections.join(', ')}</p>
                        </div>
                        <div className="nexus-form-grid">
                            <div className="nexus-group full">
                                <label style={{ color: 'var(--accent-primary)' }}>Message Transcript</label>
                                <textarea
                                    className="cyber-input"
                                    rows="5"
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    placeholder="Type your message for the students..."
                                    style={{ background: 'white', border: '1px solid var(--pearl-border)' }}
                                />
                            </div>
                            <div className="nexus-group">
                                <label style={{ color: 'var(--accent-secondary)' }}>Transmission Type</label>
                                <select className="cyber-input" value={broadcastType} onChange={(e) => setBroadcastType(e.target.value)} style={{ background: 'white' }}>
                                    <option value="announcement">Standard Announcement</option>
                                    <option value="urgent">Urgent Alert</option>
                                    <option value="reminder">Task Reminder</option>
                                </select>
                            </div>
                        </div>
                        <button
                            className="cyber-btn primary"
                            style={{ width: '100%', marginTop: '2.5rem', justifyContent: 'center', background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)' }}
                            onClick={async () => {
                                if (!broadcastMsg) return alert('Protocol Failure: Message empty.');
                                const { subject, year } = getContext();
                                try {
                                    await apiPost('/api/faculty/messages', {
                                        message: broadcastMsg,
                                        type: broadcastType,
                                        year,
                                        sections: selectedSections,
                                        subject
                                    });
                                    alert('✅ Mesh Transmission Successful');
                                    setBroadcastMsg('');
                                } catch (e) {
                                    alert(`Transmission Interrupted: ${e.message}`);
                                }
                            }}
                        >
                            <FaPaperPlane /> Initiate Global Broadcast to Students
                        </button>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="registry-nexus animate-fade-in">
                        <div className="node-grid">
                            {globalResources.map((res, i) => (
                                <div key={i} className="material-node" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="icon-box" style={{ background: '#f8fafc' }}>
                                        {res.type === 'videos' ? <FaVideo style={{ color: '#10b981' }} /> : <FaFileAlt style={{ color: '#3b82f6' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{res.title}</div>
                                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                                            <span className="status-badge" style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.6rem' }}>SEC {res.section}</span>
                                            <span className="status-badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.6rem' }}>{res.type}</span>
                                        </div>
                                    </div>
                                    {res.url && <a href={res.url} target="_blank" rel="noreferrer" className="icon-box" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}><FaEye /></a>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialManager;
