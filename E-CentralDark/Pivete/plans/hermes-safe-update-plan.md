# 📋 PLANO SEGURO ATUALIZAÇÃO HERMES AGENT v0.20.0 → v2026.8.27
# BOOT: HERMES-CASA | REGRAS: Zero Regressão | Sem V3/V4 | Extensão Segura

## 1. SNAPSHOT PRÉ-UPDATE (Rollback Point)
- [ ] Backup config.yaml completo
- [ ] Backup ~/.hermes/scripts/ (watchdogs, webui-watchdog)
- [ ] Backup ~/.hermes/cron/ (jobs DB + execuções)
- [ ] Backup ~/AppData/Local/hermes/hermes-agent/ (binário + venv)
- [ ] Backup ~/.hermes/plugins/ (plugins custom)
- [ ] Backup CENTRALDARK.md + skills/ (matrix jobs)
- [ ] Tag git: FIXED_POINT_PRE_HERMES_UPDATE_<timestamp>
- [ ] Verificar: hermes --version → v0.20.0 confirmado

## 2. ISOLAMENTO DE RISCOS (Análise de Impacto)
- [ ] Ler CHANGELOG v2026.8.27 (breaking changes, migrações)
- [ ] Verificar: config.yaml schema mudou?
- [ ] Verificar: cron job format mudou?
- [ ] Verificar: plugin SDK/API mudou?
- [ ] Verificar: computer_use/cua-driver path mudou?
- [ ] Verificar: python venv requirements mudou?
- [ ] Listar: o que PODE quebrar nossos watchdogs/cron/plugins

## 3. ATUALIZAÇÃO CONTROLADA (Safe Update)
- [ ] hermes update --dry-run (se existir) OU hermes update
- [ ] NÃO rodar hermes setup (reconfigura do zero = risco)
- [ ] Verificar: hermes --version → v2026.8.27
- [ ] Verificar: python venv intacto (3.11.15)
- [ ] Verificar: cua-driver path inalterado
- [ ] Verificar: ~/.hermes/scripts/ intacto
- [ ] Verificar: ~/.hermes/cron/ jobs ativos

## 4. VALIDAÇÃO PÓS-UPDATE (Health Gates)
- [ ] R1: CADEIA_CASA_HEALTH → 5/5 endpoints 200
- [ ] R2: GATEWAY_OMNI_ROUTER → omni 8099 /v1/models + SOL 8787
- [ ] R3: SCREENPIPE_MCP_FIX → 3030 healthy
- [ ] R6: WATCHDOG_CADEIA_FREE → cron jobs rodando
- [ ] Cron: hermes cron list → jobs ativos (Cadeia Free + WebUI)
- [ ] Logs: cadeia-free-watchdog.log → FIXED_POINT_OK

## 5. ROLLBACK AUTOMÁTICO SE FALHAR
- [ ] Se qualquer gate falhar → restaurar snapshot
- [ ] hermes-agent folder restore
- [ ] config.yaml restore
- [ ] scripts/ restore
- [ ] cron/ restore
- [ ] Tag git rollback

## 6. CONSOLIDAÇÃO (Só se TUDO verde)
- [ ] Atualizar CENTRALDARK.md com versão nova
- [ ] Atualizar skills/centraldark-jobs-matrix.md se houver mudanças
- [ ] Commit: chore(hermes): update v0.20.0 → v2026.8.27
- [ ] Tag: FIXED_POINT_POST_HERMES_UPDATE_<timestamp>

---

DECISÃO: EXECUTAR PLANO? (SIM/NAO)
