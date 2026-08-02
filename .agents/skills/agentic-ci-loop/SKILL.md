---
name: agentic-ci-loop
description: Use before any code change, debugging, critical refactor, PR repair, CI failure, review, mission status, percentage report, or skill evolution in CentralDark. Boot the deterministic school, classify the task, load the unified Pivete reporting contract, preserve one Writer, require evidence before claims, create a regression scar for every proven defect, and report verdict, measured progress, diagnosis, proof, Papo Reto, next gate, command, Chief action, and untouched surfaces.
trigger: /agentic-ci-loop
---

# Agentic CI Loop — escola operacional bootável

Esta skill é a porta curta. O conteúdo detalhado vive em módulos subordinados e é carregado por demanda para não queimar contexto.

## Boot obrigatório

Antes de alterar código ou emitir relatório técnico:

```text
node scripts/lupa/agentic-school-loader.mjs --task <critical-refactor|debug|feature|review|skill-evolution> --json
```

O comando deve retornar `BOOT_STATUS=PASS`, `OUTPUT_CONTRACT` e `REPORT_VALIDATOR`. Se faltar manifesto, módulo, adaptador, contrato de relato, lição válida ou contrato de segurança, pare com `STATUS=BLOCKED_AGENTIC_SCHOOL`.

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
11. Progresso medido e estimativa são campos diferentes e nunca compartilham o mesmo numerador.
12. O CHEFE não transporta logs, HEADs ou erros que o agente consegue medir diretamente.
13. Quando faltar acesso humano real, entregar um único script cirúrgico completo que salva a coleta em `E:\CentralDark\Pivete\TEMP`.
14. Melhorar o coletor existente antes de criar outro; menos é mais quando resolve com prova.

## Ciclo obrigatório

```text
CLASSIFICAR
→ CARREGAR CONTRATO + MÓDULO
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
→ RELATO PIVETE VALIDADO
→ LIÇÃO CANDIDATA
→ PROMOÇÃO PELO CHEFE
```

## Saída obrigatória

A fonte única é:

```text
.agents/skills/agentic-ci-loop/references/CONTRATO-UNIFICADO-RELATO-PIVETE.md
```

Use `MODO_COMPLETO` para matéria técnica, auditoria, porcentagem, mudança, bloqueio ou fechamento. Use `MODO_CURTO` somente para atualização sem mutação e sem novo finding.

Antes de publicar um relato gerado em arquivo, valide:

```text
node scripts/lupa/validar-relato-pivete.mjs --mode full --input <relato.txt>
```

O contrato exige, na ordem:

```text
VEREDITO
→ PROGRESSO MEDIDO
→ PRONTO/PARCIAL/FALTA
→ BLOQUEADORES
→ DIAGNÓSTICO E CICATRIZ
→ PROVA
→ PAPO RETO DO PIVETE
→ PRÓXIMO GATE
→ COMANDO/COLETA
→ AÇÃO DO CHEFE
→ NÃO TOCADO
```

## Stop gates

Sem autorização aplicável ao alvo exato, não fazer merge, Ready for Review, deploy, restart, produção, exclusão, force-push, alteração direta da `main` nem promoção de lição global.

## Módulos e fontes

- Contrato unificado de saída: `references/CONTRATO-UNIFICADO-RELATO-PIVETE.md`.
- Curso operacional condensado e executável: `references/ESCOLA-OPERACIONAL-DE-SKILLS.md`.
- Receipt da fonte integral fornecida pelo CHEFE: `references/SOURCE-CURSO-SKILLS-ORIGINAL.txt.gz.base64`; ele contém o SHA-256 da fonte externa, não o curso inteiro e não entra no contexto de boot.
- Refatoração crítica sem regressão conhecida: `references/REFATORACAO-CRITICA-ZERO-REGRESSAO.md`.
- Manifesto de roteamento: `references/school.manifest.json`.
- Aprendizados candidatos/aprovados: `references/learning-ledger.jsonl`. Somente `APPROVED` entra no boot.
- Fonte visual editável e LEIA-ME: `docs/ARQUITETURA/artefatos/CENTRALDARK-AGENTIC-LOOP-4K/`; o ZIP recebido é validado por hash e membros com `scripts/lupa/validar_agentic_visual_package.py --source-zip <arquivo>`.
