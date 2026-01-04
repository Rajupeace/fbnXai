import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCheckCircle, FaCircleNotch, FaClipboardList, FaArrowLeft } from 'react-icons/fa';
import { apiPost, apiGet, apiDelete } from '../../utils/apiClient';

const FacultyExams = ({ subject, year, sections, facultyId, branch }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        topic: '',
        week: 'Week 1',
        durationMinutes: 20,
        totalMarks: 10,
        section: '', // Optional
        branch: branch || 'CSE', // Default or prop
        questions: []
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 1
    });

    // Load Exams
    useEffect(() => {
        fetchExams();
    }, [facultyId]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            // Assuming apiGet handles the full URL or relative
            const data = await apiGet(`/api/exams/faculty/${facultyId}`);
            if (data) setExams(data);
        } catch (error) {
            console.error("Failed to load exams", error);
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
            alert("Please fill all question fields and options.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, currentQuestion]
        }));
        // Reset current question
        setCurrentQuestion({
            questionText: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            marks: 1
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
            alert("Please add at least one question.");
            return;
        }

        try {
            const payload = {
                ...formData,
                totalMarks: formData.questions.reduce((acc, q) => acc + parseFloat(q.marks || 1), 0),
                subject,
                year,
                facultyId
            };
            await apiPost('/api/exams/create', payload);
            alert("Exam created successfully!");
            setShowCreate(false);
            setFormData({
                title: '',
                topic: '',
                week: 'Week 1',
                durationMinutes: 20,
                totalMarks: 10,
                section: '',
                branch: branch || 'CSE',
                questions: []
            });
            fetchExams();
        } catch (err) {
            alert("Failed to create exam: " + err.message);
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;
        try {
            await apiDelete(`/api/exams/${id}`);
            fetchExams();
        } catch (err) {
            alert("Failed to delete exam");
        }
    };

    if (showCreate) {
        return (
            <div className="animate-fade-in" style={{ padding: '0 1rem' }}>
                <button
                    onClick={() => setShowCreate(false)}
                    className="cyber-btn"
                    style={{ marginBottom: '1.5rem', padding: '0.8rem 1.5rem', background: 'white', border: '1px solid var(--pearl-border)', color: 'var(--text-main)' }}
                >
                    <FaArrowLeft /> Back to List
                </button>

                <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', background: 'white' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Create New Exam - {subject}</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Exam Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="cyber-input" placeholder="e.g. Mid-Term 1" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Topic</label>
                            <input type="text" name="topic" value={formData.topic} onChange={handleInputChange} className="cyber-input" placeholder="e.g. Network Layers" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Week</label>
                            <select name="week" value={formData.week} onChange={handleInputChange} className="cyber-input">
                                <option value="Week 1">Week 1</option>
                                <option value="Week 2">Week 2</option>
                                <option value="Week 3">Week 3</option>
                                <option value="Week 4">Week 4</option>
                                <option value="Mid Term">Mid Term</option>
                                <option value="Final">Final</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Branch</label>
                            <input type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="cyber-input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Target Section (Optional)</label>
                            <select name="section" value={formData.section} onChange={handleInputChange} className="cyber-input">
                                <option value="">All Sections</option>
                                {sections && sections.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>Duration (Minutes)</label>
                            <input type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleInputChange} className="cyber-input" />
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--pearl-border)', marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem', display: 'flex', justifyContent: 'space-between' }}>
                            Questions ({formData.questions.length})
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Total Marks: {formData.questions.reduce((acc, q) => acc + parseFloat(q.marks || 1), 0)}
                            </span>
                        </h4>

                        {/* Question Input */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    name="questionText"
                                    value={currentQuestion.questionText}
                                    onChange={handleQuestionChange}
                                    className="cyber-input"
                                    placeholder="Enter Question Text..."
                                    style={{ flex: 1 }}
                                />
                                <div style={{ width: '100px' }}>
                                    <input
                                        type="number"
                                        name="marks"
                                        value={currentQuestion.marks}
                                        onChange={handleQuestionChange}
                                        className="cyber-input"
                                        placeholder="Marks"
                                        step="0.5"
                                        min="0.5"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {currentQuestion.options.map((opt, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        className="cyber-input"
                                        placeholder={`Option ${idx + 1}`}
                                        style={{ borderColor: currentQuestion.correctOptionIndex === idx ? 'var(--accent-primary)' : '' }}
                                    />
                                ))}
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Correct Option:</label>
                                <select
                                    name="correctOptionIndex"
                                    value={currentQuestion.correctOptionIndex}
                                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctOptionIndex: parseInt(e.target.value) }))}
                                    className="cyber-input"
                                    style={{ width: '100px' }}
                                >
                                    <option value={0}>Option 1</option>
                                    <option value={1}>Option 2</option>
                                    <option value={2}>Option 3</option>
                                    <option value={3}>Option 4</option>
                                </select>
                                <button onClick={addQuestion} className="cyber-btn" style={{ padding: '0.6rem 1.2rem', marginLeft: 'auto', fontSize: '0.8rem' }}><FaPlus /> Add Question</button>
                            </div>
                        </div>

                        {/* Question List Preview */}
                        {formData.questions.map((q, i) => (
                            <div key={i} style={{ padding: '0.8rem', background: 'white', borderRadius: '8px', border: '1px solid var(--pearl-border)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{i + 1}. {q.questionText}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ans: {q.options[q.correctOptionIndex]}</div>
                                </div>
                                <button onClick={() => removeQuestion(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash /></button>
                            </div>
                        ))}

                    </div>

                    <button onClick={handleSubmit} className="cyber-btn primary" style={{ width: '100%', justifyContent: 'center' }}>Create and Publish Exam</button>

                </div>
            </div>
        );
    }

    return (
        <div className="faculty-exams">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Exam Management</h2>
                    <p style={{ margin: 0, opacity: 0.7 }}>Manage quizzes and exams for {subject} - Year {year}</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="cyber-btn primary">
                    <FaPlus /> Create New Exam
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}><FaCircleNotch className="spin-fast" /> Loading exams...</div>
            ) : exams.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaClipboardList style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1rem' }} />
                    <h3>No Exams Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't created any exams for this class yet.</p>
                    <button onClick={() => setShowCreate(true)} className="cyber-btn" style={{ margin: '1rem auto' }}>Create One Now</button>
                </div>
            ) : (
                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {exams.map(exam => (
                        <div key={exam._id} className="glass-card" style={{ position: 'relative', borderLeft: '4px solid var(--accent-primary)' }}>
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                <button onClick={() => handleDeleteExam(exam._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete Exam"><FaTrash /></button>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem' }}>{exam.title}</h3>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                                {exam.topic} • {exam.week}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Questions:</span> <strong>{exam.questions.length}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Duration:</span> <strong>{exam.durationMinutes} mins</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Total Marks:</span> <strong>{exam.totalMarks || exam.questions.length}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Target:</span> <strong>{exam.section ? `Section ${exam.section}` : 'All Sections'}</strong>
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
