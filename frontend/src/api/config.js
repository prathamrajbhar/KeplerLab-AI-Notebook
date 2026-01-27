const API_BASE_URL = 'http://localhost:8000';

export const apiConfig = {
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
          
          // Retry the original request with new token
          config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
          const retryResponse = await fetch(url, config);
          
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ detail: 'Request failed' }));
            throw new Error(error.detail || `HTTP ${retryResponse.status}`);
          }
          return retryResponse;
        }
      } catch (e) {
        // Refresh failed, clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  
  return response;
}

export async function apiJson(endpoint, options = {}) {
  const response = await apiFetch(endpoint, options);
  return response.json();
}

