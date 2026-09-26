import { supabase } from "@/lib/supabase";
import { logService } from "./logService";

export interface Campaign {
  id?: string;
  workspace_id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  total_targets: number;
  sent_count: number;
}

export const campaignService = {
  async list(workspaceId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    
    if (error) {
      await logService.error("campaigns.list.failure", { workspace_id: workspaceId, error: error.message });
      throw error;
    }
    return data;
  },

  async save(campaign: Campaign) {
    const { data, error } = await supabase
      .from('campaigns')
      .upsert([campaign])
      .select()
      .single();
    if (error) {
      await logService.error("campaigns.save.failure", { campaign, error: error.message }, campaign.workspace_id);
      throw error;
    }
    return data;
  }
};
