import React, { useState } from 'react';
import { FaLock, FaUser, FaEnvelope, FaIdCard, FaBuilding } from 'react-icons/fa';
import './FacultyDashboard.css'; // Reuse faculty styles

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
        // In a real app, call API to update profile
        alert("Profile update simulation: Saved!");
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("New passwords do not match");
            return;
        }
        // Call API to change password
        // For now, mock it or use a placeholder endpoint
        alert("Password change simulation: Success!");
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="settings-container animate-fade-in" style={{ padding: '0', maxWidth: '1200px', margin: '0 0 4rem 0' }}>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-1px' }}>Account Protocols</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Global configuration for your faculty identity and security mesh.</p>
                </div>
                <div style={{ padding: '0.8rem 1.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>
                    LAST SYNC: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--pearl-border)', background: 'white' }}>
                <div className="settings-tabs" style={{ display: 'flex', background: '#f8fafc', padding: '0.8rem', gap: '0.8rem' }}>
                    <button
                        className={`tab-pill ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                        style={{
                            flex: 1,
                            padding: '1.2rem',
                            border: 'none',
                            borderRadius: '16px',
                            background: activeTab === 'profile' ? 'white' : 'transparent',
                            color: activeTab === 'profile' ? 'var(--accent-primary)' : 'var(--text-muted)',
                            boxShadow: activeTab === 'profile' ? '0 4px 15px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: activeTab === 'profile' ? '1px solid var(--pearl-border)' : '1px solid transparent'
                        }}
                    >
                        <div className="icon-box" style={{ background: activeTab === 'profile' ? 'var(--accent-primary)' : 'white', color: activeTab === 'profile' ? 'white' : 'var(--text-muted)' }}>
                            <FaUser />
                        </div>
                        <span style={{ fontSize: '1rem' }}>Faculty Identity</span>
                    </button>
                    <button
                        className={`tab-pill ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                        style={{
                            flex: 1,
                            padding: '1.2rem',
                            border: 'none',
                            borderRadius: '16px',
                            background: activeTab === 'password' ? 'white' : 'transparent',
                            color: activeTab === 'password' ? 'var(--accent-secondary)' : 'var(--text-muted)',
                            boxShadow: activeTab === 'password' ? '0 4px 15px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: activeTab === 'password' ? '1px solid var(--pearl-border)' : '1px solid transparent'
                        }}
                    >
                        <div className="icon-box" style={{ background: activeTab === 'password' ? 'var(--accent-secondary)' : 'white', color: activeTab === 'password' ? 'white' : 'var(--text-muted)' }}>
                            <FaLock />
                        </div>
                        <span style={{ fontSize: '1rem' }}>Security Protocols</span>
                    </button>
                </div>

                <div style={{ padding: '4rem', background: 'white' }}>
                    {activeTab === 'profile' ? (
                        <form onSubmit={saveProfile}>
                            <div className="inputs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
                                <div className="form-group">
                                    <label className="input-label" style={{ color: 'var(--accent-primary)', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <FaUser /> FULL NAME
                                    </label>
                                    <input className="cyber-input" name="name" value={profile.name} onChange={handleProfileChange} placeholder="Enter your full name" style={{ background: '#f8fafc', fontSize: '1.1rem' }} />
                                </div>
                                <div className="form-group">
                                    <label className="input-label" style={{ color: 'var(--accent-secondary)', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <FaIdCard /> FACULTY IDENTIFIER
                                    </label>
                                    <input className="cyber-input" name="facultyId" value={profile.facultyId} disabled style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: '1.1rem', cursor: 'not-allowed' }} />
                                </div>
                                <div className="form-group">
                                    <label className="input-label" style={{ color: '#10b981', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <FaEnvelope /> SYSTEM EMAIL
                                    </label>
                                    <input className="cyber-input" name="email" value={profile.email} onChange={handleProfileChange} placeholder="email@example.com" style={{ background: '#f8fafc', fontSize: '1.1rem' }} />
                                </div>
                                <div className="form-group">
                                    <label className="input-label" style={{ color: '#f59e0b', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <FaBuilding /> DEPARTMENT BRANCH
                                    </label>
                                    <input className="cyber-input" name="department" value={profile.department} disabled style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: '1.1rem', cursor: 'not-allowed' }} />
                                </div>
                            </div>
                            <div style={{ marginTop: '4rem', borderTop: '1px solid var(--pearl-border)', paddingTop: '2.5rem', textAlign: 'right' }}>
                                <button type="submit" className="cyber-btn primary" style={{ padding: '1.2rem 3rem', marginLeft: 'auto' }}>Save Faculty Profile</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={changePassword} style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="input-label" style={{ color: 'var(--text-main)', fontWeight: 800, marginBottom: '0.8rem', display: 'block' }}>Current Password</label>
                                <input
                                    type="password"
                                    className="cyber-input"
                                    name="current"
                                    value={passwords.current}
                                    onChange={handlePassChange}
                                    placeholder="••••••••"
                                    style={{ background: '#f8fafc' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="input-label" style={{ color: 'var(--accent-primary)', fontWeight: 800, marginBottom: '0.8rem', display: 'block' }}>New Password</label>
                                <input
                                    type="password"
                                    className="cyber-input"
                                    name="new"
                                    value={passwords.new}
                                    onChange={handlePassChange}
                                    placeholder="Create a strong password"
                                    style={{ background: '#f8fafc' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '3rem' }}>
                                <label className="input-label" style={{ color: 'var(--accent-secondary)', fontWeight: 800, marginBottom: '0.8rem', display: 'block' }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    className="cyber-input"
                                    name="confirm"
                                    value={passwords.confirm}
                                    onChange={handlePassChange}
                                    placeholder="Repeat new password"
                                    style={{ background: '#f8fafc' }}
                                />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <button type="submit" className="cyber-btn primary" style={{ width: '100%', justifyContent: 'center', padding: '1.2rem' }}>
                                    Sync New Credentials
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultySettings;
