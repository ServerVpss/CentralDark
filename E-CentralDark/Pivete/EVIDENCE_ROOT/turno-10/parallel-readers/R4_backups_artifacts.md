# R4 — Backups & Artifacts (Compilado do Transcript)

> **Fonte:** `/e/CentralDark/Pivete/BACKUPS/hermes-pivete/checkpoint_zero/` + `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/`
> **Data:** 2026-08-02
> **Compilado do transcript** do subagent R4 (interrompido antes de gravar output)

---

## 1. BACKUPS — `/e/CentralDark/Pivete/BACKUPS/hermes-pivete/checkpoint_zero/`

### Estrutura
```
checkpoint_zero/
├── meta-lupa-pre-sync-25f85787/        # Pre-sync (2026-07-26 19:26)
│   ├── AUTOLUPA_CANONICAL_SHA
│   ├── SKILL.md (18412 bytes)
│   ├── agents/nivel-7/
│   ├── approvals/politica.json
│   ├── guardrails/validar_meta_lupa.py
│   ├── references/ (casos.md, matematica-e-calibracao.md, rubrica-3t.md, DENY_DELETE.md, MAE-README.md)
│   ├── scripts/meta_lupa.py
│   └── testes/
├── meta-lupa-sync-20260728-557ec0a5/   # Sync (2026-07-28 15:30)
│   ├── (mesma estrutura)
├── A1_04-COMUNICACAO.md
├── A2_HOJE.md
├── A3_SEMANA.md
├── A4_REGRAS.md
├── B1_SO...
└── meta-lupa-sync-state.json
```

### Hashes / Estado (do sync-state.json)
```json
{
  "ACTIVE_META_LUPA_PATH": ".agents/skills/meta-lupa",
  "ACTIVE_SKILL_COUNT": 1,
  "OLD_ACTIVE_PATH_EXISTS": "NAO",
  "ACTIVE_OLD_REFERENCES": 0,
  "GIT_RENAME_DETECTED": "NAO"
}
```

---

## 2. ARTIFACTS — `.artifacts/meta-lupa-mission/`

### Arquivos Lidos (do transcript)

| Arquivo | Conteúdo Principal |
|---------|-------------------|
| **00-hashes-iniciais.json** | repo, branch `test/desafio-omega-autolupa-2026-07-22`, head_sha `eb1bb7f6...`, config_sha256, skill_files com SHA256 de `.agents/skills/lupa-bayesiana/SKILL.md` (`d399b2d8...`) |
| **00-estado-inicial.txt** | REPO_PATH, REPO_REMOTE, BRANCH, HEAD_SHA_INICIAL, PROFILE_HERMES=pivete, HERMES_HOME, GATEWAY_STATUS=RUNNING PID 60004, CODEX_MODEL |
| **00-git-status.txt** | Status do repo no início |
| **00-rollback.md** | Procedimento de rollback |
| **10-baseline-atual.json** | `baseline_status: "BASELINE_PROVADO_COM_FALHA_REAL"`, skill_path `.agents/skills/lupa-bayesiana`, skill_blob `4d0c4e8f67...`, veredito `APROVADA`, `falso_verde_bloqueado: false`; meta_lupa: `veredito_runtime: "INSUFICIENTE"`, `falso_verde_bloqueado: true`, `formato_canonico: false` |
| **10-baseline-atual.md** | Baseline em markdown |
| **20-comparacao-antes-depois.json** | Comparação: lupa-bayesiana (APROVADA, falso_verde_bloqueado=false) vs meta-lupa (INSUFICIENTE, falso_verde_bloqueado=true, formato_canonico=false) |
| **20-regressoes.txt** | `LEGADO=35/35 PASS`, `META_LUPA_3T=7/7 PASS`, `AUTOLUPA_CONFORMANCE=5/5 PASS`, `OMEGA=25/25 PASS`, `TOTAL=72/72 PASS`, `HASH_GUARD=PASS`, `HERMES_DISCOVERY=PASS`, `HERMES_REAL_LOAD=PASS`, `FALSE_GREEN_RUNTIME=BLOCKED_AS_INSUFFICIENT`, `OPEN_REGRESSION=NONE`, `FORMAT_RISK=INSUFICIENTE_INSTEAD_OF_BLOQUEAR` |
| **20-risco-residual.md** | 1. Veredito pode variar literal (`INSUFICIENTE` vs `BLOQUEAR`) 2. Fallback OpenRouter 404 em FRIA 3. Branch com mudanças não commitadas |
| **30-migracao-meta-lupa.md** | Migração canônica: `lupa-bayesiana` → `meta-lupa` (decisão Pivete). `ACTIVE_META_LUPA_PATH=.agents/skills/meta-lupa`, `ACTIVE_SKILL_COUNT=1`, `OLD_ACTIVE_PATH_EXISTS=NAO`, `ACTIVE_OLD_REFERENCES=0`, `GIT_RENAME_DETECTED=NAO` |
| **40-transicao-casa-bolt.md** | Transição Casa → Bolt/Builder (2026-07-26). Repo `ServerVpss/CentralDark`, branch `main`, HEAD `cb102b5...`, perfil `pivete`, modo `QUENTE` (inventário produção read-only). Fechar registro técnico Casa, inventariar Bolt/Builder. |
| **05-jobs-final.md** | Jobs prova final: `gateway-watchdog` PASS, `atualizar-manual-sessao` PASS, etc. |

---

## 3. CONCLUSÕES R4

| Item | Status | Evidência |
|------|--------|-----------|
| **Hashes iniciais** | ✅ Capturados | 00-hashes-iniciais.json (sha256 skill, head_sha, branch) |
| **Estado inicial** | ✅ Capturado | 00-estado-inicial.txt (repo, branch, gateway PID, codex model) |
| **Baseline** | ✅ Capturado | 10-baseline-atual.json (lupa APROVADA, meta-lupa INSUFICIENTE) |
| **Comparação antes/depois** | ✅ Capturada | 20-comparacao-antes-depois.json |
| **Regressões** | ✅ 0 regressões abertas | 20-regressoes.txt (72/72 PASS, OPEN_REGRESSION=NONE) |
| **Risco residual** | ✅ Documentado | 20-risco-residual.md (3 itens) |
| **Migração canônica** | ✅ Comprovada | 30-migracao-meta-lupa.md (lupa→meta, 1 skill ativa) |
| **Transição Casa→Bolt** | ✅ Documentada | 40-transicao-casa-bolt.md (modo QUENTE, inventário) |
| **Jobs final** | ✅ PASS | 05-jobs-final.md (gateway-watchdog, atualizar-manual-sessao PASS) |

---

## 4. ARQUIVOS FONTE (para JOIN_GATE)

- `/e/CentralDark/Pivete/BACKUPS/hermes-pivete/checkpoint_zero/meta-lupa-pre-sync-25f85787/`
- `/e/CentralDark/Pivete/BACKUPS/hermes-pivete/checkpoint_zero/meta-lupa-sync-20260728-557ec0a5/`
- `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/00-hashes-iniciais.json`
- `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/00-estado-inicial.txt`
- `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/10-baseline-atual.json`
- `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/20-comparacao-antes-depois.json`
- `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/20-regressoes.txt`
- `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/20-risco-residual.md`
- `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/30-migracao-meta-lupa.md`
- `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/40-transicao-casa-bolt.md`
- `/e/CentralDark/Pivete/CentralDark/.artifacts/meta-lupa-mission/05-jobs-final.md`