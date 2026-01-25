import React from 'react';
import { FaBrain, FaRegLightbulb, FaShieldAlt, FaBolt } from 'react-icons/fa';

/**
/**
 * System Insights
 * Analytics and system insights.
 */
const SystemIntelligence = () => {
    return (
        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
            {/* Learning Efficiency */}
            <div className="admin-summary-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '4px solid var(--admin-primary)' }}>
                <div className="summary-icon-box" style={{ background: '#f5f3ff', color: 'var(--admin-primary)', width: '48px', height: '48px', flexShrink: 0 }}>
                    <FaBrain size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>LEARNING TRENDS</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-text-muted)', lineHeight: 1.6, fontWeight: 850 }}>Student engagement in Year 2 CSE is up by 14% this week. Consider releasing Module 5 early.</p>
                </div>
                <span className="admin-badge primary" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '0.55rem' }}>INSIGHT</span>
            </div>

            {/* Content Optimization */}
            <div className="admin-summary-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '4px solid var(--admin-warning)' }}>
                <div className="summary-icon-box" style={{ background: '#fffbeb', color: 'var(--admin-warning)', width: '48px', height: '48px', flexShrink: 0 }}>
                    <FaRegLightbulb size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>CONTENT QUALITY</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-text-muted)', lineHeight: 1.6, fontWeight: 850 }}>Video materials for "Data Structures" are being frequently paused at 12:40. Clarity check recommended.</p>
                </div>
            </div>

            {/* Security Status */}
            <div className="admin-summary-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '4px solid var(--admin-success)' }}>
                <div className="summary-icon-box" style={{ background: '#ecfdf5', color: 'var(--admin-success)', width: '48px', height: '48px', flexShrink: 0 }}>
                    <FaShieldAlt size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>SYSTEM STATUS</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-text-muted)', lineHeight: 1.6, fontWeight: 850 }}>System running smoothly. No issues detected in 48h.</p>
                </div>
            </div>

            {/* Automated Tasks */}
            <div className="admin-summary-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '4px solid var(--admin-accent)' }}>
                <div className="summary-icon-box" style={{ background: '#eff6ff', color: 'var(--admin-accent)', width: '48px', height: '48px', flexShrink: 0 }}>
                    <FaBolt size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>RECENT ACTIVITY</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-text-muted)', lineHeight: 1.6, fontWeight: 850 }}>Successfully processed 42 bulk uploads and synchronized 128 files today.</p>
                </div>
            </div>
        </div>
    );
};

export default SystemIntelligence;
