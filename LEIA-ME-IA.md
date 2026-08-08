---
title: "LEIA-ME-IA"
status: "CANÔNICO"
scope: "Porta de entrada única para qualquer IA que conectar no CentralDark"
source_of_truth: "Este arquivo"
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
4. `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` — inventário e reutilização obrigatórios antes de propor solução nova;
5. `.agents/skills/meta-lupa/SKILL.md` quando a tarefa for crítica;
6. `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` para provar a identidade vigente da skill;
7. o estado atual comprovado da branch, PR, HEAD e ferramentas aplicáveis.

Nome de modelo não muda a regra. Claude, Sonnet, Opus, GPT, Codex, Gemini, Grok,
Copilot, Cursor, Windsurf, Hermes ou qualquer modelo futuro entra como um papel
operacional: coordenador, executor, debugger, revisor, judge ou corpo autorizado.

### 1.2 Writer portátil — papel estável, modelo substituível

```text
MODEL_IS_REPLACEABLE=true
WRITER_ROLE_IS_NOT_MODEL=true
ONE_WRITER_PER_SCOPE=true
CHIEF_ORDER_CAN_TRIGGER_HANDOFF=true
WRITER_UNAVAILABLE_DOES_NOT_BLOCK_MISSION=true
DETERMINISTIC_FIRST=true
AI_FALLBACK_BY_CAPABILITY=true
UNKNOWN_NEVER_PASS=true
```

O Writer é uma exclusão mútua sobre **escopo**, não uma reserva eterna para um modelo. Sempre separe:

```text
WRITER_ROLE      = função estável (SOL|HERMES|EXECUTOR|OUTRO PAPEL AUTORIZADO)
WRITER_SCOPE     = arquivos/serviço/branch sob posse de escrita
WRITER_INSTANCE  = sessão/agente/modelo atual, substituível
MODEL/PROVIDER   = telemetria/capacidade, nunca autoridade
```

Se o Writer atual está vivo e possui delta ainda não entregue, outro executor fica `READ_ONLY/JUDGE`. Se ele terminou, está offline, perdeu sessão, ficou sem quota, recebeu `429/402`, timeout ou outra indisponibilidade, capture HEAD + branch + dirty/uncommitted state, preserve qualquer delta existente e faça `WRITER_HANDOFF` para outra instância capaz. **Não espere um modelo específico voltar quando o estado pode ser transferido com segurança.**

Uma ordem atual de `SEGREDO/CHEFE` pode iniciar o handoff imediatamente. A ordem humana vence snapshot/model-lock antigo, mas não cria dois Writers simultâneos: primeiro capture e preserve o estado, depois transfira a posse e continue.

Quando a tarefa depender de IA, o caminho é:

```text
DETERMINÍSTICO PRIMEIRO
→ definir capacidade necessária
→ preferir modelo/provider forte e saudável (GPT-5.5 quando disponível e adequado a tarefa crítica)
→ se indisponível, cair para o próximo modelo/provider configurado e capaz
→ preservar mission_id + scope + HEAD + evidência
→ 429|402|TIMEOUT|OFFLINE|UNKNOWN != PASS
```

Falha de uma IA não é bloqueio global se outra consegue cumprir o mesmo contrato. Se nenhuma rota capaz existir, o estado é `BLOCKED/UNKNOWN`, nunca sucesso inventado.

Ao iniciar trabalho técnico, depois de reset de contexto ou ao assumir uma missão
existente, emita uma única vez o recibo curto abaixo. Não repita em toda mensagem:

```yaml
CENTRALDARK_AI_BOOT:
  governance: LOADED
  github_dictionary: LOADED
  delta_method: LOADED
  context_reconciliation: LOADED
  history_preservation: ACTIVE
  source_of_truth: "ServerVpss/CentralDark"
  observed_evidence: "estado medido agora (branch, HEAD, PR, worktree) — insumo operacional, nunca autoridade canônica"
  alignment: "SEGREDO/CHEFE > SOL/COORDENADOR > PIVETE/HERMES + ESPECIALISTAS"
  role: "COORDINATOR|EXECUTOR|DEBUGGER|REVIEWER|JUDGE|HERMES|READ_ONLY"
  writer: "NONE|nome-do-escritor-atual"
```

Este recibo prova carregamento do contrato e do vocabulário. Ele não prova identidade pessoal, não
concede permissão e não substitui teste, log, diff, check ou autorização de SEGREDO/CHEFE.

Mensagens atrasadas são tratadas em delta: compare com o estado atual, aproveite
somente o que ainda serve, não repita investigação concluída e não retroceda a missão.

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
→ executar a ação mínima autorizada
→ apontar o local, o resultado e a validação
→ não criar swarm, missão Delta, documento, matriz formal ou investigação ampla sem necessidade

PROBLEMA AMPLO, INCERTO, LONGO OU COM VÁRIAS CAMADAS
→ Delta/Hermes coordena a missão
→ leitores independentes investigam em paralelo quando houver ganho real
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

### 2.2 Reconciliação obrigatória antes de criar

`REUSE_BEFORE_CREATE_REQUIRED`

Antes de propor código, arquitetura, skill, workflow, plugin, serviço, cofre ou processo novo, a IA deve executar internamente:

```text
INTENÇÃO DO CHEFE
→ BUSCAR CAPACIDADES EXISTENTES
→ ABRIR OS ARQUIVOS PRINCIPAIS DA IMPLEMENTAÇÃO
→ CRUZAR CADA CAPACIDADE COM O PEDIDO ATUAL
→ CLASSIFICAR: CANÔNICO | OPERACIONAL | CANDIDATO | SOMENTE PROGRAMA | HISTÓRICO | UNKNOWN
→ REUTILIZAR OU ESTENDER MINIMAMENTE
→ CRIAR SOMENTE COM GAP REAL PROVADO
```

Encontrar um arquivo e não reconhecer que ele atende ao pedido é:

```text
BOOT_BLOQUEADO=FALHA_DE_RECONCILIACAO_DE_CONTEXTO
```

Um PR aberto ou Draft, plano, prova formal ou documento de programa é contexto. Ele só governa a execução atual quando sua autoridade vigente estiver explicitamente comprovada. Caminho existente não prova runtime; runtime ausente também não autoriza duplicar um componente já canônico.

Para tarefa simples, é proibido substituir execução por tratado, equação, matriz de fases, novo plano ou nova arquitetura sem solicitação do CHEFE. O preflight é interno por padrão; não deve virar formulário nem trabalho manual para o usuário.

Contrato legível por máquina: `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`.

### 2.3 Regra do Acusador/Apontador

Todo erro relevante deve deixar uma cadeia causal verificável. Não basta dizer “está quebrado”.

```text
ERRO_EXATO=
ACUSADOR_APONTADOR=
EVIDENCIA_DO_ACHADO=
CAMINHO_ONDE_CAIU=
COMMIT_INTRODUTOR=
IDENTIDADE_COMPROVADA=
NIVEL_DE_PROVA=WRITER_TRAILER|AUTOR_GIT|INFERENCIA|UNKNOWN
ATIVADOR_DO_BUG=
IMPACTO=
WRITER_RESOLUTOR=
CORRECAO_MINIMA=
CONTRAPROVA=
```

Papéis:

```text
ACUSADOR/APONTADOR
= quem encontrou o erro e apresentou a prova.

INTRODUTOR DO DEFEITO
= commit e caminho que inseriram a condição defeituosa.

ATIVADOR DO BUG
= mudança que tornou a incompatibilidade executável ou observável.

WRITER RESOLUTOR
= Writer único atual do escopo que materializa a correção.
```

Regras permanentes:

- encontrar o erro não transforma o apontador em Writer;
- quem errou não ganha automaticamente o direito de corrigir;
- o erro não escolhe o Writer: o escopo escolhe, salvo handoff explícito;
- trailer `Writer:` válido prova identidade operacional;
- commit antigo sem trailer prova apenas autor/committer Git, nunca o modelo ou a sessão real;
- `INFERENCIA` e `UNKNOWN` nunca podem ser apresentados como autoria comprovada;
- uma incompatibilidade pode ter um introdutor e outro ativador; os dois devem ser localizados quando a história provar essa divisão;
- toda correção deve preservar o artefato existente, evitar versões paralelas e terminar com teste ou contraprova que impeça repetição;
- a atribuição serve para localizar, corrigir e aprender; não para humilhar agente ou criar ringue entre IAs.

Fluxo obrigatório:

```text
QUEM APONTOU
→ ONDE O ERRO CAIU
→ QUAL COMMIT INTRODUZIU
→ QUAL MUDANÇA ATIVOU
→ QUAL IDENTIDADE FOI REALMENTE PROVADA
→ QUEM É O WRITER RESOLUTOR
→ QUAL CORREÇÃO MÍNIMA FOI APLICADA
→ QUAL TESTE IMPEDE A REPETIÇÃO
```

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
não para toda conversa nem para toda correção simples.

Duas extensões dela, para casos específicos, quando estiverem instaladas:

- **auditoria-pr** — antes de dar veredito sobre um PR;
- **selo-xp** — antes de fechar missão e reivindicar XP.

---

## 5. Onde está o resto

| Preciso de… | Vá para |
|---|---|
| vocabulário e permissões do GitHub no jeito da casa | `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md` |
| contrato para reconciliar contexto antes de criar | `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` |
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
> Documento canônico que ninguém alcança não governa nada.
