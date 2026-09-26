const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/pages/Instances.tsx');
let content = fs.readFileSync(file, 'utf8');

const oldHandleGetQR = `  const handleGetQR = async (inst: Instance) => {
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

const newHandleGetQR = `  const handleGetQR = async (inst: Instance) => {
    if (!inst.connection_id) {
       toast.error("Conexão Inválida", { description: "Nenhum connection_id atrelado. Exclua e recrie o aparelho." });
       return;
    }
    
    setQrInstanceId(inst.id!);
    setShowQRModal(true);
    setLoadingQR(true);
    setActiveQR(null);

    try {
      toast.info("Solicitando QR Code...", { description: "Iniciando sessão real no Gateway." });
      const qrRaw = await instanceService.getQRCode(inst.connection_id);
      
      if (qrRaw) {
        setActiveQR(qrRaw);
      }
    } catch (err: any) {
      // Se retornar 409 (Conflict), significa que o Token do WuzAPI ainda não foi sinkado. O Worker background vai tentar criar.
      if (err.message && err.message.includes("409")) {
        toast.error("Aguardando WuzAPI Sync", { description: "O servidor ainda está registrando este aparelho. Tente em 10 segundos." });
      } else {
        toast.error("Falha ao gerar QR Code", { description: err.message || "Tente forçar o logout e gerar novamente." });
      }
    } finally {
      setLoadingQR(false);
    }
  };`;

if (content.includes(oldHandleGetQR)) {
  content = content.replace(oldHandleGetQR, newHandleGetQR);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Instances.tsx getQR UI handler updated.");
}
