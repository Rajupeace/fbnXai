import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUserGraduate, FaFileSignature, FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import { apiGet, apiPost, apiDelete, apiPut } from '../../utils/apiClient';

/**
 * ADMIN EXAM MANAGEMENT
 * Evaluation and management of academic assessments.
 */
const AdminExams = () => {
    const [view, setView] = useState('analytics'); // 'analytics', 'manage', 'create', 'edit'
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);

    // Exam Form Entry State
    const [examForm, setExamForm] = useState({
        title: '',
        subject: '',
        topic: '', // Optional
        branch: 'CSE',
        year: '1',
        section: 'A',
        durationMinutes: 30,
        totalMarks: 0,
        questions: []
    });
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 1
    });

    useEffect(() => {
        if (view === 'analytics') fetchAnalytics();
        if (view === 'manage') fetchAllExams();
    }, [view]);

    // --- ANALYTICS ---
    const fetchAnalytics = async () => {
        try {
            const data = await apiGet('/api/exams/analytics');
            if (data) setResults(data);
        } catch (error) {
            console.error(error);
        }
    };

    // --- EXAM MANAGEMENT ---
    const fetchAllExams = async () => {
        try {
            const data = await apiGet('/api/exams/all');
            if (data) setExams(data);
        } catch (error) {
            console.error("Fetch exams failed:", error);
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;
        try {
            await apiDelete(`/api/exams/${id}`);
            setExams(prev => prev.filter(e => e._id !== id));
        } catch (e) {
            alert("Failed to delete exam: " + e.message);
        }
    };

    const handleEditExam = (exam) => {
        setExamForm({
            ...exam,
            id: exam._id
        });
        setView('edit');
    };

    // --- FORM HANDLING ---
    const addQuestion = () => {
        if (!currentQuestion.questionText) return alert("Question text required");
        setExamForm(prev => ({
            ...prev,
            questions: [...prev.questions, currentQuestion],
            totalMarks: prev.totalMarks + Number(currentQuestion.marks)
        }));
        setCurrentQuestion({
            questionText: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            marks: 1
        });
    };

    const deleteQuestion = (idx) => {
        const q = examForm.questions[idx];
        setExamForm(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== idx),
            totalMarks: prev.totalMarks - q.marks
        }));
    };

    const saveExam = async () => {
        if (!examForm.title || !examForm.subject || examForm.questions.length === 0) {
            return alert("Error: Title, Subject and Questions required.");
        }

        try {
            if (view === 'edit') {
                await apiPut(`/api/exams/${examForm.id}`, examForm);
                alert("Exam updated successfully!");
            } else {
                await apiPost('/api/exams/create', examForm);
                alert("New exam created!");
            }
            setView('manage');
        } catch (e) {
            console.error(e);
            alert("Operation failed: " + e.message);
        }
    };

    // --- RENDER HELPERS ---
    const renderAnalytics = () => {
        const totalAttempts = results.length;
        const avgScore = totalAttempts > 0
            ? Math.round((results.reduce((acc, curr) => acc + (curr.score / curr.totalMarks), 0) / totalAttempts) * 100)
            : 0;

        return (
            <div className="animate-fade-in">
                <div className="admin-stats-grid">
                    <div className="admin-summary-card">
                        <div className="summary-icon-box" style={{ background: '#eff6ff', color: 'var(--admin-primary)' }}><FaUserGraduate /></div>
                        <div className="value">{totalAttempts}</div>
                        <div className="label">TOTAL EVALUATIONS</div>
                    </div>
                    <div className="admin-summary-card">
                        <div className="summary-icon-box" style={{ background: '#ecfdf5', color: 'var(--admin-success)' }}><FaChartBar /></div>
                        <div className="value">{avgScore}%</div>
                        <div className="label">AVERAGE SCORE</div>
                    </div>
                </div>

                <h3 className="section-title" style={{ marginTop: '2rem' }}>Recent Student Results</h3>
                <div className="admin-card">
                    <div className="admin-table-wrap">
                        <table className="admin-grid-table">
                            <thead>
                                <tr>
                                    <th>STUDENT</th>
                                    <th>EXAM</th>
                                    <th>RATING</th>
                                    <th>DATE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.slice(0, 10).map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.studentId?.name || 'Unknown'}</td>
                                        <td>{row.examId?.title || 'Archive'}</td>
                                        <td>
                                            <span className={`admin-badge ${row.score / row.totalMarks >= 0.75 ? 'success' : row.score / row.totalMarks >= 0.4 ? 'primary' : 'danger'}`}>
                                                {Math.round((row.score / row.totalMarks) * 100)}%
                                            </span>
                                        </td>
                                        <td>{new Date(row.submittedAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderManage = () => (
        <div className="animate-fade-in">
            <div className="admin-action-bar">
                <button onClick={() => {
                    setExamForm({ title: '', subject: '', topic: '', branch: 'CSE', year: '1', section: 'A', durationMinutes: 30, totalMarks: 0, questions: [] });
                    setView('create');
                }} className="admin-btn admin-btn-primary">
                    <FaPlus /> CREATE NEW EXAM
                </button>
            </div>
            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-grid-table">
                        <thead>
                            <tr>
                                <th>EXAM TITLE</th>
                                <th>CLASS</th>
                                <th>QUESTIONS/MARKS</th>
                                <th>DURATION</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map(ex => (
                                <tr key={ex._id}>
                                    <td style={{ fontWeight: 600 }}>{ex.title}</td>
                                    <td>
                                        <span className="admin-badge primary">{ex.branch}-Y{ex.year}</span>
                                    </td>
                                    <td>{ex.questions?.length || 0} Qs / {ex.totalMarks} MP</td>
                                    <td>{ex.durationMinutes}m</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEditExam(ex)} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem' }}><FaEdit /></button>
                                            <button onClick={() => handleDeleteExam(ex._id)} className="admin-btn admin-btn-outline" style={{ padding: '0.4rem', color: 'red', borderColor: 'red' }}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderForm = () => (
        <div className="animate-fade-in">
            <div className="admin-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaFileSignature /> {view === 'create' ? 'CREATE EXAM' : 'EDIT EXAM'}
                </h3>

                <div className="nexus-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <label className="admin-detail-label">TITLE</label>
                        <input className="admin-search-input" style={{ width: '100%' }} value={examForm.title} onChange={e => setExamForm({ ...examForm, title: e.target.value })} placeholder="e.g. Mid-Term Assessment" />
                    </div>
                    <div>
                        <label className="admin-detail-label">SUBJECT</label>
                        <input className="admin-search-input" style={{ width: '100%' }} value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })} placeholder="e.g. Mathematics-I" />
                    </div>
                    <div>
                        <label className="admin-detail-label">BRANCH</label>
                        <select className="admin-search-input" style={{ width: '100%' }} value={examForm.branch} onChange={e => setExamForm({ ...examForm, branch: e.target.value })}>
                            {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="admin-detail-label">YEAR</label>
                        <select className="admin-search-input" style={{ width: '100%' }} value={examForm.year} onChange={e => setExamForm({ ...examForm, year: e.target.value })}>
                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="admin-detail-label">SECTION</label>
                        <select className="admin-search-input" style={{ width: '100%' }} value={examForm.section} onChange={e => setExamForm({ ...examForm, section: e.target.value })}>
                            <option value="">All Sections</option>
                            <option value="A">A</option> <option value="B">B</option> <option value="C">C</option> <option value="D">D</option>
                        </select>
                    </div>
                    <div>
                        <label className="admin-detail-label">DURATION (MIN)</label>
                        <input type="number" className="admin-search-input" style={{ width: '100%' }} value={examForm.durationMinutes} onChange={e => setExamForm({ ...examForm, durationMinutes: Number(e.target.value) })} />
                    </div>
                </div>

                <div className="question-builder" style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem' }}>QUESTIONS ({examForm.questions.length} Added)</h4>

                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <input
                            className="admin-search-input"
                            style={{ width: '100%', marginBottom: '1rem' }}
                            placeholder="Question Text..."
                            value={currentQuestion.questionText}
                            onChange={e => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            {currentQuestion.options.map((opt, i) => (
                                <input
                                    key={i}
                                    className="admin-search-input"
                                    style={{ width: '100%', borderColor: currentQuestion.correctOptionIndex === i ? 'green' : '' }}
                                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                    value={opt}
                                    onChange={e => {
                                        const newOpts = [...currentQuestion.options];
                                        newOpts[i] = e.target.value;
                                        setCurrentQuestion({ ...currentQuestion, options: newOpts });
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <label>Correct Option: </label>
                            <select
                                value={currentQuestion.correctOptionIndex}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, correctOptionIndex: Number(e.target.value) })}
                                className="admin-search-input"
                                style={{ width: 'auto' }}
                            >
                                <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
                            </select>
                            <label>Marks: </label>
                            <input
                                type="number"
                                style={{ width: '60px' }}
                                className="admin-search-input"
                                value={currentQuestion.marks}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, marks: Number(e.target.value) })}
                            />
                            <button onClick={addQuestion} className="admin-btn admin-btn-primary" style={{ marginLeft: 'auto' }}>ADD QUESTION</button>
                        </div>
                    </div>

                    <div className="added-questions">
                        {examForm.questions.map((q, i) => (
                            <div key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                <span><b>{i + 1}.</b> {q.questionText} ({q.marks}M)</span>
                                <button onClick={() => deleteQuestion(i)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><FaTrash /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={() => setView('manage')} className="admin-btn admin-btn-outline">CANCEL</button>
                    <button onClick={saveExam} className="admin-btn admin-btn-primary"><FaSave /> SAVE EXAM</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>EXAM <span>MANAGEMENT</span></h1>
                    <p>Manage and track student assessments</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <button onClick={() => setView('analytics')} className={`admin-btn ${view === 'analytics' ? 'admin-btn-primary' : 'admin-btn-outline'}`}>
                        <FaChartBar /> ANALYTICS
                    </button>
                    <button onClick={() => setView('manage')} className={`admin-btn ${view !== 'analytics' ? 'admin-btn-primary' : 'admin-btn-outline'}`}>
                        <FaFileSignature /> MANAGE EXAMS
                    </button>
                </div>
            </header>

            {view === 'analytics' && renderAnalytics()}
            {view === 'manage' && renderManage()}
            {(view === 'create' || view === 'edit') && renderForm()}
        </div>
    );
};

export default AdminExams;
