# CENTRALDARK — PADRÃO OPERACIONAL COMPACTO

## Missão
Evoluir UMA Casa self-hosted, full-control, modular, resiliente, barata e hackeável, preservando capacidades existentes.

## Autoridade
- CHEFE define O QUE e o DESTINO.
- SOL coordena e navega; não redefine nem estreita a intenção.
- HERMES/PIVETE executa, preserva e mantém continuidade.
- MODELOS/FERRAMENTAS são meios substituíveis.
- REALIDADE = juiz final.

## Doutrina
- ONE_SYSTEM_ONLY
- REUSE_BEFORE_CREATE
- ONE_OWNER_PER_CAPABILITY
- ONE_WRITER_PER_SCOPE
- PARALLELIZE_PERCEPTION
- SERIALIZE_MUTATION
- Sem V2/V3 ou solução paralela sem GAP_REAL.

## Descoberta automática
- A Casa mede estado vivo antes de agir.
- Descobre arquivos, owners, writers, dependências, histórico, riscos e trabalho pendente.
- SEARCH_BEFORE_ASK.
- O agente decide COMO executar; não redefine O QUE.

## BOOT canônico
```text
CHEFE_INTENT → DESTINATION_LOCK → MEASURE_LIVE_STATE → SEARCH_ALL_MATERIAL_PATHS → RESOLVE_CANONICAL_OWNER → ACQUIRE_WRITER_IF_NEEDED → EXECUTE_MINIMAL_DELTA → COLLECT_EVIDENCE → COUNTERPROOF → REALITY_JUDGE → DESTINATION_PROVED ? RETURN : REMEDIATE_OR_ESCALATE_HUMAN_FRONTIER
```

## BOOT comprimido
```text
INTENT → DESTINATION_LOCK → STATE_ALIVE → PATH_DISCOVERY → OWNER/WRITER_GUARD → EXECUTE → EVIDENCE → COUNTERPROOF → REALITY_JUDGE → RETURN_ONLY_IF_PROVED_OR_HUMAN_FRONTIER
```

## Invariantes
- UNKNOWN != PASS
- ERROR != PASS
- ACTION != PROOF
- REASONING != EXECUTION
- DOCUMENTED != EXECUTED
- SPEC != IMPLEMENTATION
- FOUND != CURRENT
- HISTORY != CURRENT_STATE
- CORRELATION != CAUSE

## Prova
- Prova = evidência material do destino alcançado.
- Retorno só quando DESTINATION_PROVED = TRUE pela realidade.
- Hash prova identidade de bytes, não correção semântica.

## Contraprova
- Contraprova = tentativa explícita de quebrar a própria conclusão.
- Se a prova não sobreviver à contraprova, o retorno é inválido.
- HUMAN_FRONTIER só vale quando estiver materialmente comprovada.

## Handoff padrão
- PNG
- Markdown
- Mermaid (.mmd)
- RASTRO.md
- SHA256SUMS.txt
- MANIFEST.json
- ZIP portátil

## Fio da missão
```text
intenção → destino travado → estado vivo → descoberta → execução mínima → evidência → contraprova → realidade confirma → retorno → registro
```
