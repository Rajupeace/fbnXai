import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/apiClient';
import {
    FaGraduationCap, FaChartBar, FaTrophy, FaLightbulb,
    FaLayerGroup, FaRobot, FaFire, FaClipboardList
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';

// Sections
import StudentHeader from './Sections/StudentHeader';
import StudentProfileCard from './Sections/StudentProfileCard';
import AcademicBrowser from './Sections/AcademicBrowser';
import SemesterNotes from './Sections/SemesterNotes';
import SubjectAttendanceMarks from './Sections/SubjectAttendanceMarks';
import AdvancedLearning from './Sections/AdvancedLearning';
import StudentAttendanceView from './StudentAttendanceView';
import StudentExams from './StudentExams';
import StudentFacultyList from './StudentFacultyList';
import StudentSchedule from './StudentSchedule';
import PasswordSettings from '../Settings/PasswordSettings';
import { getYearData } from './branchData';
import NexusCorePulse from './AcademicPulse';

import './StudentDashboard.css';

/**
 * THE ULTIMATE "LUMINA NEXUS" STUDENT DASHBOARD
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
    const [unreadCount, setUnreadCount] = useState(0);

    // Initial load animation
    useEffect(() => {
        const timer = setTimeout(() => setIsDashboardLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // --- DATA FETCHING (MEGA SYNC) ---
    const fetchData = useCallback(async () => {
        try {
            const ovData = await apiGet(`/api/students/${userData.sid}/overview`);
            if (ovData) {
                setOverviewData(ovData);
                if (ovData.student && (ovData.student.name !== userData.studentName)) {
                    setUserData(prev => ({
                        ...prev,
                        studentName: ovData.student.name || prev.studentName,
                        stats: ovData.student.stats || prev.stats
                    }));
                }
            }

            const courseData = await apiGet(`/api/students/${userData.sid}/courses`);
            if (Array.isArray(courseData)) setExtraCourses(courseData);

            const materialsData = await apiGet('/api/materials');
            if (Array.isArray(materialsData)) setServerMaterials(materialsData);

            const tasksData = await apiGet(`/api/todos?role=student`);
            if (Array.isArray(tasksData)) setTasks(tasksData);

            const msgData = await apiGet('/api/messages');
            if (Array.isArray(msgData)) {
                setMessages(msgData);
                const lastCount = Number(localStorage.getItem('lastReadMsgCount') || 0);
                if (msgData.length > lastCount) setUnreadCount(msgData.length - lastCount);
            }
        } catch (e) {
            console.error("Nexus Sync Interrupted:", e);
        }
    }, [userData.sid, userData.studentName]); // Added dependencies

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
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
            { id: `${id}-m4`, name: 'Module 4: Optimization & Security', description: 'Ensuring performance and crystalline stability.' },
            { id: `${id}-m5`, name: 'Module 5: Capstone Synthesis', description: 'Integration of all core competencies.' }
        ];

        // 1. Merge Extra Courses
        extraCourses.forEach(course => {
            if (course.semester) {
                let sem = semesters.find(s => s.sem === Number(course.semester));
                if (!sem) {
                    sem = { sem: Number(course.semester), subjects: [] };
                    semesters.push(sem);
                }
                const existing = sem.subjects.find(s => s.name === course.name);
                if (existing) {
                    existing.modules = course.modules && course.modules.length > 0 ? course.modules : existing.modules;
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

    const NexusStat = ({ icon: Icon, label, value, color, delay, subtext }) => (
        <div className="nexus-stat-v2" style={{ animationDelay: `${delay}s`, '--stat-color': color }}>
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
            {/* Background Neural Network Graphic */}
            <div className="nexus-mesh-bg"></div>

            <header className="hub-header">
                <div className="stat-header-flex">
                    <div>
                        <h2 className="nexus-page-title">NEXUS COMMAND <span>CENTRAL</span></h2>
                        <p className="nexus-page-subtitle sub-text-slate">SYSTEM NOMINAL • SYNCED WITH CAMPUS CLOUD MESH</p>
                    </div>
                    <div className="pulse-compact-indicator">
                        <div className="compact-node">
                            <span className="node-lbl">NETWORK</span>
                            <span className="node-val">99%</span>
                        </div>
                        <div className="compact-node">
                            <span className="node-lbl">ACADEMIC</span>
                            <span className="node-val">82.4%</span>
                        </div>
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
                <NexusStat icon={FaClipboardList} label="Terminal Tasks" value={tasks.filter(t => !t.completed).length} color="#ec4899" delay={0.6} subtext="Action Items" />
            </div>

            <main className="nexus-main-layout">
                <aside className="nexus-sidebar-col">
                    <StudentProfileCard userData={userData} setView={setView} />

                    <div className="nexus-insight-panel">
                        <div className="panel-header">
                            <FaLightbulb /> <span>NEURAL INSIGHTS</span>
                        </div>
                        <div className="panel-body">
                            <p>Current trajectory analysis suggests completing the <strong>{extraCourses[0]?.name || 'Data Structures'}</strong> module by Friday for optimal mastery points.</p>
                            <div className="ai-status-strip">
                                <div className="dot pulse"></div>
                                <span>AGENT NEXUS ACTIVE</span>
                            </div>
                        </div>
                        <button className="panel-action-btn" onClick={() => setShowAiModal(true)}>
                            ENGAGE AI AGENT
                        </button>
                    </div>
                </aside>

                <section className="nexus-content-col">
                    <div className="nexus-browser-wrap">
                        <div className="browser-glass-header">
                            <FaLayerGroup /> <span>CURRICULUM SYNC & PERFORMANCE</span>
                        </div>
                        <SubjectAttendanceMarks overviewData={overviewData} enrolledSubjects={enrolledSubjects} />
                    </div>
                </section>
            </main>
        </div>
    );

    return (
        <div className={`student-dashboard-layout ${isDashboardLoaded ? 'loaded' : ''}`}>

            <StudentHeader
                userData={userData}
                tasks={tasks}
                view={view}
                setView={setView}
                unreadCount={unreadCount}
                onLogout={onLogout}
                toggleTaskModal={() => setView('tasks')} // Placeholder or specific logic
                toggleMsgModal={() => setView('messages')} // Placeholder or specific logic
            />

            <div className="dashboard-content-area">
                {view === 'overview' && renderOverview()}
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
                {view === 'journal' && <SemesterNotes semester={userData.semester || 'Current'} studentData={userData} />}
                {view === 'advanced' && <AdvancedLearning userData={userData} overviewData={overviewData} />}
                {view === 'attendance' && <StudentAttendanceView studentId={userData.sid} />}
                {view === 'exams' && <StudentExams studentData={userData} />}
                {view === 'faculty' && <StudentFacultyList studentData={userData} />}
                {view === 'schedule' && <StudentSchedule studentData={userData} />}
                {view === 'settings' && (
                    <div className="nexus-hub-viewport">
                        <div className="nexus-mesh-bg"></div>
                        <header className="hub-header">
                            <h2 className="nexus-page-title">PROFILE <span>CONFIGURATION</span></h2>
                            <p className="nexus-page-subtitle sub-text-slate">MANAGE YOUR IDENTITY AND SECURE YOUR ACCOUNT</p>
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
                            <h2 className="nexus-page-title">PERFORMANCE <span>MATRIX</span></h2>
                            <p className="nexus-page-subtitle sub-text-slate">DETAILED SUBJECT-WISE PROGRESSION ANALYTICS</p>
                        </header>
                        <SubjectAttendanceMarks overviewData={overviewData} enrolledSubjects={enrolledSubjects} />
                    </div>
                )}
            </div>

            <button className="ai-fab" onClick={() => setShowAiModal(true)}>
                <FaRobot />
                <span className="fab-label">NEXUS AI</span>
            </button>

            {showAiModal && (
                <div className="nexus-modal-overlay" onClick={() => setShowAiModal(false)}>
                    <div className="nexus-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="nexus-modal-close" onClick={() => setShowAiModal(false)}>
                            &times;
                        </button>
                        <VuAiAgent />
                    </div>
                </div>
            )}
        </div>
    );
}