# Sentinela Session Mesh

Módulo defensivo para dados de sessão em redes não confiáveis. O transporte é
TLS 1.3 com autenticação mútua; cada mensagem também recebe um envelope AEAD
XChaCha20-Poly1305 derivado por sessão e época. Assembly não implementa
criptografia: é restrito à zeroização de memória e `PAUSE` em x86-64.

## Invariantes executáveis

- TLS 1.3 apenas; autenticação mútua obrigatória; 0-RTT desabilitado.
- Token de sessão opaco de 256 bits; o servidor retém somente HMAC do token.
- HKDF-SHA-256 separa chaves por `session_id`, época e domínio de protocolo.
- XChaCha20-Poly1305 autentica payload e cabeçalho fixo como AAD.
- Nonce aleatório de 192 bits por envelope; sequência monotônica fica no AAD.
- Janela anti-replay de 128 mensagens aceita reordenação legítima uma vez.
- A janela de replay avança somente depois da autenticação AEAD.
- Rotação mantém no máximo a época atual e uma anterior durante a graça.
- Framing valida comprimento antes de alocar memória.
- Retry é proibido para operações não idempotentes.
- Circuit breaker, timeout e bulkhead falham fechados.
- Logs e `Debug` nunca imprimem tokens ou chaves.

## Estrutura

```text
src/asm_hardening.rs  zeroização x86-64 e fallback portátil
src/crypto.rs         HKDF, AEAD, AAD e codec binário estrito
src/keyring.rs        épocas, rotação e janela de graça
src/replay.rs         janela deslizante anti-replay de 128 bits
src/session.rs        tokens, sessões, revogação, seal/open
src/transport.rs      TLS 1.3/mTLS e framing length-prefixed
src/resilience.rs     retry, timeout, bulkhead e circuit breaker
tests/                adulteração, replay, rotação e concorrência
```

## Verificação

```bash
./verify.sh
```

O script exige `cargo`, executa formatação, Clippy, testes, build release e,
quando instalados, `cargo-audit` e `cargo-deny`.

## Integração mínima

```rust
use sentinela_session_mesh::{KeyEpoch, RotatingKeyring, SessionManager};

let epoch = KeyEpoch::new(1, master_key, now_ms, now_ms + 86_400_000);
let manager = SessionManager::new(RotatingKeyring::new(epoch), token_pepper, 1 << 20);
let (session_id, token) = manager.create_session(now_ms, 3_600_000)?;
let envelope = manager.seal(session_id, &token, payload, now_ms, 30_000)?;
let plaintext = manager.open(&envelope, &token, now_ms + 1)?;
# Ok::<(), sentinela_session_mesh::SecurityError>(())
```

## Limites

O módulo não protege um processo, kernel ou host já comprometido. Zeroização é
redução de exposição, não prova de ausência de cópias em registradores, swap,
crash dumps ou hardware. Chaves-mestre de produção devem vir de KMS/HSM e não
de arquivos de configuração. Certificados precisam de PKI, revogação e rotação
operacional externas ao crate.

