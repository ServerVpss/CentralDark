/**
 * Integração WhatsApp — MultiZap Bot
 * 
 * Gerencia conexões WhatsApp via Supabase.
 * O Gateway/WuzAPI é chamado APENAS pelo backend/VPS.
 * O frontend NUNCA chama WuzAPI diretamente.
 * 
 * Funcionalidades:
 * - Listar conexões (via Supabase)
 * - Status em tempo real (via Supabase Realtime)
 * - QR code (lido do Supabase, escrito pelo Gateway)
 * - Enviar mensagens (via Supabase, Gateway processa)
 */

import { supabase } from '@/lib/supabase';

export interface WhatsAppConnection {
  id: string;
  workspace_id: string;
  name: string;
  phone: string;
  status: 'connected' | 'qr_code' | 'disconnected' | 'connecting';
  qr_code_base64: string;
  wuzapi_instance_id: string;
  last_seen_at: string | null;
}

export async function listConnections(workspaceId: string): Promise<WhatsAppConnection[]> {
  const { data, error } = await supabase
    .from('instances')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getConnectionStatus(id: string): Promise<WhatsAppConnection | null> {
  const { data, error } = await supabase
    .from('instances')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createConnection(workspaceId: string, name: string): Promise<WhatsAppConnection> {
  const { data, error } = await supabase
    .from('instances')
    .insert([{ workspace_id: workspaceId, name, status: 'disconnected' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteConnection(id: string): Promise<void> {
  const { error } = await supabase.from('instances').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToConnection(id: string, callback: (conn: WhatsAppConnection) => void) {
  const channel = supabase
    .channel(`instance-${id}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'instances',
      filter: `id=eq.${id}`,
    }, (payload) => {
      callback(payload.new as WhatsAppConnection);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
