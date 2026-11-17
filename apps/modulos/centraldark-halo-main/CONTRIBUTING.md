# Contributing

Thanks for helping make Codex state visible without making the desktop noisy.

1. Open an issue for behavioral or visual changes before a large implementation.
2. Preserve the local-only boundary of Halo v0.1.8 (no telemetry, prompt capture, or code access). For the v0.1.9 Remote Agent candidate, require explicit authentication, owner consent, scoped actions, and no implicit remote/admin access.
3. Run `pnpm check`, `cargo fmt --check`, `cargo clippy -- -D warnings`, and
   `cargo test` before opening a pull request.
4. Include a short screen recording for visual changes and tests for state,
   timeout, hook, or installer changes.
5. State which platforms were tested on real hardware; do not label a CI build
   as a real-device smoke test.

<!-- CENTRALDARK_ROOT_DOCS_SYNC_20261115 -->
## Mandatory code and release documentation synchronization

LAST_UPDATED_UTC=2026-11-15T03:52:20.307Z

Before submitting **any code, UI, security, configuration, installer or test change**:
1. Update docs/RELEASE.md and the single DRAFT notes for the next version (currently docs/RELEASE_NOTES_v0.1.9.md) in the **same commit**, with actual UTC timestamp, modified paths, behavior, proof/limitations and NEXT_CURSOR.
2. Add a brief entry to CHANGELOG.md for externally meaningful changes. Update README.md and README_CN.md when user workflows or requirements change; update SECURITY.md when trust boundaries change. Do not edit CODE_OF_CONDUCT.md merely to refresh its date.
3. Run the relevant frontend/Rust/security gates and report FAIL, NOT_RUN and UNKNOWN honestly. Do not merge or publish a Release without a verified artifact, version consistency, rollback and receipt.
4. Preserve the original Electron Bridge and Halo unless a specific approved delta requires changes. Never infer that a successful login grants remote-session or administrator permission.

### Semantic in-code trace is mandatory (same owners; no parallel ledger)

Rule: a meaningful function must explain WHY it exists in its SOURCE,
not only in release notes. Before editing any exported/public function,
native command, authentication, pairing, persistence, security, watcher,
installer or non-obvious callback, preserve or update its adjacent trace:

- PURPOSE: what this function owns. WHY: reason for the design.
- CONTRACT: inputs, results, invariants, dependencies.
- EFFECTS: I/O, privileges and side effects. PROOF: what must be re-tested.
  Include fields that materially contribute; no secrets or boilerplate.
- TS/JS/React: JSDoc comment starting with /** @rastro.
  Rust: triple-slash Rustdoc starting with /// !RASTRO; modules use //!.
  PowerShell: comment-based help plus # !RASTRO near important operations.
  Bash/Python: # !RASTRO. CSS: /* @rastro ... */.
- Never comment obvious assignments or copy a generic warning to unrelated
  functions. A changed contract, trust boundary or side effect requires
  an updated local comment in the same code change.
- Reviewers validate meaning. The CI job checks only the presence of a
  marker in each changed source file, NOT real coverage of each function.
- Legacy source is a gradual review backlog. Do not rewrite everything in
  bulk or edit old release histories. Do not commit/publish without approval.
### Lei do Selo: sequencia e responsabilidade do unico writer

Esta regra ja herda RULES.md/AGENTS.md da CentralDark e o metodo
self-documentation da Skill Mae. Nao criar segundo writer nem ledger.
Ao tocar uma funcao daqui para frente, o MESMO writer do owner cumpre:

1. PRE_EDIT: ler owner, contrato, data e escopo; identificar docs dependentes,
   PR HUD da missao e protecoes. Havendo conflito/owner incerto, NAO EDITAR.
2. CODE_SEAL: editar primeiro o codigo e o comentario ADJACENTE da funcao,
   explicando porque existe, entradas, invariantes, efeitos, limites, prova.
   Incluir @owner, @doc_ref e @last_updated UTC real; atualizar @rastro/
   !RASTRO no proprio diff. Em formatos nao comentaveis, como JSON,
   selar no owner documental correspondente.
3. DOC_WRITER: so apos o selo, revisar TODOS os documentos relacionados.
   Atualizar cada documento material afetado e seu LAST_UPDATED_UTC
   (ou RELEASE_LAST_UPDATED_UTC nas notas). Listar caminhos reais no campo
   DOC_SCOPE_UPDATED das notas, renovar DOC_SCOPE_REVIEW_UTC na mesma data e justificar os revisados sem mudanca em
   DOC_SCOPE_REVIEWED_NOOP; nao tocar por reflexo os documentos historicos.
   Exemplos: API/estado -> ARCHITECTURE; segredo/acesso -> SECURITY/PRIVACY;
   instalacao -> INSTALLATION/README; UI -> README/README_CN; erros ->
   TROUBLESHOOTING; comportamento externo -> CHANGELOG.
4. TEST_AND_COUNTERPROOF: rodar suite do cone afetado e indicar PASS,
   FAIL, NOT_RUN e UNKNOWN. Corrigir somente o delta que falhou.
5. HUD_RASTRO: registrar owner, data, escopo, receipt, provas e NEXT_CURSOR
   na missao e funil vigentes; fazer readback do endereco.
6. COMMIT_GATE: somente COM autorizacao do CHEFE, reconciliar C: com
   F:\CentralDark\apps\modulos\centraldark-halo-main por diff sem perda,
   publicar codigo e documentos no mesmo commit permitido, executar CI,
   confirmar SHA e conteudo de main e atualizar o mesmo HUD.

O gate do workflow existente foi testado (positivo + negativos) e reprova o diff sem campos, data, escopo e
recibo. Ele NAO intercepta o editor nem prova cronologia de cliques,
semantica ou cobertura total por conta propria. Sem PRE_EDIT/CODE_SEAL
o writer NAO DEVE iniciar edicao documental; no PR isso bloqueia merge.
Nenhuma publicacao automatica; RELEASE 0.1.9 ainda e DRAFT.
See docs/RELEASE.md for the exact PR gate. Its local positive/negative smoke tests passed, but GitHub CI consumption is still unverified until the versioned owner is synchronized.
<!-- /CENTRALDARK_ROOT_DOCS_SYNC_20261115 -->