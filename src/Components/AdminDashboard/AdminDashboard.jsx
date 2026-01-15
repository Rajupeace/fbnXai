import React, { useState, useEffect } from 'react';

import './AdminDashboard.css';
import { readFaculty, readStudents, writeStudents, writeFaculty } from '../../utils/localdb';
import api from '../../utils/apiClient';
import { getYearData } from '../StudentDashboard/branchData';
import AcademicPulse from '../StudentDashboard/AcademicPulse';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import SystemTelemetry from './SystemTelemetry';
import SystemIntelligence from './SystemIntelligence';
import AdminAttendancePanel from './AdminAttendancePanel';
import AdminScheduleManager from './AdminScheduleManager';
import StudentStatistics from './StudentStatistics';
import AdminExams from './AdminExams';
import AnnouncementTicker from '../AnnouncementTicker/AnnouncementTicker';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaFileAlt, FaClipboardList, FaEnvelope, FaSignOutAlt, FaPlus, FaTrash, FaEdit, FaSearch, FaHome, FaDownload, FaEye, FaBookOpen, FaRobot, FaInfoCircle, FaFileUpload, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import sseClient from '../../utils/sseClient';

// Newly extracted sections
import StudentSection from './Sections/StudentSection';
import FacultySection from './Sections/FacultySection';
import CourseSection from './Sections/CourseSection';
import MaterialSection from './Sections/MaterialSection';
import MessageSection from './Sections/MessageSection';
import TodoSection from './Sections/TodoSection';
import AdvancedSection from './Sections/AdvancedSection';
import ContentSourceSection from './Sections/ContentSourceSection';


// Helper for mocked API or local storage check
// Helper for mocked API or local storage check
const USE_API = true; // Always use API in unified app mode (defaults to localhost:5000)

export default function AdminDashboard({ setIsAuthenticated, setIsAdmin, setStudentData }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data States
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [contentSource, setContentSource] = useState([]);
  const [todos, setTodos] = useState([]);
  const [messages, setMessages] = useState([]);

  // Advanced Learning Topics (Predefined)
  const ADVANCED_TOPICS = ["Angular", "C", "C++", "Django", "Flask", "HTML/CSS", "Java", "JavaScript", "MongoDB", "PHP", "Python", "React", "Machine Learning", "Data Science", "Artificial Intelligence", "Cyber Security", "Cloud Computing", "DevOps"];

  // Form States
  const [showModal, setShowModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [modalType, setModalType] = useState(null); // 'student', 'faculty', 'course', 'material', 'todo', 'message'
  const [editItem, setEditItem] = useState(null);
  const [facultyAssignments, setFacultyAssignments] = useState([]); // For managing multiple teaching assignments
  const [msgTarget, setMsgTarget] = useState('all'); // Targeted messages state
  const [overviewData, setOverviewData] = useState(null);

  // Load Initial Data
  useEffect(() => {
    loadData();
    // Load ToDos from local storage
    const savedTodos = JSON.parse(localStorage.getItem('adminTodos') || '[]');
    setTodos(savedTodos);

    const interval = setInterval(loadData, 5000); // Poll every 5s for admin oversight
    return () => clearInterval(interval);
  }, []);

  // SSE: subscribe to server push updates and refresh relevant data immediately
  useEffect(() => {
    const unsub = sseClient.onUpdate((ev) => {
      try {
        if (!ev || !ev.resource) return;
        const r = ev.resource;
        if (['students', 'faculty', 'courses', 'materials', 'messages', 'todos'].includes(r)) {
          // Quick refresh same as loadData for specific resource
          (async () => {
            try {
              if (USE_API) {
                if (r === 'students') {
                  const s = await api.apiGet('/api/students');
                  setStudents(Array.isArray(s) ? s : []);
                }
                if (r === 'faculty') {
                  const f = await api.apiGet('/api/faculty');
                  setFaculty(Array.isArray(f) ? f : []);
                }
                if (r === 'courses') {
                  const c = await api.apiGet('/api/courses');
                  setCourses(Array.isArray(c) ? c : []);
                }
                if (r === 'materials') {
                  const m = await api.apiGet('/api/materials');
                  setMaterials(Array.isArray(m) ? m : []);
                }
                if (r === 'messages') {
                  const msg = await api.apiGet('/api/messages');
                  setMessages(Array.isArray(msg) ? msg.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
                }
                if (r === 'todos') {
                  const t = await api.apiGet('/api/todos');
                  setTodos(Array.isArray(t) ? t : []);
                }
              }
            } catch (e) {
              console.error('SSE refresh failed', e);
            }
          })();
        }
      } catch (e) {
        console.error('SSE event error', e);
      }
    });
    return unsub;
  }, []);

  const loadData = async () => {
    try {
      if (USE_API) {
        const [s, f, c, m, msg, t] = await Promise.all([
          api.apiGet('/api/students'),
          api.apiGet('/api/faculty'),
          api.apiGet('/api/courses'),
          api.apiGet('/api/materials'),
          api.apiGet('/api/messages'),
          api.apiGet('/api/todos')
        ]);

        setStudents(Array.isArray(s) ? s : []);
        setFaculty(Array.isArray(f) ? f : []);
        setCourses(Array.isArray(c) ? c : []);
        setMaterials(Array.isArray(m) ? m : []);
        setMessages(Array.isArray(msg) ? msg.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
        setTodos(Array.isArray(t) ? t : []);
      } else {
        const s = await readStudents();
        const f = await readFaculty();
        // Load materials from localStorage - getting ALL materials in a flat list for admin view
        const matRaw = JSON.parse(localStorage.getItem('courseMaterials') || '[]');
        let flatMaterials = Array.isArray(matRaw) ? matRaw : [];

        setStudents(s || []);
        setFaculty(f || []);
        setCourses(JSON.parse(localStorage.getItem('courses') || '[]'));
        setMaterials(flatMaterials);
        setMessages(JSON.parse(localStorage.getItem('adminMessages') || '[]'));
      }
    } catch (err) {
      console.error('Data load error', err);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setStudentData(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userData'); // Clear AI Agent Identity
    window.location.href = '/';
  };


  // --- CRUD Operations ---

  // Students
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (!data.sid || !data.studentName) return alert('ID and Name required');

    try {
      let newStudents = [...students];
      if (editItem) {
        newStudents = newStudents.map(s => s.sid === editItem.sid ? { ...s, ...data } : s);
        if (USE_API) await api.apiPut(`/api/students/${editItem.sid}`, data);
      } else {
        const newS = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
        newStudents.push(newS);
        if (USE_API) await api.apiPost('/api/students', newS);
      }

      if (!USE_API) await writeStudents(newStudents);
      setStudents(newStudents);
      closeModal();
      // Optional: reload data to ensure sync with server generated fields
      if (USE_API) await loadData();
    } catch (error) {
      console.error("Save Student Error:", error);
      const msg = error.response?.data?.error || error.message || "Failed to save student";
      alert(msg);
    }
  };

  const handleDeleteStudent = async (sid) => {
    if (!window.confirm('Delete student? This cannot be undone.')) return;

    try {
      if (USE_API) {
        console.log('[Student] Deleting student:', sid);
        await api.apiDelete(`/api/students/${sid}`);
        console.log('[Student] Student deleted from server');
        // Refresh data to ensure sync with MongoDB
        await loadData();
        alert('Student deleted successfully');
      } else {
        const newStudents = students.filter(s => s.sid !== sid);
        await writeStudents(newStudents);
        setStudents(newStudents);
      }
    } catch (err) {
      console.error('Delete student failed:', err);
      alert('Failed to delete student: ' + (err.message || 'Unknown error'));
    }
  };

  // Bulk Student Upload
  const handleBulkUploadStudents = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await api.apiUpload('/api/students/bulk', formData);
      alert(res.message || 'Bulk upload completed');
      loadData(); // Refresh list
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Bulk upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  // Faculty
  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Merge assignments
    data.assignments = facultyAssignments;

    try {
      let newFaculty = [...faculty];
      if (editItem) {
        // EDIT
        if (USE_API) {
          const idToUpdate = editItem._id || editItem.facultyId;
          await api.apiPut(`/api/faculty/${idToUpdate}`, data);
          newFaculty = newFaculty.map(f => (f._id === idToUpdate || f.facultyId === editItem.facultyId) ? { ...f, ...data } : f);
        } else {
          newFaculty = newFaculty.map(f => f.facultyId === editItem.facultyId ? { ...f, ...data } : f);
          await writeFaculty(newFaculty);
        }
      } else {
        // CREATE
        if (USE_API) {
          const res = await api.apiPost('/api/faculty', data);
          newFaculty.push(res.data || res);
        } else {
          const newF = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
          newFaculty.push(newF);
          await writeFaculty(newFaculty);
        }
      }

      setFaculty(newFaculty);
      closeModal();
    } catch (err) {
      console.error('Faculty Save Error:', err);
      alert('Failed to save faculty. ' + (err.message || ''));
    }
  };

  const handleAddAssignment = () => {
    const year = document.getElementById('assign-year').value;
    const section = document.getElementById('assign-section').value;
    const subject = document.getElementById('assign-subject').value;

    if (year && section && subject) {
      setFacultyAssignments([...facultyAssignments, { year, section, subject }]);
      // clear inputs
      document.getElementById('assign-section').value = '';
      document.getElementById('assign-subject').value = '';
    } else {
      alert('Please fill Year, Section and Subject');
    }
  };

  const handleRemoveAssignment = (idx) => {
    const newAssigns = [...facultyAssignments];
    newAssigns.splice(idx, 1);
    setFacultyAssignments(newAssigns);
  };


  const handleDeleteFaculty = async (fid) => {
    if (!window.confirm('Delete Faculty Member?')) return;
    try {
      if (USE_API) {
        // Find full object to get DB _id if needed
        const facToDelete = faculty.find(f => f.facultyId === fid);
        const idToDelete = facToDelete?._id || fid;
        await api.apiDelete(`/api/faculty/${idToDelete}`);
      }

      const newFac = faculty.filter(f => f.facultyId !== fid);
      if (!USE_API) await writeFaculty(newFac);

      setFaculty(newFac);
    } catch (err) {
      console.error(err);
      alert('Failed to delete faculty');
    }
  };

  // Courses (Subjects)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      let newCourses = [...courses];
      if (editItem) {
        // Edit existing
        if (USE_API) {
          // If it's a static course, we cannot Update it. We must Create a new dynamic one.
          if (editItem.isStatic || (String(editItem.id).startsWith('static-'))) {
            try {
              // Treat as Create - but this might conflict if code exists
              const res = await api.apiPost('/api/courses', data);
              const savedItem = res.data || res;

              // Replace the static item in state with the new dynamic one
              newCourses = newCourses.map(c => c.id === editItem.id ? savedItem : c);
            } catch (err) {
              if (err.message && err.message.includes('409')) {
                // Course code already exists in DB - this is OK for editing static courses
                // Just update the local state
                alert('This course already exists in the database. Your changes have been saved locally.');
                newCourses = newCourses.map(c => c.id === editItem.id ? { ...c, ...data } : c);
              } else {
                throw err;
              }
            }
          } else {
            // Normal Update
            const idToUpdate = editItem.id;
            await api.apiPut(`/api/courses/${idToUpdate}`, data);
            newCourses = newCourses.map(c => c.id === editItem.id ? { ...c, ...data } : c);
          }
        } else {
          newCourses = newCourses.map(c => c.id === editItem.id ? { ...c, ...data } : c);
          localStorage.setItem('courses', JSON.stringify(newCourses));
        }
      } else {
        // Add new
        if (USE_API) {
          try {
            const res = await api.apiPost('/api/courses', data);
            const savedItem = res.data || res;
            newCourses.push(savedItem);
          } catch (err) {
            if (err.message && err.message.includes('409')) {
              alert('A course with this code already exists. Please use a different course code.');
              return; // Don't close modal, let user fix the code
            } else {
              throw err;
            }
          }
        } else {
          const newC = { ...data, id: Date.now().toString() };
          newCourses.push(newC);
          localStorage.setItem('courses', JSON.stringify(newCourses));
        }
      }
      setCourses(newCourses);
      closeModal();
    } catch (err) {
      console.error('Course Save Error:', err);
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('401') || errorMsg.includes('Authentication required')) {
        alert('Authentication failed: Your session may have expired. Please log out and log in again.');
      } else if (errorMsg.includes('409')) {
        alert('Course code already exists. Please use a unique course code.');
      } else {
        alert('Failed to save subject: ' + errorMsg);
      }
    }
  };

  const handleDeleteCourse = async (id) => {
    // Find the course to be deleted
    const courseToDelete = courses.find(c => c.id === id);
    if (!courseToDelete) return;

    if (!window.confirm(`Delete Subject: ${courseToDelete.name}?`)) return;

    try {
      if (USE_API) {
        if (courseToDelete.isStatic || String(id).startsWith('static-')) {
          // It's a static course. We can't "delete" it from the code.
          // Strategy: Promote ALL *other* static courses of this (Year + Sem + Branch) to Dynamic (DB).
          // Once Dynamic courses exist for a Sem, the Student Dashboard (updated logic) will ignore static ones.

          const { year, semester, branch } = courseToDelete;

          // 1. Find all static courses for this specific group
          const siblings = courses.filter(c =>
            (c.isStatic || String(c.id).startsWith('static-')) &&
            String(c.year) === String(year) &&
            String(c.semester) === String(semester) &&
            c.branch === branch &&
            c.code !== courseToDelete.code // Exclude the one we are deleting
          );

          // 2. Create them in DB
          // We run these sequentially or parallel
          let successCount = 0;
          for (const sib of siblings) {
            try {
              // Construct payload matching apiPost('/api/courses')
              const payload = {
                name: sib.name,
                code: sib.code,
                year: sib.year,
                semester: sib.semester,
                branch: sib.branch,
                description: sib.description || '',
                credits: sib.credits || 3
              };
              await api.apiPost('/api/courses', payload);
              successCount++;
            } catch (innerErr) {
              // Ignore conflicts if we already promoted them
              if (!innerErr.message.includes('409')) {
                console.error('Failed to migrate sibling:', sib.name, innerErr);
              }
            }
          }

          alert(`Deleted default subject. Automatically migrated ${successCount} other subjects to database.`);

          // Reload all data to reflect the new state (Static ones will be replaced by the fetched Dynamic ones)
          loadData();
          return;

        } else {
          // Standard Dynamic Course Delete
          await api.apiDelete(`/api/courses/${id}`);
        }
      }

      // Update Local State (Visual Only or LocalStorage fallback)
      const newCourses = courses.filter(c => c.id !== id);
      setCourses(newCourses);
      if (!USE_API) localStorage.setItem('courses', JSON.stringify(newCourses));
    } catch (err) {
      console.error(err);
      alert('Failed to delete subject: ' + err.message);
    }
  };

  // Materials (The core logic to link with Student Dashboard)
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const file = e.target.file?.files[0];

    console.log('[Material Upload] Starting upload...', {
      hasFile: !!file,
      isAdvanced: editItem?.isAdvanced,
      subject: data.subject,
      year: data.year,
      type: data.type,
      title: data.title
    });

    // Validation
    if (!data.title || !data.subject || !data.type) {
      alert('Please fill in all required fields: Title, Subject, and Type');
      return;
    }

    if (!file && !data.url && !data.link) {
      alert('Please either upload a file or provide a URL/Link');
      return;
    }

    try {
      let allMaterials = [...materials];

      if (USE_API) {
        const apiFormData = new FormData();

        // Add all form data
        for (const key in data) {
          if (data[key]) {
            apiFormData.append(key, data[key]);
            console.log(`[Material Upload] Adding field: ${key} = ${data[key]}`);
          }
        }

        // Add file if present
        if (file) {
          apiFormData.append('file', file);
          console.log(`[Material Upload] Adding file: ${file.name} (${file.size} bytes)`);
        }

        apiFormData.append('uploadedBy', 'admin');

        // Check authentication
        // Check authentication
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          alert('Session expired or invalid. Logging out...');
          handleLogout();
          return;
        }

        console.log('[Material Upload] Sending to API...', {
          endpoint: editItem?.id && !editItem.isAdvanced ? 'PUT' : 'POST',
          hasAdminToken: !!adminToken,
          hasFile: !!file,
          fileSize: file ? file.size : 0
        });

        // Check if we are EDITING an existing item or CREATING a new one
        if (editItem && editItem.id && !editItem.isAdvanced) {
          // EDIT: Only if we have a valid ID and it's not a "new advanced template"
          const idToUpdate = editItem._id || editItem.id;
          if (!idToUpdate) throw new Error("Missing ID for update");

          console.log('[Material Upload] Updating existing material:', idToUpdate);
          await api.apiPut(`/api/materials/${idToUpdate}`, data);

          const updatedMat = { ...editItem, ...data };
          allMaterials = allMaterials.map(m => (m.id === editItem.id || m._id === editItem._id) ? updatedMat : m);
        } else {
          // CREATE: If no ID, or we are adding new Advanced content
          console.log('[Material Upload] Creating new material...');

          try {
            const res = await api.apiUpload('/api/materials', apiFormData);
            console.log('[Material Upload] Upload successful:', res);

            if (res && (res._id || res.id)) {
              allMaterials.push(res);
            } else {
              console.warn('[Material Upload] Response missing ID:', res);
              allMaterials.push({ ...data, id: Date.now().toString(), uploadedAt: new Date().toISOString() });
            }
          } catch (uploadError) {
            console.error('[Material Upload] Upload failed:', uploadError);

            // Provide specific error messages
            if (uploadError.message.includes('Failed to fetch')) {
              throw new Error('Cannot connect to server. Please ensure:\n1. Backend server is running\n2. MongoDB is connected\n3. Check browser console for details');
            } else if (uploadError.message.includes('401')) {
              throw new Error('Authentication failed. Please log out and log in again.');
            } else if (uploadError.message.includes('400')) {
              throw new Error('Invalid data. Please check all fields and try again.');
            } else {
              throw uploadError;
            }
          }
        }

        // Refresh materials from server to ensure sync
        try {
          console.log('[Material Upload] Refreshing materials from server...');
          const refreshedMaterials = await api.apiGet('/api/materials');
          setMaterials(refreshedMaterials || []);
          console.log('[Material Upload] Materials refreshed successfully. Total:', refreshedMaterials?.length || 0);
        } catch (refreshErr) {
          console.warn('[Material Upload] Failed to refresh materials:', refreshErr);
          setMaterials(allMaterials);
        }
      } else {
        // Local fallback
        const newMaterial = {
          id: editItem ? editItem.id : Date.now().toString(),
          title: data.title,
          type: data.type,
          url: data.url || (file ? URL.createObjectURL(file) : '#'),
          year: data.year,
          section: data.section || 'All',
          subject: data.subject,
          module: data.module,
          unit: data.unit,
          topic: data.topic || 'General',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin'
        };
        if (editItem) {
          allMaterials = allMaterials.map(m => m.id === editItem.id ? newMaterial : m);
        } else {
          allMaterials.push(newMaterial);
        }
        localStorage.setItem('courseMaterials', JSON.stringify(allMaterials));
        setMaterials(allMaterials);
      }

      closeModal();
      alert('✅ Material uploaded successfully! Students can now access it in their dashboard.');
      console.log('[Material Upload] Operation completed successfully');

    } catch (err) {
      console.error('[Material Upload] Error:', err);
      console.error('[Material Upload] Error stack:', err.stack);

      const errorMessage = err.message || 'Unknown error';

      let userMessage = 'Material Operation Failed:\n\n';

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Cannot connect')) {
        userMessage += '❌ Cannot connect to server\n\n';
        userMessage += 'Please check:\n';
        userMessage += '1. Backend server is running (run_unified_app.bat)\n';
        userMessage += '2. MongoDB is connected\n';
        userMessage += '3. No firewall blocking localhost:5000\n\n';
        userMessage += 'Check browser console (F12) for details.';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Authentication')) {
        userMessage += '❌ Authentication Error\n\n';
        userMessage += 'Your session may have expired.\n';
        userMessage += 'Please log out and log in again.';
      } else if (errorMessage.includes('400')) {
        userMessage += '❌ Invalid Data\n\n';
        userMessage += 'Please check:\n';
        userMessage += '1. All required fields are filled\n';
        userMessage += '2. File type is supported\n';
        userMessage += '3. File size is under 100MB';
      } else {
        userMessage += errorMessage;
      }

      alert(userMessage);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this material? It will be removed from all Student/Faculty dashboards.')) return;

    try {
      console.log('[Admin] Deleting material with ID:', id);

      if (USE_API) {
        // Find the material to get the correct ID
        const matToDelete = materials.find(m => m.id === id || m._id === id);
        if (!matToDelete) {
          alert('❌ Material not found');
          return;
        }

        const dbId = matToDelete._id || matToDelete.id || id;
        console.log('[Admin] Sending DELETE request for ID:', dbId);

        // Send delete request to backend
        await api.apiDelete(`/api/materials/${dbId}`);
        console.log('[Admin] Material deleted successfully from backend');
      }

      // Update local state
      const newMats = materials.filter(m => m.id !== id && m._id !== id);
      setMaterials(newMats);

      // Update localStorage if not using API
      if (!USE_API) {
        localStorage.setItem('courseMaterials', JSON.stringify(newMats));
      }

      // Show success message
      alert('✅ Material deleted successfully!\n\nThe material has been removed from all dashboards.');

      // Refresh materials list to ensure sync
      if (USE_API) {
        console.log('[Admin] Refreshing materials list...');
        try {
          const refreshedMaterials = await api.apiGet('/api/materials');
          setMaterials(refreshedMaterials);
          console.log('[Admin] Materials list refreshed');
        } catch (refreshErr) {
          console.warn('[Admin] Failed to refresh materials list:', refreshErr);
          // Not critical, local state is already updated
        }
      }

    } catch (err) {
      console.error('[Admin] Delete material error:', err);
      console.error('[Admin] Error details:', err.message, err.stack);

      // Show detailed error message
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
        alert('❌ Authentication failed!\n\nYour session may have expired. Please log out and log in again.');
      } else if (errorMsg.includes('404')) {
        alert('❌ Material not found!\n\nThe material may have already been deleted.');
        // Refresh the list to sync
        if (USE_API) {
          try {
            const refreshedMaterials = await api.apiGet('/api/materials');
            setMaterials(refreshedMaterials);
          } catch (e) { /* ignore */ }
        }
      } else {
        alert(`❌ Failed to delete material!\n\nError: ${errorMsg}\n\nPlease try again or contact support.`);
      }
    }
  };

  // ToDos
  const handleSaveTodo = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get('text');
    const target = formData.get('target');
    const dueDate = formData.get('dueDate');

    try {
      if (editItem) {
        // Update existing
        if (USE_API) {
          await api.apiPut(`/api/todos/${editItem.id}`, { text, target, dueDate });
        }
        // Optimistic update
        const newTodos = todos.map(t => t.id === editItem.id ? { ...t, text, target, dueDate } : t);
        setTodos(newTodos);
      } else {
        // Create new
        if (USE_API) {
          const res = await api.apiPost('/api/todos', { text, target, dueDate });
          setTodos([...todos, res.data || res]);
        } else {
          const newItem = { id: Date.now(), text, target, dueDate, completed: false };
          setTodos([...todos, newItem]);
        }
      }
      if (!USE_API) localStorage.setItem('adminTodos', JSON.stringify(todos)); // fallback
      closeModal();
    } catch (e) {
      console.error("Failed to save todo", e);
      alert("Failed to save task");
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic
    const newStatus = !todo.completed;
    const newTodos = todos.map(t => t.id === id ? { ...t, completed: newStatus } : t);
    setTodos(newTodos);

    if (USE_API) {
      try {
        await api.apiPut(`/api/todos/${id}`, { completed: newStatus });
      } catch (e) { console.error(e); }
    } else {
      localStorage.setItem('adminTodos', JSON.stringify(newTodos));
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Remove this task?")) return;
    try {
      if (USE_API) await api.apiDelete(`/api/todos/${id}`);
      const newTodos = todos.filter(t => t.id !== id);
      setTodos(newTodos);
      if (!USE_API) localStorage.setItem('adminTodos', JSON.stringify(newTodos));
    } catch (e) {
      console.error(e);
    }
  };

  // Messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const target = formData.get('target');
    const message = formData.get('message');
    const targetYear = formData.get('targetYear');
    const targetSections = formData.getAll('targetSections');

    const payload = {
      message,
      target,
      type: 'announcement',
      date: new Date().toISOString()
    };

    if (target === 'students-specific') {
      payload.targetYear = targetYear;
      payload.targetSections = targetSections;
    }

    try {
      if (USE_API) {
        await api.apiPost('/api/messages', payload);
        loadData(); // Refresh list from server
      } else {
        const newMsgs = [...messages, { ...payload, id: Date.now() }];
        setMessages(newMsgs);
        localStorage.setItem('adminMessages', JSON.stringify(newMsgs));
      }
      alert('✅ Transmission Successfully Dispatched');
      closeModal();
    } catch (err) {
      console.error('Message Transmission Failed:', err);
      alert('Transmission Error: ' + (err.message || 'Unknown error'));
    }
  };


  // Helpers
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    if (type === 'faculty' && item && item.assignments) {
      // Normalize: If legacy format (sections array), flatten it
      let flatAssigns = [];
      item.assignments.forEach(a => {
        if (a.sections && Array.isArray(a.sections)) {
          a.sections.forEach(sec => {
            flatAssigns.push({ year: a.year, subject: a.subject, section: sec });
          });
        } else {
          flatAssigns.push(a);
        }
      });
      setFacultyAssignments(flatAssigns);
    } else {
      setFacultyAssignments([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setModalType(null);
    setMsgTarget('all');
  };

  // Helper to fix broken links by prepending API URL if relative
  const getFileUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // --- Render Components ---

  const SidebarItem = ({ id, icon, label }) => (
    <div
      className={`sidebar-item ${activeSection === id ? 'active' : ''}`}
      onClick={() => setActiveSection(id)}
    >
      <span className="icon">{icon}</span>
      {sidebarOpen && <span className="label">{label}</span>}
    </div>
  );

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2>Friendly Admin</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
            {sidebarOpen ? <FaBookOpen /> : <FaBookOpen />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <SidebarItem id="overview" icon={<FaHome />} label="Overview" />
          <SidebarItem id="students" icon={<FaUserGraduate />} label="Students" />
          <SidebarItem id="faculty" icon={<FaChalkboardTeacher />} label="Faculty" />
          <SidebarItem id="courses" icon={<FaBook />} label="Subjects" />
          <SidebarItem id="advanced" icon={<FaRobot />} label="Advanced Learning" />
          <SidebarItem id="materials" icon={<FaFileAlt />} label="Materials" />
          <SidebarItem id="exam-analytics" icon={<FaClipboardList />} label="Exams Analytics" />
          <SidebarItem id="attendance" icon={<FaCalendarAlt />} label="Attendance" />
          <SidebarItem id="schedule" icon={<FaCalendarAlt />} label="Schedule" />
          <SidebarItem id="content-source" icon={<FaBookOpen />} label="Content Source" />
          <SidebarItem id="todos" icon={<FaClipboardList />} label="ToDo List" />
          <SidebarItem id="messages" icon={<FaEnvelope />} label="Messages" />
          <SidebarItem id="ai-assistant" icon={<FaRobot />} label="Vu AI Agent" />
          <div
            className="sidebar-item"
            onClick={() => setShowAbout(true)}
          >
            <span className="icon"><FaInfoCircle /></span>
            {sidebarOpen && <span className="label">Help & Features</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <header className="content-header">
          <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
          <div className="user-profile">
            <div className="avatar">AD</div>
            <span>Administrator</span>
          </div>
        </header>

        <main className="content-body">
          {activeSection === 'ai-assistant' && (
            <div style={{ height: 'calc(100vh - 120px)' }}>
              <VuAiAgent />
            </div>
          )}

          {activeSection === 'overview' && (

            <div className="overview-grid">
              {/* Smart Welcome Banner */}
              <div className="dashboard-section full-width smart-welcome-banner" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', padding: '2rem', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>
                        {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}, Admin!
                      </h1>
                      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px' }}>
                        System is running smoothly. You have <strong>{todos.filter(t => !t.completed).length} pending tasks</strong> and <strong>{messages.length} recent messages</strong>.
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', backdropFilter: 'blur(5px)' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setActiveSection('todos')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Manage Tasks</button>
                    <button onClick={() => setActiveSection('ai-assistant')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>Ask AI Helper</button>
                  </div>
                </div>
                {/* Decor elements */}
                <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', fontSize: '10rem', opacity: 0.1 }}><FaBookOpen /></div>
              </div>

              {/* Campus Pulse - System Telemetry */}
              <div className="dashboard-section" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Core System Telemetry</h3>
                <SystemTelemetry />
              </div>

              <div className="dashboard-section" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>System Intelligence & Insights</h3>
                <SystemIntelligence />
              </div>

              {/* Student Statistics */}
              <div className="dashboard-section" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
                <StudentStatistics />
              </div>

              <div className="stat-card">
                <h3>Total Students</h3>
                <div className="value">{students.length}</div>
              </div>
              <div className="stat-card">
                <h3>Total Faculty</h3>
                <div className="value">{faculty.length}</div>
              </div>
              <div className="stat-card">
                <h3>Courses</h3>
                <div className="value">{courses.length}</div>
              </div>
              <div className="stat-card">
                <h3>Materials</h3>
                <div className="value">{materials.length}</div>
              </div>

              {/* Quick Todo Preview */}
              <div className="dashboard-section full-width">
                <h3>Pending Tasks</h3>
                <div className="todo-preview">
                  {todos.filter(t => !t.completed).slice(0, 3).map(t => (
                    <div key={t.id} className="todo-item-preview">
                      • {t.text}
                    </div>
                  ))}
                  {todos.filter(t => !t.completed).length === 0 && <p>No pending tasks.</p>}
                </div>
              </div>

              {/* AI Assistant Card for Admin */}
              <div className="stat-card" onClick={() => setActiveSection('ai-assistant')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', color: 'white', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FaRobot size={32} />
                  <div>
                    <h3 style={{ color: 'white', margin: 0 }}>Vu AI Agent</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Launch the AI Assistant to help with administrative tasks.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeSection === 'students' && (
            <StudentSection
              students={students}
              openModal={openModal}
              handleDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeSection === 'faculty' && (
            <FacultySection
              faculty={faculty}
              students={students}
              openModal={openModal}
              handleDeleteFaculty={handleDeleteFaculty}
            />
          )}

          {activeSection === 'courses' && (
            <CourseSection
              courses={courses}
              materials={materials}
              openModal={openModal}
              handleDeleteCourse={handleDeleteCourse}
            />
          )}

          {activeSection === 'advanced' && (
            <AdvancedSection
              topics={ADVANCED_TOPICS}
              materials={materials}
              openModal={openModal}
            />
          )}

          {activeSection === 'materials' && (
            <MaterialSection
              materials={materials}
              openModal={openModal}
              handleDeleteMaterial={handleDeleteMaterial}
              getFileUrl={getFileUrl}
            />
          )}

          {activeSection === 'content-source' && (
            <ContentSourceSection
              contentSource={contentSource}
              getFileUrl={getFileUrl}
            />
          )}

          {activeSection === 'attendance' && (
            <div className="section-container">
              <AdminAttendancePanel />
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className="section-container">
              <AdminScheduleManager />
            </div>
          )}

          {activeSection === 'todos' && (
            <TodoSection
              todos={todos}
              openModal={openModal}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
            />
          )}

          {activeSection === 'messages' && (
            <MessageSection
              messages={messages}
              openModal={openModal}
            />
          )}

          {activeSection === 'exam-analytics' && (
            <div className="section-container">
              <AdminExams />
            </div>
          )}
        </main>
      </div>




      {/* MODALS */}
      {
        (() => {
          // Common Section Options
          const alphaSections = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i)); // A-P
          const numSections = Array.from({ length: 20 }, (_, i) => String(i + 1)); // 1-20
          const SECTION_OPTIONS = [...alphaSections, ...numSections];

          return (
            showModal && (
              <div className="modal-overlay">
                <div className={`modal-content ${modalType}`}>
                  <div className="modal-header">
                    <h2>
                      {modalType === 'about' ? 'Elevate Admin Features' :
                        modalType === 'student-view' ? 'Student Details' :
                          modalType === 'syllabus-view' ? 'Subject Syllabus' :
                            modalType === 'material-view' ? 'Material Details' :
                              editItem ? 'Edit ' + modalType.charAt(0).toUpperCase() + modalType.slice(1) :
                                'Add ' + modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                    </h2>
                    <button onClick={closeModal} className="close-btn">&times;</button>
                  </div>
                  <div className="modal-body">

                    {/* ABOUT / FEATURES MODAL */}
                    {modalType === 'about' && (
                      <div className="about-content">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                          <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', border: '3px solid #3b82f6' }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bobbymartion" alt="Admin" style={{ width: '100%', height: '100%' }} />
                          </div>
                          <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>Elevate Admin Console</h3>
                          <p style={{ margin: 0, color: '#64748b' }}>Complete Control Center</p>
                        </div>

                        <h4 style={{ color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Key Features</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.8rem' }}>
                          {['Manage Students & Faculty', 'Course & Curriculum Management', 'Upload & Organize Materials', 'System-wide Announcements', 'Task & ToDo Tracking'].map((feat, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#475569' }}>
                              <span style={{ color: '#10b981' }}>✓</span> {feat}
                            </li>
                          ))}
                        </ul>

                        <div style={{ marginTop: '2.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                          <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, letterSpacing: '1px' }}>Created By</span>
                          <strong style={{ display: 'block', fontSize: '1.2rem', color: '#3b82f6', marginTop: '0.2rem' }}>Bobbymartion</strong>
                        </div>
                      </div>
                    )}

                    {modalType === 'syllabus-view' && editItem && (
                      <div className="syllabus-view-container" style={{ padding: '0.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                          <h4 style={{ margin: 0, color: '#334155' }}>{editItem.name} ({editItem.code})</h4>
                          <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Year {editItem.year}, Semester {editItem.semester} • {editItem.branch || 'Common'}</p>
                          <button
                            onClick={() => { setModalType('material'); }}
                            className="btn-primary"
                            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                          >
                            <FaPlus /> Add New Content
                          </button>
                        </div>

                        <h5 style={{ color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaBookOpen /> Course Content Structure
                        </h5>

                        {(() => {
                          // Show ALL content for this subject, not just syllabus
                          const subjectMaterials = materials.filter(m =>
                            m.subject === editItem.name || m.subject === editItem.code
                          );

                          if (subjectMaterials.length === 0) {
                            return (
                              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                <FaBook style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                                <p style={{ color: '#64748b', fontWeight: 500 }}>No content uploaded yet.</p>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Upload syllabus, notes, or videos to see the structure here.</p>
                              </div>
                            );
                          }

                          // Hierarchical Grouping: Module -> Unit
                          const modules = {};
                          subjectMaterials.forEach(m => {
                            const modNum = m.module || 'General';
                            if (!modules[modNum]) modules[modNum] = { units: {}, count: 0 };
                            modules[modNum].count++;

                            const unitNum = m.unit || 'General';
                            if (!modules[modNum].units[unitNum]) modules[modNum].units[unitNum] = [];
                            modules[modNum].units[unitNum].push(m);
                          });

                          return (
                            <div className="course-structure">
                              {Object.keys(modules).sort().map(modKey => (
                                <div key={modKey} style={{ marginBottom: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                  <div style={{ background: '#f1f5f9', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Module {modKey}</span>
                                    <span className="badge" style={{ background: '#e2e8f0', color: '#64748b' }}>{modules[modKey].count} Items</span>
                                  </div>
                                  <div style={{ padding: '1rem' }}>
                                    {Object.keys(modules[modKey].units).sort().map(unitKey => (
                                      <div key={unitKey} style={{ marginBottom: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid #3b82f6' }}>
                                        <div style={{ fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Unit {unitKey}</div>
                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                          {modules[modKey].units[unitKey].map(m => (
                                            <div key={m.id || m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                                <span className={`badge ${m.type}`} style={{ fontSize: '0.7rem' }}>{m.type}</span>
                                                <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{m.topic || m.title}</span>
                                              </div>
                                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => window.open(getFileUrl(m.url), '_blank')} className="btn-icon" title="View"><FaEye /></button>
                                                <button onClick={() => handleDeleteMaterial(m.id || m._id)} className="btn-icon danger" title="Delete"><FaTrash /></button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                          <button type="button" onClick={closeModal} className="btn-secondary">Close</button>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Forms based on modalType */}
                    {modalType === 'student' && (
                      <form onSubmit={handleSaveStudent}>
                        <div className="form-group">
                          <label>Name</label>
                          <input name="studentName" defaultValue={editItem?.studentName} required />
                        </div>
                        <div className="form-group">
                          <label>Student ID</label>
                          <input name="sid" defaultValue={editItem?.sid} required />
                        </div>
                        <div className="row">
                          <div className="form-group">
                            <label>Year</label>
                            <select name="year" defaultValue={editItem?.year || '1'}>
                              <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Branch</label>
                            <select name="branch" defaultValue={editItem?.branch || 'CSE'}>
                              <option value="CSE">CSE</option><option value="ECE">ECE</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Section</label>
                            <select name="section" defaultValue={editItem?.section || 'A'}>
                              {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <input name="email" type="email" defaultValue={editItem?.email} />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input name="password" type="password" defaultValue={editItem?.password} placeholder={editItem ? "Leave blank to keep same" : ""} />
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                          <button className="btn-submit">Save Student</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'bulk-student' && (
                      <form onSubmit={handleBulkUploadStudents}>
                        <div className="form-group">
                          <label>Select CSV File</label>
                          <input type="file" name="file" accept=".csv" required />
                          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                            CSV must have headers: <code>studentName, sid, email, year, section, branch</code>
                          </p>
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                          <button className="btn-submit">Upload CSV</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'student-view' && editItem && (
                      <div className="view-details" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                          <div>
                            <h3 style={{ margin: 0, color: '#1e293b' }}>{editItem.studentName}</h3>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{editItem.sid}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="badge" style={{ fontSize: '0.9rem' }}>Year {editItem.year} • {editItem.branch}</div>
                            <div style={{ marginTop: '0.5rem', color: '#64748b' }}>Sec: {editItem.section}</div>
                          </div>
                        </div>

                        {/* 360 DEGREE OVERVIEW */}
                        {overviewData ? (
                          <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FaChartLine /> Performance Overview
                            </h4>
                            <AcademicPulse data={overviewData} />
                          </div>
                        ) : (
                          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                            Loading academic data...
                          </div>
                        )}

                        <div className="detail-row"><strong>Email:</strong> {editItem.email}</div>
                        <div className="detail-row"><strong>Joined:</strong> {new Date().toLocaleDateString()}</div>

                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                          <button onClick={closeModal} className="btn-primary">Close</button>
                        </div>
                      </div>
                    )}

                    {modalType === 'material-view' && editItem && (
                      <div className="view-details">
                        <div className="detail-row"><strong>Title:</strong> {editItem.title}</div>
                        <div className="detail-row"><strong>Type:</strong> {editItem.type}</div>
                        <div className="detail-row"><strong>Subject:</strong> {editItem.subject}</div>
                        <div className="detail-row"><strong>Year:</strong> {editItem.year}</div>
                        <div className="detail-row"><strong>Section:</strong> {editItem.section || 'All'}</div>
                        <div className="detail-row"><strong>Module:</strong> {editItem.module}</div>
                        <div className="detail-row"><strong>Unit:</strong> {editItem.unit}</div>
                        <div className="detail-row"><strong>Topic:</strong> {editItem.topic || 'General'}</div>
                        <div className="detail-row"><strong>Uploaded By:</strong> {editItem.uploadedBy?.name || editItem.uploadedBy || 'Unknown'}</div>
                        <div className="detail-row"><strong>Uploaded At:</strong> {new Date(editItem.uploadedAt).toLocaleString()}</div>
                        {editItem.url && (
                          <div className="detail-row">
                            <strong>URL:</strong>
                            <a href={getFileUrl(editItem.url)} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                              {editItem.url}
                            </a>
                          </div>
                        )}
                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                          <button onClick={() => openModal('material', editItem)} className="btn-secondary" style={{ marginRight: '1rem' }}>Edit</button>
                          <button onClick={closeModal} className="btn-primary">Close</button>
                        </div>
                      </div>
                    )}

                    {modalType === 'faculty' && (
                      <form onSubmit={handleSaveFaculty}>
                        <div className="form-group">
                          <label>Name</label>
                          <input name="name" defaultValue={editItem?.name} required />
                        </div>
                        <div className="form-group">
                          <label>Faculty ID</label>
                          <input name="facultyId" defaultValue={editItem?.facultyId} required />
                        </div>
                        <div className="form-group">
                          <label>Department</label>
                          <input name="department" defaultValue={editItem?.department || 'CSE'} />
                        </div>
                        <div className="form-group">
                          <label>Designation</label>
                          <input name="designation" defaultValue={editItem?.designation} />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input name="password" type="password" />
                        </div>

                        {/* Assignment Manager */}
                        <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid #e2e8f0' }}>
                          <label style={{ marginBottom: '0.5rem', display: 'block', color: '#334155' }}>Teaching Assignments</label>

                          <div className="row" style={{ alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                              <label style={{ fontSize: '0.8rem' }}>Year</label>
                              <select id="assign-year" style={{ padding: '0.5rem' }}>
                                <option value="">Select</option>
                                <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                              <label style={{ fontSize: '0.8rem' }}>Section</label>
                              <select id="assign-section" style={{ padding: '0.5rem', width: '100%' }}>
                                <option value="">Select</option>
                                {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                              <label style={{ fontSize: '0.8rem' }}>Subject</label>
                              <select id="assign-subject" style={{ padding: '0.5rem', width: '100%' }}>
                                <option value="">Select Subject</option>
                                {courses.map(c => <option key={c.code} value={c.name}>{c.name} ({c.code})</option>)}
                              </select>
                            </div>
                            <button type="button" onClick={handleAddAssignment} className="btn-primary" style={{ padding: '0.6rem', marginBottom: '2px' }}>Add</button>
                          </div>

                          <div className="assignments-list" style={{ marginTop: '1rem' }}>
                            {facultyAssignments.map((assign, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '0.9rem' }}><strong>Y{assign.year}</strong> - Sec {assign.section} - {assign.subject}</span>
                                <button type="button" onClick={() => handleRemoveAssignment(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                  <FaTrash />
                                </button>
                              </div>
                            ))}
                            {facultyAssignments.length === 0 && <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No assignments added yet.</p>}
                          </div>
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                          <button className="btn-submit">Save Faculty</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'course' && (
                      <form onSubmit={handleSaveCourse}>
                        <div className="form-group">
                          <label>Course Name</label>
                          <input name="name" defaultValue={editItem?.name} required />
                        </div>
                        <div className="form-group">
                          <label>Course Code</label>
                          <input name="code" defaultValue={editItem?.code} required />
                        </div>
                        <div className="row">
                          <div className="form-group">
                            <label>Year</label>
                            <select name="year" defaultValue={editItem?.year || '1'} required style={{ padding: '0.8rem', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}>
                              <option value="1">Year 1</option>
                              <option value="2">Year 2</option>
                              <option value="3">Year 3</option>
                              <option value="4">Year 4</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Semester</label>
                            <select name="semester" defaultValue={editItem?.semester || '1'} required style={{ padding: '0.8rem', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}>
                              <option value="1">Semester 1</option>
                              <option value="2">Semester 2</option>
                              <option value="3">Semester 3</option>
                              <option value="4">Semester 4</option>
                              <option value="5">Semester 5</option>
                              <option value="6">Semester 6</option>
                              <option value="7">Semester 7</option>
                              <option value="8">Semester 8</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Branch</label>
                          <select name="branch" defaultValue={editItem?.branch || 'CSE'} required style={{ padding: '0.8rem', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="IT">IT</option>
                            <option value="AIML">AIML</option>
                            <option value="All">All / Common</option>
                          </select>
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                          <button className="btn-submit">Save Subject</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'material' && (
                      <form onSubmit={handleSaveMaterial}>
                        <div className="form-group">
                          <label>Type</label>
                          <select name="type" defaultValue="notes">
                            <option value="notes">Notes</option>
                            <option value="videos">Video</option>
                            <option value="interview">Interview Q&A</option>
                            <option value="modelPapers">Model Paper</option>
                            <option value="syllabus">Syllabus</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Title</label>
                          <input name="title" required placeholder="e.g. Unit 1 Notes" />
                        </div>
                        <div className="row">
                          <div className="form-group">
                            <label>Year</label>
                            <select name="year" required defaultValue={editItem?.isAdvanced ? 'Advanced' : (editItem?.year || '1')}>
                              {editItem?.isAdvanced ? <option value="Advanced">Advanced Flow</option> :
                                <>
                                  <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                                </>
                              }
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Subject</label>
                            <select name="subject" required defaultValue={editItem?.subject || ''}>
                              <option value="">Select...</option>
                              {editItem?.isAdvanced
                                ? ADVANCED_TOPICS.map(t => <option key={t} value={t}>{t}</option>)
                                : courses.map(c => <option key={c.code} value={c.name}>{c.name}</option>)
                              }
                            </select>
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group">
                            <label>Module</label>
                            <select name="module">
                              <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Unit</label>
                            <select name="unit">
                              <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
                            </select>
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group">
                            <label>Branch</label>
                            <select name="branch" defaultValue="All">
                              <option value="All">All Branches</option>
                              <option value="CSE">CSE</option>
                              <option value="AIML">AIML</option>
                              <option value="IT">IT</option>
                              <option value="ECE">ECE</option>
                              <option value="EEE">EEE</option>
                              <option value="MECH">MECH</option>
                              <option value="CIVIL">CIVIL</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Semester</label>
                            <select name="semester" defaultValue="1">
                              <option value="1">Semester 1</option>
                              <option value="2">Semester 2</option>
                              <option value="3">Semester 3</option>
                              <option value="4">Semester 4</option>
                              <option value="5">Semester 5</option>
                              <option value="6">Semester 6</option>
                              <option value="7">Semester 7</option>
                              <option value="8">Semester 8</option>
                            </select>
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group">
                            <label>Target Section</label>
                            <select name="section" style={{ width: '100%' }}>
                              <option value="">All Sections</option>
                              {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Topic Name</label>
                            <input name="topic" placeholder="e.g. Introduction" style={{ width: '100%' }} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Upload File</label>
                          <input type="file" name="file" />
                        </div>
                        <div className="form-group">
                          <label>Or External URL</label>
                          <input name="url" placeholder="https://..." />
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                          <button className="btn-submit">Upload & Publish</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'todo' && (
                      <form onSubmit={handleSaveTodo}>
                        <div className="form-group">
                          <label>Task Description</label>
                          <textarea name="text" defaultValue={editItem?.text} required rows="3"></textarea>
                        </div>
                        <div className="row">
                          <div className="form-group">
                            <label>Assigned To</label>
                            <select name="target" defaultValue={editItem?.target || 'admin'}>
                              <option value="admin">Admin Only (Private)</option>
                              <option value="all">Everyone (Public Notice)</option>
                              <option value="student">All Students</option>
                              <option value="faculty">All Faculty</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Due Date (Optional)</label>
                            <input type="date" name="dueDate" defaultValue={editItem?.dueDate} />
                          </div>
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                          <button className="btn-submit">Save Task</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'message' && (
                      <form onSubmit={handleSendMessage}>
                        <div className="form-group">
                          <label>Target Audience</label>
                          <select name="target" value={msgTarget} onChange={(e) => setMsgTarget(e.target.value)}>
                            <option value="all">Everyone (Global)</option>
                            <option value="students">All Students</option>
                            <option value="students-specific">Specific Students (Year/Section)</option>
                            <option value="faculty">Faculty Only</option>
                          </select>
                        </div>

                        {msgTarget === 'students-specific' && (
                          <div className="animate-fade-in" style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <div className="form-group">
                              <label>Target Year</label>
                              <select name="targetYear">
                                <option value="1">Year 1</option>
                                <option value="2">Year 2</option>
                                <option value="3">Year 3</option>
                                <option value="4">Year 4</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Target Sections (Ctrl+Click to multi-select)</label>
                              <select name="targetSections" multiple style={{ height: '100px' }}>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                                <option value="C">Section C</option>
                                <option value="D">Section D</option>
                                <option value="E">Section E</option>
                              </select>
                            </div>
                          </div>
                        )}

                        <div className="form-group">
                          <label>Transmission Content</label>
                          <textarea name="message" required rows="5" placeholder="Type your message here..."></textarea>
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                          <button className="btn-submit">Initiate Transmission</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )
          );
        })()
      }

      {/* Admin About Modal */}
      {showAbout && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)', animation: 'fadeIn 0.4s ease-out'
        }}>
          <div className="modal-content animate-slide-up" style={{
            background: 'rgba(255, 255, 255, 0.95)', width: '100%', maxWidth: '440px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'flex', flexDirection: 'column', position: 'relative'
          }}>
            <div style={{
              padding: '2rem 2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <FaBookOpen />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Friendly Admin</h2>
              </div>
              <button onClick={() => setShowAbout(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}>&times;</button>
            </div>

            <div style={{ padding: '0 2rem 2rem', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
                <div style={{ width: '100px', height: '100px', margin: '0 auto 1.2rem', borderRadius: '30px', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontSize: '3rem', fontWeight: 900 }}>
                  A
                </div>
                <h3 style={{ margin: '0 0 0.3rem', color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>System Administrator</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Vignan Governance High Council</p>
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.04)', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <h4 style={{ color: '#2563eb', margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Governance Console</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.8rem' }}>
                  {[
                    { t: 'User Oversight', d: 'Manage student & faculty directories' },
                    { t: 'Global Broadcast', d: 'Send instantaneous system-wide alerts' },
                    { t: 'Course Logistics', d: 'Maintain subjects & academic branches' },
                    { t: 'Analytical Command', d: 'Real-time university activity tracking' }
                  ].map((feat, i) => (
                    <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ color: '#10b981', marginTop: '3px' }}>✓</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>{feat.t}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{feat.d}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>POWERED BY</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' }}>FRIENDLY NOTEBOOK</span>
                  <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: '#3b82f6' }}></div>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>v2.5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <AnnouncementTicker messages={messages} />
    </div >
  );
}
