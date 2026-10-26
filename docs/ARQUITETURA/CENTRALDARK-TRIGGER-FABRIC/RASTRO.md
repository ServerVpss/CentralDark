# RASTRO

## 🔏 !RASTRO — cadeado executivo

```text
OWNER=AGENTS.md
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
REPOSITORY_RECEIPT_AND_HUD_CURRENT_READBACK_SAME_TURN_AS_DIRECT_MAIN=true
APPLIES_TO_ALL_ENGINES=true
```


```text
CHEFE_INTENT
→ DESTINATION_LOCK
→ MEASURE_MAIN_HEAD
→ READ SOURCE VISUALS/PACKAGE AS MATERIAL
→ HASH/DEDUPE BEFORE DEEP READ
→ SEARCH_CANONICAL_BOOT
→ SEARCH_MULTIBUSSOLA
→ SEARCH_META_LUPA
→ SEARCH_EXISTING_TRIGGER_FABRIC
→ SEARCH_HERMES_CORE + HERMES PROMPT
→ SEARCH_EXISTING_CI/PROMOTION/LABEL OWNERS
→ REUSE_BEFORE_CREATE
→ ABSORB BOT_ENTRY INTO SAME TRIGGER FABRIC
→ ABSORB OUTPUT_GUARD INTO SAME TRIGGER FABRIC
→ ADD ENGINE_BINDING AS REFERENCE, NOT SECOND BRAIN
→ BIND HERMES PROMPT TO CANONICAL CONTRACT
→ EXTEND EXISTING AUTONOMIA PROMOTION JUDGE
→ STRENGTHEN EXISTING PACKAGE WORKFLOW
→ UPDATE CONTRACT/TRIGGERS/ARCHITECTURE
→ UPDATE LIVE_STATE/HISTORY/COUNTERPROOF/RECEIPT
→ BUILD REPRODUCIBLE ZIP
→ HASH
→ EXTRACT FRESH
→ VERIFY
→ OPEN PR
→ LABEL WITH EXISTING TAXONOMY
→ WAIT FOR CI
→ REMEASURE MAIN + PR HEAD
→ COUNTERPROOF
→ RETURN ONLY IF DESTINATION_PROVED OR HUMAN_FRONTIER_PROVED
```

No new brain, dispatcher, MCP, GraphRAG, scheduler, promoter, label taxonomy or equivalent workflow is introduced.

Base `main` remeasured before this delta: `078bf351acaae46091669aa6acdec76ef1d10730` at `2026-08-24T19:12:57.724Z` (`16:12:57 BRT`).

`BASE_HEAD` is provenance. Final current-state claims require remeasurement.


## Fiscal executável

`TRACE_PRESENT != TRACE_VALID`.

Owner continua sendo este arquivo; o fiscal é apenas verificador executável:

- runtime: `scripts/trigger-fabric/rastro_fiscal.py`
- contraprova: `scripts/trigger-fabric/test_rastro_fiscal.py`
- integração estrutural/execução de testes: `scripts/trigger-fabric/verify_repo_contract.py`

Contrato:

```text
INPUT=response|receipt|report
EXTRACT=COMMIT_SHA|PATH|LINK|READBACK|MEMORY_LOCATION|LEDGER_REF|CURRENT_MAIN
VERIFY=GITHUB_REMOTE
VERDICT_PER_CLAIM=PASS|FAIL|UNKNOWN
TRACE_PRESENT != TRACE_VALID
NETWORK_OR_PROVIDER_UNAVAILABLE=UNKNOWN
WRITE_WITHOUT_TRACE=FAIL
MEMORY_WITHOUT_LOCATION=FAIL
DIRECT_MAIN_WITHOUT_REPOSITORY_RECEIPT_OR_HUD_CURRENT_READBACK=FAIL
STALE_CURRENT_MAIN=FAIL
```

O fiscal não cria segundo judge, segundo owner ou segunda verdade. Ele reconstrói a prova citada e devolve evidência para o Reality Judge.


## Metadados obrigatórios de nota (delta 2026-10-25)

Extensão do contrato acima: além de `COMMIT_SHA|PATH|LINK|READBACK`, toda nota `.md` tocada no caminho de uma missão carrega estas propriedades. Não cria segundo owner, segundo fiscal nem segunda verdade — é o mesmo RASTRO, aplicado por arquivo.

```text
data_criacao=DATA_ORIGINAL_PRESERVADA_OU_DESCONHECIDA_ATE_PROVA
ultima_atualizacao=DATA_HORA_DA_ULTIMA_ATUALIZACAO_REGISTRADA
ultima_modificacao=DATA_HORA_DA_ULTIMA_MUDANCA_REAL_DE_CONTEUDO
ultima_verificacao=DATA_HORA_DA_ULTIMA_CONFERENCIA_DO_ESTADO_ATUAL
fuso_horario=FUSO_USADO_NOS_REGISTROS
hash_conteudo=HASH_CALCULADO_DO_CONTEUDO_SALVO
rastro=ORIGEM+EVIDENCIA+HISTORICO_DA_ALTERACAO
grupo_notas=GRUPO_01_A_05_ABAIXO
relacionado_a=LIGACAO_COM_LOOP_MESTRE_E_DOCUMENTOS_PERTINENTES
estado_evidencia=PASS|FAIL|UNKNOWN|BLOCKED
```

Invariantes:

```text
VERIFICAR_SEM_ALTERAR_CONTEUDO_NAO_MUDA_ultima_modificacao=true
ultima_verificacao_TEM_REGISTRO_PROPRIO=true
data_criacao_SEM_PROVA_FICA_DESCONHECIDA_ATE_EVIDENCIA=true
HASH_OU_DATA_INVENTADA=FAIL
```

Grupos de nota (classificação, não pasta nova — reusar estrutura existente antes de criar):

```text
GRUPO_01=CABECA_E_INTENCAO  # intenções, fragmentos, contexto, memória, origem da missão
GRUPO_02=LOOP_MESTRE_E_EXECUCAO  # ciclo canônico, responsáveis, Casa, executores, estado operacional
GRUPO_03=EVIDENCIAS_E_CONTRAPROVAS  # testes, hashes, commits, resultados, falhas, limites da prova
GRUPO_04=PENDENCIAS_E_BLOQUEIOS  # itens desconhecidos, causas de bloqueio, responsáveis, próximos passos
GRUPO_05=APRENDIZADOS_E_KAIZEN  # mudanças comprovadas, melhorias reutilizáveis, aprendizado incorporado
```

**Owner continua este arquivo.** O fiscal existente `scripts/trigger-fabric/rastro_fiscal.py` agora valida o bloco YAML de uma nota `.md` tocada pela missão em modo **somente leitura**:

```bash
python scripts/trigger-fabric/rastro_fiscal.py --note-file "CAMINHO/DA/NOTA.md" --pretty
```

Confere presença dos dez campos, datas com fuso explícito, grupo 01–05, estado da evidência e SHA-256. Para evitar hash autorreferente, `hash_conteudo` recebe `sha256:<64 hex>` do UTF-8 salvo **com apenas o valor desse próprio campo vazio**. A gravação real da nota e o momento da conferência continuam separados. O verificador não altera arquivo, datas nem rastro.

`PASS` valida **formato e conteúdo contra o hash**, não comprova sozinho a origem histórica das datas ou autenticidade do rastro. Criação sem prova deve ser `UNKNOWN` e produz estado `UNKNOWN`. Campo ausente/hash divergente produz `FAIL`. Para nota legada encontrada na missão, registrar pendência e reconciliar no owner autorizado; **não fazer reescrita da biblioteca inteira** por rotina.

**Contraprova executada:** `python -B scripts/trigger-fabric/test_rastro_fiscal.py` → **19 testes OK** em 26/10/2026. Testes cobrem metadados válidos, hash divergente, campo ausente e criação desconhecida, além dos testes antigos do fiscal. Esse resultado prova o verificador local, **não** o uso em todos os agentes ou um FIXED_POINT global.


### Ledgers legados #1562/#1757 — lookup de provenance

```text
PR_MOTHER_ROLE=RETIRED
NO_NEW_PR_MOTHER=true
LEGACY_LEDGER_REF_EXACT_COMMENT_FIRST=true
LEGACY_LEDGER_FALLBACK_STARTS_FROM_NEWEST_PAGE=true
LEGACY_LEDGER_FALLBACK_WALKS_BACKWARD_UNTIL_FOUND=true
GITHUB_ISSUE_COMMENTS_DEFAULT_ORDER=OLDEST_FIRST
LEGACY_LEDGER_OVER_100_COMMENTS_MUST_NOT_FALSE_FAIL=true
```

Se uma prova histórica fornecer link/ID de comentário, o fiscal pode consultá-lo diretamente como provenance.
Receipts CURRENT citam caminho exato no repositório e o fechamento exige HUD CURRENT readback.
Comentários de #1562/#1757 não são superfície operacional nem store primário.

### 2026-10-26 ? Invent?rio de salvamento seguro Casa K: / F: / Git

- Confer?ncia: 2026-10-26T18:11:58-03:00 (fuso local expl?cito do host).
- Main inicial: c06e6ad729ac4f4cadd9a0dac52241e3d7f4c873.
- Miss?o: salvar arquivos version?veis e proteger dados de execu??o.
- Altera??es rastreadas K: (21 caminhos):
  - .agents/skills/centraldark-operational-method/SKILL.md [M]
  - .agents/skills/centraldark-operational-method/catalogo/ARQUIVOS-VIVOS.json [M]
  - .agents/skills/centraldark-operational-method/catalogo/CATALOGO.md [M]
  - .agents/skills/centraldark-operational-method/catalogo/ESTADO-AUTOCURA.json [M]
  - .agents/skills/centraldark-operational-method/catalogo/HISTORICO-MUDANCAS.jsonl [M]
  - .agents/skills/centraldark-operational-method/catalogo/INDICE-PESQUISA.md [M]
  - .agents/skills/centraldark-operational-method/catalogo/INDICE-VIVO.md [M]
  - .agents/skills/centraldark-operational-method/catalogo/VALIDACAO-AUTOMATICA.md [M]
  - .agents/skills/centraldark-operational-method/catalogo/skills-integradas/michelin-3-estrelas/SKILL.md [M]
  - .agents/skills/centraldark-operational-method/references/HERMES-KANBAN-RECEITA-UNIVERSAL.md [M]
  - .agents/skills/kaizen-sistema-um/SKILL.md [M]
  - docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml [M]
  - docs/BRAIN/Excalidraw/Drawing 2026-09-07 04.53.02.excalidraw.md [D]
  - docs/BRAIN/Excalidraw/Drawing 2026-09-07 07.06.07.excalidraw.md [D]
  - docs/CONSCIENCIA/MAPA-DO-CEREBRO.md [M]
  - docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md [M]
  - docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md [M]
  - scripts/lupa/diagram-route-gate.mjs [M]
  - scripts/trigger-fabric/rastro_fiscal.py [M]
  - scripts/trigger-fabric/test_rastro_fiscal.py [M]
- Entradas n?o rastreadas K: (26 agrupamentos):
  - .codeagentswarm/
  - Remote-Tray/
  - WSL/
  - c/
  - centraldark-desktop/
  - core_keys_by_ns.txt
  - core_keys_flat.txt
  - core_keys_raw.txt
  - docs/.claudian/
  - docs/BRAIN/Excalidraw/CENTRALDARK-FIGJAM-OMNI-SOURCE.json
  - gap_keys.txt
  - gap_namespace_matches.txt
  - gate-prova-consolidado-meta-lupa.json
  - k/
  - meta-lupa-gate-exec.json
  - meta-lupa-gate-final.json
  - meta-lupa-gate-lote-final.json
  - meta-lupa-gate-lote2-final.json
  - meta-lupa-gate-v2.json
  - meta-lupa-gate.json
  - orphan_keys.txt
  - orphan_namespace_matches.txt
  - overlap_keys.txt
  - runtime_keys.txt
  - scripts/lupa/diagram-route-excalidraw.mjs
  - source_keys.txt
- N?O enviar ao Git: K:/WSL/ (discos e backup Linux), K:/centraldark-desktop/ (cookies, sess?o/cache), K:/.codeagentswarm/ (banco, estado, snapshots), K:/Remote-Tray/ (bin?rios de build), K:/c/, K:/k/, K:/docs/.claudian/ (configura??o de sess?o), relat?rios de auditoria no root (*_keys*.txt, meta-lupa-*.json, gate-prova-*.json). Todos permanecem no disco Casa.
- Excalidraw gerado permanece em K:/docs/BRAIN/Excalidraw/CENTRALDARK-FIGJAM-ROTAS.excalidraw.md; ignorado por regra existente de .gitignore e regener?vel via scripts/lupa/diagram-route-gate.mjs. Vers?o-fonte: scripts/lupa/diagram-route-excalidraw.mjs e docs/BRAIN/Excalidraw/CENTRALDARK-FIGJAM-OMNI-SOURCE.json.
- F: n?o ? reposit?rio Git na raiz; cont?m worktrees vinculados a K:/.git.
- Worktrees localizados (24):
  - K:
  - C:/root/CentralDark-main-8081
  - C:/tmp/wt-base
  - F:/_worktrees/centraldark-builder-ledger-20261025
  - F:/_worktrees/centraldark-pr1880-20261021-072853
  - F:/_worktrees/centraldark-pr1880-20261021-075059
  - F:/_worktrees/centraldark-ssh-learning-20261025
  - F:/_worktrees/cockpit-ui-label-20261021
  - F:/_worktrees/mcp-api-cockpit-20261024
  - F:/_worktrees/pr-1895
  - F:/_worktrees/reconcile-w-skills-main-20261022
  - F:/_worktrees/sec-gitignore-ssh-20261022
  - F:/_worktrees/sol-bidir-sync-20261026
  - F:/_worktrees/sol-centraldark-usina-20261026
  - F:/_worktrees/sol-motor-evolutivo-20261025
  - F:/_worktrees/sol-one-heart-supabase-20261025
  - F:/_worktrees/sol-vscode-pairing-20261025
  - F:/TEMP/CentralDark/cd-wt-015
  - K:/_worktrees/centraldark-remote-name-migration-20261024/repo
  - K:/_worktrees/fixed-point-pr1839
  - K:/_worktrees/reconcile-w-skills
  - K:/_worktrees/sol-aprendizado-220-20261022
  - K:/centraldark-sync-casa-20261018
  - K:/tmp/lineage-pr1837
- CLEANUP: worktrees com commits ?nicos, altera??es, arquivos n?o rastreados ou estado UNKNOWN permanecem at? prova de descarte seguro; remover somente duplicatas comprovadamente inativas.
- Testes do escopo: RASTRO 19 PASS; diagram-route-gate 19 PASS; Excalidraw UNCHANGED. Prova GitHub depende de SHA real p?s-push.
- Grupo de notas: 03 Evid?ncias e Contraprovas; 04 Pend?ncias e Bloqueios; 05 Kaizen.

### 2026-10-26 ? Follow-up comprovado: worktrees limpos e checkpoints F:

- Data e fuso de confer?ncia: 2026-10-26T18:24:55-03:00
- Main verificada na Casa e GitHub: fdf8b71b7aedf0e82b7dd6c9adc0f691b0109f72 (readback remoto no ciclo).
- Checkpoint F One Heart: F:/_worktrees/sol-one-heart-supabase-20261025 | branch feat/one-heart-supabase-signal-20261025 | commit 2001da923808c71b171b2e13060348d9d71ae8ea | push e readback PASS | 3 arquivos de c?digo; execu??o em produto UNKNOWN.
- Checkpoint F MCP: F:/_worktrees/mcp-api-cockpit-20261024 | branch feat/mcp-api-cockpit-only-20261024 | commit c40ff15920bbfa2fd150ddc2515bacea973dae49 | push e readback PASS | 3 scripts Python, AST PASS, execu??o real UNKNOWN.
- Worktrees exclu?dos APENAS ap?s estado limpo, zero arquivos ignorados, HEAD ancestral de main e zero processos externos referentes aos diret?rios. Remo??o via git worktree remove SEM force. Branches e commits mantidos:
  - F:/_worktrees/centraldark-builder-ledger-20261025 | feat/centraldark-builder-ledger-clean-20261025 | 93875507079cbf1473b47285b608ff33e7d5330c
  - F:/_worktrees/sol-motor-evolutivo-20261025 | feat/cockpit-supabase-hub-20261025 | be6d855ec94bca960d493cb5731401752be27d61
  - F:/_worktrees/sol-bidir-sync-20261026 | feat/sync-center-ssh-readback-20261026 | 9eec85c919a0dfe73ec99678b1497cf5a3a80a2e
- Retidos deliberadamente: F:/_worktrees/centraldark-ssh-learning-20261025 (17132 dele??es rastreadas; UNKNOWN origem; NUNCA consolidar/remover sem reconcilia??o), F:/_worktrees/pr-1895, os dois F:/_worktrees/centraldark-pr1880-20261021-* e F:/TEMP/CentralDark/cd-wt-015 (dirty/untracked e/ou HEAD n?o incorporado), branches com commits n?o integrados, e worktrees K:/_worktrees com dele??o de skill.
- Retido: F:/_worktrees/sol-centraldark-usina-20261026 (recentemente usado, apesar de HEAD j? ancestral de main).
- Regra: branch commit WIP != merge main; exclus?o segura de checkout != exclus?o de branch; status UNKNOWN n?o ? PASS.
- Grupo 03: provas SHA e checagens. Grupo 04: exclus?es incertas. Grupo 05: Kaizen reuso do gate original.
