import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/apiClient';
import { FaSignOutAlt, FaRobot } from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import StudentAttendanceView from './StudentAttendanceView';
import StudentExams from './StudentExams';
import './StudentDashboard.css';
import sseClient from '../../utils/sseClient';
import AnnouncementTicker from '../AnnouncementTicker/AnnouncementTicker';

// Sections
import StudentHeader from './Sections/StudentHeader';
import StudentProfileCard from './Sections/StudentProfileCard';
import AcademicBrowser from './Sections/AcademicBrowser';


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
    }, [data.sid, userData.studentName, userData.year]); // Added userData deps to prevent stale closures if needed? actually checking mounted is enough but safer.

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
                const filtered = allMsgs.filter(m => {
                    // 1. Global / All Students
                    if (m.target === 'all' || m.target === 'students') {
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

                // Don't auto-update unread count if modal is open, or do? kept original logic
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


    const handleSettingsClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setView('settings');
        // Scroll to top to ensure settings are visible
        window.scrollTo(0, 0);
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

            {view === 'ai-assistant' && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'white' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                        <h3>AI Assistant</h3>
                        <button onClick={() => setView('overview')} style={{ padding: '0.5rem 1rem' }}>Close</button>
                    </div>
                    <VuAiAgent />
                </div>
            )}

            <StudentHeader
                userData={userData}
                tasks={tasks}
                view={view}
                setView={setView}
                showTaskModal={showTaskModal}
                setShowTaskModal={setShowTaskModal}
                showMsgModal={showMsgModal}
                setShowMsgModal={setShowMsgModal}
                unreadCount={unreadCount}
                setUnreadCount={setUnreadCount}
                messages={messages}
                onLogout={onLogout}
                toggleTaskModal={() => setShowTaskModal(!showTaskModal)}
                toggleMsgModal={() => {
                    const newVal = !showMsgModal;
                    setShowMsgModal(newVal);
                    if (newVal) {
                        setUnreadCount(0);
                        localStorage.setItem('lastReadMsgCount', messages.length.toString());
                    }
                }}
            />

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
                        <StudentProfileCard
                            userData={userData}
                            setShowProfilePhotoModal={setShowProfilePhotoModal}
                        />

                        {/* Stats could be another component, but let's keep it here for now or extract if we have time. 
                             Actually, the original had just some placeholders or charts.
                         */}
                    </div>

                    {/* Right Column: Academic Browser */}
                    <div className="sd-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <AcademicBrowser
                            yearData={yearData}
                            selectedYear={selectedYear}
                            serverMaterials={serverMaterials}
                            userData={userData}
                            setView={setView}
                            branch={branch}
                        />
                    </div>
                </main>
            )}

            {/* Other Views */}
            {view === 'attendance' && <StudentAttendanceView studentId={userData.sid} />}
            {view === 'exams' && <StudentExams studentId={userData.sid} />}
            {/* Settings view, etc */}
            {view === 'settings' && (
                <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                    <button onClick={() => setView('overview')} className="btn-secondary">Back</button>
                    <h2>Settings</h2>
                    <p>Settings panel here...</p>
                </div>
            )}

            {/* Announcement Ticker - Live Updates */}
            <AnnouncementTicker messages={messages} />

        </div>
    );
}