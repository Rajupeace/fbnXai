import React, { useState, useEffect } from 'react';
import { FaLock, FaUser, FaEnvelope, FaIdCard, FaBuilding, FaShieldAlt, FaSave, FaCheck, FaChalkboardTeacher, FaPlus, FaTrash } from 'react-icons/fa';
import { apiPut } from '../../utils/apiClient';
import './FacultyDashboard.css';

/**
 * FACULTY SETTINGS
 * Manage profile details, security settings, and teaching assignments.
 */
const FacultySettings = ({ facultyData, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        facultyId: '',
        department: 'CSE',
        designation: 'Faculty',
        phone: '',
        assignments: [] // [{ year, section, branch, subject }]
    });

    // Password State
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    // New Assignment State
    const [newAssign, setNewAssign] = useState({
        year: '1',
        section: 'A',
        branch: 'CSE',
        subject: ''
    });

    useEffect(() => {
        if (facultyData) {
            setProfile({
                name: facultyData.name || '',
                email: facultyData.email || '',
                facultyId: facultyData.facultyId || '',
                department: facultyData.department || 'CSE',
                designation: facultyData.designation || 'Faculty',
                phone: facultyData.phone || '',
                assignments: facultyData.assignments || []
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

    const addAssignment = (e) => {
        e.preventDefault();
        if (!newAssign.subject) return showMessage("Please enter a subject name", "error");

        const updatedAssignments = [...profile.assignments, newAssign];
        setProfile({ ...profile, assignments: updatedAssignments });
        setNewAssign({ ...newAssign, subject: '' }); // Reset subject only
    };

    const removeAssignment = (index) => {
        const updatedAssignments = profile.assignments.filter((_, i) => i !== index);
        setProfile({ ...profile, assignments: updatedAssignments });
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
                        <FaUser /> PROFILE
                    </button>
                    <button className={`nexus-pill ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
                        <FaChalkboardTeacher /> TEACHING
                    </button>
                    <button className={`nexus-pill ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
                        <FaShieldAlt /> SECURITY
                    </button>
                </div>

                <div className="f-settings-tab-content">
                    {activeTab === 'profile' && (
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
                    )}

                    {activeTab === 'assignments' && (
                        <div className="animate-fade-in">
                            <div className="f-assignments-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {/* Add New Assignment Form */}
                                <div className="f-add-assignment">
                                    <h3>Add New Class</h3>
                                    <div className="f-input-node">
                                        <label>Year</label>
                                        <select className="f-input-field" value={newAssign.year} onChange={e => setNewAssign({ ...newAssign, year: e.target.value })}>
                                            <option value="1">Year 1</option>
                                            <option value="2">Year 2</option>
                                            <option value="3">Year 3</option>
                                            <option value="4">Year 4</option>
                                        </select>
                                    </div>
                                    <div className="f-input-node">
                                        <label>Branch</label>
                                        <select className="f-input-field" value={newAssign.branch} onChange={e => setNewAssign({ ...newAssign, branch: e.target.value })}>
                                            <option value="CSE">CSE</option>
                                            <option value="IT">IT</option>
                                            <option value="ECE\">ECE</option>
                                            <option value="EEE">EEE</option>
                                        </select>
                                    </div>
                                    <div className="f-input-node">
                                        <label>Section</label>
                                        <select className="f-input-field" value={newAssign.section} onChange={e => setNewAssign({ ...newAssign, section: e.target.value })}>
                                            {['A', 'B', 'C', 'D', 'E', 'F'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="f-input-node">
                                        <label>Subject Name</label>
                                        <input className="f-input-field" value={newAssign.subject} onChange={e => setNewAssign({ ...newAssign, subject: e.target.value })} placeholder="e.g. Data Structures" />
                                    </div>
                                    <button className="nexus-btn-primary" onClick={addAssignment} style={{ marginTop: '1rem' }}><FaPlus /> Add Class</button>
                                </div>

                                {/* List Existing Assignments */}
                                <div className="f-current-assignments">
                                    <h3>Current Teaching Load</h3>
                                    <div className="f-assign-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '400px', overflowY: 'auto' }}>
                                        {profile.assignments.length === 0 && <p className="sub-text-slate">No classes assigned.</p>}
                                        {profile.assignments.map((assign, i) => (
                                            <div key={i} className="f-assign-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{assign.subject}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{assign.branch} • Year {assign.year} • Sec {assign.section}</div>
                                                </div>
                                                <button onClick={() => removeAssignment(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                        <button className="nexus-btn-primary" onClick={saveProfile} disabled={loading}>
                                            {loading ? 'SAVING...' : <><FaSave /> SAVE ALL CHANGES</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'password' && (
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
