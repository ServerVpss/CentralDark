# Historical Harvester — reconciliação entre chats e Casa

Objetivo: recuperar valor de chats/Works/Projects sem transformar conversa em segundo cérebro.

```text
SOURCE
→ classify relevance
→ CentralDark/AI related?
→ extract candidate delta
→ resolve canonical owner
→ compare live repo/current state
→ dedupe
→ revalidate stale claims
→ emit KNOWLEDGE_DELTA
→ writer
→ receipt
```

Critérios de relevância:
- CentralDark, Hermes, SOL, agentes, IA, LLM, MCP, GitHub, runtime, VPS, app, voz, memória, arquitetura, automação, browser/computer-use;
- conversas antigas sem relação material podem permanecer fora da ingestão.

Saídas:
- NO_CHANGE
- CANDIDATE
- SUPERSEDED
- REVALIDATE
- BLOCKED_UNKNOWN

Nunca:
- declarar current state a partir de screenshot/chat antigo;
- copiar conversa inteira para profile de agente;
- criar owner novo antes de buscar owner existente.

Leis: `CHAT_HISTORY != CURRENT_STATE`, `SESSION_MEMORY != SOURCE_OF_TRUTH`, `UNKNOWN != PASS`.
