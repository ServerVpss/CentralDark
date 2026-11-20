<!-- CENTRALDARK_AI_DISCOVERY_V1
CANONICAL_AI_ENTRYPOINT=LEIA-ME-IA.md
PORTA_CANONICA_IA=LEIA-ME-IA.md
NETWORK_PORT_IS_NOT_AI_ENTRYPOINT=true
ON_!CALIBRAR_OR_#ACORDAR=READ_LEIA-ME-IA.md_FIRST
-->
<!-- CENTRALDARK_MAPA_VISUAL_SEMANTICO_20261119 -->
**🗺️ Mapa visual semântico — 19/11/2026:** Para o leitor: a Gramática SOL e o mapa dos emojis dão títulos compreensíveis, como 👉 O QUE FAZER AGORA. Logs e APIs mantêm NEXT_CURSOR literal; publicação não comprova consumo do runtime. Fonte de como formular: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml`; apresentação: `docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md`; símbolos: `docs/CONSCIENCIA/PADRAO-EMOJIS.md`. `UNKNOWN` não vira aprovação. Aplicar só as seções necessárias e preservar formatos técnicos.
<!-- /CENTRALDARK_MAPA_VISUAL_SEMANTICO_20261119 -->





<!-- FIX_POINT_7_CANONICAL_REFS_V1 -->
## 🔒 Referências internas — sem cabeçalho obrigatório na conversa

Gatilho único: **!CENTRALDARK** (alias **#CENTRALDARK**). O dono do ciclo é
**docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml**,
seção **fix_point_reference_pack**. Essa tag indexa as **sete fontes canônicas**
sem obrigar o CHEFE a repetir sete links em cada missão. O boot existente
**scripts/trigger-fabric/centraldark_full_trigger_boot.py** lê e verifica
hashes dos sete arquivos; depois consulta o conteúdo pertinente ao objetivo.
Não executa cegamente todas as fases e não confunde presença de arquivo com
compreensão ou prova de runtime.

HUD compacto do ciclo ativo: **🪬 CENTRALDARK — !MICHELIN ⭐⭐⭐**.
As estrelas desse título são **identidade visual, não estrelas conquistadas**.
Michelin de fato = avaliação pelo owner **RULES.md**, com receipts e mesmo SHA.
FIXED_POINT = verificação pelo owner **scripts/lupa/horn-reuse-fixed-point.mjs**,
não pelo cabeçalho. Mostrar os campos internos no HUD apenas quando solicitado; em conversa comum, explicar em linguagem natural.
Status desconhecido = UNKNOWN; sem conexão com o repositório, informar fonte
indisponível e nunca afirmar carregamento automático.

Atualização deste ponteiro: **2026-10-26T21:05:02Z**. Sem segundo router, HUD ou scheduler.
<!-- /FIX_POINT_7_CANONICAL_REFS_V1 -->

## 🔧 Política de entrega atual (CHEFE)

MARCACAO: CHEFE_DIRECT_MAIN_NO_CI_WAIT_20261026
Neste escopo, a CentralDark usa commit e push diretamente na main,
com testes locais pertinentes, readback SHA e receipt; sem aguardar CI
ou squash de PR. SSH direto na VPS quando estiver online; VPS indisponível
não bloqueia edição/versionamento na main. Os gates de PR/squash de
documentos legados são condicionais à trilha de PR — não ao fast path.
Owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
seção current_delivery_policy.



<!-- CENTRALDARK_LIVE_CONNECTION_CIRCUIT_20261026 -->
## 🪬 CentralDark — Circuito Vivo e Skill Mãe (26/10/2026)

**Contrato e receitas:** [CentralDark: Circuito Vivo, Conexões e Realtime](docs/ARQUITETURA/CENTRALDARK-CIRCUITO-VIVO-CONEXOES-20261026.md).
Este contrato vale para Claude, GPT/Codex, Gemini, Hermes e todos os agentes que trabalham na CentralDark. **README é o índice humano; LEIA-ME-IA é a entrada técnica existente; AGENTS, CLAUDE e a Skill Mãe apontam para o mesmo contrato sem duplicar arquitetura.** Documentos detalhados permanecem bibliotecas rastreáveis.

- Ordem de validação: **Cockpit → GitHub main → Casa/VPS → Supabase/Edge/API → retorno ao Cockpit**, com recibo e SHA.
- API de cada conector mantém owner, autenticação, destino, rota e inventário. **Screenpipe nativo na porta 3030**, Cockpit Casa na 8080; rota de produto api/screenpipe é alvo até implantação autenticada e prova.
- **Realtime** só representa evento realmente emitido. Novo **Feed Vivo** está no Sync Center, lendo os ledgers existentes agent_events e hub_mission_events (com RLS), sem promover conexão WebSocket a execução concluída.
- **SSH bidirecional** é testado por ida e volta; VM nova segue a mesma receita e inventaria dependências, sem clonar chaves ou abrir roteador paralelo.
- **Quatro janelas/monitores**: inventário físico por Skill Mãe; WinDisc/desktop virtual => UNKNOWN. Teste opcional Identificar usa função nativa do Windows somente em sessão física e via executor autorizado.
- Mudou: anotar por quê, por quê não outra forma, owner, contrato, timestamp UTC, estado real, última compilação/prova e NEXT_CURSOR. Publicar por owner da Forja existente; **COMMIT != DEPLOYED**.

**Regra de atualização deste índice:** registrar o SHA real do commit/receipt; o estado de outubro é histórico e não descreve automaticamente os runtimes atuais.
<!-- /CENTRALDARK_LIVE_CONNECTION_CIRCUIT_20261026 -->

# 🪬 CentralDark — Instinto Superior

**Uma CentralDark, um comando, vários módulos.** O **Instinto Superior** é a porta administrativa; o **Portal de Módulos** é a vitrine e entrada dos produtos; o **TelePainel** é um módulo dentro desse Portal. Hermes, CentralDarkBot, MCP, Omni Router, Hub de Contas e provedores têm owners internos e **não devem disputar o Admin**.

> **Para agentes e motores:** a única porta de boot da IA é [`LEIA-ME-IA.md`](LEIA-ME-IA.md), com `AGENTS.md` e os contratos da `main`. Este README organiza a identidade do produto; **não substitui os contratos operacionais**.


## Navegação operacional — Casa, Forja 1, GitHub e VPS

> **Raiz descoberta em cada runtime, não por letra de disco.** Identificar a localização real do checkout, validar `git rev-parse --show-toplevel`, o remote Git, o HEAD e o owner consumidor. Histórico físico anterior pertence aos receipts datados; não define o caminho CURRENT da Casa, Hostinger, VM ou VPS. Presença de arquivo ≠ execução, skill carregada ou sync comprovado.

### Por onde uma IA deve começar

| Ordem | Fonte | Por quê |
|---|---|---|
| 1 | [`LEIA-ME-IA.md`](LEIA-ME-IA.md) e [`AGENTS.md`](AGENTS.md) | Boot, autoridade, intenção e segurança. |
| 2 | [Método operacional](.agents/skills/centraldark-operational-method/SKILL.md) | Owner, execução, evidência, contraprova e continuidade. |
| 3 | [Kimetsu](.agents/skills/kimetsu-brainstorm/SKILL.md) | Classificação e técnica antes de agir. |
| 4 | [Hermes](.agents/skills/autonomous-ai-agents/hermes-agent/SKILL.md) e [delegação tipada](.agents/skills/autonomous-ai-agents/hermes-agent/references/centraldark-delegacao-tipado.json) | Reutilizar executor e procedimentos. |
| 5 | [Skill Synchronization](.agents/skills/skill-synchronization/SKILL.md) | Skills opt-in, locks, hashes, proteção contra drift. |
| 6 | [Arquitetura](docs/ARQUITETURA/) e [Memória](docs/CONSCIENCIA/) | Conhecimento, decisões, histórico e receipts. |

**ONE_SYSTEM_ONLY · REUSE_BEFORE_CREATE · ONE_WRITER_PER_SCOPE.** Não duplicar Hermes, MCP, gateway, cockpit, skill-mãe, catálogo ou sincronizador.

### Estrutura versionada (relativa à raiz Git do checkout verificado)

```text
<ROOT_GIT_VALIDADO>/
├── README.md                             # Índice humano
├── LEIA-ME-IA.md                         # Porta técnica de entrada
├── AGENTS.md                             # Contrato dos agentes
├── .agents/skills/
│   ├── centraldark-operational-method/   # Skill Mãe
│   ├── kimetsu-brainstorm/
│   ├── skill-synchronization/
│   └── autonomous-ai-agents/hermes-agent/
├── apps/
│   ├── instinto-superior/                # Cockpit
│   └── modulos/
│       ├── HERMES-CORE/
│       └── mcp/
├── docs/
│   ├── ARQUITETURA/
│   ├── BRAIN/
│   ├── CONSCIENCIA/
│   └── HUD/
├── scripts/
│   ├── casa/
│   └── vps/
├── infra/
└── tests/
```

**Não é mapa de unidades físicas.** Para localizar Obsidian, WSL, backups, perfis e instalações, consultar o owner pertinente no ambiente de destino e obter readback. Não assumir que o diretório do checkout contém todos os dados locais.

Índice **selecionado e verificado**; outras pastas, backups, caches, dados privados e segredos existem, mas não são automaticamente publicáveis ou sincronizáveis.

### Fluxo operacional: Casa ↔ GitHub ↔ VPS

```text
CHEFE / Windows — autoridade e aceite
         ↕
openKylin / FORJA 1 — raiz medida no próprio ambiente ↔ Obsidian / BRAIN
         │ HERMES-CORE + scripts tipados + MCP
         │ POMBO/checksum, testes, receipts, contraprova
         ▼ somente o delta aprovado
Git/GitHub main — CRISTAL (código, documentos, aprendizados)
         ↕ sync por owner, validado em cada sentido
openKylin / VPS — mesmas receitas, readback no destino
```

**Objetivo:** sync automático bidirecional disciplinado, não cópia indiscriminada. Obsidian guarda memória editável da Casa; GitHub mantém cristal versionado após aceite; a VPS executa o que foi efetivamente promovido. Alterações conflitantes conservam ambos os lados; não publicar brutos privados, segredos ou tokens. Checksum prova identidade de bytes; resultado real exige contraprova. A presença dos scripts abaixo **não prova que o sync E2E está rodando agora**.

| Função | Owner existente |
|---|---|
| Golden Capsule / Casa e VPS | [Matriz bidirecional](docs/ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/CENTRALDARK-MATRIZ-BIDIRECIONAL-GOLDEN-CAPSULE.md) |
| Obsidian ↔ BRAIN | [Contrato](docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md) · [script](scripts/casa/sync-hermes-obsidian.ps1) |
| Skills da main ↔ Hermes runtime | [Skill sync](.agents/skills/skill-synchronization/SKILL.md) · [script](scripts/skill-sync-check.sh) |
| VPS ↔ `origin/main` | [Auto-sync VPS](scripts/vps/auto-sync-main.sh) |
| POMBO com checksum / rastro | [Verificador](scripts/verify_pombo_evolution.py) · [Lei do Rastro](docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RASTRO.md) |
| Executor tipado | [HERMES-CORE](apps/modulos/HERMES-CORE/) · [delegação tipada](.agents/skills/autonomous-ai-agents/hermes-agent/references/centraldark-delegacao-tipado.json) |

`SOURCE_PRESENT != RUNNING` · `SYNCED != LOADED` · `COMMIT != DEPLOY` · `UNKNOWN != PASS`.

### Pacote de skills e referência em português

- **Nosso pacote:** [Skill Mãe](.agents/skills/centraldark-operational-method/), localizada por caminho relativo à raiz Git validada, junto com Kimetsu e o owner de sincronização.
- **Complemento externo:** [Hermes Brasil](https://github.com/Hermes-brasil/hermes-brasil) contém `skills/`, `guides/`, README e CONTRIBUTING em português. É fonte de estudo; não substitui o Hermes ou o método da CentralDark.
- **Ciclo de qualquer agente:** boot → intenção → descoberta do owner → estado vivo → menor delta → testes → recibo/contraprova → aceite quando promover → readback Casa/GitHub/VPS.

---

## 🏛️ Mapa de responsabilidades — Instinto Superior primeiro

```text
👑 CHEFE — intenção
     │
     ▼
🪬 INSTINTO SUPERIOR — Admin CentralDark
     ├── 🤖 Hermes: executor original / Loop Mestre / NEXT_CURSOR
     ├── 🧠 CentralDarkBot: interface de agentes e modelos (fork OpenBot; integração pendente)
     ├── 🔐 Contas / Conexões: Hub e OAuth Broker existentes
     ├── 🔌 MCP CentralDark / Omni Router / APIs
     └── 🧿 HUD / Auditoria / Reality Judge

🌐 PORTAL DE MÓDULOS — site dos produtos
     ├── 📟 TelePainel: consultas pelo bot Telegram
     ├── 💬 WhatsApp
     ├── 👥 CRM
     └── 💳 Financeiro
```

**Lei:** `REUSE_BEFORE_CREATE=true`; `ONE_SYSTEM_ONLY=true`; `ONE_WRITER_PER_SCOPE=true`. **Retirar interface antiga não significa apagar serviço, OAuth, banco, sessão, conta ou callback.** Não criar outro gateway/owner para obter o mesmo resultado.

## 🌐 Endereços, código-fonte e realidade observada (11/10/2026)

| Superfície | Responsabilidade / owner | Última medição, sem falso verde |
|---|---|---|
| [admin.centralldark.com](https://admin.centralldark.com/) | **Instinto Superior** — `apps/instinto-superior/`; SSR da VPS em `127.0.0.1:25812`, serviço `centraldark-instinto-superior-web.service` | **PUBLICADO**: `/`, `/auth`, `/cockpit`, `/sala-controle` retornaram HTTP 200. Serviço systemd `active/enabled`; login real **UNKNOWN**. |
| Admin `/health`, `/mcp`, `/tools.json`, `/admin/mcp*` | Compatibilidade MCP existente → `127.0.0.1:9100` pelo Caddy | `/health` retornou **200**; não significa que todas as tools foram testadas. |
| [centralldark.com](https://centralldark.com/) | **Portal de Módulos** — `src/paginas/portal-publico/pages/LandingCentralDark.tsx`, `Portal.tsx` | **REPUBLICAÇÃO PENDENTE**: o domínio respondeu HTTP 200, mas ainda encaminhava à interface legada do AionUi; HTTP 200 não prova o Portal publicado. |
| `/portal`, `/telepainel/dashboard` | Catálogo de produtos e **TelePainel como módulo**, `src/app/rotas/rotas-telepainel.tsx`, `src/funcionalidades/telepainel/` | Código na `main`; publicação autenticada no domínio do Portal **ainda não medida**. |
| [CentralDarkBot](https://github.com/ServerVpss/CentralDarkBot) | Fork do OpenBot; interface de agentes via ACP, com Hermes como executor previsto | **FORK CONFIRMADO; WEB PRÓPRIA E INSTALAÇÃO AINDA NÃO PROVADAS**. Web oficial: `openbot.run/app`, com conta/host do OpenBot. Serviços históricos permanecem fora deste delta de UI. |
| Hub / OAuth / contas | `apps/modulos/hub/`, `apps/modulos/oauth-broker/`, `apps/instinto-superior/src/components/central/ConexoesCentralDark.tsx` | UI e backend com owners existentes; acesso individual a contas e provedores **não presumido**. |
| Omni Router / Zendrive | `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`, launcher existente | **8099 OFFLINE** na última medição; recuperar o owner real PM2/systemd antes de tentar iniciar outro. |

**Verdade da publicação:** o Admin já saiu da origem temporária Lovable e é servido **pela VPS**, com SSR local e Caddy. O build reproduzível do Instinto está na `main` no [commit `7f25ad2`](https://github.com/ServerVpss/CentralDark/commit/7f25ad2a6479d6de80858e345c878bb38b70b0d0) via `npm run build:vps`, corrigindo a dependência circular sem retirar CSRF. Verificar serviço, conteúdo, assets, autenticação e contraprova por rota: **`DOCUMENTED != EXECUTED` e `MERGED != DEPLOYED`**.

### 🧩 Repositórios sem duplicação

- **Fonte canônica:** [`ServerVpss/CentralDark@main`](https://github.com/ServerVpss/CentralDark) — arquitetura e owners vigentes.
- **Portal Lovable/Pivete:** [`ServerVpss/centraldark-central-de-m-dulos@pivete/dev`](https://github.com/ServerVpss/centraldark-central-de-m-dulos/tree/pivete/dev). Landing, Portal e arquivos centrais do TelePainel já foram confrontados por SHA com a `main`; trazer **somente deltas úteis**, não copiar o repositório inteiro.
- **Instinto Superior:** `apps/instinto-superior/`; gestão interna em `PainelAdminCentralDark.tsx` e `ConexoesCentralDark.tsx`.
- **TelePainel:** módulo do Portal, não o nome do ecossistema nem seu Admin. Preservar os contratos específicos de Telegram, UI e autenticação já existentes.

### ⭕ Auréola, método e continuidade

```text
👑 !CENTRALDARK → 🔗 !># INTERLIGADOS → ⭕ !AURÉOLA CANÔNICA
→ 🧿 #ACORDAR → 🎛️ !CALIBRAR → 🧭 !MULTIBÚSSOLA
→ 🔎 !META_LUPA → 🔄 !RECONCILIAR → OWNER EXISTENTE
→ MENOR DELTA → 🧪 TESTE → ⚖️ !CONTRAPROVA
→ ⚖️ REALIDADE → 🧾 !REGISTRA → NEXT_CURSOR → CONTINUAR
```

**Owners:** `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`, `MASTER-CYCLE.yml`, `AUREOLA-BAHIA-BIBLICA.yml`, `HERMES-AUTOCONFIG-RUNTIME.yml`, `apps/modulos/HERMES-CORE/`. A Auréola mostra a rota e os versos como orientação humana, **não substitui logs, HEAD, gates nem runtime medido**. O Hermes é o executor existente; `NEXT_CURSOR` preserva continuidade, sem inventar outro executor.


### 🧿 Casa e missões do HUD — evidência histórica versus estado atual

Os caminhos físicos e hashes medidos em outubro de 2026 pertencem ao histórico, **não são bindings válidos por padrão**. Para preservar a proveniência, consultar o [receipt Corpo Único — T3](docs/CONSCIENCIA/RECEIPTS/2026-10-08-corpo-unico-hud-casa-main-reconciliation.md), o [contrato Obsidian/Casa](docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md) e os receipts específicos da missão. **Este README não fixa letras de unidade ou raízes absolutas da Casa.**

- **Casa, HUD e launchers:** localizar o owner ativo e sua raiz efetiva no runtime; conferir arquivo, hash, processo consumidor e funcionamento. Usar [HUD canônico](docs/HUD/HUD.html) como referência versionada, sem inferir que a cópia física está sincronizada.
- **Obsidian e memória:** o owner prevê cofre privado e espelho em `docs/BRAIN/`, reconciliados por hashes e preservação de conflitos. Não presumir migração física concluída.
- **Perfis e backups:** preservar locais e segredos; nenhuma movimentação automática é autorizada pela leitura deste índice.
- **Admin e produtos:** verificar disponibilidade, autenticação e deploy no próprio destino, sem confundir código publicado, HTTP 200 e funcionalidade pronta.
- **VPS:** medir a árvore Git, alterações pendentes e o runtime efetivo antes de sincronizar ou promover qualquer deploy.

`SOURCE_UPDATED != RUNTIME_SYNCED` · `DEPLOYED != VERIFIED` · `UNKNOWN != PASS`. Os detalhes datados permanecem nos receipts e owners próprios, sem reescrever seus registros históricos.

## 🧪 Workflows e badges — sinais, não provas globais



[![⚙️ CentralDark Valida — determinístico](https://github.com/ServerVpss/CentralDark/actions/workflows/centraldark-validate.yml/badge.svg)](https://github.com/ServerVpss/CentralDark/actions/workflows/centraldark-validate.yml)
[![🤖 Dependabot — radar, compatibilidade e squash seguro](https://github.com/ServerVpss/CentralDark/actions/workflows/dependabot-auto-merge.yml/badge.svg?branch=main)](https://github.com/ServerVpss/CentralDark/actions/workflows/dependabot-auto-merge.yml)
[![🏷️ Status Badge Fabric](https://github.com/ServerVpss/CentralDark/actions/workflows/status-badge-fabric.yml/badge.svg?branch=main)](https://github.com/ServerVpss/CentralDark/actions/workflows/status-badge-fabric.yml)

➡️ [Matriz completa de badges de todos os workflows atuais e futuros](docs/STATUS-BADGES.md)

> **Badges vermelhos continuam visíveis.** Identificar workflow, resultado e SHA antes de corrigir. Não ocultar falha nem promover `queued/pending` a `PASS`.


<!-- CENTRALDARK_SECRET_MVP_POLICY_V1 -->
## 🔐 Secrets — regra global

Owner: `docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md`
Regra MVP consumida: `docs/GOVERNANCA/REGRA-MVP-SECRETS-SEM-FALSO-BLOQUEIO.md`

```text
SECRET_SEEN != BLOCKER
ASK_SANITIZED_COPY_BEFORE_WORK=false
DO_NOT_ECHO_SECRET_VALUE=true
DO_NOT_COMMIT_SECRET_VALUE=true
AUTHORIZED_RUNTIME_MAY_USE_SECRET=true
AUTHORIZED_VAULT_MAY_PRESERVE_SECRET=true
ACCIDENTAL_EXPOSURE_ACTION=ROTATE_POST_ONLINE
LOCAL_TOOL_DENIAL != GLOBAL_BLOCKER
BLOCKER_MUST_NAME_EXACT_TOOL_OR_LAYER=true
AUTHORIZED_ALTERNATE_ROUTE_BEFORE_HUMAN_BLOCKER=true
```

Texto legado conflitante perde para o owner canônico.
<!-- /CENTRALDARK_SECRET_MVP_POLICY_V1 -->


> ⚠️ **DESIGN EM RECONCILIAÇÃO — preservar owners e evitar recoloração automática**
>
> O design **Esmeralda / Sistema 3D Tátil** foi documentado como regra global no período TelePainel; a UI atual do Instinto Superior possui identidade própria, já publicada. Este README **não revoga o owner histórico de design** e **não autoriza recolorir o Instinto**. Manter os tokens existentes onde são usados e resolver a divergência com `docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md`, `.lovable/memory/design/sistema-3d-tatil.md` e o código visual do Instinto, antes de mexer na UI.

> 🎴 **PADRÃO OFICIAL DE NOTIFICAÇÃO TELEGRAM: Card Hermes v1.2**
>
> Toda ação relevante do sistema (deploy, migration, bug corrigido, nova feature, alerta) **DEVE** notificar no Telegram usando o Card Hermes v1.2 — bloco único `<pre>` monoespaçado, fundo preto, enviado pelo connector Telegram.

---

## 🔒 BOOT OBRIGATÓRIO — LUPA BAYESIANA

```text
META_LUPA_BOOT_REQUIRED: SIM
LUPA_USE_RECEIPT_REQUIRED: SIM
SKILL_PATH: .agents/skills/meta-lupa/SKILL.md
SKILL_REF: origin/main
SKILL_IDENTITY_FILE: .agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
```

A identidade vigente da skill é resolvida pelo arquivo canônico acima e validada contra o blob Git real. É proibido copiar um SHA fixo para este adaptador.

A skill `meta-lupa` deve ser carregada conforme o risco/contrato da missão. Sem prova obrigatória aplicável → `BOOT_BLOQUEADO`.

## 🚀 REGRA OBRIGATÓRIA — MICRO-DEPLOY POR PASS COMPROVADO

Toda IA, bot, Hermes, MCP, workflow, plugin ou executor autorizado deve herdar a regra canônica:

```text
CANONICAL_RULE=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-MICRO-DEPLOY-CONTINUO-POR-PASS-COMPROVADO.md
TRIGGER_FABRIC_BINDING=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml
BOT_BINDING=apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml
MEMORY_ANCHOR=docs/CONSCIENCIA/05-APRENDIZADOS/MICRO-DEPLOY-CONTINUO-POR-PASS-COMPROVADO.md

QUALQUER_PASS_COMPROVADO
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO
→ HEALTH_OU_PROVA_RUNTIME
→ RECEIPT_PR_MAE
→ NEXT_TIK_TAK
```

Travas permanentes:

```text
PASS_VISUAL_BADGE_ONLY=false
ACTION_REQUIRED_IS_NOT_PASS=true
UNKNOWN_IS_NOT_PASS=true
LOCAL_PROOF_WITH_RUNTIME_SCOPE_REQUIRES_RUNTIME_PROOF=true
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
REALIDADE_IS_JUDGE=true
```

Essa regra não autoriza restart global, segredo, force-push, blind reset ou deploy fora do escopo. Ela só obriga que o escopo com PASS comprovado avance com prova runtime/receipt quando aplicável.

## 🤖 BOOT UNIVERSAL — QUALQUER IA

Qualquer IA, agente, plugin ou hub que abrir este repositório deve começar por:

1. [`LEIA-ME-IA.md`](LEIA-ME-IA.md);
2. [`AGENTS.md`](AGENTS.md);
3. [`docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`](docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md).

Identidade operacional obrigatória:

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = coordenadora
HERMES = executor, preservação e continuidade
"pivete" regional = vocativo informal; não autoridade técnica
```

O método ativo é: leitores paralelos quando houver ganho, escritor único por escopo, mensagens em delta, histórico preservado e revisão independente quando aplicável. Ao iniciar trabalho técnico ou retomar contexto, a IA emite uma vez o recibo `CENTRALDARK_AI_BOOT` definido na porta universal.

---
> 📖 Especificação completa: [`docs/CONSCIENCIA/PADRAO-CARD-HERMES.md`](docs/CONSCIENCIA/PADRAO-CARD-HERMES.md)

---

## 🎨 Design legado documentado — Esmeralda (Sistema 3D Tátil)

> As instruções abaixo descrevem o sistema visual legado de módulos TelePainel/Hub. A aplicação indiscriminada desse estilo ao Instinto Superior está **em reconciliação com os owners de design**; não fazer migração visual sem medir a interface atual.

Apelido curto: **Esmeralda**. Nome técnico: **Sistema 3D Tátil**.
Inspiração: estilo app nativo (iOS/Android), com pegada Linear · Vercel · CLI tools.

### Identidade visual
- **Paleta**: tema *emerald* (verde esmeralda) como cor primária/accent.
- **Modo padrão**: **light** (claro). Dark theme totalmente suportado.
- **Fontes**: `Geist` (sans) + `Geist Mono` (mono). Nunca usar serif, nunca Inter/Poppins puro.
- **Bordas**: `rounded-xl` / `rounded-lg` em cards e botões.
- **Sensação tátil**: tudo que é clicável afunda 1px ao pressionar (`active:translate-y-[1px]`).

### Utilitários 3D globais (definidos em `src/index.css`)
Usar SEMPRE estes utilitários — nunca recriar sombras manualmente:

| Classe | Uso |
|---|---|
| `shadow-3d` | Sombra 3D padrão (botões/cards destacados) |
| `shadow-3d-soft` | Sombra 3D suave (cards normais, nav items ativos) |
| `shadow-3d-primary` | Sombra 3D na cor primária (CTAs verdes) |
| `shadow-3d-destructive` | Sombra 3D vermelha (ações perigosas) |
| `shadow-3d-pressed` | Estado "afundado" ao pressionar |
| `shadow-side-right` | Sombra lateral (Sidebar e painéis laterais) |

### Tokens semânticos (NUNCA hardcodar cores)
Sempre usar `hsl(var(--primary))`, `bg-card`, `text-foreground`, etc.
Proibido: `text-white`, `bg-black`, `bg-[#...]`, gradientes roxo/índigo genéricos.

### Regra de ouro
> **Nos componentes Esmeralda existentes, preservar os tokens e o contrato visual do próprio componente.**
> Nas telas Esmeralda, reutilizar `.card-premium`, `.nav-item`, `.btn-money`, `shadow-3d-*`; no Instinto Superior, preservar o visual já implementado.

---

## Projeto — fontes e destinos

- **Instinto Superior / Admin:** https://admin.centralldark.com
- **Portal de Módulos (destino):** https://centralldark.com — publicação ainda pendente na função de Portal.
- **Painel de status:** https://status.centralldark.com — consultar saúde separadamente.
- **GitHub canônico:** `ServerVpss/CentralDark@main`.
- **Checkout VPS:** descobrir a raiz Git no runtime autorizado; conferir remote, HEAD, árvore suja, workflows e processo consumidor. **Não pressupor sync automático.**

## 🔏 !RASTRO — LEI DO RASTRO (cadeado obrigatório · owner: `AGENTS.md`)

```text
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
RECEIPTS_OWNER=repository
PR_MOTHER_ROLE=RETIRED
LEGACY_PR_MOTHERS=#1562,#1757
NO_NEW_PR_MOTHER=true
DIRECT_MAIN_MUTATION_REQUIRES_VERSIONED_RECEIPT_WHEN_MATERIAL=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. PRs #1562 e #1757 são históricos; novos receipts pertencem ao repositório. O HUD CURRENT projeta, não substitui o rastro. Sem isso, não aconteceu.


> **Binding vigente (2026-10-04):** `PIVETE` não é papel técnico. `SOL=coordenação`; `HERMES=execução/preservação/continuidade`. Ocorrência operacional antiga deve ser normalizada automaticamente; texto histórico permanece como proveniência.
<!-- Temporary commit from Hermes at 2026-10-17T22:25:36.847708 -->
