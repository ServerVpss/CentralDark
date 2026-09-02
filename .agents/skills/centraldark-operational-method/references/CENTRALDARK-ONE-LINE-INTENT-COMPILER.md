# !CENTRALDARK — ONE-LINE INTENT COMPILER

```text
STATUS=CANDIDATE_RUNTIME_PROOF
OWNER=.agents/skills/centraldark-operational-method
ENTRYPOINT=!CENTRALDARK
PR_SCOPE=#1381
NEW_SKILL=false
NEW_ENGINE=false
NEW_OWNER=false
RUNTIME_PROOF_REQUIRED=true
```

## Técnica

O padrão é uma **macro semântica executável com compilação de intenção**: uma linha humana curta referencia um contrato operacional grande e determinístico.

Também pode ser descrito como:

- command compression;
- semantic indirection;
- intent compiler;
- executable operational contract;
- rendezvous macro.

A linha curta **não contém literalmente todo o histórico**. Ela recompõe o contexto a partir de owners canônicos, receipts, estado de sessão, fontes conectadas e medição viva. Portanto, histórico não medido nunca substitui realidade atual.

## Linha humana canônica

```text
!CENTRALDARK
```

Quando SEGREDO/CHEFE dispara essa linha em uma missão operacional, ela significa:

```text
SEGREDO APONTA
→ CENTRALDARK ACORDA
→ CARREGA GOVERNANÇA CANÔNICA
→ REIDRATA FIO/RECEIPTS/OWNERS
→ REMEDE ESTADO VIVO PRIMEIRO
→ TODAS AS FONTES PERCEBEM EM PARALELO
→ RENDEZVOUS NORMALIZA + DEDUPLICA + PRESERVA PROVENIÊNCIA
→ CONTRADIÇÕES SÃO CLASSIFICADAS POR AUTORIDADE DO FATO
→ OWNER EXISTENTE RECEBE SOMENTE O DELTA ÚTIL
→ UM WRITER MUTA SERIALMENTE
→ TESTES
→ META LUPA TENTA QUEBRAR
→ CONTRAPROVA INDEPENDENTE
→ REALIDADE JULGA
→ HEAD REMOTO EXATO É REMEDIDO
→ CI DO MESMO HEAD
→ T1
→ RANDOLF/RECEIPT
→ FIXED POINT
→ LAST_GOOD_STATE
→ CADEADO READ_ONLY
→ SOMENTE PROVA PROMOVE
→ VPS RECEBE ESTADO PROMOVIDO
→ CASA ACELERA/OBSERVA
→ DRIVE/OBSIDIAN/SLACK/FIGMA/SCREENPIPE PRESERVAM OU MOSTRAM
→ TUDO VOLTA PARA UMA ÚNICA CENTRALDARK
```

## Expansão obrigatória da macro

### 1. Realidade antes de memória

Antes de qualquer mutação:

- medir repo/branch/HEAD/PR/worktree/Writer atuais;
- medir runtime relevante quando acessível;
- marcar `UNKNOWN` quando não houver prova atual;
- tratar SHA, print, chat, documento, cache e receipt antigos como histórico até revalidação.

### 2. Territórios da mesma CentralDark

```text
CASA
  E:\CentralDark\Pivete
  E:\CentralDark\Pivete\CentralDark
  E:\CentralDark\sol-desktop-poc

GITHUB
  ServerVpss/CentralDark

WEB
  https://centralldark.com/
  https://api.centralldark.com/
  https://mcp.centralldark.com/admin
  https://mcp.centralldark.com/mcp
```

Regras:

- uma CentralDark;
- nenhum CentralDark V1/V2/V3 como identidade humana;
- versões técnicas de API/schema podem existir sem criar nova identidade;
- `REUSE_BEFORE_CREATE`;
- `ONE_WRITER_PER_SCOPE`;
- `NO_DIRECT_MAIN_WRITE` quando a ferida possui PR/Writer ativo;
- Casa pode hospedar aceleração, sensores e LLM local, sem virar segunda autoridade;
- VPS é candidato a plano de controle always-on somente após prova de equivalência e consumidores.

### 3. Fontes entram no mesmo rendezvous

Percepção paralela permitida:

- GitHub;
- Google Drive;
- Obsidian / segundo cérebro;
- Slack;
- Figma;
- Screenpipe;
- chats/handoffs/receipts;
- filesystem e runtime da Casa;
- runtime VPS;
- CI;
- agents/providers/modelos.

Elas **não votam**. A autoridade depende da classe do fato:

```text
intenção humana        → SEGREDO/CHEFE
código versionado      → GitHub atual
runtime local          → Casa medida
runtime implantado     → VPS medida
UX esperado            → Figma
colaboração            → Slack como trilha
memória/delta          → Drive/Obsidian
observação visual      → Screenpipe
```

### 4. Sincronização não é overwrite cego

`BIDIRECTIONAL` significa reconciliar nos dois sentidos, não copiar por cima.

```text
Casa → Drive    = delta material + redação + provenance + dedupe
Drive → Casa    = revision/hash → candidate → owner → teste
Casa → GitHub   = código testado → mesmo Writer/PR quando mesma ferida
GitHub → Casa   = fetch → preservar delta local → reconciliar
Drive → GitHub  = nunca direto; passa por candidate/test/PR/CI
GitHub → Drive  = lineage/receipt/referência, não espelho bruto obrigatório
```

### 5. Event/Webhook Fabric

O CHEFE não precisa digitar sincronização para cada evento observável.

Eventos GitHub, Drive, runtime local, Slack, Screenpipe e outros owners compatíveis devem entrar no **mesmo Master Cycle**, com:

- idempotência;
- debounce;
- replay guard;
- anti-recursão;
- assinatura/autenticidade quando aplicável;
- fallback para polling controlado apenas quando não houver owner de evento apropriado.

Nenhum segundo event-bus deve ser criado sem gap material provado.

### 6. Apps e motores são braços, não governos

Superfícies candidatas ao mesmo core:

- CentralDark Web/Admin;
- CentralDark Desktop/Bolt;
- SOL Desktop leve;
- CLI Hermes/CentralDark;
- Telegram;
- Builder;
- Hub de contas/conexões.

Motores/conectores substituíveis:

- Claude Code;
- Gemini CLI;
- Codex/ChatGPT;
- GitHub Copilot;
- Grok;
- LLMs locais;
- futuros providers comprovadamente integrados.

Todos devem convergir em API/MCP/router/agent fabric/receipts/fixed-point existentes, sem segundo cérebro.

### 7. Hub de contas

Reutilizar owner OAuth/contas existente. O destino lógico é a própria CentralDark, por exemplo:

```text
UI        /accounts
API       /accounts/*
          /providers/*
          /oauth/*
          /connections/*
```

Não criar um produto paralelo apenas para o Hub.

### 8. UI administrativa / Todo Tree

O conceito de Todo Tree é **somente visual** dentro do Admin/Cockpit:

```text
TODO
FIXME
UNKNOWN
BLOCKED
PROOF
COUNTERPROOF
CANDIDATE
LOCKED
REGRESSION
OWNER
```

Esses marcadores:

- não criam tarefa por si mesmos;
- não mudam owner;
- não provam runtime;
- não promovem estado;
- apenas tornam feridas e gates legíveis.

### 9. CLI e superfícies humanas

Candidato de UX a ser provado no runtime:

- PT-BR como idioma das superfícies operacionais do CHEFE;
- CLI Hermes/CentralDark rica, objetiva e gamificada;
- cabeçalho grande exibindo a cadeia ativa;
- erro material destacado com ícone/cor + causa + owner + caminho + próximo gate;
- Telegram com menus/botões PT-BR quando for owner da mesma capability;
- `UNKNOWN` visualmente diferente de `ERROR`;
- componente apenas desenhado/instalável não é erro.

Cabeçalho desejado:

```text
#ACORDAR → !CENTRALDARK → REMEASURE → RENDEZVOUS → OWNER → EXECUTE → TEST → COUNTERPROOF → REALITY → RANDOLF → FIXED_POINT → LOCK → PROMOTE
```

### 10. Feridas já materializadas nesta sessão e que a macro deve revalidar

Nunca assumir resolvidas sem nova prova:

- PR #1381 como Writer da ferida fixed-point;
- divergência PR/main;
- CI deve ser do HEAD exato;
- Cadeado/Last Good State existe conceitualmente/estruturalmente, mas runtime global precisa ser provado;
- port/route ownership deve incluir território/host/time;
- TTS apresentou mismatch provider/credential; simples troca de provider não é prova de correção;
- cron/jobs apresentaram path drift `scripts\scripts` em evidência histórica e devem ser remedidos;
- Google token/segredos nunca entram em Git/Drive/Slack/receipts;
- Semantic Fabric reutiliza owners existentes; similaridade não é prova;
- `JEITO-CORRETO-DO-PIVETE` pode permanecer como lineage/histórico operacional, mas SEGREDO/CHEFE é autoridade humana final e documentos históricos não a substituem;
- CentralDark.exe, SOL Desktop e Web devem convergir no mesmo core antes de serem chamados E2E;
- Figma/Slack/Drive/Screenpipe são superfícies/fontes, não novas autoridades globais;
- Account Hub deve reutilizar owner existente;
- Survival/restore recebe somente estado consolidado e sem segredos.

### 11. Segurança e segredos

Nunca persistir em Git/Drive/Slack/receipt:

- PAT;
- private keys;
- refresh tokens;
- API keys;
- client secrets;
- dumps de ambiente;
- chain-of-thought privado.

Registrar apenas fato auditável:

```text
fato → evidência → interpretação resumida → decisão → consequência → próximo gate
```

### 12. Gate de contraprova antes de qualquer promoção

Atacar no mínimo:

- HEAD stale;
- Writer duplicado;
- worktree dirty não contabilizado;
- UI verde sem runtime;
- webhook replay/loop;
- overwrite Drive↔Casa;
- segredo exposto;
- port collision;
- TTS provider/key mismatch;
- semantic false positive/stale source;
- identidade humana com V1/V2/V3;
- CI antigo reaproveitado;
- app apontando para core paralelo;
- componente `DESIGN/READY` tratado como erro;
- arquivo LOCKED alterado sem unlock explícito do CHEFE.

### 13. Fixed Point

Somente `FIXED_POINT_PASS` quando, no mesmo alvo relevante:

- objetivo fechado;
- invariantes aplicáveis seguram;
- counterproof sobrevive;
- não existe UNKNOWN material;
- não existe contradição material;
- regressões = 0;
- teste e remoto referem-se ao mesmo HEAD;
- CI exigível do mesmo HEAD passa;
- T1 permanece estável;
- nenhuma informação nova material muda a decisão.

Depois:

```text
FIXED_POINT
→ CONSOLIDATED
→ LAST_GOOD_STATE
→ READ_ONLY LOCK
→ PROMOTABLE
→ PROMOTION EXISTENTE
→ REMEASURE
```

### 14. Condição de parada

```text
STOP_ONLY_ON:
  - FIXED_POINT_PASS
  - BLOCKED_WITH_EXACT_EVIDENCE

DO_NOT_STOP_ON:
  - PLAN_READY
  - FILES_FOUND
  - COMMIT_CREATED
  - PUSH_DONE
  - LOCAL_TEST_PASS
  - UI_UPDATED
  - STARTING
  - CI_PENDING
```

## Contraprova estática antes deste registro

No HEAD pai observado antes desta alteração, o Trigger Fabric já demonstrava estruturalmente:

- `!CENTRALDARK` como `MASTER`;
- expansão da cadeia `ACORDAR → ... → BOOT`;
- aliases humanos convergindo na mesma porteira;
- `#CRISTALIZAR` como phase marker, não novo engine;
- anti-reentry de sessão ativa;
- gatilho negado não ativa missão;
- marker importado por fonte não-CHEFE não ganha autoridade;
- input do CHEFE vira candidate/delta, não fato automaticamente;
- trigger sozinho não autoriza mutação.

Os testes existentes cobrem explicitamente esses casos. Isso prova **compatibilidade estrutural da macro curta com o Trigger Fabric**, mas **não prova runtime da Casa/VPS/Drive/Slack/Figma/TTS/cron/UI/Telegram**.

Portanto este documento entra como:

```text
STATIC_COUNTERPROOF=PASS
RUNTIME_FIXED_POINT=UNKNOWN
PROMOTION_ALLOWED=false
```

## Como usar

Para o CHEFE, a forma comprimida é somente:

```text
!CENTRALDARK
```

A intenção material que vier junto na mesma mensagem é o delta da missão. O sistema deve expandir semanticamente este contrato, medir a realidade atual, reutilizar owners e continuar até `FIXED_POINT_PASS` ou `BLOCKED_WITH_EXACT_EVIDENCE`.

**Uma linha não substitui a realidade; uma linha aponta para o contrato que obriga a realidade a ser medida.**
