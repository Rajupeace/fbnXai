import React, { useState, useMemo } from 'react';
import { FaDownload, FaClipboardList, FaRobot } from 'react-icons/fa';

const AcademicBrowser = ({ yearData, selectedYear, serverMaterials, userData, setView, branch }) => {
    // Navigation State for Academic Browser
    const [navPath, setNavPath] = useState([]); // Array of { type, id, name, data }

    // Helper to resolve current view data
    const currentViewData = useMemo(() => {
        // Default to the student's current year if no path is set
        if (navPath.length === 0) {
            const yearToUse = selectedYear || 1;
            // yearData format is { semesters: [...] }
            return { type: 'year', id: yearToUse, name: `Year ${yearToUse}`, data: yearData.semesters };
        }
        return navPath[navPath.length - 1];
    }, [navPath, selectedYear, yearData]);

    // Handlers for Navigation
    const handleNavigateTo = (item, type, data) => {
        setNavPath([...navPath, { type, id: item.id || item, name: item.name || `Year ${item}`, data }]);
    };

    const handleBreadcrumbClick = (index) => {
        setNavPath(navPath.slice(0, index + 1));
    };

    const handleBack = () => {
        setNavPath(parent => parent.slice(0, -1));
    };

    const resetNavigation = () => {
        setNavPath([]);
    };

    // Render Logic for different levels
    const renderContent = () => {
        const current = currentViewData;

        // Level 2: Semesters (inside a Year)
        if (current.type === 'year') {
            return (
                <div className="grid-container">
                    {(current.data || []).map(sem => (
                        <div key={sem.sem} className="nav-card sem-card" onClick={() => handleNavigateTo({ id: sem.sem, name: `Semester ${sem.sem}` }, 'semester', sem.subjects)}>
                            <div className="card-icon">📖</div>
                            <h3>Semester {sem.sem}</h3>
                            <p>{(sem.subjects || []).length} Subjects</p>
                            <div className="card-progress-mini">
                                <div className="cp-fill" style={{ width: '45%', background: '#6366f1' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 3: Subjects (inside a Semester)
        if (current.type === 'semester') {
            return (
                <div className="grid-container">
                    {(current.data || []).map(sub => (
                        <div key={sub.id} className="nav-card subject-card" onClick={() => handleNavigateTo(sub, 'subject', sub.modules)}>
                            <div className="card-icon">📘</div>
                            <h3>{sub.name}</h3>
                            <p>{sub.code}</p>
                            <div className="card-progress-mini">
                                <div className="cp-fill" style={{ width: `${Math.floor(Math.random() * 60 + 20)}%`, background: '#10b981' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 4: Modules (inside a Subject)
        if (current.type === 'subject') {
            return (
                <div className="modules-grid">
                    {(current.data || []).map(mod => (
                        <div key={mod.id} className="nav-item module-item" onClick={() => handleNavigateTo(mod, 'module', mod.units)}>
                            <div className="item-icon">📦</div>
                            <div className="item-details">
                                <h3>{mod.name}</h3>
                                <span>{(mod.units || []).length} Units</span>
                            </div>
                            <div className="item-arrow">➔</div>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 5: Units (inside a Module)
        if (current.type === 'module') {
            return (
                <div className="modules-grid">
                    {(current.data || []).map(unit => (
                        <div key={unit.id} className="nav-item unit-item" onClick={() => handleNavigateTo(unit, 'unit', unit.topics)}>
                            <div className="item-icon">📑</div>
                            <div className="item-details">
                                <h3>{unit.name}</h3>
                                <span>{(unit.topics || []).length} Topics</span>
                            </div>
                            <div className="item-arrow">➔</div>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 6: Topics (inside a Unit)
        if (current.type === 'unit') {
            return (
                <div className="modules-grid">
                    {(current.data || []).map(topic => (
                        <div key={topic.id} className="nav-item topic-item" onClick={() => handleNavigateTo(topic, 'topic', topic.resources)}>
                            <div className="item-icon">💡</div>
                            <div className="item-details">
                                <h3>{topic.name}</h3>
                                <span>View Notes, Videos & Papers</span>
                            </div>
                            <div className="item-arrow">➔</div>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 7: Resources (Notes, Videos, Papers for a Topic)
        if (current.type === 'topic') {
            const staticResources = current.data || {};

            // 2. Server materials (fetched via API)
            const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const apiMaterials = serverMaterials.map(m => ({
                ...m,
                url: m.url && m.url.startsWith('http') ? m.url : `${API_BASE}${m.url}`
            }));

            // Combine both sources (Only API now)
            const allDynamicMaterials = [...apiMaterials];

            const subjectObj = navPath.find(item => item.type === 'subject');
            const moduleObj = navPath.find(item => item.type === 'module');
            const unitObj = navPath.find(item => item.type === 'unit');

            const currentSubject = subjectObj ? subjectObj.name : '';
            const currentModule = moduleObj ? moduleObj.name.replace('Module ', '') : '';
            const currentUnit = unitObj ? unitObj.name.replace('Unit ', '') : '';
            const currentTopicName = currentViewData.name || '';

            // Filter relevant materials
            const dynamicResources = allDynamicMaterials.filter(m => {
                // Year & Section Logic
                // If material year/section is 'All', it applies. Otherwise must match.
                const matchYear = String(m.year) === 'All' || String(m.year) === String(selectedYear);
                const matchSection = m.section === 'All' || m.section === userData.section;

                // Subject Match
                const matchSubject = m.subject === currentSubject;

                // Module/Unit match
                const modStr = String(m.module);
                const matchModule = modStr === currentModule ||
                    modStr === `Module ${currentModule}` ||
                    (moduleObj && moduleObj.name.includes(modStr));

                const unitStr = String(m.unit);
                const matchUnit = unitStr === currentUnit ||
                    unitStr === `Unit ${currentUnit}` ||
                    (unitObj && unitObj.name.includes(unitStr));

                // Topic Match
                let matchTopic = true;
                if (currentTopicName !== 'General Topics' && m.topic) {
                    matchTopic = (m.topic.toLowerCase() === currentTopicName.toLowerCase()) ||
                        (currentTopicName.toLowerCase().includes(m.topic.toLowerCase()));
                }

                return matchYear && matchSection && matchSubject && matchModule && matchUnit && matchTopic;
            });

            // Flatten lists
            const notes = [...(staticResources.notes || []), ...dynamicResources.filter(m => m.type === 'notes')];
            const videos = [...(staticResources.videos || []), ...dynamicResources.filter(m => m.type === 'videos')];
            const papers = [...(staticResources.modelPapers || []), ...dynamicResources.filter(m => m.type === 'modelPapers' || m.type === 'previousQuestions')];
            const syllabus = dynamicResources.filter(m => m.type === 'syllabus');

            return (
                <div className="resources-container">
                    <div className="resource-section">
                        <h4>📄 Notes</h4>
                        <div className="res-grid">
                            {notes.map((note, idx) => (
                                <div key={note.id || idx} className="res-card-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <a href={note.url} target="_blank" rel="noreferrer" className="res-card note-res" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#334155' }}>
                                        <FaDownload />
                                        <span>{note.name || note.title}</span>
                                        {note.uploadedBy === 'admin' && <span className="badge-admin" style={{ fontSize: '0.7rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '10px' }}>Admin</span>}
                                    </a>
                                    <button
                                        className="btn-ask-ai"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setView('ai-assistant');
                                        }}
                                        style={{
                                            background: '#f0fdf4', border: '1px solid #10b981', color: '#10b981',
                                            borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.1rem' }}>🤖</span> Ask AI
                                    </button>
                                </div>
                            ))}

                            {notes.length === 0 && <p className="text-muted">No notes available.</p>}
                        </div>
                    </div>

                    <div className="resource-section">
                        <h4>🎥 Videos</h4>
                        <div className="res-grid">
                            {videos.map((vid, idx) => (
                                <a key={vid.id || idx} href={vid.url} target="_blank" rel="noreferrer" className="res-card video-res">
                                    <div className="play-icon">▶</div>
                                    <div className="vid-info">
                                        <div>{vid.name || vid.title}</div>
                                        {vid.duration && <span className="duration">({vid.duration})</span>}
                                    </div>
                                </a>
                            ))}
                            {videos.length === 0 && <p className="text-muted">No videos available.</p>}
                        </div>
                    </div>

                    <div className="resource-section">
                        <h4>📝 Model Papers</h4>
                        <div className="res-grid">
                            {papers.map((paper, idx) => (
                                <a key={paper.id || idx} href={paper.url} target="_blank" rel="noreferrer" className="res-card paper-res">
                                    <FaDownload /> {paper.name || paper.title}
                                </a>
                            ))}
                            {papers.length === 0 && <p className="text-muted">No model papers available.</p>}
                        </div>
                    </div>

                    {syllabus.length > 0 && (
                        <div className="resource-section">
                            <h4>📋 Syllabus</h4>
                            <div className="res-grid">
                                {syllabus.map((syl, idx) => (
                                    <a key={syl.id || idx} href={syl.url} target="_blank" rel="noreferrer" className="res-card">
                                        <FaClipboardList /> {syl.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return <div>Unknown View</div>;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Breadcrumbs */}
            <div className="browser-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>ACADEMIC BROWSER</div>
                    <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: '0.2rem 0' }}>{currentViewData.name}</h2>
                </div>
                {navPath.length > 0 && (
                    <button onClick={handleBack} className="btn-icon" style={{ background: '#f1f5f9', width: '40px', height: '40px', fontSize: '0.9rem' }}>
                        ⬅
                    </button>
                )}
            </div>

            {navPath.length > 0 && (
                <div className="nav-breadcrumbs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                    <span className="crumb" onClick={resetNavigation}>Overview</span>
                    {navPath.map((item, i) => (
                        <React.Fragment key={i}>
                            <span>/</span>
                            <span className="crumb" onClick={() => handleBreadcrumbClick(i)}>{item.name}</span>
                        </React.Fragment>
                    ))}
                </div>
            )}

            {renderContent()}
        </div>
    );
};

export default AcademicBrowser;
