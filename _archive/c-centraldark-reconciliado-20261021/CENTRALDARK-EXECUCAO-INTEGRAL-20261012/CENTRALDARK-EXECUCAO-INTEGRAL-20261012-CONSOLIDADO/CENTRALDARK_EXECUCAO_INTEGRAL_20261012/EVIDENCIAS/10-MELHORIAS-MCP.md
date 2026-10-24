# 🔌 Aprendizado integral MCP + Rebuilder (dez melhorias)

**Escopo:** classificação e melhoria autorizada. Não alterar, desligar nem burlar proteções externas da OpenAI.

| Nº | Comportamento / contrato | Implantação observável |
|---|---|---|
| 1 | PREFLIGHT do tool/owner/scope/path/schema | Diagnóstico parcial no dispatcher da `main` |
| 2 | Classificar erro (policy, auth, schema, runtime, cliente) | `MCP_BLOCK_RECONCILIATION` na `main` |
| 3 | Não repetir erro sem nova evidência | `repeatBlockedCallWithoutNewEvidence=false` na `main` |
| 4 | Próxima rota do catálogo, **somente se autorizada** | `alternateAuthorizedRouteBeforeHumanBlocker` já previsto |
| 5 | Delta localizado (reutilizar código existente) | Estabelecido como regra; comprovar caso a caso |
| 6 | Confirmações literais em camadas sem reuso implícito | `ADMIN_CONFIRMATIONS` e `MCP_POLICY_SUMMARY` medidos |
| 7 | Backup e rewind antes de troca da VPS | Backup original e restauração por hash comprovados |
| 8 | Teste e contraprova antes de HAKAI | Scanner/teste PASS; pulse LIVE ainda UNKNOWN |
| 9 | Log + recibo com timestamp/SHA/decisão/evidência | JSON canônico e auditoria hash-chain existente, sem fingir unified multi-owner |
| 10 | Aprender e reaplicar, sem criar novo núcleo | Aprendizado #171 comprovado na main |

**Fronteiras atuais:** commit da melhoria MCP verificado na `main`, mas NÃO há prova de implantação do novo código no runtime. O microdeploy **bloqueou** `apps/modulos/mcp/src/tools/core/mcp-admin.js` com `MCP_NATIVE_FILESET_NOT_APPROVED`. Não alterar o gate às cegas: medir runtime, escopo real e dependências antes de promover. “Rebuilder” **não foi localizado** na busca limitada a `apps/modulos/mcp` e `scripts` — não afirmar que está ausente em todo o ecossistema.

**Trava semântica:** a quantidade “10 bloqueios” foi declarada na conversa; não existe no recibo uma série de dez eventos externos independentes com IDs/SHA. Não afirmar causalidade individual sem logs.
