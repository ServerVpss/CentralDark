# PR #1482 — execução grande controlada / zero regressão

INTENCAO=Levar REUSE_BEFORE_CREATE universal + Horn Gate + PowerShell 7 + CI/CD + N modelos ao ponto firme, sem arquitetura paralela, sem V1/V2/V3 e sem falso-verde.

PR=1482
BASE_RECONCILIADA_ORIGIN_MAIN=37f6429b05e02cec868eb6de04b0dbc1bdc25657
HEAD_LOCAL_POS_MERGE=5a0352a69f693703415b1ae9e1a4ead4193149db
BRANCH=feat/mcp-horn-reuse-fixed-point-20260909

CAUSA_RAIZ:
- PR estava atrasado em relacao a main viva e carregava workflow antigo com ubuntu-latest em .github/workflows/installer-deterministic.yml.
- Main viva introduziu novo workflow .github/workflows/grafo-vivo-markdown.yml com ubuntu-latest, quebrando GLOBAL_RUNNER_POLICY.
- Guard MetaLupa apontava para blob antigo 42691e008ba50ee55646ca81113bf0abfde87af2 enquanto o SKILL.md versionado mede 174f93eccbab846cf13d89bbf80629741f0dd803.
- PADRAO-RESPOSTA-SEGREDO-CHEFE.md estava sem marcadores exigidos por verify_repo_contract.py e portable-kernel.mjs.
- docs/BRAIN/cristalizacao-source-a-ledger.json e docs/BRAIN/cristalizacao-source-b-ledger.json eram ledgers crus gerados sem consumidores medidos; um era maior que 16 MiB e outro continha referencia remota bloqueada pelo guardrail.

CORRECAO_FEITA:
- Merge de origin/main no branch de PR sem rebase e sem force-push.
- .github/workflows/grafo-vivo-markdown.yml: runs-on alterado para [self-hosted, Linux].
- .agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA: reconciliado para o blob observado do SKILL.md versionado.
- docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md: adicionados marcadores de prova sistematica e fronteira semantica humano/maquina.
- docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md: ligados canonicos orfaos ao indice de fontes atuais.
- Removidos do PR os ledgers crus docs/BRAIN/cristalizacao-source-a-ledger.json e docs/BRAIN/cristalizacao-source-b-ledger.json apos consumer search retornar zero referencias.

TESTES_LOCAIS_POS_CORRECAO:
- python3 scripts/trigger-fabric/verify_repo_contract.py . = PASS
- node apps/modulos/mapeamento/core/validar-mapa.mjs = PASS
- node scripts/lupa/validar-porta-de-entrada.mjs --json = PASS
- node scripts/lupa/validar-identidade-operacional.mjs --json = PASS
- node scripts/lupa/portable-kernel.mjs --json = PASS
- node --test scripts/lupa/agent-core-adapters.test.mjs = PASS 11/11
- node --test scripts/webhook/lib/safe-git-deploy.test.mjs = PASS 8/8
- node .agents/skills/git-state-safety/scripts/validate.mjs = PASS
- node scripts/lupa/pdf-conformance-cc2003.mjs --self-test = PASS
- node --test apps/modulos/mcp/tests/reuse-horn.test.mjs = PASS 6/6
- node scripts/lupa/universal-execution-standard.mjs = PASS
- pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/lupa/calibrar-horn.ps1 -SelfTest = PASS

NAO_TOCADO:
- Sem arquitetura paralela.
- Sem V1/V2/V3.
- Sem secrets/tokens.
- Sem force-push.
- Sem reset hard.

RISCO_RESIDUAL:
- SAME_HEAD_CI depende do GitHub Actions no head remoto pos-push.
- last_messages.json Windows nao pertence ao executor Linux atual.

VEREDITO_LOCAL=READY_FOR_REMOTE_CI
