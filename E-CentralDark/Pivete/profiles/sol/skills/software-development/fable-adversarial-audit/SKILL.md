---
name: fable-adversarial-audit
description: Auditoria adversária read-only de pacote ZIP/skill anexado. Mode FABLE_ADVERSARIAL_META_AUTOLUPA. Trigger receber ZIP/skill para auditar antes de instalar.
trigger:
  - receber ZIP de skill
  - auditar pacote antes de instalar
  - contraprova de claims de skill
phases: "EXTRACT → MEASURE → LIST_PROMISES → COUNTERPROOF → GROUP_FINDINGS → VERDICT"
rules:
  - READ_ONLY_ATE_PROVAR_CAUSA
  - NAO_CONFIAR_NOME_RECIBO_HASH_CONTAGEM_VERDE_RELATO
  - NAO_ALTERAR_TESTE_PARA_ACEITAR_CODIGO_QUEBRADO
  - NAO_LER_SECRETS (.env/tokens/ssh)
  - NAO_MERGE_DEPLOY_VPS_FORCEPUSH_REBASE_RESET
  - GATES_OBRIGATORIOS (ver corpo)
runtime_checks:
  - sha256sum do ZIP
  - node runtime/orchestrator.mjs --self-map
  - node runtime/orchestrator.mjs --verify
  - node --test tests/contraprovas-p0.test.mjs
failure_signature: "ZIP com promessa sem contraprova | learning adulterado | lock roubado"
remediation:
  - agrupar por INVARIANTE_VIOLADO + CAUSA_COMUM
  - entregar ERRO_EXATO + CONTRAPROVA + CAUSA + CORRECAO_MINIMA + TESTE_PERMANENTE
provenance:
  sources:
    - "SKILL.md (CHEFE paste #56/#57)"
  tests:
    - "contraprovas-p0 reproduzidas"
    - "audit hash detecta alteração"
  receipts:
    - "fable.audit.receipt"
counterproof: "achado real tem contraprova executável que falha no pacote antigo"
fixed_point_contribution: "Skill só instalada após auditoria APROVADO"
mantra: "NAO_CONFIE_NO_NOME → ABRA_O_ZIP → CONTRAPROVE → SO_PROVE"
---

# FABLE ADVERSARIAL AUDIT — Protocolo de Auditoria de Pacote

## Modo
`FABLE_ADVERSARIAL_META_AUTOLUPA_EXECUCAO_UNICA`
ALVO = ZIP anexado inteiro
AUTORIDADE = SEGREDO/CHEFE
PAPEL = ADVERSARIO_READ_ONLY_ATE_PROVAR_CAUSA

## Passos
1. Fixe SHA-256, tamanho, total de arquivos, árvore extraída
2. Leia SKILL.md, manifest.json, runtime, testes, skil.txt, AUDITORIA
3. Liste promessas operacionais
4. Para cada promessa: contraprova executável que deveria falhar no pacote antigo
5. Reproduza contraprovas nomeadas + policy-learning.test.mjs
6. Procure lacunas: positivo/negativo/limite/concorrência/symlink/suíte vazia/receipt adulterado/sanitização/proveniência
7. Separe: BUG_ATUAL | RISCO_CONDICIONADO | HARDENING_OPCIONAL | CHECKLIST_DECORATIVO
8. Agrupe por INVARIANTE_VIOLADO + CAUSA_COMUM
9. Falha real → ERRO_EXATO + CONTRAPROVA + CAUSA + IMPACTO + CORRECAO_MINIMA + TESTE_PERMANENTE

## Gates Obrigatórios
- missão ausente ≠ preservada
- FAIL/SKIPPED/UNKNOWN ≠ zero
- zero testes ≠ PASS
- realpath fora raiz bloqueado
- sourceIds placeholder / receipt adulterado / HEAD não-SHA ≠ learning
- chamadas simultâneas mesmo eventId = uma vez
- quebra linha não injeta campo
- github_pat/JWT redigidos
- INCONCLUSIVO não avança
- maxMatches externo ≤ 3
- manifest sem paths duplicados
- learning concorrente = 1 registro
- lock envelhecido não roubado se PID dono vivo
- learning adulterado não reutilizado
- chaves camelCase sensíveis redigidas
- AUDITORIA/FILE-HASHES.sha256 detecta alteração/remoção/novo

## Prova Final
```bash
node runtime/orchestrator.mjs --self-map
node runtime/orchestrator.mjs --verify
node --test tests/contraprovas-p0.test.mjs
```

## Veredito
VEREDITO=APROVADO|CORRIGIR|BLOQUEAR
+ campos ZIP_SHA256, FILES_TOTAL, PASS, FAIL, MUTANTES_ATUAL, BUGS_ATUAIS, RISCO_RESIDUAL...
