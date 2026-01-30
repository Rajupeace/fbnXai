import React, { useState, useEffect } from 'react';
import { FaUserShield, FaKey, FaSave, FaCamera, FaEnvelope, FaIdCard, FaUniversity, FaLayerGroup, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../../utils/apiClient';

/**
 * STUDENT SETTINGS (Premium)
 * Manage profile details, avatar, and security settings.
 */
const StudentSettings = ({ userData, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        studentName: '',
        email: '',
        sid: '',
        year: 1,
        branch: 'CSE',
        section: 'A',
        profilePic: ''
    });

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (userData) {
            setProfile({
                studentName: userData.studentName || '',
                email: userData.email || '',
                sid: userData.sid || '',
                year: userData.year || 1,
                branch: userData.branch || 'CSE',
                section: userData.section || 'A',
                profilePic: userData.profilePic || ''
            });
        }
    }, [userData]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarSelect = (url) => {
        setProfile(prev => ({ ...prev, profilePic: url }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, profilePic: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const sid = userData?.sid || profile.sid;
            await api.apiPut(`/api/students/profile/${sid}`, profile);

            // Update local storage and parent state
            const currentUser = JSON.parse(localStorage.getItem('userData')) || {};
            const mergedUser = { ...currentUser, ...profile };
            localStorage.setItem('userData', JSON.stringify(mergedUser));

            if (onProfileUpdate) onProfileUpdate(mergedUser);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Profile Save Failed:', error);
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match.");
            return;
        }
        if (passwords.new.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            await api.apiPut(`/api/students/change-password/${profile.sid}`, {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success('Password changed successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Password Change Failed:', error);
            toast.error(error.response?.data?.error || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    // Avatar Seeds
    const avatarSeeds = [
        'Felix', 'Aneka', 'Bob', 'Caitlyn', 'Dieter', 'Evelyn', 'Flo', 'Gunnar', 'Heidi', 'Ivan'
    ];

    return (
        <div className="nexus-page-container fade-in">
            <div className="nexus-page-header">
                <div>
                    <div className="nexus-page-subtitle">
                        <FaUserShield /> Account Control
                    </div>
                    <h1 className="nexus-page-title">
                        SETTINGS & <span>SECURITY</span>
                    </h1>
                </div>
            </div>

            <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Sidebar Navigation */}
                <div className="settings-sidebar" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', height: 'fit-content', border: '1px solid #e2e8f0' }}>
                    <div className="settings-user-preview" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: '100px', height: '100px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', border: '4px solid #f1f5f9' }}>
                            <img
                                src={profile.profilePic || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.studentName}`}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <h3 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>{profile.studentName}</h3>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{profile.sid}</span>
                    </div>

                    <div className="settings-nav">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`s-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            style={{
                                width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem',
                                border: 'none', background: activeTab === 'profile' ? '#eff6ff' : 'transparent',
                                color: activeTab === 'profile' ? '#2563eb' : '#64748b', borderRadius: '12px',
                                marginBottom: '0.5rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                            }}
                        >
                            <FaUserShield /> Profile Details
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`s-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
                            style={{
                                width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem',
                                border: 'none', background: activeTab === 'security' ? '#eff6ff' : 'transparent',
                                color: activeTab === 'security' ? '#2563eb' : '#64748b', borderRadius: '12px',
                                cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                            }}
                        >
                            <FaKey /> Security & Login
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="settings-content" style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', minHeight: '600px' }}>
                    <AnimatePresence mode='wait'>
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FaUserShield className="text-primary" /> Edit Profile
                                </h2>

                                <div className="form-section" style={{ marginBottom: '2.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '1rem' }}>Profile Avatar</label>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                        {avatarSeeds.map(seed => {
                                            const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                                            return (
                                                <div
                                                    key={seed}
                                                    onClick={() => handleAvatarSelect(url)}
                                                    style={{
                                                        width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer',
                                                        border: profile.profilePic === url ? '3px solid #3b82f6' : '3px solid transparent',
                                                        padding: '2px', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <img src={url} alt={seed} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                                </div>
                                            );
                                        })}
                                        <label style={{
                                            width: '50px', height: '50px', borderRadius: '50%', background: '#f1f5f9', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b'
                                        }}>
                                            <FaCamera />
                                            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                </div>

                                <form onSubmit={saveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Full Name</label>
                                        <input
                                            type="text"
                                            name="studentName"
                                            value={profile.studentName}
                                            onChange={handleProfileChange}
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}><FaIdCard /> Student ID</label>
                                        <input
                                            type="text"
                                            name="sid"
                                            value={profile.sid}
                                            readOnly
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#e2e8f0', color: '#64748b', cursor: 'not-allowed' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}><FaEnvelope /> Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleProfileChange}
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}><FaUniversity /> Branch</label>
                                        <select
                                            name="branch"
                                            value={profile.branch}
                                            onChange={handleProfileChange}
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc' }}
                                        >
                                            <option value="CSE">CSE</option>
                                            <option value="IT">IT</option>
                                            <option value="ECE">ECE</option>
                                            <option value="EEE">EEE</option>
                                            <option value="MECH">MECH</option>
                                            <option value="CIVIL">CIVIL</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}><FaLayerGroup /> Year</label>
                                        <select
                                            name="year"
                                            value={profile.year}
                                            onChange={handleProfileChange}
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc' }}
                                        >
                                            <option value="1">Year 1</option>
                                            <option value="2">Year 2</option>
                                            <option value="3">Year 3</option>
                                            <option value="4">Year 4</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}><FaLayerGroup /> Section</label>
                                        <select
                                            name="section"
                                            value={profile.section}
                                            onChange={handleProfileChange}
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc' }}
                                        >
                                            <option value="A">Section A</option>
                                            <option value="B">Section B</option>
                                            <option value="C">Section C</option>
                                            <option value="D">Section D</option>
                                        </select>
                                    </div>

                                    <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{
                                                padding: '1rem 2rem', borderRadius: '12px', background: '#1e293b', color: 'white',
                                                border: 'none', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto'
                                            }}
                                        >
                                            {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FaKey className="text-warning" /> Password & Security
                                </h2>

                                <div className="security-alert" style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaExclamationCircle /> Security Notice</h4>
                                    <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem' }}>
                                        To ensure your account remains secure, use a strong password with at least 8 characters, including numbers and symbols.
                                    </p>
                                </div>

                                <form onSubmit={changePassword} style={{ maxWidth: '500px' }}>
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Current Password</label>
                                        <input
                                            type="password"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            required
                                            minLength={6}
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc' }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            padding: '1rem 2rem', borderRadius: '12px', background: '#1e293b', color: 'white',
                                            border: 'none', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        {loading ? 'Processing...' : <><FaCheckCircle /> Update Password</>}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default StudentSettings;
