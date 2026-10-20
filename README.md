<!-- CENTRALDARK_AI_DISCOVERY_V1
CANONICAL_AI_ENTRYPOINT=LEIA-ME-IA.md
PORTA_CANONICA_IA=LEIA-ME-IA.md
NETWORK_PORT_IS_NOT_AI_ENTRYPOINT=true
ON_!CALIBRAR_OR_#ACORDAR=READ_LEIA-ME-IA.md_FIRST
-->

# 🪬 CentralDark — Instinto Superior

**Uma CentralDark, um comando, vários módulos.** O **Instinto Superior** é a porta administrativa; o **Portal de Módulos** é a vitrine e entrada dos produtos; o **TelePainel** é um módulo dentro desse Portal. Hermes, AionUi, Rakazo, MCP, Omni Router, Hub de Contas e provedores têm owners internos e **não devem disputar o Admin**.

> **Para agentes e motores:** a única porta de boot da IA é [`LEIA-ME-IA.md`](LEIA-ME-IA.md), com `AGENTS.md` e os contratos da `main`. Este README organiza a identidade do produto; **não substitui os contratos operacionais**.

## 🏛️ Mapa de responsabilidades — Instinto Superior primeiro

```text
👑 CHEFE — intenção
     │
     ▼
🪬 INSTINTO SUPERIOR — Admin CentralDark
     ├── 🤖 Hermes: executor original / Loop Mestre / NEXT_CURSOR
     ├── 🧠 AionUi: cockpit de agentes e modelos
     │     └── 🤖 Rakazo: configuração de bots
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
| AionUi / Rakazo | Ferramentas internas do Instinto, serviços históricos `25808` / `25810` | Serviços preservados; **botões e integração não equivalem a login ponta a ponta comprovado**. |
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


### 🧿 Casa e missões do HUD — atualização de evidências (11/10/2026)

> **Rota CURRENT aferida na Casa (11/10/2026, 22:17 BRT):** o vault está em `K:\CentralDark` no SSD, com `K:\CentralDark\.obsidian` presente e `K:\CentralDark\HUD.html` lido diretamente (309.368 bytes; SHA-256 `960F6F23EB07F386E3CABD02DBB696F71777E90A0E087D5157AA1AA802979A5E`). O leitor do **CORPO ÚNICO** em `K:\CentralDark\scripts\CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` foi corrigido para esse caminho e a GUI confirmou `[HUD] PASS` + `[PROVA / ARQUIVO] PASS` no log local. **Isso comprova a rota e o monitor da Casa, não o término integral da migração `F:` → `K:`, o sync do GitHub/Obsidian, nem deploy na VPS.** Endereços antigos `C:\Users\Administrador\Documents\Obsidian Vault`, `F:` e `E:` são legados, não a rota de leitura do HUD. `C:` pessoal preservado.
> **Contraprova técnica:** backup do BAT anterior em `K:\CentralDark\scripts\_backups\CENTRALDARK-CORPO-UNICO-HUD-LOGS.before-k-hud-route-20261012.bat`; leitura física do arquivo, parser PowerShell e reinício de uma única janela PASS; log 11/10 22:17:44 BRT. Código local ainda **não** equivale a checkout `main` sincronizado. Este registro na `main` documenta a correção, não transfere o BAT nem sobrescreve o HUD dourado `docs/HUD/HUD.html`.

A seção **Missões — clica, copia, cola** do único owner [docs/HUD/HUD.html](docs/HUD/HUD.html) foi reconciliada com o README e a leitura física da Casa. **As sete missões continuam abertas por suas cláusulas finais**, mas fatos já comprovados não devem reaparecer como decisões em branco.

- **Casa, scripts e HUD físico:** `K:\CentralDark\scripts\` é a pasta corrente do launcher `CENTRALDARK-ABRIR-TUDO.bat` e do monitor `CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat`; a GUI única agora resolve `K:\CentralDark\HUD.html` e loga esse caminho. O antigo `F:\scripts` e `Downloads\CRISTAL LOGICA\scripts` não devem ser usados como rota corrente. O receipt Corpo Único T3 permanece **histórico**: [receipt Corpo Único — T3](docs/CONSCIENCIA/RECEIPTS/2026-10-08-corpo-unico-hud-casa-main-reconciliation.md).
- **Casa, perfis e garimpo:** `F:\UnifiedRuntime` preserva perfis Segredo/Fulano, com `Fulanoo` físico observado; nenhum perfil foi migrado automaticamente. `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE` não foi encontrado no caminho testado. `F:\_MAPA_CASA` existe, com `chefe-gabinete`, mas a coleção Garimpo precisa de localização própria; não inferir realocação só pelo nome do disco.
- **Obsidian:** a decisão já está no owner [HERMES-CASA-OBSIDIAN-SYNC.md](docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md): cofre privado separado + espelho canônico `docs/BRAIN` por hashes e preservação de conflitos. Implementação no caminho físico/current e sincronização E2E continuam provas independentes.
- **Admin versus produtos:** os endereços e responsabilidades já constam deste README; a missão restante não é redescobrir cockpit, mas **comprovar login/autorização Lovable**. Identidade visual e escolha futura de `centraldark.exe` não são requisito automático para o Admin web funcionar; TelePainel/CRM/Multizap/bot exigem comparação funcional por owner.

**Não promover deploy por esta atualização:** o HUD `/root/CentralDark/docs/HUD/HUD.html` da VPS estava **modificado** (`git hash-object=274ce5bdb9a3c84a4559b1fb8facf4877384e3ea`), checkout `5344bd87074c` com 42 entradas dirty/untracked; o HUD anterior da `main` era blob `196a0bab3e6af2add003864aa49071e5931f6ea5`. O `HUD.html` físico do cofre do Windows tinha SHA-256 `960f6f23eb07f386e3cabd02dbb696f71777e90a0e087d5157aa1aa802979a5e`. **São três superfícies a reconciliar por diff e writer único**, sem reset, overwrite ou alegar mirror já concluído.

`MISION_SOURCE_UPDATED=MAIN_ONLY`; `VPS_HUD_DEPLOY=UNKNOWN`; `CASA_OBSIDIAN_HUD_SYNC=UNKNOWN`; `MISSIONS_GLOBAL_DONE=FALSE`.

**Próximas comprovações:** `AUTHENTICATED_SALA_CONTROLE_SMOKE`; `RESTORE_EXISTING_PORTAL_AND_TELEPAINEL_DEPLOY`; `RECOVER_EXISTING_OMNI_PM2_OWNER`. `UNKNOWN != PASS`; falha local não é falha de toda a CentralDark.

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
- **Checkout VPS:** `/root/CentralDark/` — conferir HEAD, árvore suja, workflows e runtime. **Não pressupor sync automático.**

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
