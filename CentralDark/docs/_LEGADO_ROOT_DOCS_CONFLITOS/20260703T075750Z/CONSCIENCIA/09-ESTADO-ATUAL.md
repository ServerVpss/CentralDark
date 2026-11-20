# 09 — Estado atual do CentralDark

Atualizado em: 2026-06-09T17:03:28-03:00

## Resumo

O projeto CentralDark / MultiZap opera com múltiplas IAs e ferramentas, usando GitHub como fonte versionada, VPS como produção, MCP como ponte operacional e Mega Painel como atalho visual de acompanhamento.

## Estado operacional curto

| Item | Estado |
|---|---|
| Repo oficial | ServerVpss/CentralDark |
| Git root real na VPS | /root |
| Projeto operacional | /root/CentralDark |
| Diretório oficial de revisões | /root/CentralDark/revisoes |
| API pública | https://api.centralldark.com |
| Status público | https://status.centralldark.com |
| MCP público | https://mcp.centralldark.com |
| HEAD auditado na VPS | b1e6fd1fa4c1 |
| origin/main auditado | 5e7099eafe02 |
| Working tree VPS | 63 entradas pendentes |
| webhook-bot PM2 | ausente |

## Sistema multi-IA

| Agente | Papel |
|---|---|
| ChatGPT + MCP | Orquestração final, memória, validação e segurança |
| Lovable | UI, frontend, docs visuais e edição rápida de produto |
| Grok | Auditor VPS, causa-raiz e segunda opinião técnica |
| Codex | Revisão de código, PRs seguros, validações e arquitetura |
| Copilot | Apoio de código em editor, sugestões e produtividade |
| GitHub Actions | Workflows, validação, bots e automação versionada |
| VPS + PM2 | Execução real dos serviços |

## Próximas frentes

1. Manter Mega Painel atualizado a cada passo relevante.
2. Finalizar auditoria do working tree sujo da VPS.
3. Resolver webhook-bot com decisão documentada.
4. Integrar frontend/chat ao vivo consumindo rotas read-only.
5. Só discutir envio de mensagem depois de confirmação explícita.
