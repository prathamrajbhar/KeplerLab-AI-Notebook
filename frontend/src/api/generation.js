import { apiJson, apiFetch } from './config';

export async function generateFlashcards(materialId, topic = null) {
  const body = { material_id: materialId };
  if (topic) body.topic = topic;
  return apiJson('/flashcard', { method: 'POST', body: JSON.stringify(body) });
}

export async function generateQuiz(materialId, topic = null) {
  const body = { material_id: materialId };
  if (topic) body.topic = topic;
  return apiJson('/quiz', { method: 'POST', body: JSON.stringify(body) });
}

export async function generateSlides(materialId, topic = null) {
  const body = {};
  if (materialId) body.material_id = materialId;
  if (topic) body.topic = topic;
  return apiJson('/slide', { method: 'POST', body: JSON.stringify(body) });
}

export async function downloadSlides(materialId, topic = null) {
  const body = {};
  if (materialId) body.material_id = materialId;
  if (topic) body.topic = topic;
  const response = await apiFetch('/slide/download', { method: 'POST', body: JSON.stringify(body) });
  return response.blob();
}

export async function generatePodcast(materialId) {
  return apiJson('/podcast', { method: 'POST', body: JSON.stringify({ material_id: materialId }) });
}

export async function downloadPodcast(materialId) {
  const response = await apiFetch('/podcast/download', { method: 'POST', body: JSON.stringify({ material_id: materialId }) });
  return response.blob();
}

export async function generateExplainer(materialId) {
  return apiJson('/explainer', { method: 'POST', body: JSON.stringify({ material_id: materialId }) });
}

export async function downloadExplainer(materialId) {
  const response = await apiFetch('/explainer/download', { method: 'POST', body: JSON.stringify({ material_id: materialId }) });
  return response.blob();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
