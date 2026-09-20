---
title: "🧬 Kernel Híbrido Total — recibo de englobamento (Claude/claude.ai)"
status: ENGLOBADO_COM_LIMITE_DE_PROVA
mission_id: KERNEL_HIBRIDO_TOTAL_20260920
authority: SEGREDO/CHEFE (ordem direta: commit no PR-MÃE + trajetória + aprendizados pela mesma rota)
writer: Claude (claude.ai) — Writer só deste arquivo; NÃO é Writer do #1597, da main nem da VPS
pr_mother: "#1562 (RENDEZVOUS_LEDGER_NOT_WRITER)"
t0_observed_at: "2026-09-20T06:10Z"
t1_observed_at: "2026-09-20T14:04Z"
main_at_t1: 4ad248cf487b11fa1b787f9b3dc9f977e241cc98
contract_owner_head_at_t1: "#1597 @ 360e4a30f91ebd36f3753635a1771a6854064ed2"
unknown_is_not_pass: true
---

# 🔥 CENTRALDARK — KERNEL HÍBRIDO TOTAL · RECIBO

## 1. Veredito (T1, remedido)

```text
CONTRATO_HIBRIDO_NO_#1597   = PASS_SOURCE  (head 360e4a3, 6214 B — o Writer já ampliou: agora lista 9 sensores/capacidades)
CONTRATO_HIBRIDO_NA_MAIN    = NÃO          (era 404 em T0; NÃO remedido em T1)
CATALOGO_VIVO               = 115 tools · catalogVersion 115-d6d3af7bb117 — IDÊNTICO em T0 (06:10Z) e T1 (14:04Z)
SENSORES_HIBRIDOS_NO_AR     = NÃO          (T0: filtros hybrid|kernel|screenpipe|hermes = 0; T1: só a versão do catálogo, sem mudança)
VPS_ROOT_HEAD               = f3c00f9 · 22 commits atrás da main (deploy_status, T1)
PM2 CentralDark-WebhookDeploy = STOPPED   (deploy_status ERRO, T1)
FIXED_POINT                 = FALSE
```

`catalogVersion` parado por ~8 h + `WebhookDeploy` parado = **consistente** com "nada foi promovido para o ar". Consistente ≠ causa provada.

## 2. Correções às minhas próprias afirmações de T0 (SHA drift)

```text
main            cead445 → 4ad248c        (T0 → T1)
#1597 head      1486cf5 → 360e4a3        (T0 → T1)
sensores no contrato  6 → 9              (+ local_compute_status, local_bridge_media_policy, centraldark_data_ingest_policy)
```

Afirmações de T0 amarradas a SHA antigo voltam a HIPÓTESE até reconfirmação (regra FABLE LOOP).

## 3. Delta que continua FORA do contrato (candidato a append pelo Writer do #1597)

```text
BUILD_IS_NOT_RUNTIME          # dist b09517b liga 6 sensores em RAW_TOOLS; catálogo vivo não tem nenhum
ORPHAN_TOOL_MODULES           # hermes(3) hub(4) darkai(2): exportados, sem import em tools-catalog (li o dist, NÃO o TS fonte)
GPU_BACKEND=UNMEASURED        # RX 580 (Polaris): sem CUDA; medir Vulkan/DirectML por probe antes de prometer GPU job
```

Gates PROPOSTOS (não são lei até virarem teste de CI): `CATALOG_HAS_NO_ORPHAN_TOOL_MODULE`, `HYBRID_TOOLS_LIVE_IN_PUBLIC_TOOLS_JSON`, `GPU_PROBE_BEFORE_GPU_JOB`.

## 4. Trajetória e decisões da missão

```text
1. Inventariei 17 uploads (chats ChatGPT/Gemini/Grok, CPU-Z da Casa, mcp-dist-b09517b.zip, ~130 .md em 2 zips).
2. Medi por 3 canais: análise estática do dist · GitHub vivo (PRs/commits/arquivos por ref) · MCP vivo (/health, mcp_admin_catalog, mcp_catalog_diff).
3. NÃO escrevi na branch do #1597 (Writer = ChatGPT/SOL, ONE_WRITER_PER_SCOPE). Comentei no #1562.
4. Por ordem direta do SEGREDO: este recibo é commitado na branch do #1562; aprendizados vão por registrar_aprendizado (owner do APRENDIZADOS.md), sem reescrever o arquivo de 55 KB.
5. NÃO fiz deploy/restart/reset/limpeza; NÃO toquei na VPS dirty; NÃO li Gmail/Drive/Notion (escopo explícito exigido pelo contrato).
```

## 5. Aprendizados (o que sobreviveu à tentativa de refutação)

1. **Substring engana.** `grep hubTools` casou dentro de `githubTools` e "provou" import que não existe. Só a leitura direta dos imports de `tools-catalog.js` fechou a conta. Regra: nome curto → âncora de palavra ou leitura do import.
2. **Contagem por regex subestima.** O regex achou 1 tool em `semantic.js`; o real são 8. Contagem estática serve para *descobrir candidato*, nunca para afirmar número.
3. **404 na main ≠ ausente.** O contrato híbrido dava 404 na main e no head do #1590, mas existia no head do #1597. Buscar em todas as refs candidatas antes de dizer "não existe".
4. **Duas visões do mesmo catálogo.** `mcp_catalog_diff` (74) ≠ `/health` e `mcp_admin_catalog` (115). Divergência de escopo do conector, **não interpretada** — UNKNOWN registrado, não maquiado.
5. **`catalogVersion` é sensor barato de deploy.** Mesmo hash em duas medições espaçadas = nada mudou no ar. Usar como T0/T1 antes de qualquer conclusão sobre "está no ar".
6. **Escrever num arquivo grande via API = regravar tudo.** APRENDIZADOS.md (55 KB) não se anexa com `create_or_update_file`; usar o owner (`registrar_aprendizado`) evita risco de corromper o ledger.
7. **Precedente #1564** reverteu um "KERNEL PRÓPRIO": nada aqui cria kernel novo.

## 6. Fronteiras de prova

```text
RELATADO_NÃO_REMEDIDO: sync Obsidian⇄GitHub sem watcher · PS com execução desabilitada · 2 famílias Remote na Casa
                       · 1 runner ativo na VPS + 2º runner com registro apagado no GitHub (precisa novo registration token)
UNKNOWN: por que o build b09517b não está no ar · TS fonte dos 3 módulos órfãos · escopo 74 vs 115
```

## 7. NEXT_CURSOR

```text
1. SEGREDO libera (formato PERMITO SEGREDO) o religamento SOMENTE do PM2 CentralDark-WebhookDeploy → remedir catalogVersion.
2. Reconfigurar o 2º runner (token de registro é humano/secreto — não passa por chat).
3. Writer do #1597 aplica a seção 3 (append no contrato existente).
4. Ler TS fonte de hermes/hub/darkai: órfãos de propósito ou esquecimento?
```
