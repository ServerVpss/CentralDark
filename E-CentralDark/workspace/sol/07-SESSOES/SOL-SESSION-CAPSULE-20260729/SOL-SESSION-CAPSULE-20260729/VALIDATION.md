# Validação da cápsula

```text
STATUS=PASS_WITH_DECLARED_SCHEMA_VALIDATOR_LIMIT
JSON_SYNTAX=PASS
UTF8_READ=PASS
MARKDOWN_FENCES=PASS
INTERNAL_REQUIRED_READING=PASS
SOUL_BASE_PRESERVED=PASS
SECRET_PATTERN_SCAN=PASS
SYMLINKS_IN_PACKAGE=0
RECOVERY_INVARIANTS=PASS
SCHEMA_STRUCTURAL_ASSERTIONS=PASS
FULL_JSON_SCHEMA_VALIDATOR=NOT_AVAILABLE_IN_BUILD_ENVIRONMENT
CONTENT_FILES_HASHED=32
MANIFEST_VERIFY=PASS
CLEAN_EXTRACTION=PASS
REPRODUCIBLE_ARCHIVE=PASS
```

## Invariantes testados

- carregar a cápsula não herda autorização;
- nenhuma pasta foi migrada;
- nenhuma escrita no perfil foi declarada;
- o protocolo ativo é `SOL_HERMES_UNIFIED_V2`;
- `new_step_started` deve ser falso no envelope de revisão;
- todas as referências de leitura obrigatória existem;
- o SOUL-base permanece prefixo do SOUL refinado, salvo três campos de status
  explicitamente promovidos;
- nenhum padrão conhecido de token, chave privada, JWT ou chave OpenAI foi
  encontrado.

## Limite declarado

Os schemas são JSON válido e receberam verificações estruturais determinísticas.
Validação integral Draft 2020-12 permanece `NOT_RUN` porque o ambiente não
possui validador de JSON Schema e nenhuma dependência foi instalada apenas para
produzir um verde.
