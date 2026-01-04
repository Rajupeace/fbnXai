import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaUserGraduate, FaChartBar, FaUsers } from 'react-icons/fa';

const StudentStatistics = () => {
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        byYear: {},
        byBranch: {},
        bySection: {},
        loggedInToday: 0
    });

    useEffect(() => {
        fetchStudentData();
        const interval = setInterval(fetchStudentData, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchStudentData = async () => {
        try {
            const data = await apiGet('/api/students');
            if (Array.isArray(data)) {
                setStudents(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch student data", error);
        }
    };

    const calculateStats = (data) => {
        const byYear = {};
        const byBranch = {};
        const bySection = {};
        const today = new Date().toDateString();
        let loggedInToday = 0;

        data.forEach(student => {
            // Count by year
            const year = student.year || 'Unknown';
            byYear[year] = (byYear[year] || 0) + 1;

            // Count by branch
            const branch = student.branch || 'Unknown';
            byBranch[branch] = (byBranch[branch] || 0) + 1;

            // Count by section
            const section = student.section || 'Unknown';
            bySection[section] = (bySection[section] || 0) + 1;

            // Check last login (if available)
            if (student.lastLogin && new Date(student.lastLogin).toDateString() === today) {
                loggedInToday++;
            }
        });

        setStats({
            total: data.length,
            byYear,
            byBranch,
            bySection,
            loggedInToday
        });
    };

    const getYearColor = (year) => {
        const colors = {
            '1': '#3b82f6',
            '2': '#10b981',
            '3': '#f59e0b',
            '4': '#ef4444'
        };
        return colors[year] || '#94a3b8';
    };

    const getBranchColor = (branch) => {
        const colors = {
            'CSE': '#6366f1',
            'ECE': '#8b5cf6',
            'EEE': '#ec4899',
            'MECH': '#f97316',
            'CIVIL': '#14b8a6',
            'IT': '#3b82f6',
            'AIML': '#a855f7'
        };
        return colors[branch] || '#94a3b8';
    };

    return (
        <div className="student-statistics" style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#1e293b' }}>
                <FaUserGraduate style={{ color: '#3b82f6' }} /> Student Statistics
            </h2>

            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{stats.total}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Students</div>
                </div>
                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{stats.loggedInToday}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Logged In Today</div>
                </div>
                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{Object.keys(stats.byBranch).length}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Active Branches</div>
                </div>
            </div>

            {/* Year-wise Distribution */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaChartBar /> Year-wise Distribution
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    {Object.entries(stats.byYear).sort().map(([year, count]) => (
                        <div key={year} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>YEAR {year}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: getYearColor(year) }}>{count}</div>
                            <div style={{ marginTop: '0.5rem', height: '4px', background: '#e2e8f0', borderRadius: '4px' }}>
                                <div style={{ width: `${(count / stats.total) * 100}%`, height: '100%', background: getYearColor(year), borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Branch-wise Distribution */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaUsers /> Branch-wise Distribution
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    {Object.entries(stats.byBranch).map(([branch, count]) => (
                        <div key={branch} style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: `2px solid ${getBranchColor(branch)}`, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: getBranchColor(branch) }}></div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem' }}>{branch}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: getBranchColor(branch) }}>{count}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                                {((count / stats.total) * 100).toFixed(1)}% of total
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section-wise Distribution */}
            <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#475569' }}>Section-wise Distribution</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {Object.entries(stats.bySection).sort().map(([section, count]) => (
                        <div key={section} style={{ padding: '1rem 1.5rem', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6' }}>Section {section}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#64748b' }}>{count}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentStatistics;
