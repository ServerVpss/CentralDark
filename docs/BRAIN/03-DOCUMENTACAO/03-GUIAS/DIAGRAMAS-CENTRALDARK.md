---
title: "Diagramas do Sistema CentralDark"
date: 2026-06-29
updated: 2026-10-06
status: "DERIVED_VIEW"
tags: ["diagrama", "arquitetura", "fluxo", "mermaid", "sistema"]
category: M-Mapa-Sistema
sensitivity: INTERNAL
source: LEIA-ME-IA.md + owners canônicos listados neste documento
source_class: INTERNAL
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: docs/BRAIN/03-DOCUMENTACAO/03-GUIAS/
---

# Diagramas CentralDark — visão derivada do canônico

> Estes diagramas são uma **visualização derivada**, não fonte da verdade.
> Estado físico/runtime que não foi medido nesta rodada permanece `UNKNOWN|UNPROVEN`.
> Histórico anterior continua preservado no Git.

```text
MERMAID != VERDADE
CANONICO -> MERMAID
MERMAID -> INVENTAR_CANONICO = FORBIDDEN
```

Fontes canônicas desta visão:

- `LEIA-ME-IA.md` — boot, autoridade e precedência;
- `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` — coordenação e Writer único;
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md` — método cognitivo/mineração;
- `scripts/memory-linker/README.md` — pipeline de memória;
- `apps/modulos/HERMES-CORE/core/perception-orchestra.mjs` — fan-out de percepção e convergência;
- `apps/modulos/HERMES-CORE/core/cognitive-council.mjs` — lentes funcionais, pool de candidatos e teto útil;
- `apps/modulos/artifacts-builder/CONTRATO-ARTEFATO-UNIVERSAL.md` — artefato derivado.

## 1. Autoridade, identidade e execução

```mermaid
flowchart TD
    CHEFE["SEGREDO/CHEFE<br/>intencao + limites + autoridade humana"]
    SOL["SOL<br/>coordena + reconcilia + protege o fio"]
    MOTORS["Modelos / ferramentas<br/>motores substituiveis"]
    HERMES["HERMES<br/>executor + continuidade"]
    WRITER["Writer unico por escopo<br/>muta somente o alvo autorizado"]
    VERIFY["Teste + MetaLupa + receipts<br/>prova aplicavel"]
    GIT["GitHub / canonico<br/>historia + prova"]
    REAL["Estado real medido<br/>desempata"]

    CHEFE --> SOL
    MOTORS --> SOL
    SOL --> HERMES
    SOL --> WRITER
    HERMES --> WRITER
    WRITER --> VERIFY
    VERIFY --> GIT
    GIT --> REAL
    REAL --> SOL
```

Regras representadas:

```text
MODELO != PAPEL
PAPEL != AUTORIDADE
PARALELIZE_PERCEPCAO
SERIALIZE_MUTACAO
ONE_WRITER_PER_SCOPE=true
```

## 2. Refinaria cognitiva causal

```mermaid
flowchart TD
    MAT["Materia-prima"]
    EXTRACT["Extrair capacidade"]
    COMPARE["Comparar com canonico"]
    SAME{"Ja existe?"}
    DROP["DROP_DUPLICATION"]
    DELTA["Extrair delta / provar gap"]
    ANGLES["Triangular angulos uteis"]
    INFO{"Information gain?"}
    STOP["STOP / NO_CHANGE"]
    CAUSE["Causa geradora"]
    COUNTER["Contraprova"]
    OWNER["Dono + consumidor evidenciados"]
    GOLD["Absorver ouro"]
    PROV["Preservar proveniencia<br/>remover dependencia da fonte"]

    MAT --> EXTRACT --> COMPARE --> SAME
    SAME -->|igual| DROP
    SAME -->|parcial ou novo| DELTA
    DELTA --> ANGLES --> INFO
    INFO -->|nao| STOP
    INFO -->|sim| CAUSE --> COUNTER --> OWNER --> GOLD --> PROV
```

```text
FONTE = PROVENIENCIA
CAPACIDADE = VALOR
PROVA = FILTRO
OURO = ABSORCAO
```

## 3. Memory Linker — pipeline canônico atual

```mermaid
flowchart TD
    SCOUT["Scout<br/>mede gaps"]
    FP["delta-core<br/>normaliza + fingerprint"]
    GAIN{"Fingerprint mudou?"}
    MSTOP["NO_NEW_INFORMATION<br/>nao regrava / nao acorda proxima etapa"]
    REPORT["last-report.json"]
    ANALYST["Analyst<br/>classifica delta"]
    DECISION["analyst-decision.json"]
    EXEC["Executor<br/>auto-fix documental seguro"]
    SAFE["fs-safe<br/>raiz fisica + symlink guard + escrita atomica"]
    RECEIPT["Receipt factual<br/>arquivo / commit / push separados"]
    DREAM["Dream Review<br/>candidate ou quarantine"]
    ML["MetaLupa + dono + consumidor + TOOL_MEASURED"]
    AW["Writer autorizado"]

    SCOUT --> FP --> GAIN
    GAIN -->|nao| MSTOP
    GAIN -->|sim| REPORT --> ANALYST --> DECISION --> EXEC --> SAFE --> RECEIPT
    DREAM --> ML --> AW
```

Não há claim aqui sobre scheduler, PM2, Telegram ou VPS corrente. Sem medição física recente:

```text
SCHEDULE=UNPROVEN
RUNTIME_TOPOLOGY=UNPROVEN
```

## 4. Evolução verificável e autoaplicação

```mermaid
flowchart LR
    PERCEIVE["Perceber melhor"]
    COMPRESS["Carregar menos"]
    PROVE["Provar melhor"]
    ACT["Agir melhor"]
    LEARN["Aprender melhor"]
    BEFORE["BEFORE"]
    CHANGE["DELTA"]
    AFTER["AFTER"]
    TEST["TEST + COUNTERPROOF + EVIDENCE"]
    RESULT{"Fitness delta real?"}
    EVOLVE["EVOLUTION_PROVEN"]
    NOCHANGE["NO_CHANGE / NO_EVOLUTION"]

    PERCEIVE --> COMPRESS --> PROVE --> ACT --> LEARN --> PERCEIVE
    BEFORE --> CHANGE --> AFTER --> TEST --> RESULT
    RESULT -->|sim| EVOLVE
    RESULT -->|nao| NOCHANGE
```

```text
META(X) = X APLICA A PROPRIA LEI SOBRE X
EVOLUTION = MEASURABLE_FITNESS_DELTA
EVOLUTION_REQUIRED != CHANGE_REQUIRED
```

## 5. Proveniência temporal — nome não atravessa o tempo sozinho

```mermaid
flowchart TD
    LABEL["Nome / rotulo"]
    TIME["Periodo / event time"]
    CONTEXT["Contexto social ou tecnico"]
    USE["Uso contemporaneo"]
    RECEPTION["Recepcao / interpretacao"]
    EVIDENCE["Evidencia"]
    CONTINUITY{"Continuidade provada?"}
    SAMECAP["Comparacao de capacidade/linhagem permitida"]
    UNPROVEN["UNPROVEN<br/>nao retroprojetar categoria"]

    LABEL --> TIME --> CONTEXT --> USE --> RECEPTION --> EVIDENCE --> CONTINUITY
    CONTINUITY -->|sim| SAMECAP
    CONTINUITY -->|nao| UNPROVEN
```

```text
SAME_NAME_ACROSS_TIME != SAME_MEANING
SAME_LABEL != SAME_LINEAGE
```

## 6. Organograma cognitivo — autoridade e percepção são planos diferentes

O organograma não transforma especialidade em autoridade. A linha vertical mostra **quem decide/coordena/executa**; as linhas laterais mostram **quem percebe e contraprovê**.

```mermaid
flowchart TD
    CHEFE2["SEGREDO/CHEFE<br/>AUTORIDADE FINAL"] --> SOL2["SOL<br/>coordenação + reconciliação"]
    SOL2 --> HERMES2["HERMES<br/>execução + continuidade"]
    SOL2 --> WRITER2["1 Writer por escopo"]
    WRITER2 --> PROVA2["teste + receipt + estado real"]
    PROVA2 --> SOL2

    SOURCE["Fontes / histórico / pessoas / projetos<br/>PROVENIÊNCIA, não autoridade"] --> PROFILE["Source Profile<br/>claims observados + origem"]
    PROFILE --> AUTO["AUTOMATION_FACTORY"]
    PROFILE --> SKEPTIC["STRUCTURAL_SKEPTIC"]
    PROFILE --> COORD["HUMAN_AGENT_COORDINATION"]
    PROFILE --> OBS["OBSERVABILITY_PROOF"]
    PROFILE --> SYN["SYNTHESIS_RECONCILIATION"]
    PROFILE --> TRUST["IDENTITY_TRUST"]

    AUTO --> B["B_IMPLEMENTATION"]
    AUTO --> D["D_SIMPLIFICATION"]
    SKEPTIC --> A["A_LOGIC"]
    SKEPTIC --> C["C_REGRESSION_FALSE_GREEN"]
    COORD --> B
    OBS --> C
    SYN --> A
    SYN --> D
    TRUST --> A
    TRUST --> C

    A --> SOL2
    B --> SOL2
    C --> SOL2
    D --> SOL2
```

A compressão é intencional:

```text
6 LENTES FUNCIONAIS
→ COBERTURA PELOS 4 ATAQUES JA EXISTENTES
→ ZERO NOVA AUTORIDADE
→ ZERO NOVO WRITER
→ ZERO VOTACAO COMO VERDADE
→ ZERO CHAMADA EXTRA EXIGIDA PELO ORGANOGRAMA
```

Uma pessoa, empresa, paper, podcast ou projeto pode alimentar um `Source Profile` somente por matéria recuperável. O perfil **não é clone da pessoa**, não recebe personalidade, voto, caneta ou autoridade. Depois da validação, a capacidade útil pode ser absorvida e a proveniência permanece registrada.

```text
SOURCE_PROFILE != PERSONA
SOURCE_PROFILE != AGENT_AUTHORITY
NAME_OR_REPUTATION != PROOF
AGREEMENT != PROOF
DIVERSIDADE_CONTROLADA + TESTE_DISCRIMINANTE + EVIDENCIA
→ CONVERGENCIA MATERIAL
```

### 6.1 Teto útil e fechamento real

O teto não é quantidade de rodadas. É o primeiro ponto em que não existe informação nova nem lacuna material aberta.

```mermaid
flowchart TD
    GAP["lacunas materiais"] --> CLASS["OPEN | UNKNOWN | RESOLVED | BLOCKED | NOT_APPLICABLE"]
    CLASS --> CHECK{"ha OPEN/UNKNOWN?"}
    CHECK -->|sim| CONT["continuar somente no residuo"]
    CHECK -->|nao| PENDING{"delta material pendente?"}
    PENDING -->|sim| CONT
    PENDING -->|nao| BLOCK{"ha BLOCKED?"}
    BLOCK -->|sim| BOUND["BLOCKED_AT_EXACT_BOUNDARY<br/>causa + owner + proxima condicao"]
    BLOCK -->|nao| INFO{"nova informacao?"}
    INFO -->|sim| CONT
    INFO -->|nao| FIXED["FIXED_POINT<br/>STOP"]
```

Regras:

```text
RESOLVED_SEM_EVIDENCIA = INVALID_RECEIPT
BLOCKED_SEM_CAUSA_OWNER_PROXIMA_CONDICAO = INVALID_RECEIPT
UNKNOWN != CLOSED
BLOCKED_BOUNDARY != FIXED_POINT
NO_NEW_INFORMATION + ZERO_MATERIAL_RESIDUAL = USEFUL_CEILING
```

O código executável correspondente vive em `apps/modulos/HERMES-CORE/core/cognitive-council.mjs` e é consumido pela `perception-orchestra.mjs`.

## 8. Cristalização operacional — um coração, Hermes já existente

> Derivado da intenção SEGREDO/CHEFE 2026-09-19. Não é segundo painel.
> Fontes de verdade: `origin/main` (código) · `api.centralldark.com` (estado) · `admin.centralldark.com` (casca).
> Executores já vivos: Hermes gateway + cron `70c07f9b` Heartbeat Operacional + `7212bca5` Promotion Deploy + MCP `GET /heartbeat`.
> SSE é transporte. Watchdog detecta; orchestrator executa. Sem segundo cérebro.

```text
NÃO CONSTRUIR PARA COBRIR UMA DÚVIDA.
PRIMEIRO MEDIR.
DEPOIS RECONCILIAR.
SÓ ENTÃO ALTERAR.
```

```mermaid
flowchart LR
    A["ADMIN<br/>admin.centralldark.com"]
    B["API<br/>api.centralldark.com"]
    C["WATCHDOG<br/>Hermes cron Heartbeat"]
    D["RECONCILIADOR<br/>Hermes cron Deploy/Kanban"]
    E["RUNNER<br/>self-hosted"]
    F["DEPLOY<br/>vps-exec-selfhosted"]
    G["QUEUE<br/>Actions"]

    A <--> B
    B --> C
    C --> B
    E -->|"heartbeat"| B
    B -->|"lease / command"| E
    B --> D
    E --> D
    F --> D
    G --> D
    D -->|"STATE_MISMATCH"| B
    B --> F
    F --> G
    G --> E
    E -->|"progress"| B
    F -->|"result"| B
    B --> A
```

```mermaid
stateDiagram-v2
    [*] --> HEALTHY
    HEALTHY --> BUSY: acquire lease
    BUSY --> HEALTHY: job finished
    BUSY --> SUSPECT: heartbeat stale
    SUSPECT --> BUSY: heartbeat recovered
    SUSPECT --> LOST: timeout
    LOST --> RECOVERING: watchdog solicita
    RECOVERING --> HEALTHY: runner reconciled
    RECOVERING --> LOST: recovery failed
    BUSY --> STATE_MISMATCH: job inexistente
    STATE_MISMATCH --> RECONCILING: reconciliador
    RECONCILING --> BUSY: estado confirmado
    RECONCILING --> RECOVERING: runner inválido
    HEALTHY --> [*]
```

### 8.1 Vigilância econômica — coração global + probes subordinados

A regra “um coração” é de **autoridade e convergência**, não obrigação de existir literalmente um único processo de SO. Serviços podem manter probes/watchdogs locais quando necessários para autostart ou isolamento, mas todos convergem para o mesmo estado global e não competem por decisão.

```mermaid
flowchart LR
    P1["PROBE local<br/>serviço A"]
    P2["PROBE local<br/>serviço B"]
    WF["WATCHER focado<br/>run + SHA + deadline"]
    H["CORAÇÃO GLOBAL<br/>GET /heartbeat<br/>heart=one"]
    W["WATCHDOG GLOBAL<br/>detecta/classifica"]
    O["ORCHESTRATOR<br/>executa owner autorizado"]
    L["LOG/RECEIPT OWNER<br/>Actions · audit · crash"]
    R["REALITY JUDGE<br/>contraprova"]

    P1 --> H
    P2 --> H
    WF --> H
    H --> W
    W --> O
    O --> L
    L --> R
    R --> H
    R -->|"terminal"| WF
```

Invariantes:

```text
ONE_GLOBAL_HEART=true
ONE_GLOBAL_WATCHDOG_AUTHORITY=true
LOCAL_PROBE != SECOND_HEART
LOCAL_WATCHER != GLOBAL_AUTHORITY
WATCHER_KEY=scope|target|sha|run_id
ONE_ACTIVE_WATCHER_PER_KEY=true
WATCHER_BOUNDED_LIFETIME=true
WATCHER_FOLLOWS_EXACT_TARGET=true
NO_NEW_INFORMATION => SLEEP
HEARTBEAT_SUMMARY != FULL_LOG
WATCHDOG_DETECTA != ORCHESTRATOR_EXECUTA
```

O padrão observado no Grok CLI confirma o ganho operacional de combinar:
1. watcher focado para o deploy corrente;
2. loop de baixa frequência para autonomia longa;
3. receipt curto apenas quando há delta.

A melhoria determinística é impedir o watcher focado de migrar para “qualquer run ativo”: ele deve encerrar no alvo exato e deixar o coração global escolher conscientemente o próximo alvo.
Allowlist pública: `centralldark.com` · `admin.centralldark.com` · `api.centralldark.com` · `mcp.centralldark.com/mcp`.
`mcp.centralldark.com/admin` = aba MCP na mesma Casa, **não** HUB.
`hub.centralldark.com` = LEGADO (403). Não recriar subdomínio HUB.
Domínio extra em Caddy/DNS = `LEGADO | NECESSÁRIO | RESÍDUO` — não remover sem prova de dependência.

### Base de comando — cavaleiros da VPS / cavaleiro do deploy

```text
MAIN_CODIGO     = origin/main   (T1 a76120905de heartbeat #1583)
ESTADO          = api.centralldark.com
CASCA           = admin.centralldark.com
MCP             = capacidade interna  (POST /mcp)
CORACAO         = GET /heartbeat   heart=one
WATCHDOG        = Hermes cron 70c07f9b  DETECTA
ORCHESTRATOR    = esteira vps-exec + cron 7212bca5  EXECUTA
SSE             = transporte  != verdade
MERGED          != DEPLOYED
ALIVE           != HEALTHY
UNKNOWN         != PASS
```

Absorvido na main: heartbeat rico, `status_key`, self first_beat|alive|stale, allowlist `@ www api mcp admin`.

Ainda **não** pintar de verde (não criar): lease com expiry, snapshot único, event log total, state machine de deploy completa, reconciler completo, idempotência universal. Localizar owner existente antes de qualquer linha nova.

Cristalizado = ARCH ∩ CODE ∩ CONFIG ∩ INFRA ∩ DOCS ∩ RUNTIME_PROOF.

```text
#ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → !META_LUPA
→ !RECONCILIAR → !CONTRAPROVA → !REMEDIÇÃO
→ !FIXED_POINT → !REGISTRA → !BOOT
```

MetaLupa procura **contradição entre fontes**, não só erro.

## Regra de manutenção deste artefato

```text
CANONICO_MUDOU_ESTRUTURALMENTE
→ atualizar este arquivo existente
→ conferir contra os donos canônicos
→ validar Mermaid quando houver parser/renderer aplicável
→ discrepância vira matéria-prima

SEM_DELTA_ESTRUTURAL
→ NO_ARTIFACT_CHANGE
```

## 9. Trajetória + síntese do padrão manifesto do CHEFE

Esta seção preserva **o padrão operacional observado e já cristalizado**, não uma leitura mental do CHEFE. Ela existe para que IAs, agentes, terminais, PRs e handoffs recuperem rapidamente a mesma lógica sem recomeçar do zero.

### 9.1 ASCII/Text Diagram — compressão portátil

```text
[HD / WINDOWS / VM / CASA]
        |
        v
[SEPARAR CASCA DE ESSÊNCIA]
        |
        v
[INTENÇÃO + MEMÓRIA + REGRAS + OWNERS]
        |
        v
[GITHUB MAIN = FONTE CANÔNICA RECONSTRUÍVEL]
        |
        v
[/root/CentralDark NA VPS = ESPELHO OPERACIONAL DO CURRENT]
        |
        v
[HERMES = CONSULTA OWNERS + EXECUTA]
        |
        v
[RUNTIME / REALIDADE = PROVA DO EFEITO]
        |
        v
[RECEIPT + HISTÓRICO + NEXT_CURSOR]
        |
        +--------------------------+
                                   |
                                   v
                             [CONTINUIDADE]

[NOVA IDEIA / CHATGPT / FONTE EXTERNA]
        |
        v
[COMPARAR COM CURRENT]
        |
        +--> já contido ------> DROP_DUPLICATE
        |                       REUSE_OFFICIAL_OWNER
        |
        +--> delta real ------> ABSORB_ONLY_DELTA
        |                       EVOLVE_SAME_OWNER
        |
        +--> contradição -----> META-LUPA
                                TESTE_DISCRIMINANTE
                                CONTRAPROVA
                                |
                                v
                         [ONE WRITER / MENOR DELTA]
                                |
                                v
                         [PROVA NO RUNTIME]
```

Compressão do padrão:

```text
INTENÇÃO DO CHEFE
→ MEDIR CURRENT
→ ACHAR OWNER
→ COMPARAR
→ REUTILIZAR OU EXTRAIR SÓ O DELTA
→ CORRIGIR O OWNER MÍNIMO
→ PROVAR
→ CONTRAPROVAR
→ PROMOVER
→ REMEDIR NO RUNTIME
→ PRESERVAR HISTÓRICO/RECEIPT
→ DEIXAR NEXT_CURSOR
→ CONTINUAR SEM RECOMEÇAR
```

Leis que esse mapa representa:

```text
CACHE_IS_NOT_AUTHORITY=true
MEMORY_IS_NOT_CURRENT=true
HISTORY_IS_NOT_CURRENT_STATE=true
CURRENT_OVER_HISTORY=true
HISTORY_IS_EVIDENCE=true

CHEFE_IS_INTENT_OWNER=true
NO_MIND_READING=true
OBSERVE_MANIFEST_PATTERN_ONLY=true

CONCHA_E_MUTAVEL=true
MEMORIA_E_SAGRADA=true
AUTHORITY_AND_EXECUTION_ARE_DISTINCT_PLANES=true

REUSE_BEFORE_CREATE=true
EVOLVE_EXISTING_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
EXTERNAL_CONTENT_IS_CANDIDATE_NOT_AUTHORITY=true

UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
DOCUMENTED_IS_NOT_EXECUTED=true
MERGED_IS_NOT_DEPLOYED=true
REALITY_IS_JUDGE=true

PRESERVE_BEFORE_DESTROY=true
MIRROR_IS_NOT_SOURCE_OF_TRUTH=true
MEMORY_IS_NOT_SECOND_CONSTITUTION=true
```

Semântica temporal: memória e história permanecem preservadas como continuidade/proveniência, mas não substituem o CURRENT para afirmar o presente.

### 9.2 Mermaid — mesma relação em forma visual

```mermaid
flowchart TD
    A["HD / Windows / VM / Casa<br/>corpos observados"] --> B["Separar casca de essência"]
    B --> C["Intenção + memória + regras + owners<br/>linhagem que deve sobreviver"]
    C --> D["GitHub main<br/>fonte canônica reconstruível"]
    D --> E["/root/CentralDark na VPS<br/>espelho operacional do CURRENT"]
    E --> F["Hermes<br/>consulta owners + executa"]
    F --> G["Runtime / REALIDADE<br/>prova do efeito"]
    G --> H["Receipt + histórico + NEXT_CURSOR"]
    H --> D

    I["Conteúdo externo / nova ideia"] --> J{"Comparar com CURRENT"}
    J -->|"já contido"| K["DROP_DUPLICATE<br/>REUSE_OFFICIAL_OWNER"]
    J -->|"delta real"| L["ABSORB_ONLY_DELTA<br/>EVOLVE_SAME_OWNER"]
    J -->|"contradição"| M["META-LUPA<br/>teste discriminante + contraprova"]

    K --> H
    L --> N["ONE WRITER<br/>menor delta"]
    M --> N
    N --> G
```

### 9.3 Como uma IA deve usar este mapa

```text
1. NÃO tratar o diagrama como fonte de verdade.
2. RECUPERAR intenção vigente + SOUL + RULES + AGENTS + owner aplicável.
3. MEDIR CURRENT quando a resposta depender de estado vivo.
4. USAR o ASCII como compressão portátil e o Mermaid como mapa relacional.
5. SE o diagrama divergir do canônico, abrir investigação no cone divergente.
6. NÃO criar segundo owner, segundo cérebro, segundo scheduler ou segunda memória.
7. PRESERVAR termos do CHEFE, proveniência, receipts e NEXT_CURSOR.
8. APRENDER o padrão manifesto sem inventar intenção não declarada.
```

Owner da regra visual: `docs/CONSCIENCIA/VISUALIZACAO-MERMAID-PADRAO.md`.
Herança operacional para agentes: `AGENTS.md#preservação-visual-do-padrão-manifesto-do-chefe`.


