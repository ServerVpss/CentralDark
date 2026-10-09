# Lote de entrada — 2026-10-09

Registro sanitizado do material recebido para o setor de destilação. Os valores de
credencial não são copiados nem registrados.

```text
LOTE_ID=2026-10-09-hermes-centraldark-pastes
CLASSIFICACAO=QUARENTENA_PARA_REVISOR
ZIP=pastes.zip
ZIP_SHA256=f5929d6aa547b1010327105ffaf5c51dcee3205eb7d710250ade0dee1062f165
ZIP_ENTRIES=30
JSON_OAUTH=3
CREDENTIAL_FILE=centraldark.json
CREDENTIAL_VALUE=REDACTED
```

## Tratamento

- `centraldark.json`: contém access/refresh token; **não usar, não executar, não
  versionar**. Exigir revogação/rotação no provedor.
- `centraldark.meta.json` e `centraldark.client.json`: metadados de OAuth; tratar
  como referência candidata, não como autorização da sessão.
- `pastes.zip`: 30 textos em quarentena; destilar somente após inventário,
  deduplicação e confronto com `main`, docs, PRs, aprendizados, lembranças e
  receipts.

```text
OAUTH_TOKEN_USE=PROIBIDO
SECRET_COMMIT=PROIBIDO
SECRET_RECEIPT=PROIBIDO
INTEGRATION=NAO_APLICADA
NEXT_CURSOR=REVISAR_PASTES_INDIVIDUALMENTE
```

Fonte bruta preservada fora do Git em `/root/.hermes/attachments/` e na
quarentena do Hermes. Este manifesto não substitui a prova do provider nem cria
uma nova rota OAuth.
