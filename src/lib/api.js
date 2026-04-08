/**
 * Centralized API client with automatic auth token injection.
 * All API calls go through this wrapper.
 */

function getToken() {
    return localStorage.getItem('chrona_token');
}

function authHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

function handleUnauthorized(res) {
    if (res.status === 401) {
        localStorage.removeItem('chrona_token');
        localStorage.removeItem('chrona_user_id');
        localStorage.removeItem('chrona_username');
        window.location.href = '/auth';
        return true;
    }
    return false;
}

export const api = {
    async get(path) {
        const res = await fetch(path, { headers: authHeaders() });
        if (handleUnauthorized(res)) return null;
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || data.error || `Request failed: ${res.status}`);
        }
        return res.json();
    },

    async post(path, body) {
        const res = await fetch(path, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body),
        });
        if (handleUnauthorized(res)) return null;
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || data.error || `Request failed: ${res.status}`);
        }
        return res.json();
    },

    async postFormData(path, formData) {
        const token = getToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(path, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (handleUnauthorized(res)) return null;
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || data.error || `Request failed: ${res.status}`);
        }
        return res.json();
    },
};
