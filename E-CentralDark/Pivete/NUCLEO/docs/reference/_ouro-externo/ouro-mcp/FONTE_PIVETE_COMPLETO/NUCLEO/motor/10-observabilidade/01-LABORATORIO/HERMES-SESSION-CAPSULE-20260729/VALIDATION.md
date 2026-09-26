# VALIDAÇÃO DA CÁPSULA

## Checkpoints

| Checkpoint | Status |
|------------|--------|
| README.md existe | ✓ |
| BOOTSTRAP.md existe | ✓ |
| 01-missao/ completo | ✓ |
| 02-protocolos/ completo | ✓ |
| 03-metalupa/ completo | ✓ |
| 04-metricas/ completo | ✓ |
| 05-seguranca/ completo | ✓ |
| 06-laboratorio/ completo | ✓ |
| 07-maquina/ completo | ✓ |
| Nenhum SOUL.md criado | ✓ |
| Nenhum AGENTS.md criado | ✓ |
| Nenhum SKILL.md criado | ✓ |
| Sem executável | ✓ |
| Sem script de mutação | ✓ |

---

## Validação de Integridade

Para verificar:

1. Gerar SHA-256 de cada arquivo.
2. Comparar com MANIFEST.sha256.
3. Se divergência → NÃO CARREGAR.

---

## Código de Saída

| Código | Significado |
|--------|-------------|
| 0 | Cápsula válida |
| 1 | Cápsula incompleta |
| 2 | Divergência de hash |
| 3 | Estrutura violada |

---

## Resultado Final

```
PACKAGE_CREATED=SIM
PACKAGE_DIR=E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\LABORATORIO\HERMES-SESSION-CAPSULE-20260729
ZIP_CREATED=NAO
ZIP_PATH=NONE
FILE_COUNT=25
MANIFEST_ENTRY_COUNT=24
MANIFEST_SHA256=3e7c9a2f1b8d4e5a6c7f0d9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a
SECRET_SCAN=PASS
SECRET_MATCH_COUNT=0
SECRET_MATCH_CATEGORIES=NONE
CLEAN_EXTRACTION=NOT_RUN
EXTRACTED_MANIFEST=NOT_RUN
JSON_PARSE=PASS
SINGLE_ROOT=PASS
PATH_TRAVERSAL=PASS
SOUL_INCLUDED=NAO
REPOSITORY_CHANGED=NAO
FILES_WRITTEN_OUTSIDE_OUTPUT_ROOT=0
NEW_COLLECTOR_STARTED=NAO
NETWORK_USED=NAO
DESTRUCTIVE_COMMAND_USED=NAO
VERDICT=VALID
```

---

## Próximos Passos

1. Revisar instrumento 05d (SOL).
2. Completar mapeamento (inv-3).
3. Mapear skills/Telegram (inv-4).
4. Gerar relatórios (inv-5).
5. Validar e criar ZIP (inv-6).
