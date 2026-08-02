---
name: agentic-ci-loop
description: Use before any code change, debugging, critical refactor, PR repair, CI failure, review, or skill evolution in CentralDark. Boot the deterministic school, classify the task, load only the required module, preserve one Writer, require evidence before claims, create a regression scar for every proven defect, and report situation, error, cause, correction, test, scar, percentage, pending work, anticipated risk, and next movement.
trigger: /agentic-ci-loop
---

# Agentic CI Loop — escola operacional bootável

Esta skill é a porta curta. O conteúdo detalhado vive em módulos subordinados e é carregado por demanda para não queimar contexto.

## Boot obrigatório

Antes de alterar código:

```text
node scripts/lupa/agentic-school-loader.mjs --task <critical-refactor|debug|feature|review|skill-evolution> --json
```

O comando deve retornar `BOOT_STATUS=PASS`. Se faltar manifesto, módulo, adaptador, lição válida ou contrato de segurança, pare com `STATUS=BLOCKED_AGENTIC_SCHOOL`.

## Invariantes

1. Leia antes de editar.
2. Meça o baseline antes de mudar.
3. Um Writer por escopo; Judge separado.
4. Código determinístico executa gates; agente interpreta o residual.
5. Correção mínima, reversível e presa ao HEAD.
6. Todo defeito provado ganha teste que falha antes e passa depois.
7. `UNKNOWN`, `SKIPPED`, `PENDING`, `TIMEOUT` e silêncio nunca viram `PASS`.
8. Não pular hook, teste, branch protection ou autorização.
9. Aprendizado global só entra no boot após receipt, regressão, Judge e decisão do CHEFE.
10. O curso completo não é carregado em toda tarefa; o loader aplica divulgação progressiva.

## Ciclo obrigatório

```text
CLASSIFICAR
→ CARREGAR MÓDULO
→ LER E MAPEAR
→ BASELINE
→ HIPÓTESE FALSIFICÁVEL
→ TESTE VERMELHO OU CARACTERIZAÇÃO
→ CIRURGIA MÍNIMA
→ TESTES LOCAIS
→ CI NO HEAD EXATO
→ JUDGE ADVERSARIAL
→ CICATRIZ DE REGRESSÃO
→ RECEIPT
→ LIÇÃO CANDIDATA
→ PROMOÇÃO PELO CHEFE
```

## Saída obrigatória

```text
SITUAÇÃO=
ERRO=
CAUSA=
CORREÇÃO=
TESTE=
CICATRIZ=
PERCENTUAL=<pontos>/<total>=<n>%
PENDÊNCIAS_BLOQUEANTES=
PENDÊNCIAS_NÃO_BLOQUEANTES=
ANTECIPAÇÃO=
PRÓXIMO_MOVIMENTO=
HEAD_PROVADO=
CI_NO_HEAD=
O_QUE_O_CHEFE_PRECISA_FAZER=
```

## Stop gates

Sem autorização aplicável ao alvo exato, não fazer merge, Ready for Review, deploy, restart, produção, exclusão, force-push, alteração direta da `main` nem promoção de lição global.

## Módulos e fontes

- Curso operacional condensado e executável: `references/ESCOLA-OPERACIONAL-DE-SKILLS.md`.
- Receipt da fonte integral fornecida pelo CHEFE: `references/SOURCE-CURSO-SKILLS-ORIGINAL.txt.gz.base64`; ele contém o SHA-256 da fonte externa, não o curso inteiro e não entra no contexto de boot.
- Refatoração crítica sem regressão conhecida: `references/REFATORACAO-CRITICA-ZERO-REGRESSAO.md`.
- Manifesto de roteamento: `references/school.manifest.json`.
- Aprendizados candidatos/aprovados: `references/learning-ledger.jsonl`. Somente `APPROVED` entra no boot.
- Fonte visual editável e LEIA-ME: `docs/ARQUITETURA/artefatos/CENTRALDARK-AGENTIC-LOOP-4K/`; o ZIP recebido é validado por hash e membros com `scripts/lupa/validar_agentic_visual_package.py --source-zip <arquivo>`.
