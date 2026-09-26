const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/services/instanceService.ts');
let content = fs.readFileSync(file, 'utf8');

const oldInterface = `export interface Instance {
  id?: string;
  workspace_id: string;
  name: string;
  phone?: string;
  status: 'connected' | 'qr_code' | 'disconnected' | 'connecting';
  wuzapi_instance_id?: string;
  qr_code_base64?: string;
}`;

const newInterface = `export interface Instance {
  id?: string;
  workspace_id: string;
  name: string;
  phone?: string;
  status: 'connected' | 'qr_code' | 'disconnected' | 'connecting';
  wuzapi_instance_id?: string; // Mapeado do JSON ou mantido para interface do BOT
  qr_code_base64?: string;     // Mapeado virtualmente de qr_code
  qr_code?: string;
  provider?: string;
}`;

content = content.replace(oldInterface, newInterface);

const oldList = `  async list(workspaceId: string) {
    const { data, error } = await supabase
      .from('instances')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });
    
    if (error) {
      await logService.error("instances.list.failure", { workspace_id: workspaceId, error: error.message });
      throw error;
    }
    return data;
  },`;

const newList = `  async list(workspaceId: string) {
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });
    
    if (error) {
      await logService.error("instances.list.failure", { workspace_id: workspaceId, error: error.message });
      throw error;
    }
    
    // Normaliza para o Frontend (Adiciona compatibilidade de qr_code_base64 e status se nulos)
    return (data || []).map(conn => ({
      ...conn,
      qr_code_base64: conn.qr_code || '',
      status: conn.status || 'disconnected'
    }));
  },`;

content = content.replace(oldList, newList);

const oldCreate = `  async create(instance: Instance) {
    const { data, error } = await supabase
      .from('instances')
      .insert([instance])
      .select()
      .single();`;

const newCreate = `  async create(instance: Instance) {
    const payload = {
      workspace_id: instance.workspace_id,
      name: instance.name,
      status: instance.status,
      provider: 'wuzapi',
    };

    const { data, error } = await supabase
      .from('whatsapp_connections')
      .insert([payload])
      .select()
      .single();`;

content = content.replace(oldCreate, newCreate);

const oldGetQR = `  async getQRCode(id: string): Promise<string | null> {
    // QR code é gerado pelo Gateway e salvo no Supabase.
    // Frontend apenas lê o campo qr_code_base64 da instância.
    const { data, error } = await supabase
      .from('instances')
      .select('qr_code_base64, status')
      .eq('id', id)
      .single();`;

const newGetQR = `  async getQRCode(id: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('qr_code, status')
      .eq('id', id)
      .single();`;

content = content.replace(oldGetQR, newGetQR);
content = content.replace(/data\?\.qr_code_base64/g, 'data?.qr_code');

const oldUpdate = `  async update(id: string, updates: Partial<Instance>) {
    const { data, error } = await supabase
      .from('instances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();`;

const newUpdate = `  async update(id: string, updates: Partial<Instance>) {
    const mappedUpdates: any = { ...updates };
    if (updates.qr_code_base64 !== undefined) {
       mappedUpdates.qr_code = updates.qr_code_base64;
       delete mappedUpdates.qr_code_base64;
    }
    if (updates.wuzapi_instance_id !== undefined) {
       // Mantemos omitido ou podemos salvar no session_data dependendo da logica do bridge.
       delete mappedUpdates.wuzapi_instance_id; 
    }

    const { data, error } = await supabase
      .from('whatsapp_connections')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();`;

content = content.replace(oldUpdate, newUpdate);

const oldDelete = `  async delete(id: string) {
    const { error } = await supabase
      .from('instances')
      .delete()
      .eq('id', id);`;

const newDelete = `  async delete(id: string) {
    const { error } = await supabase
      .from('whatsapp_connections')
      .delete()
      .eq('id', id);`;

content = content.replace(oldDelete, newDelete);

fs.writeFileSync(file, content, 'utf8');
console.log('instanceService.ts updated to use whatsapp_connections.');
