const fs = require('fs');
const path = require('path');

const serviceFile = path.join(__dirname, 'apps/bot/src/services/instanceService.ts');
let serviceContent = fs.readFileSync(serviceFile, 'utf8');

const oldInterface = `export interface Instance {
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

const newInterface = `export interface Instance {
  id?: string;
  workspace_id: string;
  name: string;
  phone?: string;
  phone_last4?: string;
  connection_id?: string;
  status: 'connected' | 'qr_code' | 'disconnected' | 'connecting';
  provider?: string;
  connection_mode?: string;
  is_active?: boolean;
  is_own_number?: boolean;
}`;

serviceContent = serviceContent.replace(oldInterface, newInterface);

const oldList = `  async list(workspaceId: string) {
    const { data, error } = await supabaseApi
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

const newList = `  async list(workspaceId: string) {
    const { data, error } = await supabaseApi
      .from('whatsapp_connections')
      .select('id, workspace_id, name, phone, phone_last4, connection_id, status, provider, connection_mode, is_active, is_own_number, created_at, updated_at')
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
  },`;

serviceContent = serviceContent.replace(oldList, newList);

const qrBlockStart = `  async getQRCode(id: string): Promise<string | null> {`;
if (serviceContent.includes(qrBlockStart)) {
   let startIdx = serviceContent.indexOf(qrBlockStart);
   let nextMethodIdx = serviceContent.indexOf('async update(', startIdx);
   if (nextMethodIdx !== -1) {
      serviceContent = serviceContent.substring(0, startIdx) + serviceContent.substring(nextMethodIdx);
   }
}

serviceContent = serviceContent.replace(`if (updates.qr_code_base64 !== undefined) {\n       mappedUpdates.qr_code = updates.qr_code_base64;\n       delete mappedUpdates.qr_code_base64;\n    }\n    if (updates.wuzapi_instance_id !== undefined) {\n       // Mantemos omitido ou podemos salvar no session_data dependendo da logica do bridge.\n       delete mappedUpdates.wuzapi_instance_id; \n    }`, '');
fs.writeFileSync(serviceFile, serviceContent, 'utf8');

const pageFile = path.join(__dirname, 'apps/bot/src/pages/Instances.tsx');
let pageContent = fs.readFileSync(pageFile, 'utf8');

const oldHandleGetQR = `  const handleGetQR = async (inst: Instance) => {
    setQrInstanceId(inst.id!);
    setShowQRModal(true);
    setLoadingQR(true);
    setActiveQR(null);

    try {
      // Se já tem QR no Supabase, mostrar
      const qr = await instanceService.getQRCode(inst.id!);
      if (qr) {
        setActiveQR(qr);
        setLoadingQR(false);
        return;
      }

      // Sinalizar ao Bridge/Gateway que precisa gerar QR
      await instanceService.update(inst.id!, { status: "connecting" });
      toast.info("Solicitando QR Code...", { description: "O servidor está gerando. Aguarde alguns segundos." });

      // O Realtime subscription vai atualizar o QR automaticamente
      // quando o Bridge escrever qr_code_base64 no Supabase
    } catch {
      toast.info("Aguardando QR Code do servidor...");
    }
  };`;

const newHandleGetQR = `  const handleGetQR = async (inst: Instance) => {
    if (!inst.connection_id) {
       toast.error("Conexão inválida", { description: "Nenhum connection_id atrelado. Exclua e recrie o aparelho." });
       return;
    }
    
    setQrInstanceId(inst.id!);
    setShowQRModal(true);
    setLoadingQR(true);
    setActiveQR(null);

    try {
      toast.info("Solicitando QR Code...", { description: "Iniciando sessão real na WuzAPI." });
      
      const res = await fetch(\`https://proxy.multizap.dev/connections/\${inst.connection_id}/qr\`);
      
      if (!res.ok) {
         setLoadingQR(false);
         if (res.status === 401) {
            toast.error("Sessão Inválida", { description: "Token não autorizado na WuzAPI." });
         } else {
            toast.error("Falha no Gateway", { description: \`HTTP \${res.status}\` });
         }
         return;
      }

      const rawData = await res.json();
      
      // Multi-layer fallback parsing
      let qrRaw = rawData.QRCode || rawData.qrcode || rawData.qrCode || rawData.qr || rawData.qr_code || rawData.image || rawData.base64;
      if (!qrRaw && rawData.data) {
         qrRaw = rawData.data.QRCode || rawData.data.qrcode || rawData.data.qrCode || rawData.data.qr || rawData.data.image || rawData.data.base64;
      }

      if (!qrRaw) {
         setLoadingQR(false);
         toast.error("QR Inexistente", { description: "Gateway não devolveu string válida." });
         return;
      }

      if (!qrRaw.startsWith("data:image")) {
         qrRaw = \`data:image/png;base64,\${qrRaw}\`;
      }
      
      setActiveQR(qrRaw);
      setLoadingQR(false);
    } catch (err) {
      setLoadingQR(false);
      toast.error("Erro de Rede", { description: "Não foi possível contactar o proxy." });
    }
  };`;

pageContent = pageContent.replace(oldHandleGetQR, newHandleGetQR);

const oldLogout = `instanceService.update(inst.id!, { status: "disconnected" });`;
const newLogout = `fetch(\`https://proxy.multizap.dev/connections/\${inst.connection_id}/logout\`, { method: 'POST' }).then(() => toast.success("Aparelho deslogado!")).catch(() => toast.error("Falha no logout"));`;
pageContent = pageContent.replace(oldLogout, newLogout);

const oldRealtimeFix = `qr_code_base64: raw.qr_code || '',`;
pageContent = pageContent.replace(oldRealtimeFix, '');
fs.writeFileSync(pageFile, pageContent, 'utf8');
