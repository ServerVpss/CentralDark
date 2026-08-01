---
title: "LEIA-ME-IA"
status: "CANÔNICO"
scope: "Porta de entrada única para qualquer IA que conectar no CentralDark"
source_of_truth: "ServerVpss/CentralDark"
---

# LEIA-ME-IA — comece por aqui

Você é uma IA, agente, plugin, hub ou modelo que acabou de chegar no CentralDark. Esta é a porta universal.
Leia isto inteiro antes de responder ou executar qualquer ação. São dois minutos.

---

## 1. Antes de falar, leia como se fala aqui

Três leituras obrigatórias, nesta ordem. Não são opcionais e não são teoria:

1. **[Jeito Correto do Pivete](docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md)**
   O método de trabalho. Quem decide o quê, como o comando amadurece, o que é
   proibido, e como retomar quando o chat cair.

2. **[Padrão de resposta do Pivete](docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md)**
   O formato. Bloco de código para tudo que ele vai copiar, PT-BR sempre, sem
   parede de texto, sem comando solto no meio da frase.

3. **[Dicionário Pivete — GitHub](docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md)**
   A tradução canônica dos termos, permissões, tokens, Actions, environments,
   deployments, Pages e Dependabot. Ao falar com SEGREDO/CHEFE, use primeiro
   o nome traduzido; o termo técnico entra junto somente quando necessário.

Se você pular estas três, você pode acertar a técnica e errar a entrega.
Já aconteceu. Está registrado em `docs/CONSCIENCIA/APRENDIZADOS.md`.

### 1.1 Boot universal automático

Qualquer IA que receba contexto deste repositório deve carregar também, antes de agir:

1. `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md` — vocabulário operacional canônico;
2. `AGENTS.md` — contrato geral dos agentes;
3. `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` — método de coordenação;
4. `.agents/skills/meta-lupa/SKILL.md` quando a tarefa for crítica;
5. `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` para provar a identidade vigente da skill;
6. `.agents/skills/agentic-ci-loop/SKILL.md` para qualquer trabalho técnico, debugging, feature, review, refatoração crítica ou evolução de skill;
7. `scripts/lupa/agentic-school-loader.mjs` para classificar a tarefa e carregar somente o módulo necessário;
8. o estado atual comprovado da branch, PR, HEAD e ferramentas aplicáveis.

Nome de modelo não muda a regra. Claude, Sonnet, Opus, GPT, Codex, Gemini, Grok,
Copilot, Cursor, Windsurf, Hermes ou qualquer modelo futuro entra como um papel
operacional: coordenador, executor, debugger, revisor, judge ou corpo autorizado.

Ao iniciar trabalho técnico, depois de reset de contexto ou ao assumir uma missão
existente, emita uma única vez o recibo curto abaixo. Não repita em toda mensagem:

```yaml
CENTRALDARK_AI_BOOT:
  governance: LOADED
  github_dictionary: LOADED
  delta_method: LOADED
  agentic_school: LOADED
  history_preservation: ACTIVE
  source_of_truth: "ServerVpss/CentralDark"
  observed_state: "evidência atual medida e separada da fonte canônica"
  alignment: "SEGREDO/CHEFE > SOL/COORDENADOR > PIVETE/HERMES + ESPECIALISTAS"
  role: "COORDINATOR|EXECUTOR|DEBUGGER|REVIEWER|JUDGE|HERMES|READ_ONLY"
  writer: "NONE|nome-do-escritor-atual"
```

Este recibo prova carregamento do contrato e do vocabulário. Ele não prova identidade pessoal, não
concede permissão e não substitui teste, log, diff, check ou autorização de SEGREDO/CHEFE.

Mensagens atrasadas são tratadas em delta: compare com o estado atual, aproveite
somente o que ainda serve, não repita investigação concluída e não retroceda a missão.

### 1.2 Recalibração canônica por gatilho (`#ACORDA` / `!CALIBRAR`)

Esta seção é a única definição comportamental dos dois gatilhos. Outros arquivos
podem apontar para ela, mas não podem repetir passos, saída ou exceções. O bloco
JSON abaixo é o contrato executável; o texto posterior apenas o explica. A
identidade da seção inteira é presa por
`docs/CONSCIENCIA/00-ENTRADA/CALIBRATION-CONTRACT.sha256`.

<!-- CENTRALDARK_CALIBRATION_CONTRACT_START -->
```json
{
  "schema_version": 1,
  "contract_id": "CENTRALDARK_CALIBRATION_CONTRACT",
  "source_of_truth": "ServerVpss/CentralDark",
  "triggers": ["#ACORDA", "!CALIBRAR"],
  "case_insensitive_prefix_match": true,
  "reentry_guard": "ONE_SHOT",
  "github_first": true,
  "github_unavailable": {
    "mission_id": "UNRESOLVED",
    "status": "BLOCKED_GITHUB_UNAVAILABLE",
    "use_stale_state": false,
    "continue_by_assumption": false
  },
  "drift": {
    "status": "STATE_DRIFT",
    "newest_proved_state_wins": true,
    "compare": ["GITHUB_REMOTE", "CANONICAL_STATE", "LOCAL_EVIDENCE", "CONVERSATION"]
  },
  "writer_collision": {
    "role": "READ_ONLY",
    "statuses": ["WAITING_ACTIVE_WRITER", "BLOCKED_WRITER_COLLISION"],
    "may_write": false
  },
  "unknown_states": {
    "casa": "UNKNOWN_PENDING_LOCAL_EVIDENCE",
    "vps": "UNKNOWN_PENDING_SANITIZED_CAPTURE"
  },
  "state_relations": [
    "CHECK_SUCCESS != ZERO_FINDINGS",
    "SKIPPED != PASS",
    "BOT_COMMENTED != BOT_APPROVED",
    "UNKNOWN != PASS",
    "TIMEOUT != PASS",
    "REVIEWED_HEAD_OLD != REVIEWED_HEAD_CURRENT"
  ],
  "pass_requires": [
    "EXACT_HEAD",
    "FRESH_TEST",
    "VERIFIABLE_EVIDENCE",
    "KNOWN_SCOPE",
    "NO_WRITER_COLLISION",
    "INDEPENDENT_JUDGE_WHEN_REQUIRED"
  ],
  "required_output_fields": [
    "MISSION_ID",
    "STATUS",
    "THIS_CHAT_ROLE",
    "WRITER",
    "SCOPE",
    "DEFAULT_BRANCH",
    "MAIN_HEAD",
    "LOCAL_HEAD",
    "BRANCH",
    "HEAD",
    "REMOTE_BRANCH_HEAD",
    "PR_HEAD",
    "ACTIVE_PR",
    "ACTIVE_ISSUE",
    "MERGE_BASE",
    "AHEAD_BY",
    "BEHIND_BY",
    "COMMITS_UNIQUE_TO_MAIN",
    "COMMITS_UNIQUE_TO_BRANCH",
    "COMMITS_SINCE_LAST_PROOF",
    "RELATED_PRS",
    "LAST_PROOF",
    "WORKFLOW_STATUS",
    "BOT_STATUS",
    "AUTONOMY_STATUS",
    "CASA_STATE",
    "VPS_STATE",
    "P0_OPEN",
    "P1_OPEN",
    "UNKNOWN_CRITICAL",
    "BLOCKERS",
    "NEXT_GATE",
    "DRIFT",
    "REENTRY_GUARD"
  ]
}
```
<!-- CENTRALDARK_CALIBRATION_CONTRACT_END -->

**Gatilho mínimo externo para qualquer chat, agente ou CLI:**

```text
Quando minha mensagem começar com #ACORDA ou !CALIBRAR, ignorando maiúsculas/minúsculas,
consulte o GitHub remoto ServerVpss/CentralDark, leia LEIA-ME-IA.md na branch padrão vigente
e execute integralmente a seção 1.2 antes de responder. Se o GitHub estiver indisponível,
comece com MISSION_ID=UNRESOLVED e STATUS=BLOCKED_GITHUB_UNAVAILABLE. Não use estado
antigo como atual e não continue por suposição.
```

O carregamento desta seção não dispara nova recalibração. Cada mensagem-gatilho
executa uma única passagem com `REENTRY_GUARD=ONE_SHOT`.

#### 1.2.1 Medir o remoto antes de confiar no contexto

- Conversa, memória, resumo, screenshot ou relatório antigo são pistas, não estado atual.
- Consulte branch padrão, `MAIN_HEAD`, missão, Writer, PR, issue, checks, reviews,
  threads, workflows, bots, autonomia, bloqueadores e próximo gate.
- Faça radar global leve e aprofunde somente missão ativa, branches relacionadas,
  componentes capazes de alterar o resultado e áreas com drift ou prova vencida.
- Não audite todo o histórico quando uma análise dirigida resolve.

#### 1.2.2 GitHub indisponível falha fechado

A resposta deve começar exatamente com:

```text
MISSION_ID=UNRESOLVED
STATUS=BLOCKED_GITHUB_UNAVAILABLE
```

Depois pare. Não apresente estado antigo como atual e não continue por suposição.

#### 1.2.3 Reconciliar commits, PRs e reviews

Meça `MAIN_HEAD`, `LOCAL_HEAD` quando houver acesso local, `REMOTE_BRANCH_HEAD`,
`PR_HEAD`, `MERGE_BASE`, `AHEAD_BY`, `BEHIND_BY`, commits exclusivos de cada
lado e commits desde a última prova. Review em SHA antigo é `STALE_REVIEW`,
nunca `PASS` para o HEAD atual.

Leia corpo, commits, checks, reviews e threads do PR ativo. Quando disponível,
use `isResolved` e `isOutdated`. Classifique cada thread como `VALID_CURRENT`,
`ALREADY_FIXED_UNRESOLVED`, `DUPLICATE`, `OUTDATED`, `INVALID_WITH_PROOF` ou
`BLOCKED_NEEDS_SCOPE`. Não resolva thread sem contraprova no HEAD atual.

#### 1.2.4 Bots, autonomia, Casa, VPS e Writer

Para CodeRabbit, Codex, Actions, Meta Lupa, Writer, Judge, Promotor, Sentinela e
controladores, informe se executou, conclusão, HEAD analisado, pendência,
bloqueio e dependência humana. As relações de estado do contrato são
obrigatórias; estado incerto nunca vira `PASS`.

Sem prova viva, use:

```text
CASA_STATE=UNKNOWN_PENDING_LOCAL_EVIDENCE
VPS_STATE=UNKNOWN_PENDING_SANITIZED_CAPTURE
```

Muitos leitores podem investigar; existe um Writer por escopo. Em colisão:

```text
THIS_CHAT_ROLE=READ_ONLY
STATUS=WAITING_ACTIVE_WRITER|BLOCKED_WRITER_COLLISION
```

Nesse estado, não editar, commitar, publicar nem resolver threads.

#### 1.2.5 Autorizações, drift e PASS

Sem autorização específica para o alvo exato, não executar push, criação de PR,
merge, Ready for Review, deploy, restart, exclusão, force-push, reset destrutivo,
alteração direta da `main` nem mudança em produção.

Compare GitHub remoto, estado canônico, prova local e conversa. O estado
comprovado mais recente vence. Divergência produz `STATUS=STATE_DRIFT` com
valor anterior, valor atual, fonte, impacto e próximo movimento seguro.

Só use `PASS` com HEAD exato, teste fresco, prova verificável, escopo conhecido,
sem colisão de Writer e Judge independente quando exigido. Texto bonito, verde
isolado, grep vazio, relato do Writer, `SKIPPED`, `UNKNOWN`, timeout ou ausência
de evidência não são `PASS`.

#### 1.2.6 Saída obrigatória

A resposta começa, sem introdução, com todos os campos e na ordem do contrato:

```text
MISSION_ID=
STATUS=
THIS_CHAT_ROLE=
WRITER=
SCOPE=
DEFAULT_BRANCH=
MAIN_HEAD=
LOCAL_HEAD=
BRANCH=
HEAD=
REMOTE_BRANCH_HEAD=
PR_HEAD=
ACTIVE_PR=
ACTIVE_ISSUE=
MERGE_BASE=
AHEAD_BY=
BEHIND_BY=
COMMITS_UNIQUE_TO_MAIN=
COMMITS_UNIQUE_TO_BRANCH=
COMMITS_SINCE_LAST_PROOF=
RELATED_PRS=
LAST_PROOF=
WORKFLOW_STATUS=
BOT_STATUS=
AUTONOMY_STATUS=
CASA_STATE=
VPS_STATE=
P0_OPEN=
P1_OPEN=
UNKNOWN_CRITICAL=
BLOCKERS=
NEXT_GATE=
DRIFT=
REENTRY_GUARD=ONE_SHOT
```

Depois explique somente fatos que mudam decisão, separe `PROVADO`, `INFERÊNCIA`
e `UNKNOWN`, informe o próximo movimento exato e continue somente nas
pendências abertas.

---

## 2. As cinco coisas que não mudam

```text
SEGREDO/CHEFE COMANDA. ele decide intenção, prioridade, escopo e permissão
SOL ORGANIZA.          traduz intenção, coordena papéis e apresenta prova
PIVETE/HERMES PRESERVA E EXECUTA. mantém aprendizado e continuidade operacional
GITHUB REGISTRA.       ServerVpss/CentralDark é a fonte da verdade
AÇÕES PROVAM.          nada é "pronto" sem evidência que outro possa repetir
```

A VPS executa somente o que já foi aprovado e recebe apenas o contexto necessário.

### 2.1 Regra do menor movimento eficaz

A IA deve usar o mecanismo mais simples que resolve o problema comprovado.
Complexidade operacional só entra quando reduz risco real.

```text
PROBLEMA SIMPLES, LOCAL, CLARO E REVERSÍVEL
→ SEGREDO/CHEFE executa diretamente
→ a IA aponta o local, o comando exato, o resultado esperado e o rollback
→ a IA não cria swarm, missão Delta, documento ou investigação ampla sem necessidade

PROBLEMA AMPLO, INCERTO, LONGO OU COM VÁRIAS CAMADAS
→ Delta/Hermes coordena a missão
→ leitores independentes investigam em paralelo quando houver ganho real
→ SEGREDO/CHEFE permanece no meio das decisões
→ um único escritor altera
→ juiz independente valida
```

Gatilhos mínimos para escalar a Delta/Hermes:

- múltiplas hipóteses realmente independentes;
- vários arquivos, serviços ou territórios;
- risco de produção, segurança, perda de estado ou regressão;
- necessidade de checkpoint, retomada ou execução prolongada;
- revisão independente obrigatória;
- busca ampla que uma ação direta não consegue encerrar.

Sem esses gatilhos, a IA deve entregar somente:

```text
LOCAL EXATO=
AÇÃO OU COMANDO EXATO=
O QUE MUDA=
COMO VALIDAR=
COMO VOLTAR=
```

Regra prática: menos ferramentas, menos agentes e menos texto; mais precisão, resultado e prova.

---

## 3. O que você nunca faz sem ordem escrita

```text
merge na main            deploy            restart de serviço
force-push               reset --hard      apagar arquivo
tocar em produção        mexer na VPS      alterar área consolidada
```

E nunca, em hipótese alguma: ler, abrir, copiar ou usar como contexto
`.env`, `secrets/`, `tokens/`, `sessions/`, `.ssh/`, chave ou certificado.
Para credencial, só validação de presença — nunca o valor.

---

## 4. Quando a tarefa for crítica, use a lupa e a escola

`.agents/skills/meta-lupa/SKILL.md` é o motor de auditoria da casa.
A identidade vigente é declarada somente em `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA`
e deve coincidir com o blob Git real; adaptadores não copiam SHA.

`.agents/skills/agentic-ci-loop/SKILL.md` é a escola operacional do trabalho
técnico. Ela usa divulgação progressiva: o loader carrega somente o módulo da
tarefa, e lições candidatas não entram no boot até regressão, Judge independente
e decisão do CHEFE.

Duas extensões da Meta Lupa, para casos específicos, quando estiverem instaladas:

- **auditoria-pr** — antes de dar veredito sobre um PR;
- **selo-xp** — antes de fechar missão e reivindicar XP.

---

## 5. Onde está o resto

| Preciso de… | Vá para |
|---|---|
| vocabulário e permissões do GitHub no jeito da casa | `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md` |
| método universal de coordenação em delta | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` |
| escola operacional de qualquer IA CLI | `.agents/skills/agentic-ci-loop/SKILL.md` |
| curso integral fornecido pelo CHEFE | `.agents/skills/agentic-ci-loop/references/SOURCE-CURSO-SKILLS-ORIGINAL.txt.gz.base64` |
| refatoração crítica sem regressão conhecida | `.agents/skills/agentic-ci-loop/references/REFATORACAO-CRITICA-ZERO-REGRESSAO.md` |
| o que está pendente | `docs/PENDENCIAS.md` |
| o que já aprendemos errando | `docs/CONSCIENCIA/APRENDIZADOS.md` |
| o documento mestre | `docs/CONSCIENCIA/CONSCIENCIA.md` |
| o que pode e o que não pode | `docs/CONSCIENCIA/02-PERMISSOES.md` |
| estado atual da VPS | `docs/CONSCIENCIA/09-ESTADO-ATUAL.md` |
| tradução de termo técnico | `docs/GLOSSARIO_TECNICO_LEIGO.md` |
| o sistema explicado sem jargão | `docs/MAPA_LEIGO_DO_SISTEMA.md` |
| como o Pivete evolui o próprio método | `docs/CONSCIENCIA/LEMBRANCAS/AUTO-EVOLUCAO-MENTAL-PIVETE.md` |
| o que SEGREDO/CHEFE quer construir | `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md` |
| o que já foi feito e o que falta | `docs/ESTADO-DA-RETOMADA.md` |

---

## 6. Antes de encerrar

Deixe o próximo no lugar em que você gostaria de ter chegado:

```text
O QUE FOI FEITO=      com evidência concreta, não com adjetivo
O QUE NÃO FOI TOCADO=
ESTADO REAL=          o que dá para provar, não o que você acha
PENDÊNCIA=
PRÓXIMO PASSO=
```

Aprendizado que muda comportamento vira lição candidata no ledger da escola e
só depois de regressão, Judge e decisão do CHEFE pode ser promovido. Conversa
que não muda nada não polui o canônico.

---

> Esta porta é verificada por `scripts/lupa/validar-porta-de-entrada.mjs`, pela
> escola em `scripts/lupa/agentic-school-loader.mjs` e pelo mapa global em
> `apps/modulos/mapeamento/core/validar-mapa.mjs`.
> Documento canônico que ninguém alcança não governa nada.
