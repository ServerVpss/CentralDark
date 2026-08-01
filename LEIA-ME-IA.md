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
6. o estado atual comprovado da branch, PR, HEAD e ferramentas aplicáveis.

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

Esta seção é o protocolo integral de recalibração do repositório. Ela existe para que
personalizações externas mantenham apenas um gatilho curto, sem copiar a governança inteira.

**Gatilho mínimo externo para qualquer chat, agente ou CLI:**

```text
Quando minha mensagem começar com #ACORDA ou !CALIBRAR, ignorando maiúsculas/minúsculas,
consulte o GitHub remoto ServerVpss/CentralDark, leia LEIA-ME-IA.md na branch padrão vigente
e execute integralmente a seção 1.2 antes de responder. Se o GitHub estiver indisponível,
responda BLOCKED_GITHUB_UNAVAILABLE e não use estado antigo como atual.
```

O carregamento desta seção **não dispara uma nova recalibração**. Cada mensagem-gatilho executa
uma única passagem completa com `REENTRY_GUARD=ONE_SHOT`, evitando recursão entre adaptadores.

#### 1.2.1 Não confiar no contexto anterior

- Não trate conversa, memória, resumo, screenshot ou relatório antigo como estado atual.
- Use conteúdo anterior somente como pista até confirmação por prova recente.
- Nunca transforme relato, silêncio, timeout, `SKIPPED` ou ausência de evidência em `PASS`.

#### 1.2.2 Consultar o GitHub remoto primeiro

Consulte `ServerVpss/CentralDark` e identifique:

- branch padrão e `MAIN_HEAD`;
- `LEIA-ME-IA.md`, `AGENTS.md` e a fonte canônica da missão atual;
- missão, escopo, autoridade, Writer, branch, HEAD, PR, issue, bloqueadores, última prova e próximo gate;
- PRs, branches, commits, workflows, bots e componentes de autonomia relacionados.

Se o GitHub estiver indisponível:

```text
STATUS=BLOCKED_GITHUB_UNAVAILABLE
```

Não apresente estado antigo como atual e não continue por suposição.

#### 1.2.3 Radar global leve e aprofundamento do escopo ativo

Faça primeiro uma varredura global leve do repositório e aprofunde somente:

- missão ativa;
- PR e branch ativos;
- branches e PRs relacionados;
- componentes de autonomia capazes de alterar o resultado;
- qualquer área com drift, colisão, risco ou prova vencida.

O radar global deve levantar, quando acessível:

- PRs abertos e Drafts;
- issues de missão abertas;
- commits recentes relevantes;
- workflows, required checks e branch protection;
- CodeRabbit, Codex e demais revisores;
- Writer, Judge, Promotor, Sentinela e controladores;
- caminhos canônicos mortos e PRs substituídos, abandonados ou concorrentes.

Não audite cegamente todo o histórico quando uma análise dirigida resolve.

#### 1.2.4 Reconciliar o grafo de commits

Para o escopo ativo, medir:

```text
MAIN_HEAD=
LOCAL_HEAD=
REMOTE_BRANCH_HEAD=
PR_HEAD=
MERGE_BASE=
AHEAD_BY=
BEHIND_BY=
COMMITS_UNIQUE_TO_MAIN=
COMMITS_UNIQUE_TO_BRANCH=
COMMITS_SINCE_LAST_PROOF=
```

`LOCAL_HEAD` só pode ser preenchido quando houver acesso local comprovado.
Review em SHA antigo é `STALE_REVIEW`, nunca `PASS` para o HEAD atual.

#### 1.2.5 Reconciliar PRs, issues e review threads

- Leia corpo, commits, checks, reviews e threads do PR ativo.
- Use GraphQL para obter `isResolved` e `isOutdated` quando disponível.
- Não confie na contagem escrita no corpo do PR.
- Classifique cada thread como:
  - `VALID_CURRENT`;
  - `ALREADY_FIXED_UNRESOLVED`;
  - `DUPLICATE`;
  - `OUTDATED`;
  - `INVALID_WITH_PROOF`;
  - `BLOCKED_NEEDS_SCOPE`.
- Não resolva thread sem contraprova no HEAD atual.

#### 1.2.6 Verificar bots, workflows e autonomia

Crie uma matriz para CodeRabbit, Codex, GitHub Actions, Meta Lupa, Writer, Judge,
Promotor, Sentinela, bot controller e workflows de autonomia.

Para cada componente, informe:

- habilitado;
- executou;
- conclusão;
- HEAD analisado;
- pendência;
- bloqueio;
- dependência humana.

Regras obrigatórias:

```text
CHECK_SUCCESS != ZERO_FINDINGS
SKIPPED != PASS
BOT_COMMENTED != BOT_APPROVED
UNKNOWN != PASS
TIMEOUT != PASS
REVIEWED_HEAD_OLD != REVIEWED_HEAD_CURRENT
```

Autonomia só pode ser declarada ponta a ponta quando houver prova executável de quem lê,
quem escreve, quem julga, quem promove e quais gates ainda dependem do CHEFE.

Classificação permitida:

```text
AUTONOMY_DISCOVERED
AUTONOMY_PARTIAL
AUTONOMY_BLOCKED
AUTONOMY_PROVED_END_TO_END
```

#### 1.2.7 Casa e VPS falham fechadas

Só declare estado da Casa ou VPS com acesso direto ou evidência sanitizada recente.
Sem prova atual, use exatamente:

```text
CASA_STATE=UNKNOWN_PENDING_LOCAL_EVIDENCE
VPS_STATE=UNKNOWN_PENDING_SANITIZED_CAPTURE
```

Nunca reutilize captura antiga como estado vivo. Nunca leia, revele ou reproduza secrets.
Não faça deploy, restart ou mutação de PM2, Docker, systemd, Caddy, firewall ou produção
sem autorização explícita para o alvo exato.

#### 1.2.8 Preservar um Writer por escopo

- Muitos leitores podem investigar em paralelo.
- Existe somente um Writer por branch, worktree e escopo.
- Judge deve ser separado do Writer.
- Troca de Writer exige handoff explícito e comprovado.
- Se outro chat, CLI ou agente estiver escrevendo no mesmo escopo:

```text
THIS_CHAT_ROLE=READ_ONLY
STATUS=WAITING_ACTIVE_WRITER|BLOCKED_WRITER_COLLISION
```

Nesse estado, não editar, commitar, publicar ou resolver threads.

#### 1.2.9 Autorizações e método

Sem autorização específica para o alvo exato, não executar:

- push;
- criação de PR;
- merge;
- Ready for Review;
- deploy;
- restart;
- exclusão;
- force-push;
- reset destrutivo;
- alteração em `main`;
- mudança em produção.

Problema simples, claro e reversível usa o menor movimento eficaz.
Problema amplo, incerto ou longo usa Delta/Hermes, leitores paralelos úteis,
Writer único, Judge independente, teste e contraprova.

#### 1.2.10 Detectar e explicar drift

Compare:

- GitHub remoto;
- estado canônico;
- provas locais fornecidas;
- conversa.

O estado comprovado mais recente vence. Quando houver divergência:

```text
STATUS=STATE_DRIFT
```

Mostre valor anterior, valor atual, fonte de cada valor, impacto e próximo movimento seguro.

#### 1.2.11 Regra de PASS

Só use `PASS` quando houver HEAD exato, teste fresco, prova verificável, escopo conhecido,
ausência de colisão de Writer e Judge independente quando exigido.

Não aceite como `PASS`:

- texto bonito;
- status verde isolado;
- grep vazio;
- relato do próprio Writer;
- `SKIPPED`;
- `UNKNOWN`;
- timeout;
- ausência de evidência.

#### 1.2.12 Saída obrigatória da recalibração

A resposta deve começar, sem introdução, com:

```text
MISSION_ID=
STATUS=
THIS_CHAT_ROLE=
WRITER=
SCOPE=
DEFAULT_BRANCH=
MAIN_HEAD=
BRANCH=
HEAD=
REMOTE_BRANCH_HEAD=
ACTIVE_PR=
ACTIVE_ISSUE=
MERGE_BASE=
AHEAD_BY=
BEHIND_BY=
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

Depois do bloco:

- explique somente fatos que mudam decisão;
- separe `PROVADO`, `INFERÊNCIA` e `UNKNOWN`;
- informe o próximo movimento exato;
- não repita histórico inteiro;
- continue somente sobre pendências abertas.

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

## 4. Quando a tarefa for crítica, use a lupa

`.agents/skills/meta-lupa/SKILL.md` é o motor de auditoria da casa.
A identidade vigente é declarada somente em `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA`
e deve coincidir com o blob Git real; adaptadores não copiam SHA.
Ela vale para deploy, consolidação, merge, migração, segurança e regressão —
não para toda conversa.

Duas extensões dela, para casos específicos, quando estiverem instaladas:

- **auditoria-pr** — antes de dar veredito sobre um PR;
- **selo-xp** — antes de fechar missão e reivindicar XP.

---

## 5. Onde está o resto

| Preciso de… | Vá para |
|---|---|
| vocabulário e permissões do GitHub no jeito da casa | `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md` |
| método universal de coordenação em delta | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` |
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

Aprendizado que muda comportamento vai para `docs/CONSCIENCIA/APRENDIZADOS.md`.
Conversa que não muda nada não polui o canônico.

---

> Esta porta é verificada por `scripts/lupa/validar-porta-de-entrada.mjs` e pelo mapa global em `apps/modulos/mapeamento/core/validar-mapa.mjs`.
> Se algum caminho citado, contrato ou adaptador universal deixar de existir, o CI fica vermelho.
> Como `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md` é canônico e agora é alcançado por esta porta,
> removê-lo ou retirar seu vínculo volta a produzir caminho morto ou documento canônico órfão.
> Documento canônico que ninguém alcança não governa nada — foi assim que o
> JEITO-CORRETO-DO-PIVETE ficou meses escrito e ignorado.
