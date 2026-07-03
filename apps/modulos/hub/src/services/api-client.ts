import { hubClient as supabase } from '@/integrations/supabase/hub-client';

export const apiClient = {
  async get(path: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_HUB_API_URL}${path}`, {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('API_ERROR');
    return response.json();
  },
  async post(path: string, body: any) {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_HUB_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return response.json();
  }
};