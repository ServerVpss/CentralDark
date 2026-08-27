# Prova — catálogo compatível com Claude Desktop

**Quando:** 2026-07-10
**Gateway:** `https://api.centralldark.com/v1/models`

## Resultado

✅ `/v1/models` respondeu `200 OK`.
✅ O catálogo retornou `object: list`.
✅ Foram encontrados 9 modelos utilizáveis.
✅ Aliases compatíveis com clientes exigentes foram anunciados:

- `claude-3-5-sonnet-latest`
- `claude-3-5-sonnet-20241022`
- `claude-3-opus-latest`
- `gpt-4o`
- `gpt-4o-mini`

## Diagnóstico

O erro anterior do Claude Desktop vinha do catálogo só anunciar modelos próprios `arsenal-*`. Alguns clientes filtram a descoberta e só aceitam famílias conhecidas como `claude-*` ou `gpt-*`.

## Correção aplicada na VPS

O adapter anuncia aliases públicos no `/v1/models` e mapeia internamente para o runtime Arsenal:

- `claude-3-5-sonnet-latest` → `arsenal-router`
- `claude-3-5-sonnet-20241022` → `arsenal-router`
- `claude-3-opus-latest` → `arsenal-parallel`
- `gpt-4o` → `arsenal-router`
- `gpt-4o-mini` → `arsenal-router`

## Evidência de descoberta

```txt
status 200
content-type application/json
object list
count 9
ids arsenal-router,arsenal-parallel,arsenal-debate,arsenal-hermes,claude-3-5-sonnet-latest,claude-3-5-sonnet-20241022,claude-3-opus-latest,gpt-4o,gpt-4o-mini
```

## Evidência de roteamento

✅ Chamada de chat usando `claude-3-5-sonnet-latest` foi aceita pelo adapter.
✅ Auditoria registrou o mapeamento `claude-3-5-sonnet-latest->arsenal-router`.
✅ Resposta de teste retornou `200 OK` com `PONG-CENTRALDARK`.

## Ouro registrado

O gateway está OpenAI-compatible para descoberta e inferência por alias. O Claude Desktop deve usar o alias público e o runtime interno continua sendo Arsenal.

## Pendência operacional

Se o cliente ainda mostrar erro vermelho, limpar/reconectar a credencial no Claude Desktop e testar novamente a descoberta. O gateway já responde catálogo OpenAI-compatible com aliases reconhecíveis.
