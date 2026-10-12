---
name: skill-synchronization
description: "Keep CentralDark autonomous skills sealed between current main and Hermes runtime."
version: 0.3.0
related_skills: [centraldark-ops, reconciliacao-diaria-centraldark, centraldark-hermes-operations, centraldark-oracle-surface]
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# Skill Synchronization

This is the single synchronization owner for CentralDark autonomous/core skills.

Canonical source:
ServerVpss/CentralDark@main under .agents/skills/**/SKILL.md

Runtime consumer/mirror:
~/.hermes/skills/<same-relative-path>/SKILL.md

## Contract

CURRENT_MAIN_IS_CANONICAL=true
RUNTIME_IS_EVIDENCE_AND_CONSUMER=true
NO_SECOND_SKILL_SYNC_ENGINE=true
ONE_WRITER_PER_SCOPE=true
NO_BLIND_OVERWRITE=true
ORACLE_REVIEW_ON_MATERIAL_SKILL_CHANGE=true
MAIN_RUNTIME_HASH_SEAL=true

Only skills with centraldark_autosync: true are in automatic scope. This avoids bulk-enabling unrelated third-party/security skills.

## Procedure

At every CentralDark Eternal Self-Heal wake and after a canonical autonomous-skill mutation:

bash scripts/skill-sync-check.sh --apply

The existing script must:
1. fetch exact origin/main and record SHA;
2. inventory opt-in skills from that exact main;
3. map each to the same relative Hermes runtime path;
4. serialize with one lock;
5. back up any runtime replacement;
6. mirror main to runtime only when runtime is missing, identical, or still equals the previously sealed canonical hash;
7. refuse independent runtime drift;
8. seal main SHA + canonical hash + runtime hash;
9. emit ORACLE_REQUIRED_RUNTIME_DRIFT when the live copy changed independently.

On ORACLE_REQUIRED_RUNTIME_DRIFT:

PRESERVE_RUNTIME_DELTA
→ centraldark-oracle-surface
→ compare CHEFE intent + CURRENT main/docs + owner + live runtime
→ counterproof
→ canonical writer promotes only surviving minimum delta
→ rerun --apply
→ seal hashes

No human /memory approve or manual file copy is required when the applicable existing gates already prove alignment. UNKNOWN remains UNKNOWN.

## Modes

--check = read-only classification.
--apply = safe main-to-runtime convergence.
--seal = apply and fail nonzero if any opt-in skill remains divergent.

Never reset a repository, delete local runtime skills or overwrite independently changed runtime files.

For the VPS checkout owner `scripts/vps/auto-sync-main.sh`, tracked worktree edits remain fail-closed, but known untracked runtime scopes must be quarantined automatically under `/root/CentralDark-preserve/auto-sync-untracked-<UTC>/`, fast-forward applied, and restored with a manifest after every outcome. A recurring cron entry alone is not proof: verify `VPS_HEAD == origin/main`, the exact backup path/hash, and the sync log/status readback. Never classify `BLOCKED dirty checkout` as autonomous sync success when only untracked runtime artifacts caused it.

## Hermes — autonomia delegada quando a main convergir

CHEFE autorizou **execucao operacional continua sem micro-passos** no escopo CentralDark. Essa autorizacao acompanha as skills opt-in versionadas na main; **nao equivale a desativar o sistema de aprovacoes do Hermes**.

- Numa missao ja autorizada, Hermes mede CURRENT/HEAD, localiza owner e writer, executa a menor sequencia **reversivel** (ler, editar no owner, testar scripts locais, corrigir, commitar e dar push no PR vigente), faz readback e publica receipt/VER PENDENCIA no HUD existente **sem perguntar a cada etapa**.
- Scripts de shell/Python/Node fazem parte das dependencias metabólicas das skills. A autonomia abrange o codigo e scripts **dentro do owner autorizado** em `/root/CentralDark` e os espelhos do Hermes expressamente catalogados, nunca o sistema operacional inteiro por implicacao. `root` (usuario) pode alterar a maquina toda: um caminho com prefixo `/root` **nao e sandbox**.
- O modo de approvals recomendado permanece `smart`; manter redacao de segredos e confirmacao de reload MCP. **Nao** habilitar `off`/`--yolo`, allowlist generica de exclusao recursiva, execucao de scripts remotos sem verificacao, nem modificar automaticamente `~/.hermes/config.yaml` a partir de uma skill versionada.
- Operacoes potencialmente destrutivas ou fora do owner (reset/clean, exclusao recursiva, alteracao de /etc, /boot ou unidades systemd, alteracao de cofre, desligamento/reboot, restart de servico fora da prova causal) exigem o gate especifico ja existente. Independente de smart-approvals, preservar worktrees sujas, outras canetas, segredos e material nao rastreado.
- Depois que o PR autorizado for promovido para a `main`, `scripts/vps/auto-sync-main.sh` somente executa `scripts/skill-sync-check.sh --apply` se houve **fast-forward bem-sucedido da main** com mudanca em `.agents/skills/`. O helper usa `CENTRALDARK_SKILL_SYNC_REF=<SHA_promovido>` e o lock/backup/contraprova do sync ja existente. Nenhum outro scheduler, skill-engine, restart ou servico nasce desse comportamento.
- Registro de `MAIN_RUNTIME_LOCK=PASS` prova apenas os **bytes das skills sincronizados**. Processo Hermes/Core ativo pode manter a skill anterior em cache; `ACTIVE_SESSION_LOAD=UNKNOWN` ate sessao/reload autorizados e readback do comportamento. Se checkout estiver dirty ou divergir, o auto-sync bloqueia; registrar a placa e reconciliar no owner/PR em vez de forcar clone, reset ou pull.

**NEXT_CURSOR:** `PR_HEAD_CURRENT -> SAME_SHA_TEST -> MERGE_GATE -> MAIN_FAST_FORWARD -> SKILL_SYNC_HASH_READBACK -> HERMES_SESSION_LOAD -> GOAL_EXECUTION -> RECEIPT -> HUD_SEAL`. `PR != MAIN`; `SYNCED != LOADED`; `CODE != RUNTIME`; `UNKNOWN != PASS`.

## Success

MAIN_SHA=<current origin/main>
AUTOSYNC_SKILLS=<n>
SYNCED=<n>
ORACLE_REQUIRED=0
MAIN_RUNTIME_LOCK=PASS

SYNCED != EXECUTED.
