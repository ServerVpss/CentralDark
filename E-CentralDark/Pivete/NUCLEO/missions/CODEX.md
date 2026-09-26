# MISSAO - CODEX.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CODEX.md
**SHA:** 200f68d9a4468f6d
**Timestamp:** 2026-08-26T19:30:40.240252
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- Risco: <risco>

### Ouro Bruto (primeiros 5000 chars)
```
# CODEX.md — Guia operacional do Codex

Este documento define como o Codex deve trabalhar no CentralDark / MultiZap.

## Alvo obrigatório

Repositório principal:

```txt
ServerVpss/CentralDark
```

Não trabalhar no espelho `segredounlock/clone-deck` sem confirmação explícita.

## Papel do Codex

O Codex é responsável por editar, revisar e testar código, mas não deve agir no escuro.

Ele deve trabalhar em conjunto com:

- ChatGPT, que coordena e valida contexto;
- MCP CentralDark, que executa e consulta fontes vivas;
- Lovable, quando houver visual/frontend;
- GitHub e workflows, que registram e validam;
- VPS/PM2, quando produção precisar ser observada;
- Mega Painel, que mostra progresso e alertas.

## Bloqueio explícito de arquivos sensíveis

O Codex não deve ler, abrir, copiar, imprimir, editar, resumir, converter, enviar ao chat ou usar como contexto arquivos sensíveis.

Padrões bloqueados:

```txt
.env
secrets/
tokens/
sessions/
.ssh/
*.pem
*.key
```

Essa regra vale mesmo quando o pedido for diagnóstico de ambiente, SSH, token, OAuth, WhatsApp, sessão, banco ou credencial.

Nesses casos, o Codex deve usar apenas validação sanitizada, por exemplo:

- variável presente: sim/não;
- arquivo esperado existe: sim/não;
- processo recebeu variável: sim/não;
- health público OK/erro;
- logs redigidos sem valor privado.

Nunca deve copiar ou mostrar valor real.

## Fluxo padrão

1. Ler `AGENTS.md`.
2. Ler este `CODEX.md`.
3. Confirmar escopo e repositório alvo.
4. Conferir arquivos existentes antes de criar novos.
5. Fazer patch mínimo.
6. Não mexer em segredo real.
7. Não ler nem editar arquivos sensíveis.
8. Rodar build/teste/lint quando aplicável.
9. Explicar diff e risco no PR.
10. Atualizar documentação ou Mega Painel quando houver avanço relevante.
11. Parar e pedir validação se houver dúvida real.

## Checklist antes de alterar código

- O alvo é `ServerVpss/CentralDark`?
- A mudança é segura e pequena?
- Existe arquivo equivalente já criado?
- Há risco para Caddy, Docker, WuzAPI, WhatsApp, CRM, banco ou domínio?
- Há segredo, `.env`, token, cookie, sessão ou chave envolvida?
- A tarefa exigiria ler arquivo sensível? Se sim, parar e pedir confirmação.
- A mudança exige build/teste?
- O Mega Painel precisa refletir o avanço?

## Ações proibidas sem confirmação

- Apagar arquivos de produção.
- Resetar WhatsApp.
- Fazer logout de sessão WhatsApp.
- Reiniciar WuzAPI/Docker/Caddy.
- Alterar banco real.
- Mover CRM.
- Trocar domínio público.
- Expor ou editar segredo real.
- Ler, abrir, copiar ou resumir arquivo sensível.
- Fazer limpeza geral de git status sujo.

## Autoajuste consciente

Se encontrar erro, omissão, contradição, risco ou dúvida:

```txt
Mestre, Segredo, estamos com um possível problema no setor <setor>.
Problema: <problema>
Risco: <risco>
Sugestão: <sugestão>
Confirma se seguimos?
```

Não seguir tentando parecer certo quando houver incerteza.

## Git status sujo da VPS

Se a VPS estiver com muitos arquivos `D`, `M` ou `??`, o Codex não deve usar isso como base para commit geral.

A etapa correta é separada:

```txt
auditar-git-status-vps-sem-apagar
```

## Saída esperada no PR

Todo PR do Codex deve explicar:

- objetivo;
- arquivos alterados;
- o que foi validado;
- o que não foi mexido;
- riscos/alertas;
- se precisa de atualização no Mega Painel;
- se há ação sensível pendente.

## Fechamento seguro de issues

Issues concluídas devem ser fechadas por ferramenta controlada, preferencialmente `github_close_issue` no MCP.

A ferramenta deve:

- receber número da issue;
- validar que o repo alvo é `ServerVpss/CentralDark`;
- validar que a issue existe;
- bloquear fechamento de Pull Request por engano;
- aceitar comentário final opcional;
- bloquear comentário com aparência de segredo real;
- fechar a issue;
- registrar ação sanitizada.

Workflows automáticos de auto-close só devem ser criados depois que as regras estiverem bem definidas, para evitar fechar tarefa errada.

## Codex como agente principal em PRs

O Codex deve ser o agente principal de revisão, sugestão e correção em Pull Requests.

Checklists e workflows de governança são apenas apoio. Eles não substituem a análise do Codex.

Antes de mergear um PR, verificar se houve comentário/review do agente. Se não houve, registrar validação alternativa e risco restante.

Detalhe operacional: `docs/CONSCIENCIA/CODEX-REVISAO-PRS.md`.

```