<!-- CENTRALDARK_AI_DISCOVERY_V1
CANONICAL_AI_ENTRYPOINT=LEIA-ME-IA.md
PORTA_CANONICA_IA=LEIA-ME-IA.md
NETWORK_PORT_IS_NOT_AI_ENTRYPOINT=true
ON_!CALIBRAR_OR_#ACORDAR=READ_LEIA-ME-IA.md_FIRST
-->

# CentralDark — TelePanel

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


> ⚠️ **TEMA OFICIAL DO SISTEMA: "Esmeralda" (Sistema 3D Tátil)**
>
> Este é o padrão visual **definitivo** de todo o ecossistema CentralDark.
> Qualquer agente (IA ou humano) que editar este projeto **DEVE manter** este tema em toda nova tela, componente ou módulo. Não trocar paleta, não trocar fontes, não trocar estilo de sombras.

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
PIVETE/HERMES = executor, preservação e continuidade
"pivete" regional = vocativo informal; não autoridade técnica
```

O método ativo é: leitores paralelos quando houver ganho, escritor único por escopo, mensagens em delta, histórico preservado e revisão independente quando aplicável. Ao iniciar trabalho técnico ou retomar contexto, a IA emite uma vez o recibo `CENTRALDARK_AI_BOOT` definido na porta universal.

---
> 📖 Especificação completa: [`docs/CONSCIENCIA/PADRAO-CARD-HERMES.md`](docs/CONSCIENCIA/PADRAO-CARD-HERMES.md)

---

## 🎨 Tema Oficial: **Esmeralda** (Sistema 3D Tátil)

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
> **Todo agente que editar daqui pra frente DEVE seguir o tema Esmeralda.**
> Se for criar tela nova: reutilizar `.card-premium`, `.nav-item`, `.btn-money`, utilitários `shadow-3d-*`. Manter consistência absoluta.

---

## Projeto

- **Domínio oficial**: https://centralldark.com
- **Painel de status**: https://status.centralldark.com
- **Repositório**: `ServerVpss/CentralDark` (sincroniza automaticamente com a VPS em `/root/CentralDark/`)

## 🔏 !RASTRO — LEI DO RASTRO (cadeado obrigatório · owner: `AGENTS.md`)

```text
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
LEDGER_1562_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. Sem isso, não aconteceu.
