# R1 — GitHub Action 29884365325 & Commit 084d5309 Evidence

## 1. GitHub Action Run 29884365325

### Run Metadata
- **Run ID**: 29884365325
- **Repository**: ServerVpss/CentralDark
- **Workflow**: VPS Deploy canônico (self-hosted) — `vps-exec-selfhosted.yml`
- **Trigger**: Push to main (SHA: `1cf6ae96350321a6a6fa59e3f346e8ef40cc3a2f`)
- **Date**: 2026-07-22T01:54:46Z – 01:55:45Z
- **Conclusion**: Success

### Jobs

#### Job 1: Deploy canônico do CentralDark-MCP
- **Database ID**: 88811764256
- **Status**: Completed (Success)
- **Duration**: ~6s
- **Steps**:
  1. Set up job
  2. **Validar SHA, construir isolado, promover e comprovar** — Core deployment script with atomic dist promotion, PM2 restart, health checks, startup audit verification, stability sampling (5× over 20s)
  3. Publicar status sanitizado no SHA (GitHub commit status)
  4. Complete job

**Key outputs**:
- `deployed=true`
- `validated_sha=1cf6ae96350321a6a6fa59e3f346e8ef40cc3a2f`
- `local_checkout_sha` (preserved)
- `main_sha` (final main after deploy)
- `pm2_app=CentralDark-MCP`
- `runtime_mode=atomic_dist`
- `port_9300=retired`
- `health=ok`
- `startup_audit=ok`

#### Job 2: Deploy atômico do mapa e Hermes-Verificador
- **Database ID**: 88811764295
- **Status**: Completed (Success)
- **Duration**: ~37s
- **Steps**:
  1. Set up job
  2. Prepare isolated deploy script checkout
  3. Checkout exact event SHA (`1cf6ae96350321a6a6fa59e3f346e8ef40cc3a2f`)
  4. **Validate, promote, restart and prove** — Runs `scripts/vps/deploy-operational-guards.sh`
  5. Publish sanitized operational guards status
  6. Post Checkout exact event SHA
  7. Complete job

**Key outputs**:
- `deployed=true`
- `validated_sha=1cf6ae96350321a6a6fa59e3f346e8ef40cc3a2f`
- `map_source=apps/modulos/mapeamento/config/mapa-canonico.json`
- `pm2_app=CentralDark-HermesVerificador`
- `pm2_pid=3267600`
- `map_backup=/root/CentralDark-Recovery/operational-guards/releases/1cf6ae963503.3266926/mapeamento`
- `verifier_backup=/root/CentralDark-Recovery/operational-guards/releases/1cf6ae963503.3266926/Log-Verificador`

### Attempts API
- **Endpoint**: `GET /repos/ServerVpss/CentralDark/actions/runs/29884365325/attempts`
- **Result**: 404 Not Found (no retry attempts recorded for this run)

---

## 2. Commit 084d5309b2d02259f66626367746369976d75344

### Git Query
```bash
git show 084d5309b2d02259f66626367746369976d75344 --stat
```

### Result
```
fatal: bad object 084d5309b2d02259f66626367746369976d75344
```

**Status**: **NOT FOUND** in the local repository (`/e/CentralDark/Pivete/CentralDark`) nor in `origin` after `git fetch --prune origin main --tags`.

**Note**: The commit hash does not exist in the ServerVpss/CentralDark repository history. It may belong to a different repository, a fork, or a deleted branch.

---

## 3. Term Definitions from META LUPA Skill

The requested terms (`candidate_ref`, `contract_digest`, `XP`, `comitês`, `veto`, `rubricas`, `ledger`) are defined in the **META LUPA** skill (`.agents/skills/meta-lupa/SKILL.md` and associated references).

| Term | Definition | Location |
|------|------------|----------|
| **candidate_ref** | **XP-2**: Referência de candidato canônico. Toda skill/arquivo citado por nome deve resolver para um caminho Git real com `blob SHA`. Se houver duas candidatas conflitantes → `BLOCKED_SKILL_IDENTITY`. Cópia baixada solta NUNCA é fonte da verdade; só o repo conectado conta. | SKILL.md lines 390-396 |
| **contract_digest** | **XP-1**: Resumo de contrato operacional (1 parágrafo) emitido antes de missão longa. Reforça: fonte da verdade, autoridade final, gates de parada, o que NÃO é permitido, veredito mínimo aceitável. Não substitui o mapa; é âncora de escopo. Se contradiz o mapa canônico, o mapa vence e o digest é CORRIGIDO. | SKILL.md lines 382-388 |
| **XP** | Sistema de experiência por fatos comprovados. Concedido via `--achievement` (ex: `erro_reproduzido=5`, `falso_verde_bloqueado=20`, `ponto_fixo_atingido=25`). Penalidades via `--penalty` (ex: `falso_verde_declarado=-25`). Custo do nível: `ceil(100 * 1.15^(LEVEL-1))`. Tiers: 1-9 `OPACA`, 10-29 `MONOCULO`, 30-49 `PRISMATICA`, 50+ `OMNIVISOR`. Fingerprint determinístico = SHA-256(`MISSION_ID + causa_raiz + teste + evidência + HEAD_SHA`). Deduplicação: se fingerprint já existe em `FINAL`, `XP_GAINED=0`. | SKILL.md lines 345-374 |
| **comitês** | **XP-3**: Comitês independentes para decisão crítica (deploy, consolidação, área protegida):<br>- **Executor** propõe e implementa<br>- **Crítico** revisa o MESMO SHA/HEAD sem herdar veredito (pode ser Grok, Gemini, DarkAI — não o executor)<br>- **Síntese (Arquiteto)** consolida divergências em veredito único<br>Regra: Modelo ≠ setor. Um cérebro não vira "novo time". | SKILL.md lines 398-405 |
| **veto** | Não aparece como termo explícito "veto", mas o mecanismo equivalente é o veredito **`BLOQUEAR`** (um dos 4 vereditos obrigatórios: `APROVAR \| CONDICIONAR \| CORRIGIR \| BLOQUEAR`). O Gate de Falsificação (Fase 8) exige responder: "Qual resultado produziria `BLOQUEADO`?" — sem resposta concreta, hipótese não está pronta para decisão. Bloqueios críticos (Falso verde, segredo exposto, evidência de outro SHA) são mantidos acima de qualquer posterior ou nota (Princípio 6). | SKILL.md lines 296, 263, 75 |
| **rubricas** | **rubrica-3t.md**: Rubrica das 3 temperaturas da META LUPA:<br>- **FRIA**: prova fato observado, separa antes/depois, não inventa mecanismo<br>- **MÉDIA**: testa uma variável, usa canal correto, registra delta e prova contrária<br>- **QUENTE**: fixa alvo/SHA, exige autorização, regressão, rollback, registro, revisão adversarial<br>- Qualquer modo bloqueia falso verde, segredo exposto, evidência de outro SHA<br>- **Promoção exige ledger relido e AutoLupa em ponto fixo** | references/rubrica-3t.md (full content) |
| **ledger** | Registro auditável append-only em `references/uso-ledger.jsonl` (schema_version 1). Eventos: `BEGIN`, `FINAL`, `CANDIDATE_REF`, `ATTESTATION`. Cada linha contém: `usage_id`, `mission_id`, `workspace_head`, `skill_blob_sha`, `mode`, `verdict`, `autolupa_executed`, `point_fixed_evidential`, `xp_valid`, `xp_rejected`, `record_hash` (SHA-256 do registro). Integridade verificada por `scripts/meta_lupa.py` e guardrails (`validar_meta_lupa.py`, `validar_autolupa_hash.py`). Histórico contém 55+ entradas (2026-07-22 a 2026-07-27). | references/uso-ledger.jsonl + SKILL.md lines 339-343, 370-374 |

---

## 4. Summary

| Item | Status | Details |
|------|--------|---------|
| GitHub Action 29884365325 | ✅ Retrieved | 2 jobs, both successful, logs captured |
| Commit 084d5309... | ❌ Not Found | `fatal: bad object` — not in repo history |
| candidate_ref | ✅ Defined | XP-2 in META LUPA skill |
| contract_digest | ✅ Defined | XP-1 in META LUPA skill |
| XP | ✅ Defined | Full XP system with levels, tiers, achievements, penalties |
| comitês | ✅ Defined | XP-3: Executor, Crítico, Síntese (Arquiteto) |
| veto | ⚠️ Implicit | Maps to `BLOQUEAR` verdict + Gate de Falsificação |
| rubricas | ✅ Defined | rubrica-3t.md (3 temperaturas + promoção) |
| ledger | ✅ Defined | uso-ledger.jsonl append-only audit log |

---

## 5. Files Referenced

- `.github/workflows/vps-exec-selfhosted.yml` — Workflow definition
- `scripts/vps/deploy-operational-guards.sh` — Operational guards deploy script
- `.agents/skills/meta-lupa/SKILL.md` — META LUPA skill (canonical source)
- `.agents/skills/meta-lupa/references/rubrica-3t.md` — 3T rubric
- `.agents/skills/meta-lupa/references/uso-ledger.jsonl` — Audit ledger (55+ entries)
- `.agents/skills/meta-lupa/scripts/meta_lupa.py` — Deterministic engine (contract_digest, candidate_ref, XP calc)