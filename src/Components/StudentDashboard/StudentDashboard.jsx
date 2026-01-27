import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { apiGet } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import {
    FaGraduationCap, FaChartBar, FaTrophy, FaLightbulb,
    FaLayerGroup, FaRobot, FaFire, FaClipboardList, FaBriefcase
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';

// Sections
import StudentSidebar from './Sections/StudentSidebar';
import StudentProfileCard from './Sections/StudentProfileCard';
import AcademicBrowser from './Sections/AcademicBrowser';
import SemesterNotes from './Sections/SemesterNotes';
import SubjectAttendanceMarks from './Sections/SubjectAttendanceMarks';
import AdvancedLearning from './Sections/AdvancedLearning';
import StudentAttendanceView from './StudentAttendanceView';
import StudentExams from './StudentExams';
import StudentFacultyList from './StudentFacultyList';
import StudentSchedule from './StudentSchedule';
import PlacementPrep from './Sections/PlacementPrep';
import StudentRoadmaps from './Sections/StudentRoadmaps';
import StudentAnnouncements from './Sections/StudentAnnouncements';
import PasswordSettings from '../Settings/PasswordSettings';
import { getYearData } from './branchData';
import NexusCorePulse from './AcademicPulse';

import './StudentDashboard.css';
import SkillsRadar from './Sections/SkillsRadar';
import GlobalNotifications from '../GlobalNotifications/GlobalNotifications';
import PersonalDetailsBall from '../PersonalDetailsBall/PersonalDetailsBall';
// StudyTools intentionally removed (unused) to satisfy linting

/**
 * Friendly Notebook Student Dashboard
 * A high-fidelity, interactive workstation for modern students.
 */
export default function StudentDashboard({ studentData, onLogout }) {
    // const navigate = useNavigate(); // Unused

    // Auth & Data Initialization
    let stored = null;
    try {
        stored = (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('userData'))
            ? JSON.parse(window.localStorage.getItem('userData'))
            : null;
    } catch (e) { stored = null; }

    const initialData = { ...(studentData || stored || { studentName: 'Vignan Student', sid: 'STU001', branch: 'CSE', year: 1, section: 'A', role: 'student' }) };
    const branch = String(initialData.branch || 'CSE').toUpperCase();

    // UI & App State
    const [view, setView] = useState('overview');
    const [isDashboardLoaded, setIsDashboardLoaded] = useState(false);
    const [userData, setUserData] = useState(initialData);
    const [overviewData, setOverviewData] = useState(null);
    const [extraCourses, setExtraCourses] = useState([]);
    const [serverMaterials, setServerMaterials] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);

    // Modals & UI Flags
    const [showAiModal, setShowAiModal] = useState(false);
    // Removed showMsgModal/TaskModal as unused
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Initial load animation
    useEffect(() => {
        const timer = setTimeout(() => setIsDashboardLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        try {
            console.log('📊 StudentDashboard: Fetching data from database...');

            const ovData = await apiGet(`/api/students/${userData.sid}/overview`);
            if (ovData) {
                console.log('   ✅ Overview data fetched');
                setOverviewData(ovData);
                // Always sync name and core fields from server when available to avoid stale/demo fallbacks
                if (ovData.student) {
                    setUserData(prev => ({
                        ...prev,
                        studentName: ovData.student.name || prev.studentName,
                        sid: ovData.student.sid || prev.sid,
                        branch: ovData.student.branch || prev.branch,
                        year: ovData.student.year || prev.year,
                        section: ovData.student.section || prev.section,
                        profilePic: ovData.student.profilePic || prev.profilePic,
                        stats: ovData.student.stats || prev.stats
                    }));
                }
            }

            const courseData = await apiGet(`/api/students/${userData.sid}/courses`);
            if (Array.isArray(courseData)) {
                console.log(`   ✅ Courses fetched: ${courseData.length} items`);
                setExtraCourses(courseData);
            }

            const materialsData = await apiGet('/api/materials');
            if (Array.isArray(materialsData)) {
                console.log(`   ✅ Materials fetched: ${materialsData.length} items`);
                setServerMaterials(materialsData);
            }

            const tasksData = await apiGet(`/api/todos?role=student`);
            if (Array.isArray(tasksData)) {
                console.log(`   ✅ Tasks fetched: ${tasksData.length} items`);
                setTasks(tasksData);
            }

            const msgData = await apiGet('/api/messages');
            if (Array.isArray(msgData)) {
                console.log(`   ✅ Messages fetched: ${msgData.length} items`);
                setMessages(msgData);
            }

            console.log('✅ StudentDashboard: All data loaded successfully');
        } catch (e) {
            console.error("❌ StudentDashboard: Sync Failed:", e);
        }
    }, [userData.sid]);

    useEffect(() => {
        console.log('🚀 StudentDashboard: Initial data load started');
        fetchData();

        // Optimized polling: 5 seconds (more efficient than 2s)
        const interval = setInterval(() => {
            console.log('🔄 StudentDashboard: Polling data from database...');
            fetchData();
        }, 5000);

        // Fast messages update every 5s
        const msgInterval = setInterval(async () => {
            try {
                const query = new URLSearchParams({
                    userId: userData.sid,
                    role: 'student',
                    year: userData.year,
                    section: userData.section
                }).toString();
                const msgData = await apiGet(`/api/messages?${query}`);
                if (Array.isArray(msgData)) {
                    setMessages(msgData.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)));
                }
            } catch (e) {
                console.debug('Messages update failed', e);
            }
        }, 5000);

        return () => {
            console.log('🛑 StudentDashboard: Cleaning up intervals');
            clearInterval(interval);
            clearInterval(msgInterval);
        };
    }, [fetchData, userData.sid, userData.year, userData.section]);

    // SSE real-time updates for student data
    useEffect(() => {
        try {
            const unsub = sseClient.onUpdate((ev) => {
                if (!ev || !ev.resource) return;
                if (['materials', 'messages', 'courses'].includes(ev.resource)) {
                    fetchData();
                }
            });
            return unsub;
        } catch (e) {
            console.debug('SSE client error', e);
        }
    }, [fetchData]);

    // --- CURRICULUM LOGIC ---
    const selectedYear = userData.year || 1;
    const yearData = useMemo(() => {
        let base = getYearData(branch, selectedYear);
        const semesters = JSON.parse(JSON.stringify(base.semesters || []));

        const generateDefaultModules = (id) => [
            { id: `${id}-m1`, name: 'Module 1: Fundamental Concepts', description: 'Core principles and architectural basics.' },
            { id: `${id}-m2`, name: 'Module 2: Structural Analysis', description: 'Deep dive into patterns and structural logic.' },
            { id: `${id}-m3`, name: 'Module 3: Advanced Implementation', description: 'Real-world application and system scaling.' },
            { id: `${id}-m4`, name: 'Module 4: Optimization & Security', description: 'Ensuring performance and stability.' },
            { id: `${id}-m5`, name: 'Module 5: Capstone Synthesis', description: 'Integration of all core competencies.' }
        ];

        // 1. Merge Extra Courses
        extraCourses.forEach(course => {
            // Filter by Section
            const courseSection = course.section || 'All';
            if (courseSection !== 'All' && courseSection !== userData.section) return;

            if (course.semester) {
                let sem = semesters.find(s => s.sem === Number(course.semester));
                if (!sem) {
                    sem = { sem: Number(course.semester), subjects: [] };
                    semesters.push(sem);
                }
                const existing = sem.subjects.find(s =>
                    s.name.toLowerCase() === course.name.toLowerCase() ||
                    (s.code && course.code && s.code.toLowerCase() === course.code.toLowerCase())
                );
                if (existing) {
                    existing.modules = course.modules && course.modules.length > 0 ? course.modules : existing.modules;
                    if (course.code) existing.code = course.code;
                } else {
                    sem.subjects.push({
                        id: course.id || course._id || `dyn-${course.code}`,
                        name: course.name,
                        code: course.courseCode || course.code,
                        modules: course.modules && course.modules.length > 0 ? course.modules : generateDefaultModules(course.id || course.code)
                    });
                }
            }
        });

        // 2. Merge Server Materials
        serverMaterials.forEach(m => {
            if (m.year && m.year !== 'All' && String(m.year) !== String(selectedYear)) return;
            const mBranch = (m.branch || 'All').toLowerCase();
            if (mBranch !== 'all' && mBranch !== branch.toLowerCase()) return;

            const studentSec = String(userData.section || 'A').toUpperCase();
            const mSec = m.section;
            let sectionMatch = !mSec || mSec === 'All' || mSec === studentSec;
            if (!sectionMatch) {
                if (Array.isArray(mSec)) sectionMatch = mSec.includes(studentSec);
                else if (typeof mSec === 'string') {
                    sectionMatch = mSec.split(',').map(s => s.trim().toUpperCase()).includes(studentSec);
                }
            }
            if (!sectionMatch) return;

            if (m.subject && m.semester) {
                let sem = semesters.find(s => s.sem === Number(m.semester));
                if (!sem) {
                    sem = { sem: Number(m.semester), subjects: [] };
                    semesters.push(sem);
                }
                if (!sem.subjects.find(s =>
                    s.name.toUpperCase() === m.subject.toUpperCase() ||
                    (s.code && s.code.toUpperCase() === m.subject.toUpperCase())
                )) {
                    sem.subjects.push({
                        id: `shadow-${m.subject}`,
                        name: m.subject,
                        code: 'EXT-RES',
                        modules: generateDefaultModules(`shadow-${m.subject}`)
                    });
                }
            }
        });

        return { semesters };
    }, [extraCourses, serverMaterials, branch, selectedYear, userData.section]);

    const enrolledSubjects = useMemo(() => {
        return (yearData.semesters || []).flatMap(s => s.subjects || []);
    }, [yearData]);

    const NexusStat = ({ icon: Icon, label, value, color, delay, subtext, onClick }) => (
        <div className="nexus-stat-v2" style={{ animationDelay: `${delay}s`, '--stat-color': color, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
            <div className="stat-glow"></div>
            <div className="stat-content">
                <div className="stat-icon-group">
                    <div className="icon-platform" style={{ background: `${color}15`, color }}>
                        <Icon />
                    </div>
                </div>
                <div className="stat-details">
                    <span className="stat-label-v2">{label}</span>
                    <div className="nexus-stat-flex">
                        <span className="stat-value-v2">{value}</span>
                        {subtext && <span className="stat-trend">{subtext}</span>}
                    </div>
                </div>
            </div>
            <div className="stat-progress-trace">
                <div className="trace-bar" style={{ background: color }}></div>
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="nexus-hub-viewport">
            {/* Background Graphic */}
            <div className="nexus-mesh-bg"></div>

            <header className="hub-header">
                <div className="stat-header-flex">
                    <div>
                        <h2 className="nexus-page-title">FRIENDLY <span>NOTEBOOK</span></h2>
                        <p className="nexus-page-subtitle sub-text-slate">Welcome to your personal learning space.</p>
                    </div>
                    <div className="header-date-display" style={{ marginLeft: 'auto', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '2rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e293b' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </div>

                </div>
            </header>

            <div className="pad-x-2-mb-4">
                <NexusCorePulse data={overviewData} />
            </div>

            <div className="nexus-stats-grid">
                <NexusStat icon={FaGraduationCap} label="Total Courses" value={enrolledSubjects.length} color="#6366f1" delay={0.1} subtext="Active Syllabus" />
                <NexusStat icon={FaChartBar} label="Semester Load" value={`${overviewData?.semesterProgress || 0}%`} color="#10b981" delay={0.2} subtext="Time Elapsed" />
                <NexusStat icon={FaTrophy} label="Rank Score" value={overviewData?.student?.stats?.cgpa ? (overviewData.student.stats.cgpa * 10).toFixed(1) : '8.2'} color="#f59e0b" delay={0.3} subtext="Current CGPA" />
                <NexusStat icon={FaFire} label="Study Streak" value={`${overviewData?.activity?.streak || 0} Days`} color="#f97316" delay={0.4} subtext="Daily Activity" />
                <NexusStat icon={FaRobot} label="AI Insights" value={overviewData?.activity?.aiUsage || 0} color="#0ea5e9" delay={0.5} subtext="Sessions Active" />
                <NexusStat icon={FaBriefcase} label="Placement" value="4 MNCs" color="#8b5cf6" delay={0.55} subtext="Interview Prep" onClick={() => setView('placement')} />
                <NexusStat icon={FaClipboardList} label="Tasks" value={tasks.filter(t => !t.completed).length} color="#ec4899" delay={0.6} subtext="Action Items" />
            </div>

            <main className="nexus-main-layout">
                <aside className="nexus-sidebar-col">
                    <StudentProfileCard userData={userData} setView={setView} />
                    <SkillsRadar studentData={userData} />

                    <div className="nexus-insight-panel">
                        <div className="panel-header">
                            <FaBriefcase /> <span>Career Tracker</span>
                        </div>
                        <div className="panel-body" style={{ marginBottom: '1rem' }}>
                            <p>Prepare for <strong>TCS, Infosys, and Accenture</strong>. Access 50+ interview questions.</p>
                            <button className="panel-action-btn" onClick={() => setView('placement')} style={{ marginTop: '0.5rem', width: '100%', padding: '0.6rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                OPEN PRACTICE HUB
                            </button>
                        </div>

                        <div className="panel-header">
                            <FaLightbulb /> <span>Student Insights</span>
                        </div>
                        <div className="panel-body">
                            <p>Current analysis suggests completing the <strong>{extraCourses[0]?.name || 'Data Structures'}</strong> module by Friday for optimal learning.</p>
                            <div className="ai-status-strip">
                                <div className="dot pulse"></div>
                                <span>AI TUTOR READY</span>
                            </div>
                        </div>
                        <button className="panel-action-btn" onClick={() => setShowAiModal(true)}>

                        </button>
                    </div>
                </aside>

                <section className="nexus-content-col">
                    <div className="nexus-browser-wrap">
                        <div className="browser-glass-header">
                            <FaLayerGroup /> <span>Your Academic Progress</span>
                        </div>
                        <SubjectAttendanceMarks overviewData={overviewData} enrolledSubjects={enrolledSubjects} />
                    </div>
                </section>
            </main>
        </div>
    );

    const [focusMode] = useState(false);

    return (
        <div className={`student-dashboard-layout ${isDashboardLoaded ? 'loaded' : ''} ${focusMode ? 'focus-active' : ''}`}>

            {!focusMode && (
                <StudentSidebar
                    userData={userData}
                    view={view}
                    setView={setView}
                    collapsed={sidebarCollapsed}
                    setCollapsed={setSidebarCollapsed}
                    onLogout={onLogout}
                />
            )}

            <div className="dashboard-content-area">
                {view === 'overview' && renderOverview()}

                {view === 'announcements' && (
                    <div className="nexus-page-container">
                        <StudentAnnouncements messages={messages} userData={userData} />
                    </div>
                )}

                {view === 'semester' && (
                    <div className="nexus-page-container">
                        <AcademicBrowser
                            yearData={yearData}
                            selectedYear={selectedYear}
                            serverMaterials={serverMaterials}
                            userData={userData}
                            setView={setView}
                            branch={branch}
                        />
                    </div>
                )}

                {view === 'journal' && (
                    <div className="nexus-page-container">
                        <SemesterNotes
                            semester={userData.semester || 'Current'}
                            studentData={userData}
                            enrolledSubjects={enrolledSubjects}
                        />
                    </div>
                )}

                {view === 'advanced' && (
                    <div className="nexus-page-container">
                        <AdvancedLearning userData={userData} overviewData={overviewData} />
                    </div>
                )}

                {view === 'attendance' && (
                    <div className="nexus-page-container">
                        <StudentAttendanceView studentId={userData.sid} />
                    </div>
                )}

                {view === 'exams' && (
                    <div className="nexus-page-container">
                        <StudentExams studentData={userData} />
                    </div>
                )}

                {view === 'faculty' && (
                    <div className="nexus-page-container">
                        <StudentFacultyList studentData={userData} />
                    </div>
                )}

                {view === 'schedule' && (
                    <div className="nexus-page-container">
                        <StudentSchedule studentData={userData} />
                    </div>
                )}

                {view === 'placement' && (
                    <div className="nexus-page-container">
                        <PlacementPrep userData={userData} />
                    </div>
                )}

                {view === 'roadmaps' && (
                    <div className="nexus-page-container">
                        <StudentRoadmaps />
                    </div>
                )}

                {view === 'settings' && (
                    <div className="nexus-hub-viewport">
                        <div className="nexus-mesh-bg"></div>
                        <header className="hub-header">
                            <h2 className="nexus-page-title">Profile <span>Settings</span></h2>
                            <p className="nexus-page-subtitle sub-text-slate">Manage your account settings</p>
                        </header>

                        <div className="nexus-browser-wrap min-h-auto">
                            <PasswordSettings
                                userData={userData}
                                onBack={() => setView('overview')}
                                onProfileUpdate={setUserData}
                            />
                        </div>
                    </div>
                )}

                {view === 'marks' && (
                    <div className="nexus-hub-viewport">
                        <div className="nexus-mesh-bg"></div>
                        <header className="hub-header">
                            <h2 className="nexus-page-title">Grades & <span>Attendance</span></h2>
                            <p className="nexus-page-subtitle sub-text-slate">View your detailed progress</p>
                        </header>
                        <SubjectAttendanceMarks overviewData={overviewData} enrolledSubjects={enrolledSubjects} />
                    </div>
                )}

                {view === 'ai-agent' && (
                    <div className="nexus-hub-viewport" style={{ padding: '0 2rem', height: 'calc(100vh - 100px)' }}>
                        <div className="nexus-mesh-bg"></div>
                        <header className="hub-header" style={{ marginBottom: '1.5rem' }}>
                            <h2 className="nexus-page-title">AI <span>TUTOR</span></h2>
                            <p className="nexus-page-subtitle sub-text-slate">Your Personal Academic Assistant</p>
                        </header>
                        <div style={{ flex: 1, height: '100%', paddingBottom: '2rem' }}>
                            <VuAiAgent onNavigate={setView} />
                        </div>
                    </div>
                )}
            </div>

            <button className="ai-fab" onClick={() => setShowAiModal(true)}>
                <FaRobot />
                <span className="fab-label">AI Tutor</span>
            </button>

            {showAiModal && (
                <div className="nexus-modal-overlay" onClick={() => setShowAiModal(false)}>
                    <div className="nexus-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="nexus-modal-close" onClick={() => setShowAiModal(false)}>
                            &times;
                        </button>
                        <VuAiAgent onNavigate={(target) => { setView(target); setShowAiModal(false); }} />
                    </div>
                </div>
            )}

            <PersonalDetailsBall role="student" data={userData} />
            <GlobalNotifications userRole="student" userData={userData} />
        </div>
    );
}