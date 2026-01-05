import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaEnvelope, FaPhone, FaGraduationCap, FaBook } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';

const StudentFacultyList = ({ studentData, myFaculty }) => {
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSemester, setSelectedSemester] = useState('all');

    useEffect(() => {
        if (myFaculty && Array.isArray(myFaculty) && myFaculty.length > 0) {
            setFacultyList(myFaculty);
            setLoading(false);
        } else {
            fetchFacultyList();
        }
    }, [studentData, myFaculty]);
    const fetchFacultyList = async () => {
        setLoading(true);
        // If student data is not ready, clear list
        if (!studentData || !studentData.year) {
            setFacultyList([]);
            setLoading(false);
            return;
        }

        try {
            // Fetch faculty teaching this student's year and section
            const response = await apiGet(`/api/faculty/teaching?year=${studentData.year}&section=${studentData.section}&branch=${studentData.branch}`);
            const list = (response || []).map(f => {
                // Find the assignment that matches this student
                const assignment = (f.assignments || []).find(a => String(a.year) === String(studentData.year) && String(a.section).toUpperCase() === String(studentData.section).toUpperCase() && String(a.branch).toUpperCase() === String(studentData.branch).toUpperCase());
                return {
                    id: f.facultyId,
                    name: f.name || f.facultyName || 'Unknown',
                    subject: assignment?.subject || f.subject || 'Unknown Subject',
                    email: f.email || '',
                    phone: f.phone || f.contact || '',
                    semester: assignment?.semester || f.semester || 'Semester -',
                    image: f.image || null,
                    qualification: f.qualification || '',
                    experience: f.experience || '',
                    raw: f
                };
            });
            setFacultyList(list);
        } catch (error) {
            console.error('Failed to fetch faculty list:', error);
            setFacultyList([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredFaculty = () => {
        if (selectedSemester === 'all') {
            return facultyList;
        }
        return facultyList.filter(f => f.semester === selectedSemester);
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading faculty information...</div>;
    }

    const semesters = ['all', ...new Set(facultyList.map(f => f.semester))];

    return (
        <div className="student-faculty-list" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.8rem', color: '#1e293b' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                        <FaChalkboardTeacher />
                    </div>
                    👨‍🏫 My Faculty
                </h2>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', background: 'rgba(16, 185, 129, 0.08)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    {getFilteredFaculty().length} FACULTY MEMBERS
                </div>
            </div>

            {/* Semester Filter */}
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {semesters.map(sem => (
                    <button
                        key={sem}
                        onClick={() => setSelectedSemester(sem)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            border: selectedSemester === sem ? '2px solid #10b981' : '2px solid #e2e8f0',
                            background: selectedSemester === sem ? 'linear-gradient(135deg, #10b981, #059669)' : 'white',
                            color: selectedSemester === sem ? 'white' : '#64748b',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            fontSize: '0.85rem',
                            textTransform: 'capitalize'
                        }}
                    >
                        {sem === 'all' ? 'All Semesters' : sem}
                    </button>
                ))}
            </div>

            {/* Faculty Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {getFilteredFaculty().map((faculty, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '2rem',
                            background: 'white',
                            borderRadius: '24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {/* Faculty Avatar & Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            {faculty.image ? (
                                <img
                                    src={faculty.image}
                                    alt={faculty.name}
                                    style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '20px',
                                        objectFit: 'cover',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.8rem',
                                    fontWeight: 900,
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}>
                                    {faculty.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.2rem' }}>
                                    {faculty.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '6px', display: 'inline-block', marginBottom: '0.2rem' }}>
                                    ID: {faculty.id || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Subject */}
                        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <FaBook />
                                {faculty.subject}
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', color: '#475569' }}>
                                <FaEnvelope style={{ color: '#94a3b8' }} />
                                {faculty.email || 'No Email'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', color: '#475569' }}>
                                <FaPhone style={{ color: '#94a3b8' }} />
                                {faculty.phone || 'No Phone'}
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {getFilteredFaculty().length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>👨‍🏫</div>
                    <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No faculty found for your section</div>
                </div>
            )}
        </div>
    );
};

export default StudentFacultyList;
