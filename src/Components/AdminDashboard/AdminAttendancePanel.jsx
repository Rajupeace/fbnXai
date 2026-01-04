import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaCalendarAlt, FaSearch, FaFileExport, FaFilter } from 'react-icons/fa';

const AdminAttendancePanel = () => {
    const [filters, setFilters] = useState({
        year: '1',
        branch: 'CSE',
        section: 'A',
        subject: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, present: 0 });

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            // Construct Query String
            const params = new URLSearchParams(filters);
            // Remove empty filters
            for (const [key, value] of Object.entries(filters)) {
                if (!value) params.delete(key);
            }

            const data = await apiGet(`/api/attendance/all?${params.toString()}`);

            if (Array.isArray(data)) {
                setAttendanceData(data);
                // Calculate aggregated stats from the fetched records
                let total = 0;
                let present = 0;
                data.forEach(record => {
                    total += record.records.length;
                    present += record.records.filter(r => r.status === 'Present').length;
                });
                setStats({ total, present });
            } else {
                setAttendanceData([]);
                setStats({ total: 0, present: 0 });
            }

        } catch (error) {
            console.error("Attendance fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []); // Initial load? Or should we wait for user to click search? Let's load initially.

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getPercentage = () => {
        if (stats.total === 0) return 0;
        return Math.round((stats.present / stats.total) * 100);
    };

    return (
        <div className="admin-attendance-panel glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <FaCalendarAlt color="var(--accent-primary)" /> Master Attendance Grid
            </h2>

            {/* Filters */}
            <div className="filters-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--pearl-border)' }}>

                <div className="filter-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>YEAR</label>
                    <select
                        value={filters.year}
                        onChange={e => handleFilterChange('year', e.target.value)}
                        style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '100px' }}
                    >
                        <option value="">All Years</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>BRANCH</label>
                    <select
                        value={filters.branch}
                        onChange={e => handleFilterChange('branch', e.target.value)}
                        style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '120px' }}
                    >
                        <option value="">All Branches</option>
                        {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>SECTION</label>
                    <select
                        value={filters.section}
                        onChange={e => handleFilterChange('section', e.target.value)}
                        style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '100px' }}
                    >
                        <option value="">All</option>
                        {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>DATE</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={e => handleFilterChange('date', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={fetchAttendance} className="cyber-btn primary" style={{ padding: '0.7rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaSearch /> Load Data
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="stats-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a' }}>{stats.present}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>TOTAL PRESENT</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>{stats.total - stats.present}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c' }}>TOTAL ABSENT</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>{getPercentage()}%</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8' }}>ATTENDANCE RATE</div>
                </div>
            </div>

            {/* Results Table */}
            <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', color: '#64748b' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Subject</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Class Info</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Faculty</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Present / Total</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData.map((record) => {
                            const p = record.records.filter(r => r.status === 'Present').length;
                            const t = record.records.length;
                            return (
                                <tr key={record._id || record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(record.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{record.subject}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {record.branch} - {record.year} - {record.section}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{record.facultyName || record.facultyId}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ color: p === t ? '#16a34a' : '#d97706', fontWeight: 700 }}>{p}</span> / {t}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>View Details</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {attendanceData.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    {loading ? 'Searching...' : 'No records found for the selected criteria.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default AdminAttendancePanel;
