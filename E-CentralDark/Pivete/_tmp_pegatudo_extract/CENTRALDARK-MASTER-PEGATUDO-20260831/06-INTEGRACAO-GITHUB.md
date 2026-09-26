# 06 — INTEGRAÇÃO COM GITHUB

## Objetivo

Incorporar este delta no owner atual sem criar nova doutrina concorrente.

## Procedimento

1. Medir o repositório remoto e o `main` atual.
2. Descobrir o owner canônico do comando/contrato CentralDark.
3. Enumerar **toda a lineage relevante**, com paginação completa:
   - issues abertas e fechadas;
   - PRs abertos, fechados, mergeados e não mergeados;
   - commits;
   - branches;
   - tags;
   - artifacts/checks relacionados.
4. Calcular fingerprints.
5. Reconciliar com o owner atual.
6. Inserir `#PEGATUDO` no comando master existente.
7. Atualizar gates/validadores existentes; não criar workflow paralelo quando um owner equivalente já existir.
8. Rodar negativos primeiro.
9. Rodar positivos.
10. Reabrir HEAD e diff em revisão independente.
11. Abrir um PR para o escopo conflitante.
12. Não mergear por confiança no texto.

## Sementes históricas conhecidas

As referências abaixo são **sementes para busca**, não estados atuais:

- issue/tracker `#604`;
- PR `#455`;
- PR `#499`;
- PR `#554`;
- PR `#566`;
- PR `#1189`;
- PR `#1381`;
- PR `#1386`.

A busca não pode parar nessas referências; `#PEGATUDO` exige descobrir a família inteira.

## Regra

`KNOWN_SEED != COMPLETE_LINEAGE`

Se o conector GitHub estiver indisponível, a integração remota fica `BLOCKED_EXTERNAL`, nunca `PASS`.
