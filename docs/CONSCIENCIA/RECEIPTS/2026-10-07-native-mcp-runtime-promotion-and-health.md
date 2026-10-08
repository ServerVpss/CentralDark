# Receipt — promoção nativa MCP e fechamento de health crítico

Data: 2026-10-07
Intenção: preservar a capability MCP e suas rotas, eliminar drift do runtime vivo e manter a convergência da superfície administrativa como etapa posterior.

```text
LOOP_ID=centraldark-mcp-total-integration-001
PARENT_ID=CENTRALDARK_CONTINUOUS_GOAL
SOURCE_MAIN=ff336e2bf86194602993060e5b58ad46d293f0b5
MICRODEPLOY_OWNER=scripts/vps/main-pinned-microdeploy.sh
MICRODEPLOY_COMMIT=2fa4665104a2dcd095556d13c2734bca684c0cde
SERVICE=centraldark-native-mcp-http.service
RUNTIME_ROOT=/root/CentralDark_MCP_RUNTIME
RUNTIME_ENTRY=apps/modulos/mcp/dist/index.js
```

## Delta aplicado

O owner existente `main-pinned-microdeploy.sh` foi evoluído, sem criar deployer paralelo, para o runtime MCP systemd medido. O contrato exige:

- `ExecStart` e `WorkingDirectory` exatos da unit ativa;
- SHA fonte ancestral da `origin/main`;
- fileset inicial estrito: `apps/modulos/mcp/src/index.js` e `apps/modulos/mcp/dist/index.js`;
- verificação three-way que bloqueia overlap dirty independente;
- backup por arquivo, restart da mesma unit e rollback no mesmo owner;
- `/health`, `/heartbeat` e contagem do catálogo como readback;
- `--dry-run` sem mutação.

A dry-run e a promoção real usaram somente os dois arquivos acima.

```text
RUNTIME_PID_BEFORE=2239433
RUNTIME_PID_AFTER=3504041
HEARTBEAT_BEFORE=500
HEARTBEAT_AFTER=200
HEALTH_AFTER=200
TOOLS_BEFORE=153
TOOLS_AFTER=153
RUNTIME_PROMOTION=PASS
ROLLBACK_PATH=/root/CentralDark-Recovery/main-pinned/mcp/20261007T183513Z
RUNTIME_RECEIPT=/root/CentralDark/logs/receipts/main-pinned-mcp-20261007T183513Z.json
```

O restart exigiu kill após timeout do stop anterior; o novo PID iniciou e respondeu aos probes. Isso é evidência de transição de serviço, não falha omitida.

## Health profundo

A causa restante de `/health/deep=503` foi medida separadamente:

```text
CRITICAL_FAILURE=hub_mission_consumer
PREVIOUS_REASON=SUPABASE_URL_MISSING
```

O consumer é feature opcional no contrato, mas o health a considera crítica enquanto não está explicitamente desabilitada. A unit remota possuía um único EnvironmentFile, sem flag de enablement e sem presença de URL/projeto/chave Supabase; a fonte de segredos existente não continha esses bindings. Evidência histórica de consumer ativo não foi promovida a intenção CURRENT.

Foi feito backup do EnvironmentFile e incluída apenas a flag não secreta:

```text
HUB_MISSION_CONSUMER_ENABLED=false
ENV_BACKUP=/root/CentralDark-Recovery/mcp-env/20261007T184207Z/centraldark-mcp-remote.env
```

Após restart da mesma unit:

```text
HEALTH=200
HEARTBEAT=200
DEEP_HEALTH=200
DEEP_STATUS=degraded
HUB_MISSION_CONSUMER=OPTIONAL_EXPLICITLY_DISABLED
HUB_REASON=HUB_MISSION_CONSUMER_ENABLED=false
TOOLS=153
```

`degraded` continua visível: Telegram permanece indisponível, mas não é falha crítica desse runtime remoto. Nenhum segredo foi lido, impresso ou versionado.

## Contraprova

- MCP permaneceu no mesmo serviço, runtime root, porta e catálogo.
- `mcp.centralldark.com`, rotas de máquina e capability MCP não foram removidos nem reatribuídos.
- O consumer Hub não foi apagado: permaneceu explicitamente opcional para esta binding remota.
- A convergência visual ainda não foi declarada concluída.

## Próximo cursor

`MEASURE_INSTINTO_SUPERIOR_CURRENT_VISUAL_OWNER_AND_EXISTING_ADMIN_SURFACES → MAP_CAPABILITIES_TO_SINGLE_VISUAL_OWNER → IMPLEMENT_SMALLEST_COMPATIBLE_ABSORPTION_DELTA → READBACK → FIXED_POINT`
