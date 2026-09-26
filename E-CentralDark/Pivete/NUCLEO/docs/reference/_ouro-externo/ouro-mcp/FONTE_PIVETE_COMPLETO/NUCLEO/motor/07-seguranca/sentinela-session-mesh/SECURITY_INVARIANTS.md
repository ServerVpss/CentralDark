# Regras de resiliência e segurança

## Máquina de estados da sessão

```text
CREATED -> ACTIVE -> REVOKED
                  -> EXPIRED
```

Não existe transição de `REVOKED` ou `EXPIRED` para `ACTIVE`. Renovação cria
uma nova identidade e um novo token.

## Ordem obrigatória de recepção

1. Rejeitar tamanho superior ao limite antes da alocação.
2. Decodificar somente campos de tamanho fixo.
3. Validar versão e janela temporal.
4. Localizar sessão e validar HMAC do token em tempo constante.
5. Resolver a época de chave corrente ou anterior ainda válida.
6. Derivar chave específica da sessão com HKDF.
7. Autenticar e decifrar AEAD com todo o cabeçalho como AAD.
8. Somente então avançar a janela anti-replay.
9. Entregar plaintext ao chamador.

Alterar a ordem 7/8 permite que tráfego forjado consuma sequências legítimas.

## Política de retry

| Operação | Retry automático |
| --- | --- |
| leitura idempotente com timeout transitório | permitido e limitado |
| handshake TLS | permitido antes de publicar efeitos |
| criação de sessão sem idempotency key | proibido |
| rotação/revogação sem CAS | proibido |
| envio que já pode ter sido processado | proibido |
| erro de autenticação, AEAD ou replay | proibido |

## Circuit breaker

```text
CLOSED --threshold--> OPEN --cooldown--> HALF_OPEN
HALF_OPEN --success--> CLOSED
HALF_OPEN --failure--> OPEN
```

`HALF_OPEN` possui limite explícito de probes. O bulkhead é adquirido antes do
probe para não reservar capacidade lógica sem capacidade física.

## Domínios criptográficos

```text
session key = HKDF-SHA256(
    salt = session_id,
    IKM  = master_epoch_key,
    info = "sentinela/session-aead/xchacha20poly1305/v1" || epoch
)

token tag = HMAC-SHA256(
    token_pepper,
    "sentinela/session-token/v1" || session_id || token
)
```

## Proibições

- Não reutilizar token entre sessões.
- Não reutilizar chave-mestre entre ambientes.
- Não aceitar TLS abaixo de 1.3.
- Não habilitar early data/0-RTT para mutações.
- Não registrar plaintext, token, chave, nonce completo ou material HKDF.
- Não avançar replay window antes do AEAD.
- Não inventar primitivas criptográficas em Assembly.
- Não aumentar limites de frame com base em campos do próprio cliente.

## Estado distribuído

O `HashMap`/`AtomicU64` do crate é a implementação de referência para um único
processo. Em múltiplos nós, `next_outbound`, revogação, expiração e replay
precisam de armazenamento linearizável com CAS. Particionar o estado sem uma
fonte canônica permite colisão de sequência e reuso após restart.

Erros detalhados do crate são destinados a telemetria interna. A fronteira de
rede deve normalizar autenticação, sessão inexistente, token inválido e AEAD
inválido para uma resposta externa indistinguível.
