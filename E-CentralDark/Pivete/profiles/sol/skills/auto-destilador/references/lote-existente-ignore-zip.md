# Lote do CHEFE: health ≠ garimpo

Watch path canônico:
`E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE`

## Falha medida 2026-08-26

`8788/health` `watcher_active=true` + pasta ~7GB, mas o lote não saía.

Causa no `scripts/auto_destilador.py` (corrigida no arquivo, não só na skill):

- `IGNORE_PATTERNS` comia `.zip .png .pdf .html` — o ouro do CHEFE.
- Watchdog só reage a create/modify. Lote já no disco exige `scan_existing` no boot.
- `handle_zip` extraía para `.extracted_*` e `should_skip_path` zerava inner (inner=0).
  Processar inners pelo **nome do arquivo**, não pelo path com `.extracted_`.
- Não mover `.env` nem arquivo >20MB.

## Contraprova

Log deve ter `SCAN EXISTENTE: ...PASTA DO CHEFE...` e `ZIP destilado <nome> inner=N` (N>0).
Sem isso = teatro. `processed_count` sozinho não prova ouro.

## Skip de lixo

Pular walk em `.cache .codex .agents webhook-clean schemas Codex CentralDark-live`.
Não reprocessar dump TSX/XSD do Codex como cristal.
