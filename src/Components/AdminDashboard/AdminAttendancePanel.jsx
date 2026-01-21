import React, { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaSearch, FaUserCheck, FaUserTimes, FaChartPie, FaUsers } from 'react-icons/fa';

/**
 * SENTINEL ATTENDANCE TELEMETRY
 * Strategic monitoring of personnel presence across academic sectors.
 */
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

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            for (const [key, value] of Object.entries(filters)) {
                if (!value) params.delete(key);
            }

            const data = await apiGet(`/api/attendance/all?${params.toString()}`);

            if (Array.isArray(data)) {
                setAttendanceData(data);
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
    }, [filters]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getPercentage = () => {
        if (stats.total === 0) return 0;
        return Math.round((stats.present / stats.total) * 100);
    };

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>ATTENDANCE <span>TELEMETRY</span></h1>
                    <p>Real-time personnel presence state monitoring</p>
                </div>
            </header>

            {/* Strategic Filters */}
            <div className="admin-card" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-filter-bar">
                    <div className="admin-search-wrapper">
                        <label className="admin-detail-label">COHORT YEAR</label>
                        <select
                            className="admin-filter-select"
                            value={filters.year}
                            onChange={e => handleFilterChange('year', e.target.value)}
                        >
                            <option value="">All Years</option>
                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                    </div>

                    <div className="admin-search-wrapper">
                        <label className="admin-detail-label">SECTOR BRANCH</label>
                        <select
                            className="admin-filter-select"
                            value={filters.branch}
                            onChange={e => handleFilterChange('branch', e.target.value)}
                        >
                            <option value="">All Branches</option>
                            {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    <div className="admin-search-wrapper">
                        <label className="admin-detail-label">SECTION</label>
                        <select
                            className="admin-filter-select"
                            value={filters.section}
                            onChange={e => handleFilterChange('section', e.target.value)}
                        >
                            <option value="">All Sections</option>
                            {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>

                    <div className="admin-search-wrapper">
                        <label className="admin-detail-label">TIMELINE DATE</label>
                        <input
                            type="date"
                            className="admin-filter-select"
                            value={filters.date}
                            onChange={e => handleFilterChange('date', e.target.value)}
                            style={{ minWidth: '160px' }}
                        />
                    </div>

                    <button onClick={fetchAttendance} className="admin-btn admin-btn-primary" style={{ height: '42px', marginTop: '1.2rem' }}>
                        <FaSearch size={14} /> SCAN RECORDS
                    </button>
                </div>
            </div>

            {/* Real-time Stats */}
            <div className="admin-stats-grid" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#f0fdf4', color: '#15803d' }}><FaUserCheck /></div>
                    <div className="value">{stats.present}</div>
                    <div className="label">CADETS PRESENT</div>
                </div>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#fef2f2', color: '#b91c1c' }}><FaUserTimes /></div>
                    <div className="value">{stats.total - stats.present}</div>
                    <div className="label">CADETS ABSENT</div>
                </div>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#eff6ff', color: '#1e40af' }}><FaChartPie /></div>
                    <div className="value">{getPercentage()}%</div>
                    <div className="label">PRESENCE QUOTA</div>
                </div>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#f8fafc', color: '#64748b' }}><FaUsers /></div>
                    <div className="value">{stats.total}</div>
                    <div className="label">TOTAL SCAN LOAD</div>
                </div>
            </div>

            {/* Attendance Record Grid */}
            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-grid-table">
                        <thead>
                            <tr>
                                <th>TIMELINE LOG</th>
                                <th>SUBJECT ORIGIN</th>
                                <th>SECTOR INFO</th>
                                <th>MONITORING STAFF</th>
                                <th>PRESENCE RATIO</th>
                                <th>OPERATIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.map((record) => {
                                const p = record.records.filter(r => r.status === 'Present').length;
                                const t = record.records.length;
                                return (
                                    <tr key={record._id || record.id}>
                                        <td>
                                            <div style={{ fontWeight: 950, color: 'var(--admin-secondary)' }}>
                                                {new Date(record.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td><span className="admin-badge primary">{record.subject}</span></td>
                                        <td>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 850 }}>
                                                {record.branch} | YEAR {record.year} | SEC {record.section}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 850, color: 'var(--admin-text-muted)' }}>
                                                {record.facultyName || record.facultyId}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{
                                                    width: '40px', height: '4px', background: 'var(--admin-border)', borderRadius: '2px', overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${(p / t) * 100}%`, height: '100%', background: (p / t > 0.75) ? 'var(--admin-success)' : 'var(--admin-warning)'
                                                    }}></div>
                                                </div>
                                                <span style={{ fontWeight: 950, color: (p / t > 0.75) ? 'var(--admin-success)' : 'var(--admin-warning)' }}>{p} / {t}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.65rem' }}>
                                                ANALYZE LOG
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {attendanceData.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '6rem' }}>
                                        <div className="f-empty-text">
                                            {loading ? 'SYNCHRONIZING TELEMETRY...' : 'NO PERSONNEL LOGS DETECTED FOR CURRENT SECTOR.'}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAttendancePanel;
