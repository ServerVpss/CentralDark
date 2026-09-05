```mermaid
flowchart TD
    %% ESSE FIO MANCHOU O SISTEMA POR 3H (02/09 05:07 → 08:58)
    
    subgraph AGENTE_ORCHESTRADOR ["🧠 Agente Orchestrator — HERMES-CASA"]
        A1[🤖 Agente Hermes-Casa<br/>Id: privete] --> A2[📋 Missão: msr-20260902-001]
        A2 --> A3[⏱️ Timestamp live: 02/09/2026, 05:07:39]
        A3 --> A4[🎯 Autorização: SEGREDO/CHEFE]
    end
    
    subgraph FRONTS_PARALELOS ["🔀 10 FRONTS PARALELOS (leitura)"]
        F1[🔍 FRONT 01: Repo Main HEAD] --> F1A[b5f821359484f260304d96d04fe439820e0e3877]
        F2[📊 FRONT 02: PRs/IMAGES] --> F2A[#1381 DIRTY | #1393 UNSTABLE]
        F3[🏠 FRONT 03: Casa Worktrees] --> F3A[18 worktrees | pr-1381-safety]
        F4[☁️ FRONT 04: Drive Docs] --> F4A[pending | service_unavailable]
        F5[📦 FRONT 05: Owners/Contracts] --> F5A[SEGREDO/CHEFE]
        F6[🛠️ FRONT 06: Skills/Tools] --> F6A[centraldark-drive-reconciliation]
        F7[🌐 FRONT 07: Providers/Models] --> F7A[upstage/solar-pro4:free]
        F8[🧪 FRONT 08: Tests/Falsifiers] --> F8A[CI 2 FAIL + 3 PASS + 2 SKIP]
        F9[⚙️ FRONT 09: Infra/Performance] --> F9A[:3030 → 403]
        F10[📝 FRONT 10: Docs/Handoff] --> F10A[DELTAUNIFICADO pendente]
    end
    
    subgraph SISTEMA_EXTERNO ["🌐 Sistema Externo — Fonte de Veridade"]
        S1[🐙 GitHub Canônico] --> S1A[ServerVpss/CentralDark]
        S1A --> S1B[origin/main: 5ce6e667e]
        S2[🤖 API Nvidia] --> S2A[⚠️ SERVICE TEMPORARILY OVERLOADED]
        S2A --> S2B[3 retries falhadas]
        S3[📄 Google Doc] --> S3A[DELTAUNIFICADO: UNKNOWN]
        S3A --> S3B[doc id: 1ZFhlcoPclDuNPXtD4FSfq4_Zfyb4L0vwBAcselkyC_E]
    end
    
    subgraph WIDGET_STATUS ["⚙️ Painel de Status — Widget HTML"]
        W1[📊 Central Dark Status ⚙️]
        W1 --> W2[🆔 Identidade: HERMES-CASA / privete]
        W1 --> W3[👑 Autoridade: SEGREDO/CHEFE]
        W1 --> W4[🕐 Live: 02/09/2026, 05:07:39]
        W1 --> W5[📋 Missão: msr-20260902-001]
        W1 --> W6[⚠️ Erro: API call failed — Nvidia overloaded]
        W1 --> W7[📜 Código collapsável com metadata]
    end
    
    subgraph COMUNIDADE ["💬 Comunidade Técnica"]
        C1[👤 Charizard] --> C1A["Agora entendi o estado real – PR #1381 implementou a ponteira única com MASTER_INGRESS_ALIASES + master_funnel"]
        C2[🤖 Conversa com Gemini 05:57] --> C2A[Disclaimer Google Gemini — conversas analisadas para melhorar IA]
    end
    
    %% FLUXO DE MANTENÇÃO DO FIO
    A4 --> F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10
    F1A & F2A & F3A --> W1
    S1B --> F1
    S2B --> W6
    W1 --> C1A & C2A
    
    %% ESTILO
    classDef agen define color:#e11d48,stroke:#be123c;
    classDef external define color:#0ea5e9,stroke:#0284c7;
    classDef status define color:#f59e0b,stroke:#d97706;
    classDef com define color:#10b981,stroke:#059669;
    
    class A1,A2,A3,A4 agen;
    class S1,S2,S3 external;
    class W1,W2,W3,W4,W5,W6,W7 status;
    class C1,C2 com;
```
