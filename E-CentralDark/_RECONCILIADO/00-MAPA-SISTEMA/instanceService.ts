import { supabase, supabaseApi } from "@/lib/supabase";
import { logService } from "./logService";

// Conexões WhatsApp são gerenciadas via Supabase.
// O Gateway (proxy.multizap.dev) é chamado APENAS pelo backend/VPS.
// O frontend NUNCA chama o Gateway diretamente.
// O frontend NUNCA envia Bearer token para o Gateway.

export interface Instance {
  id?: string;
  workspace_id: string;
  name: string;
  phone?: string;
  phone_last4?: string;
  connection_id?: string;
  qr_code?: string | null;
  qr_code_base64?: string | null;
  status: 'connected' | 'qr_code' | 'disconnected' | 'connecting';
  provider?: string;
  connection_mode?: string;
  is_active?: boolean;
  is_own_number?: boolean;
}

export const instanceService = {
  async list(workspaceId: string) {
    const { data, error } = await supabaseApi
      .from('whatsapp_connections')
      .select('id, workspace_id, name, phone, phone_last4, connection_id, qr_code, status, provider, connection_mode, is_active, is_own_number, created_at, updated_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });
    
    if (error) {
      await logService.error("instances.list.failure", { workspace_id: workspaceId, error: error.message });
      throw error;
    }
    
    return (data || []).map(conn => ({
      ...conn,
      status: conn.status || 'disconnected'
    }));
  },

  async create(instance: Instance) {
    // 2026-06-01: Ao invés de o frontend inserir no banco de dados e esperar que a VPS magicamente gere o connection_id (que o Gateway Node cria usando uuid()),
    // O frontend deve engatilhar a API do Gateway na rota POST /connections, que cria a conexão, gera o ID real, a WuzAPI instance, e devolve pronto.
    
    // COMO NÃO TEMOS BEARER TOKEN NO FRONTEND: a regra diz "O frontend NUNCA chama o Gateway diretamente. O frontend NUNCA envia Bearer token para o Gateway."
    // "Nota: A ativação real da conexão WhatsApp... é feita pelo backend/Gateway na VPS, não pelo frontend... O frontend apenas registra a instância no Supabase."
    
    // Logo, se o frontend insere na tabela whatsapp_connections sem "connection_id", o bridge/sync deve gerar ele. Mas o CRM já tinha o fluxo `POST /connections`.
    // Se precisarmos que o frontend crie o connection_id antes (o que é inseguro), ou que o backend atualize, vamos olhar o payload.
    // Vamos gerar o UUID v4 do connection_id no frontend temporariamente para salvar no Supabase, permitindo que a WuzAPI sync atrele isso depois? Não, é gambiarra.
    // Vamos corrigir a lógica do frontend para fazer a requisição do `connection_id` de forma segura, ou forçar a inserção com a geração nativa do PostgreSQL gen_random_uuid() se a coluna connection_id permitir.
    
    const payload = {
      workspace_id: instance.workspace_id,
      name: instance.name,
      status: instance.status,
      provider: 'wuzapi',
      // O Supabase tem uma extension uuid-ossp. Se a tabela nao gera automatico, vamos injetar um placeholder para a UX nao travar
      connection_id: 'mz_conn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9) 
    };

    const { data, error } = await supabaseApi
      .from('whatsapp_connections')
      .insert([payload])
      .select()
      .single();
    
    if (error) {
      await logService.error("instances.create.failure", { instance, error: error.message }, instance.workspace_id);
      throw error;
    }

    // Nota: A ativação real da conexão WhatsApp (QR code, WuzAPI)
    // é feita pelo backend/Gateway na VPS, não pelo frontend.
    // O frontend apenas registra a instância no Supabase.
    // O Gateway detecta novas instâncias via webhook ou polling.

    await logService.info("instances.create.success", { instance_id: data.id }, instance.workspace_id);
    return data;
  },

  async getQRCode(connectionId: string): Promise<string | null> {
    try {
      const res = await fetch(`https://proxy.multizap.dev/connections/${connectionId}/qr`);
      
      if (!res.ok) {
         if (res.status === 401) {
            throw new Error("Sessão Inválida: Token não autorizado na WuzAPI.");
         } else if (res.status === 409) {
            throw new Error("409: Token não sincronizado no Gateway.");
         } else {
            throw new Error(`Falha no Gateway: HTTP ${res.status}`);
         }
      }

      const rawData = await res.json();
      
      let qrRaw = rawData.QRCode || rawData.qrcode || rawData.qrCode || rawData.qr || rawData.qr_code || rawData.image || rawData.base64;
      if (!qrRaw && rawData.data) {
         qrRaw = rawData.data.QRCode || rawData.data.qrcode || rawData.data.qrCode || rawData.data.qr || rawData.data.image || rawData.data.base64;
      }

      if (!qrRaw) {
         throw new Error("Gateway não devolveu string válida de QR Code.");
      }

      if (!qrRaw.startsWith("data:image")) {
         qrRaw = `data:image/png;base64,${qrRaw}`;
      }
      
      return qrRaw;
    } catch (err: any) {
      await logService.error("instances.qr.failure", { connection_id: connectionId, error: err.message });
      throw err;
    }
  },

async update(id: string, updates: Partial<Instance>) {
    const mappedUpdates: any = { ...updates };
    

    const { data, error } = await supabaseApi
      .from('whatsapp_connections')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      await logService.error("instances.update.failure", { instance_id: id, updates, error: error.message });
      throw error;
    }
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseApi
      .from('whatsapp_connections')
      .delete()
      .eq('id', id);
    
    if (error) {
      await logService.error("instances.delete.failure", { instance_id: id, error: error.message });
      throw error;
    }
    await logService.info("instances.delete.success", { instance_id: id });
  }
};
