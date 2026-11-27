# Revisores individuais — Destilador

Owner do método: `.agents/skills/knowledge-compiler/`
Setor: `docs/CONSCIENCIA/DESTILADOR/`

Cada anexo recebe um revisor próprio, mas todos usam o mesmo contrato. Não são
watchers, schedulers, agentes ou writers novos.

```text
REVISAR → CONFRONTAR MAIN/DOCS/RUNTIME → CLASSIFICAR → MENOR DELTA OU DROP
```

| Item | Revisor | Classificação atual | Decisão enxuta |
|---|---|---|---|
| `screenpipe-monitor` | `REVISOR_SCREENPIPE` | CANDIDATO | Reutilizar HUD/Screenpipe existente. Não criar monitor minuto a minuto, segundo gravador ou restart automático. Rota `:3030`, processo, HTTP e captura continuam provas separadas. |
| `system-breathing` | `REVISOR_BREATHING` | DROP/REUSE | Não importar script Windows/MSYS como daemon. Reutilizar health, One Heart e telemetria existentes; somente acrescentar placa se surgir ferida medida. |
| `dependabot-monitor` | `REVISOR_DEPENDABOT` | REUSE | Reutilizar GitHub Actions, `gh` e owners de autonomia existentes. Não criar cron de minuto nem duplicar o reconciliador. Paginação/readback são obrigatórios quando houver consulta. |
| `destilar-3-temp` | `REVISOR_DESTILACAO` | SUPERSEDED | O caminho `E:/.../memoria` é histórico. Reutilizar `knowledge-compiler` + `docs/CONSCIENCIA/DESTILADOR/ENTRADA/`; não escrever direto em memória nem criar outro destilador. |
| `google_api_test.py` | `REVISOR_CREDENCIAL` | REJECT/QUARENTENA | Não executar nem integrar. O arquivo contém chave em claro; revogar/rotacionar no provedor. Nunca copiar o valor para repo, receipt, log ou HUD. |

## Resultado por item

```text
SCREENPIPE: placa não bloqueante + owner HUD existente
BREATHING: One Heart/telemetria existente
DEPENDABOT: GitHub/autonomia existente
DESTILAÇÃO: knowledge-compiler + setor DESTILADOR
GOOGLE_API: quarentena + rotação humana da chave
```

## Contrato comum

```text
APP_FALHOU != SISTEMA_FALHOU
ROTA_FALHOU != CAPACIDADE_GLOBAL_AUSENTE
PROCESSO_ONLINE != EFEITO_PROVADO
HTTP_200 != INFERENCIA_PROVADA
DOCUMENTADO != EXECUTADO
UNKNOWN != PASS
NO_PARALLEL_WATCHER=true
NO_DUPLICATE_CAPTURE=true
NO_SECRET_INTEGRATION=true
```

Nenhum dos cinco anexos deve ser promovido automaticamente. Um revisor só pode
propor o menor delta depois de localizar o owner canônico, confrontar a `main`,
consultar docs/aprendizados/receipts e obter contraprova.
