# Modelo de ameaça

| Risco | Defesa |
|---|---|
| Screenshot antiga tratada como verdade | freshness + nova consulta |
| Serviço cai após primeiro verde | duas ou mais amostras estáveis |
| Dois agentes escrevem juntos | lease de escritor único |
| Receipt alterado | cadeia SHA-256 verificável |
| Segredo capturado por OCR/log | redaction antes da persistência |
| Screenpipe vira juiz | binding read-only e policy independente |
| Heartbeat VPS forjado | HMAC + túnel privado + TTL |
| Webhook GitHub forjado ou repetido | HMAC SHA-256 + delivery-id dedupe |
| Pacote Base64 corrompido | tamanho + SHA-256 antes de decodificar |
| Arquivo consolidado alterado | seal SHA-256 + gate fail-closed + ruleset |
| Main muda durante a rodada | HEAD entra na assinatura; mudança reinicia estabilidade |
