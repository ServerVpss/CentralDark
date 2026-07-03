import { hubClient as supabase } from '@/integrations/supabase/hub-client';

const getHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
};

export const apiClient = {
  async get(path: string) {
    const headers = await getHeaders();
    const response = await fetch(`${import.meta.env.VITE_HUB_API_URL}${path}`, { headers });
    if (!response.ok) throw new Error(`API_GET_ERROR: ${response.statusText}`);
    return response.json();
  },

  async post(path: string, body?: any) {
    const headers = await getHeaders();
    const response = await fetch(`${import.meta.env.VITE_HUB_API_URL}${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) throw new Error(`API_POST_ERROR: ${response.statusText}`);
    return response.json();
  },

  async put(path: string, body: any) {
    const headers = await getHeaders();
    const response = await fetch(`${import.meta.env.VITE_HUB_API_URL}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`API_PUT_ERROR: ${response.statusText}`);
    return response.json();
  },

  async delete(path: string) {
    const headers = await getHeaders();
    const response = await fetch(`${import.meta.env.VITE_HUB_API_URL}${path}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error(`API_DELETE_ERROR: ${response.statusText}`);
    return response.json();
  }
};