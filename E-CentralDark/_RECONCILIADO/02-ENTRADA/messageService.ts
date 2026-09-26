import { supabase, supabaseApi } from "@/lib/supabase";
import { logService } from "./logService";

export interface Message {
  id?: string;
  workspace_id: string;
  instance_id: string | null;
  contact_id: string;
  text: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at?: string;
}

export const messageService = {
  async listByContact(contactId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true });
    
    if (error) {
      await logService.error("messages.list.failure", { contact_id: contactId, error: error.message });
      throw error;
    }
    return data;
  },

  async send(message: Message) {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();
    
    if (error) {
      await logService.error("messages.send.failure", { message, error: error.message }, message.workspace_id);
      throw error;
    }
    return data;
  }
};
