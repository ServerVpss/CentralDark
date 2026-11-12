---
title: "Downloads.zip / PR585 — capabilities extracted"
status: "DOCUMENTAL_SEM_PROVA_RUNTIME_ATUAL"
owner: "docs/CONSCIENCIA/APRENDIZADOS/CAPABILITY-CRISTAL-20260913/19-PR585-EVIDENCE/PR585-CAPABILITY-EXTRACTION.md"
source_class: "INTERNAL"
tipo: "evidencia_documental"
data_criacao: "UNKNOWN"
ultima_atualizacao: "UNKNOWN"
ultima_modificacao: "2026-11-12T18:33:38-03:00"
ultima_verificacao: "2026-11-12T18:33:38-03:00"
fuso_horario: "America/Sao_Paulo"
hash_conteudo: "16603200d941f29257517c30ea7eed6c379d385a76beb4e60f447b8f60729bf5"
rastro: 
  - tipo: "CONCILIACAO_PROPRIEDADES"
    momento: "2026-11-12T18:33:38-03:00"
    origem_commit: "e907c6e815ff71bfca945d9823aa35a545ab1404"
    resultado: "SOMENTE_METADADOS"
    prova_runtime: "UNKNOWN"
grupo_notas: "03-evidencias-contraprovas"
relacionado_a: []
estado_evidencia: "UNKNOWN"
---
# Downloads.zip / PR585 — capabilities extracted

Achados materiais:

```text
WRITE_BEFORE_BEGIN
→ ocorreu historicamente
→ diff foi rebaixado a CANDIDATE_DIFF
→ BEGIN posterior não legitima escrita anterior

WORKTREE ISOLATION
→ preservou branch/escopo existente

WRITER HANDOFF
→ previous_writer/new_writer/scope/branch/head/state/auth/receipt

INDEPENDENT JUDGE
→ writer não aprova o próprio trabalho

AUTOLUPA
→ gate antes de commit/push no fluxo auditado
```

O bruto fica em `15-RAW-SOURCES/QUARANTINE/`.
Não promover o HTML/ZIP bruto para Git automaticamente.
