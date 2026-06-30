---
title: "11 MULTI IA FLUXO"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

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

## Limitação confirmada: Gemini (e IAs sem terminal) não escrevem direto na memória

**Investigado em 30/06/2026** — antes de qualquer IA prometer "conectar o Gemini direto" ao Cérebro Vivo, checar se isso mudou:

- Gemini Gems (app consumidor, gemini.google.com) **não suporta Actions/tool-calling externo** hoje, diferente do ChatGPT (Custom GPT Actions, ver [[CUSTOM-GPT-SETUP]]).
- Gemini Enterprise tem "Custom Connectors", mas é arquitetura de ingestão pra busca (fetch→transform→index), não escrita em tempo real — e é produto pago separado.
- A API Gemini crua suporta function calling, mas só funciona se alguém rodar um cliente/script que recebe a chamada e executa contra o MCP — reintroduz "terminal" pela porta de trás, o que anula o ganho.
- `/mcp-public` (endpoint sem auth) foi **removido** em 30/06/2026 por motivo de segurança (expunha `vps_write_file_safe` sem Bearer) — não é mais opção de "atalho" pra IA externa de qualquer forma.

**Fluxo pragmático adotado:** quando o Pivete conversa com Gemini (ou outra IA sem terminal) sobre algo que deve virar memória permanente, ele pede pra essa IA gerar o texto já formatado e cola numa mensagem pra uma IA com MCP/terminal (Claude Code, ChatGPT com Custom GPT), que grava via `registrar_aprendizado` / `adicionar_pendencia` / `atualizar_consciencia`. Reduz fricção (copia uma mensagem, não roda script) sem inventar integração que a plataforma não suporta.

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

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
