import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaClipboardCheck, FaListAlt, FaArrowLeft, FaPlay } from 'react-icons/fa';
import { apiGet, apiPost } from '../../utils/apiClient';

const StudentExams = ({ studentData }) => {
    const [view, setView] = useState('list'); // 'list', 'taking', 'result', 'history'
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [currentExam, setCurrentExam] = useState(null);
    const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: optionIndex }
    const [examResult, setExamResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const { branch, year, section, sid } = studentData;

    useEffect(() => {
        if (view === 'list') fetchExams();
        if (view === 'history') fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view]);

    // Timer Logic
    useEffect(() => {
        let timer;
        if (view === 'taking' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        submitExam(); // Auto submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, timeLeft]);


    const fetchExams = async () => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({ branch, year, section: section || '' });
            const data = await apiGet(`/api/exams/student?${qs.toString()}`);
            if (data) setExams(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await apiGet(`/api/exams/results/student/${sid}`);
            if (data) setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startExam = (exam) => {
        setCurrentExam(exam);
        setUserAnswers({});
        setTimeLeft(exam.durationMinutes * 60);
        setView('taking');
    };

    const handleAnswer = (qIndex, optionIndex) => {
        setUserAnswers(prev => ({
            ...prev,
            [qIndex]: optionIndex
        }));
    };

    const submitExam = async () => {
        if (!currentExam) return;

        // Prepare answers array (null for unanswered)
        const answersArray = currentExam.questions.map((_, i) =>
            userAnswers[i] !== undefined ? userAnswers[i] : null
        );

        try {
            const result = await apiPost('/api/exams/submit', {
                studentId: sid,
                examId: currentExam._id,
                answers: answersArray
            });
            setExamResult(result);
            setView('result');
        } catch (error) {
            alert("Failed to submit exam: " + error.message);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (view === 'taking' && currentExam) {
        return (
            <div className="animate-fade-in">
                <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'white', padding: '1rem', borderBottom: '1px solid var(--pearl-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>{currentExam.title}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentExam.questions.length} Questions</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: timeLeft < 60 ? '#ef4444' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaClock /> {formatTime(timeLeft)}
                    </div>
                    <button onClick={submitExam} className="cyber-btn primary">
                        Finish Exam
                    </button>
                </div>

                <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    {currentExam.questions.map((q, i) => (
                        <div key={i} className="glass-card" style={{ marginBottom: '1.5rem', padding: '2rem' }}>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{i + 1}. {q.questionText} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>({q.marks} marks)</span></h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {q.options.map((opt, optIdx) => (
                                    <label key={optIdx} style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '1rem', borderRadius: '12px',
                                        border: userAnswers[i] === optIdx ? '2px solid var(--accent-primary)' : '1px solid var(--pearl-border)',
                                        background: userAnswers[i] === optIdx ? 'rgba(99, 102, 241, 0.05)' : 'white',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="radio"
                                            name={`q-${i}`}
                                            checked={userAnswers[i] === optIdx}
                                            onChange={() => handleAnswer(i, optIdx)}
                                            style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={submitExam} className="cyber-btn primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1.1rem', justifyContent: 'center' }}>Submit All Answers</button>
                </div>
            </div>
        );
    }

    if (view === 'result' && examResult) {
        const percentage = Math.round((examResult.score / examResult.totalMarks) * 100);
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                        {percentage >= 70 ? '🎉' : percentage >= 40 ? '👍' : '📚'}
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Exam Submitted!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You have successfully completed the exam.</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)' }}>{examResult.score}/{examResult.totalMarks}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>YOUR SCORE</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: percentage >= 40 ? '#10b981' : '#ef4444' }}>{percentage}%</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>PERCENTAGE</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700 }}>
                            <FaCheckCircle /> {examResult.correctAnswers} Correct
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 700 }}>
                            <FaTimesCircle /> {examResult.wrongAnswers} Wrong
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button onClick={() => setView('list')} className="cyber-btn primary" style={{ flex: 1, justifyContent: 'center' }}>Back to Exams</button>
                        <button onClick={() => setView('history')} className="cyber-btn" style={{ flex: 1, justifyContent: 'center' }}>View History</button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'history') {
        return (
            <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button onClick={() => setView('list')} className="cyber-btn" style={{ padding: '0.5rem 1rem' }}><FaArrowLeft /></button>
                    <h2 style={{ margin: 0 }}>My Exam History</h2>
                </div>

                {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div> : (
                    <div className="grid-responsive" style={{ display: 'grid', gap: '1rem' }}>
                        {results.length === 0 ? <p>No exams taken yet.</p> : results.map((res) => (
                            <div key={res._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem' }}>{res.examId?.title || 'Unknown Exam'}</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(res.submittedAt).toLocaleDateString()} • {res.examId?.subject}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-primary)' }}>{res.score}/{res.totalMarks}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: res.score / res.totalMarks >= 0.4 ? '#10b981' : '#ef4444' }}>
                                        {Math.round((res.score / res.totalMarks) * 100)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default: List View
    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}><FaClipboardCheck /> Available Exams</h2>
                <button onClick={() => setView('history')} className="cyber-btn" style={{ border: '1px solid var(--pearl-border)', background: 'white', color: 'var(--text-main)' }}>
                    <FaListAlt /> History & Results
                </button>
            </div>

            {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading exams...</div> : (
                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {exams.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}>📭</div>
                            No active exams found for your section for now.
                        </div>
                    ) : exams.map(exam => (
                        <div key={exam._id} className="glass-card" style={{ borderTop: '4px solid var(--accent-primary)', padding: '2rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                {exam.subject} • {exam.week}
                            </div>
                            <h3 style={{ fontSize: '1.3rem', margin: '0 0 1rem' }}>{exam.title}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaListAlt /> {exam.questions.length} Questions</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaClock /> {exam.durationMinutes} Minutes</div>
                            </div>
                            <button onClick={() => startExam(exam)} className="cyber-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                                <FaPlay /> Start Exam
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentExams;
