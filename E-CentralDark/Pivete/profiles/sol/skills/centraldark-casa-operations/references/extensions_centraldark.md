---
name: "extensions_centraldark"
description: "Extensões Hermes Agent e gêmeos apprenticeship para CentralDark."
version: "1.0.0"
author: "Pivete"
platforms: [windows, linux]
metadata:
  hermes:
    tags: [centraldark, hermes, extensoes, apprenticeship]
    related_skills: [centraldark-casa-operations, hermes-agent]
---

# Extensões Hermes Agent — CentralDark

> Hermes Agent é executado localmente como T0/SOL_ORCHESTRATOR. Estender o owner existente, nunca criar segundo orquestrador.

## Hermes Extension (Core)

- **Nome:** `hermes-extension`
- **Tipo:** Extensão core do Hermes Agent
- **Função:** Fornece múltiplas sessões via `/api/sessions` no Hermes Core (:8787)
- **Status:** Instalado localmente (Hermes Agent v0.20.0)

### Capabilities
- Gerenciar múltiplas sessões de IA
- Receber missões via `/api/sessions`
- Gerenciar identidade de cada sessão
- Emitir receipts estruturados

### Configuração Mínima
```yaml
# extensao_config.yaml
extensions:
  hermes-extension:
    enabled: true
    port: 8787
    sessions:
      path: E:/CentralDark/Pivete/runtime/sessions/
```

## Gêmeos Apprentice (Hermes Core)

- **Nome:** `aprendiz-de-codigo` (apprentice)
- **Tipo:** Gêmeo apprenticeship via Hermes Core
- **Função:** Braço apprentice que executa tarefas sob orquestração de T0.
- **Status:** Via Hermes Core `/api/sessions`

### Capabilities
- Receber missão de T0 (SOL_ORCHESTRATOR)
- Executar tarefas de escrita/leitura sob WRITER_SCOPE
- Devolver receipt estruturado

### Contrato
```
T0 EMITE → MISSION_ID + INTENT + DESTINATION + PROOF_TARGET + MATERIAL_SCOPE
APPRENTICE EXECUTA → FACTS + EVIDENCE + UNKNOWN + CONTRADICTIONS + COUNTERPROOF + RESIDUAL + VERDICT
```

## Apprentice Office

- **Nome:** `aprendiz-escritorio` (apprentice-office)
- **Tipo:** Braço apprenticeship focada em escrita/documentação
- **Função:** Escrever docs, registrar decisões, consolidar receipts.
- **Gate:** `WRITE_SCOPE + MINIMAL_DELTA + REGISTER_BEFORE_CHANGE`

## Apprentice Deck

- **Nome:** `aprendiz-apresentacao` (apprentice-deck)
- **Tipo:** Braço apprenticeship focada em apresentação/visualização.
- **Função:** Gerar relatórios, mapas, Mermaid, painéis.

## Apprentice Timer

- **Nome:** `aprendiz-tempomaximo` (apprentice-timer)
- **Tipo:** Braço apprenticeship de controle temporal.
- **Função:** Controlar tempo de execução, timeout, prazo de missão.
- **Gate:** `TIMER_START + TIMEOUT_CHECK + ABORT_IF_STALLED`

---

## Regra de Extensão

**REUSE_BEFORE_CREATE = true**
- Se Hermes já tem extensão/skill capaz, estender o owner existente.
- Nunca criar "segundo orquestrador" ou "Enxame Ômega V2".
- Owner canônico: Hermes Agent + `kimetsu-legacy-operational-method`.

## Identidade da Extensão

```
EXTENSION_ID = hash_sha256(extension_name + engine_version)[:8]
PID = runtime observado
```

## Contrato entre Extensões e T0

```
MESMA_MISSON_ID = true
MESMO_SNAPSHOT_ID = true
T0_EMITE_INTENÇÃO = true
EXTENSÃO_EXECUTA = true
EXTENSÃO_DEVOLVE_RECEIPT = true
```

## Proibições

- Não instalar extensão que viola ONE_SYSTEM_ONLY.
- Não criar extensão que substitui SOL_ORCHESTRATOR.
- Não usar extensão sem HA BEFORE_CHANGE (rollback ready).
