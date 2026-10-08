# Lembrança — Metabolismo do catálogo unificado MCP

Status: SESSION_CRYSTAL
Authority: SEGREDO/CHEFE
Learning: #168
Owner executável: `apps/modulos/mcp/src/tools/core/mcp-admin.js`
Receita: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json#HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH`

## O que ficou aprendido

```text
LEARNING_168_MCP_UNIFIED_CAPABILITY_CATALOG=true
```

A CentralDark não precisa de um MCP para tools, outro para Desktop Commander e outro para Screenpipe. O mesmo catálogo pode descrever capacidades internas e rotas externas sem confundir catálogo com execução.

```text
CENTRALDARK MCP
├─ tools internas
├─ rotas autorizadas
│  ├─ MCP nativo VPS
│  ├─ MCP remoto OAuth
│  ├─ Remote Desktop Commander
│  ├─ Screenpipe
│  ├─ SSH
│  ├─ Tailscale
│  ├─ MCP Casa→VPS
│  ├─ Hermes↔Shell
│  ├─ GitHub↔Runtime
│  ├─ AionUi↔MCP
│  └─ CAS Cloud relay
└─ Reality Judge
```

## Relação Screenpipe × Desktop Commander

Remote Desktop Commander é ponte/capability de execução autorizada. Screenpipe é sensor visual/áudio/desktop. Eles ficam no mesmo catálogo, mas o estado de um não prova o estado do outro.

```text
SCREENPIPE_AND_RDC_SHARE_ONE_MCP_CATALOG=true
RDC_STATE != SCREENPIPE_STATE
CATALOG_ENTRY != RUNTIME_HEALTH
DOCUMENTED_ROUTE_IS_NOT_RUNTIME_PROOF=true
```

## Receita de replay

1. Consultar `mcp_admin_catalog` com filtro pertinente.
2. Resolver tool/route/capability sem criar owner paralelo.
3. Medir a rota no binding atual.
4. Se falhar, classificar a rota exata.
5. Consultar as alternativas autorizadas do mesmo catálogo.
6. Continuar pela primeira capability viva aplicável.
7. Fazer readback do efeito.
8. Só então PASS/UNKNOWN/BLOCKED.
9. Registrar receipt e preservar NEXT_CURSOR.

## Hook e guardrails

Reutilizados:
- `CAPABILITY_GAP` e `TERRITORY_ROUTE_CHANGE` em `TRIGGERS.yml`;
- `ROUTE_FAILURE` em `system_sentinel.py`;
- `HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH` no registry;
- `PROVEN-DETERMINISTIC-LOCK.yml`;
- `verify_repo_contract.py`;
- `CENTRALDARK_AI_BOOT.yaml`;
- PR-mãe #1757 como rendezvous, #1562 como legado.

Nenhum segundo dispatcher, MCP, router, hook ou cérebro foi criado.

## Fingerprint atual

`42c132bf864a3a82b16495bc6109a2d09c90e7c0806988fb389103e021011bd5`

## Fronteira de realidade

A main prova a materialização do catálogo e do metabolismo. A VPS só vira PASS para o catálogo novo quando o runtime vivo devolver esse fingerprint/rotas em `mcp_admin_catalog`.


## Descoberta causal — source não é runtime

A medição do processo em `:9100` mostrou execução por `/root/CentralDark_MCP_RUNTIME/apps/modulos/mcp/dist/mcp-server.js`. Isso revelou uma lacuna que o catálogo em `src` sozinho não fecharia.

```text
SOURCE_UPDATED != DIST_RUNTIME_UPDATED
SOURCE_DIST_PARITY_REQUIRED=true
RUNTIME_TREE_MAY_DIFFER_FROM_CANONICAL_REPO_TREE=true
MEASURE_EXEC_PATH_BEFORE_DEPLOY=true
```

## Recibo de prova reutilizavel — AionUi MCP stdio (08/10/2026)

**Owner ja existente:** `scripts/vps/aionui-native-integrate.py`. A unificacao nao cria outro servidor nem altera a arquitetura. O processo pai `aioncore` iniciou 3 processos filhos do MCP nativo com executavel `/usr/local/bin/node`, `--stdio --compact --admin` e `CENTRALDARK_CLIENT_LABEL=AionUi`; a WebUI respondeu HTTP 200 em `127.0.0.1:25808`.

**Receita deterministica READ-ONLY (repetivel sempre que necessario):**

```bash
python3 scripts/vps/aionui-native-integrate.py --repo /root/CentralDark_MCP_RUNTIME --verify-only
```

O comando confirma dinamicamente o pai `aioncore`, os argumentos de cada filho, o label no ambiente **sem imprimir os demais valores**, a existencia e SHA256 do executavel MCP e HTTP 200 da WebUI. Nao depende de PID fixo; nao reinicia, recria, nem reconfigura processos. Saida JSON `PASS`/exit 0 quando a cadeia atual foi observada. Caso falhe uma das clausulas, `UNKNOWN`/exit 2 e reabrir apenas o setor afetado. O hash do dist e evidencia de identidade do arquivo, **nao** criterio de igualdade com a source da main.

**Medicao e contraprova da VPS:** comando positivo resultou `matching_children=3`, `inspected_mcp_children=7`, `webui_http_200=true`, `runtime_entry_exists=true`, hash dist `b3c28cbb26e538d00ad22e56e9a1e8b435a5b0a71af8b1d631be2152e0c76b48`, saida 0. Mesmo verificador apontado para repo inexistente devolveu `UNKNOWN`, saida 2: **FAIL CLOSED PASS**. Verificador validado com `py_compile`.

**Fronteira:** `AIONUI_MCP_STDIO_PROCESS_BINDING=PASS`; `MCP_TOOL_INVOCATION_E2E=NOT_TESTED`. Prova e reutilizavel enquanto execucao e fingerprint correspondentes permanecerem atuais; drift relevante obriga novo teste, nao nova arquitetura. O PR #1757 foi marcado RETIRED; #1562 e LEGACY/NAO MERGEAR. Esta cristalizacao foi feita diretamente no owner atual da `main`, sem novo PR/branch.

**Commits do verificador:** `5287e7343b41837f8a6b7a1aa7b0ea9cc4f4dcb0` (verificador) e `1d69ed8409ecd7b69ef80bc03f2e3ec857325252` (correcao NUL do /proc e contraprova).
