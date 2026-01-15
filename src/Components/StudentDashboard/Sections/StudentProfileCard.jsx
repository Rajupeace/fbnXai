import React from 'react';

const StudentProfileCard = ({ userData, setShowProfilePhotoModal }) => {
    return (
        <div className="glass-panel profile-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="profile-avatar-container" style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1.5rem' }}>
                <div className="profile-avatar" onClick={() => setShowProfilePhotoModal(true)} style={{
                    width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                    border: '4px solid white', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)',
                    cursor: 'pointer'
                }}>
                    {userData.profilePic ? (
                        <img src={userData.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : userData.avatar ? (
                        <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${userData.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            {(userData.studentName || 'SD').substring(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <div style={{
                    position: 'absolute', bottom: '0', right: '0', background: '#10b981',
                    width: '24px', height: '24px', borderRadius: '50%', border: '3px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px'
                }}>
                    ✓
                </div>
            </div>

            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#1e293b' }}>{userData.studentName}</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>Student ID: {userData.sid}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
                <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Branch</div>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{userData.branch || 'None'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Year/Sec</div>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{userData.year} - {userData.section}</div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileCard;
