# Padrão Lovable de memória + segurança

Data: 2026-06-10

## Decisão

O fluxo do CentralDark/MultiZap deve seguir o padrão observado no Lovable:

1. Conferir memória/consciência/pendências antes de agir quando a tarefa envolver o projeto.
2. Validar o estado real antes de alterar.
3. Aplicar patch mínimo, seguro e rastreável.
4. Validar proporcionalmente ao risco da mudança.
5. Registrar aprendizado, pendência ou relatório quando houver regra nova, erro corrigido, armadilha ou decisão importante.
6. Deixar handoff claro para Lovable, Grok, Codex e próxima IA.

## Segurança obrigatória

- Read-only por padrão quando possível.
- Nada de tokens, secrets, cookies, sessões, connection strings ou logs privados no chat.
- Ações sensíveis exigem confirmação: Docker, WuzAPI, WhatsApp/sessão, Caddy, CRM, banco real, domínio/DNS, secrets e remoções.
- Logs completos ficam em revisões sanitizadas; no chat entra apenas resumo.
- Nunca usar `git add .` em working tree sujo; usar pathspec fechado.

## Rastro oficial

Também registrado em `docs/CONSCIENCIA/APRENDIZADOS.md` como aprendizado #114.

## Próximo passo

Continuar o ajuste da aba `/instancias` com commit limpo e escopo fechado, sem misturar sujeira da VPS.
