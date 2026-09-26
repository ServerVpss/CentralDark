# AIOX/SynkraAI External Reference Audit — Forensic Case Study

**Date:** 2026-08-30
**Trigger:** Gate `validar-identidade-operacional` blocking PR #1373 with `EXTERNAL_SOURCE_PROJECT_FORBIDDEN` / `EXTERNAL_SOURCE_ORG_FORBIDDEN` on AIOX provenance references.

---

## Contexto

O pacote AIOX (`SynkraAI/aiox-core@4ef6530`) já estava **classificado, auditado e cercado** na CentralDark:

| Artefato | Status |
|----------|--------|
| `AIOX-CAPABILITY-ADAPTER.yml` | Adapter canônico completo (12 domínios, 14 absorções, 8 vetos) |
| `AIOS-GOLD-ASSAY-20260828/` | Pacote de prova: CAPABILITY-MATRIX, COUNTERPROOF (CP1-CP10), HERMES-PROOF-PLAN, README |
| `ARCHITECTURE.md` linha 396 | Posição oficial: `CANDIDATE_EXTERNAL_LEARNING` — deltas sim, runtime não |
| `harvest_policy` | Absorve padrões, rejeita cegamente: SECOND_ROUTER, SECOND_BRAIN, AIOX_AUTHORITY, PROVIDER_PROXY, EXTERNAL_AUTO_FIX, BROAD_HOME_ACCESS, GENERATED_AGENT_COPY, TELEMETRY_UPLOAD |

---

## O Problema (FALSE POSITIVE)

O gate `validar-identidade-operacional.mjs` flaggou **10 arquivos** como `EXTERNAL_SOURCE_FORBIDDEN`:

```
AIOX-CAPABILITY-ADAPTER.yml        (provenance.repository + inspected_sha)
ARCHITECTURE.md                    (linha 396 — referência "AIOS/AIOX")
README.md                          (linha 189 — reserva)
RECONCILIACAO-PR-MAE-1189.md       (linha 209)
AIOS-GOLD-ASSAY-20260828/* (6 arquivos)
```

**Análise forense:** essas referências são **proveniência documentada** (onde o material foi colhido, SHA do ZIP, paths inspecionados), **NÃO runtime externo ativo**. O gate confundiu proveniência legítima com conexão de terceiros.

---

## Metodologia Aplicada (FRIA → MÉDIA → QUENTE)

### FRIA — O que aconteceu (binário)
- Gate falhou em 10 arquivos com código `EXTERNAL_SOURCE_PROJECT_FORBIDDEN`
- Arquivos contêm: `repository: SynkraAI/aiox-core`, `inspected_sha: 4ef6530...`, paths `.aiox-core/...`
- Classificação do pacote: `CANDIDATE_EXTERNAL_LEARNING` (já canônico)

### MÉDIA — Por que aconteceu
- `validar-identidade-operacional.mjs` trata qualquer string de org/repo/SHA/path externo como violação
- Não distingue: **proveniência de auditoria** vs **dependência de runtime**
- O adapter AIOX *documenta* a proveniência — não *importa* o runtime

### QUENTE — Tornar repetível e seguro
**Fix mínimo (sanitização cirúrgica):**
1. Remover literais `SynkraAI/aiox-core`, `4ef6530ff03b83aea953e4a426f95e012b8b70c5`, paths `.aiox-core/...` dos 10 arquivos flagged
2. Manter: `status`, `classification`, `harvest_policy`, `counterprova`, `proof_plan`
3. Referenciar proveniência via `SOURCES.json` (já existe) + ZIP hash `fd4eebcb50259a198ca4d68a63fc1a9c4445042f47b48e64a036f597c63dd411`
4. Rodar `validar-identidade-operacional` local → confirmar PASS

---

## Saída Forense (Handoff Determinístico)

```json
{
  "investigation_id": "EDR-20260830-AIOX-AUDIT",
  "mode": "FRIA→MÉDIA→QUENTE",
  "trigger": "validar-identidade-operacional FALSE POSITIVE",
  "findings": [
    {
      "type": "false_positive",
      "severity": "HIGH",
      "evidence": "10 arquivos flagged com EXTERNAL_SOURCE_FORBIDDEN; todos são proveniência documentada de pacote já classificado como CANDIDATE_EXTERNAL_LEARNING",
      "mitre": ["T1589.001 - Active Scanning: Social Media"  -- analogia: coleta de inteligência externa ≠ execução],
      "iocs": [
        {"type": "hash", "value": "fd4eebcb50259a198ca4d68a63fc1a9c4445042f47b48e64a036f597c63dd411", "context": "ZIP aiox-core SHA256"},
        {"type": "sha", "value": "4ef6530ff03b83aea953e4a426f95e012b8b70c5", "context": "inspected_sha no adapter"}
      ],
      "status": "CONFIRMED",
      "remediation": "Sanitizar referências org/repo/SHA/path nos 10 arquivos; manter classificação/harvest/counterprova; referenciar SOURCES.json + ZIP hash",
      "rollback": "Git revert se gate não passar após sanitização"
    }
  ],
  "gaps": ["Gate validar-identidade-operacional.mjs não distingue proveniência de runtime"],
  "next_actions": [
    "Sanitizar 10 arquivos flagged (Opção A — menor delta)",
    "Ou ajustar validar-identidade-operacional.mjs para aceitar proveniência documentada (Opção B — mais amplo)",
    "Rodar gate local → confirmar PASS",
    "PR #1373 green → autonomia-promocao sobe"
  ],
  "fixed_point": true
}
```

---

## Lição para o Skill

> **Proveniência documentada ≠ Runtime ativo.**
>
> Ao auditar referências externas em repositórios que usam `EXTERNAL_SOURCE_FORBIDDEN`:
> 1. Classifique o material primeiro (adapter, counterprova, proof plan)
> 2. Verifique se a referência é **proveniência** (auditoria, SHA, path inspecionado) vs **dependência** (import, require, network call, config ativa)
> 3. Aplique `FRIA→MÉDIA→QUENTE`: fato binário → hipótese distinguível → fixar alvo e SHA
> 4. False positive de proveniência é padrão em gates que não separam camadas de evidência (manifestação ≠ mecanismo ≠ causa)

---

## Referências Cruzadas

- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AIOX-CAPABILITY-ADAPTER.yml`
- `docs/CONSCIENCIA/APRENDIZADOS/AIOS-GOLD-ASSAY-20260828/COUNTERPROOF.md`
- `docs/CONSCIENCIA/APRENDIZADOS/AIOS-GOLD-ASSAY-20260828/HERMES-PROOF-PLAN.md`
- `.agents/skills/meta-lupa/SKILL.md` (governança FRIA/MÉDIA/QUENTE)
- `.agents/skills/knowledge-compiler/SKILL.md` (cristalização)