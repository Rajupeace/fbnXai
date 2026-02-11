import React, { useState, useEffect } from 'react';
import { apiGet } from '../utils/apiClient';
import './StudentAchievements.css';

const StudentAchievementsList = ({ studentId }) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

    useEffect(() => {
        fetchAchievements();
    }, [studentId, filter]);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const statusParam = filter !== 'all' ? `?status=${filter.charAt(0).toUpperCase() + filter.slice(1)}` : '';
            const response = await apiGet(`/api/achievements/student/${studentId}${statusParam}`);

            if (response.success) {
                setAchievements(response.achievements || []);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Approved': return 'status-approved';
            case 'Rejected': return 'status-rejected';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading">Loading achievements...</div>;
    }

    return (
        <div className="achievements-list-container">
            <div className="achievements-header">
                <h2>🏆 My Achievements</h2>
                <div className="filter-buttons">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All ({achievements.length})
                    </button>
                    <button
                        className={filter === 'pending' ? 'active' : ''}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={filter === 'approved' ? 'active' : ''}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={filter === 'rejected' ? 'active' : ''}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {achievements.length === 0 ? (
                <div className="no-achievements">
                    <p>📭 No achievements found. Submit your first achievement!</p>
                </div>
            ) : (
                <div className="achievements-grid">
                    {achievements.map((achievement) => (
                        <div key={achievement._id} className="achievement-card">
                            <div className="achievement-header">
                                <div>
                                    <h3 className="achievement-title">{achievement.title}</h3>
                                    <div className="achievement-meta">
                                        <span className="meta-badge badge-category">
                                            {achievement.category}
                                        </span>
                                        <span className="meta-badge badge-level">
                                            {achievement.level}
                                        </span>
                                        <span className="meta-badge badge-position">
                                            {achievement.position}
                                            {achievement.rank && ` - Rank ${achievement.rank}`}
                                        </span>
                                    </div>
                                </div>
                                <span className={`status-badge ${getStatusBadgeClass(achievement.status)}`}>
                                    {achievement.status}
                                </span>
                            </div>

                            <div className="achievement-details">
                                <p><strong>Event:</strong> {achievement.eventName}</p>
                                {achievement.organizingInstitution && (
                                    <p><strong>Organizer:</strong> {achievement.organizingInstitution}</p>
                                )}
                                <p><strong>Date:</strong> {formatDate(achievement.achievementDate)}</p>
                                <p><strong>Type:</strong> {achievement.achievementType}</p>
                                {achievement.eventLocation && (
                                    <p><strong>Location:</strong> {achievement.eventLocation} ({achievement.eventMode})</p>
                                )}
                            </div>

                            {achievement.description && (
                                <div className="achievement-description">
                                    <p>{achievement.description}</p>
                                </div>
                            )}

                            {achievement.documents && achievement.documents.length > 0 && (
                                <div className="achievement-documents">
                                    <strong>Documents:</strong>
                                    {achievement.documents.map((doc, index) => (
                                        <a
                                            key={index}
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="doc-link"
                                        >
                                            📄 {doc.fileType || 'Document'}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {achievement.resultLink && (
                                <div className="achievement-link">
                                    <a href={achievement.resultLink} target="_blank" rel="noopener noreferrer">
                                        🔗 View Official Result
                                    </a>
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
    );
};

export default StudentAchievementsList;
