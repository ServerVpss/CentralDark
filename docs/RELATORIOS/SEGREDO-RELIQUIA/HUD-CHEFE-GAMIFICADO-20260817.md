# 🎮🗿 SEGREDO RELÍQUIA — HUD DO CHEFE

> Porta humana da escavação. O dossiê técnico continua sendo o registro detalhado; este HUD existe para o SEGREDO/CHEFE **ver a Casa, escolher onde cavar e não perder nenhuma relíquia**.

```text
HUD_MODE=ARQUEOLOGIA_GAMIFICADA
HUD_IS_PROJECTION=true
HUD_IS_AUTHORITY=false
SOURCE_IS_AUTHORITY=false
HISTORY_IS_NOT_RUNTIME=true
UNKNOWN_IS_NOT_PASS=true
NO_PERCENT_WITHOUT_CLOSED_DENOMINATOR=true
DELETE_RELICS=false
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
ZERO_DEPLOY=true
ZERO_VPS_MUTATION=true
ZERO_SECRET_VALUE=true
```

## 🎧 Visão de 10 segundos

```text
                         👑 SEGREDO/CHEFE
                               │
                        🎮 HUD DA ESCAVAÇÃO
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
      🏺 RELÍQUIAS          ⛏️ MINAS              🎯 MISSÕES
        │                      │                      │
   histórico preservado   matéria ainda bruta   o que cavar agora
        │                      │                      │
        └───────────────→ 🧠 RECONCILIAR ←───────────┘
                               │
                         🔍 PROVAR / DEDUPE
                               │
                         💎 REUSAR / CRISTAL
                               │
                         ⚪ UNKNOWN FICA VIVO
```

**Regra do jogo:** achar não é ativar; aparecer na tela não é virar autoridade; repetir não é perder. Relíquia repetida pode continuar visível como ancestral, alternativa, referência ou candidata.

---

## 🧭 Legenda da expedição

| Símbolo | Estado visual | Significado técnico |
|---|---|---|
| 🟢 | encontrado | código/artefato/evidência localizado no snapshot aplicável |
| 🏺 | relíquia | histórico preservado; não afirma runtime atual |
| 🟡 | parcial | há material, mas falta fechar prova/denominador/runtime |
| ⚪ | neblina | `UNKNOWN`; não foi provado nem descartado |
| 🔴 | quebrado | falha/contraprova negativa realmente observada |
| 💎 | cristal | capacidade reutilizável já absorvida no owner canônico |
| 🎁 | loot | matéria preservada para inspeção/reuso |
| 👑 | decisão | escolha/autoridade humana do SEGREDO/CHEFE |

> Emoji é apresentação, não lógica. A classificação escrita é que vale.

---

## 🗺️ Mapa principal — a Casa que já apareceu na escavação

```text
CENTRALDARK
│
├─ 🖥️ DESKTOP / TAURI
│  ├─ 🏺 SOL Desktop POC
│  ├─ 🎁 source zip preservado
│  ├─ 🟢 30 arquivos no manifesto histórico
│  └─ 🟡 build físico atual ainda não remedido
│
├─ 🧠 HERMES / JARVIS
│  ├─ 🟢 percepção paralela
│  ├─ 🟢 Writer único / mutação serial
│  ├─ 🎼 N percepções no mesmo organismo
│  └─ 🎯 expansão #ACORDAR/!CALIBRAR em PR separado #1002
│
├─ 🌌 OBSIDIAN / GRAFO VIVO
│  ├─ 🟢 plugin / documentação localizados
│  ├─ 🏺 grafo 2D/3D e roadmap preservados
│  └─ 🟡 runtime físico atual não remedido
│
├─ 🎙️ VOZ
│  ├─ 🟢 CentralDark Voice localizada
│  └─ 🟡 bridge/runtime atual não remedido
│
├─ 🌐 GATEWAY / BROWSER / TOOLS
│  ├─ 🟢 Elite WebSocket Gateway em código
│  ├─ 🟢 Playwright localizado
│  ├─ 🟢 Chrome DevTools MCP absorvido como sensor
│  └─ ⚪ quais canais estão ligados entre si AGORA = UNKNOWN
│
├─ 🛡️ SEGURANÇA
│  ├─ 💎 fundação privada absorvida no canônico
│  └─ ⚪ postura física atual de cada superfície depende de medição
│
├─ 📱 MOBILE / CASA / TV
│  ├─ 🎁 vestígios iPhone/Obsidian/rede preservados
│  └─ ⚪ vínculos causais TV↔Casa↔CentralDark ainda não provados
│
└─ ⛏️ GRANDES MINAS
   ├─ 📸 Screenshots(2).zip
   ├─ 🤖 .codex snapshot
   ├─ 🎼 Sincronia Global
   ├─ 🗿 Overclock / método ancestral
   └─ 🏺 branches, chats, ZIPs e artefatos históricos
```

---

## 📊 Barras que podem existir sem mentir

### 📦 Screenshots(2).zip — estrutura

```text
ARQUIVOS ENUMERADOS     [████████████████████] 572 / 572
PNG                     [███████████████████▉] 568 / 572
BLOBS SHA-256 ÚNICOS    [███████████████████▊] 566 / 572
DUPLICAÇÃO EXATA                         6 grupos / 12 membros
```

O denominador estrutural é fechado, então esses números são legítimos.

### 👁️ Screenshots(2).zip — entendimento semântico

```text
REVISÃO VISUAL/SEMÂNTICA [????????????????????] PARTIAL
```

Não existe aqui um numerador confiável de imagens semanticamente revisadas. Portanto **não aparece porcentagem falsa**.

### 🧠 SOL Desktop POC — prova histórica preservada

```text
ARQUIVOS NO POC          30
TESTES DO NÚCLEO         6 / 6 PASS NO SNAPSHOT HISTÓRICO
BUILD WINDOWS ATUAL      UNKNOWN / NÃO REMEDIDO NESTE HUD
```

---

## 🎒 Inventário / Loot já recuperado

| Loot | Quantidade / estado observado | Classe |
|---|---:|---|
| Screenshots(2).zip | 572 arquivos | 🎁 estrutura fechada |
| PNGs do pacote | 568 | 🎁 minério visual |
| blobs únicos | 566 | 🟢 dedupe medido |
| `.codex` threads | 40 | 🏺 snapshot histórico |
| user threads | 23 | 🏺 snapshot histórico |
| subagent threads | 17 | 🏺 snapshot histórico |
| spawn edges | 12 | 🏺 snapshot histórico |
| guardians | 5 | 🏺 snapshot histórico |
| dynamic tools | 10 | 🏺 snapshot histórico |
| state stores SQLite | 6 | 🏺 snapshot histórico |
| plugins | 8 | 🏺 snapshot histórico |
| modelos | 7 | 🏺 snapshot histórico |
| POC SOL Desktop | 30 arquivos | 🏺 código-fonte preservado |
| Sincronia Global | TXT + Mermaid/diagramas | 🎁 contrato histórico preservado |

---

## 🏆 Achievements já desbloqueados

Estes achievements são **marcos observáveis**, não XP inventado.

```text
🏆 ARQUEÓLOGO NÃO APAGA
   → relíquias históricas ficaram preservadas sem virarem segunda verdade

🏆 DEDUPE SEM AMNÉSIA
   → 572 arquivos → 566 blobs únicos; duplicata foi identificada sem apagar proveniência

🏆 MINÉRIO UNIVERSAL
   → ANY_INPUT=POSSIBLE_ORE absorvido; fonte não vira autoridade automaticamente

🏆 UMA CANETA
   → percepção pode abrir em N braços; mutação do mesmo escopo continua serializada

🏆 BANDA RECUPERADA
   → contrato histórico de Sincronia Global localizado e preservado

🏆 DESKTOP REENCONTRADO
   → POC SOL Desktop/Tauri + source zip + snapshot APPCENTRALDARK EVOLUIR localizados

🏆 CASA TEM MEMÓRIA
   → `.codex`, screenshots, branches, PRs, dossiês e owners cruzados sem exigir que o humano recontasse tudo
```

---

## 👾 Bosses / Neblinas ainda vivos

```text
👾 BOSS 1 — 568 PNG
   estrutura = PROVADA
   semântica total = PARTIAL
   vitória = revisar por lotes + dedupe semântico + extrair somente delta útil

👾 BOSS 2 — RUNTIME DESKTOP
   Tauri/source = ENCONTRADO
   app físico atual = NÃO REMEDIDO
   vitória = build/run/prova no alvo correto quando autorizado

👾 BOSS 3 — SINCRONIA GLOBAL
   contrato histórico = ENCONTRADO
   cobertura real atual = NÃO ASSUMIDA
   vitória = cruzar campo por campo com owners vivos e marcar REUSE|GAP|NO_CHANGE

👾 BOSS 4 — MOBILE / CASA / TV
   vestígios = PRESERVADOS
   causalidade CentralDark = UNKNOWN
   vitória = canal causal observável, sem inferir por proximidade

👾 BOSS 5 — COCKPIT ÚNICO
   ideia/workspace/panes = CANDIDATE no #998
   runtime integrado = NÃO ALEGADO
   vitória = compor peças existentes sem outro cérebro/orquestrador
```

---

## 🎯 Quest Board — escolha onde cavar

```text
Q1  ⛏️ SCREENSHOT MINE
    revisar lotes das 568 imagens → extrair capacidade → dedupe → owner

Q2  🎼 SINCRONIA GLOBAL
    contrato antigo → owners atuais → REUSE / EXTEND / GAP / NO_CHANGE

Q3  🖥️ DESKTOP / TAURI
    POC + snapshot → comparar com app atual → preservar melhor peça de cada geração

Q4  🌌 OBSIDIAN / GRAFO
    plugin + CASA-VAULT + Grafo Vivo → descobrir o que é código, runtime e relíquia

Q5  🎙️ VOICE
    módulo + Tauri + browser → reconciliar entrada/saída de voz sem duplicar owner

Q6  🧠 JARVIS / HERMES
    missões + panes + Writer + N percepções → cockpit operacional visual

Q7  📱 MOBILE / CASA
    iPhone + rede + Obsidian + ferramentas legítimas → separar vínculo de causa

Q8  🏺 BRANCH ARCHAEOLOGY
    branches antigas → capacidades que sumiram da main → recuperar somente ouro

Q9  🤖 CODEX / AGENTES
    40 threads + 12 spawn edges + tools/plugins → cruzar com arquitetura atual

Q10 🎮 HUD / COCKPIT
    transformar estado real em projeção humana jogável sem transformar UI em autoridade
```

As quests podem rodar em qualquer ordem e várias podem coexistir. Cada uma mantém escopo/proveniência próprios; a caneta do mesmo alvo continua única.

---

## 🎛️ Controles conceituais do CHEFE

Esses rótulos são o vocabulário visual desejado para o futuro cockpit; **aqui ainda são documentação, não botões executáveis**.

```text
[CAVAR]              abrir próxima fonte/material
[CRUZAR]             comparar relíquia × owner vivo
[ABRIR RELÍQUIA]     ver histórico sem promovê-lo
[MEDIR RUNTIME]      trocar hipótese por observação atual
[COMPARAR]           manter variantes lado a lado
[MARCAR FAVORITA]    preferência humana sem virar prova técnica
[CONTRAPROVAR]       tentar quebrar claim material
[REPLAY]             reabrir fio/estado observável
[CRISTALIZAR]        promover só delta reutilizável provado
[GUARDAR]            preservar matéria/UNKNOWN para outra rodada
```

---

## 🎼 Multimissão — uma banda, N canções

```text
UMA CASA / UMA BANDA
│
├─ MISSÃO A → pane → pane → pane ↺
├─ MISSÃO B → pane ─┬→ pane
│                   └→ pane → converge
├─ MISSÃO C → CRISTALIZA → CRISTALIZA → COMPRIME → SINTETIZA
└─ MISSÃO N → grafo livre / rollover / loop / fan-out / fan-in
```

```text
MANY_ACTIVE_MISSIONS=true
ONE_CANONICAL_STATE_PER_INTENT=true
WORKFLOW_CAN_BE_GRAPH=true
STAGE_CAN_REPEAT=true
PANE_FUNCTION_IS_PROGRAMMABLE=true
PARALLEL_PERCEPTION=true
SERIAL_MUTATION_SAME_SCOPE=true
```

> **UMA BANDA · N CANÇÕES · CADA CANÇÃO COM SEU COMPASSO · UMA REALIDADE.**

---

## 🔟 Upgrade em voo — `#ACORDAR + !CALIBRAR`

A expansão para até 10 frentes foi separada do dossiê para não empurrar o #998 inteiro para a `main`.

```text
PR=#1002
SCOPE=LEIA-ME-IA.md / #ACORDAR + !CALIBRAR
STATUS=IN_FLIGHT_AT_HUD_WRITE_TIME

#ACORDAR  → A1..A5
!CALIBRAR → C1..C5
MAX=10
TEN_IS_CEILING_NOT_QUOTA=true
FRONTS_ARE_READ_ONLY_UNTIL_RENDEZVOUS=true
ONE_WRITER_PER_SCOPE=true
```

Quando #1002 estiver realmente mergeado, este status pode ser atualizado para `PROMOTED_TO_MAIN`; não antecipar verde.

---

## 🧬 Proveniência — ninguém some quando o ouro é comprimido

```text
ORIGIN_INTENT=
DISCOVERED_BY=
FORMALIZED_BY=
IMPLEMENTED_BY=
COUNTERPROOF_BY=
VALIDATED_BY=
ABSORBED_IN=
```

Uma contribuição pode atravessar várias inteligências/pessoas/ferramentas. Crédito preserva a cadeia; crédito não concede autoridade e não substitui prova.

---

## ❤️ Sinal curto não perde o fio

```text
LOW_INFORMATION_SIGNAL
+ STRONG_RECOVERABLE_CONTEXT
→ CONTINUE_EXISTING_INTENT

LOW_INFORMATION_SIGNAL
+ AMBIGUOUS_CONTEXT
→ DO_NOT_INVENT_NEW_INTENT
```

Um `❤️`, “sim”, “vai”, “continua” ou equivalente pode carregar continuidade quando o contexto recuperável fecha a leitura. Sem contexto suficiente, fica ambíguo em vez de fabricar missão.

---

## 🔌 Reconexão — cair não significa esquecer

```text
CONNECTION_LOST
→ detectar
→ retry/backoff
→ recuperar último cursor/ACK observável
→ buscar gap
→ replay DELTA_ONLY
→ reconciliar STATE_REVISION
→ continuar do ponto real
```

A entrada pode ser logicamente única sem exigir um único transporte físico:

```text
LOGICAL_INGRESS=CentralDark
PHYSICAL_TRANSPORT=REPLACEABLE
SINGLE_POINT_OF_FAILURE_IS_NOT_REQUIRED=true
```

---

## 📚 Fonte detalhada — não apagar o porão porque ganhou um HUD

O registro técnico completo continua em:

- `HUD-SEGREDO-RELIQUIA-20260816.md` — dossiê cumulativo;
- `ADDENDUM-IPHONE-CASA-REDE-20260816.md`;
- `ADDENDUM-ZIP-HERMES-IPHONE-20260816.md`;
- comentários do PR #998 — candidatos/reconciliações que ainda não viraram runtime.

Este HUD **não substitui nenhum deles**. Ele é a visão humana por cima da mesma escavação.

---

## 🧾 Receipt do HUD

```text
HUD_CREATED=2026-08-17
HUD_TARGET=SEGREDO/CHEFE
HUD_TYPE=HUMAN_OPERATIONAL_PROJECTION
TECHNICAL_DOSSIER_PRESERVED=true
RELICS_PRESERVED=true
UNKNOWN_PRESERVED=true
FAKE_PERCENTAGE=false
RUNTIME_CHANGED=false
DEPLOY=false
VPS_MUTATION=false
```

### Fio da expedição

**ver → escolher mina → cavar → cruzar → provar → guardar ruído → preservar crédito → reutilizar ouro → atualizar HUD → continuar.** 🎮⛏️💎
