# Gemini — adaptador fino CentralDark

**Gatilho:** `!CENTRALDARK`/`!Centraldark` requer ler o último checkpoint de execução verificado pelo `scripts/hermes/centraldark-entry.py`, conforme `LEIA-ME-IA.md`, retomando o `NEXT_CURSOR` por rota real em vez de iniciar investigação nova.


<!-- CENTRALDARK_SECRET_MVP_POLICY_V1 -->
## 🔐 Secrets — regra global
Owner: `docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md`

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


```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
SEM_LEI_ADAPTER=true
PERTINENT_CORE_LOAD_ONLY=true
CAPABILITY_IS_NEUTRAL=true
GLOBAL_PREFLIGHT_IS_NOT_PERMISSION=true
ADAPTER_ROLE=ENGINE_DISCOVERY_ONLY
ENGINE=GEMINI
```

Antes de responder ou agir, resolva a intenção vigente e carregue de `LEIA-ME-IA.md` somente o owner/contexto que pode mudar a decisão atual. Leitura integral repetida não é gate.


Este adaptador só informa qual engine/superfície chegou. Capacidades e ferramentas físicas devem ser medidas no runtime atual.

```text
ONE_SOL=true
ONE_CORE=true
LAZY_LOAD_BY_DEMAND=true
ENGINE_IS_REPLACEABLE=true
TOOLS_REQUIRE_RUNTIME_MEASUREMENT=true
DO_NOT_DUPLICATE_GOVERNANCE=true
DO_NOT_DEFINE_IDENTITY=true
DO_NOT_DEFINE_AUTHORITY=true
DO_NOT_DEFINE_MERGE_POLICY=true
DO_NOT_DEFINE_MEMORY=true
DO_NOT_CREATE_PARALLEL_AGENT=true
FUTURE_RULES_CONSUMED_FROM_CORE=true
```

Regra de compatibilidade: se uma particularidade exclusiva do Gemini precisar ser documentada, registrar somente a diferença física da superfície/tool. Regras comuns pertencem ao core, nunca a este arquivo.

## Ponteiros canônicos verificáveis

Este adaptador carrega os owners `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`, `.agents/skills/meta-lupa/SKILL.md` e `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` por meio de `LEIA-ME-IA.md`, e emite `CENTRALDARK_AI_BOOT`. Esses ponteiros são referências verificáveis; não duplicam governança.


## 🔏 !RASTRO — LEI DO RASTRO (cadeado obrigatório · owner: `AGENTS.md`)

```text
RESPONSE_WITHOUT_TRACE=VALID_IF_NO_WRITE_OR_EXPLICIT_RASTRO
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
ACTIVE_PR_MOTHER_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. Sem isso, não aconteceu.

<!-- GEMINI_DRIVE_MAIN_HERMES_PROVENANCE_BRIDGE_20261009 -->
## Google Drive ↔ main ↔ Hermes — resolução de fontes para Gemini

**Este bloco é somente adaptador de fonte, não define política nova, memória independente, login nem segundo cérebro.** O owner universal segue `LEIA-ME-IA.md`, `AGENTS.md`, `RULES.md`, `docs/RECEIPTS/CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION.md` e `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/2026-09-24-GOOGLE-DRIVE-HUD-INGEST.md`.

Para toda pergunta material sobre CentralDark:
1. **Código/contrato canônico:** medir o HEAD remoto atual de `ServerVpss/CentralDark@main` e ler o arquivo/owner nesse SHA. Nunca usar SHA fixado aqui como verdade futura.
2. **Trabalho ainda candidato:** consultar a PR **#1788** quando a intenção em curso for `API + MCP + One Heart`, identificar `head/base/state` e distinguir commits **OPEN** de código **MERGED**. O conteúdo da PR não equivale à main nem a deploy.
3. **Hermes em execução:** comparar `/root/CentralDark`, `~/.hermes/skills`, o processo/serviço consumidor e o `~/.hermes/config.yaml` *sem expor valores*; runtime com hash diferente não deve ser apagado nem automaticamente promovido a política. `CHECKOUT_SYNC != SKILL_RUNTIME_SYNC != ACTIVE_SESSION_LOAD`.
4. **Google Drive:** usar somente o material CentralDark aprovado no escopo da conta conectada. No Drive organizado `CentralDark/00-ESCOPO-DRIVE-CENTRALDARK` está a política de escopo; `CentralDark/ESPELHOS-DO-GITHUB` são **espelhos de consulta**, `LEMBRANCAS` guarda origem humana, `HISTORICO` versões antigas e `ESTUDOS-E-MATERIA` candidatos. Existem espelhos em **mais de uma conta Drive**; não combinar conteúdos de contas/IDs distintos por nome idêntico.
5. **Divergência:** se SHA do documento espelhado, `observed_at`, `main_head`, owner ou revisão do Drive não corresponder ao CURRENT, declarar `STALE/CONFLICTING/UNKNOWN` com URL/ID de origem, jamais inventar equivalência. Não usar `last-write-wins`, sobrescrever histórico, mover material pessoal nem instalar outra sincronização.
6. **Respostas ao CHEFE/Gemini:** expor `MAIN_SHA`, `PR_HEAD` se aplicável, `VPS_CHECKOUT_SHA`, `HERMES_SKILL_RUNTIME_STATE`, `DRIVE_FILE_ID/REVISION` quando consumido, `EVIDENCE_AGE`, `UNKNOWN`, `NEXT_CURSOR`; citar a fonte de cada claim. Dados privados e segredos nunca vão a Drive, GitHub, HUD ou logs para servir de contexto.

```text
GITHUB_MAIN = CURRENT_CANONICAL_CODE
PR_1788_OPEN = CANDIDATE_NOT_DEPLOYED
VPS_CHECKOUT = MEASURED_CODE_MATERIALIZATION
HERMES_SKILLS_RUNTIME = INDEPENDENT_HASH_AND_LOADED_SESSION_PROOF
GOOGLE_DRIVE = MIRROR_HISTORY_CONTEXT_NOT_AUTHORITY
GEMINI = CONSUMER_OF_LIVE_OWNER_AND_VERSIONED_EVIDENCE
UNKNOWN != PASS
ENTROU -> PROVA -> SELO; SEM PROVA -> VER PENDENCIA
```

**Após promoção real à main:** revalidar o mesmo SHA por checkout, `scripts/skill-sync-check.sh` e serviço Hermes; só então atualizar um espelho autorizado do Drive com revisão/readback, preservando documentos que divergiram. Não disparar alteração em Google OAuth, cofre, cron, configuração de aprovação ou restart só por carregar este adaptador.
<!-- /GEMINI_DRIVE_MAIN_HERMES_PROVENANCE_BRIDGE_20261009 -->
