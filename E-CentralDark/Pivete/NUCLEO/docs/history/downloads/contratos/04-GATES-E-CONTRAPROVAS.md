# Gates e contraprovas

## Gate 0 — estado vivo

Medir HEAD, PRs, Writer, owners e testes antes de qualquer patch. Se mudou: `STATE_DRIFT → RECONCILE_BEFORE_WRITE`.

## Gate 1 — não duplicação

Falhar se existir segundo catálogo, segunda memória, segundo orquestrador ou cinco runtimes copiados.

## Gate 2 — identidade

Bloquear qualquer saída que afirme ser a pessoa real. Permitido: “Geoff-Huntley-Lens baseada em fontes públicas recuperadas”.

## Gate 3 — proveniência

Todo claim atribuído a uma pessoa exige fonte observada. Sem fonte: `CLAIM_ATTRIBUTION=UNKNOWN`.

## Gate 4 — atualidade

Material histórico não é posição atual.

## Gate 5 — privacidade

Bloquear endereço residencial, família, localização privada, telefone/email privado, bypass de login, conta fechada e stalking.

## Gate 6 — autoridade

```text
HUMAN_ROUTER_WRITE_AUTHORITY=false
HUMAN_ROUTER_CANONICAL_AUTHORITY=false
```

## Gate 7 — consenso

- três lentes repetindo mesma fonte = um cluster;
- quatro lentes concordando sem prova != PASS;
- uma contraprova material mantém conflito aberto;
- teste discriminante + observação = realidade decide.

## Gate 8 — Biblioteca

- `INDEXED_REFERENCE` não vira `INGESTED`;
- `INGESTED` exige SHA-256;
- referência runtime antiga não entra no canônico.

## Gate 9 — promoção

```text
SOURCE_PUBLICA → CANDIDATE → DELTA → TEST → COUNTERPROOF → OWNER → PROVEN_REUSABLE_DELTA → CANONICAL
```
