# 11 — Fluxo Multi-IA CentralDark

## Princípio

Nenhuma IA deve trabalhar sozinha ou fora do estado vivo do projeto. O Mega Painel, README, consciência, pendências, relatórios e handoffs precisam contar a mesma história.

## Papéis

| Agente | Uso correto |
|---|---|
| ChatGPT + MCP | Comando central, validação, memória, scripts, ZIPs e decisão final antes de ação sensível |
| Lovable | Interface, experiência visual, documentação pública e evolução rápida de telas |
| Grok | Auditor de VPS/logs/causa-raiz; segunda opinião antes de correção arriscada |
| Codex | Revisão de código, PRs, testes, validadores offline e guardrails |
| Copilot | Apoio no editor; não decide produção sozinho |
| GitHub | Fonte versionada de verdade, workflows, PRs, issues e histórico |
| Mega Painel | Atalho visual para o estado vivo, cards, porcentagens, pendências e próximos passos |

## Regra de atualização

Toda tarefa relevante deve atualizar, quando aplicável:

1. README.md da raiz.
2. docs/CONSCIENCIA.
3. docs/PENDENCIAS.md.
4. docs/RELATORIOS.
5. Mega Painel / status.centralldark.com.
6. Handoff para próxima IA.

## Modo Lovable / Modo Segredo

Fluxo padrão:

```txt
RELOAD MEMORIA
→ verificar GitHub/VPS
→ ler arquivos reais
→ planejar lote
→ editar em camadas
→ criar validador
→ rodar validação
→ atualizar docs/painel
→ commit único quando seguro
→ validar deploy
→ resumo + próxima IA
```

## Ações sensíveis

Exigem confirmação explícita:

- Docker/WuzAPI.
- WhatsApp reset/logout/sessão.
- Caddy/DNS/SSL/domínio.
- CRM.
- banco real/SQL.
- secrets.
- PM2 sensível.
- apagar, mover ou resetar arquivos.
