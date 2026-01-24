import React, { useState, useMemo } from 'react';
import { FaDownload, FaArrowLeft, FaChevronRight, FaRegFolder, FaRegFileAlt, FaVideo, FaLightbulb, FaFileAlt } from 'react-icons/fa';

/**
 * PREMIUM NEXUS ACADEMIC BROWSER
 * A high-end, multi-level file browser experience for educational content.
 */
const AcademicBrowser = ({ yearData, selectedYear, serverMaterials, userData, setView, branch }) => {
    const [navPath, setNavPath] = useState([]);

    const currentViewData = useMemo(() => {
        if (navPath.length === 0) {
            const yearToUse = selectedYear || 1;
            return { type: 'year', id: yearToUse, name: `Academic Year ${yearToUse}`, data: yearData.semesters };
        }
        return navPath[navPath.length - 1];
    }, [navPath, selectedYear, yearData]);

    const handleNavigateTo = (item, type, data) => {
        setNavPath([...navPath, { type, id: item.id || item, name: item.name || `Semester ${item}`, data }]);
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

    const renderEmpty = (msg) => (
        <div className="nexus-empty-state">
            <div className="empty-state-icon">📂</div>
            <h3 className="empty-state-title">VOID DETECTED</h3>
            <p className="empty-state-msg">{msg}</p>
        </div>
    );

    const renderContent = () => {
        const current = currentViewData;

        // Level: Year (Semesters)
        if (current.type === 'year') {
            return (
                <div className="nexus-grid-layout">
                    {(current.data || []).map(sem => (
                        <div key={sem.sem} className="nexus-node-card sem-node" onClick={() => handleNavigateTo({ id: sem.sem, name: `Semester ${selectedYear}.${sem.sem % 2 === 0 ? 2 : 1}` }, 'semester', sem.subjects)}>
                            <div className="nexus-node-icon">📚</div>
                            <div className="nexus-node-info">
                                <h3>Semester {selectedYear}.{sem.sem % 2 === 0 ? 2 : 1}</h3>
                                <span>{(sem.subjects || []).length} Specialized Subjects</span>
                            </div>
                            <FaChevronRight className="node-arrow" />
                        </div>
                    ))}
                    {(!current.data || current.data.length === 0) && renderEmpty("No semesters configured for this year.")}
                </div>
            );
        }

        // Level: Semester (Subjects)
        if (current.type === 'semester') {
            return (
                <div className="nexus-grid-layout">
                    {(current.data || []).map(sub => (
                        <div key={sub.id} className="nexus-node-card subject-node" onClick={() => handleNavigateTo(sub, 'subject', sub.modules)}>
                            <div className="nexus-node-icon">📘</div>
                            <div className="nexus-node-info">
                                <h3>{sub.name}</h3>
                                <code className="code-badge">{sub.code}</code>
                            </div>
                            <FaChevronRight className="node-arrow" />
                        </div>
                    ))}
                    {(!current.data || current.data.length === 0) && renderEmpty("No subjects found in this semester.")}
                </div>
            );
        }

        // Level: Subject (Modules)
        if (current.type === 'subject') {
            return (
                <div className="nexus-list">
                    {(current.data || []).map(mod => (
                        <div key={mod.id} className="nexus-list-item" onClick={() => handleNavigateTo(mod, 'module', mod.units)}>
                            <FaRegFolder />
                            <div className="item-label">{mod.name}</div>
                            <span className="item-meta">{(mod.units || []).length} units</span>
                            <FaChevronRight className="node-arrow-static" />
                        </div>
                    ))}
                </div>
            );
        }

        // Level: Module (Units)
        if (current.type === 'module') {
            return (
                <div className="nexus-list">
                    {(current.data || []).map(unit => (
                        <div key={unit.id} className="nexus-list-item" onClick={() => handleNavigateTo(unit, 'unit', unit.topics)}>
                            <FaRegFolder className="text-success" />
                            <div className="item-label">{unit.name}</div>
                            <span className="item-meta">{(unit.topics || []).length} topics</span>
                            <FaChevronRight className="node-arrow-static" />
                        </div>
                    ))}
                </div>
            );
        }

        // Level: Unit (Topics)
        if (current.type === 'unit') {
            return (
                <div className="nexus-list">
                    {(current.data || []).map(topic => (
                        <div key={topic.id} className="nexus-list-item" onClick={() => handleNavigateTo(topic, 'topic', topic.resources)}>
                            <FaLightbulb className="text-warning" />
                            <div className="item-label">{topic.name}</div>
                            <span className="item-meta">Ready Resources</span>
                            <FaChevronRight className="node-arrow-static" />
                        </div>
                    ))}
                </div>
            );
        }

        // Level: Resources
        if (current.type === 'topic') {
            const staticResources = current.data || {};
            const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const apiMaterials = serverMaterials.map(m => ({ ...m, url: m.url && m.url.startsWith('http') ? m.url : `${API_BASE}${m.url}` }));

            const subjectObj = navPath.find(item => item.type === 'subject');
            const moduleObj = navPath.find(item => item.type === 'module');
            const unitObj = navPath.find(item => item.type === 'unit');

            const currentSubject = subjectObj ? subjectObj.name : '';
            const currentModule = moduleObj ? moduleObj.name.replace('Module ', '') : '';
            const currentUnit = unitObj ? unitObj.name.replace('Unit ', '') : '';

            const dynamicResources = apiMaterials.filter(m => {
                const matchYear = String(m.year) === 'All' || String(m.year) === String(selectedYear);
                const matchSection = m.section === 'All' || m.section === userData.section;
                const matchSubject = m.subject === currentSubject;
                const modStr = String(m.module);
                const matchModule = modStr === currentModule || modStr === `Module ${currentModule}` || (moduleObj && moduleObj.name.includes(modStr));
                const unitStr = String(m.unit);
                const matchUnit = unitStr === currentUnit || unitStr === `Unit ${currentUnit}` || (unitObj && unitObj.name.includes(unitStr));
                return matchYear && matchSection && matchSubject && matchModule && matchUnit;
            });

            const notes = [...(staticResources.notes || []), ...dynamicResources.filter(m => m.type === 'notes')];
            const videos = [...(staticResources.videos || []), ...dynamicResources.filter(m => m.type === 'videos')];
            const papers = [...(staticResources.modelPapers || []), ...dynamicResources.filter(m => m.type === 'modelPapers' || m.type === 'previousQuestions')];

            return (
                <div className="nexus-resources">
                    <div className="res-section">
                        <h4>📄 LECTURE NOTES</h4>
                        <div className="res-row">
                            {notes.map((n, i) => (
                                <div key={i} className="res-card-v2">
                                    <div className="res-info">
                                        <FaRegFileAlt />
                                        <span>{n.name || n.title}</span>
                                    </div>
                                    <div className="res-actions">
                                        <a href={n.url} target="_blank" rel="noreferrer" className="dl-btn"><FaDownload /></a>
                                        <button className="ai-ask-btn" onClick={() => setView('ai-assistant')}>ASK AI</button>
                                    </div>
                                </div>
                            ))}
                            {notes.length === 0 && <p className="res-empty-hint">No notes found for this topic.</p>}
                        </div>
                    </div>
                    {videos.length > 0 && (
                        <div className="res-section">
                            <h4>🎥 VIDEO CONCEPTS</h4>
                            <div className="res-row">
                                {videos.map((v, i) => (
                                    <a key={i} href={v.url} target="_blank" rel="noreferrer" className="res-card-v2 vid">
                                        <div className="res-info">
                                            <FaVideo className="text-warning" />
                                            <span>{v.name || v.title}</span>
                                        </div>
                                        <FaChevronRight className="node-arrow-static" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    {papers.length > 0 && (
                        <div className="res-section">
                            <h4>📝 MODEL PAPERS / PYQs</h4>
                            <div className="res-row">
                                {papers.map((p, i) => (
                                    <div key={i} className="res-card-v2">
                                        <div className="res-info">
                                            <FaFileAlt className="text-pink" />
                                            <span>{p.name || p.title || p.description}</span>
                                        </div>
                                        <div className="res-actions">
                                            <a href={p.url} target="_blank" rel="noreferrer" className="dl-btn"><FaDownload /></a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return renderEmpty("Layer not found.");
    };

    return (
        <div className="nexus-browser-container">
            <div className="browser-header">
                <div>
                    <h2 className="browser-title">{currentViewData.name}</h2>
                    <div className="browser-breadcrumbs">
                        <span onClick={resetNavigation}>ROOT</span>
                        {navPath.map((item, i) => (
                            <React.Fragment key={i}>
                                <FaChevronRight className="sep" />
                                <span onClick={() => handleBreadcrumbClick(i)}>{item.name}</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                {navPath.length > 0 && (
                    <button onClick={handleBack} className="browser-back-btn">
                        <FaArrowLeft /> BACK
                    </button>
                )}
            </div>

            <div className="nexus-browser-viewport">
                {renderContent()}
            </div>
        </div>
    );
};

export default AcademicBrowser;
