import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaClipboardCheck, FaListAlt, FaArrowLeft, FaPlay, FaRocket, FaShieldAlt, FaHistory, FaChevronRight } from 'react-icons/fa';
import { apiGet, apiPost } from '../../utils/apiClient';

/**
 * NEXUS ASSESSMENT CENTER (Student Exams)
 * A premium interface for exams, quizzes, and academic challenges.
 */
const StudentExams = ({ studentData }) => {
    const [view, setView] = useState('list'); // 'list', 'taking', 'result', 'history'
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [currentExam, setCurrentExam] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [examResult, setExamResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const { branch = 'CSE', year = '1', section = 'A', sid = '' } = studentData || {};

    const fetchExams = async () => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({ branch, year, section: section || '' });
            const data = await apiGet(`/api/exams/student?${qs.toString()}`);
            if (data) setExams(data);
        } catch (error) {
            console.error("Nexus Exam Sync Failed:", error);
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
            console.error("Nexus History Sync Failed:", error);
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
        setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
    };

    const submitExam = async () => {
        if (!currentExam) return;
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
            console.error("Exam Submission Compromised:", error);
        }
    };

    useEffect(() => {
        if (view === 'list') fetchExams();
        if (view === 'history') fetchHistory();
    }, [view]);

    useEffect(() => {
        let timer;
        if (view === 'taking' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        submitExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [view, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!studentData) {
        return (
            <div className="loading-container">
                <div className="nexus-loading-ring"></div>
                <p className="loading-text">SYNCING STUDENT IDENTITY...</p>
            </div>
        );
    }

    // --- TAKING EXAM VIEW ---
    if (view === 'taking' && currentExam) {
        return (
            <div className="nexus-exam-taking-env animate-fade-in">
                <div className="exam-sticky-header">
                    <div className="header-left">
                        <div className="exam-id-badge">ACTIVE CHALLENGE</div>
                        <h2>{currentExam.title} <span className="subject-pipe">{currentExam.subject}</span></h2>
                    </div>
                    <div className="header-center">
                        <div className={`nexus-timer ${timeLeft < 60 ? 'critical' : ''}`}>
                            <FaClock /> {formatTime(timeLeft)}
                        </div>
                    </div>
                    <div className="header-right">
                        <button onClick={submitExam} className="nexus-btn-finish">TRANSMIT ANSWERS <FaRocket /></button>
                    </div>
                </div>

                <div className="exam-questions-viewport">
                    {currentExam.questions.map((q, i) => (
                        <div key={i} className="nexus-q-card">
                            <div className="q-label">QUESTION {i + 1} <span className="q-marks">[{q.marks} MP]</span></div>
                            <h4 className="q-text">{q.questionText}</h4>
                            <div className="options-matrix">
                                {q.options.map((opt, optIdx) => (
                                    <label key={optIdx} className={`option-item ${userAnswers[i] === optIdx ? 'selected' : ''}`}>
                                        <input type="radio" name={`q-${i}`} checked={userAnswers[i] === optIdx} onChange={() => handleAnswer(i, optIdx)} />
                                        <div className="opt-marker">{String.fromCharCode(65 + optIdx)}</div>
                                        <span className="opt-text">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={submitExam} className="nexus-mega-submit">SUBMIT ALL TRANSMISSIONS</button>
                </div>
            </div>
        );
    }

    // --- RESULT VIEW ---
    if (view === 'result' && examResult) {
        const percentage = Math.round((examResult.score / examResult.totalMarks) * 100);
        return (
            <div className="nexus-result-center animate-fade-in">
                <div className="nexus-result-card">
                    <div className="nexus-stamp">
                        {percentage >= 75 ? '🎖️' : percentage >= 40 ? '✅' : '📉'}
                    </div>
                    <h2 className="result-title">ASSESSMENT COMPLETE</h2>
                    <p className="result-desc">Mission success. Data has been transmitted to Central Academic Control.</p>

                    <div className="result-stats-grid">
                        <div className="res-stat-card">
                            <div className="val">{examResult.score} / {examResult.totalMarks}</div>
                            <div className="lab">NEURAL SCORE</div>
                        </div>
                        <div className="res-stat-card">
                            <div className={`val highlight-big ${percentage >= 40 ? 'rating pass' : 'rating fail'}`}>{percentage}%</div>
                            <div className="lab">ACCURACY RATING</div>
                        </div>
                    </div>

                    <div className="result-actions">
                        <button onClick={() => setView('list')} className="nexus-btn-pri">HUB ENTRY</button>
                        <button onClick={() => setView('history')} className="nexus-btn-sec">CHALLENGE RECORDS</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- HISTORY VIEW ---
    if (view === 'history') {
        return (
            <div className="nexus-assessment-history animate-fade-in">
                <div className="history-header">
                    <button onClick={() => setView('list')} className="nexus-back-btn"><FaArrowLeft /></button>
                    <h1 className="history-title">MISSION <span>HISTORY</span></h1>
                </div>

                {loading ? <div className="nexus-loading-ring"></div> : (
                    <div className="nexus-history-list">
                        {results.length === 0 ? <p className="empty-msg">No flight records found.</p> : results.map((res) => (
                            <div key={res._id} className="nexus-history-card">
                                <div className="card-left">
                                    <div className="subject-dot"></div>
                                    <div className="info">
                                        <h4>{res.examId?.title || 'Unknown Mission'}</h4>
                                        <span className="info-sub">{new Date(res.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} • {res.examId?.subject}</span>
                                    </div>
                                </div>
                                <div className="card-right">
                                    <div className="score">{res.score} / {res.totalMarks}</div>
                                    <div className={`rating ${res.score / res.totalMarks >= 0.4 ? 'pass' : 'fail'}`}>
                                        {Math.round((res.score / res.totalMarks) * 100)}% ACCURACY
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- DEFAULT LIST VIEW ---
    return (
        <div className="nexus-exams-list animate-fade-in">
            <div className="nexus-exams-header">
                <div>
                    <div className="nexus-journal-subtitle">
                        <FaShieldAlt /> Proving Grounds <div className="pulse-dot"></div>
                    </div>
                    <h1 className="nexus-journal-title">
                        ACTIVE <span>CHALLENGES</span>
                    </h1>
                </div>
                <div className="header-actions">
                    <button onClick={fetchExams} className="nexus-history-trigger">
                        <FaClock /> RE-SYNC
                    </button>
                    <button onClick={() => setView('history')} className="nexus-history-trigger">
                        <FaHistory /> MISSION LOGS
                    </button>
                </div>
            </div>

            {loading ? <div className="nexus-loading-ring"></div> : (
                <div className="nexus-challenges-grid">
                    {exams.length === 0 ? (
                        <div className="nexus-empty-challenges">
                            <div className="empty-ufo">🛰️</div>
                            <h3>NO ACTIVE SIGNALS</h3>
                            <p>No active assessment modules detected for your sector ({branch} - {year}). Stand by for incoming transmissions.</p>
                            <button onClick={fetchExams} className="nexus-btn-pri-mini">RE-SCAN SECTOR</button>
                        </div>
                    ) : (
                        <div className="nexus-notes-grid">
                            {exams.map(exam => (
                                <div key={exam._id} className="challenge-node-card">
                                    <div className="node-accent"></div>
                                    <div className="node-head">
                                        <span className="subject-tag">{exam.subject.toUpperCase()}</span>
                                        <span className="week-tag">{exam.week || 'CORE'}</span>
                                    </div>
                                    <h3 className="node-title">{exam.title}</h3>
                                    <div className="node-metrics">
                                        <div className="node-metric-item"><FaListAlt /> {exam.questions.length} CHUNKS</div>
                                        <div className="node-metric-item"><FaClock /> {exam.durationMinutes} MINS</div>
                                    </div>
                                    <button onClick={() => startExam(exam)} className="node-launch-btn">
                                        INITIATE SEQUENCE <FaChevronRight />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentExams;
