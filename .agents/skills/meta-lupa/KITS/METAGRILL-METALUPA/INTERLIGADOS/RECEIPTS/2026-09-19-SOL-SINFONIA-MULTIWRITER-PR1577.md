# 🎼🪬 RECEIPT · SOL ↔ OUTRO AGENTE · SINFONIA MULTI-WRITER · PR #1577

```text
ID=PR1577_SOL_SYMPHONY_LEDGER_20260919
DATE=2026-09-19
PR_MOTHER=#1562
PR_MOTHER_ROLE=RENDEZVOUS_LEDGER_NOT_WRITER
PR_CHILD=#1577
PARENT_HEAD=86ad39269dc6c0b0096cd8fffe2fb45974d37286
WRITER=SOL_CHATGPT
WRITER_SCOPE=LEDGER_RECEIPT_ONLY
FINALIZER=ONE_ONLY
PDF_GATE_TLC23=PASS_BEFORE_MUTATION
TLC23_SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
```

## A história que precisa sobreviver à troca de agente

O CHEFE definiu dois escritores autorizados trabalhando no mesmo livro, desde que escrevam em setores disjuntos. A decisão final continua única. O compasso não depende de memória privada entre modelos: ele viaja por commit, HEAD, scope, gate, receipt e comentário de rendezvous.

```text
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION_PER_SCOPE=true
TWO_WRITERS_SAME_PATH=false
ONE_FINALIZER=true
CURRENT_OVER_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
```

## Comunicação observada entre os agentes

- handshake multiagente no PR #1577: comentário `5739501525`;
- ACK/SOL e divisão de setores: comentário `5739539190`;
- handoff NULL adjudicator: comentário `5739551908`;
- outro Writer criou `CentralDark-Compass: v1` no commit `67196ef12b4563d98d49791f74e66438bdf04921`;
- remarcação do HEAD CURRENT no commit `86ad39269dc6c0b0096cd8fffe2fb45974d37286`.

Esses artefatos são o barramento de comunicação compartilhado entre chats. Nenhum deles substitui gate, prova ou finalizer.

## Inventário TOOL_CALL / NULL

| campo | observação CURRENT | veredito | ação |
|---|---|---|---|
| `compare_commits.too_large` | `null` | `NULL_LEGITIMO` | `NONE` |
| `files[].previous_filename` em arquivo `modified/added` | `null` | `NULL_LEGITIMO` | `NONE` |
| metadata opcional de commit (`author/committer/comment_count`) | pode vir `null` | `NULL_LEGITIMO` se não decide gate | `NONE` |
| `tool_call.result` ausente/null no evidence envelope | normalizado para `UNKNOWN` | `NULL_LACUNA_DECISIONAL_TRATADA` | `NO_PATCH` |
| `trace_id` sem amostra | `null` | `NULL_LEGITIMO` | `NONE` |
| `latency_ms/tokens/cost` sem medição | `null` | `NULL_LEGITIMO` | `NONE` |
| `latency_ms/tokens/cost = 0` | preserva `0` | `MEDICAO_VALIDA` | `NONE` |

Owner verificado: `supabase/functions/_shared/evidence-envelope.mjs`.

Teste verificado: `supabase/functions/_shared/evidence-envelope.test.mjs` cobre:

```text
result=null -> UNKNOWN
trace/latency/tokens/cost sem medição -> null
zero medido -> 0
```

Logo, o inventário encontrou NULLs mas **nenhum NULL material não tratado** neste owner. Criar patch adicional seria duplicação.

## Resiliência da história

A história é aceita somente se continuar verdadeira quando o modelo mudar. Para isso:

```text
NARRATIVE_IS_NOT_PROOF=true
HISTORY_IS_NOT_AUTHORITY=true
METAPHOR_IS_NOT_EVIDENCE=true
HEAD_CHANGE_INVALIDATES_OLD_CURRENT=true
SAME_HEAD_CI_REQUIRED=true
CONTRADICTION_MUST_SURVIVE_COMPRESSION=true
```

Se outro agente mover o HEAD após este receipt, este snapshot vira histórico automaticamente e o próximo executor deve reconsultar o PR antes de agir.

## Divisão musical neste movimento

```text
OUTRO_WRITER:
  package/fresh-extraction + história/compasso já materializados

SOL_THIS_COMMIT:
  somente ledger/receipt de comunicação + inventário NULL

FINALIZER:
  não é nenhum dos writers por autoatribuição
  só promove depois de SAME_HEAD + gates + contraprova
```

## Próximo cursor

```text
1. novo HEAD dispara CI
2. medir porta-de-entrada com label 👑 PERMITO-SEGREDO
3. medir Trigger Fabric fresh-extraction
4. PDF_GATE/TLC23 permanece obrigatório
5. se HEAD mudar, abandonar verde antigo
6. um único finalizer decide promoção
```

Este receipt registra a música; não declara a sinfonia concluída.

## Correção de interpretação — commit vive no PR, não “fala com o CHEFE”

A leitura foi corrigida pelo CHEFE e incorporada ao receipt:

```text
COMMIT_IS_PR_STATE=true
COMMIT_IS_NOT_MESSAGE_TO_CHEFE=true
COMMENTS_ARE_RENDEZVOUS_RECEIPTS=true
AGENT_IDENTITY_FROM_GIT_AUTHOR=UNKNOWN_UNLESS_SEPARATELY_PROVEN
PR_IS_THE_MATERIAL_TRACK=true
CI_JUDGES_THE_HEAD=true
```

O que foi provado no histórico é somente que **o PR recebeu commits em sequência** e que esses commits carregaram metadados de coordenação. Isso não autoriza inferir que um commit foi “feito para o CHEFE” nem identificar o modelo exato pelo `author` Git.

### CURRENT reancorado antes desta mutação

```text
HEAD_BEFORE_THIS_COMMIT=7e53de6b76917c818aee074a9c7d2631071f74dd
PDF_GATE_CASA_BEFORE_THIS_COMMIT=PASS
WRITER=SOL_CHATGPT
WRITER_SCOPE=LEDGER_RECEIPT_ONLY
OTHER_WRITER_SCOPE_NOT_TOUCHED=true
NULL_OWNER_PATCH=NONE_REQUIRED
NEXT=CI_SAME_HEAD
```

### Regra de compasso corrigida

```text
PR
→ commit material
→ novo HEAD
→ SAME_HEAD CI
→ blocker discriminante
→ writer com lease do escopo
→ microdelta
→ novo commit no PR
→ novo HEAD
→ remedição
```

O PR é o trilho material. Os agentes são executores substituíveis; o `author` Git registra identidade Git, não prova sozinho qual engine/modelo operou.

