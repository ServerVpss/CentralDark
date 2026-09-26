---
name: cristalizacao-documento
description: Arquivo físico consolidado para prova de estado.
version: 1.0.0
tags: [cristalizacao, documento, consolidacao, prova]
---

# Cristalização de Documento — Padrão Consolidado

Use quando precisar consolidar estado atual em arquivo físico para prova/documentação.

## Estrutura canônica
1. Cabeçalho (badge + título + resumo)
2. Resumo fonte
3. 5 pontos críticos (tabela com status)
4. Evidência local (arquivo físico no workspace)
5. Status ZIP (pre + alerta se PARCIAL)
6. Nota PR / pendência

## Referências
- `references/cristalize-pattern.md` — estrutura canônica do arquivo.
- `references/multibussola-cruzada.md` — leitura cruzada + comparação com SOUL / PR divergido / regra anti-V2 (FRENTE 3).

## Regras duras
- Sem arquivo físico no workspace = evidência NÃO provada.
- Sem ZIP completo = PARCIAL (não PASS inventado).
- PR não mergeado = declarar explicitamente HISTORICAL; não fingir COMMIT.
- HANDOFF incompleto (RECEIPT/RELEASE/ACQUIRE ausente) = COMMIT REAL IMPOSSÍVEL; REALITY=JUDGE.
- GARIMPO-CHEFE = RESERVATÓRIO (não autoridade); fonte real = main repo (HEAD real medido com git rev-parse); conteúdo extraído = PARCIAL até verificação completa.
- Nunca ciclo completo sem AutoLupa + validação final + FIXED POINT 5 condições (KIMETSU 17 RESP + META-LUPA).
- Modelo real preservado (inkling:free / nemotron-3-ultra-550b-a55b:free) independente de motor.
- SKILL corrigida sem V2; DELTA-CONTINUO.md = dono canônico; RECEIPT-NO-COMMIT.md = prova de NÃO invento.
- IMAGENS (clip_*.png) = HISTORICAL até captura funcional (cua-driver elevado / WinError 740 corrigido).
