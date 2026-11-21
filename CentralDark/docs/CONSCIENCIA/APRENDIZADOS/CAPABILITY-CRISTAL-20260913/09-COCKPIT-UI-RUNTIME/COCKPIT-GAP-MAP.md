# Cockpit + Runtime gap map

Histórico medido:

```text
Cockpit Shell       EXISTS
Electron Bridge     EXISTS
Live Logs           PARTIAL/MOCK
Terminal PTY        GAP
Session Manager     GAP
Agent Manager       PARTIAL
MCP Panel           PARTIAL
Process Viewer      PARTIAL/STATIC
Command Channel     GAP
Receipt Viewer      PARTIAL
Trace Viewer        GAP
```

Regra: estender SalaControle/Bolt/Hermes-Core/Status/MCP existentes.
Não criar GOD MODE paralelo antes de fechar dados vivos.
