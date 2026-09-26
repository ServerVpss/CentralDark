import { supabase } from "@/lib/supabase";
import { logService } from "./logService";

export interface Webhook {
  id?: string;
  workspace_id: string;
  url: string;
  is_active: boolean;
  secret_hash?: string;
}

export const webhookService = {
  async list(workspaceId: string) {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    
    if (error) {
      await logService.error("webhooks.list.failure", { workspace_id: workspaceId, error: error.message });
      throw error;
    }
    return data;
  },

  async save(webhook: Webhook) {
    const { data, error } = await supabase
      .from('webhooks')
      .upsert([webhook])
      .select()
      .single();
    if (error) {
      await logService.error("webhooks.save.failure", { webhook, error: error.message }, webhook.workspace_id);
      throw error;
    }
    return data;
  }
};
