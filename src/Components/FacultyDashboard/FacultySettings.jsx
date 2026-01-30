import React, { useState, useEffect } from 'react';
import { FaLock, FaUser, FaEnvelope, FaIdCard, FaBuilding, FaShieldAlt, FaSave, FaCheck } from 'react-icons/fa';
import { apiPut } from '../../utils/apiClient';
import './FacultyDashboard.css';

/**
 * FACULTY SETTINGS
 * Manage profile details and security settings.
 */
const FacultySettings = ({ facultyData, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        facultyId: '',
        department: 'CSE',
        designation: 'Faculty',
        phone: ''
    });

    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (facultyData) {
            setProfile({
                name: facultyData.name || '',
                email: facultyData.email || '',
                facultyId: facultyData.facultyId || '',
                department: facultyData.department || 'CSE',
                designation: facultyData.designation || 'Faculty',
                phone: facultyData.phone || ''
            });
        }
    }, [facultyData]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePassChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update profile using facultyId
            const response = await apiPut(`/api/faculty/${profile.facultyId}`, profile);
            if (response) {
                if (onProfileUpdate) onProfileUpdate(response);
                showMessage("Profile updated successfully!");
            }
        } catch (error) {
            console.error('Update failed:', error);
            showMessage("Failed to update profile.", "error");
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            showMessage("New passwords do not match.", "error");
            return;
        }
        if (passwords.new.length < 6) {
            showMessage("Password must be at least 6 characters.", "error");
            return;
        }

        setLoading(true);
        try {
            await apiPut(`/api/faculty/${profile.facultyId}`, { password: passwords.new });
            showMessage("Password changed successfully!", "success");
            setPasswords({ new: '', confirm: '' });
        } catch (error) {
            showMessage("Failed to update password.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <header className="f-settings-header animate-slide-up">
                <div>
                    <h2 className="f-settings-title">ACCOUNT <span>SETTINGS</span></h2>
                    <p className="f-settings-subtitle">Manage your faculty profile and credentials</p>
                </div>
                {message.text && (
                    <div className={`f-sync-badge ${message.type === 'error' ? 'error' : ''}`} style={{ background: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#dc2626' : '#166534', border: 'none' }}>
                        {message.text}
                    </div>
                )}
            </header>

            <div className="f-settings-node animate-slide-up f-settings-node-card">
                <div className="nexus-glass-pills f-settings-pills-wrap">
                    <button className={`nexus-pill ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                        <FaUser /> PROFILE DETAILS
                    </button>
                    <button className={`nexus-pill ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
                        <FaShieldAlt /> SECURITY
                    </button>
                </div>

                <div className="f-settings-tab-content">
                    {activeTab === 'profile' ? (
                        <form onSubmit={saveProfile} className="animate-fade-in">
                            <div className="nexus-form-grid f-profile-grid">
                                <div className="f-input-node">
                                    <label><FaUser /> FULL NAME</label>
                                    <input className="f-input-field" name="name" value={profile.name} onChange={handleProfileChange} disabled={loading} />
                                </div>
                                <div className="f-input-node">
                                    <label><FaIdCard /> FACULTY IDENTIFIER</label>
                                    <input className="f-input-field" name="facultyId" value={profile.facultyId} disabled />
                                </div>
                                <div className="f-input-node">
                                    <label><FaEnvelope /> EMAIL ADDRESS</label>
                                    <input className="f-input-field" name="email" value={profile.email} onChange={handleProfileChange} disabled={loading} />
                                </div>
                                <div className="f-input-node">
                                    <label><FaBuilding /> DEPARTMENT</label>
                                    <input className="f-input-field" name="department" value={profile.department} onChange={handleProfileChange} disabled={loading} />
                                </div>
                                <div className="f-input-node">
                                    <label><FaShieldAlt /> DESIGNATION</label>
                                    <input className="f-input-field" name="designation" value={profile.designation} onChange={handleProfileChange} disabled={loading} />
                                </div>
                            </div>
                            <div className="f-settings-form-actions">
                                <button type="submit" className="nexus-btn-primary f-profile-submit-btn" disabled={loading}>
                                    {loading ? 'SAVING...' : <><FaSave /> SAVE CHANGES</>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={changePassword} className="f-security-wrap animate-fade-in">
                            <div className="f-input-node">
                                <label><FaLock /> NEW PASSWORD</label>
                                <input type="password" name="new" className="f-input-field" value={passwords.new} onChange={handlePassChange} placeholder="Enter new password" disabled={loading} />
                            </div>
                            <div className="f-input-node">
                                <label><FaCheck /> CONFIRM PASSWORD</label>
                                <input type="password" name="confirm" className="f-input-field" value={passwords.confirm} onChange={handlePassChange} placeholder="Confirm new password" disabled={loading} />
                            </div>
                            <button type="submit" className="nexus-btn-primary f-settings-btn-full" disabled={loading}>
                                {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultySettings;
