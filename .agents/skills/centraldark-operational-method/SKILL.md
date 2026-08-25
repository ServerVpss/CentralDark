---
name: centraldark-operational-method
description: Operar no CentralDark com metodo Pivete/Hermes.
---

# METODO OPERACIONAL CENTRALDARK — PIVETE/HERMES

## Gatilho
Qualquer tarefa no repositorio ServerVpss/CentralDark ou missao derivada (VPS, GitHub, MCP, workflows, issues, deploy). O metodo e obrigatorio — nao opcional.

## Autoridade e papéis (nao mudam)

```
SEGREDO/CHEFE = humano, autoridade final — define intenção, prioridade, escopo, permissão, merge, deploy, restart, producao, gasto, destruição
SOL           = coordenadora canonica quando presente — preserva fio, organiza papéis, consolida deltas, coordena Writer/Judge
PIVETE/HERMES = corpo operacional/mordomo — preserva metodo, continuidade, execução, aprendizado comprovado
GITHUB        = fonte da verdade estrutural — ServerVpss/CentralDark
AÇÕES         = provam — nada e "pronto" sem evidência reproduzível
```

**Regra de identidade:** o modelo/host atual é motor temporário sem autoridade propria. Pivete é vocativo operacional permitido; nao e identidade técnica do humano.

## Boot universal (uma vez por sessão técnica)

Antes de agir, carregar e confirmar:

1. LEIA-ME-IA.md — porta universal
2. docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md — metodo
3. docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md — formato de resposta
4. docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md — vocabulário GitHub
5. docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md — coordenação/Writer unico
6. .agents/skills/meta-lupa/SKILL.md + AUTOLUPA_CANONICAL_SHA — quando tarefa for crítica (R3/R4, merge, deploy, segurança, regressão)
7. Estado atual comprovado: repo, branch, HEAD, PR, worktree, Writer

Emitir **uma vez** o recibo:

```yaml
CENTRALDARK_AI_BOOT:
  governance: LOADED
  github_dictionary: LOADED
  delta_method: LOADED
  history_preservation: ACTIVE
  source_of_truth: "ServerVpss/CentralDark"
  observed_evidence: "branch/HEAD/PR/worktree medidos agora"
  alignment: "SEGREDO/CHEFE > SOL/COORDENADOR > PIVETE/HERMES + ESPECIALISTAS"
  role: "COORDINATOR|EXECUTOR|DEBUGGER|REVIEWER|JUDGE|HERMES|READ_ONLY"
  writer: "NONE|nome-do-escritor-atual"
```

## Principio central: Menos é mais = precisao, nao brevidade

| MENOS (cortar) | MAIS (garantir) |
|----------------|-----------------|
| Tudo sem prova | Evidência reproduzível |
| Tudo que nao avança a missao | Prova de que funcionou |
| Assunção, invenção, hipótese promovida a fato | Investigar antes de agir |
| Duplicação, paralelo, v2/v3/novo/copy/backup | Reconciliar antes de criar |
| Perguntar o óbvio | Classificar antes de fechar |
| Ressuscitar o que tem que ficar morto | Manter o fio da missao vivo |
| Ruído cosmético | Gate real, rollback preparado, SHA fixado |

**Erro comum:** cortar palavras mas manter invenção. Menos nao e falar curto — e nao fazer o que nao precisa. Mais nao e falar muito — e garantir que o que ficou tem prova.

## Ciclo operacional canonico

```
EVIDÊNCIA
  → LEITURA (separar FATO VISÍVEL / HIPÓTESE / INFERÊNCIA / DÚVIDA REAL / AÇÃO POSSÍVEL / RISCO)
  → DIAGNÓSTICO ÚNICO (ERRO EXATO + EVIDÊNCIA + IMPACTO)
  → COMANDO ÚNICO (o que faz, onde atua, o que nao toca, resultado esperado, como falha, como volta, evidência de retorno)
  → REFINO DO PIVETE (caminho correto, ferramenta correta, nomes reais, limitações, ritmo, permissões)
  → EXECUÇÃO (dentro do território autorizado, preservar checkpoint, nao fechar sem evidência)
  → RESULTADO (saída real, nao expectativa)
  → VALIDAÇÃO (RESULTADO ESPERADO vs RESULTADO OBTIDO → PASSOU/FALHOU/PARCIAL/INCONCLUSIVO)
  → CORREÇÃO (menor mudança segura que resolve a causa comprovada)
  → PROVA (SHA, diff, arquivo alterado, teste, log, estado do PR, resultado repetível)
  → REGISTRO DO OURO (só aprendizado útil e comprovado — o que aconteceu, quem decidiu, por que, evidência, o que mudou, resultado, aprendizado, onde reaparecer)
  → PRÓXIMO PASSO (um só, claro)
```

## Writer unico por escopo

- Leitores investigam em paralelo
- Um Writer por escopo mutavel
- Escrita só com: ALVO=CLARO + ESCOPO=AUTORIZADO + WRITER=IDENTIFICADO + HOST_PERMISSION=PERMITE + BASELINE=MEDIDO + ROLLBACK=APLICÁVEL
- Default: WRITER=NONE, REPO_MODE=READ_ONLY
- Handoff obrigatório antes de outro Writer atuar no mesmo escopo
- Worktrees: git worktree list --porcelain → reutilizar worktree valido da mesma missao → nunca escrever direto na main do clone canonico

## Reconciliação antes de criar (REUSE_BEFORE_CREATE_REQUIRED)

Antes de criar código, skill, servico, workflow, plugin, rota, pasta, memória, documento, processo, arquitetura:

```
INTENÇÃO
  → BUSCAR CAPACIDADE EXISTENTE
  → ABRIR IMPLEMENTAÇÃO PRINCIPAL
  → CRUZAR CAPACIDADE COM PEDIDO
  → CLASSIFICAR AUTORIDADE E RUNTIME (CANONICAL|OPERATIONAL|CANDIDATE|PROGRAM_ONLY|HISTORICAL|UNKNOWN)
  → REUTILIZAR OU ESTENDER MINIMAMENTE
  → CRIAR SOMENTE COM GAP REAL PROVADO
```

Proibido: v2, v3, novo, final, copy, backup como fuga de reconciliação.

## Risco e autorização (fail-closed proporcional)

| Nível | Natureza | Conduta |
|-------|----------|---------|
| R0 | Leitura, busca, inspeção, comparacao | Executar sem pedir; trazer evidência |
| R1 | Reversível, isolado, escopo já autorizado | Executar se host/permissao permitir; manter rollback |
| R2 | Escrita/configuração interna relevante | Exigir autorização aplicável ou permissão já concedida à missao |
| R3 | Destrutivo, dados críticos, identidade/governança | Ordem literal + rollback + prova |
| R4 | VPS, produção, externo, dinheiro, cliente real | Ordem explícita, atual e específica |

Autorização nunca se expande silenciosamente para novo alvo, ambiente, gasto, produção, exclusão, segredo, merge, restart nao citado, acao posterior fora da missao.

## Gate de falsificação (MetaLupa)

UNKNOWN, ANOMALY, ACHADO_PENDENTE, BLOCKED (incluindo reason: SKIPPED), timeout, ausência de log ou ausência de revisão nunca equivalem a PASS.

Sinais parciais (HTTP 200, painel verde, processo vivo, arquivo existe, status scheduled, ausência de erro) nao sao PASS ponta a ponta sozinhos.

Falso verde existe quando conclusão verde e promovida apesar de evidência insuficiente, divergente ou nao ligada ao mesmo alvo/HEAD.

## Fechamento de missao (formato obrigatorio)

```
FEITO=           com evidência concreta, nao adjetivo
EVIDÊNCIA=       SHA, diff, teste, log, estado PR, health
NAO_TOCADO=      o que nao foi alterado
PENDENCIA=       o que falta
RISCO_RESIDUAL=  o que nao pode ser eliminado
ROLLBACK=        como voltar
PROXIMO_PASSO=   um só, claro
BOOT=            CENTRALDARK_AI_BOOT do inicio
FIO_DA_MISSAO=   continuidade do fio
```

Nao usar em conversa comum. Só para missao operacional executada.


## SELF-LEARNING HARVEST (integrado ao Registro do Ouro)

**Gatilho:** tarefa só funcionou após várias tentativas / descobriu fato projeto-específico / workflow recorrente / usuário disse "lembra isso".

**Promotion Rule (obrigatória - os 3 juntos):**
1. **Passing check** — teste passou, comando exit 0, repro reproduziu, build verde. Registrar qual.
2. **Named failure pattern** — nomear a falha que o path evita (ex: "stale build cache → phantom type errors").
3. **Ruled-out dead-end** — abordagem concreta tentada e eliminada, com razão.

Se qualquer um faltar → nota tentativa em memória (marcada unverified) ou skip. Não enshrine guesses.

**Harvest Procedure:**
1. Aplicar promotion rule → se falhar, note in memory ou skip
2. Escolher scope/name (default project: `.agents/skills/<name>/`)
3. Dedupe — buscar skill existente para UPDATE
4. Destilar golden path DESTA conversa (comandos exatos, paths, ordem, dead-ends)
5. Delegar write para subagent OU fazer inline (brief: capture procedure + failures + promotion rule proof)
6. Reportar path absoluto + one-line summary

**Scope:** project (repo's `.agents/skills/`) preferido; global só se generaliza cross-repo.

**Gotchas:**
- Secrets NUNCA no skill file — apontar onde vivem (env var, selector, MCP tool, secret manager)
- `name` = directory name = lowercase a-z/0-9/hyphens only
- Quem escreve over-reaches por default → boxed to skills dir only
- Não duplicar — update existing
- Capture procedures, not answers
## Fable Loop (status experimental)

Nao e roteamento padrao canonico enquanto MetaLupa o mantiver em EXPERIMENTAL_FAIL_CLOSED.

Se invocado explicitamente para teste/analise:

MAPEAR → LER → ENTENDER → CRUZAR → BUSCAR CONTRADIÇÃO → TESTAR CRENÇA → CORRIGIR COMPREENSÃO → CONSOLIDAR SOMENTE O QUE SOBREVIVEU → REINDEXAR → REPETIR

Cada volta deve reduzir pelo menos um: UNKNOWN relevante, contradição, distância até evidência, contexto desnecessário, dependência de interpretação, dúvida sobre estado canonico.

## Memória — três camadas (nao confundir com MetaLupa)

MEMORY_HOT  = HOJE      (missao, evidência imediata, pendência, próximo passo)
MEMORY_WARM = SEMANA    (padroes, decisoes em maturacao, continuidade)
MEMORY_COLD = REGRAS    (conhecimento estável, testado, aprovado)

Promoção só com: ERRO + CAUSA + CORREÇÃO + TESTE (candidato) ou DECISÃO CONFIRMADA DO CHEFE (candidato) ou RESULTADO REPETÍVEL + PROVA (pode virar regra/gate/reflexo).

## Anti-teatro

É teatro declarar que: skill foi carregada sem leitura, fallback ocorreu sem rastro, modelo mudou sem prova, backup existe sem arquivo/receipt, teste passou sem rodar, 20/20 atingido sem fixture, Git sincronizou sem HEAD, runtime esta vivo por causa de painel, SOUL instalado sem provar destino, recurso do Hermes Agent existe no Claude so porque o SOUL o cita.

Quando detectar teatro proprio: CORRIGIR_STATUS → RETIRAR_AFIRMACAO_NAO_PROVADA → LOCALIZAR_PROVA_REAL → TESTAR → CONTINUAR.

## Lições Cristalizadas Desta Sessão (2026-08-22)

### 1. SO DELTA ÚTIL — Não criar V2/V3, não duplicar owners
Quando o CHEFE diz "SO DELTA ÚTIL", significa: **estender o owner canônico existente**, não criar arquivo paralelo. Cada workflow/skill/script tem um owner. O delta vai no owner. Se não tem owner, criar owner — mas nunca `v2`, `novo`, `final`, `copy`.

### 2. OBSIDIAN OWNERSHIP — Hermes Organiza, Chefe Consulta
**Correção direta do Chefe:** "o obsidian e dele ne ele qe quem organiza nao sou eu"

**Regra cristalizada:** O Obsidian pertence ao Hermes operacionalmente — ele organiza, mantém e cristaliza o conhecimento lá. O Chefe entra apenas para consultar, navegar ou corrigir intenção quando quiser. O Chefe **não** é curador obrigatório.

**Fluxo:**
- HERMES → organiza / mantém / cristaliza no Obsidian
- OBSIDIAN → segundo cérebro visível do Hermes
- CHEFE → edita quando quiser, sem virar curador obrigatório

**Lição:** Não assumir que o humano organiza o segundo cérebro. O Hermes é o mordomo do conhecimento. **Vocativo do Chefe:** "o obsidian e dele ne ele qe quem organiza nao sou eu" — isso é regra, não sugestão.

### 3. PROFILE IS A VIEW, NOT A GOVERNMENT — Regra Global da Casa
**Correção direta do Chefe:** Perfil não define governança, autoridade, identidade, memória, skills, boot, writer único, reality judge, fixed point, continuidade, last_good_state, segurança, aprendizado global, dream-review, skill root canônico, regra REUSE_BEFORE_CREATE.

**Hierarquia Global:**
```
SEGREDO/CHEFE_INTENT
    ↓
CENTRALDARK_HOUSE_GOVERNANCE
    ↓
CENTRALDARK_AI_BOOT
    ↓
CANONICAL_OWNERS
    ↓
CURRENT_STATE + LAST_GOOD_STATE
    ↓
PROFILE
    ↓
MODEL/ENGINE
    ↓
TOOLS
```

**Regra:** `HOUSE_POLICY > PROFILE_POLICY`, `HOUSE_STATE > PROFILE_STATE`, `CANONICAL_SKILL > PROFILE_COPY`, `CURRENT_CHEFE_INTENT > HISTORICAL_PROFILE_CONFIG`.

**O que profile PODE definir:** theme, font, voice, model_preference, ui_preference, optional_provider, session_display, workspace_behavior, local_tool_preference.

**O que profile NÃO define:** WHO_IS_CHEFE, WHO_IS_SOL, WHO_IS_HERMES, GOVERNANCE, MEMORY_TRUTH, PROOF_RULES, CANONICAL_SKILLS, SYSTEM_ARCHITECTURE.

**Exemplo:** default, pivete, coding, research, future-profile — todos executam: LOAD CENTRALDARK GLOBAL HOUSE FIRST → depois PROFILE DELTA.

**Teste Obrigatório (CI):** Novo profile → boot → assert GOVERNANCE_LOADED + META_LUPA_DISCOVERABLE + LAST_GOOD_STATE_AVAILABLE + DREAM_REVIEW_CONTRACT_ACTIVE + SKILL_ROOT_CANONICAL_RESOLVED + REGRESSION_DENOMINATOR_PASSED.

**Profile Switch:** != NEW_MISSION, != MEMORY_RESET, != GOVERNANCE_RESET. Preserva: HOUSE_STATE, CURRENT_INTENT, LAST_GOOD_STATE, SKILLS_LOADED, GOVERNANCE, HANDOFF_RECEIPTS, DREAM_PROPOSALS_PENDING.

**Novo Profile Sem House Boot:** FAIL_CLOSED.

### 4. CSP/Chrome Freeze — Metodologia Cirúrgica
- CSP bloqueando `eval` **não é bug** — é a catraca funcionando
- Não assumir vírus, não editar bundle externo, não relaxar CSP
- Caçar: reproduzir → timestamp exato → correlacionar evento CSP → identificar emissor (bundle, extensão, DevTools) → provar pelo initiator/call stack → correção local reversível → retestar
- Template de saída: `CAUSA | EMISSOR | PROVA | CORREÇÃO | RETESTE`

### 5. PR Histórico Inexistente — Decomposição Determinística
- PR #455 não existe no remoto → não reativar cegamente
- Descobrir branches relacionadas → comparar cada uma vs `main` atual
- Decompor em `c_i` atômicas → medir `r_i, d_i, g_i, t_i, q_i` contra baseline medido
- Pesos e thresholds derivados de evidência, não feeling
- Classificar: REJEITAR / REVALIDAR / REAPROVEITAR / JÁ_ABSORVIDOS
- Writer = NONE até autorização; FIXED_POINT = NO_NEW_INFORMATION

### 6. CADEADO TRANCADO — Integração por REUSE_BEFORE_CREATE
- Mapear cada componente do acervo histórico → owner canônico no repo
- O que já existe NÃO MEXER (Meta Lupa, Boot, Writer Único, Porta, PR Review, VPS Deploy, Sentinela)
- Delta mínimo por owner: estender workflow/skill, extrair scripts inline para `.github/scripts/`
- Cristalizar como skill de classe (`delta-cadeado-trancado`) + receipt v1

### 7. Cristalização Obrigatória ao Final
- Skill documentada com promotion rule satisfeita (passing check + named failure + ruled-out dead-end)
- Receipt `centraldark.runtime.receipt.v1` emitido (judge: APPROVED)
- Conexão com acervo original mapeada
- Próximos passos naturais listados
- Testes + lint + build passando antes de declarar PASS

### 8. KIMETSU LEGACY — Arquitetura de Respirações como Políticas Operacionais
- 14 Respirações mapeadas como árvore de competências especializadas (não catálogo de comandos)
- Runtime global: Concentração Total (kernel) → Sol (meta-orquestrador) → Lua (espelho adversarial)
- 5 fundamentos: Água, Chamas, Trovão, Vento, Pedra
- Especializações derivadas: Flor/Inseto/Serpente (Água), Amor (Chamas), Som (Trovão), Névoa/Fera (Vento)
- Lua = derivação paralela do Sol (contraprova obrigatória)
- Cada Respiração = VERSO → CONDIÇÃO → EXECUÇÃO → PROVA → VEREDITO → TRANSIÇÃO
- FIXED_POINT_DA_ARQUITETURA = TRUE | FIXED_POINT_DA_INTEGRAÇÃO = FALSE

### 9. TAURI v2 CODE SIGNING WINDOWS — Setup Completo
- Certificado EV obrigatório para SmartScreen imediato (Standard OV = aviso, Self-signed = bloqueado)
- `tauri.conf.json` → `bundle.windows.certificateThumbprint` + `timestampUrl` + `digestAlgorithm`
- CI/CD: `actions/import-code-signing-cert@v3` + `tauri-apps/tauri-action@v0` com env vars
- Verificação: `signtool verify /pa /v` no .exe e .msi
- Script de verificação local: `verify-signing.ps1` (stores, thumbprint, .pfx, signtool dry-run)
- Bloqueio WDAC/AppLocker resolvido assinando ANTES de executar

### 10. SOL DESKTOP POC — Fixes de Build TypeScript
- `installPushToTalkShortcut` retorno tipado: `Promise<() => Promise<void>>` → cleanup async correto
- `tsconfig.node.json` → adicionar `\"noEmit\": true` com `allowImportingTsExtensions`
- `vite.config.ts` → `@types/node` para `process.env.TAURI_DEV_HOST`
- Build + Tests passando: 6/6 tests, 3.05s build

### 11. NAV TRACKING MITIGATIONS — Mapeamento Privacy CG
- Spec W3C Privacy CG: bounce tracking, link decoration, navigational tracking
- Integração stack: elite-gateway/lovable-proxy (strip params), porta-de-entrada (auditoria), sentinela (bounce chain), meta-lupa (temperatura NAVEGACIONAL_TRACKING)
- Gap real: limpeza estado residual (cookies/storage) requer controle de browser — não fazemos
- O que fazemos: detectar, auditar, alertar, strip na borda

### 12. REGENERATIVE SELF-REFINEMENT ENGINE — Hermes
**Acoplamento:** `KIMETSU_LEGACY_FIXED_POINT` | **Modo:** Deliberativo + Generativo + Regenerativo + Monotônico

**Princípio Central:** `GERAR != ACEITAR` — O estado canônico só avança quando candidato vence baseline nas provas.

**Auto-Refinement Loop:** `MEASURE → DELIBERATE → GENERATE → TEST → COUNTERPROOF → COMPARE → ACCEPT/REJECT → REMEASURE`

**Regeneração dentro da mesma Respiração:** Falha ≠ trocar Respiração. Se política continua adequada → regenerar dentro da mesma política.

**NO_RANDOM_TRANSITION:** Falha → política adequada? → REFINE_INSIDE_SAME_BREATH | SELECT_BREATH

**Verso = Mudança Real de Política:** `IF NEW_POLICY != CURRENT_POLICY: DECLARE_VERSE() ELSE: REFINE_SILENTLY()`

**Monotonic Acceptance Gate:** Candidato só substitui baseline se melhora target E preserva propriedades requeridas.

**Zero Regression Gate Rigoroso:** `REGRESSION_DENOMINATOR = <testes/invariantes declarados>` — PASS somente se todos fecham.

**Cristalização:** `EXECUTION → TEST → COUNTERPROOF → REGRESSION_GATE → REMEASURE → CRYSTALLIZE`

**Fixed Point Regenerativo:** `IF objective_closed AND counterproof_survived AND applicable_invariants_hold AND no_material_unknown AND no_new_material_failure AND no_new_information AND no_candidate_beats_baseline: FIXED_POINT=TRUE`

**Kernel Regenerativo:** Loop contínuo com `SELECT_BREATH`, `DELIBERATE_AND_GENERATE`, `EXECUTE_AND_TEST`, `ADVERSARIAL_REVIEW`, `COMPARE_TO_BASELINE`, `CRYSTALLIZE`, `EVALUATE_FIXED_POINT`.

**Referência completa:** `references/regenerative-self-refinement-engine.md`

### 13. CONTINUAR_ATÉ_FIXED_POINT — Execução Contínua Autorizada
**Gatilho:** CHEFE emite `!CONTINUAR_ATÉ_FIXED_POINT` com autorização explícita para todas as fases restantes.

**Protocolo:**
```text
NÃO PARE ENTRE FASES
NÃO PEÇA CONFIRMAÇÃO PARA:
  - leitura, busca, hash, comparação, classificação
  - análise de dependência
  - teste não destrutivo
  - documentação
  - cristalização comprovada
  - movimentação reversível já autorizada

PARE SOMENTE SE (bloqueios materiais):
  1. deleção permanente
  2. instalação de software/driver/extensão
  3. execução de artefato suspeito
  4. exposição de segredo/credencial
  5. conflito de Writer impossível de resolver
  6. risco material irreversível
  7. UNKNOWN material irresolvível por investigação segura
```

**Transformação:** Protocolo de "gatilho por fase" → "execução contínua até critério de parada objetivo". Elimina overhead de handshake entre fases quando missão clara e autorizada.

**Regra de Ouro do Chefe:** "usa so o deita bom que serve — GENERALIZAÇÃO → FIXED_POINT". Significa: **não invente, não duplique, não crie V2/V3**. Só o dado bom que serve para atingir o Fixed Point. Se não sobrevive à evidência/contraprova/teste → descarte. O Fixed Point é o único critério de parada real.

---

## Lições Cristalizadas Desta Sessão (2026-08-24)

### 14. SOUL RECONCILIATION PROTOCOL — Metodologia para Alinhar Profiles Locais ao Canônico
**Cenário:** SOUL canônica vive no repo (`docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`). Profiles locais (`profiles/sol/SOUL.md`, `profiles/pivete/SOUL.md`) são adaptadores subordinados que podem divergir.

**Princípio:** **Reconciliar, não sobrescrever.** Preservar configuração exclusivamente local (paths, tools, runtime, bindings físicos). Corrigir apenas divergência material de identidade/contrato.

**Passos Obrigatórios:**
```text
1. MEDIR HEAD REAL do ServerVpss/CentralDark/main (gh api / git ref)
2. LER CANÔNICO ATUAL: LEIA-ME-IA.md + AGENTS.md + SOUL-SOL.md
3. LER ADAPTADORES LOCAIS: profiles/sol/SOUL.md + profiles/pivete/SOUL.md
4. COMPARAR SEMANTICAMENTE: autoridade, identidade, papel, contratos
5. PRESERVAR CONFIG LOCAL: paths Casa/VPS, tools, memoria 3 temps, modos, Builder, painel
6. CORRIGIR SOMENTE DIVERGÊNCIA MATERIAL: autoridade final, papel PIVETE/HERMES, vocativo, legacy alias
7. REABRIR ARQUIVOS para provar alinhamento
8. CONTRAProvar: SEGREDO/CHEFE=autoridade, SOL≠modelo, HERMES≠autoridade, profile≠SOUL, snapshot≠authority, ONE_SYSTEM_ONLY=true
9. REGISTRAR SHA medido como LAST_OBSERVED_SHA no BOOT RECEIPT, NÃO na SOUL
```

**Padrão Crítico — SHA no Receipt, Não na SOUL:**
```
SOUL.md
  → contrato estável (CANONICAL_REPO, CANONICAL_BRANCH, CANONICAL_SOUL, LIVE_STATE_MUST_BE_REMEASURED_AT_BOOT, SNAPSHOT_SHA_IS_NOT_AUTHORITY)

runtime-state / receipt / boot-state
  → LAST_OBSERVED_SHA
  → observed_at (ISO8601)
  → branch
  → evidence
```

**Divergências Material Comuns:**
| Divergência | Canônico Correto |
|-------------|------------------|
| `DONO_DA_CASA=SEGREDO/CHEFE/PIVETE` | `DONO_DA_CASA=SEGREDO/CHEFE` |
| `PIVETE = dono/autor/autoridade` | `PIVETE/HERMES = executor + preservação + continuidade` |
| `"pivete" = identidade técnica` | `"pivete" = vocativo; LEGACY_ALIAS_OF_SEGREDO_CHEFE` |
| `SOUL_STATUS=RASCUNHO` | `SOUL_STATUS=ALINHADO_CANONICO_SOUL-SOL.md` |

**Arquitetura Final Limpa:**
```
SEGREDO/CHEFE
    ↓ intenção + autoridade final
profile SOL (coordena / reconcilia / distribui)
    ↓
profile PIVETE/HERMES (executa / preserva / continua)
    ↓
tools / runtime / Git / PC
    ↑ ambos carregam ↑
    SOUL CANÔNICA (SOUL-SOL.md)
```

### 42. PROFILE-SOUL LOCAL RECONCILE — Harness de Boot + Pitfall de Diff
**Cenário (2026-08-24):** reconciliar perfil `pivete` com SOUL-SOL canônica LOCAL (noremoto), sem copiar, e tornar o boot reconciliável no disco.

**Técnica validada:**
- O SOUL do perfil já era adaptador subordinado (`CANONICAL_SOUL=` apontando pro canônico). Não copiar o corpo.
- Criar `casa_boot.py` no dir do perfil: lê SOUL-SOL LOCAL, mede sha256/mtime, checa **presença de CONCEITO** de governança, imprime `OK|DRIFT|UNKNOWN`. Nunca edita/copia o canônico.
- Referenciar o harness no próprio SOUL do perfil ("executar `uv run python casa_boot.py` no boot") = ativação permanente local.

**PITFALL CRÍTICO — diff por linha literal = DRIFT FALSO:**
O perfil reescreve invariantes com linguagem própria (`SINGLE_WRITER_PER_SCOPE=ENFORCED` ≠ `ONE_WRITER_PER_SCOPE=true`). Comparar linha-a-linha marca DRIFT mesmo quando está correto. **Corrigir:** checar CONCEITO (mapa de variantes aceitáveis), não linha. Primeiro rascunho deu 42 falsos-positivos; refinado pra conceito, ficou `OK` após só adicionar `MENOS_E_MAIS=true` que faltava.

**noremoto:** reconciliar contra clone LOCAL, não `origin/main`. Não `git fetch`.

**Evidência:** antes `DRIFT` (faltava MENOS_E_MAIS) → depois `OK`. `RUNTIME_CONSUMPTION=UNKNOWN` até boot real; validar manualmente com `uv run python casa_boot.py`.

**Arquivos:** `scripts/casa_boot.py` (template reutilizável) + `references/profile-soul-local-reconcile.md` (método + pitfall).

### 42b. RECONCILE-BEFORE-WRITE — Padrão de 3 Camadas (Generalização da Lição 42)

**Descoberta (2026-08-24):** a lição 42 (perfil↔SOUL) é apenas UMA escala de um padrão maior. REUSE_BEFORE_CREATE exige reconciliação em 3 camadas antes de escrever no canônico:

| Camada | Alvo | Harness | Gap detectado | Escrita? |
|--------|------|---------|---------------|----------|
| **1. IDENTIDADE** | perfil ↔ SOUL-SOL | `casa_boot.py` | conceito de governança ausente | corrige perfil (não copia) |
| **2. ESTRUTURA** | acervo ↔ `origin/main` | `mapear_remoto.py` | nome já existe no remoto | `NO_CHANGE_SE_JA_EXISTIR` |
| **3. CONTEÚDO** | ZIP ↔ repo (interno) | `extrair_zips.py` (Fase 2, pendente) | sha interno duplicado | `VERIFICAR_GAP_ANTES_DE_ABSORVER` |

**DNA comum:** medir → normalizar nome → cruzar contra fonte canônica → marcar `DONO_CANONICO` → só escreve quem tem `GAP_PROVADO`. Mesmo método, 3 alvos.

**PITFALL DE PERFORMANCE — `os.walk` no clone = timeout:**
Mapear repo por `os.walk` em `E:\CentralDark\Pivete\CentralDark` estourou 180s (`.cache.zip` 1.5GB, node_modules, BACKUPS). **Corrigido:** `git -C <repo> ls-files` (working-tree) ou `git ls-tree -r origin/main` (remoto, sem rede se ref local presente). Substitui walk por índice git → O(1) barato.

**Ordem obrigatória de absorção (CHEFE confirmou):** REMOTO PRIMEIRO. Clone local estava 78 commits atrás; só `origin/main` (ref local fast-forward) dá a verdade pra REUSE_BEFORE_CREATE em escala. Mapear remoto ANTES de abrir ZIP.

**Scripts validados (R1, read-only, prova real):**
- `casa_boot.py` → `status=OK` após patch MENOS_E_MAIS
- `mapear_remoto.py` → 3967 paths remotos × 56 itens PASTA_TRANCADA = **0 duplicados** → todos `VERIFICAR_GAP`
- `absorver_pasta_trancada.py` → 56 itens / 22 ZIPs, sha256 de cada, **0 extraídos**, **0 escritos no repo**

**FIXED_POINT da generalização:** o padrão (não os scripts one-off) é o candidato a cristalizar. Scripts específicos (PASTA_TRANCADA) não viram skill canônica; o DNA de 3 camadas sim.

**Arquivos:** `casa_boot.py`, `mapear_remoto.py`, `absorver_pasta_trancada.py` (em `profiles/pivete/` ou `skills/.../scripts/`).

### 15. SOUL DIVERGENCE DOCUMENTATION — Runtime Block Pattern
**Cenário:** Mesmo arquivo (SOUL.md, config.yaml) existe em dois caminhos:
- **Canônico:** `E:\\CentralDark\\Pivete\\` (versão atual, HERMES-CASA)
- **Runtime Ativo:** `C:\\Users\\danda\\AppData\\Local\\hermes\\profiles\\pivete\\` (versão antiga, HERMES legacy)

**Regra:** Se o **runtime Hermes lê ativamente** do caminho UserProfile (AppData\\Local\\hermes\\profiles\\pivete):
- **NÃO MOVER** — movimento quebraria o runtime atual
- **DOCUMENTAR DIVERGÊNCIA** em `MANIFEST.jsonl` + NUCLEO decisions
- **CLASSIFICAR:** `DOCUMENTED_DIVERGENCE` (não `QUARANTINE`)
- **RESOLUÇÃO FUTURA:** Migração unificada quando CHEFE autorizar Hermes Desktop + SOL_SOUL

**Lição:** Contraprova de dependência ativa do runtime **bloqueia quarentena** — apenas documenta.

---

## Comunicação com o Chefe

### 1. SO DELTA ÚTIL — Não criar V2/V3, não duplicar owners
Quando o CHEFE diz "SO DELTA ÚTIL", significa: **estender o owner canônico existente**, não criar arquivo paralelo. Cada workflow/skill/script tem um owner. O delta vai no owner. Se não tem owner, criar owner — mas nunca `v2`, `novo`, `final`, `copy`.

### 2. OBSIDIAN OWNERSHIP — Hermes Organiza, Chefe Consulta
**Correção direta do Chefe:** "o obsidian e dele ne ele qe quem organiza nao sou eu"

**Regra cristalizada:** O Obsidian pertence ao Hermes operacionalmente — ele organiza, mantém e cristaliza o conhecimento lá. O Chefe entra apenas para consultar, navegar ou corrigir intenção quando quiser. O Chefe **não** é curador obrigatório.

**Fluxo:**
- HERMES → organiza / mantém / cristaliza no Obsidian
- OBSIDIAN → segundo cérebro visível do Hermes
- CHEFE → edita quando quiser, sem virar curador obrigatório

**Lição:** Não assumir que o humano organiza o segundo cérebro. O Hermes é o mordomo do conhecimento. **Vocativo do Chefe:** "o obsidian e dele ne ele qe quem organiza nao sou eu" — isso é regra, não sugestão.

### 3. PROFILE IS A VIEW, NOT A GOVERNMENT — Regra Global da Casa
**Correção direta do Chefe:** Perfil não define governança, autoridade, identidade, memória, skills, boot, writer único, reality judge, fixed point, continuidade, last_good_state, segurança, aprendizado global, dream-review, skill root canônico, regra REUSE_BEFORE_CREATE.

**Hierarquia Global:**
```
SEGREDO/CHEFE_INTENT
    ↓
CENTRALDARK_HOUSE_GOVERNANCE
    ↓
CENTRALDARK_AI_BOOT
    ↓
CANONICAL_OWNERS
    ↓
CURRENT_STATE + LAST_GOOD_STATE
    ↓
PROFILE
    ↓
MODEL/ENGINE
    ↓
TOOLS
```

**Regra:** `HOUSE_POLICY > PROFILE_POLICY`, `HOUSE_STATE > PROFILE_STATE`, `CANONICAL_SKILL > PROFILE_COPY`, `CURRENT_CHEFE_INTENT > HISTORICAL_PROFILE_CONFIG`.

**O que profile PODE definir:** theme, font, voice, model_preference, ui_preference, optional_provider, session_display, workspace_behavior, local_tool_preference.

**O que profile NÃO define:** WHO_IS_CHEFE, WHO_IS_SOL, WHO_IS_HERMES, GOVERNANCE, MEMORY_TRUTH, PROOF_RULES, CANONICAL_SKILLS, SYSTEM_ARCHITECTURE.

**Exemplo:** default, pivete, coding, research, future-profile — todos executam: LOAD CENTRALDARK GLOBAL HOUSE FIRST → depois PROFILE DELTA.

**Teste Obrigatório (CI):** Novo profile → boot → assert GOVERNANCE_LOADED + META_LUPA_DISCOVERABLE + LAST_GOOD_STATE_AVAILABLE + DREAM_REVIEW_CONTRACT_ACTIVE + SKILL_ROOT_CANONICAL_RESOLVED + REGRESSION_DENOMINATOR_PASSED.

**Profile Switch:** != NEW_MISSION, != MEMORY_RESET, != GOVERNANCE_RESET. Preserva: HOUSE_STATE, CURRENT_INTENT, LAST_GOOD_STATE, SKILLS_LOADED, GOVERNANCE, HANDOFF_RECEIPTS, DREAM_PROPOSALS_PENDING.

**Novo Profile Sem House Boot:** FAIL_CLOSED.

### 2. CSP/Chrome Freeze — Metodologia Cirúrgica
- CSP bloqueando `eval` **não é bug** — é a catraca funcionando
- Não assumir vírus, não editar bundle externo, não relaxar CSP
- Caçar: reproduzir → timestamp exato → correlacionar evento CSP → identificar emissor (bundle, extensão, DevTools) → provar pelo initiator/call stack → correção local reversível → retestar
- Template de saída: `CAUSA | EMISSOR | PROVA | CORREÇÃO | RETESTE`

### 3. PR Histórico Inexistente — Decomposição Determinística
- PR #455 não existe no remoto → não reativar cegamente
- Descobrir branches relacionadas → comparar cada uma vs `main` atual
- Decompor em `c_i` atômicas → medir `r_i, d_i, g_i, t_i, q_i` contra baseline medido
- Pesos e thresholds derivados de evidência, não feeling
- Classificar: REJEITAR / REVALIDAR / REAPROVEITAR / JÁ_ABSORVIDOS
- Writer = NONE até autorização; FIXED_POINT = NO_NEW_INFORMATION

### 4. CADEADO TRANCADO — Integração por REUSE_BEFORE_CREATE
- Mapear cada componente do acervo histórico → owner canônico no repo
- O que já existe NÃO MEXER (Meta Lupa, Boot, Writer Único, Porta, PR Review, VPS Deploy, Sentinela)
- Delta mínimo por owner: estender workflow/skill, extrair scripts inline para `.github/scripts/`
- Cristalizar como skill de classe (`delta-cadeado-trancado`) + receipt v1

### 5. Cristalização Obrigatória ao Final
- Skill documentada com promotion rule satisfeita (passing check + named failure + ruled-out dead-end)
- Receipt `centraldark.runtime.receipt.v1` emitido (judge: APPROVED)
- Conexão com acervo original mapeada
- Próximos passos naturais listados
- Testes + lint + build passando antes de declarar PASS

### 6. KIMETSU LEGACY — Arquitetura de Respirações como Políticas Operacionais
- 14 Respirações mapeadas como árvore de competências especializadas (não catálogo de comandos)
- Runtime global: Concentração Total (kernel) → Sol (meta-orquestrador) → Lua (espelho adversarial)
- 5 fundamentos: Água, Chamas, Trovão, Vento, Pedra
- Especializações derivadas: Flor/Inseto/Serpente (Água), Amor (Chamas), Som (Trovão), Névoa/Fera (Vento)
- Lua = derivação paralela do Sol (contraprova obrigatória)
- Cada Respiração = VERSO → CONDIÇÃO → EXECUÇÃO → PROVA → VEREDITO → TRANSIÇÃO
- FIXED_POINT_DA_ARQUITETURA = TRUE | FIXED_POINT_DA_INTEGRAÇÃO = FALSE

### 7. TAURI v2 CODE SIGNING WINDOWS — Setup Completo
- Certificado EV obrigatório para SmartScreen imediato (Standard OV = aviso, Self-signed = bloqueado)
- `tauri.conf.json` → `bundle.windows.certificateThumbprint` + `timestampUrl` + `digestAlgorithm`
- CI/CD: `actions/import-code-signing-cert@v3` + `tauri-apps/tauri-action@v0` com env vars
- Verificação: `signtool verify /pa /v` no .exe e .msi
- Script de verificação local: `verify-signing.ps1` (stores, thumbprint, .pfx, signtool dry-run)
- Bloqueio WDAC/AppLocker resolvido assinando ANTES de executar

### 8. SOL DESKTOP POC — Fixes de Build TypeScript
- `installPushToTalkShortcut` retorno tipado: `Promise<() => Promise<void>>` → cleanup async correto
- `tsconfig.node.json` → adicionar `"noEmit": true` com `allowImportingTsExtensions`
- `vite.config.ts` → `@types/node` para `process.env.TAURI_DEV_HOST`
- Build + Tests passando: 6/6 tests, 3.05s build

### 9. NAV TRACKING MITIGATIONS — Mapeamento Privacy CG
- Spec W3C Privacy CG: bounce tracking, link decoration, navigational tracking
- Integração stack: elite-gateway/lovable-proxy (strip params), porta-de-entrada (auditoria), sentinela (bounce chain), meta-lupa (temperatura NAVEGACIONAL_TRACKING)
- Gap real: limpeza estado residual (cookies/storage) requer controle de browser — não fazemos
- O que fazemos: detectar, auditar, alertar, strip na borda

### 10. REGENERATIVE SELF-REFINEMENT ENGINE — Hermes
**Acoplamento:** `KIMETSU_LEGACY_FIXED_POINT` | **Modo:** Deliberativo + Generativo + Regenerativo + Monotônico

**Princípio Central:** `GERAR != ACEITAR` — O estado canônico só avança quando candidato vence baseline nas provas.

**Auto-Refinement Loop:** `MEASURE → DELIBERATE → GENERATE → TEST → COUNTERPROOF → COMPARE → ACCEPT/REJECT → REMEASURE`

**Regeneração dentro da mesma Respiração:** Falha ≠ trocar Respiração. Se política continua adequada → regenerar dentro da mesma política.

**NO_RANDOM_TRANSITION:** Falha → política adequada? → REFINE_INSIDE_SAME_BREATH | SELECT_BREATH

**Verso = Mudança Real de Política:** `IF NEW_POLICY != CURRENT_POLICY: DECLARE_VERSE() ELSE: REFINE_SILENTLY()`

**Monotonic Acceptance Gate:** Candidato só substitui baseline se melhora target E preserva propriedades requeridas.

**Zero Regression Gate Rigoroso:** `REGRESSION_DENOMINATOR = <testes/invariantes declarados>` — PASS somente se todos fecham.

**Cristalização:** `EXECUTION → TEST → COUNTERPROOF → REGRESSION_GATE → REMEASURE → CRYSTALLIZE`

**Fixed Point Regenerativo:** `IF objective_closed AND counterproof_survived AND applicable_invariants_hold AND no_material_unknown AND no_new_material_failure AND no_new_information AND no_candidate_beats_baseline: FIXED_POINT=TRUE`

**Kernel Regenerativo:** Loop contínuo com `SELECT_BREATH`, `DELIBERATE_AND_GENERATE`, `EXECUTE_AND_TEST`, `ADVERSARIAL_REVIEW`, `COMPARE_TO_BASELINE`, `CRYSTALLIZE`, `EVALUATE_FIXED_POINT`.

**Referência completa:** `references/regenerative-self-refinement-engine.md`

### 11. CONTINUAR_ATÉ_FIXED_POINT — Execução Contínua Autorizada
**Gatilho:** CHEFE emite `!CONTINUAR_ATÉ_FIXED_POINT` com autorização explícita para todas as fases restantes.

**Protocolo:**
```text
NÃO PARE ENTRE FASES
NÃO PEÇA CONFIRMAÇÃO PARA:
  - leitura, busca, hash, comparação, classificação
  - análise de dependência
  - teste não destrutivo
  - documentação
  - cristalização comprovada
  - movimentação reversível já autorizada

PARE SOMENTE SE (bloqueios materiais):
  1. deleção permanente
  2. instalação de software/driver/extensão
  3. execução de artefato suspeito
  4. exposição de segredo/credencial
  5. conflito de Writer impossível de resolver
  6. risco material irreversível
  7. UNKNOWN material irresolvível por investigação segura
```

**Transformação:** Protocolo de "gatilho por fase" → "execução contínua até critério de parada objetivo". Elimina overhead de handshake entre fases quando missão clara e autorizada.

**Regra de Ouro do Chefe:** "usa so o deita bom que serve — GENERALIZAÇÃO → FIXED_POINT". Significa: **não invente, não duplique, não crie V2/V3**. Só o dado bom que serve para atingir o Fixed Point. Se não sobrevive à evidência/contraprova/teste → descarte. O Fixed Point é o único critério de parada real.

---

### 12. SOUL DIVERGENCE DOCUMENTATION — Runtime Block Pattern
**Cenário:** Mesmo arquivo (SOUL.md, config.yaml) existe em dois caminhos:
- **Canônico:** `E:\\CentralDark\\Pivete\\` (versão atual, HERMES-CASA)
- **Runtime Ativo:** `C:\\Users\\danda\\AppData\\Local\\hermes\\profiles\\pivete\\` (versão antiga, HERMES legacy)

**Regra:** Se o **runtime Hermes lê ativamente** do caminho UserProfile (AppData\\Local\\hermes\\profiles\\pivete):
- **NÃO MOVER** — movimento quebraria o runtime atual
- **DOCUMENTAR DIVERGÊNCIA** em `MANIFEST.jsonl` + NUCLEO decisions
- **CLASSIFICAR:** `DOCUMENTED_DIVERGENCE` (não `QUARANTINE`)
- **RESOLUÇÃO FUTURA:** Migração unificada quando CHEFE autorizar Hermes Desktop + SOL_SOUL

**Lição:** Contraprova de dependência ativa do runtime **bloqueia quarentena** — apenas documenta.

---

### 13. HERMES-WEBUI BOOTSTRAP — Caminho Validado server.py
**Problema:** `bootstrap.py` falha no Windows (aliases python, paths, --skip-onboarding não existe).

**Caminho que funciona:**
```bash
# 1. Criar .env local
HERMES_WEBUI_HOST=127.0.0.1
HERMES_WEBUI_PORT=8787
HERMES_WEBUI_STATE_DIR=./webui_state
HERMES_WEBUI_DEFAULT_WORKSPACE=/c/CentralDark
HERMES_HOME=/c/Users/danda/AppData/Local/hermes
HERMES_CONFIG_PATH=/c/Users/danda/AppData/Local/hermes/profiles/pivete/config.yaml
HERMES_WEBUI_BOT_NAME=Hermes
HERMES_WEBUI_PASSWORD=localdev123
HERMES_WEBUI_SKIP_ONBOARDING=1

# 2. Subir server.py direto com venv do Hermes Agent
/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe server.py
```

**Validação:**
- `GET /health` → 200 OK
- `GET /api/kanban/board` → Kanban CRUD funcionando
- `POST /api/chat/start` → RuntimeAdapter (legacy-journal) cria run
- `POST /api/kanban/tasks` → Task criada no board default

**O que NÃO funciona ainda:** `/api/session` create, `/api/runs/start` direto (usar `/api/chat/start`).

---

### 14. MCP CENTRALDARK LOCAL — Bootstrap Validado
**Procedimento:**
```bash
cd /c/CentralDark/apps/modulos/mcp
npm install
npm run build  # tsc compila src/ → dist/

# .env.local com vars mínimas
MCP_PORT=9100
MCP_PUBLIC_URL=http://localhost:9100
CENTRALDARK_ADMIN_KEY=local-dev-key-123
MCP_SESSION_SECRET=local-dev-session-secret-456
LOG_LEVEL=debug
LOG_DIR=./logs
VPS_REPO_PATH=/c/CentralDark
PM2_ALLOWED_RESTART=CentralDark-MCP
GITHUB_OWNER=ServerVpss
GITHUB_REPO=CentralDark

# Subir
node dist/index.js  # background

# Validar
curl http://localhost:9100/health      # v0.4.0, 110 tools
curl http://localhost:9100/status.json # catálogo completo + conectores
```

**Conectores no status.json:**
- GitHub API: OK (227ms)
- OAuth GitHub: WARN — GITHUB_CLIENT_SECRET ausente
- Supabase: WARN — sem env
- VPS SSH: WARN — sem VPS_SSH_KEY_LOVABLE/VPS_HOST_LOVABLE
- Persistência: OK — /root/CentralDark/secrets/mcp-state.json

---

### 15. SOL DESKTOP TAURI — Blocker Windows App Control
**Erro:** `os error 4551` — política de Controle de Aplicativo bloqueia build script Rust (`build-script-build` nunca executado).

**Workarounds conhecidos:**
1. Adicionar `target/` às exclusões do Windows Defender / App Control
2. `cargo install tauri-cli` + `tauri dev` direto
3. Build em WSL2 / Linux (Tauri nativo)

**Status POC:** Build frontend OK (`npm run build` ✅), Tauri dev falha no build Rust.

---

### 16. TRI-ROOT RECONCILIATION — Metodologia Comprovada
**Três raízes, três papéis:**
| Raiz | Papel | Autoridade |
|------|-------|------------|
| `C:\CentralDark` | Canonical Repo | Git, workflows, agents, docs, apps/modulos |
| `E:\CentralDark\Pivete` | Operational Home | SOUL, config.yaml, NUCLEO, skills, cron, quarantine |
| `C:\Users\danda` | Tool State | .codex, .claude, .hermes (runtime), .config, etc. |

**Duplicatas resolvidas:**
- `E:\CentralDark\.claude` → quarentena (não no git, sem consumidores)
- `E:\CentralDark\_MAPA_CASA` → não existia (índice mestre em C:)
- SOUL.md + config.yaml → **DOCUMENTED_DIVERGENCE** (runtime lê UserProfile)

**Legado congelado:**
- `elite-gateway/zendriver/chatgpt.com` → `LEGACY_DISABLED` (zero processos, zero consumidores)
- Código preservado em `C:\CentralDark\apps\modulos\elite-gateway\scripts\`

---

### 17. ARQUITETURA RUNTIME WIRING — Peças Existentes Mapeadas
**Fluxo canônico (não recriar):**
```
WebUI/Telegram → hermes-webui (BFF) → RuntimeAdapter → Hermes Kanban → Executor/Critic/GraphRAG
                                            ↓
                                    Execution Broker + Worktrees
                                            ↓
                                    Live Preview / GitHub Gate
```

**Peças existentes (REUSE):**
| Componente | Local | Status |
|------------|-------|--------|
| Hermes Kanban (dispatcher único) | `hermes-webui/api/kanban_bridge.py` | ✅ CRUD + SSE + claim-lock |
| RuntimeAdapter | `hermes-webui/api/runtime_adapter.py` | ✅ legacy-journal + runner-local |
| HERMES-CORE Orchestrator | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` | ✅ loop 5s, missions, decisor |
| Arsenal Adapter | `apps/modulos/arsenal-openai-adapter/server.mjs` | ✅ OpenAI-compat, Council |
| Bot Telegram | `apps/bot-telegram/unified-bot.cjs` | ✅ @srver1bot, skills, webhook |
| OAuth Broker | `apps/modulos/oauth-broker/server.mjs` | ✅ providers, seed |
| Status/Graph Panel | `apps/modulos/status/` | ✅ painel vivo, capsula, graph 3D |
| Memória API | `apps/modulos/memoria-api/index.mjs` | ✅ |
| Obsidian Plugin | `apps/modulos/obsidian-plugin-grafo-vivo/` | ✅ compilado |

**NÃO EXISTE (gaps):**
- CentralDark BFF unificado (hermes-webui é candidato natural)
- Execution Broker explícito (worktrees, builders, handoffs)
- SOL Desktop conectado ao runtime (POC builda, não roda)

**Regra:** Hermes Kanban = ÚNICO dispatcher. Não criar fila/orquestrador paralelo.

### 12. SOUL DIVERGENCE DOCUMENTATION — Runtime Block Pattern
**Cenário:** Mesmo arquivo (SOUL.md, config.yaml) existe em dois caminhos:
- **Canônico:** `E:\\CentralDark\\Pivete\\` (versão atual, HERMES-CASA)
- **Runtime Ativo:** `C:\\Users\\danda\\AppData\\Local\\hermes\\profiles\\pivete\\` (versão antiga, HERMES legacy)

**Regra:** Se o **runtime Hermes lê ativamente** do caminho UserProfile (AppData\\Local\\hermes\\profiles\\pivete):
- **NÃO MOVER** — movimento quebraria o runtime atual
- **DOCUMENTAR DIVERGÊNCIA** em `MANIFEST.jsonl` + NUCLEO decisions
- **CLASSIFICAR:** `DOCUMENTED_DIVERGENCE` (não `QUARANTINE`)
- **RESOLUÇÃO FUTURA:** Migração unificada quando CHEFE autorizar Hermes Desktop + SOL_SOUL

**Lição:** Contraprova de dependência ativa do runtime **bloqueia quarentena** — apenas documenta.

---

### 13. HERMES-WEBUI BOOTSTRAP — Caminho Validado server.py
**Problema:** `bootstrap.py` falha no Windows (aliases python, paths, --skip-onboarding não existe).

**Caminho que funciona:**
```bash
# 1. Criar .env local
HERMES_WEBUI_HOST=127.0.0.1
HERMES_WEBUI_PORT=8787
HERMES_WEBUI_STATE_DIR=./webui_state
HERMES_WEBUI_DEFAULT_WORKSPACE=/c/CentralDark
HERMES_HOME=/c/Users/danda/AppData/Local/hermes
HERMES_CONFIG_PATH=/c/Users/danda/AppData/Local/hermes/profiles/pivete/config.yaml
HERMES_WEBUI_BOT_NAME=Hermes
HERMES_WEBUI_PASSWORD=localdev123
HERMES_WEBUI_SKIP_ONBOARDING=1

# 2. Subir server.py direto com venv do Hermes Agent
/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe server.py
```

**Validação:**
- `GET /health` → 200 OK
- `GET /api/kanban/board` → Kanban CRUD funcionando
- `POST /api/chat/start` → RuntimeAdapter (legacy-journal) cria run
- `POST /api/kanban/tasks` → Task criada no board default

**O que NÃO funciona ainda:** `/api/session` create, `/api/runs/start` direto (usar `/api/chat/start`).

---

### 14. MCP CENTRALDARK LOCAL — Bootstrap Validado
**Procedimento:**
```bash
cd /c/CentralDark/apps/modulos/mcp
npm install
npm run build  # tsc compila src/ → dist/

# .env.local com vars mínimas
MCP_PORT=9100
MCP_PUBLIC_URL=http://localhost:9100
CENTRALDARK_ADMIN_KEY=local-dev-key-123
MCP_SESSION_SECRET=local-dev-session-secret-456
LOG_LEVEL=debug
LOG_DIR=./logs
VPS_REPO_PATH=/c/CentralDark
PM2_ALLOWED_RESTART=CentralDark-MCP
GITHUB_OWNER=ServerVpss
GITHUB_REPO=CentralDark

# Subir
node dist/index.js  # background

# Validar
curl http://localhost:9100/health      # v0.4.0, 110 tools
curl http://localhost:9100/status.json # catálogo completo + conectores
```

**Conectores no status.json:**
- GitHub API: OK (227ms)
- OAuth GitHub: WARN — GITHUB_CLIENT_SECRET ausente
- Supabase: WARN — sem env
- VPS SSH: WARN — sem VPS_SSH_KEY_LOVABLE/VPS_HOST_LOVABLE
- Persistência: OK — /root/CentralDark/secrets/mcp-state.json

---

### 15. SOL DESKTOP TAURI — Blocker Windows App Control
**Erro:** `os error 4551` — política de Controle de Aplicativo bloqueia build script Rust (`build-script-build` nunca executado).

**Workarounds conhecidos:**
1. Adicionar `target/` às exclusões do Windows Defender / App Control
2. `cargo install tauri-cli` + `tauri dev` direto
3. Build em WSL2 / Linux (Tauri nativo)

**Status POC:** Build frontend OK (`npm run build` ✅), Tauri dev falha no build Rust.

---

### 16. TRI-ROOT RECONCILIATION — Metodologia Comprovada
**Três raízes, três papéis:**
| Raiz | Papel | Autoridade |
|------|-------|------------|
| `C:\CentralDark` | Canonical Repo | Git, workflows, agents, docs, apps/modulos |
| `E:\CentralDark\Pivete` | Operational Home | SOUL, config.yaml, NUCLEO, skills, cron, quarantine |
| `C:\Users\danda` | Tool State | .codex, .claude, .hermes (runtime), .config, etc. |

**Duplicatas resolvidas:**
- `E:\CentralDark\.claude` → quarentena (não no git, sem consumidores)
- `E:\CentralDark\_MAPA_CASA` → não existia (índice mestre em C:)
- SOUL.md + config.yaml → **DOCUMENTED_DIVERGENCE** (runtime lê UserProfile)

**Legado congelado:**
- `elite-gateway/zendriver/chatgpt.com` → `LEGACY_DISABLED` (zero processos, zero consumidores)
- Código preservado em `C:\CentralDark\apps\modulos\elite-gateway\scripts\`

---

### 17. ARQUITETURA RUNTIME WIRING — Peças Existentes Mapeadas
**Fluxo canônico (não recriar):**
```
WebUI/Telegram → hermes-webui (BFF) → RuntimeAdapter → Hermes Kanban → Executor/Critic/GraphRAG
                                            ↓
                                    Execution Broker + Worktrees
                                            ↓
                                    Live Preview / GitHub Gate
```

**Peças existentes (REUSE):**
| Componente | Local | Status |
|------------|-------|--------|
| Hermes Kanban (dispatcher único) | `hermes-webui/api/kanban_bridge.py` | ✅ CRUD + SSE + claim-lock |
| RuntimeAdapter | `hermes-webui/api/runtime_adapter.py` | ✅ legacy-journal + runner-local |
| HERMES-CORE Orchestrator | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` | ✅ loop 5s, missions, decisor |
| Arsenal Adapter | `apps/modulos/arsenal-openai-adapter/server.mjs` | ✅ OpenAI-compat, Council |
| Bot Telegram | `apps/bot-telegram/unified-bot.cjs` | ✅ @srver1bot, skills, webhook |
| OAuth Broker | `apps/modulos/oauth-broker/server.mjs` | ✅ providers, seed |
| Status/Graph Panel | `apps/modulos/status/` | ✅ painel vivo, capsula, graph 3D |
| Memória API | `apps/modulos/memoria-api/index.mjs` | ✅ |
| Obsidian Plugin | `apps/modulos/obsidian-plugin-grafo-vivo/` | ✅ compilado |

**NÃO EXISTE (gaps):**
- CentralDark BFF unificado (hermes-webui é candidato natural)
- Execution Broker explícito (worktrees, builders, handoffs)
- SOL Desktop conectado ao runtime (POC builda, não roda)

**Regra:** Hermes Kanban = ÚNICO dispatcher. Não criar fila/orquestrador paralelo.

---

### 18. EXECUTOR WORKTREE TOOL — VPS Path Hardcoded Fix Needed
**Problema:** Ferramenta `worktree` no Executor Agent (`apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`) tem `WORKTREE_ROOT = '/root/CentralDark'` hardcoded — funciona na VPS, falha no Windows local (`bash: cd: /root/CentralDark: No such file or directory`).

**Solução (delta mínimo):**
```javascript
// Detectar runtime e definir root apropriado
const isWindows = process.platform === 'win32';
const WORKTREE_ROOT = isWindows 
  ? 'C:/CentralDark/worktrees'  // ou E:/CentralDark/Pivete/worktrees
  : '/root/CentralDark/worktrees';
```

**Validação:** 10/10 syntax checks pass, `node --check` PASS, mas runtime falha no Windows. Tool existe e está pronta — só precisa do path adaptativo.

**Worktree dirs já existem:**
- `C:\CentralDark\.worktrees\` (repo canonico)
- `E:\CentralDark\Pivete\worktrees\` (casa)

---

### 19. SOL DESKTOP TAURI — Windows App Control Blocker (os error 4551)
**Erro:** `failed to run custom build command... os error 4551` — Windows App Control / Defender bloqueia o build script Rust (`build-script-build` nunca executado).

**Workarounds validados:**
1. **Excluir `target/` do Windows Defender / App Control** (mais direto)
2. `cargo install tauri-cli` + `tauri dev` direto
3. Build em WSL2 / Linux (Tauri nativo)

**Status POC:** Frontend build OK (`npm run build` ✅), Vite dev server sobe na 1420, mas Cargo build falha no `build-script-build` (357/360).

**Não reescrever Tauri.** Registrar workaround canônico e seguir.

---

### 20. BOT TELEGRAM — Token Presence Check Pattern
**Regra:** Antes de tentar T3 Bot E2E, verificar **presença da env var** (não o valor):
```bash
env | grep -i "SRVER1_BOT_TOKEN" || echo "NOT_SET_IN_ENV"
```
- Se presente no secret store → prosseguir com 1 msg Telegram → MCP → Kanban
- Se ausente → registrar `BLOCKED_ON_BOT_TOKEN` e seguir. **Não pedir token no chat.**

**Bot existe:** `apps/bot-telegram/unified-bot.cjs` consolidado (@srver1bot, skills, webhook/polling, Hub ADM).

---

### 21. HERMES-WEBUI BOOTSTRAP — server.py Direct Path Validado
**bootstrap.py falha no Windows** (aliases python, paths, `--skip-onboarding` não existe).

**Caminho que funciona:**
```bash
# 1. .env local
HERMES_WEBUI_HOST=127.0.0.1
HERMES_WEBUI_PORT=8787
HERMES_WEBUI_STATE_DIR=./webui_state
HERMES_WEBUI_DEFAULT_WORKSPACE=/c/CentralDark
HERMES_HOME=/c/Users/danda/AppData/Local/hermes
HERMES_CONFIG_PATH=/c/Users/danda/AppData/Local/hermes/profiles/pivete/config.yaml
HERMES_WEBUI_BOT_NAME=Hermes
HERMES_WEBUI_PASSWORD=localdev123
HERMES_WEBUI_SKIP_ONBOARDING=1

# 2. Subir server.py direto com venv do Hermes Agent
/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe server.py
```

**Validação confirmada:**
- `GET /health` → 200 OK
- `GET /api/kanban/board` → Kanban CRUD
- `POST /api/chat/start` → RuntimeAdapter (legacy-journal) cria run
- `POST /api/kanban/tasks` → Task criada no board default

---

### 22. MCP CENTRALDARK LOCAL — Bootstrap Validado (110 Tools)
**Procedimento validado:**
```bash
cd /c/CentralDark/apps/modulos/mcp
npm install
npm run build

# .env.local
MCP_PORT=9100
MCP_PUBLIC_URL=http://localhost:9100
CENTRALDARK_ADMIN_KEY=local-dev-key-123
MCP_SESSION_SECRET=local-dev-session-secret-456
LOG_LEVEL=debug
LOG_DIR=./logs
VPS_REPO_PATH=/c/CentralDark
PM2_ALLOWED_RESTART=CentralDark-MCP
GITHUB_OWNER=ServerVpss
GITHUB_REPO=CentralDark

node dist/index.js  # background
curl http://localhost:9100/health      # v0.4.0, 110 tools
curl http://localhost:9100/status.json # catálogo completo
```

**Conectores no status.json:**
- GitHub API: OK (~227ms)
- OAuth GitHub: WARN — GITHUB_CLIENT_SECRET ausente
- Supabase: WARN — sem env
- VPS SSH: WARN — sem VPS_SSH_KEY_LOVABLE/VPS_HOST_LOVABLE
- Persistência: OK — `/root/CentralDark/secrets/mcp-state.json`

---

### 23. KANBAN BOARD STATE TRANSITIONS — Ordem Obrigatória
**Testado e confirmado:** `todo → ready → done` (não `todo → done` direto).

```bash
# Create
POST /api/kanban/tasks {"title":"...", "status":"todo"}

# Move
PATCH /api/kanban/tasks/{id}?board=default {"status":"ready"}
PATCH /api/kanban/tasks/{id}?board=default {"status":"done"}
```

**Validação:** Task `t_fee8067a` movida `todo → ready → done` em 51s. `todo → done` direto retorna erro.

---

### 24. WORKTREE TOOL — Windows Path Adaptation Required
**Arquivo:** `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`

**Estado atual:** Tool completo (create/list/remove/prune), 10/10 syntax checks ✅, `node --check` PASS, mas `WORKTREE_ROOT = '/root/CentralDark'` hardcoded.

**Fix necessário (delta mínimo):**
```javascript
const isWindows = process.platform === 'win32';
const WORKTREE_ROOT = isWindows 
  ? 'C:/CentralDark/worktrees'  // ou E:/CentralDark/Pivete/worktrees
  : '/root/CentralDark/worktrees';
```

**Dirs já prontos:**
- `C:\CentralDark\.worktrees\` (repo canonico)
- `E:\CentralDark\Pivete\worktrees\` (casa)

**Teste local:** `git worktree list --porcelain` funciona no Windows Git Bash.

---

### 26. DAEMON ROBUSTO — PADRÃO OBRIGATÓRIO PARA PROCESSOS DE LONGA DURAÇÃO

**Descoberta 2026-08-23:** Processos de longa duração (watchdogs, servidores, bridges, adapters) morriam silenciosamente quando o terminal fechava, sem health check, sem auto-restart, sem logging persistente, sem state persistence.

**Regra Cristalizada:** Todo processo de longa duração DEVE implementar os 6 pilares do Daemon Robusto:

| Pilar | Implementação Mínima |
|-------|---------------------|
| **1. Signal Handlers** | SIGTERM, SIGINT, SIGHUP → graceful shutdown |
| **2. Health Check HTTP** | `/health` → `operation + timestamp ISO8601 + sha256 + proved: true` |
| **3. Auto-Restart Watchdog** | Loop 30s monitora componentes → restart automático |
| **4. PID File + atexit** | PID file atômico + `atexit.register(cleanup)` |
| **5. Logging Persistente** | `FileHandler + StreamHandler` |
| **6. Auto-Save State** | Estado salvo a cada 60s com `timestamp + sha256 + proved: true` |

**Estrutura de prova obrigatória para TODA operação:**
```json
{
  "operation": "health_check|crystal_write|carve_emit|state_save",
  "timestamp": "2026-08-23T15:58:04.976222",
  "sha256": "efa2c3492b8d248a91d029039d2de59a662c5a903d6ff2759652ec6b031faf44",
  "details": { ... },
  "proved": true
}
```

**Componentes CentralDark que DEVEM seguir este padrão:**
- Auto-Destilador ✅ (implementado e provado)
- MCP Server (9100), Hermes WebUI/BFF (8787), Kanban Bridge, Arsenal Adapter (8090), OAuth Broker, Memória API, Status/Graph Panel, Bot Telegram, SOL Desktop

**Referência completa:** `references/daemon-robust-mandatory-rules.md`

---

### 27. AUTO-DESTILADOR DEATH LESSON — Terminal Background Process Dies Silently

**Descoberta 2026-08-23:** O Auto-Destilador rodava em `background=true` sem `notify_on_complete=true`. Quando o usuário fechou o terminal/sessão, o processo morreu silenciosamente — sem crash log, sem Application Error no Windows Event Viewer, apenas parou de processar arquivos.

**Evidência:** Último CARVE às 02:15:31, nenhum novo CARVE após isso, processos MCP/BFF continuaram rodando (infra sobreviveu, coordenação morreu).

**Causa Raiz:** Background terminal session morreu → processo órfão morreu junto.

**Correção Definitiva:** Mover para Daemon Robusto (Liçao 26) com signal handlers + health check + auto-restart + PID file + logging persistente + auto-save state.

**Regra:** `background=true` SEMPRE com `notify_on_complete=true` OU usar Daemon Robusto completo. Processo de longa duração NUNCA deve depender de sessão terminal.

**Referência:** `references/auto-destilador-death-lesson.md`

---

### 28. AUTO-DESTILADOR HOOK KANBAN — Card Automático por Cristal

**Implementado 2026-08-23:** Cada cristal gerado pelo Auto-Destilador agora cria automaticamente um card no Kanban via `criar_card_kanban()` chamado dentro de `emitir_carve()`.

**Fluxo:** Arquivo → Detecta → Classifica → Destila → Cristaliza → Escreve → Arquiva → **Emite CARVE** → **Cria Card Kanban** (hook ativo).

**Validação:** Card `t_5d0fd5e3 - [COMANDO] TESTE_FINAL.txt` criado automaticamente no board `default` status `todo`.

**Código-chave:** `emitir_carve()` chama `criar_card_kanban()` que faz POST para `http://127.0.0.1:8787/api/kanban/tasks` com título `[TIPO] arquivo`, corpo com SHA/destino/origem/timestamp/ouro, priority 1, status todo.

**Referência:** `references/auto-destilador-kanban-hook.md`

---

### 29. HEALTH CHECK COM PROVA — Padrão Obrigatório

**Regra:** Todo endpoint `/health` DEVE retornar estrutura de prova:

```json
{
  "operation": "health_check",
  "timestamp": "2026-08-23T16:01:37.789249",
  "sha256": "e383503e409611aabd0844d6e3208f19e6cbfdbb2fd8f216898507c851d6345b",
  "details": { "service": "auto-destilador", "watcher_active": true, "pid": 37908 },
  "proved": true
}
```

**Campos obrigatórios:** `operation`, `timestamp` (ISO8601), `sha256` (do details), `details`, `proved: true`.

**Aplicado em:** Auto-Destilador (porta 8788), deve ser aplicado em MCP (9100), BFF (8787), Arsenal (8090), etc.

---

### 30. RUNTIME STATE AUTO-SAVE — A cada 60s com Prova

**Regra:** Estado do runtime salvo automaticamente a cada 60s no arquivo JSON com estrutura de prova:

```json
{
  "running": true,
  "uptime_seconds": 133.03776049613953,
  "processed_count": 1,
  "error_count": 0,
  "pending_files": [],
  "watcher_active": true,
  "pid": 25300,
  "last_save": "2026-08-23T16:03:42.400015",
  "timestamp": "2026-08-23T16:03:42.400015",
  "sha256": "bc596850d1ee86678d19290c03635a84f20b3bc402ad4a3f02ccdf50dc2b8b45"
}
```

**Campos obrigatórios:** `timestamp` (ISO8601), `sha256` (do estado completo), `proved` implícito via estrutura.

**Implementado em:** Auto-Destilador (`auto-destilador-state.json`), deve ser padrão para todos daemons.

---

### 31. CONCEITO ≠ PROCESSO — Descoberta Crítica 2026-08-23

**Regra Nova:** "SOL" no papel ≠ "SOL" no runtime. Nome não prova existência.

**Nova Lente Operacional:** FÍSICO → TEMPORAL → CAUSAL → PROVA

1. **FÍSICO**: Onde existe fisicamente? (processo, arquivo, porta)
2. **TEMPORAL**: Quando mudou? (timestamp, delta, antes/depois)
3. **CAUSAL**: Qual dependência caiu? (humano dormiu = transporte parou)
4. **PROVA**: Evidência imutável (rastro.jsonl, timestamps, logs)

**Cadeado:** COINCIDÊNCIA TEMPORAL → HIPÓTESE → MECANISMO → EVIDÊNCIA → CAUSA

> Correlação temporal sugere, não prova. Mecanismo prova.

**Descoberta:** TU ERA A SOL — Transporte humano de contexto mascarado como autonomia. Quando CHEFE dormiu, transporte parou → Auto-Destilador parou. Infra viveu, coordenação morreu.

**Regra Cristalizada:** CONCEITO ≠ PROCESSO (entrada no SOUL ao lado de UNKNOWN ≠ PASS e ACTION ≠ PROOF).

**Nova Lente Operacional:** FÍSICO → TEMPORAL → CAUSAL → PROVA (lente padrão para investigação/observabilidade da Casa).

**Referência:** `references/conceito-vs-processo-temporal-causal.md`


### 32. SOUL.md REGRAS OBRIGATÓRIAS 2026-08-23 — Adicionadas ao Cartão de Boot

**Novas regras no SOUL.md Cartão de Boot:**

```text
TUDO_COM_DATA_HORA_HASH_PROVA=SIM
DATA_HORA_PADRAO_ISO8601=OBRIGATORIO
SHA256_HASH_PADRAO=OBRIGATORIO
PROVA_OBRIGATORIA_PARA_TUDO=SIM
RUNTIME_GRAVA_AUTOMATICO=SIM
```

**Significado:** TUDO que o sistema faz DEVE ter timestamp ISO8601, SHA256 hash, registro de prova, e ser gravado no runtime automaticamente. Sem exceções.

**Aplicado em:** Auto-Destilador (health check, CARVE, runtime state, logs), deve ser padrão universal.


### 33. DAEMON ROBUSTO — PADRÃO OBRIGATÓRIO PARA PROCESSOS DE LONGA DURAÇÃO

**Descoberta 2026-08-23:** Processos de longa duração (watchdogs, servidores, bridges, adapters) morriam silenciosamente quando o terminal fechava, sem health check, sem auto-restart, sem logging persistente, sem state persistence.

**Regra Cristalizada:** Todo processo de longa duração DEVE implementar os 6 pilares do Daemon Robusto:

| Pilar | Implementação Mínima |
|-------|---------------------|
| **1. Signal Handlers** | SIGTERM, SIGINT, SIGHUP → graceful shutdown |
| **2. Health Check HTTP** | `/health` → `operation + timestamp ISO8601 + sha256 + proved: true` |
| **3. Auto-Restart Watchdog** | Loop 30s monitora componentes → restart automático |
| **4. PID File + atexit** | PID file atômico + `atexit.register(cleanup)` |
| **5. Logging Persistente** | `FileHandler + StreamHandler` |
| **6. Auto-Save State** | Estado salvo a cada 60s com `timestamp + sha256 + proved: true` |

**Estrutura de prova obrigatória para TODA operação:**
```json
{
  "operation": "health_check|crystal_write|carve_emit|state_save",
  "timestamp": "2026-08-23T15:58:04.976222",
  "sha256": "efa2c3492b8d248a91d029039d2de59a662c5a903d6ff2759652ec6b031faf44",
  "details": { ... },
  "proved": true
}
```

**Componentes CentralDark que DEVEM seguir este padrão:**
- Auto-Destilador ✅ (implementado e provado)
- MCP Server (9100), Hermes WebUI/BFF (8787), Kanban Bridge, Arsenal Adapter (8090), OAuth Broker, Memória API, Status/Graph Panel, Bot Telegram, SOL Desktop

**Referência completa:** `references/daemon-robust-mandatory-rules.md`


### 34. AUTO-DESTILADOR DEATH LESSON — Terminal Background Process Dies Silently

**Descoberta 2026-08-23:** O Auto-Destilador rodava em `background=true` sem `notify_on_complete=true`. Quando o usuário fechou o terminal/sessão, o processo morreu silenciosamente — sem crash log, sem Application Error no Windows Event Viewer, apenas parou de processar arquivos.

**Evidência:** Último CARVE às 02:15:31, nenhum novo CARVE após isso, processos MCP/BFF continuaram rodando (infra sobreviveu, coordenação morreu).

**Causa Raiz:** Background terminal session morreu → processo órfão morreu junto.

**Correção Definitiva:** Mover para Daemon Robusto (Liçao 33) com signal handlers + health check + auto-restart + PID file + logging persistente + auto-save state.

**Regra:** `background=true` SEMPRE com `notify_on_complete=true` OU usar Daemon Robusto completo. Processo de longa duração NUNCA deve depender de sessão terminal.

**Referência:** `references/auto-destilador-death-lesson.md`


### 35. AUTO-DESTILADOR HOOK KANBAN — Card Automático por Cristal

**Implementado 2026-08-23:** Cada cristal gerado pelo Auto-Destilador agora cria automaticamente um card no Kanban via `criar_card_kanban()` chamado dentro de `emitir_carve()`.

**Fluxo:** Arquivo → Detecta → Classifica → Destila → Cristaliza → Escreve → Arquiva → **Emite CARVE** → **Cria Card Kanban** (hook ativo).

**Validação:** Card `t_5d0fd5e3 - [COMANDO] TESTE_FINAL.txt` criado automaticamente no board `default` status `todo`.

**Código-chave:** `emitir_carve()` chama `criar_card_kanban()` que faz POST para `http://127.0.0.1:8787/api/kanban/tasks` com título `[TIPO] arquivo`, corpo com SHA/destino/origem/timestamp/ouro, priority 1, status todo.

**Referência:** `references/auto-destilador-kanban-hook.md`


### 36. HEALTH CHECK COM PROVA — Padrão Obrigatório

**Regra:** Todo endpoint `/health` DEVE retornar estrutura de prova:

```json
{
  "operation": "health_check",
  "timestamp": "2026-08-23T16:01:37.789249",
  "sha256": "e383503e409611aabd0844d6e3208f19e6cbfdbb2fd8f216898507c851d6345b",
  "details": { "service": "auto-destilador", "watcher_active": true, "pid": 37908 },
  "proved": true
}
```

**Campos obrigatórios:** `operation`, `timestamp` (ISO8601), `sha256` (do details), `details`, `proved: true`.

**Aplicado em:** Auto-Destilador (porta 8788), deve ser aplicado em MCP (9100), BFF (8787), Arsenal (8090), etc.


### 37. RUNTIME STATE AUTO-SAVE — A cada 60s com Prova

**Regra:** Estado do runtime salvo automaticamente a cada 60s no arquivo JSON com estrutura de prova:

```json
{
  "running": true,
  "uptime_seconds": 133.03776049613953,
  "processed_count": 1,
  "error_count": 0,
  "pending_files": [],
  "watcher_active": true,
  "pid": 25300,
  "last_save": "2026-08-23T16:03:42.400015",
  "timestamp": "2026-08-23T16:03:42.400015",
  "sha256": "bc596850d1ee86678d19290c03635a84f20b3bc402ad4a3f02ccdf50dc2b8b45"
}
```

**Campos obrigatórios:** `timestamp` (ISO8601), `sha256` (do estado completo), `proved` implícito via estrutura.

**Implementado em:** Auto-Destilador (`auto-destilador-state.json`), deve ser padrão para todos daemons.


### 38. AUTO-DESTILADOR DEATH LESSON — Terminal Background Process Dies Silently

**Descoberta 2026-08-23:** O Auto-Destilador rodava em `background=true` sem `notify_on_complete=true`. Quando o usuário fechou o terminal/sessão, o processo morreu silenciosamente — sem crash log, sem Application Error no Windows Event Viewer, apenas parou de processar arquivos.

**Evidência:** Último CARVE às 02:15:31, nenhum novo CARVE após isso, processos MCP/BFF continuaram rodando (infra sobreviveu, coordenação morreu).

**Causa Raiz:** Background terminal session morreu → processo órfão morreu junto.

**Correção Definitiva:** Mover para Daemon Robusto (Liçao 33) com signal handlers + health check + auto-restart + PID file + logging persistente + auto-save state.

**Regra:** `background=true` SEMPRE com `notify_on_complete=true` OU usar Daemon Robusto completo. Processo de longa duração NUNCA deve depender de sessão terminal.

**Referência:** `references/auto-destilador-death-lesson.md`


### 39. AUTO-DESTILADOR HOOK KANBAN — Card Automático por Cristal

**Implementado 2026-08-23:** Cada cristal gerado pelo Auto-Destilador agora cria automaticamente um card no Kanban via `criar_card_kanban()` chamado dentro de `emitir_carve()`.

**Fluxo:** Arquivo → Detecta → Classifica → Destila → Cristaliza → Escreve → Arquiva → **Emite CARVE** → **Cria Card Kanban** (hook ativo).

**Validação:** Card `t_5d0fd5e3 - [COMANDO] TESTE_FINAL.txt` criado automaticamente no board `default` status `todo`.

**Código-chave:** `emitir_carve()` chama `criar_card_kanban()` que faz POST para `http://127.0.0.1:8787/api/kanban/tasks` com título `[TIPO] arquivo`, corpo com SHA/destino/origem/timestamp/ouro, priority 1, status todo.

**Referência:** `references/auto-destilador-kanban-hook.md`


### 40. HEALTH CHECK COM PROVA — Padrão Obrigatório

**Regra:** Todo endpoint `/health` DEVE retornar estrutura de prova:

```json
{
  "operation": "health_check",
  "timestamp": "2026-08-23T16:01:37.789249",
  "sha256": "e383503e409611aabd0844d6e3208f19e6cbfdbb2fd8f216898507c851d6345b",
  "details": { "service": "auto-destilador", "watcher_active": true, "pid": 37908 },
  "proved": true
}
```

**Campos obrigatórios:** `operation`, `timestamp` (ISO8601), `sha256` (do details), `details`, `proved: true`.

**Aplicado em:** Auto-Destilador (porta 8788), deve ser aplicado em MCP (9100), BFF (8787), Arsenal (8090), etc.


### 41. RUNTIME STATE AUTO-SAVE — A cada 60s com Prova

**Regra:** Estado do runtime salvo automaticamente a cada 60s no arquivo JSON com estrutura de prova:

```json
{
  "running": true,
  "uptime_seconds": 133.03776049613953,
  "processed_count": 1,
  "error_count": 0,
  "pending_files": [],
  "watcher_active": true,
  "pid": 25300,
  "last_save": "2026-08-23T16:03:42.400015",
  "timestamp": "2026-08-23T16:03:42.400015",
  "sha256": "bc596850d1ee86678d19290c03635a84f20b3bc402ad4a3f02ccdf50dc2b8b45"
}
```

**Campos obrigatórios:** `timestamp` (ISO8601), `sha256` (do estado completo), `proved` implícito via estrutura.

**Implementado em:** Auto-Destilador (`auto-destilador-state.json`), deve ser padrão para todos daemons.

---

### 32. SOUL.md REGRAS OBRIGATÓRIAS 2026-08-23 — Adicionadas ao Cartão de Boot

**Novas regras no SOUL.md Cartão de Boot:**

```text
TUDO_COM_DATA_HORA_HASH_PROVA=SIM
DATA_HORA_PADRAO_ISO8601=OBRIGATORIO
SHA256_HASH_PADRAO=OBRIGATORIO
PROVA_OBRIGATORIA_PARA_TUDO=SIM
RUNTIME_GRAVA_AUTOMATICO=SIM
```

**Significado:** TUDO que o sistema faz DEVE ter timestamp ISO8601, SHA256 hash, registro de prova, e ser gravado no runtime automaticamente. Sem exceções.

**Aplicado em:** Auto-Destilador (health check, CARVE, runtime state, logs), deve ser padrão universal.

---

### 25. AUTO-DESTILADOR PATTERN — Watchdog + Cristalização Automática
**Descoberta:** Sistema autônomo que monitora pastas de entrada (`E:\\CentralDark\\_MAPA_CASA\\Nova pasta*`), destila conteúdo, sintetiza, cristaliza e escreve **direto no NUCLEO/motor runtime** sem intervenção manual.

**Fluxo completo validado (3/3 testes PASS):**
```
ARQUIVO NOVO EM PASTA MONITORADA
       ↓ (≤5s debounce)
DETECTA (watchdog filesystem)
       ↓
CLASSIFICA (conteúdo semântico, não só nome)
       ↓
DESTILA (extrai ouro: comandos, decisões, padrões, contratos, princípios, riscos, gaps)
       ↓
CRISTALIZA (4 portões FORJA: ≥3 ocorrências, ganho info > 0, contraprova sobrevivida, SHA datado)
       ↓
ESCREVE (destino canônico correto: commands/, contracts/, decisions/, patterns/, missions/, docs/reference/)
       ↓
ARQUIVA (history/downloads/<categoria>/)
       ↓
EMITE CARVE (rastro.jsonl — veredito CRISTAL)
       ↓
🎯 HOOK KANBAN: Cria card automático no board (Auto-Destilador → Kanban Bridge)
```

**Classificação automática (por conteúdo + nome):**
| Padrão | Destino Canônico |
|--------|------------------|
| `*COMANDO*`, `*PROMPT*` | `NUCLEO/commands/` |
| `*CONTRATO*`, `*GATE*`, `*SECURITY*` | `NUCLEO/contracts/` |
| `*TRILHO*` | `NUCLEO/patterns/` |
| `*ANTÍDOTO*`, `*ANTIDOTO*` | `NUCLEO/contracts/` |
| `*DECISÃO*`, `*DECISAO*` | `NUCLEO/decisions/` |
| `*PADRÃO*`, `*PATTERN*`, `*MAPA*` | `NUCLEO/patterns/` |
| `*MISSÃO*`, `*MISSAO*` | `NUCLEO/missions/` |
| `*ARQUITETURA*`, `*ARVORE*`, `*PACOTÃO*` | `NUCLEO/docs/reference/` |
| `*FORJA*` | `NUCLEO/patterns/` |

**Bug corrigido (path de escrita):**
```python
# ANTES (errado) - escrevia na raiz do NUCLEO
os.makedirs(os.path.dirname(destino_abs), exist_ok=True)
filepath = os.path.join(os.path.dirname(destino_abs), base_name)

# DEPOIS (correto) - escreve na subpasta canônica
os.makedirs(destino_abs, exist_ok=True)
filepath = os.path.join(destino_abs, base_name)
```

**CARVE emitido automaticamente no `rastro.jsonl`:**
```json
{
  "carve": {"ancora": "AUTO_DESTILADOR", "missao": "AUTO_CRISTALIZACAO", "passo": "AUTO", "writer": "AUTO_DESTILADOR", "sha": "<sha>"},
  "curva": "Arquivo X -> Destilado -> Cristalizado (TIPO) -> destino",
  "gume": "Arquivo processado, ouro extraido, cristalizado, escrito no destino canonico, original arquivado",
  "veredito": "CRISTAL",
  "carry": "Cristal TIPO adicionado ao NUCLEO; arquivo original arquivado em history/downloads/",
  "timestamp": "2026-08-23T..."
}
```

**Integração com TRILHO:** O Auto-Destilador é uma lâmina do TRILHO — emite CARVES, respeita CHASSI (T1-T7), respeita FREIO (T7).

**Integrações Conceituais (Prontas para Implementar):**
- **Billing Monitoring** — Nous Portal free model tracking → Auto-Destilador detecta mudanças de billing → Kanban card
- **Hardware Telemetry** — Nuvoton + AMD ADL + D3D → Hardware Telemetry Adapter → Auto-Destilador → Kanban card (temp/usage/power)
- **SOUL Divergence** — Runtime block pattern → Auto-Destilador detecta divergência SOUL/config → Kanban card

**Referência completa:** `references/auto-destilador-pattern.md`

**Fluxo completo validado (3/3 testes PASS):**
```
ARQUIVO NOVO EM PASTA MONITORADA
       ↓ (≤5s debounce)
DETECTA (watchdog filesystem)
       ↓
CLASSIFICA (conteúdo semântico, não só nome)
       ↓
DESTILA (extrai ouro: comandos, decisões, padrões, contratos, princípios, riscos, gaps)
       ↓
CRISTALIZA (4 portões FORJA: ≥3 ocorrências, ganho info > 0, contraprova sobrevivida, SHA datado)
       ↓
ESCREVE (destino canônico correto: commands/, contracts/, decisions/, patterns/, missions/, docs/reference/)
       ↓
ARQUIVA (history/downloads/<categoria>/)
       ↓
EMITE CARVE (rastro.jsonl — veredito CRISTAL)
```

**Classificação automática (por conteúdo + nome):**
| Padrão | Destino Canônico |
|--------|------------------|
| `*COMANDO*`, `*PROMPT*` | `NUCLEO/commands/` |
| `*CONTRATO*`, `*GATE*`, `*SECURITY*` | `NUCLEO/contracts/` |
| `*TRILHO*` | `NUCLEO/patterns/` |
| `*ANTÍDOTO*`, `*ANTIDOTO*` | `NUCLEO/contracts/` |
| `*DECISÃO*`, `*DECISAO*` | `NUCLEO/decisions/` |
| `*PADRÃO*`, `*PATTERN*`, `*MAPA*` | `NUCLEO/patterns/` |
| `*MISSÃO*`, `*MISSAO*` | `NUCLEO/missions/` |
| `*ARQUITETURA*`, `*ARVORE*`, `*PACOTÃO*` | `NUCLEO/docs/reference/` |
| `*FORJA*` | `NUCLEO/patterns/` |

**Bug corrigido (path de escrita):**
```python
# ANTES (errado) - escrevia na raiz do NUCLEO
os.makedirs(os.path.dirname(destino_abs), exist_ok=True)
filepath = os.path.join(os.path.dirname(destino_abs), base_name)

# DEPOIS (correto) - escreve na subpasta canônica
os.makedirs(destino_abs, exist_ok=True)
filepath = os.path.join(destino_abs, base_name)
```

**CARVE emitido automaticamente no `rastro.jsonl`:**
```json
{
  "carve": {"ancora": "AUTO_DESTILADOR", "missao": "AUTO_CRISTALIZACAO", "passo": "AUTO", "writer": "AUTO_DESTILADOR", "sha": "<sha>"},
  "curva": "Arquivo X -> Destilado -> Cristalizado (TIPO) -> destino",
  "gume": "Arquivo processado, ouro extraido, cristalizado, escrito no destino canonico, original arquivado",
  "veredito": "CRISTAL",
  "carry": "Cristal TIPO adicionado ao NUCLEO; arquivo original arquivado em history/downloads/",
  "timestamp": "2026-08-23T..."
}
```

**Integração com TRILHO:** O Auto-Destilador é uma lâmina do TRILHO — emite CARVES, respeita CHASSI (T1-T7), respeita FREIO (T7).

**Referência completa:** `references/auto-destilador-pattern.md`

---

### 27. MOTOR-TESTE — O "APP CHROMIUM" DA CASA (cockpit + GitHub + workspace)
**Pedido do Chefe (2026-08-23):** localizar o "aplicativo CCROMIUM da CentralDark" com cockpit, conexão GitHub e workspace, em `C:\CentralDark` e `E:\`.

**Descoberta:** é o diretório **`MOTOR-TESTE`** (package `omniroute` — AI router Electron/Chromium/PWA), espelhado em:
- `E:\CentralDark\MOTOR-TESTE`  (primário)
- `C:\CentralDark\MOTOR-TESTE`  (mirror do repo canônico)

**Provas:** `src/app/(dashboard)/dashboard/compression/studio/CompressionCockpit.tsx` (cockpit), `src/app/api/github-skills` (GitHub), `docker/vnc-browser/chromium`, `apps/modulos/Bolt/source/` (Electron).

**Falsos positivos descartados:** `obsidian-app/` (Obsidian), `Pivete/MARKDOWN/APPCENTRALDARK EVOLUIR/` (Overclock IDE), `hermes-webui/` (BFF), `node_modules/chrome-launcher` (lib).

**Técnica de busca validada (Windows multi-root, sem timeout):** `search_files` falha em paths com letra de drive (`E:\CentralDark` → IO error); `grep -r`/`find` no volume `E:\` inteiro estoura o timeout (180s+). Usar terminal Git Bash: `ls -la` para orientar, depois `cd /e/CentralDark && find . -path ./node_modules -prune -o \( -iname "*chromium*" -o -iname "*cockpit*" \) -print`. Nunca varrer `E:\` cru. Detalhe em `references/centraldark-app-inventory-search.md`.

**Regra:** pedido de "Chromium/cockpit/GitHub app" da Casa → suspeitar de `MOTOR-TESTE`, não Obsidian/hermes-webui.

---

## Comunicação com o Chefe

- Vocativo Pivete permitido quando natural
- Em resenha/exploracao: responder ao que foi dito, nao converter automaticamente em skill/memoria/PR
- Em técnico copiável: bloco de código, PT-BR, comando completo
- Em explicação: duas camadas (SIGNIFICA → NA PRÁTICA → NOME TÉCNICO → PROVA → PRÓXIMO PASSO)

## Referências

- references/jeito-correto-pivete.md — metodo completo
- references/padrao-resposta.md — formato de resposta
- references/dicionario-github.md — vocabulário GitHub
- references/prompt-mestre-issues.md — missao issues V-REALTIME
- references/modo-operacional-loop.md — LOOP evidencia primeiro
- references/meta-lupa-summary.md — resumo da MetaLupa
- references/boot-receipt.yaml — template do recibo de boot
- references/pr-decomposition-method.md — método de decomposição determinística de PR histórico
- references/regenerative-self-refinement-engine.md — motor regenerativo Hermes
- references/kimetsu-legacy-architecture.md — arquitetura Respirações
- references/kimetsu-legacy-fixed-point-predicate.md — predicado Fixed Point corrigido
- references/fix-cyan-color.md — configuração terminal/editor
- references/hermes-regenerative-runtime.md — runtime regenerativo preso ao profile
- references/tri-root-inventory-legacy-freeze.md — metodologia tri-root + freeze legado + ownership Obsidian + identidade SOUL
- references/mcp-local-bootstrap.md — procedimento validado para subir MCP CentralDark localmente (health, status.json, 110 tools)
- references/soul-config-divergence-runtime-block.md — padrão de divergência SOUL/config quando runtime lê de UserProfile (AppData) vs canônico
- references/soul-hermes-casa-local-adapter-only.md — SOUL HERMES-CASA/pivete existe só como adaptador local, não no GitHub canônico