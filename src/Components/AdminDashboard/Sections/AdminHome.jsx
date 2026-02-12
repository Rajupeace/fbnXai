import React from 'react';
import {
    FaUserGraduate, FaChalkboardTeacher, FaBook, FaLayerGroup,
    FaCreditCard, FaRobot, FaCheckCircle
} from 'react-icons/fa';
import SystemTelemetry from '../SystemTelemetry';
import SystemIntelligence from '../SystemIntelligence';
import SystemNodeMap from '../SystemNodeMap';
import './AdminHome.css';

/**
 * ADMIN COMMAND CENTER (OVERVIEW)
 */
const AdminHome = ({
    students = [],
    faculty = [],
    courses = [],
    materials = [],
    fees = [],
    todos = [],
    setActiveSection,
    openAiWithPrompt
}) => {
    const revenue = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const pendingTasks = todos.filter(t => !t.completed).length;

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'MORNING';
        if (hour < 18) return 'AFTERNOON';
        return 'EVENING';
    };

    return (
        <div className="admin-home-viewport">
            <header className="admin-hero-header">
                <div className="admin-hero-content">
                    <h1 className="animate-slide-up">GOOD {getTimeGreeting()}, <span>COMMANDER</span></h1>
                    <p className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        System status: <strong>Optimal</strong>. You have <strong>{pendingTasks} urgent tasks</strong> requiring attention.
                    </p>
                </div>
                <div className="admin-live-clock animate-fade-in">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </header>

            {/* 🛡️ Nexus Oversight: Live Telemetry */}
            <section className="nexus-oversight animate-slide-up" style={{ animationDelay: '0.2s', marginTop: '2.5rem' }}>
                <div className="section-header-minimal">
                    <h3>SYSTEM PULSE <span>LIVE INFRASTRUCTURE</span></h3>
                </div>
                <SystemTelemetry />
                <SystemNodeMap
                    studentsCount={students.length}
                    facultyCount={faculty.length}
                    materialsCount={materials.length}
                />
            </section>

            <div className="admin-bento-grid">
                {/* 📊 High Level Stats */}
                <div className="admin-bento-card stat-card blue animate-bento" style={{ animationDelay: '0.1s' }} onClick={() => setActiveSection('students')}>
                    <div className="stat-icon-box"><FaUserGraduate /></div>
                    <div className="stat-content">
                        <div className="stat-val">{students.length}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                    <div className="stat-footer-bar" style={{ width: '85%' }}></div>
                </div>

                <div className="admin-bento-card stat-card green animate-bento" style={{ animationDelay: '0.2s' }} onClick={() => setActiveSection('faculty')}>
                    <div className="stat-icon-box"><FaChalkboardTeacher /></div>
                    <div className="stat-content">
                        <div className="stat-val">{faculty.length}</div>
                        <div className="stat-label">Active Faculty</div>
                    </div>
                </div>

                <div className="admin-bento-card stat-card orange animate-bento" style={{ animationDelay: '0.3s' }} onClick={() => setActiveSection('courses')}>
                    <div className="stat-icon-box"><FaBook /></div>
                    <div className="stat-content">
                        <div className="stat-val">{courses.filter(c => c.code !== 'EMPTY__OVERRIDE').length}</div>
                        <div className="stat-label">Subjects</div>
                    </div>
                </div>

                <div className="admin-bento-card stat-card purple animate-bento" style={{ animationDelay: '0.4s' }} onClick={() => setActiveSection('fees')}>
                    <div className="stat-icon-box"><FaCreditCard /></div>
                    <div className="stat-content">
                        <div className="stat-val">₹{(revenue / 1000).toFixed(1)}K</div>
                        <div className="stat-label">Net Revenue</div>
                    </div>
                </div>

                {/* 🛠️ Management Hub */}
                <div className="admin-bento-card manage-hub animate-bento" style={{ animationDelay: '0.5s', gridColumn: 'span 2', gridRow: 'span 2' }}>
                    <div className="hub-header">
                        <h3><FaLayerGroup /> OPERATION HUB</h3>
                        <button className="hub-btn" onClick={() => setActiveSection('materials')}>SYSTEM FILES</button>
                    </div>
                    <div className="hub-body">
                        <div className="hub-item" onClick={() => setActiveSection('students')}>
                            <div className="hub-indicator students"></div>
                            <h4>STUDENTS DATA</h4>
                            <p>Manage enrollment and files</p>
                        </div>
                        <div className="hub-item" onClick={() => setActiveSection('faculty')}>
                            <div className="hub-indicator faculty"></div>
                            <h4>FACULTY NODES</h4>
                            <p>Teaching assignments and access</p>
                        </div>
                        <div className="hub-item" onClick={() => setActiveSection('courses')}>
                            <div className="hub-indicator courses"></div>
                            <h4>CURRICULUM ARCH</h4>
                            <p>Syllabus and subject map</p>
                        </div>
                    </div>
                </div>

                {/* ✅ Task Queue */}
                <div className="admin-bento-card task-hub animate-bento" style={{ animationDelay: '0.6s', gridColumn: 'span 2', gridRow: 'span 2' }}>
                    <div className="hub-header">
                        <h3><FaCheckCircle /> TASK PIPELINE</h3>
                        <button className="hub-btn" onClick={() => setActiveSection('todos')}>CALENDAR</button>
                    </div>
                    <div className="task-list">
                        {todos.filter(t => !t.completed).slice(0, 4).map(t => (
                            <div key={t.id} className="admin-task-node">
                                <div className="task-priority-dot"></div>
                                <div className="task-info">
                                    <div className="task-text">{t.text}</div>
                                    <div className="task-meta">Due: {new Date(t.date || Date.now()).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                        {pendingTasks === 0 && (
                            <div className="admin-empty-state">
                                <FaCheckCircle size={40} color="#10b981" />
                                <p>ALL SYSTEMS UPDATED</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 🌌 AI Assistant Banner */}
                <div className="admin-bento-card ai-banner animate-bento" style={{ gridColumn: 'span 4', animationDelay: '0.7s' }}>
                    <div className="ai-banner-content">
                        <div className="ai-icon-large">
                            <FaRobot />
                        </div>
                        <div className="ai-text-hub">
                            <h3>NEXUS AI ASSISTANT</h3>
                            <p>Automate administrative reports, analyze student performance, and generate schedules instantly.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="ai-launch-btn" style={{ background: 'var(--admin-secondary)', color: 'white' }} onClick={() => {
                                const prompt = `Nexus System Diagnostic Report Request: 
                                - Total Students: ${students.length}
                                - Active Faculty: ${faculty.length}
                                - Total Subjects: ${courses.filter(c => c.code !== 'EMPTY__OVERRIDE').length}
                                - Net Revenue: ₹${revenue.toLocaleString()}
                                Please provide a comprehensive system health assessment and recommendations for administrative optimization.`;
                                openAiWithPrompt(prompt);
                            }}>
                                RUN SYSTEM DIAGNOSTIC
                            </button>
                            <button className="ai-launch-btn" onClick={() => setActiveSection('ai-agent')}>LAUNCH AGENT</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🧠 Intelligence Layer: Auto-Analytics */}
            <section className="nexus-oversight animate-slide-up" style={{ animationDelay: '0.8s', marginTop: '4rem' }}>
                <div className="section-header-minimal">
                    <h3>NEXUS INTELLIGENCE <span>LEARNING ANALYTICS</span></h3>
                </div>
                <SystemIntelligence />
            </section>
        </div>
    );
};

export default AdminHome;
