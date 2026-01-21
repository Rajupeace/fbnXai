import React, { useState, useEffect } from 'react';
import { FaChartBar, FaSearch, FaTrophy, FaUserGraduate, FaSyncAlt, FaFileSignature } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';

/**
 * SENTINEL ASSESSMENT ANALYTICS
 * Strategic evaluation of personnel performance and academic benchmarking.
 */
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

    const totalAttempts = results.length;
    const avgScore = totalAttempts > 0
        ? Math.round((results.reduce((acc, curr) => acc + (curr.score / curr.totalMarks), 0) / totalAttempts) * 100)
        : 0;

    const topScores = [...results].sort((a, b) => (b.score / b.totalMarks) - (a.score / a.totalMarks)).slice(0, 5);

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
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>ASSESSMENT <span>ANALYTICS</span></h1>
                    <p>Performance telemetry and cadet evaluation benchmarking</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <button onClick={fetchAnalytics} className="admin-btn admin-btn-outline">
                        <FaSyncAlt /> SYNC ANALYTICS
                    </button>
                </div>
            </header>

            {/* Assessment Metrics */}
            <div className="admin-stats-grid" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#eff6ff', color: 'var(--admin-primary)' }}><FaUserGraduate /></div>
                    <div className="value">{totalAttempts}</div>
                    <div className="label">TOTAL EVALUATIONS</div>
                </div>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#ecfdf5', color: 'var(--admin-success)' }}><FaChartBar /></div>
                    <div className="value">{avgScore}%</div>
                    <div className="label">GLOBAL AGGREGATE</div>
                </div>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#fffbeb', color: 'var(--admin-warning)' }}><FaTrophy /></div>
                    <div className="value" style={{ fontSize: '1.25rem', fontWeight: 950 }}>
                        {topScores.length > 0 ? topScores[0].studentId?.name?.split(' ')[0].toUpperCase() : 'N/A'}
                    </div>
                    <div className="label">TOP ELITE PERFOMER</div>
                </div>
            </div>

            {/* Tactical Controls */}
            <div className="admin-card" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-filter-bar">
                    <div className="admin-search-wrapper" style={{ flex: 2, minWidth: '300px' }}>
                        <FaSearch />
                        <input
                            className="admin-search-input"
                            type="text"
                            placeholder="RECONNAISSANCE: Search Cadet or Module Identity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="admin-filter-select"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                    >
                        <option value="All">All Phases</option>
                        <option value="1">Phase 1</option>
                        <option value="2">Phase 2</option>
                        <option value="3">Phase 3</option>
                        <option value="4">Phase 4</option>
                    </select>

                    <select
                        className="admin-filter-select"
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                    >
                        <option value="All">All Sectors</option>
                        {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
            </div>

            {/* Performance Grid */}
            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-grid-table">
                        <thead>
                            <tr>
                                <th>CADET IDENTITY</th>
                                <th>ASSESSMENT MODULE</th>
                                <th>SECTOR ORIGIN</th>
                                <th>EFFICIENCY RATING</th>
                                <th>TIMELINE LOG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '6rem' }}><div className="f-empty-text">SYNCING PERFORMANCE DATA...</div></td></tr>
                            ) : filteredResults.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '6rem' }}><div className="f-empty-text">NO PERFORMANCE RECORDS DETECTED.</div></td></tr>
                            ) : (
                                filteredResults.map((row) => {
                                    const percentage = Math.round((row.score / row.totalMarks) * 100);
                                    let progressClass = 'warning';
                                    if (percentage >= 75) progressClass = 'success';
                                    else if (percentage >= 40) progressClass = 'primary';

                                    return (
                                        <tr key={row._id} className="sentinel-animate">
                                            <td>
                                                <div style={{ fontWeight: 950, color: 'var(--admin-secondary)' }}>{row.studentId?.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 850 }}>TOKEN: {row.studentId?.rollNumber}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="summary-icon-box" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: '#f8fafc' }}>
                                                        <FaFileSignature />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 950 }}>{row.examId?.title}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 850 }}>{row.examId?.subject} • {row.examId?.week}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 850 }}>{row.studentId?.branch} | PHASE {row.studentId?.year}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <div className="admin-progress-container">
                                                        <div className={`admin-progress-bar ${progressClass}`} style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    <span className={`admin-badge ${progressClass}`} style={{ fontSize: '0.7rem' }}>
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 850, color: 'var(--admin-text-muted)' }}>
                                                    {new Date(row.submittedAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminExams;
