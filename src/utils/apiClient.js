const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const headersJson = { 'Content-Type': 'application/json' };

function getAuthHeaders() {
    const headers = {};

    if (typeof window !== 'undefined' && window.localStorage) {
        const adminToken = window.localStorage.getItem('adminToken');
        const facultyToken = window.localStorage.getItem('facultyToken');
        const studentToken = window.localStorage.getItem('studentToken');

        if (adminToken) {
            headers['Authorization'] = `Bearer ${adminToken}`;
            headers['x-admin-token'] = adminToken;
        } else if (facultyToken) {
            headers['Authorization'] = `Bearer ${facultyToken}`;
            headers['x-faculty-token'] = facultyToken;
        } else if (studentToken) {
            headers['Authorization'] = `Bearer ${studentToken}`;
            headers['x-student-token'] = studentToken;
        }
    }
    return headers;
}

async function parseResponse(res, path) {
    const contentType = res.headers.get('content-type');
    let data = {};

    if (contentType && contentType.includes('application/json')) {
        try {
            data = await res.json();
        } catch (e) {
            console.error(`[API] Failed to parse JSON from ${path}:`, e);
            data = { error: 'Invalid JSON response from server' };
        }
    } else {
        // If we got HTML or text instead of JSON
        const text = await res.text().catch(() => '');
        console.error(`[API] Expected JSON but received ${contentType || 'unknown'} from ${path}. Body start: ${text.substring(0, 100)}`);

        if (text.trim().startsWith('<')) {
            data = { error: 'The server returned an HTML page instead of data. This usually happens if the API route is missing or pointing to the wrong port.' };
        } else {
            data = { error: text || 'Non-JSON response received' };
        }
    }

    if (!res.ok) {
        const err = new Error(data.details || data.error || data.message || `${res.method || 'Request'} ${path} failed: ${res.status}`);
        err.status = res.status;
        err.details = data;
        throw err;
    }
    return data;
}

export async function apiGet(path) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, { headers: { ...getAuthHeaders() } });
    return parseResponse(res, path);
}

export async function apiPost(path, body) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s frontend timeout

    try {
        const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
            method: 'POST',
            headers: { ...headersJson, ...getAuthHeaders() },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return parseResponse(res, path);
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

export async function apiPut(path, body) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
        method: 'PUT',
        headers: { ...headersJson, ...getAuthHeaders() },
        body: JSON.stringify(body),
    });
    return parseResponse(res, path);
}

export async function apiDelete(path) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() }
    });
    return parseResponse(res, path);
}

export async function apiUpload(path, formData, method = 'POST') {
    const headers = { ...getAuthHeaders() };
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
        method: method,
        body: formData,
        headers: headers,
    });
    return parseResponse(res, path);
}

export async function adminLogin(adminId, password) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/admin/login`, {
        method: 'POST', headers: headersJson, body: JSON.stringify({ adminId, password })
    });
    const data = await parseResponse(res, '/api/admin/login');
    if (data.token) window.localStorage.setItem('adminToken', data.token);
    return data;
}

export async function facultyLogin(facultyId, password) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/faculty/login`, {
        method: 'POST', headers: headersJson, body: JSON.stringify({ facultyId, password })
    });
    const data = await parseResponse(res, '/api/faculty/login');
    if (data.token) window.localStorage.setItem('facultyToken', data.token);
    return data;
}

export async function studentLogin(sid, password) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/students/login`, {
        method: 'POST', headers: headersJson, body: JSON.stringify({ sid, password })
    });
    const data = await parseResponse(res, '/api/students/login');
    if (data.token) {
        window.localStorage.setItem('studentToken', data.token);
        window.localStorage.setItem('userData', JSON.stringify(data.studentData));
    }
    return data;
}

export async function studentRegister(studentData) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/students/register`, {
        method: 'POST', headers: headersJson, body: JSON.stringify(studentData)
    });
    const data = await parseResponse(res, '/api/students/register');
    if (data.token) {
        window.localStorage.setItem('studentToken', data.token);
        window.localStorage.setItem('userData', JSON.stringify(data.studentData));
    }
    return data;
}

export async function adminLogout() {
    return { success: true };
}

export async function facultyLogout() {
    return { success: true };
}

const client = {
    apiGet, apiPost, apiPut, apiDelete, apiUpload,
    adminLogin, adminLogout, facultyLogin, facultyLogout,
    studentLogin, studentRegister
};

export default client;

