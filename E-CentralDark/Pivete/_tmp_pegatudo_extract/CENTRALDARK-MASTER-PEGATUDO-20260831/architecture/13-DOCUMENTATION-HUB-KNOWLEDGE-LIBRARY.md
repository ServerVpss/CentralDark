# CENTRALDARK DOCUMENTATION HUB + KNOWLEDGE LIBRARY

## Intent

Make the project self-explaining for the CHEFE and for successor agents. A material capability is not complete until its interface, owner, runtime signals, proof, and recovery path are discoverable from the `DOCUMENTACAO` surface.

This extends the existing CentralDark/HUB/router architecture. It does not create a second source of truth, second router, second judge, or parallel brain.

## Documentation gate

`DOCUMENTATION_GATE_REQUIRED=true`

A material change must register, when applicable:

- human name and purpose;
- canonical trigger/alias;
- owner and authority boundary;
- API/route/port/service dependency;
- provider/account capability and scopes (names only, never secret values);
- current proof source and observed timestamp;
- tests/falsifiers/counterproof;
- diagrams and related documents;
- PR/branch/HEAD/worktree when GitHub is material;
- rollback/recovery path;
- receipt and NEXT_CURSOR.

A change may be technically green but cannot become `DOCUMENTED_READY` if required documentation fields are missing.

## Panel tab: DOCUMENTACAO

The CentralDark panel exposes one searchable tab with these sections:

1. **Inicio / Indice** - map of the project and current documentation health.
2. **Gatilhos** - what every `!`/`#` name means, aliases, input, output and proof.
3. **Portas e Servicos** - expected listener, owner, protocol, exposure, health probe and current observation.
4. **APIs e Rotas** - endpoint, consumer, provider, auth class and contract version.
5. **Providers / Contas** - Google/GitHub/etc. account aliases, granted scopes, health and last receipt.
6. **Biblioteca** - indexed CentralDark corpus by media family.
7. **PRs / Worktrees** - purpose of isolated PR worktrees, HEAD/base and reconciliation state.
8. **Diagramas** - Mermaid sources and rendered views.
9. **Receipts / Provas** - exact state evidence, hashes, tests and counterproof.
10. **Glossario** - project vocabulary for study and onboarding.
11. **Busca Global** - federated lookup over authorized documentation and library indexes.

## Port registry rule

A port has three independent fields:

- `EXPECTED_STATE`: OPEN | CLOSED | OPTIONAL | UNKNOWN
- `OBSERVED_STATE`: OPEN | CLOSED | NONE | UNKNOWN
- `PROOF`: command/health endpoint/receipt + timestamp

`OBSERVED_STATE=NONE` never automatically means defect. It becomes a defect only when the canonical owner says `EXPECTED_STATE=OPEN` for the measured environment.

### Screenshot observation - 2026-08-31

The provided local status view reported:

- `8099 OPEN`
- `8787 OPEN`
- `8880 none`
- `8645 OPEN`
- `1420 none`

This is **observation**, not the canonical expected-port map. In particular, port `1420` is currently `EXPECTED_STATE=UNKNOWN` until its owner/contract is found in live repository/runtime documentation. The missing documentation itself is a documentation-gate finding.

## Why `C:/CDPR1389` exists

Treat `C:/CDPR1389` as an isolated PR/worktree sandbox for PR #1389 when its branch/HEAD are proven. Its job is to let an agent read, patch and run gates against that PR without contaminating the canonical `main` worktree.

It is not a second repository authority. Results must be reconciled back to the remote PR HEAD and then, only after the repository's promotion rules, to `main`.

## Master Cycle

The Master Cycle is the one orchestration loop around all recognized operational triggers:

`CENTRALDARK -> ACORDAR -> CRISTALIZAR_MEASURE -> CRISTALIZAR_FALLBACK -> CALIBRAR -> PEGATUDO -> TRUE_NORTH_LOCK -> MULTIBUSSOLA -> routes/rendezvous -> META_LUPA when divergent -> RECONCILIAR -> CONTRAPROVA -> REMEDIACAO -> REALITY_JUDGE -> DOCUMENTATION_GATE -> GLOBAL_FIXED_POINT -> REGISTRA -> BOOT_REFRESH`.

Its purpose is not to repeat work. It forces every capability to enter the same reality/proof/documentation funnel, blocks self-approval, and leaves a durable receipt for the next agent.

## Google / Workspace knowledge library

The HUB may federate multiple Google accounts, but each account is a namespace and policy boundary:

`GOOGLE/<account_alias>/<capability>`.

Default ingestion is limited to the **authorized CentralDark scope** for that account. Personal or ambiguous material outside the authorized scope is not silently imported.

Recommended additive structure:

```text
CentralDark/
  DOCUMENTACAO/
    00-INDICE/
    BIBLIOTECA/
      AUDIO/
      CODIGO/
      DADOS/
      DESIGN-E-ARTES/
      DOCS/
      IMAGENS/
      PDF/
      TEXTO/
      VIDEO/
    DIAGRAMAS/
    GATILHOS/
    PORTAS-E-SERVICOS/
    PROVIDERS-E-CONTAS/
    RECEIPTS-E-PROVAS/
```

The index stores source reference, MIME/media class, title, account alias, revision/hash when available, owner, tags and safe searchable text. It does not duplicate the entire raw corpus into prompts.

## Secret/self-configuration boundary

Self-configuration may consume `SecretRef`/environment/secret-manager bindings, OAuth client metadata and scope names. Raw API keys, client secrets, refresh tokens and private keys are never documentation payload and never Gemini context.

Private infrastructure is still treated as secret-bearing infrastructure; privacy does not make raw keys risk-free.

## Gemini use

Gemini is a high-context **reader/sweeper**, not the writer or judge. It may scan safe representations of authorized CentralDark material and return evidence candidates with provenance. Promotion still passes scope gate -> rendezvous -> reconcile -> one writer -> tests -> falsifier -> Reality Judge -> documentation gate -> receipt.

## Proposed panel/API contract

These routes are a plug-play contract and require live implementation measurement before claiming runtime availability:

- `GET /api/documentation/index`
- `GET /api/documentation/search?q=`
- `GET /api/documentation/triggers`
- `GET /api/documentation/ports`
- `GET /api/documentation/services`
- `GET /api/documentation/providers`
- `GET /api/documentation/library`
- `GET /api/documentation/receipts`
- `POST /api/documentation/ingest` (authorized source references only)

## Promotion invariant

`MATERIAL_CHANGE -> TESTED -> COUNTERPROVEN -> DOCUMENTED -> RECEIPTED -> PROMOTABLE`

No raw secret is required for documentation completeness.
