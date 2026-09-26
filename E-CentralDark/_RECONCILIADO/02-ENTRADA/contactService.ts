import { supabase, supabaseApi } from "@/lib/supabase";
import { logService } from "./logService";

export interface Contact {
  id?: string;
  workspace_id: string;
  name: string;
  phone: string;
  tags?: string[];
  notes?: string;
  is_blocked?: boolean;
}

export const contactService = {
  async list(workspaceId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    
    if (error) {
      await logService.error("contacts.list.failure", { workspace_id: workspaceId, error: error.message });
      throw error;
    }
    return data;
  },

  async create(contact: Contact) {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single();
    
    if (error) {
      await logService.error("contacts.create.failure", { contact, error: error.message }, contact.workspace_id);
      throw error;
    }
    
    await logService.info("contacts.create.success", { contact_id: data.id }, contact.workspace_id);
    return data;
  },

  async update(id: string, updates: Partial<Contact>) {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      await logService.error("contacts.update.failure", { contact_id: id, updates, error: error.message });
      throw error;
    }
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    if (error) {
      await logService.error("contacts.delete.failure", { contact_id: id, error: error.message });
      throw error;
    }
    await logService.info("contacts.delete.success", { contact_id: id });
  }
};
