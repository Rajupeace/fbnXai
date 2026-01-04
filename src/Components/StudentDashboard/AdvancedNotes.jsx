
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdvancedCourses } from './branchData';
import { Card, Button, Row, Col, Container, Spinner } from 'react-bootstrap';
import { FaBook, FaVideo, FaCode } from 'react-icons/fa';
import './AdvancedLearning.css'; // Import Premium UI Styles

const AdvancedNotes = ({ studentData }) => {
    const navigate = useNavigate();
    const { language, section } = useParams();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(section || 'notes');

    const advancedCourses = getAdvancedCourses(studentData?.branch || 'CSE');

    const programmingLanguages = advancedCourses.filter(course => [
        'C', 'C++', 'Java', 'Python', 'JavaScript'
    ].includes(course.name));

    useEffect(() => {
        if (language && section) {
            fetchMaterials(language, section);
        }
    }, [language, section]);

    const fetchMaterials = async (lang, type) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/materials?subject=${encodeURIComponent(lang)}&type=${type}`);
            const data = await response.json();
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSectionChange = (newSection) => {
        setActiveTab(newSection);
        navigate(`/advanced-materials/${language}/${newSection}`);
    };

    const renderContent = () => {
        if (!language) {
            return (
                <Container className="mt-4">
                    <h2>Select a Programming Language</h2>
                    <Row className="mt-4">
                        {programmingLanguages.map((course) => (
                            <Col key={course.id} md={4} className="mb-4">
                                <Card className="h-100">
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>{course.name}</Card.Title>
                                        <Card.Text>{course.description}</Card.Text>
                                        <div className="mt-auto d-flex gap-2">
                                            <Button
                                                variant="primary"
                                                onClick={() => navigate(`/advanced-materials/${encodeURIComponent(course.name)}/notes`)}
                                            >
                                                <FaBook className="me-2" /> Notes
                                            </Button>
                                            <Button
                                                variant="success"
                                                onClick={() => navigate(`/advanced-materials/${encodeURIComponent(course.name)}/videos`)}
                                            >
                                                <FaVideo className="me-2" /> Videos
                                            </Button>
                                            <Button
                                                variant="info"
                                                onClick={() => navigate(`/advanced-materials/${encodeURIComponent(course.name)}/interview`)}
                                            >
                                                <FaCode className="me-2" /> Interview Q&A
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            );
        }

        return (
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>{language} - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    <Button variant="secondary" onClick={() => navigate('/advanced-learning')}>
                        Back to Advanced Learning
                    </Button>
                </div>

                <div className="mb-4">
                    <Button
                        variant={activeTab === 'notes' ? 'primary' : 'outline-primary'}
                        className="me-2"
                        onClick={() => handleSectionChange('notes')}
                    >
                        <FaBook className="me-2" /> Notes
                    </Button>
                    <Button
                        variant={activeTab === 'videos' ? 'success' : 'outline-success'}
                        className="me-2"
                        onClick={() => handleSectionChange('videos')}
                    >
                        <FaVideo className="me-2" /> Videos
                    </Button>
                    <Button
                        variant={activeTab === 'interview' ? 'info' : 'outline-info'}
                        onClick={() => handleSectionChange('interview')}
                    >
                        <FaCode className="me-2" /> Interview Q&A
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : (
                    <>
                        {materials.length > 0 ? (
                            // Chapter-wise grouping for ALL types (Notes, Videos, Interview)
                            <Row>
                                {Object.entries(
                                    materials.reduce((acc, material) => {
                                        const moduleName = material.module || 'General';
                                        if (!acc[moduleName]) acc[moduleName] = [];
                                        acc[moduleName].push(material);
                                        return acc;
                                    }, {})
                                ).sort((a, b) => {
                                    // Natural sort for "1. Chapter 1", "2. Chapter 2", etc.
                                    return a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' });
                                }).map(([moduleName, moduleMaterials]) => (
                                    <Col key={moduleName} md={12} lg={6} className="mb-4">
                                        {/* Chapter Box Side-by-Side as requested */}
                                        <div className="chapter-box h-100 p-4 border rounded shadow-sm bg-white" style={{ transition: 'transform 0.2s', borderTop: '4px solid #3b82f6' }}>
                                            <h3 className="section-header mb-4 pb-2 border-bottom" style={{ color: '#2c3e50', fontWeight: '600' }}>
                                                {moduleName}
                                            </h3>
                                            <Row>
                                                {moduleMaterials.map((material) => (
                                                    <Col key={material.id} md={12} className="mb-2">
                                                        <Card className="h-100 shadow-sm hover-effect border-0 bg-light">
                                                            <Card.Body className="d-flex align-items-center justify-content-between p-3">
                                                                <div className="text-truncate me-3" style={{ maxWidth: '70%' }}>
                                                                    <span className="fw-bold text-dark">{material.title}</span>
                                                                </div>
                                                                <Button
                                                                    href={material.url.startsWith('http') ? material.url : `http://localhost:5000${material.url}`}
                                                                    target="_blank"
                                                                    variant={activeTab === 'videos' ? 'outline-success' : (activeTab === 'interview' ? 'outline-info' : 'outline-primary')}
                                                                    size="sm"
                                                                    className="px-3"
                                                                >
                                                                    {activeTab === 'videos' ? 'Watch' : (activeTab === 'interview' ? 'View' : 'Read')}
                                                                </Button>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Col>
                                <div className="alert alert-info">
                                    No {activeTab} available for {language} yet.
                                </div>
                            </Col>
                        )}
                    </>
                )}
            </Container>
        );
    };

    return (
        <div className="advanced-notes-container p-4">
            <h1 className="mb-4">Advanced Learning Resources</h1>
            {renderContent()}
        </div>
    );
};

export default AdvancedNotes;
