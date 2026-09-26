const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/normalizeService.js');
let content = fs.readFileSync(file, 'utf8');

// I will append the descriptive fields directly inside the return objects.
// Wait, the prompt said: 
// "Também adicionar campos descritivos no registry de eventos, por exemplo:"
// "Message: { domain: 'message', label: 'Mensagem de WhatsApp', laymanDescription: '...' }"
// I'll create a dictionary mapping inside the normalize service and attach these fields so they are documented and accessible if needed.

const registryInject = `
const EVENT_REGISTRY = {
  'message.received': {
    domain: "message",
    label: "Mensagem Recebida",
    laymanDescription: "Quando alguém envia ou recebe uma mensagem no WhatsApp.",
    opensTicket: true,
    updatesContact: true,
    savesMessage: true
  },
  'presence.updated': {
    domain: "chat",
    label: "Status de Digitação",
    laymanDescription: "Quando o usuário está 'digitando...' ou 'gravando áudio...'.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'message.receipt': {
    domain: "message",
    label: "Confirmação de Leitura",
    laymanDescription: "Os 'tiques azuis' avisando se a pessoa recebeu ou leu a mensagem.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'history.sync': {
    domain: "system",
    label: "Sincronização de Histórico",
    laymanDescription: "Quando o celular empurra todas as mensagens antigas para o nosso sistema.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: true
  },
  'connection.qr': {
    domain: "system",
    label: "Código QR",
    laymanDescription: "Quando o sistema pede o QR Code para conectar um celular novo.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'connection.connected': {
    domain: "system",
    label: "Aparelho Conectado",
    laymanDescription: "Quando o WhatsApp conecta com sucesso no servidor e está pronto para uso.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'connection.disconnected': {
    domain: "system",
    label: "Aparelho Desconectado",
    laymanDescription: "Quando a conexão com a Meta cai, ou o celular fica sem internet.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  },
  'connection.error': {
    domain: "system",
    label: "Erro na Conexão",
    laymanDescription: "Qualquer problema técnico que a WuzAPI ou os servidores do Facebook enfrentem.",
    opensTicket: false,
    updatesContact: false,
    savesMessage: false
  }
};

function enrichWithLaymanRegistry(normalizedPayload) {
  if (!normalizedPayload || !normalizedPayload.event) return normalizedPayload;
  const ev = normalizedPayload.event;
  if (EVENT_REGISTRY[ev]) {
    normalizedPayload._meta = EVENT_REGISTRY[ev];
  }
  return normalizedPayload;
}
`;

if (!content.includes('EVENT_REGISTRY')) {
  // Inject before module.exports
  content = content.replace('module.exports = { normalize, _flatten: flatten };', registryInject + '\nmodule.exports = { normalize: (raw) => enrichWithLaymanRegistry(normalize(raw)), _flatten: flatten, EVENT_REGISTRY };');
  fs.writeFileSync(file, content, 'utf8');
}
