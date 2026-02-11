import React, { useState } from 'react';
import { apiGet, apiPut } from '../utils/apiClient';
import './StudentAchievements.css';

const FacultyStudentSearch = ({ facultyData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentOverview, setStudentOverview] = useState(null);
    const [studentAchievements, setStudentAchievements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        department: '',
        year: '',
        section: ''
    });

    const handleSearch = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                query: searchQuery,
                ...filters
            });

            const response = await apiGet(`/api/achievements/search/students?${params}`);

            if (response.success) {
                setStudents(response.students || []);
            }
        } catch (error) {
            console.error('Error searching students:', error);
            alert('Failed to search students');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentClick = async (student) => {
        try {
            setSelectedStudent(student);
            setLoading(true);

            // Fetch student's achievements and full overview
            const [achievementRes, overviewRes] = await Promise.all([
                apiGet(`/api/achievements/student/${student._id}`),
                apiGet(`/api/students/${student.sid}/overview`)
            ]);

            if (achievementRes.success) {
                setStudentAchievements(achievementRes.achievements || []);
            }
            if (overviewRes) {
                setStudentOverview(overviewRes);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (achievementId) => {
        try {
            const approverId = facultyData._id || facultyData.facultyId || facultyData.adminId;
            const approverRole = facultyData.role === 'admin' ? 'Admin' : 'Faculty';

            const response = await apiPut(`/api/achievements/${achievementId}/approve`, {
                facultyId: approverId,
                role: approverRole
            });

            if (response.success) {
                alert('Achievement approved successfully!');
                handleStudentClick(selectedStudent);
            }
        } catch (error) {
            console.error('Error approving achievement:', error);
            alert('Failed to approve achievement');
        }
    };

    const handleReject = async (achievementId) => {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;

        try {
            const approverId = facultyData._id || facultyData.facultyId || facultyData.adminId;
            const approverRole = facultyData.role === 'admin' ? 'Admin' : 'Faculty';

            const response = await apiPut(`/api/achievements/${achievementId}/reject`, {
                facultyId: approverId,
                reason,
                role: approverRole
            });

            if (response.success) {
                alert('Achievement rejected');
                // Refresh achievements
                handleStudentClick(selectedStudent);
            }
        } catch (error) {
            console.error('Error rejecting achievement:', error);
            alert('Failed to reject achievement');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Approved': return 'status-approved';
            case 'Rejected': return 'status-rejected';
            default: return '';
        }
    };

    return (
        <div className="student-search-container">
            <h2>🔍 Student Achievement Search</h2>

            {/* Search Bar */}
            <div className="search-bar">
                <div className="search-filters">
                    <input
                        type="text"
                        placeholder="Search by Roll Number or Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />

                    <select
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    >
                        <option value="">All Departments</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="MECH">MECH</option>
                        <option value="CIVIL">CIVIL</option>
                    </select>

                    <select
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    >
                        <option value="">All Years</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>

                    <select
                        value={filters.section}
                        onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                    >
                        <option value="">All Sections</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                    </select>

                    <button onClick={handleSearch} className="btn-search" disabled={loading}>
                        {loading ? 'Searching...' : '🔍 Search'}
                    </button>
                </div>
            </div>

            {/* Student Results */}
            {students.length > 0 && !selectedStudent && (
                <div className="student-results">
                    {students.map((student) => (
                        <div
                            key={student._id}
                            className="student-card"
                            onClick={() => handleStudentClick(student)}
                        >
                            <div className="student-profile-header">
                                <div className="student-avatar">
                                    {student.studentName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="student-info">
                                    <h3>{student.studentName}</h3>
                                    <p>{student.sid}</p>
                                    <p>{student.branch} - Year {student.year} - Section {student.section}</p>
                                </div>
                            </div>
                            {student.achievementCount > 0 && (
                                <div className="achievement-count">
                                    🏆 {student.achievementCount} Achievements
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Student Profile View */}
            {selectedStudent && (
                <div className="student-profile-view">
                    <button onClick={() => setSelectedStudent(null)} className="btn-back">
                        ← Back to Search
                    </button>

                    <div className="profile-header-premium">
                        <div className="profile-avatar-premium">
                            {studentOverview?.student?.profilePic ? (
                                <img
                                    src={studentOverview.student.profilePic.startsWith('data:') || studentOverview.student.profilePic.startsWith('http')
                                        ? studentOverview.student.profilePic
                                        : `http://localhost:5000${studentOverview.student.profilePic.startsWith('/') ? '' : '/'}${studentOverview.student.profilePic}`}
                                    alt="Profile"
                                    className="profile-img-premium"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.studentName}`;
                                    }}
                                />
                            ) : (
                                selectedStudent.studentName?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="profile-details-premium">
                            <h2>{selectedStudent.studentName}</h2>
                            <div className="profile-badges">
                                <span className="profile-badge id">{selectedStudent.sid}</span>
                                <span className="profile-badge year">YEAR {selectedStudent.year} • {selectedStudent.branch}</span>
                                <span className="profile-badge section">SEC {selectedStudent.section}</span>
                            </div>
                            {selectedStudent.email && (
                                <p className="profile-email">
                                    <span style={{ opacity: 0.7 }}>📧</span> {selectedStudent.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="academic-snapshot-container">
                        <div className="snapshot-card">
                            <h3>ACADEMIC SNAPSHOT</h3>
                            <div className="snapshot-grid">
                                <div className="snapshot-item">
                                    <div className="snapshot-value">{studentOverview?.attendance?.overall || 0}%</div>
                                    <div className="snapshot-label">ATTENDANCE</div>
                                </div>
                                <div className="snapshot-item">
                                    <div className="snapshot-value">{studentOverview?.activity?.aiUsage || 0}</div>
                                    <div className="snapshot-label">AI INTERACTIONS</div>
                                </div>
                                <div className="snapshot-item">
                                    <div className="snapshot-value">{studentOverview?.activity?.streak || 0}</div>
                                    <div className="snapshot-label">STUDY STREAK</div>
                                </div>
                                <div className="snapshot-item">
                                    <div className="snapshot-value">{studentOverview?.activity?.tasksDone || 0}</div>
                                    <div className="snapshot-label">TASKS DONE</div>
                                </div>
                            </div>
                        </div>

                        <div className="activity-chart-card">
                            <h3>WEEKLY ACTIVITY (HRS)</h3>
                            <div className="activity-chart-placeholder">
                                <div className="chart-bars">
                                    {(studentOverview?.activity?.weeklyActivity || []).map((day, idx) => (
                                        <div key={idx} className="chart-bar-container">
                                            <div
                                                className="chart-bar"
                                                style={{ height: `${(day.hours / 8) * 100}%` }}
                                                title={`${day.day}: ${day.hours} hrs`}
                                            ></div>
                                            <span className="chart-day">{day.day}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="chart-avg">
                                    AVERAGE: {studentOverview?.activity?.weeklyActivity ?
                                        (studentOverview.activity.weeklyActivity.reduce((acc, curr) => acc + curr.hours, 0) / 7).toFixed(1) : 0.0} hrs/day
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="achievements-section">
                        <h3>🏆 Achievements ({studentAchievements.length})</h3>

                        {studentAchievements.length === 0 ? (
                            <p className="no-data">No achievements submitted yet.</p>
                        ) : (
                            <div className="achievements-showcase-grid">
                                {studentAchievements.map((achievement) => (
                                    <div key={achievement._id} className={`achievement-card-showcase status-${achievement.status.toLowerCase()}`}>
                                        <div className="card-accent-bar"></div>
                                        <div className="achievement-header-showcase">
                                            <div className="header-main">
                                                <h3 className="achievement-title">{achievement.title}</h3>
                                                <div className="achievement-meta-pills">
                                                    <span className="meta-pill category">{achievement.category}</span>
                                                    <span className="meta-pill level">{achievement.level}</span>
                                                    <span className="meta-pill position">{achievement.position}{achievement.rank ? ` • Rank ${achievement.rank}` : ''}</span>
                                                </div>
                                            </div>
                                            <div className={`status-badge-v2 ${achievement.status.toLowerCase()}`}>
                                                {achievement.status.toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="achievement-body-showcase">
                                            <div className="info-row">
                                                <span className="info-label">EVENT</span>
                                                <span className="info-value">{achievement.eventName}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">DATE</span>
                                                <span className="info-value">{formatDate(achievement.achievementDate)}</span>
                                            </div>
                                            {achievement.organizingInstitution && (
                                                <div className="info-row">
                                                    <span className="info-label">ORGANIZER</span>
                                                    <span className="info-value">{achievement.organizingInstitution}</span>
                                                </div>
                                            )}

                                            {achievement.description && (
                                                <div className="achievement-desc-box">
                                                    {achievement.description}
                                                </div>
                                            )}

                                            <div className="achievement-links-row">
                                                {achievement.documents && achievement.documents.map((doc, idx) => (
                                                    <a key={idx} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="showcase-link doc">
                                                        <span>📄</span> {doc.fileType || 'Doc'}
                                                    </a>
                                                ))}
                                                {achievement.resultLink && (
                                                    <a href={achievement.resultLink} target="_blank" rel="noopener noreferrer" className="showcase-link web">
                                                        <span>🔗</span> Result
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {achievement.status === 'Pending' && (
                                            <div className="achievement-action-footer">
                                                <button onClick={() => handleApprove(achievement._id)} className="btn-action-premium approve">
                                                    APPROVE ACHIEVEMENT
                                                </button>
                                                <button onClick={() => handleReject(achievement._id)} className="btn-action-premium reject">
                                                    REJECT
                                                </button>
                                            </div>
                                        )}

                                        {achievement.status === 'Rejected' && achievement.rejectionReason && (
                                            <div className="rejection-reason">
                                                <strong>Rejection Reason:</strong> {achievement.rejectionReason}
                                            </div>
                                        )}

                                        <div className="achievement-footer">
                                            <small>Submitted on {formatDate(achievement.submittedAt)}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyStudentSearch;
