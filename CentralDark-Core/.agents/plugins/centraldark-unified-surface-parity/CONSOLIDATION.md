# Registro de consolidação dos ZIPs legados (somente evidência)

Owner: `ServerVpss/CentralDark`, `CENTRALDARK_UNIFIED_SURFACE_PARITY_01`.
Canônico a evoluir: `plugins_6ab87b459ff08191a69311acd4c77d83`; preservar o mesmo plugin_id.

| ZIP de entrada | SHA-256 | Display name | App ID | Estado |
|---|---|---|---|---|
| `plugin(1).zip` | `01b2f969219efa852de102ab6582806a0fc3e3365b0a0d048604033cd5a5910a` | `CentralDark` | `asdk_app_6ac72e44d1808191abe016c60df4e557` | reported_unavailable_in_UI |
| `plugin (3).zip` | `01b2f969219efa852de102ab6582806a0fc3e3365b0a0d048604033cd5a5910a` | `CentralDark` | `asdk_app_6ac72e44d1808191abe016c60df4e557` | duplicate |
| `plugin (1).zip` | `54abbe4efb61df96c6e81d57b9989c2126926f370f8add38f90b6d029623279f` | `CENTRAlDARK` | `asdk_app_6acc3b567e608191a9a0830b59d86569` | distinct_app_wrapper |
| `plugin (2).zip` | `5d2061d3f3a3a39b09e9243379dccc85bc5745668a5d1fd211a5fb52ded2e3fd` | `CENTRALDARK` | `asdk_app_6ab822a97c688191948648c0c40009d5` | distinct_app_wrapper |

Todos os ZIPs legados declaram `interface.capabilities=[]` e contêm apenas `.app.json` e `.codex-plugin/plugin.json`.
`plugin (3).zip` e `plugin(1).zip` têm hash idêntico; são cópias byte a byte.

## Deltas herdados

- Descrição de um núcleo operacional: CHEFE/intenção, SOL, Hermes, Reality Judge e HUD.
- Referências funcionais: MCP Admin OAuth, Casa/Windows, VPS, GitHub, Tailscale, Obsidian/Grafo Vivo, AionUi e Screenpipe.
- Preservar execução autorizada, leitura, redaction de segredos, prova, readback e continuidade.
- URLs e namespaces originais são bindings de transporte. Não copiar `.app.json` e não criar backend/segundo owner.

## Estado e critérios para retirar wrappers

`MERGED_MANIFEST_AND_SKILL=PASS_AFTER_RELEASE_READBACK`; `LEGACY_WRAPPERS_REMOVED=NO`; `LIVE_VOICE_PARITY=UNKNOWN`.
A retirada exige `mcp_status`, `mcp_admin_catalog`, teste de equivalência de capabilities, recibo da superfície e confirmação da instalação do canônico.
A falha de um app vinculado não indica falha geral do servidor MCP.
