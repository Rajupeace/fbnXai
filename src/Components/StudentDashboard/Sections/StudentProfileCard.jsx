import React from 'react';
import { FaUserCircle, FaIdBadge, FaUniversity, FaLayerGroup, FaShieldAlt } from 'react-icons/fa';

/**
 * PREMIUM NEXUS PROFILE CARD
 * A stunning, glassmorphism card for student identity.
 */
const StudentProfileCard = ({ userData, setShowProfilePhotoModal, setView }) => {
    return (
        <div className="profile-card">
            {/* Background Accent */}
            <div className="profile-accent-bg"></div>

            <div className="profile-avatar-container" onClick={() => setView('settings')}>
                <div className="profile-avatar">
                    {userData.profilePic ? (
                        <img src={userData.profilePic} alt="Identity" />
                    ) : userData.avatar ? (
                        <img src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${userData.avatar}`} alt="Avatar" />
                    ) : (
                        <div className="profile-avatar-fallback">
                            <FaUserCircle />
                        </div>
                    )}
                </div>
                <div className="profile-avatar-shield">
                    <FaShieldAlt />
                </div>
            </div>

            <div className="profile-info">
                <h3>{userData.studentName}</h3>
                <div className="profile-id">
                    <FaIdBadge /> {userData.sid.toUpperCase()}
                </div>
            </div>

            <div className="profile-info-grid">
                <div className="nexus-info-pill">
                    <span className="pill-label">BRANCH</span>
                    <span className="pill-value">{userData.branch || 'CSE'}</span>
                    <FaUniversity className="pill-icon" />
                </div>
                <div className="nexus-info-pill">
                    <span className="pill-label">LEVEL</span>
                    <span className="pill-value">YEAR {userData.year}</span>
                    <FaLayerGroup className="pill-icon" />
                </div>
            </div>

            <button
                className="nexus-btn-vibrant profile-action-btn"
                onClick={() => setView('settings')}
            >
                VIEW FULL PROFILE
            </button>
        </div>
    );
};

export default StudentProfileCard;
