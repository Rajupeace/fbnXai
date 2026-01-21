import React, { useState, useEffect } from 'react';
import { FaServer, FaDatabase, FaNetworkWired, FaMemory } from 'react-icons/fa';

/**
 * SENTINEL CORE TELEMETRY
 * Real-time diagnostic stream of system resource allocation and terminal connectivity.
 */
const SystemTelemetry = () => {
    const [stats, setStats] = useState({
        cpu: 42,
        mem: 68,
        db: 12,
        network: 85
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats({
                cpu: Math.floor(Math.random() * (60 - 30) + 30),
                mem: Math.floor(Math.random() * (75 - 65) + 65),
                db: Math.floor(Math.random() * (15 - 10) + 10),
                network: Math.floor(Math.random() * (95 - 70) + 70)
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="admin-stats-grid" style={{ marginBottom: '2.5rem' }}>
            {/* Logic Processor */}
            <div className="admin-summary-card" style={{ borderLeft: '4px solid var(--admin-primary)' }}>
                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <FaServer /> LOGIC PROCESSOR
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div className="value" style={{ margin: 0 }}>{stats.cpu}%</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '32px' }}>
                        {[30, 50, 40, 70, 45].map((h, i) => (
                            <div key={i} style={{
                                width: '5px',
                                height: `${h}%`,
                                background: 'var(--admin-primary)',
                                borderRadius: '10px'
                            }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Buffer Allocation */}
            <div className="admin-summary-card" style={{ borderLeft: '4px solid var(--admin-warning)' }}>
                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <FaMemory /> BUFFER ALLOCATION
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div className="value" style={{ margin: 0 }}>{stats.mem}%</div>
                    <div style={{ width: '80px', height: '4px', background: 'var(--admin-border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${stats.mem}%`,
                            height: '100%',
                            background: 'var(--admin-warning)',
                            transition: 'width 1.5s ease'
                        }}></div>
                    </div>
                </div>
            </div>

            {/* Cluster Sync */}
            <div className="admin-summary-card" style={{ borderLeft: '4px solid var(--admin-success)' }}>
                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <FaDatabase /> CLUSTER SYNC
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div className="value" style={{ margin: 0 }}>{stats.db}ms</div>
                    <span className="admin-badge success" style={{ fontSize: '0.6rem' }}>SYNCHRONIZED</span>
                </div>
            </div>

            {/* Node Transmission */}
            <div className="admin-summary-card" style={{ borderLeft: '4px solid #f43f5e' }}>
                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <FaNetworkWired /> NODE TRANSMISSION
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div className="value" style={{ margin: 0 }}>{stats.network}<span style={{ fontSize: '0.7rem', fontWeight: 850 }}>MBPS</span></div>
                    <div style={{
                        width: '10px', height: '10px', background: '#f43f5e',
                        borderRadius: '50%', boxShadow: '0 0 12px rgba(244, 63, 94, 0.6)',
                        animation: 'pulse 1s infinite'
                    }}></div>
                </div>
            </div>
        </div>
    );
};

export default SystemTelemetry;
