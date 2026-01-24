import React, { useState, useEffect } from 'react';
import { FaFlask, FaClock, FaMapMarkerAlt, FaChalkboardTeacher, FaMicrochip, FaCubes, FaArrowRight, FaTools } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';

/**
 * NEXUS FORGE (Laboratory Schedule)
 * A high-fidelity interface for technical workshops and laboratory sessions.
 */
const StudentLabsSchedule = ({ studentData }) => {
    const [labSchedule, setLabSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabSchedule = async () => {
            setLoading(true);
            try {
                const response = await apiGet(`/api/labs/schedule?year=${studentData.year}&section=${studentData.section}&branch=${studentData.branch}`);
                setLabSchedule(response || []);
            } catch (error) {
                console.error('Forge Sync Failed:', error);
                setLabSchedule([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLabSchedule();
    }, [studentData]);

    if (loading) {
        return (
            <div className="nexus-schedule-loading">
                <div className="nexus-loading-ring warning"></div>
                <div className="loading-text warning">CALIBRATING LAB INSTRUMENTS...</div>
            </div>
        );
    }

    return (
        <div className="nexus-page-container">
            {/* Header Area */}
            <div className="nexus-page-header">
                <div>
                    <div className="nexus-page-subtitle text-forge-pri">
                        <FaMicrochip /> Applied Engineering
                    </div>
                    <h1 className="nexus-page-title">
                        NEXUS <span className="text-forge-pri">FORGE</span>
                    </h1>
                </div>
                <div className="header-forge-right">
                    <div className="forge-count">{labSchedule.length} WORKSHOPS</div>
                    <div className="forge-status">SYSTEMS READY</div>
                </div>
            </div>

            {/* Forge Guidelines */}
            <div className="forge-guidelines">
                <div className="guideline-icon"><FaTools /></div>
                <div>
                    <h4 className="forge-op-title">OPERATIONAL DIRECTIVE</h4>
                    <p className="forge-op-desc">
                        Arrive precisely 10 cycles early. Neural links and hardware kits must be verified. All workstations are initialized with the latest firmware.
                    </p>
                </div>
            </div>

            {/* Lab Matrix */}
            <div className="forge-list">
                {labSchedule.length > 0 ? labSchedule.map((lab, index) => (
                    <div key={index} className="forge-card">
                        <div className="card-top">
                            <div className="lab-identity">
                                <div className="lab-icon-box"><FaFlask /></div>
                                <div>
                                    <h3>{lab.labName}</h3>
                                    <span className="batch-tag">BATCH: {lab.batch}</span>
                                </div>
                            </div>
                            <div className="lab-timing">
                                <div className="t-day">{lab.day.toUpperCase()}</div>
                                <div className="t-time"><FaClock /> {lab.time}</div>
                            </div>
                        </div>

                        <p className="lab-desc">{lab.description || 'Advanced technical session involving hands-on system implementation and architectural analysis.'}</p>

                        <div className="lab-nodes">
                            <div className="node">
                                <span className="n-label">COMMANDER</span>
                                <div className="n-main">
                                    <FaChalkboardTeacher /> <span>{lab.faculty}</span>
                                </div>
                            </div>
                            <div className="node">
                                <span className="n-label">COORDINATES</span>
                                <div className="n-main">
                                    <FaMapMarkerAlt /> <span>{lab.room}</span>
                                </div>
                            </div>
                        </div>

                        <div className="lab-tools-list">
                            <div className="tools-title"><FaCubes /> RESOURCE KIT</div>
                            <div className="tools-ribbon">
                                {(lab.tools || ['IDE', 'Debugger', 'Neural SDK']).map((tool, ti) => (
                                    <span key={ti} className="tool-pill">{tool}</span>
                                ))}
                            </div>
                        </div>

                        <button className="forge-launch-btn">ENTER WORKSTATION <FaArrowRight /></button>
                    </div>
                )) : (
                    <div className="nexus-empty-forge">
                        <FaFlask className="forge-empty-icon" />
                        <h3>FORGE DEACTIVATED</h3>
                        <p className="forge-empty-msg">No workshops are currently scheduled for your sector. The forge is currently in maintenance mode.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentLabsSchedule;
