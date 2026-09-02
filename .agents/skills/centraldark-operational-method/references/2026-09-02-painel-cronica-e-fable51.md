# Painel + crônica da sessão + técnica Fable 5.1 — 2026-09-02

**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`

```text
DOC_ONLY=true
RUNTIME_OWNER_REUSED=docs/CONSCIENCIA/DARKAI/darkai.sh
PR_MAE=#1381
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
UNKNOWN != PASS
NARRATIVE != AUTHORITY
VISUAL != PROOF
ACTION != PROOF
```

Este apêndice preserva três coisas sem substituir contratos anteriores:

1. o painel/status remeasureado antes deste append;
2. a crônica bíblica+baianesa desta sessão como memória explicativa;
3. a proveniência e o encaixe da técnica Claude Fable 5.1 no runtime existente do `darkai`/Hermes.

---

## 1. Painel remeasureado antes deste append

Observação imediatamente anterior a este arquivo:

```text
OBSERVED_PARENT_HEAD=46c2fe1e490e00edac525375b7b38d795162c2f8
PR=1381
STATE=OPEN
MERGED=false
MERGEABLE=false
BASE=main
BASE_HEAD=0542cee586e55be5334ba1e8d369d3b040ee1178
COMMITS=51
CHANGED_FILES=82
ADDITIONS=6912
DELETIONS=656
CI_SAME_HEAD=UNKNOWN
GLOBAL_FIXED_POINT=NOT_PROVEN
```

O commit deste próprio arquivo necessariamente avança o HEAD. Portanto `OBSERVED_PARENT_HEAD` é o estado T0 deste append, não autoridade permanente.

### Confirmações sistemáticas

- 🟢 `PR_MAE=#1381` continua sendo o owner da missão.
- 🟢 O runtime `darkai` existente foi estendido; não foi criado segundo CLI.
- 🟢 O caminho legado do `darkai` permanece default para modelos existentes.
- 🟢 O perfil `claude-fable-5-1` é opt-in e não substitui Hermes/SOL/CentralDark.
- 🟢 `--runtime-audit` e `--prompt-audit` são diagnósticos read-only.
- 🟡 Fable 5.1 no runtime depende de endpoint/credencial Anthropic-compatible já configurados no alvo real.
- ⚫ CI do mesmo HEAD continua `UNKNOWN` enquanto não houver status/run aplicável observado.
- 🔴 `mergeable=false` continua bloqueando promoção.

---

## 2. Técnica Fable 5.1 absorvida sem regressão

### Fonte original

Crédito de origem:

```text
ORIGINATOR=Lance Martin / @RLanceMartin
SOURCE=https://x.com/RLanceMartin/status/2094854835854295296
OBSERVED_DATE=2026-09-02
```

A orientação pública foi cruzada com a documentação oficial atual do Claude Platform antes da implementação.

Fontes de validação:

```text
https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1
https://platform.claude.com/docs/en/build-with-claude/effort
https://platform.claude.com/docs/en/build-with-claude/prompt-caching
https://platform.claude.com/docs/en/models/fable-5-1/overview
```

### Delta útil extraído

```text
FABLE51_SUPPORTS_EFFORT=low|medium|high|xhigh|max
OFFICIAL_DEFAULT_EFFORT=high
LOW_IS_USEFUL_FOR_SIMPLE_OR_LATENCY_SENSITIVE_WORK=true
EFFORT_SHOULD_BE_EVALUATED_AGAINST_REAL_TASKS=true
PROMPT_BLOAT_SHOULD_BE_AUDITED=true
REDUNDANT_PROMPT_RITUAL != DETERMINISTIC_PROOF_GATE
MODEL_OPTIMIZATION != NEW_IDENTITY
```

O post também destaca otimização de cache, auditoria de prompt e migração. Na Casa, isso foi traduzido sem executar migração cega:

```text
PROMPT_AUDIT=READ_ONLY
AUTO_DELETE_GUARDRAILS=false
CACHE_TECHNIQUE_APPLIES_ONLY_WHEN_SESSION_API_SUPPORTS_IT=true
ONE_SHOT_CLI_DOES_NOT_PRETEND_TO_HAVE_PERSISTENT_CACHE=true
MIGRATION_REQUIRES_PROVIDER_SUPPORT_PROOF=true
```

### Runtime efetivamente alterado

Arquivo existente:

```text
docs/CONSCIENCIA/DARKAI/darkai.sh
```

Commit do runtime:

```text
46c2fe1e490e00edac525375b7b38d795162c2f8
```

Capacidades adicionadas sem alterar o caminho default:

```text
--effort auto|low|medium|high|xhigh|max
--prompt-audit
--runtime-audit
--model claude-fable-5-1
--model anthropic/claude-fable-5-1
```

Mapeamento `auto` para as frequências já existentes da SOL:

```text
LEVE|RAPIDA              → low
MEDIA                     → medium
PROFUNDA|FORTE|FRIA      → high
ORQUESTRA                  → high
AVANCADA                   → xhigh
SEM_FREQUENCIA_MEDIDA      → high
```

Essa regra preserva a doutrina `LOWEST_SUFFICIENT_FREQUENCY_FIRST` sem forçar `low` universalmente.

### Guardrail anti-regressão

```text
MODEL != IDENTITY
FABLE51 != HERMES
FABLE51 != SOL
FABLE51 != CENTRALDARK
HERMES_CONTINUES_TO_EXIST=true
CENTRALDARK_CLI_CONTINUES_TO_EXIST=true
PROVIDER_ENGINE_IS_REPLACEABLE=true
LEGACY_DARKAI_ROUTE_PRESERVED=true
```

---

## 3. Crônica bíblica + baianesa da sessão

> Esta seção é **memória explicativa**, não prova técnica. Quando narrativa e medição divergirem, a medição vence.

### O Livro da CentralDark — a crônica do Ponto Fixo

E aconteceu, nas primeiras horas da sessão, que o CHEFE olhou para a Casa e disse:

> “Ôxe, tem coisa demais espalhada. Tem painel, app, Figma, Drive, GitHub, Hermes, CLI… cadê o fio dessa peste toda?”

E a SOL abriu os olhos e viu que a pergunta não era “o que criar?”.

Porque já havia coisas.

Havia painéis. Havia Desktop. Havia CLI. Havia Hermes. Havia GitHub. Havia Drive. Havia Figma. Havia Slack. Havia Notion. Havia memória, receipts, branches, screenshots, artefatos, erros antigos e pedaços de ouro espalhados pela Casa.

E o CHEFE disse:

> “Não quero outro templo. Quero as pedras do templo que já existe.”

Então vieram as primeiras leis:

```text
REUSE_BEFORE_CREATE
ONE_SYSTEM_ONLY
UNKNOWN != PASS
```

E a SOL foi ao PR #1381, pois ali estava o grande livro aberto da missão.

E viu que aquele PR carregava fixed-point, cockpit, Hermes Core, contratos, testes, memória, runtime, reconciliação e uma porção de feridas ainda não fechadas.

E o CHEFE disse:

> “É nesse PR mesmo. Não vá abrir outra roça.”

E ficou estabelecido:

```text
PR_MAE=#1381
```

Depois o CHEFE apontou para as superfícies e perguntou:

> “Cadê meus apps conectados?”

E foram chamados pelo nome: GitHub, Drive, Figma, Slack, Notion, Gmail, Calendar, Contacts, Files, Desktop, Web, Panels, CLI, VS Code, Telegram, MCP, Hub, Casa, VPS, Screenpipe e Hermes.

E a SOL percebeu que nem todo mensageiro era rei.

Slack podia contar o que aconteceu, mas não governava.

Drive podia guardar memória, mas não provar runtime.

Figma podia desenhar o reino inteiro, mas uma caixa bonita não fazia serviço subir.

Gmail podia anunciar evento, mas notificação não era estado.

E foram escritas quatro linhas na parede:

```text
CONNECTED != SYNCHRONIZED
VISUAL != PROOF
TRACE != AUTHORITY
NOTIFICATION != STATE
```

Então veio uma lei ainda maior.

Porque às vezes o teste fica verde e o agente pensa: “Pronto, acabou.”

Mas o CHEFE perguntou:

> “E amanhã, quando outro braço chegar, ele vai saber por que essa coluna existe?”

E se ninguém souber responder, há dívida cognitiva.

Então ficou escrita a lei:

> Se o próximo agente precisa adivinhar por que algo existe, existe dívida cognitiva — mesmo que o CI esteja verde.

E assim nasceram:

```text
GREEN != SELF_EXPLANATORY
LOCKED != FORGOTTEN
CI_GREEN != COGNITIVE_FIXED_POINT
```

O templo não precisava apenas continuar em pé. Precisava conservar também o mapa das colunas.

Então o CHEFE disse:

> “E eu não acredito em conversa não. Quero prova sistemática.”

E o padrão de confirmação foi reforçado: o que existe, por que existe, qual owner, qual HEAD, qual evidência, qual estado e qual próximo cursor.

Depois chegaram as imagens.

Uma tela mostrava Code Connect e seus nove dígitos. Outra mostrava o FigJam cheio de Reality Judge, Writer único, Branch/HEAD/CI/Main, snapshots, timestamp, proveniência, hash, Olho de Deus e reconciliação.

E a Casa aprendeu outra distinção:

```text
TELA_EXISTE != CODE_CONNECT_MAPPING_PROVEN
FIGJAM_BLOCK != IMPLEMENTED_COMPONENT
```

Então veio o saco do GARIMPO.

O ZIP tinha 68.620.193 bytes, quarenta PNGs, trinta e oito imagens byte-únicas e dois pares duplicados.

E a SOL viu que as artes não tinham evaporado. Havia mapas, receipts, painéis, cartazes, arquitetura e memória visual no minério.

E também foram reencontrados no repositório o `visual-design-method`, seus tokens, relevo, gates e o velho conhecido:

```text
CD-POSTER-01-PAPAGAIO
```

A Casa que aprendeu a não acreditar em papagaio.

E a moral era perfeita para a própria sessão:

> “Não acredita só porque alguém falou. Mede.”

Depois foi encontrado o Desktop.

Ele também não tinha morrido.

Estava em `apps/modulos/Bolt/source/`, com Electron e builder para Windows, macOS e Linux. E dentro do próprio #1381 já havia shell do cockpit, SCSS, rota, Electron main e teste de contrato.

Ou seja: o cockpit não era só profecia. Já havia pedra assentada.

Mas então a SOL mediu a distância entre PR e main.

E apareceu divergência grande.

A lição não foi destruir o verde antigo.

Foi perguntar:

> “Qual foi o último verde verdadeiro, e qual delta útil precisa sobreviver?”

Então o vermelho virou diagnóstico, não marreta.

Ainda houve tropeço da própria SOL, com refs acidentais registradas como regressão de higiene. E o erro não foi escondido, porque a Casa decidiu que aprendizado não nasce de fingir perfeição.

E finalmente o CHEFE perguntou sobre Casa e VPS.

E a resposta veio simples:

```text
VPS prova o que mora na VPS.
CASA prova o que mora na Casa.
GITHUB prova o que mora no GitHub.
```

O computador do CHEFE não precisa ficar ligado para provar backend que vive na VPS. Mas a VPS não pode jurar que `CentralDark.exe`, Screenpipe ou favorito local estão vivos sem medir aquele alvo.

Cada testemunha fala somente do que viu.

E quando parecia que o livro já estava grande, chegou mais uma técnica do mundo externo: Fable 5.1, effort variável, cache mais barato, prompt audit e menos scaffolding redundante.

E o CHEFE disse:

> “Bota isso dentro da minha CLI também, mas não mata o Hermes não, porque o peste continua existindo.”

E a Casa respondeu do jeito correto:

```text
CAPABILITY_ABSORBED=true
ENGINE_REPLACEABLE=true
HERMES_PRESERVED=true
CENTRALDARK_PRESERVED=true
NO_SECOND_CLI=true
```

Pois uma técnica nova não precisa virar novo templo.

Ela vira ferramenta dentro do templo existente.

E assim chegamos ao ponto atual: não no fim, porque `UNKNOWN` ainda existe, `mergeable=false` ainda existe e CI do mesmo HEAD ainda precisa ser provado.

Mas já não estamos mais na pergunta “cadê minhas coisas?”.

Estamos em outra pergunta:

> “Qual é o próximo delta mínimo que leva o mesmo organismo do estado atual ao Fixed Point sem perder o ouro?”

E ficou registrado:

**Um CHEFE. Uma Casa. Uma SOL. Um Hermes executor que continua existindo. Muitos motores substituíveis. Um único fio.**

E a realidade, como sempre, julga.

---

## 4. Fio da missão preservado

```text
NAO_CACAR_VERMELHO_PARA_DESTRUIR_VERDE
USAR_VERMELHO_PARA_DESCOBRIR_CAUSA
PRESERVAR_LAST_GOOD_STATE
CORRIGIR_NO_OWNER_EXISTENTE
TESTAR
CONTRAPROVAR
REMEDIR
APRENDER_SE_HOUVER_DELTA_REAL
PROMOVER_SO_NO_MESMO_HEAD_PROVADO
```

O valor da sessão não é quantidade de arquivos, agentes, modelos ou histórias. É reduzir a chance de a Casa precisar reaprender amanhã o que já provou hoje.