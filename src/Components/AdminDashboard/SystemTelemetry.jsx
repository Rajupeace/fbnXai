import React, { useState, useEffect } from 'react';
import { FaServer, FaDatabase, FaNetworkWired, FaMemory } from 'react-icons/fa';
import './SystemTelemetry.css';

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
        <div className="telemetry-grid">
            <div className="telemetry-card glass-panel">
                <div className="t-header">
                    <FaServer /> <span>Logic Processor</span>
                </div>
                <div className="t-body">
                    <div className="t-large-stat">{stats.cpu}%</div>
                    <div className="t-chart-mini">
                        <div className="t-bar" style={{ height: '30%', animationDelay: '0s' }}></div>
                        <div className="t-bar" style={{ height: '50%', animationDelay: '0.1s' }}></div>
                        <div className="t-bar" style={{ height: '40%', animationDelay: '0.2s' }}></div>
                        <div className="t-bar" style={{ height: '70%', animationDelay: '0.3s' }}></div>
                        <div className="t-bar" style={{ height: '45%', animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>

            <div className="telemetry-card glass-panel">
                <div className="t-header">
                    <FaMemory /> <span>Buffer Allocation</span>
                </div>
                <div className="t-body">
                    <div className="t-large-stat">{stats.mem}%</div>
                    <div className="t-progress-compact">
                        <div className="t-fill" style={{ width: `${stats.mem}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="telemetry-card glass-panel">
                <div className="t-header">
                    <FaDatabase /> <span>Cluster Sync</span>
                </div>
                <div className="t-body">
                    <div className="t-large-stat">{stats.db}ms</div>
                    <span className="t-status">OPTIMAL</span>
                </div>
            </div>

            <div className="telemetry-card glass-panel">
                <div className="t-header">
                    <FaNetworkWired /> <span>Node Transmission</span>
                </div>
                <div className="t-body">
                    <div className="t-large-stat">{stats.network}mbps</div>
                    <div className="t-pulse-dot"></div>
                </div>
            </div>
        </div>
    );
};

export default SystemTelemetry;
