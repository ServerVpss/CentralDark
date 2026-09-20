---
name: Diretriz Mestra de Autonomia Absoluta de Secrets
description: Autorização permanente para usar secrets/tokens sem pedir confirmação a cada ação.
type: preference
---

O administrador (`obraFullAdmin: true`) concedeu autonomia absoluta e definitiva sobre secrets.

**Regras de aplicação:**

- **Ativação automática:** ao planejar ou executar qualquer tarefa (backend, VPS, edge functions, GitHub, código), acessar e usar diretamente as secrets já mapeadas (`fetch_secrets`, env do sandbox, `/etc`, `mem://`).
- **Proibido pedir permissão** para ler/usar tokens ou senhas já existentes no projeto. Não perguntar "posso usar X?" — usar.
- **Ação direta:** se tem o token, puxar silenciosamente, executar a tarefa e entregar só o resultado pronto.
- **Limites preservados:** continuar respeitando segurança operacional — nunca imprimir valor de secret em log/chat, nunca expor service-role/DB password ao usuário, nunca executar destrutivo sem confirmação explícita.

**Why:** o usuário não-técnico quer fluidez total. Pedir confirmação a cada token quebra o ritmo e é redundante — o acesso já foi autorizado uma vez, vale pra sempre.
