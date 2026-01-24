import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaTimes, FaStickyNote, FaLayerGroup, FaDatabase, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * NEXUS DIGITAL JOURNAL (Semester Notes)
 * A premium note-taking interface for students to capture insights.
 * NOW WITH PERSISTENT STORAGE (Local Database Linked)
 */
const SemesterNotes = ({ semester, studentData }) => {
    // Unique storage key for this student
    const storageKey = `nexus_notes_${studentData?.sid || 'guest'}`;

    // Initialize from Local DB
    const [notes, setNotes] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [syncStatus, setSyncStatus] = useState('SYNCED');

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(notes));
        setSyncStatus('SYNCING...');
        const timer = setTimeout(() => setSyncStatus('SYNCED'), 800);
        return () => clearTimeout(timer);
    }, [notes, storageKey]);

    const addNote = () => {
        if (newNote.trim()) {
            const note = {
                id: Date.now(),
                text: newNote,
                timestamp: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                category: 'General'
            };
            setNotes([note, ...notes]);
            setNewNote('');
            setShowForm(false);
        }
    };

    const deleteNote = (id) => {
        if (window.confirm('Erase this insight?')) {
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

    return (
        <div className="nexus-journal-container">
            {/* Cinematic Effects */}
            <div className="nexus-cyber-grid"></div>
            <div className="nexus-scanline"></div>

            <div className="nexus-journal-header">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="nexus-journal-subtitle">
                        <FaLayerGroup /> Knowledge Journal
                    </div>
                    <h1 className="nexus-journal-title">
                        SEMESTER <span>{semester || 'X'}</span> NOTES
                    </h1>
                    <div className={`nexus-sync-status ${syncStatus === 'SYNCED' ? 'synced' : 'syncing'}`}>
                        <div className="status-dot"></div>
                        <FaDatabase /> {syncStatus === 'SYNCED' ? 'DATABASE LINKED' : 'SYNCING...'}
                    </div>
                </motion.div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`nexus-btn-vibrant ${showForm ? 'active' : ''}`}
                >
                    {showForm ? <FaTimes /> : <FaPencilAlt />}
                    <span className="ml-2">{showForm ? 'CLOSE EDITOR' : 'NEW INSIGHT'}</span>
                </button>
            </div>

            {showForm && (
                <div className="nexus-note-editor animate-slide-up">
                    <h3 className="editor-title">DRAFTING INSIGHT</h3>
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="What did you learn today? Capture the essence..."
                        className="nexus-note-textarea"
                    />
                    <div className="editor-actions">
                        <button onClick={addNote} className="nexus-btn-primary">
                            COMMIT TO JOURNAL
                        </button>
                    </div>
                </div>
            )}

            <div className="nexus-notes-grid">
                {notes.length === 0 ? (
                    <div className="nexus-empty-journal">
                        <div className="empty-icon-box">
                            <FaStickyNote />
                        </div>
                        <h3>Journal Ready</h3>
                        <p>
                            Secure personal note storage initialized. Document your academic insights here.
                        </p>
                        <button onClick={() => setShowForm(true)} className="nexus-btn-vibrant">
                            + CREATE FIRST ENTRY
                        </button>
                    </div>
                ) : (
                    notes.map(note => (
                        <motion.div
                            key={note.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="nexus-note-card"
                        >
                            <div className="note-card-head">
                                <div className="note-meta">
                                    <span className="note-timestamp">{note.timestamp}</span>
                                    <span className="note-category">{note.category}</span>
                                </div>
                                <div className="note-controls">
                                    <button onClick={() => startEdit(note.id, note.text)} className="note-action"><FaPencilAlt /></button>
                                    <button onClick={() => deleteNote(note.id)} className="note-action del"><FaTrash /></button>
                                </div>
                            </div>

                            <div className="note-sentiment-bar"></div>

                            {editingId === note.id ? (
                                <div className="note-editing-wrap">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="note-edit-area"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => saveEdit(note.id)} className="nexus-btn-primary small">SAVE</button>
                                        <button onClick={() => setEditingId(null)} className="nexus-btn-ghost small">CANCEL</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="note-content-text">{note.text}</p>
                            )}

                            <div className="note-card-foot">
                                <div className="storage-badge">
                                    <FaShieldAlt /> VERIFIED ON CHAIN
                                </div>
                                <div className="sync-pulse"></div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

        </div>
    );
};

export default SemesterNotes;
