# Cross-Lingual Agentic Robustness

## Nome do comportamento observado

- multilingual code-switching
- language drift
- cross-lingual representation
- provider/subagent language divergence

A CentralDark não deve confundir idioma da superfície com inteligência.
O valor operacional é a **invariância semântica**: a mesma missão continua coerente
mesmo quando workers/providers produzem rótulos em português, inglês, japonês ou coreano.

## Contrato

```text
LANGUAGE != AUTHORITY
LANGUAGE != OWNER
LANGUAGE != MODEL_IDENTITY
TRANSLATION != SOURCE_TRUTH

RAW_WORKER_OUTPUT_PRESERVED=true
FINAL_LOCALE_IS_PROJECTION=true
SEMANTIC_INVARIANCE_REQUIRED=true
WORKER_LANGUAGE_PROVENANCE_REQUIRED=true
JOIN_MUST_PRESERVE_SOURCE=true
```

## Fluxo

```text
WORKER OUTPUT
→ detect language(s)
→ attach worker_id / provider / model / mission / trace
→ preserve raw output hash
→ map stable technical identifiers
→ normalize semantic concepts
→ contradiction check
→ receipt
→ join
→ optional PT-BR projection for CHEFE
```

## Ganho real

O ganho não é “japonês deixa o modelo mais inteligente”.
O ganho é conseguir:

1. receber outputs multilíngues sem perder causalidade;
2. comparar decisões equivalentes entre providers;
3. detectar quando uma mudança de idioma também mudou a decisão;
4. preservar termos técnicos estáveis;
5. usar retrieval cross-lingual sem transformar similaridade em autoridade.
