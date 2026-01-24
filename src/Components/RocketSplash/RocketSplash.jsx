import React, { useState, useEffect } from 'react';
import { FaBook, FaPen, FaLaptop, FaGraduationCap, FaFlask, FaBrain, FaLightbulb, FaBookOpen, FaPencilAlt, FaStickyNote, FaCloud, FaSun, FaMoon, FaMeteor } from 'react-icons/fa';
// Removed unused Gi and Md imports entirely as most were unused.
// import { MdMenuBook } from 'react-icons/md'; // Removed problematic import
// FaUserGraduate and FaChalkboardTeacher were listed as unused by user but I see FaUserGraduate used in code? 
// User said: Line 2:126: 'FaUserGraduate' is defined but never used
// Let's check code usage.
// Line 238: <FaGraduationCap ... /> (Wait, that is FaGraduationCap)
// Line 2 (imports): FaUserGraduate is imported but where is it used?
// I don't see FaUserGraduate used in the file body I read.
// I will trust the user ESLint report.
import './RocketSplash.css';

const RocketSplash = ({ onFinish }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [notebookPhase, setNotebookPhase] = useState(0); // 0: closed, 1: opening, 2: reading, 3: learning, 4: portal
    const [particles, setParticles] = useState([]);
    const [stars, setStars] = useState([]);
    const brandName = "FRIENDLY NOTEBOOK";
    const creatorName = "Bobby Martin";

    // Generate starfield
    useEffect(() => {
        const newStars = Array.from({ length: 150 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            animationDuration: Math.random() * 3 + 2,
            animationDelay: Math.random() * 2
        }));
        setStars(newStars);
    }, []);

    // Generate particle system
    useEffect(() => {
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 2 + 1,
            delay: Math.random() * 2
        }));
        setParticles(newParticles);
    }, []);

    const handleNotebook = () => {
        if (notebookPhase === 0) {
            setNotebookPhase(1); // Opening sequence
            setTimeout(() => setNotebookPhase(2), 1500); // Reading
        } else if (notebookPhase === 1) {
            setNotebookPhase(2); // Reading immediately
        } else if (notebookPhase === 2) {
            setNotebookPhase(3); // Learning phase
            setTimeout(() => setNotebookPhase(4), 2000); // Portal transition
        } else if (notebookPhase === 3) {
            setNotebookPhase(4);
            setIsExiting(true);
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 2000);
        }
    };

    return (
        <div className={`notebook-splash-container ${isExiting ? 'exiting' : ''} phase-${notebookPhase}`} onClick={handleNotebook}>
            {/* Dynamic space background */}
            <div className="space-background">
                <div className="nebula"></div>
                <div className="cosmic-dust"></div>
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="star"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            animationDuration: `${star.animationDuration}s`,
                            animationDelay: `${star.animationDelay}s`
                        }}
                    />
                ))}
                <div className="planetary-system">
                    <div className="planet planet-1"></div>
                    <div className="planet planet-2"></div>
                    <div className="planet planet-3"></div>
                    <div className="ring-system"></div>
                </div>
            </div>

            {/* Advanced particle field */}
            <div className={`particle-system ${notebookPhase >= 1 ? 'active' : ''}`}>
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="particle"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animationDuration: `${particle.duration}s`,
                            animationDelay: `${particle.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* Main notebook scene */}
            <div className={`notebook-scene ${notebookPhase >= 1 ? 'opening' : ''} ${notebookPhase >= 2 ? 'reading' : ''} ${notebookPhase >= 3 ? 'learning' : ''}`}>
                {/* Book stand */}
                <div className={`book-stand ${notebookPhase >= 2 ? 'rising' : ''}`}>
                    <div className="stand-platform"></div>
                    <div className="stand-lamp"></div>
                    <div className="stand-books"></div>
                    <div className="stand-light"></div>
                </div>

                {/* Main notebook */}
                <div className={`notebook-assembly ${notebookPhase >= 2 ? 'opening' : ''} ${notebookPhase >= 3 ? 'reading' : ''}`}>
                    <div className="notebook-body">
                        <div className="notebook-cover">
                            <div className="cover-design"></div>
                            <div className="cover-title">
                                <FaBook className="cover-icon" />
                                <span className="title-text">FRIENDLY</span>
                            </div>
                        </div>
                        <div className="notebook-pages">
                            <div className="pages-body">
                                <div className="page-content">
                                    <div className="content-header">
                                        <FaGraduationCap className="header-icon" />
                                        <span className="header-text">FRIENDLY NOTEBOOK SYSTEM</span>
                                    </div>
                                    <div className="content-details">
                                        <div className="detail-item item-1"></div>
                                        <div className="detail-item item-2"></div>
                                        <div className="detail-item item-3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="notebook-spine">
                            <div className="spine-binding"></div>
                            <div className="spine-core"></div>
                        </div>
                    </div>

                    {/* Book accessories */}
                    <div className="book-accessories">
                        <div className="accessory pen-left">
                            <FaPen className="pen-icon" />
                        </div>
                        <div className="accessory pen-right">
                            <FaPencilAlt className="pen-icon" />
                        </div>
                        <div className="accessory bookmark">
                            <FaStickyNote className="bookmark-icon" />
                        </div>
                    </div>

                    {/* Study materials */}
                    <div className={`study-materials ${notebookPhase >= 2 ? 'spreading' : ''}`}>
                        <div className="material material-left">
                            <div className="material-body"></div>
                            <div className="material-icon">
                                <FaLaptop className="laptop-icon" />
                            </div>
                        </div>
                        <div className="material material-right">
                            <div className="material-body"></div>
                            <div className="material-icon">
                                <FaFlask className="flask-icon" />
                            </div>
                        </div>
                    </div>

                    {/* Knowledge particles */}
                    <div className={`knowledge-system ${notebookPhase >= 1 ? 'active' : ''}`}>
                        <div className="main-knowledge">
                            <div className="particle particle-core"></div>
                            <div className="particle particle-inner"></div>
                            <div className="particle particle-outer"></div>
                            <div className="particle particle-glow"></div>
                        </div>
                        <div className="knowledge-particles">
                            {Array.from({ length: 20 }, (_, i) => (
                                <div key={i} className="knowledge-particle" style={{ animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                        <div className="wisdom-trail">
                            {Array.from({ length: 15 }, (_, i) => (
                                <div key={i} className="smoke-puff" style={{ animationDelay: `${i * 0.2}s` }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Learning effects */}
                <div className={`learning-effects ${notebookPhase >= 1 ? 'active' : ''}`}>
                    <div className="knowledge-wave"></div>
                    <div className="study-glow"></div>
                    <div className="page-flip"></div>
                    <div className="wisdom-shimmer"></div>
                </div>

                {/* Educational elements */}
                <div className={`educational-elements ${notebookPhase >= 3 ? 'visible' : ''}`}>
                    <div className="knowledge-ring orbit-1"></div>
                    <div className="knowledge-ring orbit-2"></div>
                    <div className="learning-icon">
                        <FaLightbulb className="lightbulb-icon" />
                    </div>
                    <div className="study-particles">
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="study-particle" style={{ animationDelay: `${i * 0.5}s` }}></div>
                        ))}
                    </div>
                </div>

                {/* Portal effect */}
                <div className={`portal-system ${notebookPhase >= 4 ? 'active' : ''}`}>
                    <div className="portal-ring ring-1"></div>
                    <div className="portal-ring ring-2"></div>
                    <div className="portal-ring ring-3"></div>
                    <div className="portal-core"></div>
                    <div className="portal-energy"></div>
                </div>
            </div>

            {/* Educational HUD */}
            <div className={`telemetry-hud ${notebookPhase >= 1 ? 'online' : ''}`}>
                <div className="hud-panel panel-left">
                    <div className="telemetry-item">
                        <FaBookOpen className="telemetry-icon" />
                        <span className="telemetry-label">PAGES</span>
                        <span className="telemetry-value">{notebookPhase === 0 ? '0' : notebookPhase === 1 ? '25' : notebookPhase === 2 ? '150' : '350'}</span>
                    </div>
                    <div className="telemetry-item">
                        <FaGraduationCap className="telemetry-icon" />
                        <span className="telemetry-label">KNOWLEDGE</span>
                        <span className="telemetry-value">{notebookPhase === 0 ? '0%' : notebookPhase === 1 ? '25%' : notebookPhase === 2 ? '75%' : '100%'}</span>
                    </div>
                </div>
                <div className="hud-panel panel-right">
                    <div className="telemetry-item">
                        <FaBrain className="telemetry-icon" />
                        <span className="telemetry-label">FOCUS</span>
                        <span className="telemetry-value">{notebookPhase === 0 ? '100' : notebookPhase === 1 ? '85' : notebookPhase === 2 ? '45' : '15'}%</span>
                    </div>
                    <div className="telemetry-item">
                        <FaLightbulb className="telemetry-icon" />
                        <span className="telemetry-label">STATUS</span>
                        <span className="telemetry-value status">{notebookPhase === 0 ? 'READY' : notebookPhase === 1 ? 'OPENING' : notebookPhase === 2 ? 'READING' : notebookPhase === 3 ? 'LEARNING' : 'PORTAL'}</span>
                    </div>
                </div>
            </div>

            {/* Brand identity */}
            <div className={`brand-identity ${notebookPhase >= 2 ? 'visible' : ''}`}>
                <div className="brand-logo">
                    <div className="logo-notebook">
                        <FaBook className="logo-icon" />
                    </div>
                    <div className="brand-name">
                        {brandName.split('').map((char, index) => (
                            <span
                                key={index}
                                className="brand-letter"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="creator-info">
                    <span className="creator-label">CREATED BY</span>
                    <span className="creator-name">{creatorName}</span>
                </div>
            </div>

            {/* Study controls */}
            <div className="study-controls">
                <div className="control-button">
                    <div className="button-core">
                        <FaBookOpen className="study-icon" />
                    </div>
                    <div className="button-indicators">
                        <div className={`indicator ${notebookPhase >= 1 ? 'active' : ''}`}></div>
                        <div className={`indicator ${notebookPhase >= 2 ? 'active' : ''}`}></div>
                        <div className={`indicator ${notebookPhase >= 3 ? 'active' : ''}`}></div>
                    </div>
                    <div className="button-text">
                        {notebookPhase === 0 && 'OPEN NOTEBOOK'}
                        {notebookPhase === 1 && 'READING MODE'}
                        {notebookPhase === 2 && 'LEARNING MODE'}
                        {notebookPhase === 3 && 'ENTER PORTAL'}
                    </div>
                </div>
            </div>

            {/* Environmental effects */}
            <div className="environmental-effects">
                <div className="cloud-layer cloud-1">
                    <FaCloud className="cloud-icon" />
                </div>
                <div className="cloud-layer cloud-2">
                    <FaCloud className="cloud-icon" />
                </div>
                <div className="celestial-bodies">
                    <div className="sun">
                        <FaSun className="sun-icon" />
                    </div>
                    <div className="moon">
                        <FaMoon className="moon-icon" />
                    </div>
                    <div className="meteors">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className="meteor">
                                <FaMeteor className="meteor-icon" style={{ animationDelay: `${i * 1.5}s` }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RocketSplash;
