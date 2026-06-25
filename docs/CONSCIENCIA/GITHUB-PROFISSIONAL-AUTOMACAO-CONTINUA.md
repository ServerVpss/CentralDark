# GitHub profissional e automação contínua

## Diretriz ativa

O projeto CentralDark / MultiZap deve evoluir usando recursos profissionais do GitHub com segurança, rastreabilidade e método verificável.

O repositório deve ganhar automações, checks, templates, issues, PRs, validações e documentação viva conforme o sistema é usado.

## Regra central

Sempre que o projeto avançar, avaliar se também precisa atualizar:

- `AGENTS.md`;
- `CODEX.md`;
- prompts do Codex;
- templates de PR/issue;
- workflows do GitHub Actions;
- docs de consciência;
- docs de pendências;
- Mega Painel;
- issues e labels;
- automações seguras.

## GitHub como centro profissional

Usar recursos do GitHub quando aplicável:

- issues para pendências rastreáveis;
- pull requests para mudanças revisáveis;
- templates de issue e PR;
- labels e milestones;
- GitHub Actions;
- checks obrigatórios quando aplicável;
- environments quando houver deploy seguro;
- variables e secrets apenas por nome, nunca valor;
- releases e tags quando houver versão estável;
- webhooks quando houver integração segura;
- status/deployments quando fizer sentido;
- CODEOWNERS, rulesets e branch protection quando a estrutura estiver pronta.

## Automação viva

O sistema deve aprender com o uso:

1. detectar falha, omissão ou oportunidade;
2. parar e corrigir rota;
3. registrar aprendizado no repo oficial;
4. atualizar Codex, AGENTS ou workflows se a regra precisar virar automação;
5. atualizar o Mega Painel quando o avanço for relevante;
6. validar com workflow, build ou check real;
7. não repetir a falha.

## Limite de segurança

Automação não significa agir sem controle.

Continuam exigindo confirmação explícita:

- Docker;
- Caddy;
- WuzAPI;
- WhatsApp reset/logout/sessões;
- CRM produção;
- banco real;
- segredos reais;
- arquivos sensíveis;
- limpeza destrutiva;
- alteração de domínio público;
- restart sensível.

## Espelho

O repo oficial é:

```txt
ServerVpss/CentralDark
```

O repo abaixo é espelho passivo:

```txt
segredounlock/clone-deck
```

Não gravar aprendizado, pendência, workflow ou automação operacional no espelho sem confirmação explícita.

## Próxima meta

Depois de aplicar a correção do MCP em produção, avançar para uma matriz profissional de governança GitHub:

- inventário de workflows;
- branch protection/rulesets sugeridos;
- issue templates;
- labels padrão;
- milestones;
- auditoria do espelho;
- automação segura de atualização do Mega Painel;
- validação bot/QR/chat ao vivo.
