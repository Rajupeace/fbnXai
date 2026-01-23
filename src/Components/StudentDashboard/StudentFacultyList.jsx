import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaBook, FaUserTie, FaFilter, FaShieldAlt, FaLinkedin, FaGithub } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';

/**
 * NEXUS MENTOR CIRCLE v4
 * A premium interface for students to connect with their academic mentors.
 */
const StudentFacultyList = ({ studentData }) => {
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSector, setSelectedSector] = useState('all');

    useEffect(() => {
        fetchFacultyList();
    }, [studentData]);

    const fetchFacultyList = async () => {
        setLoading(true);
        if (!studentData || !studentData.year) {
            setFacultyList([]);
            setLoading(false);
            return;
        }

        try {
            // Fetch faculty teaching this specific student's year/section/branch
            const response = await apiGet(`/api/faculty/teaching?year=${studentData.year}&section=${studentData.section}&branch=${studentData.branch}`);
            const list = (response || []).map(f => {
                const assignment = (f.assignments || []).find(a =>
                    String(a.year) === String(studentData.year) &&
                    String(a.section).toUpperCase() === String(studentData.section).toUpperCase() &&
                    String(a.branch).toUpperCase() === String(studentData.branch).toUpperCase());

                return {
                    id: f.facultyId,
                    name: f.name || f.facultyName || 'Unknown Instructor',
                    subject: assignment?.subject || f.subject || 'Specialized Topic',
                    email: f.email || 'mentor@vignan.edu',
                    phone: f.phone || f.contact || 'No contact sync',
                    semester: assignment?.semester || f.semester || 'Current Semester',
                    branch: f.department || f.branch || 'Core Engineering',
                    image: f.image || f.profilePic || null,
                    qualification: f.qualification || 'PhD Scholar',
                    experience: f.experience || '8+ Academic Years',
                    specialization: f.specialization || 'Distributed Systems',
                    isAvailable: Math.random() > 0.3 // Mock availability
                };
            });
            setFacultyList(list);
        } catch (error) {
            console.error('Mentor Network Synchronization Failed:', error);
            setFacultyList([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredFaculty = () => {
        if (selectedSector === 'all') return facultyList;
        return facultyList.filter(f => f.branch.toLowerCase().includes(selectedSector.toLowerCase()));
    };

    if (loading) {
        return (
            <div className="nexus-schedule-loading">
                <div className="nexus-loading-ring"></div>
                <div className="loading-text">SYNCING MENTOR NETWORK...</div>
            </div>
        );
    }

    const sectors = ['all', ...new Set(facultyList.map(f => f.branch))];
    const filtered = getFilteredFaculty();

    return (
        <div className="nexus-page-container">
            {/* Header Area */}
            <div className="nexus-page-header">
                <div>
                    <div className="nexus-page-subtitle"><FaUserTie /> Academic Sovereignty</div>
                    <h1 className="nexus-page-title">MENTOR <span>CIRCLE</span></h1>
                </div>
                <div className="hub-stats">
                    <div className="nexus-intel-badge">
                        ACTIVE NODES: {filtered.length}
                    </div>
                </div>
            </div>

            {/* Sector Navigation */}
            <div className="sector-nav">
                <div className="sector-label">
                    <FaFilter /> SECTOR FILTER
                </div>
                <div className="nexus-glass-pills">
                    {sectors.map(sector => (
                        <button
                            key={sector}
                            onClick={() => setSelectedSector(sector)}
                            className={`nexus-pill ${selectedSector === sector ? 'active' : ''}`}
                        >
                            {sector === 'all' ? 'CENTRAL HUB' : sector.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mentor Grid */}
            <div className="mentor-quantum-grid">
                {filtered.map((mentor, index) => (
                    <div key={index} className="quantum-mentor-card">
                        <div className="card-top">
                            <div className="mentor-portrait">
                                {mentor.image ? (
                                    <img src={mentor.image} alt={mentor.name} />
                                ) : (
                                    <div className="portrait-fallback">{mentor.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                                )}
                                <div className={`status-dot ${mentor.isAvailable ? 'online' : 'busy'}`}></div>
                            </div>
                            <div className="mentor-bio">
                                <h3>{mentor.name}</h3>
                                <div className="mentor-role">{mentor.qualification}</div>
                                <div className={`status-tag ${mentor.isAvailable ? '' : 'gold'}`}>
                                    {mentor.isAvailable ? 'AVAILABLE FOR COUNSEL' : 'IN SESSION'}
                                </div>
                            </div>
                        </div>

                        <div className="mentor-subject-box">
                            <FaBook />
                            <div className="subject-info">
                                <span className="active-module-label">
                                    ACTIVE MODULE
                                </span>
                                <span className="active-module-val">{mentor.subject}</span>
                            </div>
                        </div>

                        <div className="mentor-attributes">
                            <div className="attr">
                                <span className="label">DOMAIN</span>
                                <span className="val">{mentor.specialization}</span>
                            </div>
                            <div className="attr">
                                <span className="label">EXPERIENCE</span>
                                <span className="val">{mentor.experience}</span>
                            </div>
                        </div>

                        <div className="mentor-channels">
                            <div className="channel-group">
                                <a href={`mailto:${mentor.email}`} title="Dispatch Email" className="channel-link"><FaEnvelope /></a>
                                <a href={`tel:${mentor.phone}`} title="Voice Comms" className="channel-link"><FaPhone /></a>
                                <div className="channel-link"><FaLinkedin /></div>
                                <div className="channel-link"><FaGithub /></div>
                            </div>
                            <button className="counsel-btn">
                                INITIATE LINK <FaShieldAlt />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {
                filtered.length === 0 && (
                    <div className="nexus-empty-sector">
                        <FaUserTie className="empty-sector-icon" />
                        <h3>SECTOR EMPTY</h3>
                        <p className="empty-sector-msg">No mentors are currently registered in this academic sector. Please check the Central Hub.</p>
                        <button onClick={() => setSelectedSector('all')} className="counsel-btn center-btn">RETURN TO HUB</button>
                    </div>
                )
            }
        </div >
    );
};

export default StudentFacultyList;
