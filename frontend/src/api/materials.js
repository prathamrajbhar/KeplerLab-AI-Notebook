import { apiJson, apiConfig } from './config';

export async function uploadMaterial(file, notebookId = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (notebookId) {
    formData.append('notebook_id', notebookId);
  }

  const token = localStorage.getItem('access_token');
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  const response = await fetch(`${apiConfig.baseUrl}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Upload file and auto-create notebook with AI-generated name
export async function uploadMaterialWithAutoNotebook(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('auto_create_notebook', 'true');

  const token = localStorage.getItem('access_token');
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  const response = await fetch(`${apiConfig.baseUrl}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getMaterials(notebookId = null) {
  const query = notebookId ? `?notebook_id=${notebookId}` : '';
  return apiJson(`/materials${query}`);
}

export async function deleteMaterial(materialId) {
  return apiJson(`/materials/${materialId}`, { method: 'DELETE' });
}


