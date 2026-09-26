# Pasta do CHEFE lotada ≠ destilador minerando

User 2026-08-26: "esse garimpo ta pegando nada nao ta lotado de coisa".

## Causa medida
WATCH_PATH já era a pasta certa:
`E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE`

Mas o daemon:
1. `IGNORE_PATTERNS` excluía `.zip .png .pdf .html` — o lote do CHEFE.
2. Só reagía a create/modify. Arquivos já no disco **não** entravam.
3. Health `:8788 proved=true` ≠ mining. Watcher vivo + pasta 7GB ignorada = teatro.

## Correção
- Não ignorar zip/html/pdf/png. Ignorar só `.tmp .lnk .env .pem .key .exe .dll .pyc .xsd .tsx .jsx`.
- `scan_existing()` no boot (limite por ciclo).
- ZIP: extrair e processar inner **sem** `should_skip_path` no `.extracted_*` (senão inner=0).
- Não mover `.env` nem arquivo >20MB.
- Pular dirs: `.extracted_ .agents webhook-clean schemas Codex CentralDark-live`.

## Runtime
Python com watchdog: `...\hermes-agent\venv\Scripts\python.exe`
uv python isolado **não** tem watchdog — não usar esse interpretador.

## Prova
Log deve mostrar `SCAN EXISTENTE:` + `ZIP destilado ... inner=N` (N>0 no cadeado/pombo/deploy).
Health sozinho não fecha o gate.
