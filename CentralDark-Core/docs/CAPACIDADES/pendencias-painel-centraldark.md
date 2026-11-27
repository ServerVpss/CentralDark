# Pendências no Painel CentralDark

Status: CANDIDATE_CAPABILITY
Origem: remoção do workflow `linear-pendencias-sync`
Escopo: painel, sistema interno, governança de pendências

## Decisão

`linear-pendencias-sync` não deve existir como workflow recorrente escrevendo na `main`.

A capacidade correta é a própria CentralDark manter pendências no sistema/painel, com leitura, classificação, trilha de evidência e ação humana ou automatizada dentro de gates próprios.

## O que saiu

- Cron GitHub Actions a cada 30 minutos.
- Escrita automática em `docs/PENDENCIAS.md` via `LINEAR_API_KEY`.
- Dependência de integração externa para uma função que deve ser nativa da Casa.

## O que fica como capacidade

- Card de pendência no Painel.
- Estado simples: `aberta`, `em_andamento`, `bloqueada`, `resolvida`, `descartada`.
- Origem rastreável: PR, issue, workflow, VPS, painel, conversa ou operador.
- Evidência obrigatória antes de marcar resolvida.
- Exportação futura para sistemas externos apenas como adaptador, nunca como fonte única da verdade.

## Contraprova

```text
WORKFLOW_REMOVED != CAPABILITY_DONE
DOCUMENTED != EXECUTED
EXTERNAL_SYNC != CENTRALDARK_SOURCE_OF_TRUTH
UNKNOWN != PASS
```

## Próximo passo

Implementar essa capacidade no owner existente do Painel/Status, sem criar um segundo sistema de pendências e sem reintroduzir cron de escrita automática na `main`.
