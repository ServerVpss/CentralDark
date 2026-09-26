---
title: Multi-Window Omega Rendezvous — Reconciliar janelas/terminais VS Code em braços T0..TN
---

# Multi-Window Omega Rendezvous

Técnica validada em 2026-08-27 para transformar múltiplas janelas/terminais de IA
(Hermes, Claude, Grok, Codex) numa única missão CentralDark com identidade lógica
estável, receipts e CROSS_WINDOW_RENDEZVOUS — sem criar V2 de enxame/router.

## Princípios (da intenção do SEGREDO/CHEFE)

- `REUSE_BEFORE_CREATE` — estender owner existente, não duplicar.
- `ONE_SYSTEM_ONLY` / `NO_PARALLEL_ORCHESTRATOR` — um T0 (Sol), braços são WORKERS.
- `ONE_WRITER_PER_SCOPE` — cada braço grava SÓ seu receipt.
- `UNKNOWN_IS_NOT_PASS` — gate de contradição no rendezvous.
- `PRESERVE_CURRENT_WINDOWS` / `DO_NOT_KILL_STALLED_SESSION` — só lê processos, não mata.
- `DO_NOT_REQUIRE_HUMAN_MANUAL_CONFIGURATION` — o agente gera tudo.

## Owner reutilizado (NÃO criar V2)

- `scripts/enxame-3ias.sh` — dispara 3 IAs em paralelo (GPT/Gemini/Claude) via `darkai`,
  cada uma salva receipt em arquivo, depois consolida. Semântica de braços paralelos.
- `apps/modulos/HERMES-CORE/core/orchestrator.mjs` — orquestrador canônico (T0).
- `apps/modulos/HERMES-CORE/core/continuity-guard.mjs` — reconciled snapshot / one-writer.

O "Enxame Ômega/Overclock" histórico (`docs/RELATORIOS/2026-07-10-pacotao-centraldark/`)
é auditoria web de performance + nascimento do método do Pivete — **NÃO é sistema
multi-terminal**. Não confundir; reconciliar significa "usar a ideia de braços sob uma
missão", não copiar aquele artefato.

## Arquitetura implementada (runtime local, fora do git)

Arquivos em `E:/CentralDark/Pivete/` (runtime da Casa, não commitado no repo):

| Arquivo | Papel |
|---|---|
| `OMEGA_RENDEZVOUS.json` | Registry compartilhado: T0 emite INTENT, braços gravam RECEIPT. Campos: TERMINAL_ID, ENGINE, PID, WORKSPACE, STATE, MISSION_ID, SNAPSHOT_ID, LAST_RECEIPT + array RECEIPTS por braço. |
| `omega-scan.ps1` | Descobre VS Code/terminais vivos via `Get-CimInstance Win32_Process` + `Shell.Application` windows. **SÓ descobre** (PID/ENGINE/WORKSPACE/STATE) — NÃO inventa T-ID. Preserva T-ID se o braço já se declarou. |
| `omega-register.ps1` | Braço auto-declara receipt estruturado: `powershell -File omega-register.ps1 -TerminalId Tn -Facts "..." -Evidence "..." -Unknown "..." -Contradictions "..." -Counterproof "..." -Residual "..." -Verdict PASS`. Cria o entry do braço se não existir (auto-declaração). |
| `omega-rendezvous.ps1` | CROSS_WINDOW_RENDEZVOUS: normalize → dedupe → detecta contradição (mesmo TERMINAL_ID com VERDICT oposto) → reconciled snapshot → FIXED_POINT. |

## T-ID estável NÃO depende de PID

`omega-scan.ps1` numerava T1..TN arbitrary por ordem de processo — isso NÃO bate com a
auto-identidade dos braços (ex: Hermes se intitula T2 no print do usuário). Correção:
scan apenas descobre; o `TERMINAL_ID` é settado pelo braço no `omega-register.ps1`
(auto-declaração). T0 = Sol (esta sessão), T2 = Hermes, T3 = Claude, etc.

## Comandos de uso real

```powershell
# 1. Descobrir braços vivos (numa janela qualquer)
powershell -File E:/CentralDark/Pivete/omega-scan.ps1

# 2. Cada braço se registra (Hermes-T2, Claude-T3, etc.)
powershell -File E:/CentralDark/Pivete/omega-register.ps1 -TerminalId T2 `
  -Facts "Hermes-Casa como WORKER T2" -Evidence "scan achou N bracos" `
  -Counterproof "owner enxame-3ias.sh reusado" -Verdict PASS

# 3. Consolidar (T0 ou qualquer braço)
powershell -File E:/CentralDark/Pivete/omega-rendezvous.ps1
# → FIXED_POINT_PASS: True | Contradicoes: 0 | Unknown material: 0
```

## Gates de FIXED_POINT (do rendezvous)

- `SAME_MISSION_ID` · `REQUIRED_BEARINGS_COVERED` (T0 presente) · `UNKNOWN_MATERIAL=0`
- `NO_MATERIAL_CONTRADICTION` (mesmo braço com VERDICT oposto → derruba)
- `COUNTERPROOF_SURVIVES` · `T1_STABLE` (nenhum STALLED) · `ONE_WRITER_PER_SCOPE`

## Contraprova aplicada (obrigatória)

Registrar T1 com `Verdict=FAIL` depois de `Verdict=PASS` → rendezvous detecta
`CONTRADICAO T1: verditos=FAIL,PASS` e baixa `FIXED_POINT_PASS: False`.
Prova que o gate de contradição é real, não teatro.

## Limitações / residual

- `code` CLI **não** expõe listagem de terminais/janelas ativas — identificação por
  CLI nativa é limitada. T-ID estável por auto-declaração cobre identidade lógica sem
  depender de mapeamento PID→janela visual (exigiria extensão VS Code ou insiders).
- Braço que não roda `omega-register.ps1` (ex: Claude com loop próprio) não entra no
  registry → `REQUIRED_BEARINGS_COVERED` parcial até ele registrar.
- Testes locais de `node --test` com `new URL("../..").pathname` quebram no MSYS
  (ver SKILL.md §14.6); validar no runner Linux.
