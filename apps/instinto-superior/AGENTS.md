<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Decisões estruturais

- O bloco Sistema (Mega Painel, Hub Segurança, Cofre e Status) pertence ao Cockpit CentralDark administrativo; o TelePainel mantém apenas funções próprias, evitando dois centros de comando.
- Cockpit appearance variants are scoped to CockpitShell semantic tokens and persisted locally through its DesignCenter control; keep default tokens and the shared Hermes engine unchanged to prevent visual regressions.
- HUD capabilities are projections of the existing cockpit.functions, SyncCenter, SistemaCentralDark and Ledger owners; never create a parallel HUD or infer runtime health from historical proofs.

## MCP_NOC_TO_COCKPIT_PARITY · decisão do CHEFE (2026-10-10)

- **MCP = protocolo/API, catálogo de ferramentas, OAuth e autenticação de clientes externos.** `/mcp`, `/admin/mcp` e os endpoints de leitura/ação existentes continuam como owners; não criar outro MCP nem transportar segredos para o navegador.
- **Instinto Superior = interface visual administrativa única**: `PainelAdminCentralDark.tsx` recebe as capacidades de `apps/modulos/mcp/src/admin.js`; `SistemaCentralDark.tsx` recebe o Mega Painel original `apps/modulos/status` pela API `/status/overview`.
- O **operador e o agente usam as mesmas fontes da API**, com autorização de escopo para comandos. Não simular execução com clique, loading ou HTTP 200.
- `McpOperacoesCentralDark.tsx` e `MegaPainelLegadoCentralDark.tsx` são **absorção incremental do mesmo Cockpit**, não outro NOC: leituras públicas com proveniência, frescor e setor, sem elevar `STALE` a PASS.
- **Hakai da casca antiga**: só substituir a HTML do antigo `mcp.centralldark.com/admin` por login/entrada de cliente quando cada aba, botão, ação autenticada, log, grafo, SSE e retorno de erro estiverem testados no Instinto, com rollback/readback. Remover a UI **não** remove os endpoints nem o dispatcher original.
- Owner da migração: PR #1793. Se alguma etapa falhar: registrar `RECOVERY_REQUIRED` com causa e `NEXT_CURSOR`, preservar tela antiga até fechar contraprova, sem bloquear o resto da operação.
