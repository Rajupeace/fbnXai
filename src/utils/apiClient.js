const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const headersJson = { 'Content-Type': 'application/json' };

function getAuthHeaders() {
  const headers = {};

  if (typeof window !== 'undefined' && window.localStorage) {
    const adminToken = window.localStorage.getItem('adminToken');
    const facultyToken = window.localStorage.getItem('facultyToken');
    const studentToken = window.localStorage.getItem('studentToken');

    // Debug: Log token status
    if (!adminToken && !facultyToken && !studentToken) {
      console.warn('[apiClient] WARNING: No authentication tokens found in localStorage!');
      console.warn('[apiClient] Available localStorage keys:', Object.keys(localStorage));
    }

    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }

    if (facultyToken) {
      headers['Authorization'] = `Bearer ${facultyToken}`;
    }

    if (studentToken) {
      headers['Authorization'] = `Bearer ${studentToken}`;
    }
  } else {
    console.error('[apiClient] localStorage is not available');
  }

  return headers;
}

export async function apiGet(path) {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, { headers: { ...getAuthHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details || data.error || `GET ${path} failed: ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiPost(path, body) {
  if (!API_URL) throw new Error('API_URL not configured');

  const headers = { ...headersJson, ...getAuthHeaders() };
  const adminToken = window.localStorage.getItem('adminToken');
  const facultyToken = window.localStorage.getItem('facultyToken');

  // Debug: warn if no token
  if (!adminToken && !facultyToken) {
    console.warn('[apiPost] No auth tokens found! Request to', path, 'may fail.');
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details || data.error || `POST ${path} failed: ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiPut(path, body) {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
    method: 'PUT',
    headers: { ...headersJson, ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details || data.error || `PUT ${path} failed: ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiDelete(path) {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, { method: 'DELETE', headers: { ...getAuthHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details || data.error || `DELETE ${path} failed: ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiUpload(path, formData) {
  if (!API_URL) throw new Error('API_URL not configured');

  const headers = getAuthHeaders();
  const adminToken = window.localStorage.getItem('adminToken');
  const facultyToken = window.localStorage.getItem('facultyToken');

  console.log('[apiUpload] Starting upload to:', path);
  console.log('[apiUpload] Auth state:', { hasAdminToken: !!adminToken, hasFacultyToken: !!facultyToken });

  if (!adminToken && !facultyToken) {
    throw new Error('No authentication token found. Please log out and log in again.');
  }

  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('[apiUpload] Upload failed:', res.status, data);
      const errorMsg = data.message || data.error || `Upload failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    console.log('[apiUpload] Upload successful:', data);
    return data;
  } catch (error) {
    console.error('[apiUpload] Error:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Is the backend running at ' + API_URL + '?');
    }
    throw error;
  }
}

export async function adminLogin(adminId, password) {
  if (!API_URL) throw new Error('API_URL not configured');
  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/admin/login`, {
      method: 'POST', headers: headersJson, body: JSON.stringify({ adminId, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Login failed: ${res.status}`);
    }

    // Auto-save admin token to localStorage (CRITICAL FIX)
    if (data && data.token) {
      window.localStorage.setItem('adminToken', data.token);
      console.log('[apiClient] Admin token auto-saved to localStorage:', data.token.substring(0, 10) + '...');
    } else {
      console.warn('[apiClient] WARNING: Admin login response missing token!', data);
    }

    return data;
  } catch (error) {
    console.error('Admin login API error:', error);
    throw error;
  }
}

export async function facultyLogin(facultyId, password) {
  if (!API_URL) throw new Error('API_URL not configured');
  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/faculty/login`, {
      method: 'POST', headers: headersJson, body: JSON.stringify({ facultyId, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Faculty login failed: ${res.status}`);
    }
    // Auto-save faculty token
    if (data && data.token) {
      window.localStorage.setItem('facultyToken', data.token);
    }
    return data;
  } catch (error) {
    console.error('Faculty login API error:', error);
    throw error;
  }
}

export async function facultyLogout() {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/faculty/logout`, {
    method: 'POST',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('faculty logout failed');
  return res.json();
}

export async function adminLogout() {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/admin/logout`, { method: 'POST', headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error('admin logout failed');
  return res.json();
}

export async function studentLogin(sid, password) {
  if (!API_URL) throw new Error('API_URL not configured');
  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/students/login`, {
      method: 'POST', headers: headersJson, body: JSON.stringify({ sid, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Login failed: ${res.status}`);
    }
    // Auto-save student token
    if (data && data.token) {
      window.localStorage.setItem('studentToken', data.token);
      window.localStorage.setItem('userData', JSON.stringify(data.studentData));
    }
    return data;
  } catch (error) {
    console.error('Student login API error:', error);
    throw error;
  }
}

export async function studentRegister(studentData) {
  if (!API_URL) throw new Error('API_URL not configured');
  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/students/register`, {
      method: 'POST', headers: headersJson, body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Registration failed: ${res.status}`);
    }
    // Auto-login after registration
    if (data && data.token) {
      window.localStorage.setItem('studentToken', data.token);
      window.localStorage.setItem('userData', JSON.stringify(data.studentData));
    }
    return data;
  } catch (error) {
    console.error('Student registration API error:', error);
    throw error;
  }
}

const client = { apiGet, apiPost, apiPut, apiDelete, apiUpload, adminLogin, adminLogout, facultyLogin, facultyLogout, studentLogin, studentRegister };
export default client;
