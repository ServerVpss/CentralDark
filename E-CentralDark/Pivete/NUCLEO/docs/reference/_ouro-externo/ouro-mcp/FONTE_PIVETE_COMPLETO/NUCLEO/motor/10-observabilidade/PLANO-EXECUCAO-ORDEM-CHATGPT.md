# Plano de execução — ordem ChatGPT (refeito) · sem refazer o verde

**Data:** 2026-07-18  
**UI Hermes:** Grok 4.5 · High (**default restaurado** `xai-oauth:grok-4.5`)  
**Missão:** `20260718_040020_c23e466e` via desktop `20260718_022637_6cf626`  
**Profile:** só `pivete`

---

## Ordem mandada (ChatGPT web)

1. **Deixar Grok 4.5 High** como modelo do chat / default do profile.  
2. Enviar **`/goal` grande** de **continuidade** (não do zero).  
3. No goal: **auto-orquestração** na hierarquia:
   - **ORQUESTRADOR:** Claude (Opus se 200, senão Sonnet; OAuth Claude Code)
   - **CRÍTICO / FALLBACK:** Grok 4.5
   - **EXECUTOR:** grok-build-0.1
   - **RÁPIDO:** grok-composer-2.5-fast
   - **CODEX:** preservar, **não depender**
4. Prova real (não “Connected”).  
5. **Não refazer** o que já está verde.  
6. Só corrigir bloqueios e fechar gaps.

---

## Já verde (NÃO refazer)

- Env Jan limpo (sem `ANTHROPIC_BASE_URL=127.0.0.1:1337`)
- Prova **oi** 200: Opus, Sonnet, Haiku, Grok 4.5, Build, Composer  
  → `PROVA-OI-MODELOS-ORQUESTRACAO.json`
- Fase 2 comunicação: Edge→Opus→sendVoice, card, STT 3 tipos, Read Aloud, reload, rollback
- Dedupe update_id (12 tests)
- Fases 3–9 documentadas §18 (casa, curadoria, memória, FTS, roteamento, contratos, pytest 126)
- Gateway pivete **running**

---

## O que impede / impedia

| Bloqueio | Estado | Ação |
|----------|--------|------|
| Env Jan 1337 | **Removido** | ok |
| Default virado p/ Opus | **Restaurado** grok-4.5 | ok |
| Claude 429 intermitente | Agora oi=200 | Orquestra se 200; senão Grok condicionado |
| Gateway off | **Running** PID recente | ok |
| Falso-verde Claude orquestra sob 429 | Proibido | só promover se 200 |

---

## Execução agora (ordem)

```text
A  Confirmado: default Grok 4.5 + env limpo + oi 200 em todos da orquestra
B  /goal continuidade no Desktop (injetado)
C  Agente: revalidar 1 call real Claude + Grok (rápido)
D  Preencher ORQUESTRAÇÃO CONFIGURADA (Claude orquestra se 200)
E  NÃO reabrir Fases 2 voz/STT já verdes
F  Só se Lupa achar buraco real em 3–9: patch mínimo
G  Atualizar REVISÃO §19 + resultado canônico
H  Parar em bloqueio real (cota, auth, risco)
```

---

## Hierarquia (copiar no goal)

```text
ORQUESTRADOR  = claude-opus-4-6 se HTTP 200; senão claude-sonnet-4-6 se 200; senão grok-4.5
CRITICO       = grok-4.5
EXECUTOR      = grok-build-0.1
RAPIDO        = grok-composer-2.5-fast
CODEX         = reserva
UI / default  = grok-4.5 xai-oauth  (NÃO mudar de novo sem ordem)
```

---

*Plano operacional único · ChatGPT + Pivete · 2026-07-18*
