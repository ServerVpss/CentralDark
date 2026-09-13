# Inbox de Mineração — Memory Linker / Dream Review

Pasta oficial para despejar matéria bruta que deve ser minerada pela Casa antes de virar regra, skill, memória, teste ou contrato.

## Uso

Jogue aqui material bruto enviado pelo SEGREDO/CHEFE ou coletado por um agente autorizado:

- `.md` — texto, contexto, ideia, decisão, rascunho, relato.
- `.txt` — logs sanitizados, transcrições, notas rápidas.
- `.jsonl` — eventos já estruturados para Dream Review.
- `.json` — receipts/propostas/eventos em lote.

Nome recomendado:

```text
YYYY-MM-DD-fonte-chefe-<assunto>.md
YYYY-MM-DD-runtime-<sistema>-<assunto>.txt
YYYY-MM-DD-events-<assunto>.jsonl
```

## Contrato

```text
INBOX_MINERACAO_OWNER=scripts/memory-linker/
DIRECT_CANONICAL_MUTATION=false
APPLY_ALLOWED=false
DREAM_REVIEW_FIRST=true
META_LUPA_BEFORE_CRYSTALLIZATION=true
SECRET_VALUES_FORBIDDEN=true
RAW_MATERIAL_IS_NOT_CANONICAL=true
```

A presença de um arquivo nesta pasta não torna o conteúdo canônico. O fluxo correto é:

```text
INBOX
→ SANITIZAR
→ DREAM REVIEW
→ PATTERN DISCOVERY
→ CANDIDATE | QUARANTINE
→ META LUPA / CONTRAPROVA
→ OWNER + CONSUMER + TESTE
→ WRITER AUTORIZADO
→ COMMIT/PR
```

Nunca colocar aqui `.env`, tokens, chaves privadas, cookies, sessões, dumps de banco com dados sensíveis ou segredos literais.
