# 2026-09-06 — #ACORDAR !CENTRALDARK: Boot Persistente e Delta Útil

## Resumo da Sessão

O comando `#ACORDAR !CENTRALDARK` agora carrega **regra persistente no motor**, não one-shot. O delta útil já está na `main` (HEAD `f60ad7181`).

## PRs Merged que compõem o delta

| PR | Commit | Função |
|---|---|---|
| #1425 | a1bb4247 | Dependabot radar + Zendrive perfis + Rabbit handoff + Mineralização |
| #1432 | 720143b | Dependabot radar fix |
| #1434 | 8f1a0e2 | **Trigger Fabric: FULL_BOOT persistente + cadeado do provado** |
| #1438 | 196d932 | **ADM: persistir comando universal CentralDark** |
| #1439 | 1ec204b | Docs: persistir sweep contínuo e contrato HUB |

## Arquivos-chave ADICIONADOS na main

| Arquivo | Função |
|---|---|
| `scripts/trigger-fabric/centraldark_full_trigger_boot.py` | Boot completo persistente (FULL_BOOT) |
| `scripts/trigger-fabric/test_centraldark_full_trigger_boot.py` | Teste do boot |
| `scripts/ci/workflow_dedupe_radar.py` | Radar determinístico de deduplicação |
| `scripts/ci/generate_status_badges.py` | Badges de status |
| `scripts/ci/verify_windows_installer_contract.py` | Contrato do instalador Windows |
| `scripts/dependabot/reconcile-open-prs.sh` | Reconciliação PRs Dependabot |
| `scripts/hermes/signal-mineralize.mjs` | Mineralização de sinais Hermes |
| `.github/workflow-reuse-registry.json` | Registry de reuso de workflows |
| `.github/workflows/workflow-dedupe-radar.yml` | Workflow do radar (agenda `23 3 * * *`) |
| `CENTRALDARK_AI_BOOT.yaml` | Boot da IA persistente |
| `docs/SEGURANCA/ADM-INVENTARIO-COMANDO-UNIVERSAL.md` | Inventário comando universal |

## O que o `!CENTRALDARK` AGORA FAZ (persistente)

1. **Carrega `CENTRALDARK_AI_BOOT.yaml`** — boot canônico
2. **Dispara Trigger Fabric FULL_BOOT** — sweep até FIXED_POINT
3. **Rodar Workflow Dedupe Radar** — detecta duplicação, classifica REUSE_CANDIDATE/INTENTIONAL_PARALLEL
4. **Dependabot update-branch** — com checks amarelos, conflito → resolver canônico
5. **Mineralização de findings** — REFUTED_MINERAL / CRYSTAL_GOLD / UNRESOLVED_MINERAL
6. **Zero Trust reverso** — DESTINO ← RECEIPT ← AÇÃO ← INPUT ← SOURCE ← OWNER
7. **Só fecha FIXED_POINT** quando: unknown_material=0, counterproof_survives=true, same_head_ci=true, receipt presente, residual registrado, NEXT_CURSOR definido

## Distinção Crítica: CASA_LOCAL vs PUBLICADO_CLIENTE_PLATAFORMA

| Conceito | Descrição |
|---|---|
| **CASA_LOCAL** | Tua oficina, autoridade operacional ampla, sem vidro blindado |
| **PUBLICADO_CLIENTE_PLATAFORMA** | Produto exposto (site, API, desktop) — aí sim entram proteção/gates próprios |

**O site REAL (central-dark-instinct-2)** está em `CentralDark/public/central-dark-instinct-2/` — projeto TanStack Start, buildado em `C:\centraldark-repo\central-dark-instinct-2\.output\public`.

**O que está na VPS** (`centralldark.com`, `telepainel.centralldark.com`, `api.centralldark.com`) é **deploy antigo** — o site novo NÃO foi deployado ainda.

## Omni Router Completo (Local)

- **Arquivo**: `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`
- **Config persistente**: `apps/modulos/elite-gateway/scripts/.env`
- **Engines ativas**: `nous` (free), `abacus` (key real), `claude-code` (binário)
- **Failover**: testado — `abacus` 402 → `nous` PASS
- **Health**: `http://127.0.0.1:8099/health`
- **Chat**: `POST http://127.0.0.1:8099/v1/chat/completions` com `model="auto"` ou `provider/model`

## Bolt App Local (Admin UI de Keys)

- **Source**: `apps/modulos/Bolt/source/`
- **Dev server**: `http://127.0.0.1:3000` (`npm run dev`)
- **Build**: `npm run build` → `.output/public` (static) + `.output/server` (SSR)
- **Settings → Providers (Cloud/Local)** — persiste keys no localStorage do browser
- **Fala com Omni Router local** via `omni_router_base_url` (default `http://127.0.0.1:8099`)

## Zendrive Perfis Locais Ilimitados

- Config via `ZENDRIVER_PROFILE_PATH` ou `CENTRALDARK_ZENDRIVE_PROFILES_JSON`
- **Não cria código novo por conta** — não joga cookie/token no repo
- Múltiplos perfis Zendriver locais funcionam sem duplicação

## Fluxo de Finding → Minério (cristalizado)

```
Finding falha
  → META_LUPA
  → owner causal
  → menor correção
  → testar
  → contraprovar
    PROVEN    → CRYSTAL_GOLD (reuso, não repete)
    REFUTED   → REFUTED_MINERAL (preserva aprendizado, não apaga)
    UNKNOWN/BLOCKED → UNRESOLVED_MINERAL (volta no radar)
```

## Regra de Ouro Atualizada

> **A regra agora mora no motor, não na sessão.**
> 
> `!CENTRALDARK` = gatilho | regra persistente = memória operacional | motor = executor contínuo | receipt = prova

## Próximo Cursor

- Site REAL (TanStack Start) pronto para deploy na VPS
- Omni Router completo com `.env` persistente
- Bolt App local rodando para admin de keys
- Radar de deduplicação ativo em agenda
- Comando universal persistente no boot
- Sweep contínuo até FIXED_POINT