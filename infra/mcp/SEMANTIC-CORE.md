# Semantic Core — NILC GloVe-50d

Status de implementação: `CANDIDATE_NOT_DEPLOYED`  
Escopo: primitiva lexical local reutilizável dentro do owner semântico existente `infra/mcp/`.

## Contrato

```text
MODEL_ID=nilc-glove-50d@9296f6537f6b0a24d449a2677c21c18c2c0c3bdd
SOURCE=nilc-nlp/glove-50d
REVISION=9296f6537f6b0a24d449a2677c21c18c2c0c3bdd
LICENSE=CC-BY-4.0
DIMENSION=50
EXPECTED_EMBEDDINGS_SHA256=497d9b1371d083fd0018e938dcc262244883522762e0321c7bff04c1448a9e17
MODEL_IS_TRUTH=false
SIMILARITY_IS_IDENTITY=false
AUTO_PROMOTION=false
AUTO_MERGE=false
ZERO_DEPLOY=true
```

O índice preexistente `semantic_index.py` continua sendo a capacidade de retrieval de documentos com MiniLM. Esta missão não o duplica nem o substitui sem benchmark. `semantic_core.py` adiciona ao mesmo owner as primitivas lexicais GloVe pedidas; existe uma única implementação GloVe e todos os consumidores chamam essa implementação via `semantic_bridge.py`.

## Artefato físico

O binário não entra no Git normal nem exige Git LFS nesta missão. O modelo é baixado uma vez em owner físico configurado por `SEMANTIC_MODEL_HOME`.

```bash
python infra/mcp/download_semantic_model.py --model-home <OWNER_CANONICO_DE_MODELOS>
```

O download é explícito e usa `snapshot_download` com revisão fixa. O script valida:

- arquivos esperados;
- SHA-256/bytes;
- safetensors;
- `len(vocab) == embeddings.shape[0]`;
- dimensão `50`;
- revisão/model id;
- licença/proveniência.

Depois grava `manifest.json` ao lado do modelo. Os arquivos originais baixados não são modificados.

Precedência de resolução em runtime:

1. argumento explícito;
2. `SEMANTIC_MODEL_HOME`;
3. `.cache/semantic-models/` do workspace;
4. cache Hugging Face já existente para a revisão exata;
5. `MODEL_NOT_FOUND`.

Nenhum teste unitário baixa modelo escondido.

## Primitivas

`semantic_core.py` fornece:

```text
semantic_lookup
semantic_neighbors
semantic_similarity
semantic_expand
semantic_rank
semantic_dedupe
semantic_model_info
semantic_health
```

Frases usam média de vetores somente como heurística. Token fora do vocabulário permanece `OOV`; não há vetor inventado. Dedupe sem threshold medido retorna `UNPROVEN_THRESHOLD`; com threshold, gera apenas `merge_candidates`, nunca fusão automática.

## Consumidores

```text
Repo/Python/CLI
  -> semantic_bridge.py / semantic_core.py

MCP existente
  -> mesmo mcp-server.js
  -> semantic://nilc/glove-50d/manifest
  -> tools/cognitivo/semantic.js
  -> semantic_bridge.py --serve
  -> semantic_core.py

Memory-Linker / Dream Review
  -> semantic-intent-adapter.mjs
  -> candidato lexical adicional
  -> affects_pattern_decision=false

Obsidian Desktop
  -> plugin Grafo Vivo / SemanticClient
  -> bridge local persistente
  -> somente Notice/consulta; não escreve ouro

Hermes / IA local / Builder
  -> consomem as mesmas tools MCP quando esse é o canal já existente
  -> não carregam implementação GloVe própria
```

### MCP resource

O servidor MCP canônico foi estendido; nenhum segundo servidor foi criado.

```text
RESOURCE=semantic://nilc/glove-50d/manifest
READ_ONLY=true
```

A projeção MCP expõe somente:

```text
MODEL_ID
REVISION
DIMENSION
VOCAB_SIZE
LICENSE
HEALTH
PROVENANCE
```

Caminhos físicos do host (`physical_path`, `embedding_path`, `vocab_path`) permanecem fora da superfície MCP.

### Obsidian Mobile

`OBSIDIAN_MOBILE=UNPROVEN`. Não se assume `localhost` do PC e não se cria exposição pública. Mobile só poderá consumir o mesmo core quando existir canal privado autenticado medido.

### API/Gateway

Nenhum servidor HTTP ou endpoint paralelo foi criado. Não existe consumidor adicional que justifique outro endpoint nesta missão; o MCP existente já é a superfície operacional. Se um consumidor HTTP real surgir, deve reutilizar o gateway existente e continuar `REMOTE_DENY_BY_DEFAULT`.

### VPS

Somente contrato preparado. Em autorização futura, a VPS deve baixar a mesma revisão, validar o manifesto/hashes, iniciar o consumidor existente e comparar entradas/saídas com o local. Esta missão não faz deploy, restart, PM2, DNS nem mutação na VPS.

## Cache e privacidade

Cache é somente aceleração e a chave inclui:

```text
MODEL_ID
NORMALIZATION_VERSION
INPUT_HASH
PARAMETERS
```

Troca de modelo/normalização invalida a identidade da chave. Logs do core registram metadados (`operation`, duração, `model_id`, contagem de tokens), não o texto privado integral.

## Benchmark / threshold

`benchmark_semantic_core.py` mede baseline e GloVe nas mesmas intenções de `tests/semantic_intent_dataset.json`.

```bash
python infra/mcp/benchmark_semantic_core.py \
  --model-home <OWNER_CANONICO_DE_MODELOS>
```

O threshold é derivado dos scores observados no dataset, priorizando `false_merge=0` antes de F1/recall. Linhas `AMBIGUOUS` não entram no denominador de classificação e nunca são fundidas automaticamente.

Sem o modelo físico real disponível neste ambiente, `FITNESS_DELTA`, `TOKEN_DELTA`, `LLM_CALL_DELTA` e qualidade final permanecem `UNPROVEN`; instalar código não é provar evolução.
