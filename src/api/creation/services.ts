import { request, useMock } from '../http';
import { CreationModel } from '../../types/creation/model';

export async function fetchModels(capability: 'chat' | 'image' | 'video'): Promise<CreationModel[]> {
  if (useMock) {
    return [
      { id: 'mock-chat-1', name: 'Mock Chat', capabilities: ['chat'], supportsImageInput: true },
      { id: 'mock-image-1', name: 'Mock T2I', capabilities: ['text-to-image'] },
      { id: 'mock-image-2', name: 'Mock I2I', capabilities: ['image-to-image'] },
      { id: 'mock-video-1', name: 'Mock Video', capabilities: ['text-to-video', 'image-to-video'] }
    ].filter(m => m.capabilities.some(c => c.includes(capability))) as CreationModel[];
  }
  return request<CreationModel[]>(`/creation/models?capability=${capability}`);
}

export async function createGeneration(data: any): Promise<{ id: string }> {
  if (useMock) {
    return { id: 'mock-task-id-' + Date.now() };
  }
  return request<{ id: string }>('/creation/generations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTask(taskId: string): Promise<any> {
  if (useMock) {
    return {
      status: 'succeeded',
      resultAssets: [{ id: 'mock-asset', url: 'https://via.placeholder.com/1024', type: 'image' }]
    };
  }
  return request<any>(`/creation/tasks/${taskId}`);
}

export async function cancelTask(taskId: string): Promise<any> {
  if (useMock) return { success: true };
  return request<any>(`/creation/tasks/${taskId}/cancel`, { method: 'POST' });
}