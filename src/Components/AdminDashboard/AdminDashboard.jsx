import React, { useState, useEffect, useMemo } from 'react';

import AdminHeader from './Sections/AdminHeader';
import './AdminDashboard.css';
import { readFaculty, readStudents, writeStudents, writeFaculty } from '../../utils/localdb';
import api from '../../utils/apiClient';
import { getYearData } from '../StudentDashboard/branchData';
// import AcademicPulse from '../StudentDashboard/AcademicPulse'; // Removed unused import
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import AdminAttendancePanel from './AdminAttendancePanel';
import AdminScheduleManager from './AdminScheduleManager';
import AdminExams from './AdminExams';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaEnvelope, FaPlus, FaTrash, FaEye, FaBookOpen, FaRobot, FaFileUpload, FaBullhorn, FaLayerGroup, FaCreditCard } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import sseClient from '../../utils/sseClient';

// Newly extracted sections
import StudentSection from './Sections/StudentSection';
import FacultySection from './Sections/FacultySection';
import MaterialSection from './Sections/MaterialSection';
import MessageSection from './Sections/MessageSection';
import TodoSection from './Sections/TodoSection';
import AcademicHub from './Sections/AcademicHub';
import AdminMarks from './AdminMarks';
import PersonalDetailsBall from '../PersonalDetailsBall/PersonalDetailsBall';


// Helper for mocked API or local storage check
const USE_API = true; // Always use API in unified app mode (defaults to localhost:5000)

const ADVANCED_TOPICS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cloud Computing',
  'Cyber Security',
  'DevOps',
  'Blockchain',
  'Internet of Things',
  'Robotics',
  'Quantum Computing'
];

const SECTION_OPTIONS = [
  // Letters A-P
  ...'ABCDEFGHIJKLMNOP'.split(''),
  // Numbers 1-20
  ...Array.from({ length: 20 }, (_, i) => String(i + 1))
];

export default function AdminDashboard({ setIsAuthenticated, setIsAdmin, setStudentData }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data States
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [todos, setTodos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fees, setFees] = useState([]);

  // Form States
  const [showModal, setShowModal] = useState(false);

  const [modalType, setModalType] = useState(null); // 'student', 'faculty', 'course', 'material', 'todo', 'message'
  const [editItem, setEditItem] = useState(null);
  const [facultyAssignments, setFacultyAssignments] = useState([]); // For managing multiple teaching assignments
  const [msgTarget, setMsgTarget] = useState('all'); // Targeted messages state
  const [globalSectionFilter, setGlobalSectionFilter] = useState('A');
  // Centralized subject registry (merges database + static curriculum)
  const allAvailableSubjects = useMemo(() => {
    const dbSubjects = courses.map(c => ({ name: c.name, code: c.code, branch: c.branch }));
    const staticBranches = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'AIML'];
    let staticSubjects = [];
    staticBranches.forEach(b => {
      [1, 2, 3, 4].forEach(y => {
        const data = getYearData(b, String(y));
        data?.semesters?.forEach(s => {
          s.subjects.forEach(sub => {
            if (!staticSubjects.find(ex => ex.code === sub.code)) {
              staticSubjects.push({ name: sub.name, code: sub.code, branch: b });
            }
          });
        });
      });
    });

    const merged = [...dbSubjects];
    staticSubjects.forEach(ss => {
      if (!merged.some(ms => ms.code === ss.code || ms.name === ss.name)) merged.push(ss);
    });
    return merged.sort((a, b) => a.name.localeCompare(b.name));
  }, [courses]);

  // Load Initial Data
  useEffect(() => {
    console.log('🚀 AdminDashboard: Initial data load started');
    loadData();
    // Load ToDos from local storage
    const savedTodos = JSON.parse(localStorage.getItem('adminTodos') || '[]');
    setTodos(savedTodos);

    // Optimized polling: 5 seconds (more efficient than 2s)
    const interval = setInterval(() => {
      console.log('🔄 AdminDashboard: Polling data from database...');
      loadData();
    }, 5000);

    // Fast announcements update every 5s
    const messagesInterval = setInterval(async () => {
      try {
        if (USE_API) {
          const msg = await api.apiGet('/api/messages');
          setMessages(Array.isArray(msg) ? msg.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)) : []);
        }
      } catch (e) {
        console.debug('Messages refresh failed', e);
      }
    }, 5000);

    return () => {
      console.log('🛑 AdminDashboard: Cleaning up intervals');
      clearInterval(interval);
      clearInterval(messagesInterval);
    };
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
                  const facultyWithAssignments = (Array.isArray(f) ? f : []).map(faculty => ({
                    ...faculty,
                    assignments: Array.isArray(faculty.assignments) ? faculty.assignments : []
                  }));
                  console.log('🔄 SSE Faculty refresh:', facultyWithAssignments);
                  setFaculty(facultyWithAssignments);
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
      console.log('📊 loadData: Starting data fetch from database...');
      if (USE_API) {
        const fetchSafely = async (path, defaultVal = []) => {
          try {
            console.log(`   → Fetching ${path}...`);
            const res = await api.apiGet(path);
            console.log(`   ✅ ${path} fetched:`, Array.isArray(res) ? `${res.length} items` : 'object');
            return Array.isArray(res) ? res : (res?.data || defaultVal);
          } catch (e) {
            console.error(`   ❌ ${path} failed:`, e.message);
            return defaultVal;
          }
        };

        const [s, f, c, m, msg, t, feesRes] = await Promise.all([
          fetchSafely('/api/students'),
          fetchSafely('/api/faculty'),
          fetchSafely('/api/courses'),
          fetchSafely('/api/materials'),
          fetchSafely('/api/messages'),
          fetchSafely('/api/todos'),
          fetchSafely('/api/fees')
        ]);

        // Ensure faculty data includes assignments properly
        const facultyWithAssignments = (f || []).map(faculty => ({
          ...faculty,
          assignments: Array.isArray(faculty.assignments) ? faculty.assignments : []
        }));

        console.log('📊 loadData: Data loaded successfully');
        console.log('   • Students:', s.length);
        console.log('   • Faculty:', facultyWithAssignments.length);
        console.log('   • Courses:', c.length);
        console.log('   • Materials:', m.length);
        console.log('   • Messages:', msg.length);
        console.log('   • Todos:', t.length);

        setStudents(s);
        setFaculty(facultyWithAssignments);
        setCourses(c);
        setMaterials(m);
        setMessages(msg.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
        setTodos(t);
        setFees(feesRes || []);
      } else {
        console.log('📊 loadData: Using local storage (API disabled)');
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
      console.error('❌ loadData: Critical error:', err);
      console.error('   Error details:', err.message);
      console.error('   Stack:', err.stack);
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

  // Bulk Faculty Upload
  const handleBulkUploadFaculty = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await api.apiUpload('/api/faculty/bulk', formData);
      alert(res.message || 'Bulk faculty upload completed');
      loadData(); // Refresh list
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Bulk faculty upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  // Faculty
  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Remove empty password for updates (don't change if not provided)
    if (editItem && !data.password) {
      delete data.password;
    } else if (!editItem && !data.password) {
      // Password required for new faculty
      alert('Password is required for new faculty');
      return;
    }

    // Merge assignments - ensure they're formatted correctly
    data.assignments = facultyAssignments.map(a => ({
      year: String(a.year),
      section: String(a.section).toUpperCase().trim(),
      subject: String(a.subject).trim(),
      branch: a.branch || 'CSE',
      semester: a.semester || ''
    }));

    console.log('📝 FRONTEND: Preparing to save faculty');
    console.log('Form data received from form:');
    console.log('  name:', data.name);
    console.log('  facultyId:', data.facultyId);
    console.log('  password:', data.password ? '(provided)' : '(missing)');
    console.log('  department:', data.department);
    console.log('  designation:', data.designation);
    console.log('  assignments count:', data.assignments.length);
    console.log('Complete data object being sent to API:', data);

    try {
      let newFaculty = [...faculty];
      if (editItem) {
        // EDIT - Update existing faculty in database
        if (USE_API) {
          const idToUpdate = editItem._id || editItem.facultyId;
          console.log('🔄 Updating faculty:', idToUpdate);

          const updatedData = await api.apiPut(`/api/faculty/${idToUpdate}`, data);
          console.log('✅ Faculty updated from server:', updatedData);

          // Ensure assignments is preserved in the state
          newFaculty = newFaculty.map(f => {
            const isSameFaculty = (f._id && updatedData._id && f._id.toString() === updatedData._id.toString()) ||
              f.facultyId === editItem.facultyId;
            if (isSameFaculty) {
              return {
                ...f,
                ...updatedData,
                assignments: Array.isArray(updatedData.assignments) ? updatedData.assignments : data.assignments,
                id: updatedData.facultyId || updatedData.id,
                _id: updatedData._id
              };
            }
            return f;
          });
          console.log('✅ Faculty list updated in state:', newFaculty.length, 'faculty members');
        } else {
          newFaculty = newFaculty.map(f => f.facultyId === editItem.facultyId ? { ...f, ...data } : f);
          await writeFaculty(newFaculty);
        }
      } else {
        // CREATE - Add new faculty to database
        if (USE_API) {
          console.log('➕ Creating new faculty');
          const newF = await api.apiPost('/api/faculty', data);
          console.log('✅ New Faculty created from server:', newF);

          // Ensure assignments is set and formatted correctly
          const facultyEntry = {
            ...newF,
            assignments: Array.isArray(newF.assignments) ? newF.assignments : data.assignments,
            id: newF.facultyId || newF.id,
            _id: newF._id
          };
          newFaculty.push(facultyEntry);
          console.log('✅ New faculty added to state, total:', newFaculty.length);
        } else {
          const newF = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
          newFaculty.push(newF);
          await writeFaculty(newFaculty);
        }
      }

      setFaculty(newFaculty);
      console.log('✅ Faculty state updated successfully');
      closeModal();

      // Force immediate data reload to ensure dashboard shows updated data
      if (USE_API) {
        console.log('🔄 Forcing faculty data reload...');
        await loadData();
      }
    } catch (err) {
      console.error('Faculty Save Error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
      alert('Failed to save faculty. ' + errorMsg);
    }
  };

  const handleAddAssignment = () => {
    const year = document.getElementById('assign-year').value;
    const section = document.getElementById('assign-section').value;
    const subject = document.getElementById('assign-subject').value;
    const branch = document.getElementById('assign-branch').value;

    if (year && section && subject && branch) {
      setFacultyAssignments([...facultyAssignments, { year, section, subject, branch }]);
      // clear inputs
      document.getElementById('assign-section').value = '';
      document.getElementById('assign-subject').value = '';
    } else {
      alert('Please fill Year, Branch, Section and Subject');
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

      // Force immediate data reload to ensure dashboard shows updated data
      if (USE_API) {
        console.log('🔄 Forcing faculty data reload after delete...');
        await loadData();
      }
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
            const idToUpdate = editItem._id || editItem.id;
            await api.apiPut(`/api/courses/${idToUpdate}`, data);
            newCourses = newCourses.map(c => (c._id === idToUpdate || c.id === idToUpdate) ? { ...c, ...data } : c);
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
      // Ensure other dashboards reload fresh from server to reflect canonical DB state
      if (USE_API) await loadData();
    } catch (err) {
      console.error('Course Save Error:', err);
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('401') || errorMsg.includes('Authentication required') || errorMsg.toLowerCase().includes('session expired')) {
        alert('Authentication failed: Your session may have expired. Please log out and log in again.');
        // Force logout to clear stale tokens
        try { handleLogout(); } catch (e) { console.warn('Logout failed', e); }
      } else if (errorMsg.includes('409')) {
        alert('Course code already exists. Please use a unique course code.');
      } else {
        alert('Failed to save subject: ' + errorMsg);
      }
    }
  };

  const handleDeleteCourse = async (courseOrId) => {
    // 1. Resolve ID and Course
    let courseToDelete;

    if (typeof courseOrId === 'object' && courseOrId !== null) {
      courseToDelete = courseOrId;
    } else {
      courseToDelete = courses.find(c => String(c.id) === String(courseOrId) || String(c._id) === String(courseOrId));
    }

    if (!courseToDelete) {
      console.warn("handleDeleteCourse: Course not found", courseOrId);
      return;
    }

    const { id, _id, name, isStatic } = courseToDelete;
    const realId = _id || id;

    if (!window.confirm(`Delete Subject: ${name}?`)) return;

    // 2. Handle Static Courses (Complex Logic - No Optimistic)
    // Check if explicitly marked static OR no ID (implies static/generated)
    if (isStatic || String(realId).startsWith('static-') || !realId) {
      try {
        if (USE_API) {
          const { year, semester, branch } = courseToDelete; // These should be present on the object passed from AcademicHub

          // 1. Find siblings - We must re-generate the full list for that context to know what to migrate
          // We can't rely just on 'courses' state because it lacks static items.
          // Strategy: Use getYearData again or assume AcademicHub logic.
          // Better Strategy: Just fetch the static data for that specific Year/Branch
          const staticData = getYearData(branch || 'CSE', String(year));
          let siblings = [];

          if (staticData && staticData.semesters) {
            const semData = staticData.semesters.find(s => String(s.sem) === String(semester));
            if (semData && semData.subjects) {
              // Filter out the one we are deleting
              siblings = semData.subjects.filter(s => s.code !== courseToDelete.code && s.name !== courseToDelete.name);
            }
          }

          console.log(`[Delete Static] Found ${siblings.length} siblings to migrate.`);

          // 2. Promote siblings
          let successCount = 0;
          for (const sib of siblings) {
            try {
              const payload = {
                name: sib.name,
                code: sib.code,
                year: year,       // Ensure these context fields are preserved
                semester: semester,
                branch: branch || 'CSE',
                description: sib.description || '',
                credits: sib.credits || 3,
                section: 'All' // Default to all sections when migrating base curriculum
              };
              await api.apiPost('/api/courses', payload);
              successCount++;
            } catch (innerErr) {
              if (innerErr.message && !innerErr.message.includes('409')) {
                console.error('Failed to migrate sibling:', sib.name, innerErr);
              } else if (innerErr.message && innerErr.message.includes('409')) {
                // Clone existing checks? If 409, it means it's already dynamic, so we are good.
                successCount++;
              }
            }
          }

          alert(`Deleted default subject. Automatically migrated ${successCount} other subjects to database.`);
          loadData();
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete static subject: ' + err.message);
      }
      return;
    }

    // 3. Handle Dynamic Courses (Optimistic Update)
    const previousCourses = [...courses];
    const targetId = _id || id;

    // Optimistic: Remove immediately from UI
    setCourses(prev => prev.filter(c => c.id !== targetId && c._id !== targetId));

    try {
      if (USE_API) {
        await api.apiDelete(`/api/courses/${targetId}`);
        // Refresh canonical data to keep dashboards in sync
        await loadData();
      } else {
        const newCourses = previousCourses.filter(c => c.id !== targetId && c._id !== targetId);
        localStorage.setItem('courses', JSON.stringify(newCourses));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete subject: ' + err.message);
      // Revert if API fails
      setCourses(previousCourses);
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

        // Handle isAdvanced checkbox separately if needed or ensure it's in data
        const isAdvanced = e.target.isAdvanced?.checked;
        apiFormData.append('isAdvanced', isAdvanced ? 'true' : 'false');
        console.log(`[Material Upload] Adding field: isAdvanced = ${isAdvanced}`);

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

          // Use apiUpload which handles FormData correctly (including files)
          // We pass 'PUT' as the third argument which we enabled in apiClient
          const res = await api.apiUpload(`/api/materials/${idToUpdate}`, apiFormData, 'PUT');

          const updatedMat = { ...editItem, ...res.data || res };
          allMaterials = allMaterials.map(m => (m.id === editItem.id || m._id === editItem._id) ? updatedMat : m);
        } else {
          console.log('[Material Upload] Creating new material...');

          try {
            console.log('[Material Upload] FormData size:', apiFormData.get('file')?.size || 'no file');
            console.log('[Material Upload] Sending to /api/materials with POST...');

            const res = await api.apiUpload('/api/materials', apiFormData);
            console.log('[Material Upload] SUCCESS! Response:', res);

            if (res && (res._id || res.id)) {
              console.log('[Material Upload] Adding successful response to materials array');
              allMaterials.push(res);
            } else {
              console.warn('[Material Upload] Response missing ID, creating local fallback');
              const fallbackItem = { ...data, id: Date.now().toString(), uploadedAt: new Date().toISOString() };
              allMaterials.push(fallbackItem);
            }
          } catch (uploadError) {
            console.error('[Material Upload] ERROR during upload:', uploadError.message);
            console.error('[Material Upload] Stack:', uploadError.stack);

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

  // Fees
  const handleSaveFee = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (USE_API) {
        const sid = data.studentId || editItem?.studentId;
        await api.apiPut(`/api/fees/${sid}`, {
          totalFee: parseFloat(data.totalFee),
          paidAmount: parseFloat(data.paidAmount),
          academicYear: data.academicYear,
          semester: data.semester
        });
        await loadData();
      }
      closeModal();
      alert('Fee record updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save fee record');
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
    const idToDelete = id;
    try {
      if (USE_API) {
        await api.apiDelete(`/api/todos/${idToDelete}`);
      } else {
        const newTodos = todos.filter(t => t.id !== idToDelete);
        setTodos(newTodos);
        localStorage.setItem('adminTodos', JSON.stringify(newTodos));
      }
      setTodos(prev => prev.filter(t => t.id !== idToDelete));
    } catch (e) {
      console.error(e);
      alert("Failed to delete task");
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
      alert('✅ Announcement Successfully Sent');
      closeModal();
    } catch (err) {
      console.error('Announcement Sending Failed:', err);
      alert('Error: ' + (err.message || 'Unknown error'));
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

  return (
    <div className="admin-dashboard-v2">
      <AdminHeader
        adminData={{ name: 'System Administrator', role: 'Main Administrator' }}
        view={activeSection}
        setView={setActiveSection}
        openModal={openModal}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Mobile Menu Toggle */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        <FaRobot />
      </button>

      <main className="admin-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="admin-content-scroll"
          >

            {activeSection === 'overview' && (
              <div className="animate-fade-in">
                <header className="admin-page-header">
                  <div className="admin-page-title">
                    <h1>{new Date().getHours() < 12 ? 'MORNING' : new Date().getHours() < 18 ? 'AFTERNOON' : 'EVENING'} <span>ADMIN</span></h1>
                    <p>Dashboard Overview and Real-time Status</p>
                  </div>
                  <div className="f-sync-badge">
                    SYSTEM TIME: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </header>


                {/* Dashboard Quick Links */}
                <div className="admin-equal-layout" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
                  <div className="f-node-card animate-slide-up" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.1))', borderTop: '3px solid #3b82f6', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => setActiveSection('students')}>
                    <div className="f-node-head">
                      <h4 className="f-node-title"><FaUserGraduate /> MANAGE STUDENTS</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>View, edit, and manage all student records and enrollment data</p>
                  </div>
                  <div className="f-node-card animate-slide-up" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))', borderTop: '3px solid #10b981', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => setActiveSection('faculty')}>
                    <div className="f-node-head">
                      <h4 className="f-node-title"><FaChalkboardTeacher /> MANAGE FACULTY</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>Oversee instructor assignments and teaching schedules</p>
                  </div>
                </div>

                <div className="admin-stats-grid">
                  <div className="admin-summary-card animate-slide-up" onClick={() => setActiveSection('students')} style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div className="summary-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--admin-primary)' }}><FaUserGraduate /></div>
                    <div className="value">{students.length}</div>
                    <div className="label">TOTAL STUDENTS</div>
                  </div>
                  <div className="admin-summary-card animate-slide-up" onClick={() => setActiveSection('faculty')} style={{ animationDelay: '0.1s', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div className="summary-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><FaChalkboardTeacher /></div>
                    <div className="value">{faculty.length}</div>
                    <div className="label">FACULTY MEMBERS</div>
                  </div>
                  <div className="admin-summary-card animate-slide-up" onClick={() => setActiveSection('courses')} style={{ animationDelay: '0.2s', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div className="summary-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><FaBook /></div>
                    <div className="value">{courses.length}</div>
                    <div className="label">ACTIVE SUBJECTS</div>
                  </div>
                  <div className="admin-summary-card animate-slide-up" onClick={() => setActiveSection('materials')} style={{ animationDelay: '0.3s', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div className="summary-icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><FaLayerGroup /></div>
                    <div className="value">{materials.length}</div>
                    <div className="label">UPLOADED FILES</div>
                  </div>
                  <div className="admin-summary-card animate-slide-up" onClick={() => setActiveSection('fees')} style={{ animationDelay: '0.4s', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div className="summary-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--admin-primary)' }}><FaCreditCard /></div>
                    <div className="value">₹{(fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0) / 1000).toFixed(1)}K+</div>
                    <div className="label">REVENUE COLLECTED</div>
                  </div>
                </div>

                <div className="admin-split-layout">


                  <div className="f-node-card animate-slide-up" style={{ animationDelay: '0.5s', display: 'flex', flexDirection: 'column' }}>
                    <div className="f-node-head">
                      <h3 className="f-node-title">TASKS QUEUE</h3>
                      <button onClick={() => setActiveSection('todos')} className="admin-btn admin-btn-outline" style={{ height: '32px', fontSize: '0.65rem', border: 'none' }}>MANAGE</button>
                    </div>
                    <div className="admin-list-container" style={{ gap: '0.75rem', marginTop: '1.25rem', flex: 1 }}>
                      {todos.filter(t => !t.completed).slice(0, 5).map(t => (
                        <div key={t.id} className="admin-summary-tag">
                          <div className="admin-summary-dot"></div>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.text}</span>
                        </div>
                      ))}
                      {todos.filter(t => !t.completed).length === 0 && <p className="admin-empty-text" style={{ margin: 'auto' }}>ALL TASKS COMPLETED</p>}
                    </div>
                  </div>
                  <div className="admin-equal-layout">
                    <div className="f-node-card animate-slide-up" style={{ animationDelay: '0.7s' }}>
                      <div className="f-node-head">
                        <h3 className="f-node-title">STUDENT PERFORMANCE</h3>
                        <span className="admin-badge accent">REAL-TIME</span>
                      </div>
                      <div style={{ padding: '0.5rem' }}>
                        <div className="admin-empty-state">
                          <p className="admin-empty-text">MODULE UNAVAILABLE</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-nexus-banner animate-slide-up" onClick={() => setActiveSection('ai-agent')} style={{ animationDelay: '0.8s' }}>
                  <div className="summary-icon-box" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', width: '70px', height: '70px', borderRadius: '20px' }}>
                    <FaRobot size={32} />
                  </div>
                  <div>
                    <h3 style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.5px' }}>AI ASSISTANT</h3>
                    <p style={{ margin: '0.4rem 0 0', opacity: 0.85, fontSize: '0.9rem', fontWeight: 850 }}>Launch AI agent for automated assistance.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Sections based on Header Navigation */}
            {activeSection === 'students' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>STUDENT REGISTRY</h2>
                  <div className="admin-badge primary">MANAGE STUDENTS</div>
                </div>
                <StudentSection
                  students={students}
                  openModal={openModal}
                  handleDeleteStudent={handleDeleteStudent}
                />
              </div>
            )}

            {activeSection === 'faculty' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>FACULTY DIRECTORY</h2>
                  <div className="admin-badge accent">MANAGE STAFF</div>
                </div>
                <FacultySection
                  faculty={faculty}
                  students={students}
                  openModal={openModal}
                  handleDeleteFaculty={handleDeleteFaculty}
                  allSubjects={allAvailableSubjects}
                />
              </div>
            )}

            {activeSection === 'courses' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <AcademicHub
                  courses={courses}
                  students={students}
                  materials={materials}
                  openModal={openModal}
                  handleDeleteCourse={handleDeleteCourse}
                  initialSection={globalSectionFilter}
                  onSectionChange={setGlobalSectionFilter}
                />
              </div>
            )}

            {activeSection === 'materials' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 3rem' }}>
                <div className="f-node-head" style={{ marginBottom: '3rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>MATERIAL MANAGER</h2>
                  <div className="admin-badge warning">FILES & NOTES</div>
                </div>

                <MaterialSection
                  materials={materials}
                  openModal={openModal}
                  handleDeleteMaterial={handleDeleteMaterial}
                  getFileUrl={getFileUrl}
                  allSubjects={allAvailableSubjects}
                />


              </div>
            )}

            {activeSection === 'attendance' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>ATTENDANCE MONITOR</h2>
                  <div className="admin-badge warning">LIVE VIEW</div>
                </div>
                <AdminAttendancePanel />
              </div>
            )}

            {activeSection === 'schedule' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>SCHEDULE MANAGER</h2>
                  <div className="admin-badge primary">TIMETABLES</div>
                </div>
                <AdminScheduleManager />
              </div>
            )}

            {activeSection === 'todos' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>ADMIN TASKS</h2>
                  <div className="admin-badge danger">PRIORITY</div>
                </div>
                <TodoSection
                  todos={todos}
                  openModal={openModal}
                  toggleTodo={toggleTodo}
                  deleteTodo={deleteTodo}
                />
              </div>
            )}

            {activeSection === 'messages' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>ANNOUNCEMENTS</h2>
                  <div className="admin-badge primary"> BROADCAST</div>
                </div>
                <MessageSection
                  messages={messages}
                  openModal={openModal}
                />
              </div>
            )}

            {activeSection === 'broadcast' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', margin: '4rem 0' }}>
                  <h2 style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-2px', marginBottom: '1rem' }}>BROADCAST SYSTEM</h2>
                  <p style={{ color: 'var(--admin-text-muted)', fontWeight: 850 }}>Send announcements to all students and faculty.</p>
                </div>
                <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '4rem', borderRadius: '32px', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-lg)', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', color: '#f43f5e', marginBottom: '2rem' }}><FaBullhorn /></div>
                  <button onClick={() => openModal('message')} className="admin-btn admin-btn-primary" style={{ width: '100%', height: '70px', fontSize: '1.2rem' }}>
                    CREATE ANNOUNCEMENT
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'marks' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <AdminMarks />
              </div>
            )}

            {activeSection === 'exams' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>EXAM MANAGEMENT</h2>
                  <div className="admin-badge accent">CONTROLS</div>
                </div>
                <AdminExams />
              </div>
            )}

            {activeSection === 'ai-agent' && (
              <div style={{ height: 'calc(100vh - 120px)', padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>AI ASSISTANT</h2>
                  <div className="admin-badge primary">VU AI</div>
                </div>
                <VuAiAgent onNavigate={setActiveSection} />
              </div>
            )}

            {activeSection === 'fees' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>FINANCE MANAGER</h2>
                  <div className="admin-badge primary">FEE RECORDS</div>
                </div>

                <div className="admin-equal-layout" style={{ marginBottom: '2rem' }}>
                  <div className="f-node-card">
                    <h3 className="f-node-title">Fee Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <div className="admin-summary-card" style={{ padding: '1.5rem' }}>
                        <div className="value">₹{fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0).toLocaleString()}</div>
                        <div className="label">TOTAL REVENUE</div>
                      </div>
                      <div className="admin-summary-card" style={{ padding: '1.5rem' }}>
                        <div className="value">₹{fees.reduce((acc, f) => acc + (f.dueAmount || 0), 0).toLocaleString()}</div>
                        <div className="label">TOTAL OUTSTANDING</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="f-node-card">
                  <div className="f-node-head">
                    <h3 className="f-node-title">STUDENT FEE RECORDS</h3>
                  </div>
                  <div className="f-node-body">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Status</th>
                          <th>Total Fee</th>
                          <th>Paid</th>
                          <th>Due</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map(f => (
                          <tr key={f._id}>
                            <td style={{ fontWeight: 950 }}>{f.studentId}</td>
                            <td>
                              <span className={`admin-badge ${f.status === 'Paid' ? 'success' : 'warning'}`}>
                                {f.status}
                              </span>
                            </td>
                            <td>₹{f.totalFee?.toLocaleString()}</td>
                            <td style={{ color: '#10b981', fontWeight: 700 }}>₹{f.paidAmount?.toLocaleString()}</td>
                            <td style={{ color: '#ef4444', fontWeight: 700 }}>₹{f.dueAmount?.toLocaleString()}</td>
                            <td>
                              <button className="icon-btn-v2" onClick={() => {
                                setEditItem(f);
                                setModalType('fee');
                                setShowModal(true);
                              }}>
                                <FaPlus />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>





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
                <div className="modal-content" style={{ width: '95%', maxWidth: modalType === 'syllabus-view' || modalType === 'student-view' ? '900px' : '650px' }}>
                  <div className="modal-header">
                    <h2 style={{ fontWeight: 950, letterSpacing: '0.05em' }}>
                      {modalType === 'about' ? 'SYSTEM INFO' :
                        modalType === 'syllabus-view' ? 'CURRICULUM' :
                          modalType === 'student-view' ? 'STUDENT PROFILE' :
                            modalType === 'material-view' ? 'MATERIAL DETAILS' :
                              editItem ? 'EDIT ' + modalType.toUpperCase() :
                                'CREATE ' + modalType.toUpperCase()}
                    </h2>
                    <button onClick={closeModal} className="close-btn">&times;</button>
                  </div>
                  <div className="modal-body" style={{ padding: '2rem' }}>

                    {/* ABOUT / FEATURES MODAL */}
                    {modalType === 'about' && (
                      <div className="about-content">
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                          <div style={{ width: '100px', height: '100px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--admin-primary)', boxShadow: '0 0 20px rgba(79, 70, 229, 0.2)' }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bobbymartion" alt="Admin" style={{ width: '100%', height: '100%' }} />
                          </div>
                          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--admin-secondary)', fontWeight: 950 }}>ADMIN DASHBOARD</h3>
                          <p style={{ margin: 0, color: 'var(--admin-text-muted)', fontWeight: 850, fontSize: '0.9rem' }}>School Administration System</p>
                        </div>

                        <div className="f-node-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                          <h4 style={{ color: 'var(--admin-secondary)', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', fontWeight: 950, fontSize: '0.9rem' }}>SYSTEM CAPABILITIES</h4>
                          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                            {[
                              { text: 'Student & Faculty Management', icon: '👥' },
                              { text: 'Curriculum Management', icon: '📚' },
                              { text: 'Material Synchronization', icon: '📦' },
                              { text: 'Global Announcements', icon: '📡' },
                              { text: 'Task Management', icon: '📋' }
                            ].map((feat, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--admin-text-muted)', fontWeight: 850, fontSize: '0.9rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>{feat.icon}</span> {feat.text}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--admin-border)' }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--admin-text-muted)', fontWeight: 950, letterSpacing: '2px' }}>AUTHORIZED BY</span>
                          <strong style={{ display: 'block', fontSize: '1.4rem', color: 'var(--admin-primary)', marginTop: '0.4rem', fontWeight: 950 }}>BOBBYMARTION</strong>
                        </div>
                      </div>
                    )}

                    {/* FEE MODAL */}
                    {modalType === 'fee' && (
                      <form onSubmit={handleSaveFee} className="admin-form">
                        <div className="form-group">
                          <label>Student ID</label>
                          <input type="text" name="studentId" defaultValue={editItem?.studentId} readOnly={!!editItem} required />
                        </div>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Total Fee (INR)</label>
                            <input type="number" name="totalFee" defaultValue={editItem?.totalFee || 75000} required />
                          </div>
                          <div className="form-group">
                            <label>Paid Amount (INR)</label>
                            <input type="number" name="paidAmount" defaultValue={editItem?.paidAmount || 0} required />
                          </div>
                        </div>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Academic Year</label>
                            <input type="text" name="academicYear" defaultValue={editItem?.academicYear || '2023-24'} placeholder="e.g. 2023-24" required />
                          </div>
                          <div className="form-group">
                            <label>Semester</label>
                            <input type="text" name="semester" defaultValue={editItem?.semester || '1st Year'} placeholder="e.g. 1st Year" required />
                          </div>
                        </div>
                        <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                          <button type="button" onClick={closeModal} className="admin-btn">CANCEL</button>
                          <button type="submit" className="admin-btn admin-btn-primary">UPDATE RECORD</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'syllabus-view' && editItem && (
                      <div className="syllabus-view-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ margin: 0, color: 'var(--admin-secondary)', fontWeight: 950, fontSize: '1.3rem' }}>{editItem.name}</h4>
                            <div style={{ margin: '0.5rem 0 0', display: 'flex', gap: '0.5rem' }}>
                              <span className="admin-badge primary">{editItem.code}</span>
                              <span className="admin-badge accent">YEAR {editItem.year} • SEM {editItem.semester}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => { setModalType('material'); }}
                            className="admin-btn admin-btn-primary"
                            style={{ padding: '0.6rem 1.25rem', fontSize: '0.75rem' }}
                          >
                            <FaPlus /> UPLOAD MATERIAL
                          </button>
                        </div>

                        <h5 style={{ color: 'var(--admin-secondary)', fontWeight: 950, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <FaBookOpen /> CURRICULUM
                        </h5>

                        {(() => {
                          const subjectMaterials = materials.filter(m =>
                            m.subject === editItem.name || m.subject === editItem.code
                          );

                          if (subjectMaterials.length === 0) {
                            return (
                              <div className="admin-empty-state">
                                <FaBook className="admin-empty-icon" />
                                <p className="admin-empty-title">NO MATERIALS FOUND</p>
                                <p className="admin-empty-text">Upload notes, videos or syllabus.</p>
                              </div>
                            );
                          }

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
                            <div className="admin-list-container">
                              {Object.keys(modules).sort().map(modKey => (
                                <div key={modKey} className="admin-card" style={{ padding: '0' }}>
                                  <div className="f-node-head" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--admin-border)' }}>
                                    <span style={{ fontWeight: 950 }}>MODULE {modKey}</span>
                                    <span className="admin-badge primary" style={{ fontSize: '0.6rem' }}>{modules[modKey].count} UNITS</span>
                                  </div>
                                  <div style={{ padding: '1.5rem' }}>
                                    {Object.keys(modules[modKey].units).sort().map(unitKey => (
                                      <div key={unitKey} style={{ marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--admin-primary)' }}>
                                        <div style={{ fontWeight: 950, color: 'var(--admin-secondary)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>UNIT {unitKey}</div>
                                        <div className="admin-list-container" style={{ gap: '0.75rem' }}>
                                          {modules[modKey].units[unitKey].map(m => (
                                            <div key={m.id || m._id} className="admin-summary-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                                                <span className={`admin-badge ${m.type === 'videos' ? 'accent' : m.type === 'syllabus' ? 'warning' : 'primary'}`} style={{ fontSize: '0.6rem' }}>{m.type.toUpperCase()}</span>
                                                <span style={{ fontWeight: 850, fontSize: '0.9rem', color: 'var(--admin-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{m.topic || m.title}</span>
                                              </div>
                                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => window.open(getFileUrl(m.url), '_blank')} className="f-exam-card" style={{ padding: '0.5rem', background: 'white' }} title="View"><FaEye /></button>
                                                <button onClick={() => handleDeleteMaterial(m.id || m._id)} className="f-cancel-btn" style={{ padding: '0.5rem' }} title="Delete"><FaTrash /></button>
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

                        <div className="admin-modal-actions">
                          <button type="button" onClick={closeModal} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>CLOSE</button>
                        </div>
                      </div>
                    )}

                    {/* STUDENT CURRICULUM INSPECTION */}
                    {modalType === 'student-curriculum' && editItem && (
                      <div className="view-details">
                        <div className="f-node-head" style={{ padding: '2rem', borderBottom: '1px solid var(--admin-border)' }}>
                          <div>
                            <h3 className="f-node-title" style={{ fontSize: '1.4rem' }}>{editItem.studentName}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <span className="admin-badge primary">SID: {editItem.sid}</span>
                              <span className="admin-badge accent">YEAR {editItem.year} • {editItem.branch}</span>
                              <span className="admin-badge warning">SEC {editItem.section || 'A'}</span>
                            </div>
                          </div>
                          <FaLayerGroup size={32} style={{ opacity: 0.2 }} />
                        </div>

                        <div className="admin-list-container" style={{ maxHeight: '600px', overflowY: 'auto', padding: '2rem' }}>
                          {(() => {
                            const staticData = getYearData(editItem.branch, editItem.year);
                            const semesters = staticData ? staticData.semesters : [];

                            if (semesters.length === 0) return <div className="admin-empty-state"><p>No curriculum map found for this cohort.</p></div>;

                            return semesters.map(sem => (
                              <div key={sem.sem} className="admin-card" style={{ marginBottom: '2rem', padding: '0', overflow: 'hidden' }}>
                                <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid var(--admin-border)' }}>
                                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>SEMESTER {sem.sem}</h4>
                                </div>
                                <table className="admin-grid-table" style={{ margin: 0 }}>
                                  <thead>
                                    <tr>
                                      <th style={{ paddingLeft: '1.5rem' }}>SUBJECT MODULE</th>
                                      <th>CODE</th>
                                      <th>NOTES</th>
                                      <th>VIDEOS</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sem.subjects.map(sub => {
                                      const subNotes = materials.filter(m =>
                                        (m.subject === sub.name || m.subject === sub.code) &&
                                        m.type === 'notes' &&
                                        (m.section === 'All' || m.section === editItem.section)
                                      );
                                      const subVideos = materials.filter(m =>
                                        (m.subject === sub.name || m.subject === sub.code) &&
                                        m.type === 'videos' &&
                                        (m.section === 'All' || m.section === editItem.section)
                                      );

                                      return (
                                        <tr key={sub.code}>
                                          <td style={{ paddingLeft: '1.5rem', fontWeight: 600 }}>{sub.name}</td>
                                          <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>{sub.code}</td>
                                          <td>
                                            {subNotes.length > 0 ? (
                                              <span className="admin-badge primary" style={{ fontSize: '0.7rem' }}>{subNotes.length} ACTIVE</span>
                                            ) : (
                                              <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>EMPTY</span>
                                            )}
                                          </td>
                                          <td>
                                            {subVideos.length > 0 ? (
                                              <span className="admin-badge accent" style={{ fontSize: '0.7rem' }}>{subVideos.length} STREAMING</span>
                                            ) : (
                                              <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>OFFLINE</span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ));
                          })()}
                        </div>

                        <div className="modal-actions" style={{ padding: '0 2rem 2rem' }}>
                          <button onClick={closeModal} className="admin-btn admin-btn-primary" style={{ width: '100%' }}>CLOSE INSPECTION</button>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Forms based on modalType */}
                    {modalType === 'student' && (
                      <form onSubmit={handleSaveStudent}>
                        <div className="admin-form-grid">
                          <div className="admin-form-group full-width">
                            <label className="admin-form-label">FULL NAME *</label>
                            <input className="admin-search-input" name="studentName" defaultValue={editItem?.studentName} required placeholder="Enter student's full name" />
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-form-label">STUDENT ID *</label>
                            <input className="admin-search-input" name="sid" defaultValue={editItem?.sid} required placeholder="e.g. S-100234" />
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-form-label">EMAIL *</label>
                            <input className="admin-search-input" name="email" type="email" defaultValue={editItem?.email} required placeholder="email@nexus.edu" />
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-form-label">YEAR *</label>
                            <select className="admin-search-input" name="year" defaultValue={editItem?.year || '1'} style={{ paddingLeft: '1rem' }}>
                              <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option>
                            </select>
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-form-label">BRANCH *</label>
                            <select className="admin-search-input" name="branch" defaultValue={editItem?.branch || 'CSE'} style={{ paddingLeft: '1rem' }}>
                              {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-form-label">SECTION *</label>
                            <select className="admin-search-input" name="section" defaultValue={editItem?.section || 'A'} style={{ paddingLeft: '1rem' }}>
                              {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-form-label">PASSWORD</label>
                            <input className="admin-search-input" name="password" type="password" placeholder={editItem ? "Leave empty to retain" : "Initial password"} />
                          </div>
                        </div>
                        <div className="admin-modal-actions">
                          <button type="button" onClick={closeModal} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>CANCEL</button>
                          <button className="admin-btn admin-btn-primary">SAVE STUDENT</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'bulk-student' && (
                      <form onSubmit={handleBulkUploadStudents}>
                        <div className="f-node-card" style={{ padding: '2rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '3rem', color: 'var(--admin-primary)', marginBottom: '1.5rem' }}><FaFileUpload /></div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 950, color: 'var(--admin-secondary)', marginBottom: '1rem' }}>CSV UPLOAD</label>
                          <input type="file" name="file" accept=".csv" required style={{ width: '100%', padding: '2rem', border: '2px dashed var(--admin-border)', borderRadius: '16px', background: '#f8fafc' }} />
                          <div style={{ marginTop: '1.5rem', textAlign: 'left', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 850, margin: 0 }}>
                              REQUIRED HEADERS: <code>studentName, sid, email, year, section, branch</code>
                            </p>
                          </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                          <button type="button" onClick={closeModal} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>CANCEL</button>
                          <button className="admin-btn admin-btn-primary">UPLOAD STUDENTS</button>
                        </div>
                      </form>
                    )}


                    {modalType === 'bulk-faculty' && (
                      <form onSubmit={handleBulkUploadFaculty}>
                        <div className="f-node-card" style={{ padding: '2rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '3rem', color: 'var(--admin-primary)', marginBottom: '1.5rem' }}><FaFileUpload /></div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 950, color: 'var(--admin-secondary)', marginBottom: '1rem' }}>FACULTY BULK UPLOAD - CSV</label>
                          <input type="file" name="file" accept=".csv" required style={{ width: '100%', padding: '2rem', border: '2px dashed var(--admin-border)', borderRadius: '16px', background: '#f8fafc' }} />
                          <div style={{ marginTop: '1.5rem', textAlign: 'left', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 850, margin: '0 0 0.5rem 0' }}>
                              REQUIRED HEADERS: <code>name, facultyId, email, department, designation</code>
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 850, margin: 0 }}>
                              OPTIONAL: <code>phone, password, assignments</code>
                            </p>
                            <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.5rem', marginBottom: 0 }}>
                              Assignments format: "Year 3 Section A Subject AI; Year 3 Section B Subject ML"
                            </p>
                          </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                          <button type="button" onClick={closeModal} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>CANCEL</button>
                          <button className="admin-btn admin-btn-primary">UPLOAD FACULTY</button>
                        </div>
                      </form>
                    )}


                    {modalType === 'student-view' && editItem && (
                      <div className="view-details" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                        <div className="admin-profile-header" style={{ borderBottom: '1px solid var(--admin-border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                          <div className="admin-avatar-lg">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editItem.studentName}`} alt="Profile" style={{ width: '100%', height: '100%' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--admin-secondary)', fontWeight: 950, fontSize: '1.5rem' }}>{editItem.studentName}</h3>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                              <span className="admin-badge primary">{editItem.sid}</span>
                              <span className="admin-badge accent">YEAR {editItem.year} • {editItem.branch}</span>
                              <span className="admin-badge warning">SEC {editItem.section}</span>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: 850 }}>
                              <FaEnvelope /> {editItem.email}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '0 1rem' }}>
                          <div className="f-node-card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--admin-secondary)', fontWeight: 950, fontSize: '0.9rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.5rem' }}>ACADEMIC SNAPSHOT</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div className="admin-summary-card" style={{ padding: '1rem' }}>
                                <div className="value" style={{ fontSize: '1.5rem', color: 'var(--admin-primary)' }}>{editItem.stats?.totalClasses > 0 ? Math.round((editItem.stats?.totalPresent / editItem.stats?.totalClasses) * 100) : 0}%</div>
                                <div className="label">ATTENDANCE</div>
                              </div>
                              <div className="admin-summary-card" style={{ padding: '1rem' }}>
                                <div className="value" style={{ fontSize: '1.5rem', color: '#8b5cf6' }}>{editItem.stats?.aiUsageCount || 0}</div>
                                <div className="label">AI INTERACTIONS</div>
                              </div>
                              <div className="admin-summary-card" style={{ padding: '1rem' }}>
                                <div className="value" style={{ fontSize: '1.5rem', color: '#10b981' }}>{editItem.stats?.streak || 0}</div>
                                <div className="label">STUDY STREAK</div>
                              </div>
                              <div className="admin-summary-card" style={{ padding: '1rem' }}>
                                <div className="value" style={{ fontSize: '1.5rem', color: '#f59e0b' }}>{editItem.stats?.tasksCompleted || 0}</div>
                                <div className="label">TASKS DONE</div>
                              </div>
                            </div>
                          </div>

                          <div className="f-node-card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--admin-secondary)', fontWeight: 950, fontSize: '0.9rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.5rem' }}>WEEKLY ACTIVITY (HRS)</h4>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', padding: '0 5px' }}>
                              {(editItem.stats?.weeklyActivity || [
                                { day: 'Mon', hours: 0 }, { day: 'Tue', hours: 0 }, { day: 'Wed', hours: 0 },
                                { day: 'Thu', hours: 0 }, { day: 'Fri', hours: 0 }, { day: 'Sat', hours: 0 }, { day: 'Sun', hours: 0 }
                              ]).map((d, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{
                                    width: '100%',
                                    height: `${Math.min((d.hours / 12) * 100, 100)}%`,
                                    minHeight: '2px',
                                    background: 'var(--admin-primary)',
                                    borderRadius: '4px 4px 0 0'
                                  }}></div>
                                  <span style={{ fontSize: '0.5rem', fontWeight: 950, color: 'var(--admin-text-muted)', marginTop: '5px' }}>{d.day.toUpperCase()}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', fontWeight: 850, color: 'var(--admin-text-muted)', textAlign: 'center' }}>
                              AVERAGE: {(editItem.stats?.weeklyActivity?.reduce((acc, c) => acc + c.hours, 0) / 7 || 0).toFixed(1)} hrs/day
                            </div>
                          </div>
                        </div>

                        <div className="admin-modal-actions" style={{ marginTop: '3rem', borderTop: '1px solid var(--admin-border)', paddingTop: '2rem' }}>
                          <button onClick={() => openModal('student', editItem)} className="admin-btn admin-btn-outline" style={{ marginRight: '1rem', border: 'none' }}>EDIT RECORDS</button>
                          <button onClick={closeModal} className="admin-btn admin-btn-primary">CLOSE PROFILE</button>
                        </div>
                      </div>
                    )}

                    {modalType === 'material-view' && editItem && (
                      <div className="view-details">
                        <div className="f-node-card" style={{ padding: '0' }}>
                          <div className="f-node-head" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--admin-border)' }}>
                            <h3 className="f-node-title" style={{ fontSize: '1.2rem' }}>{editItem.title}</h3>
                            <span className={`admin-badge ${editItem.type === 'videos' ? 'accent' : 'primary'}`}>{editItem.type.toUpperCase()}</span>
                          </div>
                          <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                              <div className="detail-row" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>SUBJECT ORIGIN</div>
                                <div style={{ fontWeight: 850, color: 'var(--admin-secondary)' }}>{editItem.subject || 'General'}</div>
                              </div>
                              <div className="detail-row" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>TARGET YEAR</div>
                                <div style={{ fontWeight: 850, color: 'var(--admin-secondary)' }}>YEAR {editItem.year} • SEC {editItem.section || 'GLOBAL'}</div>
                              </div>
                              <div className="detail-row" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>TOPICAL FOCUS</div>
                                <div style={{ fontWeight: 850, color: 'var(--admin-secondary)' }}>{editItem.topic || 'General Strategy'}</div>
                              </div>
                              <div className="detail-row" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>MODULE / UNIT</div>
                                <div style={{ fontWeight: 850, color: 'var(--admin-secondary)' }}>MOD {editItem.module} / UNIT {editItem.unit}</div>
                              </div>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 850 }}>
                                <span>UPLINKED BY: {editItem.uploadedBy?.name || editItem.uploadedBy || 'GOVERNANCE'}</span>
                                <span>TIMESTAMP: {new Date(editItem.uploadedAt).toLocaleString()}</span>
                              </div>
                            </div>

                            {editItem.url && (
                              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--admin-primary)', marginBottom: '0.25rem' }}>MATERIAL LINK</div>
                                <a href={getFileUrl(editItem.url)} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-primary)', fontWeight: 950, textDecoration: 'none', wordBreak: 'break-all', fontSize: '0.85rem' }}>
                                  {editItem.url}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                          <button onClick={() => openModal('material', editItem)} className="admin-btn admin-btn-outline" style={{ marginRight: '1rem', border: 'none' }}>EDIT</button>
                          <button onClick={closeModal} className="admin-btn admin-btn-primary">CLOSE</button>
                        </div>
                      </div>
                    )}

                    {modalType === 'faculty' && (
                      <form onSubmit={handleSaveFaculty}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>FULL NAME *</label>
                            <input className="admin-search-input" name="name" defaultValue={editItem?.name} required placeholder="Full Name" />
                          </div>
                          <div className="form-group">
                            <label>FACULTY ID *</label>
                            <input className="admin-search-input" name="facultyId" defaultValue={editItem?.facultyId} required placeholder="e.g. F-501" />
                          </div>
                          <div className="form-group">
                            <label>EMAIL *</label>
                            <input className="admin-search-input" name="email" defaultValue={editItem?.email || (editItem?.facultyId ? `${editItem.facultyId}@example.com` : '')} required placeholder="email@domain.com" />
                          </div>
                          <div className="form-group">
                            <label>DEPARTMENT</label>
                            <input className="admin-search-input" name="department" defaultValue={editItem?.department || 'CSE'} placeholder="e.g. CSE" />
                          </div>
                          <div className="form-group">
                            <label>DESIGNATION</label>
                            <input className="admin-search-input" name="designation" defaultValue={editItem?.designation} placeholder="e.g. Professor" />
                          </div>
                          <div className="form-group">
                            <label>PASSWORD {!editItem && '*'}</label>
                            <input
                              className="admin-search-input"
                              name="password"
                              type="password"
                              required={!editItem}
                              placeholder={editItem ? "Leave blank to keep current password" : "Enter password"}
                            />
                          </div>

                          {/* Assignment Manager */}
                          <div className="form-group" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--admin-border)' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--admin-secondary)', marginBottom: '1.25rem', display: 'block' }}>CLASS ASSIGNMENTS</label>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'flex-end' }}>
                              <div>
                                <label style={{ fontSize: '0.65rem' }}>YEAR</label>
                                <select id="assign-year" className="admin-search-input" style={{ padding: '0 0.75rem', height: '40px' }}>
                                  <option value="">Select</option>
                                  <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem' }}>BRANCH</label>
                                <select id="assign-branch" className="admin-search-input" style={{ padding: '0 0.75rem', height: '40px' }}>
                                  <option value="CSE">CSE</option>
                                  <option value="ECE">ECE</option>
                                  <option value="EEE">EEE</option>
                                  <option value="IT">IT</option>
                                  <option value="AIML">AIML</option>
                                  <option value="MECH">MECH</option>
                                  <option value="CIVIL">CIVIL</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem' }}>SECTION</label>
                                <select id="assign-section" className="admin-search-input" style={{ padding: '0 0.75rem', height: '40px' }}>
                                  <option value="">Select</option>
                                  {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem' }}>SUBJECT</label>
                                <select id="assign-subject" className="admin-search-input" style={{ padding: '0 0.75rem', height: '40px' }}>
                                  <option value="">Select Subject</option>
                                  {allAvailableSubjects.map(c => (
                                    <option key={c.code} value={c.name}>{c.name} ({c.code})</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <button type="button" onClick={handleAddAssignment} className="admin-btn admin-btn-outline" style={{ width: '100%', marginTop: '1rem', height: '40px', fontSize: '0.75rem' }}>ADD ASSIGNMENT</button>

                            <div className="assignments-list" style={{ marginTop: '1.5rem', display: 'grid', gap: '0.6rem' }}>
                              {facultyAssignments.map((assign, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 850 }}>Year {assign.year} <span>•</span> {assign.branch} <span>•</span> Sec {assign.section} <span>•</span> {assign.subject}</span>
                                  <button type="button" onClick={() => handleRemoveAssignment(idx)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              ))}
                              {facultyAssignments.length === 0 && <p className="f-empty-text" style={{ padding: '1rem' }}>No assignments yet</p>}
                            </div>
                          </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2.5rem' }}>
                          <button type="button" onClick={closeModal} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>CANCEL</button>
                          <button className="admin-btn admin-btn-primary">SAVE FACULTY</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'course' && (
                      <form onSubmit={handleSaveCourse}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>COURSE NAME *</label>
                            <input className="admin-search-input" name="name" defaultValue={editItem?.name} required placeholder="e.g. Software Systems" />
                          </div>
                          <div className="form-group">
                            <label>COURSE CODE *</label>
                            <input className="admin-search-input" name="code" defaultValue={editItem?.code} required placeholder="e.g. CS-501" />
                          </div>
                          <div className="form-group">
                            <label>YEAR *</label>
                            <select className="admin-search-input" name="year" defaultValue={editItem?.year || '1'} required style={{ paddingLeft: '1rem' }}>
                              <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>SEMESTER *</label>
                            <select className="admin-search-input" name="semester" defaultValue={editItem?.semester || '1'} required style={{ paddingLeft: '1rem' }}>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>BRANCH *</label>
                            <select className="admin-search-input" name="branch" defaultValue={editItem?.branch || 'CSE'} required style={{ paddingLeft: '1rem' }}>
                              {['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'AIML', 'All'].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>SECTION</label>
                            <select className="admin-search-input" name="section" defaultValue={editItem?.section || 'All'} required style={{ paddingLeft: '1rem' }}>
                              <option value="All">All Sections</option>
                              {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2.5rem' }}>
                          <button type="button" onClick={closeModal} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>CANCEL</button>
                          <button className="admin-btn admin-btn-primary">SAVE COURSE</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'material' && (
                      <form onSubmit={handleSaveMaterial}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          <div className="form-group">
                            <label>CATEGORY</label>
                            <select className="admin-search-input" name="type" defaultValue={editItem?.type || "notes"} style={{ paddingLeft: '1rem' }}>
                              <option value="notes">Notes/PDF</option>
                              <option value="videos">Video Lectures</option>
                              <option value="models">AI Models / 3D</option>
                              <option value="interviewQnA">Q&A / Interviews</option>
                              <option value="modelPapers">Exam Papers</option>
                              <option value="syllabus">Syllabus</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>TITLE *</label>
                            <input className="admin-search-input" name="title" required placeholder="e.g. Unit 1 Notes" />
                          </div>
                          <div className="form-group">
                            <label>YEAR</label>
                            <select className="admin-search-input" name="year" required defaultValue={editItem?.isAdvanced ? 'Advanced' : (editItem?.year || '1')} style={{ paddingLeft: '1rem' }}>
                              {editItem?.isAdvanced ? <option value="Advanced">Advanced</option> :
                                [1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)
                              }
                            </select>
                          </div>
                          <div className="form-group">
                            <label>SUBJECT</label>
                            <select className="admin-search-input" name="subject" required defaultValue={editItem?.subject || ''} style={{ paddingLeft: '1rem' }}>
                              <option value="">Select Subject...</option>
                              {editItem?.isAdvanced
                                ? ADVANCED_TOPICS.map(t => <option key={t} value={t}>{t}</option>)
                                : allAvailableSubjects.map(c => <option key={c.code} value={c.name}>{c.name} ({c.code})</option>)
                              }
                            </select>
                          </div>
                          <div className="form-group">
                            <label>MODULE</label>
                            <select className="admin-search-input" name="module" style={{ paddingLeft: '1rem' }}>
                              {[1, 2, 3, 4, 5].map(m => <option key={m} value={m}>Module {m}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>UNIT</label>
                            <select className="admin-search-input" name="unit" style={{ paddingLeft: '1rem' }}>
                              {[1, 2, 3, 4, 5].map(u => <option key={u} value={u}>Unit {u}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>BRANCH</label>
                            <select className="admin-search-input" name="branch" defaultValue="All" style={{ paddingLeft: '1rem' }}>
                              {['All', 'CSE', 'AIML', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>SECTION</label>
                            <select className="admin-search-input" name="section" defaultValue={editItem?.section || 'All'} style={{ paddingLeft: '1rem' }}>
                              <option value="All">All Sections</option>
                              {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                          </div>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>TOPIC</label>
                            <input className="admin-search-input" name="topic" placeholder="e.g. Introduction to Systems" />
                          </div>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>FILE / LINK</label>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                              <input type="file" className="admin-search-input" name="file" style={{ padding: '0.6rem' }} />
                              <input className="admin-search-input" name="url" placeholder="OR Secure External URL (https://...)" />
                            </div>
                          </div>
                          <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                            <input type="checkbox" name="isAdvanced" id="isAdvanced" defaultChecked={editItem?.isAdvanced || false} style={{ width: '20px', height: '20px' }} />
                            <label htmlFor="isAdvanced" style={{ margin: 0, fontWeight: 950, color: 'var(--admin-secondary)', fontSize: '0.85rem' }}>MARK AS ADVANCED LEARNING CONTENT</label>
                          </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2.5rem' }}>
                          <button type="button" onClick={closeModal} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>CANCEL</button>
                          <button className="admin-btn admin-btn-primary">UPLOAD MATERIAL</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'todo' && (
                      <form onSubmit={handleSaveTodo}>
                        <div className="form-group">
                          <label>TASK DESCRIPTION *</label>
                          <textarea className="admin-search-input" name="text" defaultValue={editItem?.text} required rows="4" style={{ padding: '1.25rem' }} placeholder="Define the task details..."></textarea>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                          <div className="form-group">
                            <label>ASSIGNMENT SCOPE</label>
                            <select className="admin-search-input" name="target" defaultValue={editItem?.target || 'admin'} style={{ paddingLeft: '1rem' }}>
                              <option value="admin">Admin Only (Private)</option>
                              <option value="all">Global (Public Announcement)</option>
                              <option value="student">All Students</option>
                              <option value="faculty">All Faculty</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>DEADLINE</label>
                            <input className="admin-search-input" type="date" name="dueDate" defaultValue={editItem?.dueDate} style={{ paddingLeft: '1rem' }} />
                          </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2.5rem' }}>
                          <button type="button" onClick={closeModal} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>CANCEL</button>
                          <button className="admin-btn admin-btn-primary">SAVE TASK</button>
                        </div>
                      </form>
                    )}

                    {modalType === 'message' && (
                      <form onSubmit={handleSendMessage}>
                        <div className="form-group">
                          <label>TARGET AUDIENCE</label>
                          <select className="admin-search-input" name="target" value={msgTarget} onChange={(e) => setMsgTarget(e.target.value)} style={{ paddingLeft: '1rem' }}>
                            <option value="all">EVERYONE (GLOBAL ANNOUNCEMENT)</option>
                            <option value="students">ALL STUDENTS</option>
                            <option value="students-specific">SPECIFIC SECTION (YEAR/SEC)</option>
                            <option value="faculty">ALL FACULTY</option>
                          </select>
                        </div>

                        {msgTarget === 'students-specific' && (
                          <div className="animate-fade-in" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', border: '1px solid var(--admin-border)' }}>
                            <div className="form-group">
                              <label>TARGET YEAR</label>
                              <select className="admin-search-input" name="targetYear" style={{ paddingLeft: '1rem' }}>
                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                              </select>
                            </div>
                            <div className="form-group">
                              <label>TARGET SECTIONS (MULTI-SELECT)</label>
                              <select className="admin-search-input" name="targetSections" multiple style={{ height: '120px', padding: '0.75rem' }}>
                                {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                              </select>
                            </div>
                          </div>
                        )}

                        <div className="form-group">
                          <label>ANNOUNCEMENT CONTENT *</label>
                          <textarea className="admin-search-input" name="message" required rows="6" style={{ padding: '1.25rem' }} placeholder="Type announcement here..."></textarea>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                          <button type="button" onClick={closeModal} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>CANCEL</button>
                          <button className="admin-btn admin-btn-primary">SEND ANNOUNCEMENT</button>
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


      <PersonalDetailsBall role="admin" data={{ name: 'System Administrator', role: 'Main Administrator' }} />
    </div >
  );
}
