import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/apiClient';
import { FaSignOutAlt, FaDownload, FaCog, FaUserEdit, FaClipboardList, FaEnvelope, FaTrash, FaRobot, FaBookOpen, FaUserTie, FaUserClock, FaClipboardCheck } from 'react-icons/fa';
import PasswordSettings from '../Settings/PasswordSettings';
// import { getYearData } from './branchData';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import AcademicPulse from './AcademicPulse';
import StudentAttendanceView from './StudentAttendanceView';
import StudentSchedule from './StudentSchedule';
import StudentFacultyList from './StudentFacultyList';
import StudentLabsSchedule from './StudentLabsSchedule';
import StudentExams from './StudentExams';
import AnnouncementTicker from '../AnnouncementTicker/AnnouncementTicker';
import './StudentDashboard.css';
import sseClient from '../../utils/sseClient';


// Note: Do NOT show demo/fallback academic numbers to real users.
// Load logged-in user from prop or localStorage; otherwise render empty state.
export default function StudentDashboard({ studentData, onLogout }) {
    const navigate = useNavigate();
    let stored = null;
    try { stored = (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('userData')) ? JSON.parse(window.localStorage.getItem('userData')) : null; } catch (e) { stored = null; }
    const data = { ...(studentData || stored || { studentName: '', sid: '', branch: '', year: '', section: '', role: 'student' }) };
    const branch = String(data.branch || 'CSE').toUpperCase();
    const [isDashboardLoaded, setIsDashboardLoaded] = useState(false);


    // Trigger dashboard entrance animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsDashboardLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // UI state
    const [view, setView] = useState('overview'); // overview | semester | advanced | subject | settings
    // Lock selected year to the student's registered year. Do not allow switching across years from dashboard.
    const [selectedYear] = useState(Number(data.year) || 1);
    const [serverMaterials, setServerMaterials] = useState([]);

    const [userData, setUserData] = useState(data);
    const [messages, setMessages] = useState([]);
    const [tasks, setTasks] = useState([]); // Shared Tasks
    const [showMsgModal, setShowMsgModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showAbout, setShowAbout] = useState(false);
    const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
    const [extraCourses, setExtraCourses] = useState([]);
    const [overviewData, setOverviewData] = useState(null); // New state for mega stats

    // Fetch dynamic courses, materials, and stats
    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                // Fetch Overview Data (Mega Stats)
                const ovData = await apiGet(`/api/students/${data.sid}/overview`);
                if (mounted && ovData) {
                    setOverviewData(ovData);
                    // Sync user profile data from server if it changed (e.g. name update)
                    if (ovData.student && (ovData.student.name !== userData.studentName || ovData.student.year !== userData.year)) {
                        setUserData(prev => ({
                            ...prev,
                            studentName: ovData.student.name || prev.studentName,
                            year: ovData.student.year || prev.year,
                            section: ovData.student.section || prev.section,
                            branch: ovData.student.branch || prev.branch,
                            stats: ovData.student.stats || prev.stats
                        }));
                    }
                }

                // Fetch Student Courses
                const courseData = await apiGet(`/api/students/${data.sid}/courses`);
                if (mounted && Array.isArray(courseData)) {
                    setExtraCourses(prev => JSON.stringify(prev) !== JSON.stringify(courseData) ? courseData : prev);
                }

                // Fetch Materials
                const materialsData = await apiGet('/api/materials');
                if (mounted && Array.isArray(materialsData)) {
                    setServerMaterials(prev => JSON.stringify(prev) !== JSON.stringify(materialsData) ? materialsData : prev);
                }

                // Fetch Tasks
                const tasksData = await apiGet(`/api/todos?role=student`);
                if (mounted && Array.isArray(tasksData)) {
                    setTasks(prev => JSON.stringify(prev) !== JSON.stringify(tasksData) ? tasksData : prev);
                }
            } catch (e) {
                console.error("Failed to fetch data", e);
            }
        };

        fetchData(); // Initial load
        const interval = setInterval(fetchData, 2000); // 2s polling (Fast Updates)

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [data.sid]);

    // SSE: subscribe to server push updates and refresh relevant data immediately
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            try {
                if (!ev || !ev.resource) return;
                const r = ev.resource;
                if (['students', 'materials', 'todos'].includes(r)) {
                    // Quick refresh same as fetchData
                    (async () => {
                        try {
                            const ovData = await apiGet(`/api/students/${data.sid}/overview`);
                            if (ovData) setOverviewData(ovData);

                            const courseData = await apiGet(`/api/students/${data.sid}/courses`);
                            if (Array.isArray(courseData)) setExtraCourses(prev => JSON.stringify(prev) !== JSON.stringify(courseData) ? courseData : prev);

                            const materialsData = await apiGet('/api/materials');
                            if (Array.isArray(materialsData)) setServerMaterials(prev => JSON.stringify(prev) !== JSON.stringify(materialsData) ? materialsData : prev);

                            const tasksData = await apiGet(`/api/todos?role=student`);
                            if (Array.isArray(tasksData)) setTasks(prev => JSON.stringify(prev) !== JSON.stringify(tasksData) ? tasksData : prev);
                        } catch (e) {
                            console.error('SSE refresh failed', e);
                        }
                    })();
                }
            } catch (e) {
                console.error('SSE handler error', e);
            }
        });
        return () => unsub();
    }, [data.sid]);


    // Helper to generate default modules for dynamic courses
    const generateDefaultModules = (subjectId) => {
        return [1, 2, 3, 4, 5].map(m => ({
            id: `${subjectId}-m${m}`,
            name: `Module ${m}`,
            units: [1, 2].map(u => ({
                id: `${subjectId}-m${m}-u${u}`,
                name: `Unit ${u}`,
                topics: [{
                    id: `${subjectId}-m${m}-u${u}-t1`,
                    name: 'General Topics',
                    resources: {}
                }]
            }))
        }));
    };

    // Subject Alias Map for matching abbreviations


    const yearData = useMemo(() => {
        const semesters = [];

        // 1. First, populate semesters and subjects from formal Courses (extraCourses)
        extraCourses.forEach(course => {
            try {
                const cBranch = (course.branch || 'Common').toLowerCase();
                const sBranch = String(branch || '').toLowerCase();

                if (String(course.year) === String(selectedYear) &&
                    (cBranch === sBranch || cBranch === 'common' || course.branch === 'All')) {

                    let sem = semesters.find(s => s.sem === Number(course.semester));
                    if (!sem) {
                        sem = { sem: Number(course.semester), subjects: [] };
                        semesters.push(sem);
                        semesters.sort((a, b) => a.sem - b.sem);
                    }

                    if (!sem.subjects.find(s => s.code === course.code || s.name === course.name)) {
                        sem.subjects.push({
                            id: course.id || `dyn-${course.code}`,
                            name: course.name,
                            code: course.code,
                            modules: course.modules && course.modules.length > 0 ? [...course.modules] : generateDefaultModules(course.id || course.code)
                        });
                    }
                }
            } catch (e) {
                console.error("Error merging course", e);
            }
        });

        // 2. Then, inject serverMaterials into these subjects, or create new "Shadow Subjects" if they don't exist
        serverMaterials.forEach(m => {
            if (m.year && String(m.year) !== 'All' && String(m.year) !== String(selectedYear)) return;

            // Target branch check (usually already filtered by server, but double check)
            if (m.branch && m.branch !== 'All' && m.branch !== branch) return;

            const uplSub = (m.subject || '').toLowerCase().trim();
            let targetSubject = null;

            // Search for existing subject
            for (const sem of semesters) {
                targetSubject = sem.subjects.find(s => {
                    const sName = (s.name || '').toLowerCase();
                    const sCode = (s.code || '').toLowerCase();
                    const sId = (s.id || '').toLowerCase();
                    return (sName === uplSub || sCode === uplSub || sId === uplSub || sName.includes(uplSub) || uplSub.includes(sName));
                });
                if (targetSubject) break;
            }

            // If subject not found, create a "Shadow Subject" in the specified semester (or Semester 1 by default)
            if (!targetSubject) {
                const targetSemNum = Number(m.semester) || 1;
                let sem = semesters.find(s => s.sem === targetSemNum);
                if (!sem) {
                    sem = { sem: targetSemNum, subjects: [] };
                    semesters.push(sem);
                    semesters.sort((a, b) => a.sem - b.sem);
                }
                targetSubject = {
                    id: `shadow-${uplSub}`,
                    name: m.subject || 'Untitled Subject',
                    code: uplSub.toUpperCase(),
                    modules: generateDefaultModules(`shadow-${uplSub}`)
                };
                sem.subjects.push(targetSubject);
            }

            // Inject Module/Unit content
            if (targetSubject) {
                const modName = String(m.module || '1');
                let module = targetSubject.modules.find(mod => mod.name === modName || mod.name === `Module ${modName}`);

                if (!module) {
                    module = { id: `${targetSubject.id}-m${modName}`, name: `Module ${modName}`, units: [] };
                    targetSubject.modules.push(module);
                }

                const unitName = String(m.unit || '1');
                let unit = module.units.find(u => u.name === unitName || u.name === `Unit ${unitName}`);

                if (!unit) {
                    unit = { id: `${module.id}-u${unitName}`, name: `Unit ${unitName}`, topics: [] };
                    module.units.push(unit);
                }

                // Ensure at least one topic exists
                if (unit.topics.length === 0) {
                    unit.topics.push({ id: `${unit.id}-t1`, name: 'General Topics' });
                }

                if (m.topic && m.topic !== 'General Topics') {
                    if (!unit.topics.find(t => t.name === m.topic)) {
                        unit.topics.push({ id: `${unit.id}-t-${Date.now()}`, name: m.topic });
                    }
                }
            }
        });

        return { semesters };
    }, [branch, selectedYear, extraCourses, serverMaterials]);

    // If student has an explicit semester, show only that semester; otherwise allow both semesters of the year
    // If student has an explicit semester, show only that semester; otherwise allow both semesters of the year


    // Fetch server-provided materials (optional) for selected year/branch/section
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const qs = new URLSearchParams({
                    year: String(selectedYear),
                    branch: branch,
                    section: userData.section || 'All'
                });
                const materialsData = await apiGet(`/api/materials?${qs.toString()}`);
                if (mounted && Array.isArray(materialsData)) {
                    setServerMaterials(materialsData);
                }
            } catch (e) {
                // ignore network errors
            }
        })();
        return () => { mounted = false; };
    }, [branch, selectedYear, userData.section]);

    // Fetch Messages from API
    useEffect(() => {
        let mounted = true;
        const fetchMessages = async () => {
            try {
                const allMsgs = await apiGet('/api/messages');
                if (!mounted || !Array.isArray(allMsgs)) return;

                // Filter logic for student:
                // 1. target='all'
                // 2. target='students' (Admin)
                // 3. target='students' (Faculty) AND match year/section
                const filtered = allMsgs.filter(m => {
                    // 1. Global / All Students
                    if (m.target === 'all' || m.target === 'students') {
                        // If it's a faculty message, check year/section targeting
                        if (m.facultyId) {
                            const matchYear = !m.year || String(m.year) === String(userData.year);
                            const matchSec = !m.sections || m.sections.length === 0 || (Array.isArray(m.sections) && m.sections.includes(userData.section));
                            return matchYear && matchSec;
                        }
                        return true;
                    }

                    // 2. Admin Targeted (students-specific)
                    if (m.target === 'students-specific') {
                        const matchYear = String(m.targetYear) === String(userData.year);
                        const matchSec = m.targetSections && m.targetSections.includes(userData.section);
                        return matchYear && matchSec;
                    }

                    return false;
                });

                setMessages(filtered);

                const lastReadCount = parseInt(localStorage.getItem('lastReadMsgCount') || '0', 10);
                const unread = Math.max(0, filtered.length - lastReadCount);
                setUnreadCount(unread);
            } catch (err) {
                console.error("Message sync failed", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 30000); // 30s polling
        return () => { mounted = false; clearInterval(interval); };
    }, [userData.year, userData.section, showMsgModal]);

    // Merge generated subject materials with server-provided ones


    // (Uploads are handled by faculty UI elsewhere; this component offers navigation to upload.)

    const canViewAdvanced = true; // Allow all students to access advanced learning

    // Advanced lists
    // Advanced lists

    const handleSettingsClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setView('settings');
        // Scroll to top to ensure settings are visible
        window.scrollTo(0, 0);
    };

    const handleBackFromSettings = (e) => {
        e && e.preventDefault();
        e && e.stopPropagation();
        setView('overview');
    };



    // Update user data when profile is updated
    const handleProfileUpdate = (updatedData) => {
        if (!updatedData) return;

        const finalData = {
            ...userData,
            ...updatedData,
            studentName: updatedData.studentName || updatedData.name || userData.studentName,
            sid: updatedData.sid || updatedData.studentId || userData.sid
        };

        setUserData(finalData);
        // Persist to localStorage for session continuity
        localStorage.setItem('user', JSON.stringify(finalData));
    };

    // Navigation State for Academic Browser
    const [navPath, setNavPath] = useState([]); // Array of { type, id, name, data }

    // Helper to resolve current view data
    const currentViewData = useMemo(() => {
        // Default to the student's current year if no path is set
        if (navPath.length === 0) {
            const yearToUse = selectedYear || 1;
            // Use the yearData computed from state (includes extraCourses)
            // yearData format is { semesters: [...] }
            return { type: 'year', id: yearToUse, name: `Year ${yearToUse}`, data: yearData.semesters };
        }
        return navPath[navPath.length - 1];
    }, [navPath, selectedYear, yearData]); // Added yearData dependency

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
        setView('overview');
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

            // MERGE Logic:
            // 1. LocalStorage materials (from file-based fallback)
            const localDynamicMaterials = JSON.parse(localStorage.getItem('courseMaterials') || '[]');

            // 2. Server materials (fetched via API)
            const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const apiMaterials = serverMaterials.map(m => ({
                ...m,
                url: m.url && m.url.startsWith('http') ? m.url : `${API_BASE}${m.url}`
            }));

            // Combine both sources
            const allDynamicMaterials = [...localDynamicMaterials, ...apiMaterials];

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
                const matchSection = m.section === 'All' || m.section === data.section;

                // Subject Match
                // Admin might use "CSE" or "Computer Science". We try exact match first.
                // Assuming exact match for now as names are from dropdown.
                const matchSubject = m.subject === currentSubject;

                // Module/Unit match
                // m.module might be "1" or "Module 1"
                const modStr = String(m.module);
                const matchModule = modStr === currentModule ||
                    modStr === `Module ${currentModule}` ||
                    (moduleObj && moduleObj.name.includes(modStr));

                const unitStr = String(m.unit);
                const matchUnit = unitStr === currentUnit ||
                    unitStr === `Unit ${currentUnit}` ||
                    (unitObj && unitObj.name.includes(unitStr));

                // Topic Match
                // If viewing "General Topics", show everything for this Unit.
                // Otherwise try to match topic name.
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
                                            // You could pre-fill the chat input via state or context if you wanted
                                            // For now, it just opens the agent
                                        }}
                                        style={{
                                            background: '#f0fdf4', border: '1px solid #10b981', color: '#10b981',
                                            borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.1rem' }}>🤖</span> Ask AI to explain
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

    // AI Modal State
    const [showAiModal, setShowAiModal] = useState(false);

    return (
        <div className={`student-dashboard ${isDashboardLoaded ? 'dashboard-loaded' : ''}`}>
            {/* FLOATING ACTION BUTTON FOR AI */}
            <button
                onClick={() => setShowAiModal(true)}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    fontSize: '1.5rem', transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Ask AI Assistant"
            >
                <FaRobot />
            </button>

            {/* AI MODAL */}
            {showAiModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                }}>
                    <div style={{ width: '90%', maxWidth: '900px', height: '80%', background: 'white', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <button
                            onClick={() => setShowAiModal(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <VuAiAgent />
                        </div>
                    </div>
                </div>
            )}

            <header className="sd-header">
                <div className="sd-brand-group">
                    <FaBookOpen className="sd-brand-icon" />
                    <h1 className="sd-brand-name">Friendly Notebook</h1>
                </div>

                <div className="sd-text-group">
                    <h2 className="sd-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                        {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}, {userData.studentName.split(' ')[0]}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>
                        {tasks.filter(t => !t.completed).length > 0 ? `You have ${tasks.filter(t => !t.completed).length} tasks due!` : 'You are all caught up! 🌟'}
                    </p>

                    {/* Academic Progress Mini-Bar */}
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                        {/** Use real overviewData.semesterProgress when available; avoid hardcoded demo values */}
                        {(() => {
                            const progress = overviewData && typeof overviewData.semesterProgress === 'number' ? Math.max(0, Math.min(100, overviewData.semesterProgress)) : 0;
                            return (
                                <>
                                    <span>Semester Progress: {progress}%</span>
                                    <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
                <div className="sd-actions">
                    <button onClick={handleSettingsClick} className="btn-icon" title="Settings">
                        <FaCog />
                    </button>

                    <button
                        onClick={() => setView('attendance')}
                        className="btn-icon"
                        title="Attendance"
                        style={{ color: view === 'attendance' ? '#10b981' : 'inherit' }}
                    >
                        <FaUserClock />
                    </button>

                    <button
                        onClick={() => setView('exams')}
                        className="btn-icon"
                        title="Exams & Quizzes"
                        style={{ color: view === 'exams' ? '#10b981' : 'inherit' }}
                    >
                        <FaClipboardCheck />
                    </button>

                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            onClick={() => setShowTaskModal(!showTaskModal)}
                            className="btn-icon"
                            title="Tasks"
                        >
                            <FaClipboardList />
                        </button>
                        {tasks.filter(t => !t.completed).length > 0 &&
                            <span className="msg-badge" style={{ background: '#f59e0b' }}>{tasks.filter(t => !t.completed).length}</span>}

                        {showTaskModal && (
                            <div className="msg-dropdown" style={{ right: '-50px' }}>
                                <div className="msg-header">
                                    <h4>My Tasks</h4>
                                    <button onClick={() => setShowTaskModal(false)}>&times;</button>
                                </div>
                                <div className="msg-list">
                                    {tasks.length > 0 ? (
                                        tasks.map((t, i) => (
                                            <div key={i} className="msg-item" style={{ borderLeft: t.completed ? '3px solid #10b981' : '3px solid #f59e0b' }}>
                                                <div className="msg-date">
                                                    {t.dueDate ? `Due: ${t.dueDate}` : 'No due date'}
                                                    {t.completed && <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>✓ Done</span>}
                                                </div>
                                                <div className="msg-text" style={{ textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#94a3b8' : 'inherit' }}>
                                                    {t.text}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="msg-empty">No tasks assigned</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            onClick={() => {
                                const newVal = !showMsgModal;
                                setShowMsgModal(newVal);
                                if (newVal) {
                                    // Opening: Mark all as read
                                    setUnreadCount(0);
                                    localStorage.setItem('lastReadMsgCount', messages.length.toString());
                                }
                            }}
                            className="btn-icon"
                            title="Messages"
                        >
                            <FaEnvelope />
                        </button>
                        {/* Only show badge if unread > 0 */}
                        {unreadCount > 0 && <span className="msg-badge">{unreadCount}</span>}

                        {/* Messages Dropdown */}
                        {showMsgModal && (
                            <div className="msg-dropdown">
                                <div className="msg-header">
                                    <h4>Messages</h4>
                                    <button onClick={() => setShowMsgModal(false)}>&times;</button>
                                </div>
                                <div className="msg-list">
                                    {messages.length > 0 ? (
                                        messages.map((m, i) => (
                                            <div key={i} className="msg-item" style={{ borderLeft: m.type === 'urgent' ? '4px solid #f43f5e' : m.type === 'reminder' ? '4px solid #f59e0b' : '4px solid #3b82f6' }}>
                                                <div className="msg-date" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>{new Date(m.createdAt || m.date).toLocaleDateString()}</span>
                                                    {m.type && <span style={{
                                                        fontSize: '0.6rem',
                                                        fontWeight: 900,
                                                        textTransform: 'uppercase',
                                                    }}>{m.type}</span>}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#334155', margin: '0.3rem 0' }}>
                                                    {m.sender || 'ADMIN CENTER'} {m.subject ? `• ${m.subject}` : ''}
                                                </div>
                                                <div className="msg-text">{m.message || m.text}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="msg-empty">No transmissions detected</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm('Are you sure you want to logout?')) {
                                if (onLogout) {
                                    onLogout();
                                } else {
                                    // Fallback if prop missing
                                    localStorage.removeItem('studentToken');
                                    localStorage.removeItem('userData');
                                    window.location.reload();
                                }
                            }
                        }}
                        className="btn-logout"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </header>

            {/* Overview / Home View */}
            {view === 'overview' && (
                <main className="sd-main-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '350px 1fr',
                    gap: '2rem',
                    maxWidth: '1600px',
                    margin: '2rem auto',
                    padding: '0 2rem'
                }}>

                    {/* Left Column: Profile & Stats */}
                    <div className="sd-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
                                    position: 'absolute', bottom: '5px', right: '5px', width: '20px', height: '20px',
                                    background: '#10b981', borderRadius: '50%', border: '3px solid white'
                                }}></div>
                            </div>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.2rem' }}>{userData.studentName}</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>ID: {userData.sid} • Year {userData.year} • {userData.branch}</p>

                            <div className="quick-actions-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.8rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div className="q-action-item" style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => setView('schedule')}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>📅</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>SCHEDULE</div>
                                </div>
                                <div className="q-action-item" style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => setView('faculty')}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>👨‍🏫</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>FACULTY</div>
                                </div>
                                <div className="q-action-item" style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => setView('labs')}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>🔬</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>LABS</div>
                                </div>
                                <div className="q-action-item" style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => setView('settings')}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>⚙️</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>SETTINGS</div>
                                </div>
                            </div>

                            <div className="stats-row" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>{overviewData && overviewData.attendance && overviewData.attendance.overall != null ? `${overviewData.attendance.overall}%` : '-'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Attendance</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8b5cf6' }}>{tasks.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tasks</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>{messages.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Msgs</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Announcements Widget */}
                        {/* Academic Pulse - Realtime Stats */}
                        <AcademicPulse data={overviewData || {}} />

                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: '#fef3c7', padding: '4px', borderRadius: '4px' }}>🔔</span> Announcements
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {messages.slice(0, 3).map((msg, i) => (
                                    <div key={i} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#334155' }}>{msg.message || msg.text}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>{new Date(msg.timestamp || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                ))}
                                {messages.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No new announcements.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Main Navigation Cards */}
                    <div className="sd-right-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignContent: 'start' }}>

                        <div className="section-card" onClick={() => { console.log('Navigating to Semester View'); setView('semester'); }}>
                            <div className="section-icon" style={{ background: '#e0f2fe', color: '#0ea5e9', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                <FaBookOpen />
                            </div>
                            <h3>Semester Notes</h3>
                            <p>Access comprehensive notes, video lectures, and previous year question papers.</p>
                            <button className="section-button" onClick={(e) => { e.stopPropagation(); console.log('Button Click: Semester View'); setView('semester'); }}>View Materials →</button>
                        </div>

                        <div className="section-card" onClick={() => setView('ai-assistant')}>
                            <div className="section-icon" style={{ background: '#d1fae5', color: '#10b981', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                <FaRobot />
                            </div>
                            <h3>AI Study Buddy</h3>
                            <p>Get instant answers to your doubts. Your personal AI tutor is available 24/7.</p>
                            <button className="section-button" style={{ background: '#10b981' }}>Ask AI Now →</button>
                        </div>

                        {canViewAdvanced && (
                            <div className="section-card" onClick={() => navigate('/advanced-learning')}>
                                <div className="section-icon" style={{ background: '#f3e8ff', color: '#8b5cf6', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                    <FaRobot />
                                </div>
                                <h3>Advanced Learning</h3>
                                <p>Master Full Stack, AI/ML, and industry skills with curated premium content.</p>
                                <button className="section-button" style={{ background: '#8b5cf6' }}>Launch Hub →</button>
                            </div>
                        )}

                        {/* New Card: Exam Prep */}
                        <div className="section-card" onClick={() => navigate('/interview-qa')}>
                            <div className="section-icon" style={{ background: '#ffedd5', color: '#f97316', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                <FaUserTie />
                            </div>
                            <h3>Interview Prep</h3>
                            <p>Practice common interview questions and mock tests to crack your dream job.</p>
                            <button className="section-button" style={{ background: '#f97316' }}>Start Prep →</button>
                        </div>

                        {/* Quick Access: Overall Performance */}
                        <div className="section-card" onClick={() => setView('attendance')}>
                            <div className="section-icon" style={{ background: '#fee2e2', color: '#ef4444', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                <FaClipboardCheck />
                            </div>
                            <h3>Overall Performance</h3>
                            <p>View comprehensive subject-wise attendance and academic marks.</p>
                            <button className="section-button" style={{ background: '#ef4444' }}>View Analytics →</button>
                        </div>
                    </div>
                </main>
            )}

            {/* Attendance View */}
            {view === 'attendance' && (
                <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <button onClick={() => setView('overview')} className="btn-back" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                            ← Back to Dashboard
                        </button>
                    </div>
                    <StudentAttendanceView studentId={userData.sid} />
                </div>
            )}

            {/* Exams View */}
            {view === 'exams' && (
                <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <button onClick={() => setView('overview')} className="btn-back" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                            ← Back to Dashboard
                        </button>
                    </div>
                    <StudentExams studentData={userData} />
                </div>
            )}

            {/* AI Assistant View */}
            {view === 'ai-assistant' && (
                <div className="animate-fade-in" style={{ padding: '0 2rem 2rem', maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 100px)' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                            ← Back to Dashboard
                        </button>
                    </div>
                    <VuAiAgent />
                </div>
            )}

            {/* Schedule View */}
            {view === 'schedule' && (
                <div className="animate-fade-in" style={{ padding: '0 2rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            ← Back to Dashboard
                        </button>
                    </div>
                    <StudentSchedule studentData={userData} />
                </div>
            )}

            {/* Faculty View */}
            {view === 'faculty' && (
                <div className="animate-fade-in" style={{ padding: '0 2rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            ← Back to Dashboard
                        </button>
                    </div>
                    <StudentFacultyList studentData={userData} />
                </div>
            )}

            {/* Labs View */}
            {view === 'labs' && (
                <div className="animate-fade-in" style={{ padding: '0 2rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            ← Back to Dashboard
                        </button>
                    </div>
                    <StudentLabsSchedule studentData={userData} />
                </div>
            )}

            {/* Academic Browser (The New Navigation System) */}
            {view === 'semester' && (

                <div className="academic-browser fade-in">
                    {/* Navigation Header */}
                    <div className="nav-header">
                        <button className="btn-back-nav" onClick={navPath.length > 0 ? handleBack : resetNavigation}>
                            ← Back
                        </button>
                        <div className="breadcrumbs">
                            {/* Root is always the current Year */}
                            <span className={`crumb ${navPath.length === 0 ? 'active' : ''}`} onClick={() => setNavPath([])}>
                                {`Year ${selectedYear}`}
                            </span>

                            {navPath.map((item, index) => (
                                <React.Fragment key={index}>
                                    <span className="separator">/</span>
                                    <span
                                        className={`crumb ${index === navPath.length - 1 ? 'active' : ''}`}
                                        onClick={() => handleBreadcrumbClick(index)}
                                    >
                                        {item.name}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="nav-content">
                        <h2>{currentViewData.name || 'Select Year'}</h2>
                        {renderContent()}
                    </div>

                    {/* Styles specifically for this view */}

                </div>
            )}

            {view === 'settings' && (
                <div className="settings-view fade-in">
                    <button className="btn-back" onClick={handleBackFromSettings}>← Back to Dashboard</button>
                    <h2>Account Settings</h2>
                    <PasswordSettings onBack={handleBackFromSettings} onProfileUpdate={handleProfileUpdate} userData={userData} />
                </div>
            )}



            {/* About Modal */}
            {showAbout && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)', animation: 'fadeIn 0.4s ease-out'
                }}>
                    <div className="modal-content animate-slide-up" style={{
                        background: 'rgba(255, 255, 255, 0.95)', width: '100%', maxWidth: '440px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'flex', flexDirection: 'column', position: 'relative'
                    }}>
                        <div style={{
                            padding: '2rem 2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <FaBookOpen />
                                </div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Friendly Student</h2>
                            </div>
                            <button onClick={() => setShowAbout(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}>&times;</button>
                        </div>

                        <div style={{ padding: '0 2rem 2rem', overflowY: 'auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
                                <div style={{ width: '100px', height: '100px', margin: '0 auto 1.2rem', borderRadius: '30px', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', background: '#f8fafc' }}>
                                    {userData.profilePic ? (
                                        <img src={userData.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                                            {(userData.studentName || 'S').substring(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h3 style={{ margin: '0 0 0.3rem', color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>{userData.studentName}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{userData.sid} • Year {userData.year}</p>
                            </div>

                            <div style={{ background: 'rgba(99, 102, 241, 0.04)', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                <h4 style={{ color: '#4f46e5', margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Ecosystem Features</h4>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.8rem' }}>
                                    {[
                                        { t: 'Smart Learning Hub', d: 'Personalized academic resources' },
                                        { t: 'AI Study Companion', d: '24/7 instant academic assistance' },
                                        { t: 'Task Maestro', d: 'Seamless deadline & activity tracking' },
                                        { t: 'Resource Vault', d: 'Unlimited access to notes & videos' }
                                    ].map((feat, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div style={{ color: '#10b981', marginTop: '3px' }}>✓</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>{feat.t}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{feat.d}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>POWERED BY</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' }}>FRIENDLY NOTEBOOK</span>
                                    <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: '#6366f1' }}></div>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>v2.5.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Profile Photo Modal (WhatsApp Style) */}
            {showProfilePhotoModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                }} onClick={() => setShowProfilePhotoModal(false)}>
                    <div className="modal-content" style={{
                        background: 'transparent', boxShadow: 'none', border: 'none', width: 'auto', maxWidth: 'none', padding: 0
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ position: 'relative', textAlign: 'center' }}>
                            <div style={{
                                width: '300px', height: '300px', borderRadius: '50%', overflow: 'hidden', border: '4px solid white', margin: '0 auto 2rem', background: '#333'
                            }}>
                                {userData.profilePic ? (
                                    <img src={userData.profilePic} alt="Profile Large" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', color: 'white', background: '#3b82f6' }}>
                                        {(userData.studentName || 'SD').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    className="btn-primary"
                                    onClick={() => { setShowProfilePhotoModal(false); setView('settings'); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#1e293b', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: 600 }}
                                >
                                    <FaUserEdit /> Change Photo
                                </button>
                                {userData.profilePic && (
                                    <button
                                        onClick={() => {
                                            // Simulate removal
                                            if (window.confirm('Remove profile picture?')) {
                                                const updated = { ...userData, profilePic: '' };
                                                setUserData(updated);
                                                localStorage.setItem('user', JSON.stringify(updated));
                                                setShowProfilePhotoModal(false);
                                            }
                                        }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid #ef4444', padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        <FaTrash /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <AnnouncementTicker messages={messages} />
        </div>
    );
}