# 🧿 PDF-CONFORMANCE-CC2003

**Fonte:** [tlc23.pdf](./tlc23.pdf), recebido como `tlc23(2).pdf` (alias histórico: `tlc23(3).pdf`) / Lógica Computacional (CC2003), Nelma Moreira, Lógica Computacional 23.

**SHA-256 esperado:** `b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1`

**Tamanho esperado:** `206674` bytes.

**Páginas:** `8`.

## Intenção

Amarrar o material CC2003 ao Harness CentralDark como regra simples, reutilizável e determinística para decisões do tipo `REUSE_BEFORE_CREATE`.

O PDF não é tratado como oráculo de verdade absoluta. Ele fornece uma estrutura formal útil: cláusulas de Horn, satisfazibilidade, modelo mínimo de Herbrand e resolução. A CentralDark traduz isso para engenharia operacional com escopo, evidência, contraprova e estado atual.

## Correspondência CentralDark

```text
CLÁUSULA DE HORN  → regra operacional determinística
FATO              → evidência medida no escopo atual
OBJETIVO          → claim/intenção a provar
CONTRADIÇÃO       → fail closed
MODELO MÍNIMO     → menor conjunto de fatos necessários
PONTO FIXO        → repetir derivação até não surgir fato novo
RESOLUÇÃO         → atacar objetivo com regras + fatos até prova/refutação/UNKNOWN
```

## Regra obrigatória

```text
CAPABILITY_REQUEST
→ MEASURE_CURRENT_STATE
→ LOAD_DURABLE_FACTS
→ FIND_EXISTING_OWNER
→ APPLY_HORN_REUSE_GATE
→ DECIDE:
   REUSE
   EXTEND_EXISTING
   REUSE_LEARNED_REMEDY
   CREATE_MINIMAL
   FAIL_CLOSED
   UNKNOWN
→ POST_PROBE
→ COUNTERPROOF
→ RECEIPT
```

## Matemática operacional do `REUSE_BEFORE_CREATE`

```text
EXISTS(owner) ∧ SATISFIES(owner, capability)
→ REUSE(owner)

EXISTS(owner) ∧ PARTIAL(owner, capability) ∧ EXTENSIBLE(owner)
→ EXTEND_EXISTING(owner)

ERROR(signature) ∧ REMEDY_PROVED(signature)
→ REUSE_LEARNED_REMEDY(signature)

¬EXISTS(owner) ∧ GAP_PROVED(capability) ∧ ¬EXTENSIBLE(existing)
→ CREATE_MINIMAL(capability)

CONTRADICTION(scope)
→ FAIL_CLOSED(scope)

INSUFFICIENT_EVIDENCE(scope)
→ UNKNOWN(scope)
```

## Identidade de artefato — aprendizado cristalizado

O erro de depender de nomes transitórios de upload não pode reaparecer em Hermes local, Hermes VPS, CI/CD, MCP ou qualquer outro executor.

```text
ARTIFACT_NAME_IS_NOT_IDENTITY=true
UPLOAD_SUFFIX_IS_TRANSIENT=true
DISCOVER_BY_HASH_FIRST=true
KNOWN_LOCATIONS_FIRST=true
EMPTY_PATH_WITH_KNOWN_IDENTITY=RESOLVE_REFERENCE
EMPTY_PATH != ARTIFACT_MISSING
SAME_HASH_AND_SIZE_DIFFERENT_NAME=SAME_ARTIFACT
SAME_NAME_DIFFERENT_HASH=FAIL_CLOSED
UNRESOLVED_KNOWN_IDENTITY=UNKNOWN
```

Fluxo obrigatório:

```text
EXPLICIT_PATH?
├─ SIM → medir bytes + tamanho + SHA-256
└─ NÃO → procurar somente em locais autorizados conhecidos
          → filtrar por tamanho quando conhecido
          → confirmar SHA-256
          → resolver referência

MATCH → PROVED_IN_SCOPE
MISMATCH → REFUTED_IN_SCOPE / FAIL_CLOSED
NÃO ENCONTRADO → UNKNOWN
```

O nome do arquivo continua útil para apresentação e proveniência, mas nunca é prova de identidade. Sufixos como `(2)` e `(3)` são aliases de transporte, não novos artefatos.

## Herança entre Hermes VPS e Hermes Casa

```text
HERMES_VPS encontra ferida
→ prova causa/remédio
→ cristaliza no owner canônico
→ teste + receipt
→ main
→ HERMES_LOCAL sincroniza
→ carrega ARTIFACT-PROPERTIES.yml + owners + gates
→ reutiliza o aprendizado sem repetir a ferida
```

Isso é transferência por código/contrato/prova, não memória privada de sessão.

## Trava de verdade

```text
SUPPORTED != VERDADE_ABSOLUTA
PROVED_IN_SCOPE != VERDADE_ABSOLUTA
FIXED_POINT != VERDADE_METAFÍSICA
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
```

## Aplicação obrigatória daqui para frente

Toda nova arquitetura, CLI, MCP, CI/CD, workflow, `.exe`, app, site, bridge, router, provider ou pacote full deve passar por este gate antes de criar peça nova.

O fluxo correto é sempre:

```text
REUSE → EXTEND → CREATE_MINIMAL
```

Nunca:

```text
IDEIA NOVA → SISTEMA PARALELO
```

## Implementação viva

- `scripts/lupa/pdf-conformance-cc2003.mjs` resolve o PDF por identidade quando `--pdf` não é fornecido.
- `scripts/lupa/pdf-conformance-cc2003.test.mjs` contraprova nome diferente, hash divergente, path vazio resolvível e path vazio desconhecido.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml` torna a regra global e carregável pelo Hermes.

## Estado desta cristalização

```text
PDF_IDENTITY_CONFIRMED=true
PDF_SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
PDF_SIZE_BYTES=206674
CANONICAL_CONFORMANCE_DOC=docs/CONSCIENCIA/04-MCP-E-CONECTORES/PDF-CONFORMANCE-CC2003.md
BINARY_SOURCE_COMMIT_STATUS=COMMITTED
SOURCE_ID=cc2003-logica-computacional-23-nelma-moreira
SOURCE_STATUS=INGESTED
BINARY_CANONICAL_PATH=docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf
BINARY_GIT_BLOB_SHA=ab84cb54a77bfd4647b487e526b1714223c12c96
BINARY_COMMIT=1fd16f186f880858a39b98701859c48e30fbfb9f
VERIFIED_AT=2026-09-10
VERIFICATION=local SHA-256 + size + pdfinfo pages; GitHub blob equals local git hash-object
SCOPE=SOURCE_BINARY_PROVENANCE_PLUS_ARTIFACT_IDENTITY_POLICY
FULL_PDF_ALGORITHM_CONFORMANCE=NOT_PROVEN
```
