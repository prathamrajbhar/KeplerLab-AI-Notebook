import { apiJson } from './config';

export async function sendChatMessage(materialId, message, notebookId) {
  return apiJson('/chat', {
    method: 'POST',
    body: JSON.stringify({
      material_id: materialId,
      message: message,
      notebook_id: notebookId,
    }),
  });
}

export async function getChatHistory(notebookId) {
  return apiJson(`/chat/history/${notebookId}`);
}

export async function clearChatHistory(notebookId) {
  return apiJson(`/chat/history/${notebookId}`, {
    method: 'DELETE',
  });
}

