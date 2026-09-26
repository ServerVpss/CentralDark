# SHA-256 / integridade

O pacote usa SHA-256 como fingerprint e detector de alteração.

Isso cria **tamper evidence**, não prova de autoria por si só.

A cadeia é:

```text
conteúdo
→ SHA-256
→ receipt (timestamp/origem/HEAD/classe)
→ manifest
→ contraprova
```

Quando houver assinatura verificável, ela pode ancorar o digest. Sem assinatura, o hash continua útil para identidade de bytes e detecção de drift, mas não deve ser chamado de autenticação.
