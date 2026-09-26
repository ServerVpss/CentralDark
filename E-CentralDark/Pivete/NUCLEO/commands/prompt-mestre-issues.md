# COMANDO - prompt-mestre-issues.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\prompt-mestre-issues.md
**SHA:** 2157de680ca4db6a
**Timestamp:** 2026-08-28T02:57:25.193041
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Branch padrão: `main`

### Ouro Bruto (primeiros 5000 chars)
```
# PROMPT MESTRE CENTRALDARK — ISSUES AJUSTE FINO — REFERÊNCIA

Fonte: `E:\CentralDark\PROMPT-MESTRE-CENTRALDARK-ISSUES-AJUSTE-FINO.txt` (canônico)

## Ajustes selados

- Detecção de estagnação por tarefa, após 3 ciclos consecutivos sem progresso
- Nenhum limite global cego para a missão
- Bash fail-closed com `set -Eeuo pipefail` e erro sanitizado
- `set -x` proibido por padrão para evitar vazamento operacional

## Missão

Reconciliar integralmente: GitHub, `main`, issues abertas, workflows, VPS, repositórios e worktrees locais, processos PM2/systemd/Docker, listeners e portas, arquivos órfãos, versões da aplicação, documentação operacional, pendências reais.

Ao final: toda issue classificada, obsoleta encerrada, duplicatas consolidadas, falsos positivos encerrados, problemas reais corrigidos e provados, ouro exclusivo da VPS versionado no GitHub, lixo da VPS removido, serviços canônicos executando SHA correto, workflows necessários verdes, sem processo duplicado ou checkout divergente no runtime, sem listener legado na porta 9300, estado final registrado no GitHub.

## Fonte da verdade

GitHub = fonte da verdade. VPS = ambiente de execução e possível fonte temporária de achados, nunca fonte silenciosa permanente.

Código na VPS que não existe no GitHub: não tratar como correto automaticamente → classificar → revisar → sanitizar → testar → promover somente o ouro → remover o restante depois da prova.

## Estado inicial fixado

- Repositório: `ServerVpss/CentralDark`
- Branch padrão: `main`
- PR #285 fechado e mergeado em `pivete/dev`
- PR #286 promoveu admin-guard para `main`
- Não promover `pivete/dev` inteira
- Não repetir merge do PR #285
- `AGENTS.md` já existe na `main`
- PR #287 aposentou webhook mutante da porta 9300
- Estado esperado porta 9300: sem listener legado
- Issue #122 = programa-mãe existente

## Modelo de orquestração multiagente

Todos os agentes recebem o mesmo cabeçalho: MISSION_ID, MAIN_SHA, VPS_REPO_SHA, ISSUE_SNAPSHOT_HASH, TIMESTAMP, ESCOPO, AÇÃO AUTORIZADA, AÇÃO PROIBIDA.

8 agentes: OPUS/Maestro, Lupa Bayesiana, Auditor GitHub, Inspetor VPS, DarkAI/Gemini Consultivo, Codex Final, Executor de Limpeza, Provedor.

## Ciclo operacional

OBSERVAR → CLASSIFICAR → DEBATER → AGIR MÍNIMO → REVISAR → PROVAR → REGISTRAR → AVANÇAR

Missão encerra somente por: DEPLOYED_TO_MAIN ou BLOCKED.

## 15 Fases (resumo)

1. **Inventário GitHub** — listar issues, classificar (RESOLVED_LIVE, DUPLICATE, OBSOLETE_ARCHITECTURE, FALSE_POSITIVE, ACTIONABLE, GOLD_TO_PRESERVE, UNKNOWN)
2. **Deduplicação da Sentinela** — agrupar por hash, endpoint, workflow, porta, erro, componente, intervalo temporal
3. **Consolidação de Governança** — usar issue #122 como programa-mãe, zero ruído
4. **Inventário Forense VPS** — somente leitura, mapear repositórios, provar runtime por cwd/PID/porta/SHA/health
5. **Classificação Artefatos VPS** — CANONICAL, GOLD, REPRODUCIBLE_JUNK, ORPHANED, ACTIVE_RUNTIME, UNKNOWN
6. **Extração do Ouro** — comparar contra main, sanitizar diff, remover secrets, menor mudança, branch transitória, testar, PR, merge com gates verdes
7. **Protocolo de Exclusão** — manifesto antes de apagar, backup, provar ausência, espaço liberado, serviços saudáveis
8. **AGENTS.md** — hash da main, comparar cópias VPS, sincronizar ou promover delta
9. **PR #285 / Admin-Guard** — não repetir promoção, confirmar tudo presente
10. **Porta 9300** — PORT_9300_NO_LISTENER, identificar PID/processo/cwd/comando/árvore pai/PM2, não matar desconhecido, encerrar só webhook legado comprovado
11. **DarkAI e Revisores** — não imprimir variáveis/env/Authorization/.env/tokens, revisões paralelas (arquitetura, segurança, GitHub/issues, VPS/processos, exclusão/rollback)
12. **Correção Issues Reais** — reproduzir, fixar estado/SHA, causa raiz, correção mínima, testar, revisar paralelo, PR, fixar HEAD_SHA, checks, merge com expected_head_sha, deploy, validar VPS, comentar issue, encerrar
13. **Deploy Canônico** — fixar MAIN_SHA, confirmar remote/branch/árvore, worktree isolado, instalar deps reproduzível, typecheck, testes, build, comparar dist, revisar, deploy com stop/start só processo relacionado, confirmar PID/cwd/health/catálogo/startup audit/SHA/porta 9300 livre
14. **Limpeza Workflows** — listar vermelhos, classificar (REQUIRED, RELATED, LEGACY, DUPLICATE, NON_BLOCKING), corrigir ou aposentar
15. **Loop de Encerramento** — reconsultar issues/PRs/workflows/processos/listeners/health, comparar snapshot anterior

## Trava de estagnação (sem limite global cego)

Por tarefa/gate individual: TASK_ID, STATE_FINGERPRINT, ÚLTIMO_PROGRESSO, CICLOS_SEM_PROGRESSO, EVIDÊNCIA_ATUAL, PRÓXIMA_AÇÃO.

Progresso real = issue classificada/consolidada/corrigida/encerrada, redução duplicatas/ruído, novo diagnóstico causal, alteração SHA/PR/check/workflow, correção aplicada/testada, processo/listener/health/runtime no estado esperado, ouro promovido, lixo removido, bloqueador avançou, evidência nova capaz de alterar decisão.

Após 3 ciclos sem progr
```