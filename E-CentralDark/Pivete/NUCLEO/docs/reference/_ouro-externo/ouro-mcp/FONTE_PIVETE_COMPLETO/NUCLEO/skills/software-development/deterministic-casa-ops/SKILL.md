---
name: deterministic-casa-ops
description: "Use for Casa/Hermes ops: zero V2, code-first, Combo, CI."
---

# Deterministic Casa Ops

Class-level ops for profile `pivete` + CentralDark release work.  
**Código = caminho garantido. IA = acelerador. Falha de IA ≠ PASS.**

## Mandatos Pivete (hard)
- **Zero regressão** sempre.
- **Zero comando destrutivo** salvo ordem explícita pontual do Chefe.
- **Nunca V1/V2/V3** nem sistema paralelo — estender canônico.
- Goal/skill **duplicada** → parar (`srr`), só preencher gap.
- Só o que falta; intenção humana + lógica; Instinto Superior.
- **Prova** = Pivete vê/toca/testa (distância erro → olhos), não só recibo em disco.
- Ops **paralelo cirúrgico**: enquanto debug roda, operar gateway/Telegram no mesmo turno quando seguro.
- Um **Writer por arquivo/missão** (claude-code = CI/autonomia; grok/casa = menu/skills).

### ORDEM PARE / STOP (harder than mission)
```text
PARE | PARA | ORDEM DIRETA PARE | STOP
```
- **Parar de verdade** no mesmo turno: zero tool call operacional depois.
- Proibido “só verificar”, “só status”, “só YAML”, “só unittest”, “só git status”.
- Proibido reabrir fio, fechar gap, ou “deixar limpo” sem ordem nova.
- Se já estava no meio de tool loop: abortar; resposta curta de reconhecimento; aguardar.
- Continuar depois de PARE = erro operacional (ocorreu 06/08 — não repetir).
- Detail: `references/stop-order-hard.md`

## Combo Potência
Detail umbrella: `combo-potencia-ops`.

Quick facts:
- Aliases: combo potencia / combo-tencia / potoencia / `/combo` / `/combo_potencia`
- Vendor **fora** de `skills/` (`combo-potencia-vendor/`)
- Prefixos `cp-*` / `sp-*`; Casa vence colisão
- Menu: `send_combo_menu` no adapter Telegram Hermes (não MultiZap)
- Mesma mensagem; max 6/página; ECC por categoria
- URL oficial (View on GitHub) antes de raw inventado; graphify branch **v8**
- Após patch adapter: **restart gateway** + smoke **slash** ao vivo
- Manual BotAPI ≠ slash verde
- Loader: `import`/`reload` ou `runpy` — evitar `module_from_spec`+`exec_module` com loader None
- Path helper: `from pathlib import Path as ComboPath` se o módulo só tem `_Path`

Provas disco:
```bash
python profiles/pivete/debug-cirurgico/cli.py combo-case
python -m unittest discover -s profiles/pivete/combo-potencia-menu/tests -q
```

## Debug realtime cirúrgico
Code: `profiles/pivete/debug-cirurgico/`  
Skill user-owned: `debug-realtime-cirurgico` — `hermes curator adopt debug-realtime-cirurgico` se curator deve editar.

```text
WATCH → CAPTURE → FINGERPRINT → DEDUP → REPRO → LOCK WRITER
→ PATCH MÍNIMO → TEST → MUTANTE → RESTORE/ACCEPT → NOTIFY
```

- Restart sem reproduzir evento ≠ PASS
- Notify Telegram curto **sem** traceback completo
- Fallback sem IA: preservar erro, manter rota conhecida, alertar — não inventar patch
- Manual verde + slash vermelho = duas rotas; repro deve cobrir slash

```bash
python -m unittest discover -s profiles/pivete/debug-cirurgico/tests -q
```

## CI / release train
Umbrella PR: `centraldark-pr`.  
PR1 self-hosted **MERGED**: https://github.com/ServerVpss/CentralDark/pull/679  
Refs: `centraldark-pr/references/deterministic-ci-fallback-pr679.md` · `pr679-merged-state.md` · `ci-self-hosted-receipt-pitfalls.md`

Ordem (após #679 na main):
```text
#679 MERGED
→ integrar #662 SOBRE main pós-679 (não rebase cego commit-a-commit nos WFs)
→ #663 → #664 (Writer claude-code / escopo CI)
→ PR3 Casa combo (Writer casa/grok, sem WF)
→ PR4 notify fallback (estender infra/notify + guardiao)
→ #637 escola (Casa only)
→ GATES PASS → MERGE → BACKUP → CANÁRIO → TESTE REAL → PROMOTE → RECEIPT
```
**Sem freio cosmético** `READY_FOR_FINAL_PROMOTION` quando o goal já autorizou o fluxo.  
Detail: `references/promotion-no-cosmetic-stop.md` · `references/pr662-integrate-on-679.md`

### Integração #662 (pitfall 06/08)
- #662 toca os mesmos WFs do #679 + scripts de autoridade.
- Main pós-#679 já tem self-hosted/fork/receipt — **não** reintroduzir `ubuntu-latest`.
- Rebase 16 commits nos WFs = conflito em cascata. Preferir branch de `origin/main` + arquivos não-WF do tip + fundir lógica final #662 no skeleton self-hosted.
- WIP parado sob PARE: `E:/tmp/pr662-rebase` (`fix/662-rebase-on-679`) — testes locais 17/17; **não pushado**.

Pattern job hosted→self-hosted:
1. `runs-on: [self-hosted, Linux]`
2. fork-guard (`id: fork_guard`, outputs blocked/cause)
3. checkout pin `@sha40` + `persist-credentials: false` + ref imutável
4. timeout
5. receipt `if: always()` → PASS|FAIL|BLOCKED; shell if/fi **1:1** (fi órfão = job FAIL com gates verdes)

## Anti-zona / affordance
- `anti-zona-burra-gate` gate #8: caminho oficial > URL inventada
- `reconcile_result`: literal ausente ≠ capacidade ausente

## Related skills
- `combo-potencia-ops`
- `centraldark-pr`
- `debug-realtime-cirurgico` (user-owned)
- `anti-zona-burra-gate` (user-owned)
- `pivete-resposta`
- `systematic-debugging` (bundled)
- `notify-fallback-deterministico`

## Telemetry Architecture Pattern (convergiu com Hermes)
Padrão observado em 07/08 — mesma filosofia em dois domínios:
- **Hermes**: Modelo → Skill → Artefato → Comportamento
- **Dashboard/Telemetria**: Provider → Contrato (TelemetrySnapshot) → Interface

```text
Dashboard (UI)
        │
        ▼
DashboardData (Contrato estável)
        │
        ▼
DashboardService (Orquestração)
        │
        ▼
Provider Registry
        │
 ┌──────┼───────────────┐
 ▼      ▼       ▼       ▼
Meta   GA4   Supabase  Hermes
VPS    GitHub  OpenRouter ...
```

**Provider Registry** responsabilidades: descobrir providers, habilitar/desabilitar por config, prioridade, timeout individual, health check.

**TelemetrySnapshot** (camada intermediária):
```typescript
{
  source: "meta-ads",
  collectedAt: "...",
  latency: 120,
  ttl: 60,
  health: "healthy",
  payload: {...}
}
```

Fluxo: Snapshots → Normalization → DashboardData → UI.

Contrato mínimo obrigatório:
```typescript
interface DataProvider {
  id: string;
  priority: number;
  ttl: number;
  health(): Promise<Health>;
  collect(ctx: DashboardContext): Promise<TelemetrySnapshot>;
}
```

Isso permite adicionar providers (Hermes, GitHub, VPS, Meta, Stripe, OpenRouter) sem tocar na UI.

## Painel 747 — Recuperação e Estabilização (07/08)
- Branch `painel747` recuperado de `SynkraAI/aiox-core` PR #540 (fechado 6 meses atrás)
- Stack: Next.js 15.5.23 + React 19 + Tailwind **v3.4.17** (NÃO v4)
- PostCSS **CommonJS** (`postcss.config.cjs`) — `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`
- `globals.css` com `@tailwind base; @tailwind components; @tailwind utilities;` + CSS vars (sem `@apply`)
- `tailwind.config.js` CommonJS (`module.exports`)
- Porta 3001, RSC, URL-driven state (`/dashboard?productId=x&period=7d`)
- Componentes cockpit: `MetricCard`, `TrendChart`, `GaugeDial`, `StatusLed` — independentes, reutilizáveis
- Lab route `/lab` servindo markdowns da cápsula SOL (2026-07-29) via `public/lab/`

**Pitfall Windows + Tailwind v4**: Tailwind v4 mudou para `@tailwindcss/postcss` package separado. Erro: "It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin". Fix: downgrade para Tailwind v3 + CommonJS postcss config.

## Modo Casa — Autonomia com Fluxo (05/08, reforçado 07/08)
```
PIVETE CHAMA → SOL ENTENDE → HERMES EXECUTA → PROVA RETORNA → FLUXO CONTINUA
```
- **Não perguntar o óbvio** quando direção clara e sem risco real
- Trava SÓ em: risco destrutivo real, segredo/credencial, ação crítica sem autorização, evidência contraditória
- Proibido: "posso continuar?", "quer que eu faça?", "tem certeza?"
- Áudio: TTS Edge Francisca (pt-BR-FranciscaNeural) — canônico, não trocar sem ordem

## FONTE DA VERDADE — Não esquecer (07/08 correção)
```
E:\CentralDark\Pivete\NUCLEO\           ← NÚCLEO (regras, memória, SOUL)
C:\Users\danda\AppData\Local\hermes\profiles\pivete\  ← Profile Hermes ativo
ServerVpss/CentralDark/                 ← REPO CENTRALDARK (GitHub ↔ VPS)
```
`aiox-core` é repo CLONADO EXTERNO — **fora do canônico**. Módulos protegidos em `apps/modulos/` no CentralDark.

## Session notes / references
- `references/stop-order-hard.md`
- `references/pr662-integrate-on-679.md`
- `references/promotion-no-cosmetic-stop.md`
- `combo-potencia-ops/references/session-learnings-2026-08-06-release-train.md`
- `combo-potencia-ops/references/slash-vs-manual-and-loader-2026-08-06.md`
- `centraldark-pr/references/ci-self-hosted-receipt-pitfalls.md`
- `centraldark-pr/references/pr679-merged-state.md`
- `references/over-execution-guard.md`
- `references/response-latency-patterns.md`
- `references/turbopack-windows-workarounds.md`
- `references/project-identification-checklist.md`
- `references/telemetry-architecture-pattern.md`
- `references/painel747-recovery-2026-08-07.md`
- `references/modo-casa-autonomy-flow.md`
- `references/fonte-verdade-canonica.md`
