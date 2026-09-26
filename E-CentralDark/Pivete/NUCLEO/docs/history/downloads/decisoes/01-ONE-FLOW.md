# ONE FLOW — ARQUITETURA CANÔNICA

```text
SEGREDO/CHEFE
  │ intenção + autoridade
  ▼
INGRESSOS
  texto | voz | imagem | arquivo | URL | guia | screen region
  HTML | Recorder | Screenpipe | GitHub | runtime | logs | VPS
  │
  ▼
SURFACE / CAPABILITY DISCOVERY
  │
  ├─ descobre o que a superfície oferece
  └─ escolhe menor sensor suficiente
  │
  ▼
N ADAPTERS READ-ONLY
  DOM | Network | Storage | Recorder | Files | Logs | Git | Telemetry
  │
  ▼
ENVELOPE DE PROVENIÊNCIA
  target + scope + event_time + observation_time
  source + content_hash + previous_hash + claim + class
  │
  ▼
SESSION INTELLIGENCE HARVESTER
  segmentar → classificar → extrair → countercheck → dedupe
  │
  ▼
RENDEZVOUS
  normalizar → agrupar correlações → distinguir conflito
  │
  ▼
MULTIBÚSSOLA + META-LUPA
  físico → temporal → causal → contraprova → prova
  │
  ▼
SOL
  reconciliar + escolher menor caminho suficiente
  │
  ▼
DECISÃO
  REUSE | EXTEND_MINIMALLY | CREATE_IF_GAP_PROVEN | NO_CHANGE
  │
  ▼
ONE_WRITER_PER_SCOPE
  │
  ▼
PIVETE/HERMES
  │
  ├─ MODELO substituível
  ├─ TOOL
  └─ BODY/runtime
  │
  ▼
AÇÃO / EFEITO
  │
  ▼
OBSERVABILIDADE
  logs + trace + receipts + hashes + telemetry
  │
  ▼
REALITY JUDGE
  Writer != Judge
  │
  ├─ FAIL → remediação mínima → remedir
  └─ PASS → delta de crença
  │
  ▼
KNOWLEDGE COMPILER
  │
  ├─ reutilizável → CRISTAL
  └─ sem ganho → NO_CHANGE
  │
  ▼
MEMÓRIA CANÔNICA / GRAFO / RAG
  │
  ▼
COCKPIT
  │
  ▼
SEGREDO/CHEFE
```

## Dois fluxos, um organismo

### Controle
`CHEFE → SOL → Writer → HERMES → efeito`

### Evidência
`mundo → sensores → Harvester → SOL → Reality Judge → memória`

Os dois se encontram no Rendezvous. Quantidade de telas não cria autoridade.

## Lei

> CHEFE diz O QUÊ. SOL descobre COMO. HERMES faz. A realidade julga. A Casa aprende.
