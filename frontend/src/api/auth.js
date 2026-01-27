const API_BASE = 'http://localhost:8000';

export async function login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Invalid email or password');
    }
    
    return response.json();
}

export async function signup(email, username, password) {
    const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Signup failed');
    }
    
    return response.json();
}

export async function logout() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    
    return response.json();
}

export async function getCurrentUser() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token');
    }
    
    const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        throw new Error('Failed to get user');
    }
    
    return response.json();
}

export async function refreshToken() {
    const token = localStorage.getItem('refresh_token');
    if (!token) {
        throw new Error('No refresh token');
    }
    
    const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: token }),
    });
    
    if (!response.ok) {
        throw new Error('Token refresh failed');
    }
    
    const tokens = await response.json();
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    return tokens;
}

// Helper to get auth headers for API calls
export function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}
