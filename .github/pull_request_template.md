# Pull Request — CentralDark

## Objetivo

Descreva em uma frase o que esta mudança resolve no repositório oficial `ServerVpss/CentralDark`.

## Skill operacional obrigatória — Casa ↔ Repositório

Todo PR direcionado a `main` deve usar o owner canônico abaixo antes de declarar estado, revisar, mutar, promover ou preparar merge:

- `.agents/skills/centraldark-operational-method/SKILL.md`
- `.agents/skills/centraldark-operational-method/references/PR-HOUSE-TEMPORAL-RECONCILIATION.md`

A regra vale nos dois sentidos:

```text
PR / REPO
→ carregar skill canônica
→ reconciliar PASSADO + PRESENTE MEDIDO + FUTURO CONDICIONAL
→ reconciliar com a Casa local quando material

CASA LOCAL / HERMES
→ carregar skill canônica do repo
→ medir branch/HEAD/PR/Writer
→ reconciliar com o GitHub vivo
```

`PASSADO != PRESENTE`. `FUTURO != PRESENTE`. `UNKNOWN != PASS`. Declaração no body não prova que a skill foi executada.

Preencha o receipt:

```yaml
CENTRALDARK_SKILL_GATE:
  owner: .agents/skills/centraldark-operational-method/SKILL.md
  required: true
  skill_sha_observed: UNKNOWN
  repo_head_observed: UNKNOWN
  base_head_observed: UNKNOWN
  past_reconciled: UNKNOWN
  present_measured: false
  future_classified: UNKNOWN
  house_repo_drift: UNKNOWN
  writer: NONE
  verdict: UNKNOWN
```

Para `verdict: PASS`, o owner deve existir no HEAD analisado, o presente deve ter sido medido e qualquer drift Casa↔repo material deve estar reconciliado ou explicitamente classificado como fronteira humana comprovada.

## Regra global — registrar antes de relatar

A CentralDark usa o mesmo método operacional em Casa, GitHub, VPS, MCP, Desktop, Web, Telegram, IDE e superfícies futuras. O território da prova muda; a disciplina não.

```text
REGISTER_BEFORE_REPORT=true
PERSIST_BEFORE_FINAL_REPORT=true
REPORT_IS_PROJECTION_OF_PERSISTED_STATE=true
SAME_OPERATING_STANDARD=true
PROOF_TARGET_IS_SCOPE_BOUND=true
```

Para delta material persistível:

```text
INTENÇÃO
→ #ACORDAR
→ MEDIR
→ OWNER
→ AÇÃO
→ !REMEDIÇÃO
→ !REGISTRA
→ COMMIT/LEDGER/RECEIPT
→ READ-BACK
→ SÓ ENTÃO RELATO FINAL
```

- [ ] O delta material foi persistido antes do relato final.
- [ ] O registro foi lido novamente depois da escrita.
- [ ] O fechamento humano aponta SHA/ref/receipt real.
- [ ] Se não houve delta material, nenhum commit artificial foi criado.

`CHAT_REPORT_WITHOUT_PERSISTED_RECEIPT=INVALID_FOR_MATERIAL_DELTA`.

## Ciclo de PR e !REGISTRA

Antes de abrir este PR, confirme que ele é realmente o próximo veículo de promoção do escopo:

- [ ] Não existe outro PR ativo que já seja owner deste mesmo escopo.
- [ ] Este PR não foi aberto apenas porque começou outro chat, sessão ou commit.
- [ ] O PR anterior do mesmo escopo está `MERGED/CLOSED`, ou este é o PR ativo que está sendo reutilizado.
- [ ] A `main` foi remedida antes de criar nova branch quando este é um novo ciclo.
- [ ] Existe delta material real: bug, feature/requisito autorizado ou aprendizado provado.
- [ ] `owner + scope + candidate branch` foram resolvidos antes da abertura.

```text
ONE_ACTIVE_PROMOTION_PR_PER_SCOPE=true
MANY_COMMITS_PER_ACTIVE_PR_ALLOWED=true
SAME_SCOPE_DELTA_REUSES_ACTIVE_PR=true
NEW_PR_PER_CHAT=false
NEW_PR_PER_COMMIT=false
NEXT_PR_STARTS_FROM_CURRENT_MAIN=true
DIRECT_MAIN_WRITE=false
```

Para todo delta material produzido por IA/agente/superfície CentralDark:

- [ ] `!REGISTRA` foi aplicado ao ledger do escopo ativo.
- [ ] O registro contém intenção, escopo, owner, HEAD/estado, delta, evidência, contraprova, status e próximo cursor.
- [ ] Registro não contém chain-of-thought, raciocínio privado ou segredo.
- [ ] `commit_per_message=false`: material da mesma sessão/escopo foi deduplicado e coalescido quando aplicável.

Nenhum delta material novo significa que nenhum commit/PR novo é obrigatório.

## Capacidades da IA autora

Declare honestamente o que a IA que abriu ou escreveu este PR consegue interpretar.  
`UNKNOWN` é válido. O bot gera fallback em texto simples e pede suporte automaticamente quando necessário.

```yaml
AI_CAPABILITIES:
  mermaid: UNKNOWN
  canvas_html: UNKNOWN
  structured_yaml: UNKNOWN
```

## Artefato de aprendizado

O workflow `PR — artefato de aprendizado automático` deve gerar no mesmo HEAD:

- comentário Mermaid;
- fallback universal em texto;
- cartão YAML;
- Canvas HTML como artifact;
- receipt;
- pedido de suporte por labels quando alguma capacidade for `NAO` ou `UNKNOWN`.

O artefato organiza o contexto. Ele não aprova código, não autoriza merge e não substitui testes.

## Reconciliação histórica e delta útil

- [ ] Commits relevantes anteriores foram inventariados quando materiais ao escopo.
- [ ] PRs mergeados e PRs fechados sem merge foram considerados quando carregam delta potencialmente exclusivo.
- [ ] Histórico foi classificado como `CURRENT | ABSORBED | SUPERSEDED | REJECTED | HISTORICAL | UNKNOWN`.
- [ ] Nenhum estado histórico foi promovido a estado atual sem nova medição.
- [ ] Somente delta útil compatível com owners atuais foi preservado.

## Escopo

- [ ] Alteração limitada ao necessário.
- [ ] Não cria versões duplicadas `v1`, `v2` ou `v3`.
- [ ] Arquivos afetados foram listados.
- [ ] Áreas protegidas foram respeitadas.
- [ ] `REUSE_BEFORE_CREATE` foi aplicado.
- [ ] Há um único Writer por escopo mutável.

## Arquivos sensíveis

- [ ] Não li, abri, copiei, editei ou usei como contexto arquivos sensíveis além do estritamente autorizado e necessário.
- [ ] Não há `.env`, token, cookie, sessão, chave privada, certificado ou credencial no diff.
- [ ] Valores sensíveis foram substituídos por placeholders seguros.

## Testes

Liste os testes realizados e seus resultados.

## Ações sensíveis

- [ ] Não houve deploy, migration, reinício de serviço ou alteração na VPS sem autorização aplicável.
- [ ] Se houver ação sensível futura, ela aguarda autorização explícita do CHEFE/SEGREDO quando exigida pela governança.
- [ ] Nenhuma ação destrutiva foi executada fora do escopo autorizado.

## Revisão

- [ ] Verifiquei comentários de agentes no PR antes do merge.
- [ ] Revisei o diff completo.
- [ ] Confirmei que os logs não expõem valores sensíveis.
- [ ] O handoff final informa arquivos, testes, riscos e próximo passo.
- [ ] `ACTION != PROOF` e `DOCUMENTED != EXECUTED` foram respeitados.

## Prova — fileiras separadas por tópico

Cada claim material deve ocupar sua própria fileira/bloco. Não misture prova de GitHub, Casa e VPS na mesma linha.

```text
[TÓPICO]
CLAIM=
SCOPE=
OWNER=
T0=
ACTION=
T1=
EVIDENCE_REF=
COMMIT_SHA=
FILE_BLOB_SHA=
SHA256=
TEST=
COUNTERPROOF=
CI_SAME_HEAD=
RUNTIME_PROOF=
STATUS=PROVEN|UNKNOWN|NOT_PROVEN|BLOCKED
NEXT_CURSOR=
```

### TÓPICO 1 — GOVERNANÇA / CONTRATO

```text
CLAIM=
SCOPE=GITHUB_ONLY|CROSS_PLANE|OUTRO
OWNER=
COMMIT_SHA=
FILE_BLOB_SHA=
SHA256=
TEST=
COUNTERPROOF=
STATUS=
```

### TÓPICO 2 — GITHUB / PR / HEAD

```text
PR=
BRANCH=
BASE_SHA=
HEAD_SHA=
MERGEABLE=
COMMIT_SHA=
CI_SAME_HEAD=
WORKFLOW_RUN=
STATUS=
```

### TÓPICO 3 — CASA LOCAL

```text
CLAIM=
RUNTIME_FINGERPRINT=
FILE_OR_PROCESS=
SHA256=
T0=
T1=
TEST=
RECEIPT=
STATUS=
```

### TÓPICO 4 — VPS

```text
CLAIM=
RUNTIME_FINGERPRINT=
SERVICE_OR_ENDPOINT=
DEPLOY_SHA=
T0=
T1=
SANITIZED_LOG_REF=
TEST=
STATUS=
```

### TÓPICO 5 — MCP / API / DESKTOP / WEB / TELEGRAM / IDE

```text
SURFACE=
CLAIM=
OWNER=
ENDPOINT_OR_COMPONENT=
EVIDENCE_REF=
TEST=
COUNTERPROOF=
STATUS=
```

### TÓPICO 6 — FIXED POINT / LOCK

```text
SEMANTIC_GREEN=
MULTIBUSSOLA=
COUNTERPROOF=
REALITY_JUDGE=
CI_SAME_HEAD=
DECISION_LINEAGE=
LAST_GOOD_STATE=
POST_GREEN_LOCK=
GLOBAL_FIXED_POINT=
```

Regras de prova:

```text
ONE_TOPIC_ONE_PROOF_ROW=true
CLAIM_PROOF_COLOCATION=true
CHECKSUM_WHEN_BYTES_ARE_MATERIAL=true
COMMIT_SHA_WHEN_GIT_MUTATED=true
FILE_BLOB_SHA_WHEN_GITHUB_CONTENT_MUTATED=true
SAME_HEAD_REQUIRED_FOR_CI_CLAIM=true
UNKNOWN_FIELDS_REMAIN_UNKNOWN=true
MISSING_CHECKSUM_MUST_NOT_BE_INVENTED=true
HASH_IDENTITY != RUNTIME_PROOF
COMMIT_SHA != RUNTIME_PROOF
WORKFLOW_GREEN != GLOBAL_FIXED_POINT
```

Inclua commit SHA, resultado do pipeline e evidências relevantes do mesmo HEAD. O primeiro resumo do PR deve apontar o que **já está persistido**, nunca prometer persistência futura como se já tivesse acontecido.
