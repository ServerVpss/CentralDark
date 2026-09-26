const fs = require('fs');
const path = require('path');

// 1. Add getQRCode to instanceService.ts
const serviceFile = path.join(__dirname, 'apps/bot/src/services/instanceService.ts');
let serviceContent = fs.readFileSync(serviceFile, 'utf8');

const newGetQR = `
  async getQRCode(connectionId: string): Promise<string | null> {
    try {
      const res = await fetch(\`https://proxy.multizap.dev/connections/\${connectionId}/qr\`);
      
      if (!res.ok) {
         if (res.status === 401) {
            throw new Error("Sessão Inválida: Token não autorizado na WuzAPI.");
         } else {
            throw new Error(\`Falha no Gateway: HTTP \${res.status}\`);
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
         qrRaw = \`data:image/png;base64,\${qrRaw}\`;
      }
      
      return qrRaw;
    } catch (err: any) {
      await logService.error("instances.qr.failure", { connection_id: connectionId, error: err.message });
      throw err;
    }
  },`;

if (!serviceContent.includes('getQRCode(')) {
    // Inject after create method
    const createEnd = '    return data;\n  },';
    serviceContent = serviceContent.replace(createEnd, createEnd + '\n' + newGetQR);
    fs.writeFileSync(serviceFile, serviceContent, 'utf8');
}

// 2. Refactor Instances.tsx
const pageFile = path.join(__dirname, 'apps/bot/src/pages/Instances.tsx');
let pageContent = fs.readFileSync(pageFile, 'utf8');

const oldHandleQR = `  const handleGetQR = async (inst: Instance) => {
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

const newHandleQR = `  const handleGetQR = async (inst: Instance) => {
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
      const qrRaw = await instanceService.getQRCode(inst.connection_id);
      
      if (qrRaw) {
        setActiveQR(qrRaw);
      }
    } catch (err: any) {
      toast.error("Falha ao gerar QR Code", { description: err.message || "Tente forçar o logout e gerar novamente." });
    } finally {
      setLoadingQR(false);
    }
  };`;

if (pageContent.includes('const res = await fetch(`https://proxy')) {
    pageContent = pageContent.replace(oldHandleQR, newHandleQR);
    fs.writeFileSync(pageFile, pageContent, 'utf8');
}
