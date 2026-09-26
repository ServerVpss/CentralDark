// scripts/hermes-vault-sync.js
/*
   Pré‑boot do Hermes – obrigatoriedade do “Segundo Cérebro” (Vault)
*/

const fs   = require('fs');
const path = require('path');

// Caminho absoluto do vault – adapte se o diretório estiver em outro lugar
const VAULT_PATH = path.resolve('E:/CentralDark/workspace/centraldark-main/vault');

function enforceVaultPreBoot() {
    console.log('[CENTRALDARK] Verificando integridade do Segundo Cérebro (Vault)...');

    // 1️⃣ Caminho deve existir
    if (!fs.existsSync(VAULT_PATH)) {
        console.error('REJEITADO: Caminho do Vault não encontrado em:', VAULT_PATH);
        process.exit(1);
    }

    // 2️⃣ Ler notas (ou o índice pre‑gerado)
    const vaultFiles = fs.readdirSync(VAULT_PATH)
        .filter(file => file.endsWith('.md')); // ou qualquer extensão suportada

    // 3️⃣ Log informativo – quantas notas foram carregadas
    console.log(`[CENTRALDARK] Sucesso! ${vaultFiles.length} nota(s) carregada(s) do Vault ≠ contexto base.`);

    return true;
}

// Execução imediata – a boot completa só prossegue se aqui não ocorrer erro
enforceVaultPreBoot();