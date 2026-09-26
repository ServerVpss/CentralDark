# Plano de correcao recomendado — CENTRALDARK-PM2-MCP-FORENSIC-PRECHECK-01

MODO DESTA AUDITORIA: READ_ONLY. Nenhuma mutacao foi executada.
Este plano e proposta; cada item exige autorizacao explicita do Chefe antes de rodar.

## Ordem segura de aplicacao

### FASE 0 — Proteger o que esta fragil (ANTES de qualquer coisa)
1. NAO executar pm2 restart, reload, resurrect, save ou delete ate concluir a Fase 1.
   Motivo: CentralDark-LovableBridge e CentralDark-AiPromptAPI rodam SEM codigo no disco.
   Um restart mata os dois permanentemente.
2. Confirmar no Git se os dois arquivos existem em algum commit:
   - apps/modulos/lovable-openai-bridge/server.mjs
   - apps/modulos/status/ai-prompt-server.mjs
   Teste: git log --oneline -- <caminho>
   Evidencia esperada: commit que contenha o arquivo, ou confirmacao de que nunca existiu.
   Rollback: nenhum (operacao de leitura).

### FASE 1 — Restaurar os orfaos
3. Restaurar os arquivos do Git para o disco (git checkout <commit> -- <caminho>).
   Teste: test -f <caminho> retorna 0.
   Evidencia: arquivo presente, diff conferido.
   Rollback: remover o arquivo restaurado (volta ao estado atual, processo segue vivo em memoria).
4. Somente depois disso, decidir se cada servico deve continuar existindo.
   LovableBridge nao escuta porta e nao tem consumidor comprovado — candidato a aposentadoria.

### FASE 2 — Reconciliar o ecosystem
5. Gerar um ecosystem novo a partir do dump.pm2 (fonte que bate com o vivo).
   Teste: comparar nomes do ecosystem novo com pm2 jlist — devem bater 1:1.
   Evidencia: diff vazio.
   Rollback: manter o ecosystem.config.js atual como .bak (ja existem varios .bak no diretorio).
6. Atualizar os dois inventarios documentados (desatualizados em 18 e 27 dias).

### FASE 3 — MCP
7. Corrigir o ReferenceError de mcpAdminTools (dependencia circular) em mcp-diagnostics.js.
   Teste: reiniciar MCP e conferir ausencia do erro no log; /health responde 200.
   Rollback: reverter o commit do fix.
8. Reconciliar versao (package.json 0.3.0 vs runtime 0.4.0) e commitar/reverter o dist.
9. Implementar as 7 ferramentas read-only da allowlist desejada + gate de allowlist explicito.
   Teste: tools/list autenticado retorna apenas as 7; qualquer outra retorna erro de politica.
   Evidencia: receipt do tools/list.
   Rollback: desativar o gate por env var.
10. Investigar a causa raiz do EADDRINUSE (dupla instanciacao) antes de qualquer restart em massa.

### FASE 4 — Higiene de segredos (fora do escopo desta missao, registrar apenas)
11. Reduzir escopo de variaveis por processo.
12. Revisar os 5 binds em 0.0.0.0.

## Requisitos de rollback (validos para toda mutacao)
- Snapshot do dump.pm2 antes de qualquer operacao PM2.
- Backup do ecosystem antes de sobrescrever.
- Nenhuma operacao em lote: um servico por vez, com verificacao entre cada um.
- Nunca usar pm2 resurrect enquanto existir processo orfao sem codigo restaurado.
