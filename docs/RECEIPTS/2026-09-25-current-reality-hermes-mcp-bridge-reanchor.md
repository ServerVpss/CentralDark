# Receipt — Reancoragem CURRENT Hermes / MCP / Bridge

Data local: 2026-09-25 00:37 BRT
Repo: ServerVpss/CentralDark
Destino: main

## Intenção do CHEFE

Registrar em main que o diagnóstico operacional antigo venceu: a topologia mudou, a VPS voltou a responder, a main avançou e o estado precisa ser tratado como CURRENT novo, não como repetição do receipt anterior.

## Fatos medidos nesta rodada

- `main` atual medida no GitHub: `4876711ee0d05e5d7f01362f2c00d34dd0628286`.
- Commit atual: `docs(central-notificacoes): novidades do dia ancoradas em 2f3ef85b + conflito #1662 marcado`.
- Remote Desktop Commander, nesta sessão, listou `vmi3256920` como `online`.
- A leitura anterior `RDC offline / ponte caída / Hermes sem provider` está expirada para decisões CURRENT.

## Material trazido pelo CHEFE — tratado como evidência de revisão externa

O CHEFE trouxe uma revisão operacional indicando que:

- `hermes-acp` aparece ONLINE no PM2.
- Existem múltiplos `docker mcp gateway run` ativos subordinados ao Hermes.
- Existe `hermes serve --isolated` ativo.
- Existem duas sessões Desktop Commander remotas (`conta1` e `conta2`) vivas.
- Existe `tunnel-client --profile centraldark-mcp`.
- MCP CentralDark está online.
- Hermes Core em `:8899` está saudável.

Esses pontos precisam de reconfirmação por sonda direta quando o executor de processo estiver disponível, mas já são suficientes para invalidar o uso automático do diagnóstico antigo.

## Separação obrigatória de camadas

```text
PONTE_VIVA != PROVIDER_DE_IA_PRONTO
HERMES_CORE_SAUDAVEL != TODOS_AGENTES_EXECUTANDO_CORRETAMENTE
MCP_ONLINE != TODAS_FERRAMENTAS_ATIVAS
REMOTE_VISUAL_CONECTADO != DEVICE_VISIVEL_EM_TODO_CONECTOR
MERGE_IS_NOT_DEPLOY
CI_PENDING_IS_NOT_PASS
UNKNOWN != PASS
REALIDADE_IS_JUDGE
```

## Estado correto agora

```text
CURRENT_MAIN=4876711ee0d05e5d7f01362f2c00d34dd0628286
VPS_VMI3256920=ONLINE_NO_CONECTOR
DIAGNOSTICO_ANTIGO=EXPIRADO
HERMES_MCP_BRIDGE=REMEASURE_REQUIRED_BY_LAYER
SEGREDO_BROWSER_TRAY=PASS_VISUAL_PELO_CHEFE
SEGREDO_CONNECTOR_NESTA_SESSAO=UNKNOWN
```

## O que não foi feito

- Nenhum deploy.
- Nenhum restart global.
- Nenhuma rotação de credencial.
- Nenhum merge/rebase.
- Nenhuma execução automática de arquivo.
- Nenhuma promoção de verde global.

## NEXT_CURSOR

```text
PROVAR_PROCESSOS_HERMES_MCP_NA_VPS
→ MAPEAR PID/OWNER/SESSION/PROFILE
→ SEPARAR PROVIDER / ACP / GATEWAY / BRIDGE
→ VALIDAR ONE_REMOTE_PROCESS_PER_PROFILE
→ REGISTRAR RECEIPT OPERACIONAL
→ RETOMAR ARTIFACT / OBSIDIAN / BRIDGE SEM FALSO-VERDE
```

## Veredito

A CentralDark deve abandonar a premissa antiga de ponte caída como base de decisão. O estado CURRENT é vivo, mas precisa ser reconciliado por camada antes de qualquer conclusão verde.
