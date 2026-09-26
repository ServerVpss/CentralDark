# Pull Request — CentralDark / MultiZap

## Objetivo

Descreva o objetivo da mudança.

## Repositório alvo

- [ ] Confirmo que o alvo é `ServerVpss/CentralDark`.
- [ ] Não usei `segredounlock/clone-deck` sem confirmação explícita.

## Tipo de mudança

- [ ] Documentação
- [ ] Código
- [ ] Workflow / GitHub Actions
- [ ] Mega Painel
- [ ] MCP / Modo Obra / conector
- [ ] Bot / WhatsApp
- [ ] Outro

## Arquivos alterados

Liste os principais arquivos alterados.

## Validação

- [ ] Conferi arquivos existentes antes de criar novos.
- [ ] Rodei build/teste/lint quando aplicável.
- [ ] Não expus segredo real.
- [ ] Não li, abri, copiei, editei ou usei como contexto arquivos sensíveis.
- [ ] Não misturei git status sujo da VPS.
- [ ] Avaliei se o Mega Painel precisa de atualização.

## Arquivos sensíveis

Confirme se a mudança exigiu acessar algum item sensível:

- [ ] `.env`
- [ ] `secrets/`
- [ ] `tokens/`
- [ ] `sessions/`
- [ ] `.ssh/`
- [ ] `*.pem`
- [ ] `*.key`
- [ ] Nenhum dos itens acima

Se marcou algum item sensível, explique a confirmação explícita do usuário e como a validação foi feita sem expor valores.

## Ações sensíveis

Confirme se a mudança toca algum item sensível:

- [ ] Caddy
- [ ] Docker
- [ ] WuzAPI
- [ ] WhatsApp reset/logout/sessões
- [ ] CRM produção
- [ ] Banco real
- [ ] PM2 restart sensível
- [ ] Domínio público
- [ ] Segredo real
- [ ] Nenhum dos itens acima

Se marcou algum item sensível, explique a confirmação do usuário.

## Riscos / alertas

Liste riscos, dúvidas ou pontos que exigem revisão.

## Checklist de consciência operacional

- [ ] Considerei ChatGPT / MCP / Codex / Lovable quando aplicável.
- [ ] Considerei GitHub / Workflows quando aplicável.
- [ ] Considerei VPS / PM2 quando aplicável.
- [ ] Considerei Bot / WhatsApp quando aplicável.
- [ ] Considerei CRM apenas se aplicável e sem mexer em produção.
- [ ] Considerei Mega Painel quando a mudança representa avanço importante.

## Comentários de agentes/checks

- [ ] Verifiquei comentários de agentes no PR antes do merge.
- [ ] Tratei alertas P0/P1/P2 antes do merge ou expliquei por que não se aplicam.

## Resumo final

Explique em poucas linhas o que foi feito e o que não foi mexido.
