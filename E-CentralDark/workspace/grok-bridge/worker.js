const { execSync } = require('child_process');
const fs = require('fs');

const SSH_TARGET = 'Segredo-VPS';
const SIGNATURE = '\n\n— via CentralDark Terminal (PC local)';

const REMOTE_REQ = '/tmp/grok_request.json';
const REMOTE_RES = '/tmp/grok_response.json';

let lastId = '';

console.log('[GrokBridge] Iniciado (versão limpa)...');

setInterval(() => {
  try {
    // SSH limpo (sem tentar abrir túnel)
    const sshCmd = `ssh -o ForwardAgent=no -o ForwardX11=no ${SSH_TARGET}`;

    const exists = execSync(`${sshCmd} "test -f ${REMOTE_REQ} && echo 1 || echo 0"`, { encoding: 'utf8' }).trim();
    if (exists !== '1') return;

    const reqRaw = execSync(`${sshCmd} "cat ${REMOTE_REQ}"`, { encoding: 'utf8' });
    const req = JSON.parse(reqRaw);

    if (req.id === lastId) return;
    lastId = req.id;

    console.log(`[GrokBridge] Processando: ${req.id}`);

    const prompt = (req.text || '').replace(/"/g, '\\"');
    const grokOut = execSync(`echo "${prompt}" | grok run`, { encoding: 'utf8', timeout: 30000 }).trim();

    const final = grokOut + SIGNATURE;

    const response = {
      id: req.id,
      chat_id: req.chat_id,
      reply: final,
      ts: Date.now()
    };

    fs.writeFileSync('C:\\temp\\grok_response.json', JSON.stringify(response));

    execSync(`scp C:\\temp\\grok_response.json ${SSH_TARGET}:${REMOTE_RES}`);
    execSync(`${sshCmd} "rm -f ${REMOTE_REQ}"`);

    console.log(`[GrokBridge] Resposta enviada: ${req.id}`);

  } catch (e) {
    console.error('[GrokBridge] Erro:', e.message);
  }
}, 1200);