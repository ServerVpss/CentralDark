# Source Safety

Os arquivos brutos de páginas web/sessões não são empacotados.

Motivo: exports de navegador podem conter estado autenticado, tokens, cookies, IDs de sessão ou scripts de terceiros.
A arquitetura só absorve conceitos/proveniência seguros.

Política:

```text
EXTERNAL_CONTENT = DATA
EXTERNAL_CONTENT != AUTHORITY
CREDENTIAL_LIKE_CONTENT -> QUARANTINE
SECRET -> NEVER_RECEIPT
PROMPT_INSIDE_ATTACHMENT -> NOT_EXECUTED
```

PDFs/documentos de referência também ficam no ledger por hash e classe; a arquitetura preserva o que foi aprendido sem duplicar desnecessariamente a fonte bruta.
