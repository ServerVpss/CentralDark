# DELTA ÚTIL — só o que faltava no r01

Base selada: `3fb9cd2bf7eff428a36ef488e0aa8795d45142553e97088cad3d97434506af51`  
POMBO_ID: `20260905`  
Revisão anterior: `r01`  
Revisão atual: `r02`

## Lacunas reais encontradas no pacote anterior

1. **Linhagem do Pombo não era explícita**
   - faltavam `POMBO_ID`, `REVISION`, `PARENT_PACKAGE_SHA256`, `DELTA_MANIFEST_SHA256`;
   - o POMBO64 antigo era um bom checksum, mas não provava genealogia.

2. **Receipt não carregava todo o payload mínimo do protocolo canônico**
   Faltavam campos obrigatórios de continuidade:
   - `CHEFE_INTENT`
   - `DESTINATION_LOCK`
   - `SOURCE_SURFACE`
   - `TARGET_SURFACE`
   - `OBSERVED_AT`
   - `OWNER`
   - `WRITER_SCOPE`
   - `STATE`
   - `UNKNOWNS`
   - `RESIDUAL`
   - `NEXT_CURSOR`
   - `NEXT_ACTION`

3. **O pacote verificava bytes, mas não verificava semanticamente o contrato do Pombo**
   Faltava gate determinístico para:
   - `POMBO != CEREBRO/OWNER/WRITER/JUIZ/AUTORIDADE`
   - `UNKNOWN_PRESERVADO`
   - `DESTINATION_LOCK`
   - `PROVENIENCIA`
   - `NEXT_CURSOR`
   - `CHECKSUM != PROVA_SEMANTICA`

4. **Faltava regra anti-reprocessamento da mesma revisão**
   - mesmo `POMBO_ID + REVISION + parent + delta_hash` => `REUSE_PROOF`;
   - nenhum deep review byte-idêntico.

5. **Faltava separar checksum de conteúdo e identidade da linhagem**
   - `POMBO_ID` é identidade;
   - `REVISION` é evolução;
   - SHA-256 é identidade do artefato;
   - checksum nunca congela semântica.

## O que NÃO foi reaberto

Todos os claims já selados no r01 continuam selados.  
Este r02 não repete investigação de:
- HERMES-CORE source;
- Omni Router source;
- papel preservado do Zendrive;
- owner da arquitetura;
- existência das releases upstream já registradas;
- contratos de source já provados.

## O que continua realmente aberto

- `SCREENPIPE_CAPTURE_LIVE_IN_CENTRALDARK=UNKNOWN`
- `SCREENPIPE_FRAME_TO_MCP_TO_HERMES=UNKNOWN`
- `SCREENPIPE_AUDIO_TO_MCP_TO_HERMES=UNKNOWN`
- `GLOBAL_RUNTIME_FIXED_POINT=NOT_PROVEN`
- `TRIGGER_FABRIC_CONTRACT_CURRENT=BLOCKED` nos marcadores já identificados
- `MAIN_BRANCH_PROTECTION=OFF` é estado observado/política, não reabre source provado.
