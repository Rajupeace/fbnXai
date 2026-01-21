import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaLink, FaHistory, FaFileAlt, FaVideo, FaClipboardList, FaQuestionCircle, FaLayerGroup, FaCalendarAlt, FaPaperPlane, FaEye } from 'react-icons/fa';
import { apiUpload, apiPost, apiGet } from '../../utils/apiClient';

/**
 * NEXUS CONTENT DEPLOYMENT HUB
 * Central interface for orchestrating academic resources and tactical broadcasts.
 * Theme: Luxe Pearl / Nexus
 */
const MaterialManager = ({ selectedSubject, selectedSections, onUploadSuccess }) => {
    const [uploadType, setUploadType] = useState('notes');
    const [materials, setMaterials] = useState({
        notes: null,
        videos: null,
        modelPapers: null,
        syllabus: null,
        assignments: null,
        interviewQnA: null
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
            console.error("Error fetching materials registry:", err);
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
            alert('Deployment Error: No active sections targeted.');
            return;
        }

        const { subject, year } = getContext();
        const file = materials[uploadType];
        if (!file) return alert('Input Required: Select payload node for deployment.');

        const module = document.getElementById(`mod-${uploadType}`)?.value || '1';
        const unit = document.getElementById(`uni-${uploadType}`)?.value || '1';
        const topic = document.getElementById(`top-${uploadType}`)?.value || '';

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('year', year);
            formData.append('section', selectedSections.length === 1 ? selectedSections[0] : selectedSections.join(','));
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
            alert('Deployment Finalized: Content synced to student nodes.');
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

        if (!title || !url) return alert('Link Error: Title and URL required.');
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
                await apiUpload('/api/materials', formData);
            }
            alert('Cloud Link Synchronized Successfully.');
            document.getElementById('link-title').value = '';
            document.getElementById('link-url').value = '';
            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();
        } catch (error) {
            alert('Cloud Synchronization failed.');
        }
    };

    return (
        <div className="deployment-hub animate-fade-in">
            <div className="hub-header">
                <div className="f-flex-gap">
                    <div className="f-node-type-icon" style={{ width: '60px', height: '60px', fontSize: '1.8rem', background: '#eef2ff' }}>
                        <FaLayerGroup />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: '#1e293b', margin: 0 }}>ORCHESTRATION CENTER</h2>
                        <span className="sd-brand-tag" style={{ color: '#6366f1' }}>CENTRAL RESOURCE DEPLOYMENT</span>
                    </div>
                </div>

                <div className="nexus-glass-pills">
                    <button className={`nexus-pill ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
                        <FaCloudUploadAlt /> DEPLOY
                    </button>
                    <button className={`nexus-pill ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>
                        <FaLink /> WEBLINK
                    </button>
                    <button className={`nexus-pill ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={() => setActiveTab('broadcast')}>
                        <FaPaperPlane /> BROADCAST
                    </button>
                    <button className={`nexus-pill ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
                        <FaHistory /> REGISTRY
                    </button>
                </div>
            </div>

            <div className="hub-stage">
                {activeTab === 'upload' && (
                    <div className="animate-fade-in">
                        <div className="type-nexus-grid">
                            {[
                                { id: 'notes', label: 'Nodes', icon: <FaFileAlt /> },
                                { id: 'videos', label: 'Streaming', icon: <FaVideo /> },
                                { id: 'assignments', label: 'Challenges', icon: <FaClipboardList /> },
                                { id: 'modelPapers', label: 'Archives', icon: <FaLayerGroup /> },
                                { id: 'interviewQnA', label: 'Forge', icon: <FaQuestionCircle /> }
                            ].map(t => (
                                <button key={t.id} className={`nexus-card ${uploadType === t.id ? 'active' : ''}`} onClick={() => setUploadType(t.id)}>
                                    <div className="nexus-icon">{t.icon}</div>
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className={`nexus-dropzone ${materials[uploadType] ? 'active' : ''} animate-slide-up`} onClick={() => document.getElementById(uploadType).click()}>
                            <input
                                type="file"
                                id={uploadType}
                                name={uploadType}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept={uploadType === 'videos' ? 'video/*' : '.pdf,.doc,.docx,.txt'}
                            />
                            <div className="drop-status">
                                <FaCloudUploadAlt style={materials[uploadType] ? { color: '#10b981' } : {}} />
                            </div>
                            <h3>{materials[uploadType] ? materials[uploadType].name : `SELECT ${uploadType.toUpperCase()} DATA NODE`}</h3>
                            <p>{materials[uploadType] ? 'NODE IDENTIFIED' : 'SUPPORTED: PDF, DOCX, MP4, TXT'}</p>
                        </div>

                        <div className="nexus-form-grid animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="nexus-group">
                                <label className="f-form-label">Sector Module</label>
                                <select id={`mod-${uploadType}`} className="f-form-select">
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Module {n}</option>)}
                                </select>
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">Sector Unit</label>
                                <select id={`uni-${uploadType}`} className="f-form-select">
                                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>Unit {n}</option>)}
                                </select>
                            </div>
                            <div className="nexus-group full">
                                <label className="f-form-label">Tactical Topic ID</label>
                                <input id={`top-${uploadType}`} placeholder="e.g. Neural Mesh Architectures" className="f-form-select" />
                            </div>

                            {uploadType === 'assignments' && (
                                <div className="nexus-group full animate-fade-in" style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem' }}>
                                    <label className="f-form-label"><FaCalendarAlt /> TERMINATION DEADLINE</label>
                                    <input type="datetime-local" className="f-form-select" value={assignmentDetails.dueDate} onChange={(e) => setAssignmentDetails({ ...assignmentDetails, dueDate: e.target.value })} />
                                    <label className="f-form-label">MISSION PROTOCOLS</label>
                                    <textarea className="f-form-textarea" placeholder="Enter instructional briefing..." value={assignmentDetails.message} onChange={(e) => setAssignmentDetails({ ...assignmentDetails, message: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <button className="nexus-btn-primary animate-slide-up" style={{ width: '100%', marginTop: '3.5rem', animationDelay: '0.2s' }} onClick={handleUpload}>
                            <FaPaperPlane /> DEPLOY TO {selectedSections.length} TARGET SECTORS
                        </button>
                    </div>
                )}

                {activeTab === 'links' && (
                    <div className="animate-fade-in">
                        <div className="nexus-form-grid">
                            <div className="nexus-group full">
                                <label className="f-form-label">Resource Alias</label>
                                <input id="link-title" placeholder="e.g. External Cloud Repository" className="f-form-select" />
                            </div>
                            <div className="nexus-group full">
                                <label className="f-form-label">Virtual Link Protocol (URL)</label>
                                <input id="link-url" placeholder="https://external-resource.io" className="f-form-select" />
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">Data Mapping Type</label>
                                <select id="link-type" className="f-form-select">
                                    <option value="videos">VideoStream</option>
                                    <option value="notes">DataPackage</option>
                                    <option value="syllabus">SyllabusNode</option>
                                </select>
                            </div>
                        </div>
                        <button className="nexus-btn-primary" style={{ width: '100%', marginTop: '3.5rem' }} onClick={handleLinkAdd}>
                            <FaLink /> ESTABLISH CLOUD LINK
                        </button>
                    </div>
                )}

                {activeTab === 'broadcast' && (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: '#1e293b' }}>TACTICAL TRANSMISSION</h3>
                            <p style={{ color: '#94a3b8', fontWeight: 800, marginTop: '0.5rem' }}>Send encrypted directives to student groups in {selectedSections.join(', ')}</p>
                        </div>
                        <div className="nexus-form-grid">
                            <div className="nexus-group full">
                                <label className="f-form-label">Directive Transcript</label>
                                <textarea
                                    className="f-form-textarea"
                                    rows="6"
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    placeholder="Enter transmission content..."
                                />
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">Priority Level</label>
                                <select className="f-form-select" value={broadcastType} onChange={(e) => setBroadcastType(e.target.value)}>
                                    <option value="announcement">STANDARD BROADCAST</option>
                                    <option value="urgent">URGENT PRIORITY</option>
                                    <option value="reminder">MISSION REMINDER</option>
                                </select>
                            </div>
                        </div>
                        <button
                            className="nexus-btn-primary"
                            style={{ width: '100%', marginTop: '3.5rem' }}
                            onClick={async () => {
                                if (!broadcastMsg) return alert('Protocol Failure: Empty transcript.');
                                const { subject, year } = getContext();
                                try {
                                    await apiPost('/api/faculty/messages', {
                                        message: broadcastMsg, type: broadcastType,
                                        year, sections: selectedSections, subject
                                    });
                                    alert('Transmission Successful: Message dispatched to student mesh.');
                                    setBroadcastMsg('');
                                } catch (e) {
                                    alert(`Transmission Error: ${e.message}`);
                                }
                            }}
                        >
                            <FaPaperPlane /> INITIATE SECTOR BROADCAST
                        </button>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="registry-nexus animate-fade-in">
                        <div className="material-node f-flex-gap f-spacer-lg" style={{ background: '#f8fafc', border: 'none', justifyContent: 'center' }}>
                            <span style={{ fontWeight: 950, color: '#64748b', fontSize: '0.85rem' }}>ACTIVE DEPLOYMENTS FOR {selectedSubject.toUpperCase()}</span>
                        </div>
                        <div className="f-roster-list">
                            {globalResources.map((res, i) => (
                                <div key={i} className="material-node">
                                    <div className="f-node-type-icon" style={{ background: 'white' }}>
                                        {res.type === 'videos' ? <FaVideo /> : <FaFileAlt />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 950, color: '#1e293b', fontSize: '1rem' }}>{res.title}</div>
                                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.4rem' }}>
                                            <span className="f-meta-badge" style={{ background: '#f1f5f9' }}>SEC {res.section}</span>
                                            <span className="f-meta-badge type">{res.type}</span>
                                        </div>
                                    </div>
                                    {res.url && <a href={res.url} target="_blank" rel="noreferrer" className="f-node-btn view"><FaEye /></a>}
                                </div>
                            ))}
                            {globalResources.length === 0 && <div className="no-content">Registry is empty. No nodes detected.</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialManager;
