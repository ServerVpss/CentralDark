# Inbox de Mineração — Memory Linker / Dream Review

Pasta oficial única para despejar matéria bruta que deve ser minerada pela Casa antes de virar regra, skill, memória, teste ou contrato.

O SEGREDO/CHEFE não precisa escolher várias pastas. Joga tudo aqui; o sentinel classifica e abre/atualiza pendência no Kanban para o Dream Review/Writer certo.

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

## Links relacionados

A pasta `links/` aponta para owners relacionados, mas não muda o combinado: o drop oficial continua sendo esta inbox.

```text
links/evolucao            -> docs/CONSCIENCIA/ARSENAL/EVOLUCAO/
links/aprendizados        -> docs/CONSCIENCIA/APRENDIZADOS/
links/garimpo-chefe.md    -> contrato GARIMPO-CHEFE
links/dream-review-run.mjs -> motor de mineração
```

## Job Kanban

O sentinel oficial identifica matéria pendente e abre/atualiza card no Kanban com chave idempotente por SHA-256:

```bash
node scripts/memory-linker/inbox-sentinel.mjs --kanban
```

Wrapper para cron/PM2:

```bash
bash scripts/memory-linker/inbox-sentinel-cron.sh
```

O job não cristaliza direto; ele cria pendência rastreável para Dream Review + MetaLupa + Writer.

## Boundary de runtime

A inbox não transforma o checkout canônico da VPS em bancada de trabalho. O fluxo correto é:

```text
MAIN_CANONICA_VPS=ESPELHO_LIMPO
MATERIA_NA_INBOX
→ SENTINEL CLASSIFICA
→ KANBAN CARD
→ WORKTREE_ISOLADA_POR_MISSAO
→ DREAM REVIEW
→ META LUPA BEGIN
→ WRITER ÚNICO
→ TESTE/CONTRAPROVA
→ COMMIT/PUSH/PR
→ MAIN FF-ONLY
→ WORKTREE MORRE
```

O sentinel é alarme e roteador; não faxineiro tardio que mascara sujeira no checkout canônico.

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
