import React, { useState } from 'react';
import { FaBook, FaPen, FaLaptop, FaFlask, FaFilm, FaGraduationCap, FaMicroscope, FaAtom, FaDna, FaBrain, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import './RocketSplash.css';

const RocketSplash = ({ onFinish }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [tapState, setTapState] = useState(0); // 0: initial, 1: centered, 2: open, 3: exiting
    const brandName = "Friendly Notebook";
    const creatorName = "Bobby Martin";

    const handleEnter = () => {
        if (tapState === 0) {
            setTapState(1); // 360 rotation and center
        } else if (tapState === 1) {
            setTapState(2); // Open book with 3D page animations
        } else if (tapState === 2) {
            setTapState(3);
            setIsExiting(true);
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 1800);
        }
    };

    return (
        <div className={`book-splash-container ${isExiting ? 'exit-active' : ''} tap-${tapState}`} onClick={handleEnter}>
            {/* Light, airy background with floating educational icons */}
            <div className="light-bg">
                <div className="bg-gradient"></div>
                <div className="light-rays"></div>
                <div className="floating-icons">
                    <div className="float-icon pen-1"><FaPen /></div>
                    <div className="float-icon laptop-1"><FaLaptop /></div>
                    <div className="float-icon book-1"><FaBook /></div>
                    <div className="float-icon flask-1"><FaFlask /></div>
                    <div className="float-icon movie-1"><FaFilm /></div>
                    <div className="float-icon cap-1"><FaGraduationCap /></div>
                    <div className="float-icon microscope-1"><FaMicroscope /></div>
                    <div className="float-icon atom-1"><FaAtom /></div>
                    <div className="float-icon dna-1"><FaDna /></div>
                    <div className="float-icon brain-1"><FaBrain /></div>
                    <div className="float-icon teacher-1"><FaChalkboardTeacher /></div>
                    <div className="float-icon student-1"><FaUserGraduate /></div>
                </div>
            </div>

            {/* Realistic book on table with 360 effect */}
            <div className={`book-scene ${tapState >= 1 ? 'centered' : ''} ${tapState === 1 ? 'rotating' : ''}`}>
                <div className="table-surface"></div>
                <div className={`book-container ${tapState >= 2 ? 'open' : ''} ${tapState === 1 ? 'spinning' : ''}`}>
                    <div className="book">
                        <div className="book-cover">
                            <div className="cover-front">
                                <FaBook className="cover-icon" />
                                <div className="cover-title">Friendly Notebook</div>
                            </div>
                            <div className="cover-spine"></div>
                            <div className="cover-back"></div>
                        </div>
                        <div className="book-pages">
                            {/* Left side pages */}
                            <div className="page page-left-1">
                                <div className="page-content">
                                    <FaPen className="page-icon" />
                                    <h3>Welcome</h3>
                                    <p>Start your journey...</p>
                                </div>
                            </div>
                            <div className="page page-left-2">
                                <div className="page-content">
                                    <FaLaptop className="page-icon" />
                                    <h3>Discover</h3>
                                    <p>Explore knowledge...</p>
                                </div>
                            </div>
                            <div className="page page-left-3">
                                <div className="page-content">
                                    <FaFlask className="page-icon" />
                                    <h3>Experiment</h3>
                                    <p>Hands-on learning...</p>
                                </div>
                            </div>
                            {/* Right side pages */}
                            <div className="page page-right-1">
                                <div className="page-content">
                                    <FaFilm className="page-icon" />
                                    <h3>Learn</h3>
                                    <p>Multimedia lessons...</p>
                                </div>
                            </div>
                            <div className="page page-right-2">
                                <div className="page-content">
                                    <FaGraduationCap className="page-icon" />
                                    <h3>Achieve</h3>
                                    <p>Reach your goals...</p>
                                </div>
                            </div>
                            <div className="page page-right-3">
                                <div className="page-content">
                                    <FaMicroscope className="page-icon" />
                                    <h3>Explore</h3>
                                    <p>Deep science...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="book-shadow"></div>
                    {/* 360 rotation glow effect */}
                    <div className={`rotation-glow ${tapState === 1 ? 'active' : ''}`}></div>
                </div>
                {/* Enhanced 3D effects */}
                <div className={`light-burst ${tapState >= 2 ? 'active' : ''}`}></div>
                <div className={`particle-field ${tapState >= 3 ? 'active' : ''}`}></div>
                {/* Additional visual effects */}
                <div className={`energy-ring ${tapState === 1 ? 'active' : ''}`}></div>
                <div className={`portal-effect ${tapState >= 3 ? 'active' : ''}`}></div>
            </div>

            {/* Brand */}
            <div className="brand-gate">
                <div className="brand-main">
                    {brandName.split('').map((char, index) => {
                        const delay = 0.8 + index * 0.1;
                        return (
                            <span
                                key={index}
                                style={{ animationDelay: `${delay}s` }}
                                className="letter-3d"
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        );
                    })}
                </div>
                <div className="creator-tag">
                    Created by <span className="creator-name">{creatorName}</span>
                </div>
            </div>

            {/* Interactive prompt */}
            <div className="interface-hud">
                <div className="enter-action">
                    <div className="action-circle">
                        <FaBook className="mini-book" />
                        <div className="tap-indicator">
                            <span className="tap-dot active"></span>
                            <span className={`tap-dot ${tapState >= 1 ? 'active' : ''}`}></span>
                            <span className={`tap-dot ${tapState >= 2 ? 'active' : ''}`}></span>
                        </div>
                    </div>
                    <span className="action-text">
                        {tapState === 0 && 'TAP FOR 360°'}
                        {tapState === 1 && 'TAP TO OPEN'}
                        {tapState === 2 && 'TAP TO ENTER PORTAL'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RocketSplash;
