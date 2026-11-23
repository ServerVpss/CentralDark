---
schema: centraldark.mcp.policy-catalog.receipt.v1
date: 2026-10-23
component: centraldark-native-mcp-http
source_commit: e58d808e02dac222fe54e7cb9b761b3d271dcd1d
status: PASS
---

# MCP CentralDark — política de catálogo: 20 ferramentas conhecidas

## Objetivo
Resolver o falso `count_mismatch` do dispatcher entre 12 destrutivas aprovadas e 20 presentes no runtime, sem aprovar automaticamente ferramentas em engenharia de compensação.

## Evidência medida após deploy (2026-10-23, UTC)
- Fonte GitHub: `e58d808e02dac222fe54e7cb9b761b3d271dcd1d`.
- Alterados no MCP ativo: `apps/modulos/mcp/manifesto-destrutivas.json`, `src/lib/admin-guard.js`, `dist/lib/admin-guard.js`, `src/tools/core/mcp-policy.js`, `dist/tools/core/mcp-policy.js`.
- Backup de todos os cinco arquivos: validado antes de promover.
- Comparação SHA-256 dos cinco arquivos no runtime com os arquivos preparados e testados: **5/5 MATCH**.
- Testes da política e do guard na worktree isolada: **46/46 PASS**.
- Serviço `centraldark-native-mcp-http.service`: **active/running**; PID observado **1664500**.
- `https://mcp.centralldark.com/health`: **HTTP 200**.
- Readback da ferramenta viva `mcp_policy_summary`: **known=20**, **approved=12**, **registeredReview=8**.
- Readback da reconciliação viva: **reconciliation.ok=true**, **destructiveCount=20**, **approvedInRuntimeCount=12**, **knownInRuntimeCount=20**, **unknownDestructive=[]**, **divergences=[]**.
- Contraprova: `centraldark_deploy_micro_fallback` permanece em quarentena específica como ferramenta em revisão — nunca foi executada neste deploy.

## Limites da evidência
O PASS prova a cobertura do catálogo e o funcionamento do MCP neste escopo. **Não** comprova autorização das oito ferramentas em revisão e **não** encerra o drift histórico entre os `src/index.js`/`dist/index.js` da main e do runtime. Esses arquivos não foram alterados nesta mudança.

## Continuidade
As oito ferramentas só migram para aprovação quando completarem os testes e reversões individuais documentados no manifesto. O runtime preserva adaptações locais não relacionadas. Não fazer `git reset`, `git pull` ou sobrescrita cega do checkout em uso.
