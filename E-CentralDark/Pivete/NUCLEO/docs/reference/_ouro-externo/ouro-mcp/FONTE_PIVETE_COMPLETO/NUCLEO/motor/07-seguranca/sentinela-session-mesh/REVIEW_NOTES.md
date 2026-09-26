# Pontos de revisão técnica

## Decisões deliberadas

1. AEAD por sessão permanece mesmo sobre TLS para reduzir blast radius entre
   terminação TLS, proxies e filas intermediárias.
2. XChaCha usa nonce aleatório de 192 bits. A sequência fica no AAD para replay,
   não é usada como nonce; isso evita depender de persistência crash-safe do
   contador para garantir unicidade criptográfica.
3. O bias de estado não contém chave derivada em cache. HKDF roda por envelope
   e a chave temporária é zeroizada ao sair do escopo.
4. A replay window é atualizada depois do AEAD, nunca antes.
5. Assembly não contém SHA, HMAC, HKDF ou cifra. Ele reduz resíduo de memória e
   fornece `PAUSE`; primitivas criptográficas vêm de RustCrypto/rustls.
6. Retry exige duas condições: operação marcada idempotente e erro classificado
   como transitório pelo chamador.
7. Cancelamento de probe `HALF_OPEN` libera a vaga por RAII.

## Questões que exigem decisão do integrador

- Backend linearizável para sequência, replay, revogação e TTL em cluster.
- KMS/HSM, duração das épocas e período de graça.
- PKI mTLS, identidade no SAN, CRL/OCSP e rotação de certificados.
- Limites de payload/frame e timeouts por classe de operação.
- Política externa de normalização de erros e retenção de telemetria.
- Ledger/âncora externa para auditoria e detecção de rollback total.

## Gates que permanecem vermelhos

- Ausência de `cargo` no ambiente de geração impediu compilação e testes.
- `Cargo.lock` deve ser gerado e versionado pelo primeiro CI aprovado.
- Falta teste de interoperabilidade com certificados reais da PKI alvo.
- Falta teste de caos contra o backend distribuído que substituirá o estado
  local de referência.

