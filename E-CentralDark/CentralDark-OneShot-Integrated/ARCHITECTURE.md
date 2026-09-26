# CentralDark Bridge · arquitetura cristalizada

```text
CHEFE / SEGREDO
      ↓
CENTRALDARK.EXE / APP
      ↓
APP BRIDGE
      ↓
CENTRALDARK MCP
      ├─ AUTH / SESSION
      ├─ TOOL ROUTER
      ├─ GITHUB / CONTEXTO
      ├─ LOGS / RECEIPTS
      └─ REMOTE BRIDGE
              ↓
          LOCAL AGENT
          ↙       ↘
   CASA WINDOWS    VPS
              ↓
           RECEIPT
              ↓
        REALITY JUDGE
```

Regras: `ONE_SYSTEM_ONLY`, `REUSE_BEFORE_CREATE`, `ONE_WRITER_PER_SCOPE`, `UNKNOWN != PASS`.

Este pacote é o primeiro corte de integração: descoberta do Remote Desktop Commander, prova MCP local/público, abertura da Casa e companion de saúde na VPS. Execução remota arbitrária fica desabilitada por padrão.
