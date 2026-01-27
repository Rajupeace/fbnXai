import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaTimes, FaStickyNote, FaBook, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Student Journal
 * Subject-wise note taking interface.
 */
const SemesterNotes = ({ semester, studentData, enrolledSubjects = [] }) => {
    // Unique storage key for this student
    const storageKey = `friendly_notes_${studentData?.sid || 'guest'}`;

    // Initialize from Local Storage
    const [notes, setNotes] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            // Migrate old notes if needed (add subjectId 'General' if missing)
            let parsed = saved ? JSON.parse(saved) : [];
            return parsed.map(n => ({ ...n, subjectId: n.subjectId || 'General' }));
        } catch (e) { return []; }
    });

    const [selectedSubject, setSelectedSubject] = useState(enrolledSubjects[0]?.code || 'General');
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Saved');

    // Ensure 'General' is always an option if no subjects
    const subjectsList = enrolledSubjects.length > 0
        ? enrolledSubjects
        : [{ name: 'General Notes', code: 'General' }];

    // Auto-select first subject if current selection is invalid
    useEffect(() => {
        if (selectedSubject !== 'General' && !enrolledSubjects.find(s => s.code === selectedSubject)) {
            if (enrolledSubjects.length > 0) setSelectedSubject(enrolledSubjects[0].code);
            else setSelectedSubject('General');
        }
    }, [enrolledSubjects, selectedSubject]);

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(notes));
        setSaveStatus('Saving...');
        const timer = setTimeout(() => setSaveStatus('Saved'), 800);
        return () => clearTimeout(timer);
    }, [notes, storageKey]);

    const addNote = () => {
        if (newNote.trim()) {
            const note = {
                id: Date.now(),
                text: newNote,
                timestamp: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                subjectId: selectedSubject
            };
            setNotes([note, ...notes]);
            setNewNote('');
            setShowForm(false);
        }
    };

    const deleteNote = (id) => {
        if (window.confirm('Delete this note?')) {
            setNotes(notes.filter(n => n.id !== id));
        }
    };

    const startEdit = (id, text) => {
        setEditingId(id);
        setEditText(text);
    };

    const saveEdit = (id) => {
        setNotes(notes.map(n => n.id === id ? { ...n, text: editText } : n));
        setEditingId(null);
    };

    const filteredNotes = notes.filter(n => n.subjectId === selectedSubject);

    // Get subject name for display
    const currentSubjectName = subjectsList.find(s => s.code === selectedSubject)?.name || 'General Notes';

    return (
        <div className="nexus-journal-container" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 140px)', paddingBottom: '2rem' }}>

            {/* LEFT SIDEBAR: SUBJECTS */}
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
                                width: '100%',
                                textAlign: 'left',
                                padding: '1rem',
                                marginBottom: '0.5rem',
                                borderRadius: '12px',
                                border: selectedSubject === sub.code ? '1px solid #3b82f6' : '1px solid transparent',
                                background: selectedSubject === sub.code ? '#eff6ff' : 'transparent',
                                color: selectedSubject === sub.code ? '#1d4ed8' : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: selectedSubject === sub.code ? 600 : 500,
                                fontSize: '0.9rem'
                            }}
                        >
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</div>
                            {sub.code !== 'General' && <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem' }}>{sub.code}</div>}
                        </button>
                    ))}
                    {subjectsList.length === 0 && (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                            No active subjects found.
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setSelectedSubject('General')}
                    style={{
                        margin: '1rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1',
                        background: 'transparent',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                >
                    <FaStickyNote /> General Notes
                </button>
            </div>

            {/* RIGHT MAIN: NOTES */}
            <div className="journal-main" style={{ flex: 1, background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{currentSubjectName}</h2>
                        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            {filteredNotes.length} notes • {saveStatus}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="admin-btn admin-btn-primary"
                        style={{ padding: '0.75rem 1.5rem', gap: '0.5rem' }}
                    >
                        <FaPlus /> Add Note
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f8fafc' }}>
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                            >
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder={`Write something about ${currentSubjectName}...`}
                                    style={{ width: '100%', minHeight: '120px', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem' }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button onClick={() => setShowForm(false)} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>Cancel</button>
                                    <button onClick={addNote} className="admin-btn admin-btn-primary">Save Note</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem',
                        alignContent: 'start'
                    }}>
                        {filteredNotes.length === 0 && !showForm ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', opacity: 0.6 }}>
                                <FaStickyNote style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                                <p style={{ fontSize: '1.1rem', color: '#64748b' }}>No notes yet for this subject.</p>
                                <button onClick={() => setShowForm(true)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem' }}>
                                    Start writing...
                                </button>
                            </div>
                        ) : (
                            filteredNotes.map(note => (
                                <motion.div
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    {editingId === note.id ? (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                style={{ width: '100%', flex: 1, padding: '0.75rem', border: '1px solid #3b82f6', borderRadius: '8px', marginBottom: '1rem', resize: 'vertical' }}
                                                autoFocus
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                                <button onClick={() => saveEdit(note.id)} className="admin-btn admin-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save</button>
                                                <button onClick={() => setEditingId(null)} className="admin-btn admin-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ flex: 1, marginBottom: '1rem' }}>
                                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155', margin: 0 }}>{note.text}</p>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{note.timestamp}</span>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => startEdit(note.id, note.text)} title="Edit" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}><FaPencilAlt /></button>
                                                    <button onClick={() => deleteNote(note.id)} title="Delete" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}><FaTrash /></button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SemesterNotes;
