import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getYearData } from './branchData';
import { FaArrowLeft, FaBook, FaVideo, FaFileAlt } from 'react-icons/fa';
import api from '../../utils/apiClient';

const SemesterNotes = ({ studentData }) => {
    const navigate = useNavigate();
    const [activeYear, setActiveYear] = useState(null);
    const [activeSemester, setActiveSemester] = useState(null);
    const [activeSubject, setActiveSubject] = useState(null);
    const [activeModule, setActiveModule] = useState(null);
    const [activeUnit, setActiveUnit] = useState(null);

    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const years = [1, 2, 3, 4];

    // Fetch materials and courses on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both materials and dynamic courses
                const [fetchedMaterials, fetchedCourses] = await Promise.all([
                    api.apiGet('/api/materials'),
                    api.apiGet('/api/courses')
                ]);

                setMaterials(Array.isArray(fetchedMaterials) ? fetchedMaterials : []);
                setCourses(Array.isArray(fetchedCourses) ? fetchedCourses : []);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                // Fallback to empty if API fails, but allow static data to work
                setMaterials([]);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const navigateBack = () => {
        if (activeUnit) {
            setActiveUnit(null);
        } else if (activeModule) {
            setActiveModule(null);
        } else if (activeSubject) {
            setActiveSubject(null);
        } else if (activeSemester) {
            setActiveSemester(null);
        } else if (activeYear) {
            setActiveYear(null);
        } else {
            navigate('/dashboard');
        }
    };

    const Card = ({ title, onClick, children, isActive = false }) => (
        <div
            className={`card ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="card-header">
                <h3>{title}</h3>
            </div>
            {children && <div className="card-content">{children}</div>}
        </div>
    );

    const renderBreadcrumb = () => {
        const parts = [];
        if (activeYear) parts.push(`Year ${activeYear}`);
        if (activeSemester) parts.push(`Semester ${activeSemester.sem}`);
        if (activeSubject) parts.push(activeSubject.name);
        if (activeModule) parts.push(`Module ${activeModule}`);
        if (activeUnit) parts.push(`Unit ${activeUnit}`);

        return (
            <div className="breadcrumb">
                <button onClick={navigateBack} className="back-button">
                    <FaArrowLeft /> {activeYear ? 'Back' : 'Back to Dashboard'}
                </button>
                {parts.length > 0 && (
                    <div className="breadcrumb-path">
                        {parts.join(' / ')}
                    </div>
                )}
            </div>
        );
    };

    const renderYears = () => (
        <div className="section-container">
            <h2 className="section-title">Select Academic Year</h2>
            <div className="card-grid">
                {years.map(year => (
                    <Card
                        key={year}
                        title={`Year ${year}`}
                        onClick={() => setActiveYear(year)}
                    />
                ))}
            </div>
        </div>
    );

    const renderSemesters = () => {
        // Use static structure for initial navigation (Year/Sem/Subject) to keep curriculum consistent
        const yearData = getYearData(studentData.branch, activeYear);
        return (
            <div className="section-container">
                <h2 className="section-title">Select Semester</h2>
                <div className="card-grid">
                    {yearData.semesters.map(semester => (
                        <Card
                            key={semester.sem}
                            title={`Semester ${semester.sem}`}
                            onClick={() => setActiveSemester(semester)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const renderSubjects = () => {
        // 1. Get Static Subjects (from branchData)
        const staticSubjects = activeSemester.subjects || [];

        // 2. Get Dynamic Subjects (from API) that match current year/sem/branch
        const dynamicSubjects = courses.filter(c => {
            const sameYear = String(c.year) === String(activeYear);
            const sameSem = String(c.semester) === String(activeSemester.sem);
            // Branch match: 'All', 'Common', or specific branch
            const sameBranch = !c.branch || c.branch === 'All' || c.branch === 'Common' ||
                (c.branch && c.branch.toLowerCase() === studentData.branch.toLowerCase());
            return sameYear && sameSem && sameBranch;
        });

        // 3. Selection Logic (Dynamic Dominance)
        // If we have ANY dynamic subjects for this semester group, we strictly use them.
        // This ensures that if an Admin deletes a "Static" default subject (which triggers a migration of the rest to Dynamic),
        // the Student Dashboard properly sees the "Deleted" state (missing from Dynamic list) rather than falling back to Static.

        let finalSubjects = [];

        if (dynamicSubjects.length > 0) {
            // Use Dynamic Only
            finalSubjects = dynamicSubjects.map(s => ({
                id: s.id || s._id,
                name: s.name || s.courseName,
                code: s.code || s.courseCode,
                ...s
            }));
        } else {
            // Use Static Fallback
            finalSubjects = staticSubjects;
        }

        const allSubjects = finalSubjects;

        if (allSubjects.length === 0) {
            return (
                <div className="section-container">
                    <h2 className="section-title">Select Subject</h2>
                    <div className="no-content">No subjects found for this semester.</div>
                </div>
            );
        }

        return (
            <div className="section-container">
                <h2 className="section-title">Select Subject</h2>
                <div className="card-grid">
                    {allSubjects.map((subject, idx) => (
                        <Card
                            key={subject.id || subject.code || idx}
                            title={subject.name}
                            onClick={() => setActiveSubject(subject)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // Dynamic Module Rendering
    const renderModules = () => {
        // Filter materials for this subject
        const subjectMaterials = materials.filter(m => {
            const matSubject = m.subject ? m.subject.toLowerCase().trim() : '';
            const activeSub = activeSubject.name ? activeSubject.name.toLowerCase().trim() : '';
            const matYear = m.year ? String(m.year) : '';
            const activeYr = activeYear ? String(activeYear) : '';

            // Allow loose matching if year is missing or 'All'
            const yearMatch = !matYear || matYear === 'All' || matYear === activeYr;

            return matSubject === activeSub && yearMatch;
        });

        // Get unique modules
        const uniqueModules = [...new Set(subjectMaterials.map(m => m.module).filter(Boolean))].sort();

        // If no dynamic modules found, check if we should show a default set or empty
        if (uniqueModules.length === 0) {
            return (
                <div className="section-container">
                    <h2 className="section-title">Select Module</h2>
                    <div className="no-content">No materials uploaded for this subject yet.</div>
                </div>
            );
        }

        return (
            <div className="section-container">
                <h2 className="section-title">Select Module</h2>
                <div className="card-grid">
                    {uniqueModules.map(mod => (
                        <Card
                            key={mod}
                            title={`Module ${mod}`}
                            onClick={() => setActiveModule(mod)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // Dynamic Unit Rendering
    const renderUnits = () => {
        const moduleMaterials = materials.filter(m => {
            const matSubject = m.subject ? m.subject.toLowerCase().trim() : '';
            const activeSub = activeSubject.name ? activeSubject.name.toLowerCase().trim() : '';
            return matSubject === activeSub &&
                String(m.module) === String(activeModule);
        });

        const uniqueUnits = [...new Set(moduleMaterials.map(m => m.unit).filter(Boolean))].sort();

        if (uniqueUnits.length === 0) {
            return (
                <div className="section-container">
                    <h2 className="section-title">Select Unit</h2>
                    <div className="no-content">No units found for this module.</div>
                </div>
            );
        }

        return (
            <div className="section-container">
                <h2 className="section-title">Select Unit</h2>
                <div className="card-grid">
                    {uniqueUnits.map(unit => (
                        <Card
                            key={unit}
                            title={`Unit ${unit}`}
                            onClick={() => setActiveUnit(unit)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // Dynamic Topic Rendering
    const renderTopics = () => {
        const unitMaterials = materials.filter(m => {
            const matSubject = m.subject ? m.subject.toLowerCase().trim() : '';
            const activeSub = activeSubject.name ? activeSubject.name.toLowerCase().trim() : '';
            return matSubject === activeSub &&
                String(m.module) === String(activeModule) &&
                String(m.unit) === String(activeUnit);
        });

        // Group by Topic Name
        const topics = {};
        unitMaterials.forEach(m => {
            const topicName = m.topic || 'General Resources';
            if (!topics[topicName]) topics[topicName] = [];
            topics[topicName].push(m);
        });

        if (Object.keys(topics).length === 0) {
            return (
                <div className="section-container">
                    <h2 className="section-title">Study Materials</h2>
                    <div className="no-content">No topics found for this unit.</div>
                </div>
            );
        }

        return (
            <div className="section-container">
                <h2 className="section-title">Study Materials</h2>
                <div className="topic-list">
                    {Object.entries(topics).map(([topicName, items]) => (
                        <div key={topicName} className="topic-card">
                            <div className="topic-header">
                                <h3>{topicName}</h3>
                            </div>
                            <div className="topic-actions">
                                {items.map(m => {
                                    // Construct full URL if relative
                                    const link = m.url || m.fileUrl;
                                    let finalLink = link;

                                    // If link is relative (starts with /), prepend API URL
                                    // Note: apiClient doesn't export API_URL, so we trust relative links to work if we are on same domain
                                    // OR we use the same process.env logic
                                    if (link && link.startsWith('/')) {
                                        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                                        finalLink = `${API_URL.replace(/\/$/, '')}${link}`;
                                    }

                                    return (
                                        <div key={m.id || m._id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <button
                                                className={`action-btn ${m.type === 'videos' ? 'videos' : 'notes'}`}
                                                onClick={() => window.open(finalLink, '_blank')}
                                                title="View / Open"
                                            >
                                                {m.type === 'videos' ? <FaVideo /> : <FaBook />} {m.title}
                                            </button>

                                            {/* Show Download button only for files */}
                                            {m.type !== 'videos' && (
                                                <a
                                                    href={finalLink}
                                                    download
                                                    className="action-btn papers"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="Download PDF"
                                                    style={{ textDecoration: 'none', minWidth: 'auto' }}
                                                >
                                                    <FaFileAlt /> Download
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="semester-notes-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <div className="loader"></div>
            <p>Loading your curriculum...</p>
        </div>
    );

    return (
        <div className="semester-notes-container">
            <div className="page-header">
                <h1>Semester Notes</h1>
                <p>Access your course materials, notes, and study resources</p>
            </div>

            {renderBreadcrumb()}

            <div className="content-container">
                {!activeYear && renderYears()}
                {activeYear && !activeSemester && renderSemesters()}
                {activeSemester && !activeSubject && renderSubjects()}
                {activeSubject && !activeModule && renderModules()}
                {activeModule && !activeUnit && renderUnits()}
                {activeUnit && renderTopics()}
            </div>

            <style jsx>{`
                .semester-notes-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    min-height: 80vh;
                }
                
                .page-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .page-header h1 {
                    font-size: 2.5rem;
                    color: #2c3e50;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #2c3e50, #3498db);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .page-header p {
                    color: #7f8c8d;
                    font-size: 1.1rem;
                }
                
                .breadcrumb {
                    display: flex;
                    align-items: center;
                    margin-bottom: 2rem;
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                
                .back-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background 0.2s;
                }
                
                .back-button:hover {
                    background: #2980b9;
                }
                
                .breadcrumb-path {
                    margin-left: 1rem;
                    color: #7f8c8d;
                    font-size: 0.95rem;
                    font-weight: 500;
                }
                
                .section-container {
                    margin-bottom: 2.5rem;
                    animation: fadeIn 0.3s ease-in-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .section-title {
                    font-size: 1.5rem;
                    color: #2c3e50;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #ecf0f1;
                }
                
                .card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                
                .card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    border: 1px solid #edf2f7;
                    display: flex;
                    flex-direction: column;
                }
                
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                    border-color: #bee3f8;
                }
                
                .card-header {
                    background: white;
                    padding: 1.5rem;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .card-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    color: #2d3748;
                    font-weight: 600;
                }
                
                .card-content {
                    padding: 1rem;
                    color: #718096;
                }
                
                .no-content {
                    text-align: center;
                    padding: 3rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                    color: #7f8c8d;
                    font-style: italic;
                }

                .topic-list {
                    display: grid;
                    gap: 1.5rem;
                }
                
                .topic-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    border: 1px solid #edf2f7;
                }
                
                .topic-header {
                    background: #f8fafc;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #edf2f7;
                }
                
                .topic-header h3 {
                    margin: 0;
                    color: #4a5568;
                    font-size: 1.1rem;
                }
                
                .topic-actions {
                    padding: 1rem 1.5rem;
                }
                
                .action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 1.2rem;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                    text-decoration: none;
                    font-size: 0.9rem;
                    margin-right: 0.8rem;
                }
                
                .action-btn.notes {
                    background: #ebf8ff;
                    color: #3182ce;
                    border: 1px solid #bee3f8;
                }
                
                .action-btn.videos {
                    background: #fff5f5;
                    color: #e53e3e;
                    border: 1px solid #fecaca;
                }
                
                .action-btn.papers {
                    background: #f0fff4;
                    color: #38a169;
                    border: 1px solid #c6f6d5;
                }
                
                .action-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                @media (max-width: 768px) {
                    .card-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .page-header h1 {
                        font-size: 2rem;
                    }
                    
                    .breadcrumb {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    
                    .breadcrumb-path {
                        margin: 0.5rem 0 0 0;
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default SemesterNotes;
