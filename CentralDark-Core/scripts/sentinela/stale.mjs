#!/usr/bin/env node
/**
 * ============================================================================
 * CENTRALDARK - VIGIA SENTINELA (STALE)
 * ============================================================================
 * Escala issues com a label 'sentinela' que ultrapassaram o tempo limite (TTL)
 * sem resolução ou vínculo a um PR. Adiciona a label 'stale' e notifica.
 * ============================================================================
 */

import { execSync } from 'node:child_process';

// Configurações do ambiente
const REPOSITORIO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const DIAS_LIMITE = Number(process.env.TTL_DIAS || 7);

console.log(`[VIGIA] Iniciando varredura no repositório: ${REPOSITORIO} (Tempo limite: ${DIAS_LIMITE} dias)`);

try {
  // Busca as issues abertas com a label 'sentinela' usando o GitHub CLI (gh)
  const comandoBusca = `gh issue list -R "${REPOSITORIO}" --state open --label sentinela --json number,title,createdAt,labels --limit 100`;
  const respostaNativa = execSync(comandoBusca, { encoding: 'utf8' });
  const listaIssues = JSON.parse(respostaNativa);
  const dataAtual = Date.now();

  let issuesAlteradas = 0;

  for (const issue of listaIssues) {
    // Calcula a idade da issue em dias (converte milissegundos para dias)
    const idadeDias = (dataAtual - new Date(issue.createdAt).getTime()) / 86400000;
    const labels = issue.labels.map((label) => label.name);

    // Ignora se for mais nova que o tempo limite ou se já estiver marcada como 'stale'
    if (idadeDias < DIAS_LIMITE) continue;
    if (labels.includes('stale')) continue;

    try {
      // Adiciona a label 'stale' (ociosa/abandonada)
      execSync(`gh issue edit ${issue.number} -R "${REPOSITORIO}" --add-label stale`, { stdio: 'ignore' });
      
      // Adiciona o comentário de cobrança padronizado
      execSync(
        `gh issue comment ${issue.number} -R "${REPOSITORIO}" -b "⏳ **Aviso do Vigia:** Esta Issue está aberta há ${Math.round(idadeDias)} dias sem um PR linkado. O bot ou o responsável precisa agir ou reatribuir a tarefa."`,
        { stdio: 'ignore' }
      );
      
      console.log(`[+] Alerta emitido: Issue #${issue.number} escalada (${Math.round(idadeDias)} dias ociosa)`);
      issuesAlteradas++;
    } catch (erroEdicao) {
      console.error(`[!] Falha ao atualizar a Issue #${issue.number}:`, erroEdicao.message);
    }
  }

  console.log(`[VIGIA] Varredura concluída com sucesso. Total de issues escaladas: ${issuesAlteradas}`);

} catch (erroGeral) {
  // Captura falhas graves, como a falta do comando 'gh' instalado na VPS
  console.error('[ERRO FATAL] Falha na execução do Vigia. Verifique se o GitHub CLI (gh) está instalado e autenticado na máquina local.', erroGeral.message);
  process.exit(1);
}
