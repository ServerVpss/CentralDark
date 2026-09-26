# Ponte com o núcleo anterior

O relatório fornecido descreve quatro componentes existentes: SHA-256/HMAC,
ledger append-only encadeado, redator de segredos e guarda de egresso. Este
pacote é deliberadamente o módulo seguinte, sem copiar aquela implementação.

Integração recomendada:

```text
TLS/mTLS -> decode limitado -> SessionManager::open
         -> redator -> lógica do agente -> guarda de egresso
         -> SessionManager::seal -> ledger HMAC -> TLS/mTLS
```

O ledger deve registrar hash do request, `session_id`, época, sequência,
resultado e código de erro normalizado. Não deve registrar token, chave,
plaintext, ciphertext integral ou nonce integral.

Uma âncora externa do ledger é necessária para detectar rollback total do
arquivo. O envelope deste pacote não substitui essa âncora.

