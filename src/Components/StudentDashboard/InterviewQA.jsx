import React, { useState } from 'react';
import { FaPlay, FaBuilding, FaStar, FaCheckCircle, FaMicrophone, FaVideo } from 'react-icons/fa';
import './InterviewQA.css';

const InterviewQA = () => {
    const [activeTab, setActiveTab] = useState('interview');

    return (
        <div className="interview-qa-container">
            <div className="interview-qa-header">
                <h1 className="interview-qa-title">Interview Prep</h1>
            </div>
            <div className="interview-qa-tabs">
                <button
                    className={`tab-button ${activeTab === 'interview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('interview')}
                >
                    Mock Interview
                </button>
                <button
                    className={`tab-button ${activeTab === 'test' ? 'active' : ''}`}
                    onClick={() => setActiveTab('test')}
                >
                    Company Tests
                </button>
            </div>
            <div className="tab-content">
                {activeTab === 'interview' && (
                    <div className="mock-interview-section">
                        <h2>Mock Interview</h2>
                        <p>Practice your interview skills with AI-powered questions.</p>
                    </div>
                )}
                {activeTab === 'test' && (
                    <div className="company-test-section">
                        <h2>Company Tests</h2>
                        <p>Test your knowledge with company-specific questions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewQA;
