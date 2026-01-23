import React, { useState } from 'react';
import { FaBook, FaPencilAlt, FaTrash, FaSave, FaTimes, FaStickyNote, FaLayerGroup } from 'react-icons/fa';

/**
 * NEXUS DIGITAL JOURNAL (Semester Notes)
 * A premium note-taking interface for students to capture insights.
 */
const SemesterNotes = ({ semester, studentData }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [showForm, setShowForm] = useState(false);

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
            <div className="nexus-journal-header">
                <div>
                    <div className="nexus-journal-subtitle">
                        <FaLayerGroup /> Knowledge Journal
                    </div>
                    <h1 className="nexus-journal-title">
                        SEMESTER <span>{semester || 'X'}</span> NOTES
                    </h1>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="nexus-btn-vibrant"
                >
                    {showForm ? <FaTimes /> : <FaPencilAlt />} {showForm ? 'CLOSE EDITOR' : 'NEW INSIGHT'}
                </button>
            </div>

            {showForm && (
                <div className="nexus-note-editor">
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
                        <h3>Your Journal is Empty</h3>
                        <p>
                            Begin capturing your academic journey. Document insights, lectures, and breakthrough moments here.
                        </p>
                        <button onClick={() => setShowForm(true)} className="nexus-btn-vibrant">
                            + CREATE FIRST ENTRY
                        </button>
                    </div>
                ) : (
                    notes.map(note => (
                        <div key={note.id} className="nexus-note-card">
                            <div className="note-card-head">
                                <span className="note-timestamp">{note.timestamp}</span>
                                <div className="note-controls">
                                    <button onClick={() => startEdit(note.id, note.text)} className="note-action"><FaPencilAlt /></button>
                                    <button onClick={() => deleteNote(note.id)} className="note-action del"><FaTrash /></button>
                                </div>
                            </div>

                            {editingId === note.id ? (
                                <div className="note-editing-wrap">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="note-edit-area"
                                    />
                                    <button onClick={() => saveEdit(note.id)} className="nexus-btn-primary small">SAVE CHANGES</button>
                                </div>
                            ) : (
                                <p className="note-content-text">{note.text}</p>
                            )}

                            <div className="note-card-foot">
                                <div className="sync-indicator"></div>
                                <span className="sync-text">INSIGHT SYNCED</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default SemesterNotes;
