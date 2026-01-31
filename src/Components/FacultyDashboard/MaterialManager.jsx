import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTrash } from 'react-icons/fa';
import { apiUpload, apiPost, apiGet, apiDelete } from '../../utils/apiClient';

/**
 * NEXUS CONTENT DEPLOYMENT HUB
 * Central interface for orchestrating academic resources and tactical broadcasts.
 */
const MaterialManager = ({ selectedSubject, selectedSections, onUploadSuccess }) => {
    // Proactive hardening
    selectedSubject = selectedSubject || 'General - Year 1';
    selectedSections = selectedSections || [];
    const [uploadType, setUploadType] = useState('notes');
    const [materials, setMaterials] = useState({
        notes: null, videos: null, modelPapers: null, syllabus: null, assignments: null, interviewQnA: null
    });
    const [formData, setFormData] = useState({ module: '1', unit: '1', topic: '', title: '', semester: '1' });
    const [assignmentDetails] = useState({ dueDate: '', message: '' });
    const [activeTab, setActiveTab] = useState('upload');
    const [globalResources, setGlobalResources] = useState([]);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastType] = useState('announcement');
    const [editId, setEditId] = useState(null);

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
            if (data) setGlobalResources(data.filter(m => String(m.year) === String(year)));
        } catch (err) { console.error("Error fetching materials registry:", err); }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) setMaterials(prev => ({ ...prev, [name]: files[0] }));
    };

    const getContext = () => {
        const parts = selectedSubject.split(' - Year ');
        const year = parts[parts.length - 1] || '1';
        const subject = parts.slice(0, parts.length - 1).join(' - Year ') || 'General';
        return { subject, year };
    };

    const handleUpload = async () => {
        if (selectedSections.length === 0) return alert('Upload Error: Please select at least one section.');
        const { subject, year } = getContext();
        const file = materials[uploadType];
        if (!editId && !file) return alert('Upload Error: Please select a file.');

        try {
            const apiFormData = new FormData();
            if (file) apiFormData.append('file', file);
            apiFormData.append('year', year);
            apiFormData.append('semester', formData.semester || '1');
            apiFormData.append('section', selectedSections.join(','));
            apiFormData.append('subject', subject);
            apiFormData.append('type', uploadType);
            apiFormData.append('title', file ? file.name : formData.title);
            apiFormData.append('module', formData.module);
            apiFormData.append('unit', formData.unit);
            if (formData.topic) apiFormData.append('topic', formData.topic);
            if (formData.duration) apiFormData.append('duration', formData.duration);
            if (formData.examYear) apiFormData.append('examYear', formData.examYear);

            if (uploadType === 'assignments') {
                apiFormData.append('dueDate', assignmentDetails.dueDate);
                apiFormData.append('message', assignmentDetails.message);
            }

            if (editId) await apiUpload(`/api/materials/${editId}`, apiFormData, 'PUT');
            else await apiUpload('/api/materials', apiFormData);

            alert('Success: Material uploaded/updated.');
            setMaterials(prev => ({ ...prev, [uploadType]: null }));
            setFormData({ module: '1', unit: '1', topic: '', title: '', semester: '1' });
            setEditId(null);
            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();
        } catch (error) { alert(`Upload Failed: ${error.message}`); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await apiDelete(`/api/materials/${id}`);
            fetchGlobalResources();
        } catch (e) { alert("Delete Failed: " + e.message); }
    };

    const handleEdit = (res) => {
        setUploadType(res.type);
        setFormData({ module: res.module || '1', unit: res.unit || '1', topic: res.topic || '', title: res.title || '', semester: res.semester || '1' });
        setEditId(res._id || res.id);
        setActiveTab('upload');
    };

    const handleLinkAdd = async () => {
        const title = document.getElementById('link-title').value;
        const url = document.getElementById('link-url').value;
        const type = document.getElementById('link-type').value;
        if (!title || !url) return alert('Error: Title and URL required.');
        const { subject, year } = getContext();
        try {
            const linkForm = new FormData();
            linkForm.append('title', title);
            linkForm.append('year', year);
            linkForm.append('section', selectedSections.join(','));
            linkForm.append('subject', subject);
            linkForm.append('type', type);
            linkForm.append('link', url);
            await apiUpload('/api/materials', linkForm);
            alert('Success: Link added.');
            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();
        } catch (error) { alert('Error: Failed to add link.'); }
    };

    return (
        <div className="deployment-hub animate-fade-in">
            <div className="hub-header">
                <div>
                    <h2>{editId ? 'EDIT MATERIAL' : 'CONTENT MANAGER'}</h2>
                    <span className="sd-brand-tag" style={{ color: '#6366f1' }}>{selectedSubject}</span>
                </div>
                <div className="nexus-glass-pills">
                    <button className={`nexus-pill ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>UPLOAD</button>
                    <button className={`nexus-pill ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>LINKS</button>
                    <button className={`nexus-pill ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={() => setActiveTab('broadcast')}>ANNOUNCE</button>
                    <button className={`nexus-pill ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>HISTORY</button>
                </div>
            </div>

            <div className="hub-stage">
                {activeTab === 'upload' && (
                    <div className="animate-fade-in">
                        <div className="type-nexus-grid">
                            {['notes', 'videos', 'assignments', 'modelPapers', 'interviewQnA'].map(t => (
                                <button key={t} className={`nexus-card ${uploadType === t ? 'active' : ''}`} onClick={() => setUploadType(t)}>
                                    <span>{t.toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                        <div className="nexus-dropzone" onClick={() => document.getElementById(uploadType).click()}>
                            <input type="file" id={uploadType} name={uploadType} style={{ display: 'none' }} onChange={handleFileChange} />
                            <h3>{materials[uploadType] ? materials[uploadType].name : 'SELECT FILE'}</h3>
                        </div>
                        <div className="nexus-form-grid">
                            <input placeholder="Topic" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} className="f-form-select" />
                            {uploadType === 'videos' && (
                                <input placeholder="Duration (e.g. 10:30)" value={formData.duration || ''} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="f-form-select" />
                            )}
                            {uploadType === 'modelPapers' && (
                                <input placeholder="Exam Year (e.g. 2023)" value={formData.examYear || ''} onChange={e => setFormData({ ...formData, examYear: e.target.value })} className="f-form-select" />
                            )}
                        </div>
                        <button className="nexus-btn-primary" onClick={handleUpload}>{editId ? 'UPDATE' : 'UPLOAD'}</button>
                    </div>
                )}
                {activeTab === 'resources' && (
                    <div className="registry-nexus">
                        {globalResources.map((res, i) => (
                            <div key={i} className="mini-resource-card">
                                <span>{res.title}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(res)}><FaCloudUploadAlt /></button>
                                    <button onClick={() => handleDelete(res._id || res.id)}><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'broadcast' && (
                    <div className="animate-fade-in">
                        <textarea className="f-form-textarea" value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} placeholder="Announcement..." />
                        <button className="nexus-btn-primary" onClick={async () => {
                            const { subject, year } = getContext();
                            await apiPost('/api/faculty/messages', { message: broadcastMsg, type: broadcastType, year, sections: selectedSections, subject });
                            alert('Sent!'); setBroadcastMsg('');
                        }}>SEND</button>
                    </div>
                )}
                {activeTab === 'links' && (
                    <div className="animate-fade-in">
                        <input id="link-title" placeholder="Title" className="f-form-select" />
                        <input id="link-url" placeholder="URL" className="f-form-select" />
                        <select id="link-type" className="f-form-select"><option value="notes">Notes</option><option value="videos">Video</option></select>
                        <button className="nexus-btn-primary" onClick={handleLinkAdd}>ADD LINK</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialManager;
