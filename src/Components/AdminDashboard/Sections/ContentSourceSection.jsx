import React from 'react';
import { FaEye, FaDownload, FaBookOpen } from 'react-icons/fa';

const ContentSourceSection = ({ contentSource, getFileUrl }) => {
    return (
        <div className="section-container">
            <div className="actions-bar">
                <h3>Content Source Files</h3>
                <div className="info-text">
                    Browse and manage uploaded content source materials. These files are automatically linked to the advanced learning dashboard.
                </div>
            </div>
            <div className="content-source-grid">
                {contentSource.map(subject => (
                    <div key={subject.subject} className="subject-card">
                        <h4>{subject.subject}</h4>
                        {subject.types.map(type => (
                            <div key={type.type} className="type-section">
                                <h5>{type.type.charAt(0).toUpperCase() + type.type.slice(1)}</h5>
                                {type.chapters.map(chapter => (
                                    <div key={chapter.chapter} className="chapter-section">
                                        <h6>Chapter {chapter.chapter}</h6>
                                        <div className="files-list">
                                            {chapter.files.map(file => (
                                                <div key={file.name} className="file-item">
                                                    <span className="file-name">{file.name}</span>
                                                    <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                                                    <a href={getFileUrl(file.url)} target="_blank" rel="noreferrer" className="btn-icon">
                                                        <FaEye />
                                                    </a>
                                                    <a href={getFileUrl(file.url)} download className="btn-icon">
                                                        <FaDownload />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
                {contentSource.length === 0 && <p className="empty-state">No content source files found.</p>}
            </div>
        </div>
    );
};

export default ContentSourceSection;
