import { apiClient } from './api-client';

export interface TelegramSession {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  phone?: string;
  dc_id?: number;
}

export const telegramClient = {
  async getStatus(): Promise<TelegramSession[]> {
    const response = await apiClient.get('/mtproto/status');
    return response.data;
  },

  async connect(phone: string): Promise<{ requestId: string }> {
    const response = await apiClient.post('/mtproto/connect', { phone });
    return response.data;
  },

  async verifyCode(requestId: string, code: string): Promise<void> {
    await apiClient.post('/mtproto/verify', { requestId, code });
  }
};