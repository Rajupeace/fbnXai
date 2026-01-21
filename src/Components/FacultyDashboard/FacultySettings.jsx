import React, { useState } from 'react';
import { FaLock, FaUser, FaEnvelope, FaIdCard, FaBuilding, FaShieldAlt } from 'react-icons/fa';
import './FacultyDashboard.css';

/**
 * FACULTY SETTINGS MESH
 * High-security interface for identity management and protocol configuration.
 * Theme: Luxe Pearl / Nexus
 */
const FacultySettings = ({ facultyData }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({
        name: facultyData.name || '',
        email: facultyData.email || '',
        facultyId: facultyData.facultyId || '',
        department: facultyData.department || 'CSE',
        designation: facultyData.designation || 'Faculty'
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePassChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        alert("Nexus Feedback: Identity profile synchronized.");
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("Security Alert: Credential mismatch.");
            return;
        }
        alert("Nexus Feedback: Security credentials rotated successfully.");
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="animate-fade-in">
            <header className="f-settings-header animate-slide-up">
                <div>
                    <h2 className="f-settings-title">ACCOUNT <span>PROTOCOLS</span></h2>
                    <p className="f-settings-subtitle">Configure faculty identity and security mesh parameters</p>
                </div>
                <div className="f-sync-badge">
                    ENCRYPTION: AES-256 • ACTIVE
                </div>
            </header>

            <div className="f-settings-node animate-slide-up f-settings-node-card">
                <div className="nexus-glass-pills f-settings-pills-wrap">
                    <button className={`nexus-pill ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                        <FaUser /> FACULTY IDENTITY
                    </button>
                    <button className={`nexus-pill ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
                        <FaShieldAlt /> SECURITY MESH
                    </button>
                </div>

                <div className="f-settings-tab-content">
                    {activeTab === 'profile' ? (
                        <form onSubmit={saveProfile} className="animate-fade-in">
                            <div className="nexus-form-grid f-profile-grid">
                                <div className="f-input-node">
                                    <label><FaUser /> FULL NAME</label>
                                    <input className="f-input-field" name="name" value={profile.name} onChange={handleProfileChange} />
                                </div>
                                <div className="f-input-node">
                                    <label><FaIdCard /> FACULTY IDENTIFIER</label>
                                    <input className="f-input-field" name="facultyId" value={profile.facultyId} disabled />
                                </div>
                                <div className="f-input-node">
                                    <label><FaEnvelope /> SYSTEM EMAIL</label>
                                    <input className="f-input-field" name="email" value={profile.email} onChange={handleProfileChange} />
                                </div>
                                <div className="f-input-node">
                                    <label><FaBuilding /> DEPARTMENT SECTOR</label>
                                    <input className="f-input-field" name="department" value={profile.department} disabled />
                                </div>
                            </div>
                            <div className="f-settings-form-actions">
                                <button type="submit" className="nexus-btn-primary f-profile-submit-btn">
                                    COMMIT PROFILE UPDATES
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={changePassword} className="f-security-wrap animate-fade-in">
                            <div className="f-input-node">
                                <label><FaLock /> CURRENT KEY</label>
                                <input type="password" name="current" className="f-input-field" value={passwords.current} onChange={handlePassChange} placeholder="••••••••" />
                            </div>
                            <div className="f-input-node">
                                <label><FaShieldAlt /> NEW SECURITY KEY</label>
                                <input type="password" name="new" className="f-input-field" value={passwords.new} onChange={handlePassChange} placeholder="Enter robust credential" />
                            </div>
                            <div className="f-input-node">
                                <label><FaShieldAlt /> CONFIRM NEW KEY</label>
                                <input type="password" name="confirm" className="f-input-field" value={passwords.confirm} onChange={handlePassChange} placeholder="Confirm robust credential" />
                            </div>
                            <button type="submit" className="nexus-btn-primary f-settings-btn-full">
                                ROTATE SECURITY CREDENTIALS
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultySettings;
