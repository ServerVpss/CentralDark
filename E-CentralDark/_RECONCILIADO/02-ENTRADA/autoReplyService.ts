import { supabase } from "@/lib/supabase";
import { logService } from "./logService";

export interface AutoReply {
  id?: string;
  workspace_id: string;
  keyword: string;
  response: string;
  is_active: boolean;
}

export const autoReplyService = {
  async list(workspaceId: string) {
    const { data, error } = await supabase
      .from('auto_replies')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    
    if (error) {
      await logService.error("autoreply.list.failure", { workspace_id: workspaceId, error: error.message });
      throw error;
    }
    return data;
  },

  async save(rule: AutoReply) {
    const { data, error } = await supabase
      .from('auto_replies')
      .upsert([rule])
      .select()
      .single();
    
    if (error) {
      await logService.error("autoreply.save.failure", { rule, error: error.message }, rule.workspace_id);
      throw error;
    }
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('auto_replies')
      .delete()
      .eq('id', id);
    if (error) {
      await logService.error("autoreply.delete.failure", { rule_id: id, error: error.message });
      throw error;
    }
  }
};
