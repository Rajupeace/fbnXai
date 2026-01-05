import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/apiClient';
import './Dashboard.css';

const Dashboard = ({ studentData, setIsAuthenticated, setStudentData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notes');
  const [dashboardData, setDashboardData] = useState({
    materials: [],
    attendance: {},
    overview: {}
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const eventSourceRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  console.log('Dashboard Component - Student Data:', studentData); // Debug log

  // Real-time SSE connection for live updates
  useEffect(() => {
    if (!studentData?.sid) return;

    const connectSSE = () => {
      try {
        const eventSource = new EventSource(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/stream`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('🔄 Real-time update received:', data);

            // Handle different types of updates
            if (data.resource === 'materials' || data.action === 'create') {
              // Refresh materials when new content is added
              fetchDashboardData();
            }
            if (data.resource === 'attendance' && data.action === 'create') {
              // Refresh attendance data when attendance is updated
              fetchDashboardData();
            }
            if (data.resource === 'student' && data.action === 'update') {
              // Refresh student overview when student data changes
              fetchDashboardData();
            }

            setLastUpdate(Date.now());
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.warn('SSE connection error, reconnecting...', error);
          eventSource.close();
          setTimeout(connectSSE, 5000); // Reconnect after 5 seconds
        };

        eventSource.onopen = () => {
          console.log('✅ SSE connected for real-time updates');
        };

      } catch (error) {
        console.error('Failed to establish SSE connection:', error);
        // Fallback to polling
        startPolling();
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [studentData?.sid, fetchDashboardData, startPolling]);

  // Fallback polling for automatic updates
  const startPolling = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds
  }, [fetchDashboardData]);

  // Fetch dashboard data from backend
  const fetchDashboardData = useCallback(async () => {
    if (!studentData?.sid) return;
    
    try {
      setLoading(true);
      
      // Fetch student overview data
      const overview = await apiGet(`/api/students/${studentData.sid}/overview`);
      
      // Fetch student courses and materials
      const courses = await apiGet(`/api/students/${studentData.sid}/courses`);
      
      // Fetch all course materials
      const materialsData = await Promise.all(
        courses.map(async (course) => {
          try {
            const courseDetails = await apiGet(`/api/students/${studentData.sid}/courses/${course.id || course.courseCode}`);
            return courseDetails.materials || [];
          } catch (err) {
            console.warn(`Failed to fetch materials for course ${course.id}:`, err);
            return [];
          }
        })
      );
      
      // Flatten all materials
      const allMaterials = materialsData.flat();
      
      setDashboardData({
        overview,
        courses,
        materials: allMaterials,
        attendance: overview.attendance || {}
      });
      
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set fallback data
      setDashboardData({
        overview: {
          student: studentData,
          attendance: { overall: 75, totalClasses: 20, totalPresent: 15 },
          academics: { overallPercentage: 80, totalExamsTaken: 3 }
        },
        courses: [],
        materials: [],
        attendance: {}
      });
    } finally {
      setLoading(false);
    }
  }, [studentData?.sid]);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh as backup
    startPolling();
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [studentData?.sid, fetchDashboardData, startPolling]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStudentData(null);
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  // Process materials for display
  const getProcessedContent = () => {
    const { materials } = dashboardData;
    
    // Group materials by type
    const notes = materials.filter(m => m.type === 'notes' || m.type?.toLowerCase().includes('note')).map(m => ({
      title: m.title || 'Untitled Note',
      subject: m.subject || 'General',
      semester: `Semester ${studentData?.year || '1'}`,
      size: m.fileSize || '2.5 MB',
      url: m.url,
      id: m.id
    }));

    const videos = materials.filter(m => m.type === 'video' || m.type?.toLowerCase().includes('video')).map(m => ({
      title: m.title || 'Untitled Video',
      subject: m.subject || 'General',
      duration: m.duration || '45 min',
      views: m.views || '1K',
      url: m.url,
      id: m.id
    }));

    const previousQuestions = materials.filter(m => m.type === 'exam' || m.type?.toLowerCase().includes('question') || m.type?.toLowerCase().includes('exam')).map(m => ({
      title: m.title || 'Previous Question',
      subject: m.subject || 'General',
      examYear: '2023',
      type: 'Exam',
      semester: `Semester ${studentData?.year || '1'}`,
      url: m.url,
      solutionUrl: m.solutionUrl,
      id: m.id
    }));

    return {
      notes,
      videos,
      previousQuestions,
      subjects: getCurrentSubjects(),
      semesters: [`Semester 1`, `Semester 2`]
    };
  };

  const getCurrentSubjects = () => {
    const { courses } = dashboardData;
    if (courses && courses.length > 0) {
      return courses.map(course => course.courseName || course.subject || course.courseCode || 'General Subject');
    }
    
    // Fallback subjects based on year
    const yearSubjects = {
      '1': ['Mathematics-I', 'Physics', 'Chemistry', 'English', 'Programming in C'],
      '2': ['Mathematics-II', 'Data Structures', 'Digital Logic Design', 'Object Oriented Programming'],
      '3': ['Computer Networks', 'Data Mining Techniques', 'Compiler Design', 'AI Web Technology'],
      '4': ['Machine Learning', 'Cloud Computing', 'Cyber Security', 'Project Management']
    };
    
    return yearSubjects[studentData?.year] || yearSubjects['1'];
  };

  // Get current year content
  const getCurrentYearContent = () => {
    const processedContent = getProcessedContent();
    const yearName = {
      '1': '1st Year',
      '2': '2nd Year', 
      '3': '3rd Year',
      '4': '4th Year'
    }[studentData?.year] || '1st Year';

    return {
      yearName,
      subjects: processedContent.subjects,
      semesters: processedContent.semesters,
      notes: processedContent.notes,
      videos: processedContent.videos,
      previousQuestions: processedContent.previousQuestions
    };
  };

  const currentYearContent = getCurrentYearContent();

  const renderContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <div className="content-grid">
            {currentYearContent.notes.map((note, index) => (
              <div key={note.id || index} className="content-card">
                <div className="card-header">
                  <h3>{note.title}</h3>
                  <span className="semester-tag">{note.semester}</span>
                </div>
                <p className="subject-name">{note.subject}</p>
                <div className="note-info">
                  <span className="file-size">📄 {note.size}</span>
                </div>
                <button className="download-btn" onClick={() => {
                  if (note.url && note.url !== '#') {
                    window.open(note.url, '_blank');
                  } else {
                    alert(`Downloading: ${note.title}`);
                  }
                }}>
                  📥 Download PDF
                </button>
              </div>
            ))}
          </div>
        );
      
      case 'videos':
        // Group videos by subject
        const videosBySubject = currentYearContent.videos.reduce((acc, video) => {
          if (!acc[video.subject]) {
            acc[video.subject] = [];
          }
          acc[video.subject].push(video);
          return acc;
        }, {});

        return (
          <div className="video-playlists-container">
            {Object.entries(videosBySubject).map(([subject, videos]) => (
              <div key={subject} className="playlist-card">
                <div className="playlist-header">
                  <div className="playlist-info">
                    <h3 className="playlist-title">📚 {subject}</h3>
                    <p className="playlist-stats">
                      {videos.length} videos • {videos.reduce((total, video) => {
                        const duration = parseInt(video.duration);
                        return total + (isNaN(duration) ? 45 : duration);
                      }, 0)} min total
                    </p>
                  </div>
                  <div className="playlist-thumbnail">
                    <div className="playlist-icon">🎥</div>
                    <span className="video-count">{videos.length}</span>
                  </div>
                </div>
                
                <div className="playlist-videos">
                  {videos.map((video, index) => (
                    <div key={video.id || index} className="playlist-video-item">
                      <div className="video-index">{index + 1}</div>
                      <div className="video-thumbnail-small">
                        <div className="play-icon-small">▶</div>
                      </div>
                      <div className="video-details">
                        <h4 className="video-title">{video.title}</h4>
                        <div className="video-meta">
                          <span className="video-duration">⏱ {video.duration}</span>
                          <span className="video-views">👁 {video.views} views</span>
                        </div>
                      </div>
                      <button 
                        className="play-video-btn"
                        onClick={() => {
                          if (video.url && video.url !== '#') {
                            window.open(video.url, '_blank');
                          } else {
                            alert(`Playing: ${video.title}`);
                          }
                        }}
                      >
                        ▶ Play
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="playlist-actions">
                  <button 
                    className="play-all-btn"
                    onClick={() => {
                      const firstVideoWithUrl = videos.find(v => v.url && v.url !== '#');
                      if (firstVideoWithUrl) {
                        window.open(firstVideoWithUrl.url, '_blank');
                      } else {
                        alert(`Playing all videos from ${subject} playlist`);
                      }
                    }}
                  >
                    ▶ Play All
                  </button>
                  <button 
                    className="shuffle-btn"
                    onClick={() => alert(`Shuffling ${subject} playlist`)}
                  >
                    🔀 Shuffle
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'syllabus':
        return (
          <div className="syllabus-container">
            {currentYearContent.semesters.map((semester, index) => (
              <div key={index} className="semester-card">
                <h3>📚 {semester}</h3>
                <div className="subjects-list">
                  {currentYearContent.subjects.map((subject, subIndex) => (
                    <div key={subIndex} className="subject-item">
                      <span className="subject-code">
                        {studentData.branch}{studentData.year}0{subIndex + 1}
                      </span>
                      <span className="subject-name">{subject}</span>
                      <div className="subject-actions">
                        <button 
                          className="view-syllabus-btn"
                          onClick={() => alert(`Viewing syllabus for: ${subject}`)}
                        >
                          📋 View Syllabus
                        </button>
                        <button 
                          className="download-syllabus-btn"
                          onClick={() => alert(`Downloading syllabus for: ${subject}`)}
                        >
                          📥 Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'subjects':
        return (
          <div className="subjects-grid">
            {currentYearContent.subjects.map((subject, index) => (
              <div key={index} className="subject-card">
                <div className="subject-icon">📚</div>
                <h3>{subject}</h3>
                <div className="subject-stats">
                  <span>📊 Credits: {Math.floor(Math.random() * 3) + 3}</span>
                  <span>⏰ Hours: {Math.floor(Math.random() * 20) + 30}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress" style={{width: `${Math.floor(Math.random() * 100)}%`}}></div>
                </div>
                <div className="subject-actions">
                  <button 
                    className="action-btn notes-btn"
                    onClick={() => {
                      setActiveTab('notes');
                      alert(`Viewing notes for: ${subject}`);
                    }}
                  >
                    📝 Notes
                  </button>
                  <button 
                    className="action-btn videos-btn"
                    onClick={() => {
                      setActiveTab('videos');
                      alert(`Viewing videos for: ${subject}`);
                    }}
                  >
                    🎥 Videos
                  </button>
                  <button 
                    className="action-btn assignments-btn"
                    onClick={() => alert(`Viewing assignments for: ${subject}`)}
                  >
                    📋 Assignments
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'previousQuestions':
        const allQuestions = currentYearContent.previousQuestions.map(q => ({
          title: q.title,
          examYear: q.examYear || '2023',
          subject: q.subject,
          type: q.type || 'Exam',
          semester: q.semester,
          url: q.url || '#',
          solutionUrl: q.solutionUrl,
          id: q.id
        }));

        return (
          <div className="previous-questions-grid">
            {allQuestions.map((question, index) => (
              <div key={question.id || index} className="previous-question-card">
                <div className="question-icon">📝</div>
                <h3>{question.title}</h3>
                <div className="question-stats">
                  <span>📆 Exam Year: {question.examYear}</span>
                  <span>📚 Subject: {question.subject}</span>
                  <span>📝 Type: {question.type}</span>
                </div>
                <div className="question-actions">
                  <button 
                    className="view-question-btn"
                    onClick={() => {
                      if (question.url && question.url !== '#') {
                        window.open(question.url, '_blank');
                      } else {
                        alert(`Question paper for "${question.title}" is not available yet. Please contact your administrator.`);
                      }
                    }}
                  >
                    📄 View Question Paper
                  </button>
                  {question.solutionUrl && question.solutionUrl !== '#' && (
                    <button 
                      className="view-solution-btn"
                      onClick={() => {
                        window.open(question.solutionUrl, '_blank');
                      }}
                    >
                      📝 View Solution
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  const getBranchFullName = (branch) => {
    const branches = {
      'CSE': 'Computer Science Engineering',
      'ECE': 'Electronics & Communication Engineering',
      'EEE': 'Electrical & Electronics Engineering',
      'MECH': 'Mechanical Engineering',
      'CIVIL': 'Civil Engineering'
    };
    return branches[branch] || branch;
  };


  const getTabTitle = (tab) => {
    const titles = {
      'notes': 'Study Notes',
      'videos': 'Video Lectures',
      'syllabus': 'Course Syllabus',
      'subjects': 'Subject Overview',
      'previousQuestions': 'Previous Questions'
    };
    return titles[tab] || 'Dashboard';
  };

  if (!studentData) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <p>Loading student data...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button onClick={handleBackToHome} className="back-btn">
            ← Back to Home
          </button>
          <div className="profile-section">
            <div className="header-default-avatar">
              {studentData?.studentName?.charAt(0)}
            </div>
            <div className="profile-info">
              <h2>{studentData?.studentName}</h2>
              <p>
                {currentYearContent.yearName} - {getBranchFullName(studentData?.branch)} - Section {studentData?.section}
              </p>
              <span className="student-id">ID: {studentData?.sid}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Dashboard Overview Cards */}
      <div className="dashboard-overview">
        <div className="overview-header">
          <h2>📊 Your Academic Overview</h2>
          <div className="live-indicator">
            <span className={`live-dot ${loading ? 'loading' : 'live'}`}></span>
            <span className="live-text">
              {loading ? 'Loading...' : `Last updated: ${new Date(lastUpdate).toLocaleTimeString()}`}
            </span>
          </div>
        </div>
        <div className="overview-grid">
          <div className="overview-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Attendance</h3>
              <p className="card-value">{dashboardData.overview?.attendance?.overall || 0}%</p>
              <span className="card-label">Overall Attendance</span>
            </div>
          </div>
          <div className="overview-card">
            <div className="card-icon">📚</div>
            <div className="card-content">
              <h3>Academics</h3>
              <p className="card-value">{dashboardData.overview?.academics?.overallPercentage || 0}%</p>
              <span className="card-label">Overall Score</span>
            </div>
          </div>
          <div className="overview-card">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <h3>Materials</h3>
              <p className="card-value">{dashboardData.materials?.length || 0}</p>
              <span className="card-label">Available Resources</span>
            </div>
          </div>
          <div className="overview-card">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h3>Activity</h3>
              <p className="card-value">{dashboardData.overview?.activity?.streak || 0}</p>
              <span className="card-label">Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'notes' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes ({currentYearContent.notes.length})
        </button>
        <button 
          className={activeTab === 'videos' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('videos')}
        >
          🎥 Videos ({currentYearContent.videos.length})
        </button>
        <button 
          className={activeTab === 'syllabus' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('syllabus')}
        >
          📋 Syllabus ({currentYearContent.semesters.length} Semesters)
        </button>
        <button 
          className={activeTab === 'subjects' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('subjects')}
        >
          📚 Subjects ({currentYearContent.subjects.length})
        </button>
        <button 
          className={activeTab === 'previousQuestions' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('previousQuestions')}
        >
          📝 Previous Questions ({currentYearContent.previousQuestions.length})
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="content-header">
          <h1>
            {getTabTitle(activeTab)} - {currentYearContent.yearName}
          </h1>
          <p className="content-description">
            Access your {currentYearContent.yearName} academic resources for {getBranchFullName(studentData?.branch)}
          </p>
        </div>
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;