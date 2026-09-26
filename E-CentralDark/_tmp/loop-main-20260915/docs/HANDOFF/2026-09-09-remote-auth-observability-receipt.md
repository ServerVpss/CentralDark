# CentralDark · Remote Auth + Observabilidade · Receipt

status: CRYSTALLIZED_ON_MAIN
authority: SEGREDO/CHEFE
owner_mode: REUSE_EXISTING_BODY

## Fato provado recebido

O fluxo funcional do Remote MCP chegou a:

```text
Connected to Desktop Commander MCP
→ Connected to Remote MCP
→ persisted session inválida por refresh token já usado
→ novo device authorization flow
→ device code recebido
→ autorização concluída
→ device marcado online
→ presence tracked
```

O Device ID pode mudar após nova autorização. `DEVICE_ID_CHANGED` não é falha por si só.

## Pin operacional

O owner `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json` deve usar o pacote comprovado `@wonderwhy-er/desktop-commander@0.2.48` até uma versão posterior ser remensurada e provada.

`latest` não substitui automaticamente uma versão comprovada.

## Padrão de observabilidade preservado

Para PostHog/Sentry ou equivalentes na CentralDark:

- observabilidade é opcional e dependente de configuração externa;
- ausência de chave/DSN desabilita o envio sem quebrar o app;
- session replay permanece estruturalmente desabilitado por padrão;
- PII deve ser removida antes de envio;
- desenvolvimento não envia por padrão;
- Do Not Track deve ser respeitado quando aplicável;
- eventos carregam somente o necessário para diagnóstico;
- secrets/tokens nunca entram no Git.

## Regra Zero

```text
CURRENT > HISTORICAL
REALITY = JUDGE
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ZERO_REGRESSION_REQUIRED=true
```

## Próxima aresta

O MCP próprio `https://mcp.centralldark.com/mcp` já existe no config, mas não deve substituir a rota externa funcional até haver prova viva de handshake Casa → CentralDark MCP → tool call → receipt.

`REMOTE_EXTERNAL_PROVEN != CENTRALDARK_REMOTE_PROVEN`.
