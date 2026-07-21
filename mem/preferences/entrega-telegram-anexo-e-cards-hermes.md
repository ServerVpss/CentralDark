# Preferência Pivete — Entrega Telegram (cards + anexos) · 2026-07-17

**Status:** OBRIGATÓRIA · anti-esquecimento entre sessões  
**Agente:** Grok 4.5 CLI (e qualquer IA na VPS CentralDark)

## O que o Pivete selou nesta sessão

### A) Card Hermes SEMPRE (ação relevante / estudo)
- Admin privado: Card Hermes completo em **um** `<pre>`
- Canal status: **1 linha seca** (sem moldura)
- Bot: `@srver1bot`
- Não entregar só no chat da CLI
- Regra: `.grok/rules/01-cards-estudo-telegram-pivete.md`
- Envio card: `apps/modulos/HERMES-CORE/utils/notify.mjs`

### B) Anexo .md / .txt em entregas GRANDES / SEGURANÇA
Quando for inventário, auditoria, mapa denso, segurança, volume alto:
- Enviar **anexo** via Telegram `sendDocument`
- Formatos: **`.md` e/ou `.txt`** — preferência **os dois**
- Bem estruturado, categorizado (Regras de Ouro)
- **Zero secrets**
- Card = resumo; **anexo = corpo completo**
- Regra: `.grok/rules/06-anexo-telegram-grande-seguranca.md`

### C) Prova real desta sessão
- Teste vazio: msg_id **6971** (.md), **6972** (.txt)
- Inventário reenviado: msg_id **6974** (.md), **6975** (.txt)
- Relatório versionado: `docs/RELATORIOS/2026-07-17-inventario-readonly-infra-centraldark.md` (+.txt)

### D) Missão goal relacionada
- Inventário **100% READ-ONLY** da infra CentralDark (Caddy, portas, PM2, módulos, kill switches)
- Sem alterar estado da VPS na missão de diagnóstico

## Checklist anti-perda (toda sessão Grok)

1. [ ] Li `01-cards` e `06-anexo` em `.grok/rules/`
2. [ ] Ação relevante → card admin + linha status
3. [ ] Entrega grande/segurança → MD e/ou TXT no Telegram
4. [ ] Sem secrets no card nem no anexo
5. [ ] Ouro de preferência → APRENDIZADOS + commit allowlist

**Se reiniciar a sessão e isto sumir do chat = tempo perdido.** Por isso está em: rules Grok (repo + ~/.grok), APRENDIZADOS, HISTORICO-DECISOES, mem/preferences, RELATORIOS.
