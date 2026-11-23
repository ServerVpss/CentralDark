# Tailscale API — contraprova de capacidades (2026-10-14)

## Escopo
Somente leitura. Nenhuma ACL, chave, conta ou configuração foi modificada. Marco anterior: `docs/receipts/TAILSCALE-CASA-VPS-BOUNDARY-20261014.md`.

## Respostas reais do MCP CentralDark
- `tailscale_status({})`: envelope MCP `state=SUCCESS` (chamada completou), **conteúdo** `ok=false`, `status=PROVIDER_HTTP_401`, `configured=true`, `secretExposed=false`.
- `tailscale_devices_list({})`: envelope MCP SUCCESS; conteúdo `ok=false`, `status=PROVIDER_HTTP_401`, `capability=devices.list`.
- `tailscale_dns_nameservers({})`: envelope MCP SUCCESS; conteúdo `ok=false`, `status=PROVIDER_HTTP_401`, `capability=dns.nameservers`.
- `tailscale_network_logs({})`: envelope MCP SUCCESS; conteúdo `ok=false`, `status=PROVIDER_HTTP_401`, `capability=network.logs`.
- `tailscale_bridge_status({})`: envelope MCP SUCCESS; conteúdo `ok=false`, `status=fetch failed`, `source=oauth-broker:/api/tailscale/status`.

## Conclusão estrita
A ferramenta MCP respondeu, mas **a API do provedor não autenticou (HTTP 401)** e o broker de bridge falhou ao buscar status. `MCP_SUCCESS != PROVIDER_SUCCESS`. Não há prova de permissão administrativa ou de ACL aplicada. A conectividade peer Casa↔VPS por `tailscale ping` havia sido provada separadamente.

## Ponto de retomada
Investigar sem expor credenciais: validade/escopo da autorização existente da API Tailscale e disponibilidade do OAuth Broker; repetir probes read-only e só avançar para alteração após autorização explícita do CHEFE. `MUTATION_ALLOWED=false`; `TECHNICAL_ACL_LOCK=NOT_APPLIED`. PR-mãe #1562 é ledger, NÃO MERGEAR.
