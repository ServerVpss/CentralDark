---
description: Regras detalhadas de harvest para CentralDark inteligência para ChatGPT
---

# Harvest Rules

## Pipeline
1. **LOCALSTATE** — Inventáriar WindowState + TabState
2. **RECONSTRUIR** — Reconstruir janelas/abas
3. **EXTRAIR** — Extrair texto recuperável
4. **DEREFERENCIAR** — Apenas se necessário, arquivo original
5. **DEDUPLICAR** — Identificar itens duplicados
6. **CLASSIFICAR** — Categorizar cada item
7. **QUARENTENAR** — Isolar sensível
8. **CRUZAR** — Comparar com estado vivo
9. **CRISTALIZAR** — Consolidar inteligência útil

### Classificação
- **CURRENT_CANDIDATE**: Item relevante para o estado atual
- **HISTORICAL_REFERENCE**: Item útil como contexto histórico
- **DUPLICATE**: Item duplicado de outro
- **SENSITIVE_QUARANTINE**: Item contendo dados sensíveis
- **DISCARD**: Item a descartar

### Forensic READ_FIRST
- LOCAL_REALITY = JUDGE: Realidade observada localmente decide.
- HISTORICAL != CURRENT: Dados antigos não substituem medições atuais.
- UNKNOWN != PASS: Ausência de evidência não é prova.
- DOCUMENTED != EXECUTED: Documentação não é execução.

### Proibições
- Não criar nova API, serviço, daemon, webhook, bot, IPNAMES-V2, MEMORY-V2, ou duplicar owner.
- Não alterar firewall, VPN, DNS, rotas automaticamente.
- Se usar IPNAMES, registrar upstream repo + commit SHA + timestamp; cruzar apenas com DNS/conexão/trace local realmente observados.

### Formato do Handoff
Produzir bloco handoff com seções: MEASURED_AT, CENTRALDARK_BRANCH, CENTRALDARK_HEAD, ACTIVE_PR, WRITER_SCOPE, NOTEPAD, DEDUPED_ITEMS, SENSITIVE_QUARANTINED, HISTORICAL_ITEMS, CURRENT_CANDIDATES, FORMAT_VERIFIED, CURRENT_FACTS, SUPERSEDED_HISTORY, OPEN_GAPS, CONTRADICTIONS, IPNAMES_DELTA, NEXT_SAFE_ACTION.