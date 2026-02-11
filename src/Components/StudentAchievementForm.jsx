import React, { useState } from 'react';
import { apiPost } from '../utils/apiClient';
import './StudentAchievements.css';

const StudentAchievementForm = ({ studentData, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Technical',
        level: 'College Level',
        achievementType: 'Individual',
        position: 'Winner',
        rank: '',
        achievementDate: '',
        description: '',
        eventName: '',
        organizingInstitution: '',
        eventLocation: '',
        eventMode: 'Offline',
        resultLink: ''
    });

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 5) {
            setError('Maximum 5 files allowed');
            return;
        }
        setFiles(selectedFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();

            // Add student info
            submitData.append('studentId', studentData._id);
            submitData.append('rollNumber', studentData.sid);
            submitData.append('studentName', studentData.studentName);
            submitData.append('department', studentData.branch);
            submitData.append('year', studentData.year);
            submitData.append('section', studentData.section);

            // Add form data
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    submitData.append(key, formData[key]);
                }
            });

            // Add files
            files.forEach((file, index) => {
                submitData.append('documents', file);
                submitData.append(`fileType_${index}`, 'Certificate');
            });

            const response = await apiPost('/api/achievements', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.success) {
                alert('Achievement submitted successfully! It will be reviewed by faculty.');
                // Reset form
                setFormData({
                    title: '',
                    category: 'Technical',
                    level: 'College Level',
                    achievementType: 'Individual',
                    position: 'Winner',
                    rank: '',
                    achievementDate: '',
                    description: '',
                    eventName: '',
                    organizingInstitution: '',
                    eventLocation: '',
                    eventMode: 'Offline',
                    resultLink: ''
                });
                setFiles([]);
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(err.message || 'Failed to submit achievement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="achievement-form-container">
            <h2>🏆 Submit New Achievement</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="achievement-form">
                {/* Achievement Details */}
                <div className="form-section">
                    <h3>Achievement Details</h3>

                    <div className="form-group">
                        <label>Title of Achievement *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Won 1st Prize in National Coding Hackathon"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category *</label>
                            <select name="category" value={formData.category} onChange={handleChange} required>
                                <option value="Technical">Technical</option>
                                <option value="Sports">Sports</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Academic">Academic</option>
                                <option value="Research">Research</option>
                                <option value="Community Service">Community Service</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Level *</label>
                            <select name="level" value={formData.level} onChange={handleChange} required>
                                <option value="College Level">College Level</option>
                                <option value="Inter-College">Inter-College</option>
                                <option value="State Level">State Level</option>
                                <option value="National Level">National Level</option>
                                <option value="International Level">International Level</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Type *</label>
                            <select name="achievementType" value={formData.achievementType} onChange={handleChange} required>
                                <option value="Individual">Individual</option>
                                <option value="Team">Team</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Position/Result *</label>
                            <select name="position" value={formData.position} onChange={handleChange} required>
                                <option value="Winner">Winner</option>
                                <option value="Runner-up">Runner-up</option>
                                <option value="Participation">Participation</option>
                                <option value="Rank">Rank</option>
                            </select>
                        </div>

                        {formData.position === 'Rank' && (
                            <div className="form-group">
                                <label>Rank</label>
                                <input
                                    type="number"
                                    name="rank"
                                    value={formData.rank}
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="Enter rank"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Date of Achievement *</label>
                        <input
                            type="date"
                            name="achievementDate"
                            value={formData.achievementDate}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                </div>

                {/* Event Details */}
                <div className="form-section">
                    <h3>Event / Organization Details</h3>

                    <div className="form-group">
                        <label>Name of Event / Competition *</label>
                        <input
                            type="text"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleChange}
                            placeholder="e.g., Smart India Hackathon 2024"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Organizing Institution / Organization</label>
                        <input
                            type="text"
                            name="organizingInstitution"
                            value={formData.organizingInstitution}
                            onChange={handleChange}
                            placeholder="e.g., Ministry of Education, Govt. of India"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Event Location</label>
                            <input
                                type="text"
                                name="eventLocation"
                                value={formData.eventLocation}
                                onChange={handleChange}
                                placeholder="City / Online"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mode of Event</label>
                            <select name="eventMode" value={formData.eventMode} onChange={handleChange}>
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="form-section">
                    <h3>Description</h3>
                    <div className="form-group">
                        <label>Short Description (100-300 words)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            maxLength="1000"
                            placeholder="Describe what the event was about, what you did, how you achieved this..."
                        />
                        <small>{formData.description.length}/1000 characters</small>
                    </div>
                </div>

                {/* Documents Upload */}
                <div className="form-section">
                    <h3>Proof / Documents Upload</h3>

                    <div className="form-group">
                        <label>Upload Documents (Max 5 files, PDF/JPG/PNG, 5MB each)</label>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                        />
                        {files.length > 0 && (
                            <div className="file-list">
                                {files.map((file, index) => (
                                    <div key={index} className="file-item">
                                        📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Link to Official Result Page (Optional)</label>
                        <input
                            type="url"
                            name="resultLink"
                            value={formData.resultLink}
                            onChange={handleChange}
                            placeholder="https://example.com/results"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Submitting...' : '🚀 Submit Achievement'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentAchievementForm;
