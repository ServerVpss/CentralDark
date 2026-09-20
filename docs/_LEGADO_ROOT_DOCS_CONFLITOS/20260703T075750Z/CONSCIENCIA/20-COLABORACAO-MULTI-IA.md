# 20 — Colaboração Multi-IA: ChatGPT + Grok + CentralDark

## Objetivo

Permitir que o usuário dê uma instrução uma vez e que ChatGPT, Grok e CentralDark trabalhem em conjunto com método verificável.

Fluxo alvo:

```txt
Usuário
→ ChatGPT planeja, classifica risco e decide próximo passo
→ CentralDark/MCP expõe tools, permissões, fila e logs sanitizados
→ Grok executa/le/valida no VS Code/VPS quando conectado
→ CentralDark devolve relatório sanitizado
→ ChatGPT revisa e só pede confirmação em ação sensível
```

## Papéis

| Agente | Papel |
|---|---|
| ChatGPT | Coordenador, revisor, classificador de risco, guardião das regras |
| CentralDark/MCP | Ponte operacional, tools, permissões, logs sanitizados, memória viva |
| Grok | Executor local/VS Code/VPS quando conectado |
| Usuário | Confirma ações sensíveis e decide prioridade final |

## Operação segura sem perguntar

Pode seguir automaticamente quando for apenas:

- leitura de arquivos do repo;
- leitura de consciência, pendências e aprendizados;
- status de deploy;
- status PM2;
- leitura de logs sanitizados;
- verificação de portas, disco, memória e uptime;
- diagnóstico HTTP;
- criação de documentação;
- criação de plano;
- criação de relatório;
- atualização de pendência/documentação;
- git/github em repos permitidos;
- preparação de patch não destrutivo;
- reinício somente dos serviços operacionais seguros definidos no MCP.

## Serviços operacionais seguros

Lista base para restart controlado via MCP:

```txt
MCP-CentralDark
CloneDeck-Supabase-Sync
MultiZap-TelegramBot
Install-Callback
MultiZap-GitHub-Webhook
github-webhook
webhook-bot
```

Observação: a lista efetiva depende também da hard allowlist do código e do ambiente da VPS.

## Serviços sensíveis

Estes podem ter leitura/diagnóstico ampliados, mas reinício ou alteração exige confirmação explícita do usuário no chat:

```txt
CloneDeck-CRM
MultiZap-Gateway
wabot-bridge
whatsapp-server
WuzAPI
WhatsApp/session
Caddy
DNS/domínio público
Docker
banco real
secrets/credenciais/tokens
```

## Regra para ações sensíveis

Antes de executar qualquer ação sensível, a IA deve parar e pedir confirmação objetiva, por exemplo:

```txt
Vou reiniciar MultiZap-Gateway, que é sensível e pode afetar produção. Confirma?
```

Sem confirmação explícita, só pode diagnosticar, planejar e preparar.

## Logs e relatórios

- Nunca despejar parede de logs no chat.
- Logs completos ficam em `revisoes/YYYYMMDD-HHMMSS/<nome-da-tarefa>/`.
- Chat mostra apenas resumo sanitizado.
- Nunca expor token, senha, cookie, session, connection string, chave privada ou segredo.

## Estado desejado

- ChatGPT conectado ao CentralDark via MCP.
- Grok conectado ao mesmo contexto quando disponível.
- CentralDark como cérebro compartilhado: consciência, pendências, aprendizados, fila e relatórios.
- Ações seguras rodam sem interromper.
- Ações sensíveis pedem confirmação.
