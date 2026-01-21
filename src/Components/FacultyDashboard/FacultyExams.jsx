import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCheckCircle, FaClipboardList, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { apiPost, apiGet, apiDelete } from '../../utils/apiClient';

/**
 * FACULTY ASSESSMENT COMMAND
 * Modular interface for creating and managing student assessments.
 * Theme: Luxe Pearl / Nexus
 */
const FacultyExams = ({ subject, year, sections, facultyId, branch }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const [formData, setFormData] = useState({
        title: '', topic: '', week: 'Week 1',
        durationMinutes: 20, totalMarks: 10,
        section: '', branch: branch || 'CSE',
        questions: []
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '', options: ['', '', '', ''],
        correctOptionIndex: 0, marks: 1
    });

    useEffect(() => {
        fetchExams();
    }, [facultyId]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const data = await apiGet(`/api/exams/faculty/${facultyId}`);
            if (data) setExams(data);
        } catch (error) {
            console.error("Failed to load assessments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuestion(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    };

    const addQuestion = () => {
        if (!currentQuestion.questionText || currentQuestion.options.some(o => !o)) {
            alert("Protocol Violation: Question fields incomplete.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, currentQuestion]
        }));
        setCurrentQuestion({
            questionText: '', options: ['', '', '', ''],
            correctOptionIndex: 0, marks: 1
        });
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.questions.length === 0) {
            alert("System Alert: Minimum one question required.");
            return;
        }

        try {
            const payload = {
                ...formData,
                totalMarks: formData.questions.reduce((acc, q) => acc + parseFloat(q.marks || 1), 0),
                subject, year, facultyId
            };
            await apiPost('/api/exams/create', payload);
            alert("Assessment Profile Published to Student Mesh.");
            setShowCreate(false);
            setFormData({
                title: '', topic: '', week: 'Week 1',
                durationMinutes: 20, totalMarks: 10,
                section: '', branch: branch || 'CSE',
                questions: []
            });
            fetchExams();
        } catch (err) {
            alert("Deployment failed: " + err.message);
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm("Purge assessment profile from Nexus Cloud?")) return;
        try {
            await apiDelete(`/api/exams/${id}`);
            fetchExams();
        } catch (err) {
            alert("Purge sequence failed.");
        }
    };

    if (showCreate) {
        return (
            <div className="animate-fade-in">
                <button onClick={() => setShowCreate(false)} className="f-cancel-btn f-spacer-lg">
                    <FaArrowLeft /> RETURN TO REGISTRY
                </button>

                <div className="f-node-card animate-slide-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="f-modal-header">
                        <FaShieldAlt style={{ fontSize: '2.4rem' }} />
                        <h2>ASSESSMENT ARCHITECT</h2>
                    </div>

                    <div className="nexus-form-grid">
                        <div className="nexus-group">
                            <label className="f-form-label">Exam Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="f-form-select" placeholder="e.g. Mid-Term 1" />
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Subject Scope</label>
                            <input type="text" name="topic" value={formData.topic} onChange={handleInputChange} className="f-form-select" placeholder="e.g. Core Fundamentals" />
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Academic Week</label>
                            <select name="week" value={formData.week} onChange={handleInputChange} className="f-form-select">
                                <option value="Week 1">Week 1</option>
                                <option value="Week 2">Week 2</option>
                                <option value="Week 3">Week 3</option>
                                <option value="Week 4">Week 4</option>
                                <option value="Mid Term">Mid Term</option>
                                <option value="Final">Final</option>
                            </select>
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Branch Sector</label>
                            <input type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="f-form-select" />
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Target Section</label>
                            <select name="section" value={formData.section} onChange={handleInputChange} className="f-form-select">
                                <option value="">Global (All Sections)</option>
                                {sections && sections.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Duration (Minutes)</label>
                            <input type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleInputChange} className="f-form-select" />
                        </div>
                    </div>

                    <div className="f-question-panel">
                        <div className="f-node-head">
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950 }}>QUESTION PAYLOADS ({formData.questions.length})</h4>
                            <span className="f-meta-badge type">TOTAL: {formData.questions.reduce((acc, q) => acc + parseFloat(q.marks || 1), 0)} MARKS</span>
                        </div>

                        {/* Question Builder */}
                        <div style={{ marginTop: '2.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    name="questionText"
                                    value={currentQuestion.questionText}
                                    onChange={handleQuestionChange}
                                    className="f-form-select"
                                    placeholder="Enter Question Transcript..."
                                    style={{ flex: 1, marginBottom: 0 }}
                                />
                                <div style={{ width: '120px' }}>
                                    <input
                                        type="number"
                                        name="marks"
                                        value={currentQuestion.marks}
                                        onChange={handleQuestionChange}
                                        className="f-form-select"
                                        placeholder="Marks"
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>
                            </div>



                            <div className="nexus-form-grid" style={{ marginBottom: '2rem' }}>
                                {currentQuestion.options.map((opt, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        className="f-form-select"
                                        placeholder={`Param ${idx + 1}`}
                                        style={currentQuestion.correctOptionIndex === idx ? { borderColor: 'var(--nexus-primary)', background: '#f5f7ff' } : {}}
                                    />
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="f-flex-gap">
                                    <label className="f-form-label" style={{ margin: 0 }}>Correct Mapping:</label>
                                    <select
                                        name="correctOptionIndex"
                                        value={currentQuestion.correctOptionIndex}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctOptionIndex: parseInt(e.target.value) }))}
                                        className="f-form-select"
                                        style={{ width: '150px', marginBottom: 0 }}
                                    >
                                        <option value={0}>Param 1</option>
                                        <option value={1}>Param 2</option>
                                        <option value={2}>Param 3</option>
                                        <option value={3}>Param 4</option>
                                    </select>
                                </div>
                                <button onClick={addQuestion} className="f-cancel-btn" style={{ background: 'white' }}>
                                    <FaPlus /> INJECT QUESTION
                                </button>
                            </div>
                        </div>

                        {/* Roster of added questions */}
                        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {formData.questions.map((q, i) => (
                                <div key={i} className="f-question-node animate-fade-in">
                                    <div className="f-question-header">
                                        <div className="f-question-text">{i + 1}. {q.questionText}</div>
                                        <div className="f-question-marks">{q.marks} CR</div>
                                    </div>
                                    <div className="f-option-preview">
                                        {q.options.map((opt, idx) => (
                                            <div key={idx} className={`f-option-chip ${q.correctOptionIndex === idx ? 'correct' : ''}`}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => removeQuestion(i)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="nexus-btn-primary" style={{ width: '100%', marginTop: '3.5rem' }}>
                        PUBLISH ASSESSMENT PROFILE
                    </button>
                </div>
            </div >
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="f-view-header">
                <div>
                    <h2>ASSESSMENT <span>REGISTRY</span></h2>
                    <p className="nexus-page-subtitle" style={{ marginTop: '0.5rem' }}>Manage tactical evaluation profiles</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="nexus-btn-primary">
                    <FaPlus /> INITIALIZE NEW EXAM
                </button>
            </div>

            {loading ? (
                <div className="no-content">Synchronizing Registry...</div>
            ) : exams.length === 0 ? (
                <div className="f-node-card f-center-empty">
                    <FaClipboardList style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '2rem' }} />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: '#1e293b' }}>Empty Registry</h3>
                    <p style={{ color: '#94a3b8', fontWeight: 850, marginTop: '1rem' }}>No assessment profiles detected for this sector.</p>
                    <button onClick={() => setShowCreate(true)} className="f-cancel-btn" style={{ marginTop: '2rem' }}>INITIALIZE NOW</button>
                </div>
            ) : (
                <div className="f-exam-grid">
                    {exams.map(exam => (
                        <div key={exam._id} className="f-exam-card animate-slide-up">
                            <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                                <button onClick={() => handleDeleteExam(exam._id)} className="f-node-btn delete" title="Purge Record"><FaTrash /></button>
                            </div>
                            <div className="f-exam-topic">{exam.topic || 'General Knowledge'}</div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 950, color: '#1e293b', margin: '0 0 0.5rem' }}>{exam.title}</h3>
                            <div className="f-meta-badge type">{exam.week}</div>

                            <div className="f-exam-stats">
                                <div className="f-exam-stat-row">
                                    <span className="f-exam-stat-label">Payload Capacity:</span>
                                    <span className="f-exam-stat-value">{exam.questions.length} Units</span>
                                </div>
                                <div className="f-exam-stat-row">
                                    <span className="f-exam-stat-label">Operation Time:</span>
                                    <span className="f-exam-stat-value">{exam.durationMinutes} Minutes</span>
                                </div>
                                <div className="f-exam-stat-row">
                                    <span className="f-exam-stat-label">Max Capacity:</span>
                                    <span className="f-exam-stat-value">{exam.totalMarks || exam.questions.length} CR</span>
                                </div>
                                <div className="f-exam-stat-row">
                                    <span className="f-exam-stat-label">Sector Link:</span>
                                    <span className="f-exam-stat-value">{exam.section ? `SECTION ${exam.section}` : 'GLOBAL'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacultyExams;
