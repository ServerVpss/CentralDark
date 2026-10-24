# CentralDark — aprovar e revogar dispositivo no Admin (2026-10-22)

Owner existente: apps/modulos/mcp. Branch isolada `docs/casa-vps-owner-proof-20261022`.

- API de pareamento unificada sob /device, com mesmo store em src/dist.
- GET /admin/pairing reutiliza a sessao de cookie do /admin ja existente, sem nova autenticação ou frontend com chave administrativa.
- A aprovacao e revogacao exigem sessao admin valida + header X-CentralDark-Intent: pairing-admin. O Bearer admin existente continua suportado.
- Dispositivo aprovado recebe token one-shot via /device/pair/status com segredo de posse do lado do dispositivo. Revogacao remove o hash do token e invalida heartbeat.
- Testes adicionados: rejeicao sem cabecalho admin, aprovacao, revogacao e token antigo recusado.
- Sem comando remoto arbitrario, sem capturar stdout ou enviar tokens para GitHub. Sem criar MCP paralelo.
- CURRENT: CODIGO EM PR, NAO RUNTIME. Passar CI e publicar via owner com rollback antes de afirmar que os botoes estao operacionais.
