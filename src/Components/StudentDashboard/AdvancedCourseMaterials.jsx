import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaBook, FaVideo, FaUserTie, FaDownload, FaFilePdf, FaPlay } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';
import './AdvancedLearning.css'; // Import the shared premium styles

const AdvancedCourseMaterials = () => {
    const { courseName, type } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                setLoading(true);
                const data = await apiGet(`/api/materials?subject=${encodeURIComponent(courseName)}&type=${type}`);
                setMaterials(data || []);
            } catch (err) {
                console.error('Failed to fetch materials:', err);
                setError('Failed to load materials. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (courseName && type) {
            fetchMaterials();
        }
    }, [courseName, type]);

    const getIcon = () => {
        switch (type) {
            case 'notes': return <FaBook className="fs-4 text-primary" />;
            case 'videos': return <FaVideo className="fs-4 text-success" />;
            case 'interview': return <FaUserTie className="fs-4 text-info" />;
            default: return <FaBook className="fs-4 text-secondary" />;
        }
    };

    const getTitle = () => {
        return `${courseName} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    };

    const handleRead = (url) => {
        const finalLink = url && url.startsWith('/') ? `http://localhost:5000${url}` : url;
        window.open(finalLink, '_blank');
    };

    const handleDownload = (url, filename) => {
        const finalLink = url && url.startsWith('/') ? `http://localhost:5000${url}` : url;
        const link = document.createElement('a');
        link.href = finalLink;
        link.download = filename || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Group materials by module/chapter
    const groupedMaterials = materials.reduce((acc, material) => {
        const module = material.module || 'General';
        if (!acc[module]) {
            acc[module] = [];
        }
        acc[module].push(material);
        return acc;
    }, {});

    const sortedModules = Object.keys(groupedMaterials).sort((a, b) => {
        if (a === 'General') return 1;
        if (b === 'General') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="advanced-notes-container">
            <Container fluid="lg">
                <Button
                    variant="link"
                    className="mb-4 d-flex align-items-center back-button text-decoration-none text-muted"
                    onClick={() => navigate('/advanced-learning')}
                >
                    <FaArrowLeft className="me-2" /> Back to Advanced Learning
                </Button>

                <div className="section-container bg-white p-4">
                    <div className="text-center mb-5">
                        <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-3" style={{ background: '#f1f5f9' }}>
                            {getIcon()}
                        </div>
                        <h1 className="mb-2">{getTitle()}</h1>
                        <p className="text-muted">Curated resources for your advanced learning journey</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Loading materials...</p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger" className="text-center shadow-sm border-0">
                            {error}
                        </Alert>
                    ) : materials.length > 0 ? (
                        <div className="row g-4">
                            {sortedModules.map(module => (
                                <div key={module} className="col-12">
                                    <div className="chapter-box p-4 h-100">
                                        <h3 className="h5 mb-4 text-dark border-bottom pb-2">{module}</h3>
                                        <div className="list-group list-group-flush">
                                            {groupedMaterials[module].map(material => {
                                                const isVideo = material.type === 'videos';
                                                const isInterview = material.type === 'interview';

                                                return (
                                                    <div key={material.id} className="list-group-item border-0 px-0 py-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 hover-bg-light rounded">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className={`p-2 rounded ${isVideo ? 'bg-success bg-opacity-10' : (isInterview ? 'bg-info bg-opacity-10' : 'bg-primary bg-opacity-10')}`}>
                                                                {isVideo ? <FaPlay className="text-success" /> : (isInterview ? <FaUserTie className="text-info" /> : <FaFilePdf className="text-primary" />)}
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-semibold text-dark">{material.title}</h6>
                                                                {material.description && <small className="text-muted">{material.description}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2 w-100 w-md-auto">
                                                            <button
                                                                className="btn btn-primary btn-sm flex-grow-1 flex-md-grow-0"
                                                                onClick={() => handleRead(material.url)}
                                                            >
                                                                {isVideo ? 'Watch Now' : 'Read Now'}
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => handleDownload(material.url, material.filename || material.title)}
                                                                title="Download"
                                                            >
                                                                <FaDownload />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div className="mb-4 text-muted opacity-25">
                                <FaBook size={48} />
                            </div>
                            <h3>No Materials Found</h3>
                            <p className="text-muted">
                                We couldn't find any {type} for {courseName} at the moment.
                            </p>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default AdvancedCourseMaterials;
