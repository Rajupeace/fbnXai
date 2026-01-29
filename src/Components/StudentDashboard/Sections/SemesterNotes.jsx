import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaStickyNote, FaBook, FaPlus, FaFileAlt, FaSync } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/apiClient';

/**
 * Student Journal
 * Subject-wise note taking interface.
 */
const SemesterNotes = ({ semester, studentData, enrolledSubjects = [], serverMaterials = [] }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedSubject, setSelectedSubject] = useState(enrolledSubjects[0]?.code || 'General');
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Ready');

    const subjectsList = enrolledSubjects.length > 0
        ? enrolledSubjects
        : [{ name: 'General Notes', code: 'General' }];

    const fetchNotes = async () => {
        if (!studentData?.sid) return;
        setLoading(true);
        try {
            const data = await apiGet(`/api/student-notes?sid=${studentData.sid}`);
            if (Array.isArray(data)) setNotes(data);
            setSaveStatus('Synced');
        } catch (e) {
            console.error('Failed to fetch notes:', e);
            setSaveStatus('Offline');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentData?.sid]);

    useEffect(() => {
        if (selectedSubject !== 'General' && !enrolledSubjects.find(s => s.code === selectedSubject)) {
            if (enrolledSubjects.length > 0) setSelectedSubject(enrolledSubjects[0].code);
            else setSelectedSubject('General');
        }
    }, [enrolledSubjects, selectedSubject]);

    const addNote = async () => {
        if (newNote.trim()) {
            setSaveStatus('Saving...');
            try {
                // Find courseId if possible
                const subjectObj = enrolledSubjects.find(s => s.code === selectedSubject);
                const payload = {
                    sid: studentData.sid,
                    courseId: subjectObj?._id || subjectObj?.id,
                    title: subjectObj?.name || 'General Note',
                    content: newNote,
                    category: selectedSubject === 'General' ? 'personal-notes' : 'lecture-notes',
                    semester: studentData.semester || '1st',
                    academicYear: new Date().getFullYear().toString()
                };

                const savedNote = await apiPost('/api/student-notes', payload);
                if (savedNote) {
                    setNotes([savedNote, ...notes]);
                    setNewNote('');
                    setShowForm(false);
                    setSaveStatus('Saved');
                }
            } catch (e) {
                console.error('Failed to save note:', e);
                setSaveStatus('Error');
            }
        }
    };

    const deleteNote = async (id) => {
        if (window.confirm('Delete this note?')) {
            try {
                await apiDelete(`/api/student-notes/${id}`);
                setNotes(notes.filter(n => (n._id || n.id) !== id));
                setSaveStatus('Deleted');
            } catch (e) {
                console.error('Failed to delete note:', e);
            }
        }
    };

    const startEdit = (id, text) => {
        setEditingId(id);
        setEditText(text);
    };

    const saveEdit = async (id) => {
        setSaveStatus('Updating...');
        try {
            const updated = await apiPut(`/api/student-notes/${id}`, { content: editText });
            if (updated) {
                setNotes(notes.map(n => (n._id || n.id) === id ? { ...n, content: editText } : n));
                setEditingId(null);
                setSaveStatus('Saved');
            }
        } catch (e) {
            console.error('Failed to update note:', e);
            setSaveStatus('Error');
        }
    };

    const filteredNotes = notes.filter(n => {
        if (selectedSubject === 'General') {
            return n.category === 'personal-notes';
        }
        const subjectObj = enrolledSubjects.find(s => s.code === selectedSubject);
        return (n.courseId && (n.courseId === subjectObj?._id || n.courseId === subjectObj?.id)) ||
            (n.title && n.title.includes(subjectObj?.name));
    });

    const currentSubjectName = subjectsList.find(s => s.code === selectedSubject)?.name || 'General Notes';

    const publishedMaterials = (() => {
        try {
            const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const apiMaterials = (serverMaterials || []).map(m => ({ ...m, url: m.url && m.url.startsWith('http') ? m.url : `${API_BASE}${m.url}` }));
            const year = String(studentData.year || '1');

            return apiMaterials.filter(m => {
                const matchYear = !m.year || String(m.year) === 'All' || String(m.year) === year;
                const sections = m.section ? (Array.isArray(m.section) ? m.section : String(m.section).split(',').map(s => s.trim())) : [];
                const matchSection = !m.section || sections.length === 0 || sections.includes('All') || sections.includes(studentData.section) || sections.includes(String(studentData.section));
                const subj = m.subject ? String(m.subject).trim().toLowerCase() : '';
                const code = String(selectedSubject || '').trim().toLowerCase();
                const subjNameMatch = enrolledSubjects.find(s => s.code === selectedSubject)?.name?.toLowerCase() || '';

                return matchYear && matchSection && (
                    subj === code ||
                    (subj && subj.includes(code)) ||
                    (subjNameMatch && subj.includes(subjNameMatch))
                );
            });
        } catch (e) { return []; }
    })();

    return (
        <div className="nexus-journal-container" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 140px)', paddingBottom: '2rem' }}>
            <div className="journal-sidebar" style={{ width: '280px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaBook style={{ color: '#3b82f6' }} /> Notebooks
                    </h3>
                </div>
                <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
                    {subjectsList.map(sub => (
                        <button
                            key={sub.code}
                            onClick={() => setSelectedSubject(sub.code)}
                            style={{
                                width: '100%', textAlign: 'left', padding: '1rem', marginBottom: '0.5rem', borderRadius: '12px',
                                border: selectedSubject === sub.code ? '1px solid #3b82f6' : '1px solid transparent',
                                background: selectedSubject === sub.code ? '#eff6ff' : 'transparent',
                                color: selectedSubject === sub.code ? '#1d4ed8' : '#64748b', cursor: 'pointer', fontWeight: selectedSubject === sub.code ? 600 : 500, fontSize: '0.9rem'
                            }}
                        >
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</div>
                        </button>
                    ))}
                </div>
                <button onClick={() => setSelectedSubject('General')} style={{ margin: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px dashed #cbd5e1', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <FaStickyNote /> General Notes
                </button>
            </div>

            <div className="journal-main" style={{ flex: 1, background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{currentSubjectName}</h2>
                            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                {filteredNotes.length} notes • {saveStatus}
                            </p>
                        </div>
                        {loading && <div className="spinner-mini" style={{ width: '16px', height: '16px', border: '2px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={fetchNotes} className="admin-btn admin-btn-outline" style={{ padding: '0.75rem', borderRadius: '8px' }} title="Sync Notes"><FaSync /></button>
                        <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary" style={{ padding: '0.75rem 1.5rem', gap: '0.5rem' }}><FaPlus /> Add Note</button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f8fafc' }}>
                    {publishedMaterials.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Published Resources</h4>
                                <small style={{ color: '#94a3b8' }}>{publishedMaterials.length} items</small>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {publishedMaterials.map((m, i) => (
                                    <a key={i} href={m.url} target="_blank" rel="noreferrer" className="res-card-v2" style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'center', textDecoration: 'none', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                        <div style={{ padding: '8px', background: '#f0f9ff', borderRadius: '8px', color: '#0ea5e9' }}>
                                            <FaFileAlt />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{m.title || m.name}</span>
                                            <small style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>{m.type}</small>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {showForm && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder={`Write something about ${currentSubjectName}...`} style={{ width: '100%', minHeight: '120px', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', fontSize: '1rem', fontFamily: 'inherit' }} autoFocus />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button onClick={() => setShowForm(false)} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>Cancel</button>
                                    <button onClick={addNote} className="admin-btn admin-btn-primary">Save Note</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading && notes.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748b' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                            <p>Loading your journal...</p>
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                            <p>No notes for this subject yet. Start by adding one!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {filteredNotes.map(note => (
                                <motion.div key={note._id || note.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    {editingId === (note._id || note.id) ? (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} style={{ width: '100%', flex: 1, padding: '0.75rem', border: '1px solid #3b82f6', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.95rem', fontFamily: 'inherit' }} autoFocus />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => saveEdit(note._id || note.id)} className="admin-btn admin-btn-primary">Save</button>
                                                <button onClick={() => setEditingId(null)} className="admin-btn admin-btn-outline">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ flex: 1, marginBottom: '1rem' }}>
                                                <p style={{ whiteSpace: 'pre-wrap', color: '#334155', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>{note.content}</p>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <button onClick={() => startEdit(note._id || note.id, note.content)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }} title="Edit"><FaPencilAlt /></button>
                                                    <button onClick={() => deleteNote(note._id || note.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }} title="Delete"><FaTrash /></button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SemesterNotes;
