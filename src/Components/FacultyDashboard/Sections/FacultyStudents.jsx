import React, { useState } from 'react';
import { FaUserGraduate, FaSearch, FaGraduationCap, FaCodeBranch, FaLayerGroup, FaRobot, FaEye, FaTrophy, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaBuilding, FaFileAlt, FaLink, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPut } from '../../../utils/apiClient';
import '../FacultyDashboard.css';
import '../../StudentAchievements.css'; // Ensure CSS is available

const FacultyStudents = ({ studentsList, openAiWithPrompt }) => {
    // Safety check
    studentsList = studentsList || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('All');

    // Detailed View State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentAchievements, setStudentAchievements] = useState([]);
    const [studentOverview, setStudentOverview] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const filteredStudents = studentsList.filter(student => {
        const matchesSearch = (student.studentName || student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.sid || student.id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = filterYear === 'All' || String(student.year) === String(filterYear);
        return matchesSearch && matchesYear;
    });

    const years = ['All', ...new Set(studentsList.map(s => s.year).filter(Boolean))].sort();

    // Fetch Details
    const handleStudentClick = async (student) => {
        try {
            setSelectedStudent(student);
            setLoadingDetails(true);

            // Map student ID correctly (handle .sid or .id or ._id)
            const studentId = student.sid || student.id;
            const mongoId = student._id;

            // Fetch student's achievements and full overview
            // Note: Adjust API endpoints if necessary. Assuming these exist from FacultyStudentSearch.
            const [achievementRes, overviewRes] = await Promise.all([
                apiGet(`/api/achievements/student/${mongoId}`),
                apiGet(`/api/students/${studentId}/overview`)
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
            setLoadingDetails(false);
        }
    };

    const handleCloseProfile = () => {
        setSelectedStudent(null);
        setStudentAchievements([]);
        setStudentOverview(null);
    };

    // Achievement Actions
    const handleApprove = async (achievementId) => {
        try {
            // We need faculty info. Assuming it's handled by backend using token or we pass it? 
            // In FacultyStudentSearch it used facultyData prop. 
            // Here we assume backend knows from token or generic 'Faculty' role.
            const response = await apiPut(`/api/achievements/${achievementId}/approve`, {
                role: 'Faculty'
            });

            if (response.success) {
                alert('Achievement approved successfully!');
                handleStudentClick(selectedStudent); // Refresh
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
            const response = await apiPut(`/api/achievements/${achievementId}/reject`, {
                reason,
                role: 'Faculty'
            });

            if (response.success) {
                alert('Achievement rejected');
                handleStudentClick(selectedStudent); // Refresh
            }
        } catch (error) {
            console.error('Error rejecting achievement:', error);
            alert('Failed to reject achievement');
        }
    };

    // Helper to get image URL
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        const backendUrl = 'http://localhost:5000';
        return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Render Detailed Profile
    if (selectedStudent) {
        // Use overview data if available, fallback to selectedStudent
        const displayStudent = studentOverview?.student || selectedStudent;
        const profilePicUrl = getImageUrl(displayStudent.profileImage || displayStudent.profilePic || displayStudent.avatar);

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="animate-fade-in"
                style={{ padding: '0', background: '#f8fafc', minHeight: '100%', borderRadius: '20px' }}
            >
                <div style={{ padding: '1rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                    <button
                        onClick={handleCloseProfile}
                        style={{
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            padding: '0.6rem 1.2rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; }}
                    >
                        <FaArrowLeft /> Back to Students
                    </button>
                    <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Student 360° Profile
                    </h3>
                </div>

                <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Profile Header */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="profile-header-premium"
                        style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}
                    >
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '30px',
                            background: profilePicUrl ? 'none' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '3rem', fontWeight: 'bold',
                            boxShadow: '0 15px 30px -10px rgba(79, 70, 229, 0.5)',
                            flexShrink: 0, overflow: 'hidden', border: '4px solid white'
                        }}>
                            {profilePicUrl ? (
                                <img
                                    src={profilePicUrl}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = displayStudent.studentName?.charAt(0).toUpperCase(); }}
                                />
                            ) : (
                                displayStudent.studentName?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>{displayStudent.studentName}</h2>
                                <span style={{ background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>
                                    {displayStudent.sid || displayStudent.id}
                                </span>
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>{displayStudent.email}</p>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <div className="f-meta-pill" style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <FaGraduationCap /> YEAR {displayStudent.year}
                                </div>
                                <div className="f-meta-pill" style={{ background: '#dcfce7', color: '#166534', padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <FaLayerGroup /> SEC {displayStudent.section}
                                </div>
                                <div className="f-meta-pill" style={{ background: '#ffedd5', color: '#9a3412', padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <FaCodeBranch /> {displayStudent.branch}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Achievements Section */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                                <FaTrophy style={{ color: '#f59e0b' }} />
                                Achievements ({studentAchievements.length})
                            </h3>
                        </div>

                        {loadingDetails ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading academic data...</div>
                        ) : studentAchievements.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                                <FaTrophy size={40} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                                <p style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>No achievements recorded yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                {studentAchievements.map(ach => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={ach._id}
                                        style={{
                                            background: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            gap: '1.5rem',
                                            alignItems: 'flex-start',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{
                                            width: '6px', position: 'absolute', left: 0, top: 0, bottom: 0,
                                            background: ach.status === 'Approved' ? '#10b981' : ach.status === 'Rejected' ? '#ef4444' : '#f59e0b'
                                        }}></div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{ach.title}</h4>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                                                    background: ach.status === 'Approved' ? '#dcfce7' : ach.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                                                    color: ach.status === 'Approved' ? '#166534' : ach.status === 'Rejected' ? '#991b1b' : '#92400e'
                                                }}>
                                                    {ach.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                                {ach.eventName || 'N/A'} {ach.level && `• ${ach.level}`} {ach.position && `• ${ach.position}`} {ach.rank && `• Rank ${ach.rank}`}
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <FaLayerGroup /> {ach.category}
                                                </span>
                                                <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <FaCalendarAlt /> {formatDate(ach.achievementDate)}
                                                </span>
                                                <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <FaBuilding /> {ach.organizingInstitution || 'N/A'}
                                                </span>
                                                {ach.eventLocation && (
                                                    <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        📍 {ach.eventLocation}
                                                    </span>
                                                )}
                                                {ach.eventMode && (
                                                    <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        📶 {ach.eventMode}
                                                    </span>
                                                )}
                                            </div>

                                            {ach.description && (
                                                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                                    {ach.description}
                                                </p>
                                            )}

                                            {ach.resultLink && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <a href={ach.resultLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                                        <FaLink /> View Result/Certificate Link
                                                    </a>
                                                </div>
                                            )}

                                            {ach.documents && ach.documents.length > 0 && (
                                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    {ach.documents.map((doc, idx) => (
                                                        <a key={idx} href={getImageUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer"
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                                                            <FaFileAlt /> {doc.fileName || `Evidence ${idx + 1}`}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {ach.status === 'Pending' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <button onClick={() => handleApprove(ach._id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaCheckCircle /> Approve
                                                </button>
                                                <button onClick={() => handleReject(ach._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaTimesCircle /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="nexus-mesh-bg"></div>

            {/* Header */}
            <header className="f-view-header">
                <div>
                    <h2>STUDENT <span>ROSTER</span></h2>
                    <p className="nexus-subtitle">Complete registry of students • Achievements • Evaluation</p>
                </div>
                <div className="f-node-actions">
                    <span className="f-meta-badge unit" style={{ fontSize: '0.9rem', padding: '0.6rem 1rem' }}>
                        {studentsList.length} TOTAL STUDENTS
                    </span>
                </div>
            </header>

            {/* Controls */}
            <div className="f-flex-gap f-spacer-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="f-search-bar" style={{ position: 'relative', width: '350px' }}>
                    <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search student name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="f-form-select" // Re-using select style for consistent padding/radius
                        style={{ paddingLeft: '3.2rem', marginBottom: 0 }}
                    />
                </div>

                <div className="nexus-glass-pills" style={{ marginBottom: 0 }}>
                    {years.map(y => (
                        <button
                            key={y}
                            onClick={() => setFilterYear(y)}
                            className={`nexus-pill ${filterYear === String(y) ? 'active' : ''}`}
                        >
                            {y === 'All' ? 'ALL YEARS' : `YEAR ${y}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {filteredStudents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        <AnimatePresence>
                            {filteredStudents.map((student, i) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    key={student.sid || student.id || i}
                                    className="f-node-card bounce-in"
                                    style={{ padding: '0', overflow: 'hidden', borderTop: '4px solid var(--nexus-primary)', cursor: 'pointer' }}
                                    onClick={() => handleStudentClick(student)}
                                    whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                                >
                                    <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div className="f-node-type-icon" style={{
                                                background: student.profileImage || student.profilePic || student.avatar ? 'none' : 'rgba(99, 102, 241, 0.1)',
                                                color: 'var(--nexus-primary)',
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '16px',
                                                overflow: 'hidden'
                                            }}>
                                                {student.profileImage || student.profilePic || student.avatar ? (
                                                    <img
                                                        src={student.profileImage || student.profilePic || student.avatar}
                                                        alt="Profile"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'; }}
                                                    />
                                                ) : (
                                                    <FaUserGraduate size={24} />
                                                )}
                                            </div>
                                            <span className="f-meta-badge unit" style={{ background: '#f1f5f9' }}>
                                                ID: {student.sid || student.id}
                                            </span>
                                        </div>

                                        <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.2rem', fontWeight: 950, color: '#1e293b' }}>
                                            {student.studentName || student.name}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                                            {student.email || 'No email provided'}
                                        </p>
                                    </div>

                                    <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'min-content min-content 1fr', gap: '0.8rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <FaGraduationCap style={{ color: '#6366f1' }} />
                                            <span>YR {student.year}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <FaLayerGroup style={{ color: '#10b981' }} />
                                            <span>SEC {student.section}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <FaCodeBranch style={{ color: '#f59e0b' }} />
                                            <span>{student.branch || 'GEN'}</span>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <button
                                                className="f-quick-btn outline"
                                                style={{
                                                    flex: 1,
                                                    fontSize: '0.75rem',
                                                    padding: '0.6rem',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    border: '1px solid #cbd5e1',
                                                    background: 'white',
                                                    color: '#334155',
                                                    fontWeight: 700
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStudentClick(student);
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = '#f1f5f9';
                                                    e.currentTarget.style.borderColor = '#94a3b8';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'white';
                                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                                }}
                                            >
                                                <FaEye /> VIEW PROFILE
                                            </button>
                                            <button
                                                className="f-quick-btn outline"
                                                style={{ flex: 1, fontSize: '0.75rem', padding: '0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const prompt = `Can you provide a pedagogical evaluation and progress report for ${student.studentName} (ID: ${student.sid})? They are in Year ${student.year}, Section ${student.section}, studying ${student.branch}. I want to understand their potential learning hurdles and suggested intervention strategies.`;
                                                    openAiWithPrompt(prompt);
                                                }}
                                            >
                                                <FaRobot /> AI EVALUATE
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="f-node-card" style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.8 }}>
                        <div className="f-node-type-icon" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', fontSize: '2.5rem', background: '#f1f5f9', color: '#cbd5e1' }}>
                            <FaSearch />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#94a3b8', margin: 0 }}>NO STUDENTS FOUND</h3>
                        <p style={{ marginTop: '0.5rem', color: '#cbd5e1' }}>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyStudents;
