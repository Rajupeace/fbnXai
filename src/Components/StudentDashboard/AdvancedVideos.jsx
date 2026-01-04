
import React, { useState, useEffect } from 'react';
import { FaPlay, FaSearch } from 'react-icons/fa';

const AdvancedVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('All');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/materials?type=videos');
            if (response.ok) {
                const data = await response.json();
                setVideos(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setLoading(false);
        }
    };

    const subjects = ['All', ...new Set(videos.map(v => v.subject).filter(Boolean))];

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSubject = filterSubject === 'All' || video.subject === filterSubject;
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="dashboard-container" style={{ padding: '2rem' }}>
            <div className="header-section" style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem' }}>Advanced Learning Videos</h1>
                <p style={{ color: '#a0aec0' }}>Expert video tutorials and lecture recordings</p>
            </div>

            <div className="controls-section" style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '90%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white'
                        }}
                    />
                </div>

                <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    {subjects.map(sub => (
                        <option key={sub} value={sub} style={{ color: 'black' }}>{sub}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div style={{ color: 'white', textAlign: 'center' }}>Loading videos...</div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredVideos.map(video => (
                        <div key={video.id} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                            className="video-card"
                            onClick={() => window.open(video.url || video.fileUrl, '_blank')}
                        >
                            <div style={{
                                height: '160px',
                                background: 'linear-gradient(45deg, #2c3e50, #3498db)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                <FaPlay style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.8)' }} />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0.5rem',
                                    right: '0.5rem',
                                    background: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem'
                                }}>
                                    {video.duration || 'Video'}
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    color: '#63b3ed',
                                    marginBottom: '0.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    {video.subject}
                                </div>
                                <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{video.title}</h3>
                                <p style={{ color: '#a0aec0', fontSize: '0.9rem', margin: 0 }}>
                                    {video.description || 'No description available'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredVideos.length === 0 && !loading && (
                <div style={{ textAlign: 'center', color: '#a0aec0', marginTop: '3rem' }}>
                    <h3>No videos found matching your criteria</h3>
                </div>
            )}
        </div>
    );
};

export default AdvancedVideos;
