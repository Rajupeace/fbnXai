import React, { useState, useEffect } from 'react';
import { FaChartBar, FaSearch, FaTrophy, FaUserGraduate } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';

const AdminExams = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('All');
    const [filterBranch, setFilterBranch] = useState('All');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const data = await apiGet('/api/exams/analytics');
            if (data) setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Metrics
    const totalAttempts = results.length;
    const avgScore = totalAttempts > 0
        ? Math.round((results.reduce((acc, curr) => acc + (curr.score / curr.totalMarks), 0) / totalAttempts) * 100)
        : 0;

    // Top Students (by score % across all exams)
    // We can group by student? Or just list top single exam scores? 
    // Let's list top 5 single exam scores for now.
    const topScores = [...results].sort((a, b) => (b.score / b.totalMarks) - (a.score / a.totalMarks)).slice(0, 5);

    // Filtered Results
    const filteredResults = results.filter(res => {
        const student = res.studentId || {};
        const exam = res.examId || {};

        const matchesSearch =
            (student.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (exam.title?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesYear = filterYear === 'All' || String(student.year) === String(filterYear);
        const matchesBranch = filterBranch === 'All' || student.branch === filterBranch;

        return matchesSearch && matchesYear && matchesBranch;
    });

    return (
        <div className="animate-fade-in" style={{ padding: '0 0.5rem' }}>
            {/* Header Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                        <FaUserGraduate />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalAttempts}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL ATTEMPTS</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                        <FaChartBar />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{avgScore}%</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVERAGE SCORE</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                        <FaTrophy />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Top Performers</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {topScores.length > 0 ? topScores[0].studentId?.name || 'Unknown' : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid var(--pearl-border)', borderRadius: '10px', padding: '0.6rem 1rem', width: '300px' }}>
                        <FaSearch style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
                        <input
                            type="text"
                            placeholder="Search Student or Exam..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                        />
                    </div>

                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="cyber-input"
                        style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--pearl-border)' }}
                    >
                        <option value="All">All Years</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                    </select>

                    <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        className="cyber-input"
                        style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--pearl-border)' }}
                    >
                        <option value="All">All Branches</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="MECH">MECH</option>
                        <option value="CIVIL">CIVIL</option>
                        <option value="IT">IT</option>
                        <option value="AIML">AIML</option>
                    </select>
                </div>

                <button
                    onClick={fetchAnalytics}
                    className="cyber-btn"
                    style={{ background: 'white', border: '1px solid var(--pearl-border)', padding: '0.6rem 1.2rem' }}
                >
                    Refresh Data
                </button>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="cyber-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--pearl-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>STUDENT</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>EXAM</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>BRANCH / YEAR</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>SCORE</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>DATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading metrics...</td></tr>
                        ) : filteredResults.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No records found.</td></tr>
                        ) : (
                            filteredResults.map((row) => {
                                const percentage = Math.round((row.score / row.totalMarks) * 100);
                                return (
                                    <tr key={row._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.studentId?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.studentId?.rollNumber}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.examId?.title || 'Unknown Exam'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.examId?.subject} • {row.examId?.week}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>{row.studentId?.branch} - Year {row.studentId?.year}</div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.3rem 0.8rem', borderRadius: '20px',
                                                background: percentage >= 40 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: percentage >= 40 ? '#059669' : '#ef4444',
                                                fontWeight: 700,
                                                fontSize: '0.85rem'
                                            }}>
                                                {row.score}/{row.totalMarks} ({percentage}%)
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {new Date(row.submittedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminExams;
