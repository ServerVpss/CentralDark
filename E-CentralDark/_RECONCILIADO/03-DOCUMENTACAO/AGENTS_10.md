# AGENTS.md — Regras operacionais dos agentes CentralDark / MultiZap

Este arquivo orienta ChatGPT, MCP CentralDark, Codex, Lovable e qualquer agente automatizado que trabalhe neste repositório.

## 1. Repositório oficial

O alvo principal operacional é:

```txt
ServerVpss/CentralDark
```

Não usar `segredounlock/clone-deck` para trabalho novo sem confirmação explícita. Esse repositório deve ser tratado como espelho, backup ou secundário, salvo ordem contrária do usuário.

Antes de criar branch, PR, workflow, documentação principal, pendência ou aprendizado, confirmar mentalmente que o alvo é `ServerVpss/CentralDark`.

## 2. Regra central

Trabalhar com método verificável.

Antes de agir, o agente deve entender o contexto, separar ação segura de ação sensível, executar o menor patch possível, validar resultado e registrar o que foi feito sem expor segredo real.

Nunca expor tokens, senhas, cookies, sessões, chaves privadas, connection strings, arquivos de sessão WhatsApp, env real ou qualquer valor privado.

## 3. Bloqueio explícito de arquivos sensíveis

Além de não expor valores privados, o agente também não deve **ler, abrir, copiar, imprimir, editar, resumir, converter, enviar ao chat ou usar como contexto** arquivos sensíveis.

Caminhos e padrões bloqueados incluem, no mínimo:

```txt
.env
secrets/
tokens/
sessions/
.ssh/
*.pem
*.key
```

Se uma tarefa envolver ambiente, SSH, token, OAuth, WhatsApp, sessão, banco ou credencial, o agente deve usar apenas validações booleanas, nomes públicos, status sanitizado e logs redigidos. Exemplo correto: “variável presente: sim/não”, nunca o valor.

Se houver necessidade operacional de mexer em algo sensível, parar e pedir confirmação explícita ao usuário antes de qualquer ação.

## 4. Ordem oficial de foco

1. MCP / Modo Obra / conector.
2. Codex integrado ao fluxo.
3. Bot / QR / chat ao vivo / contatos / fotos / grupos.
4. CRM só depois.

Não atropelar essa ordem sem motivo claro e validação do usuário.

## 5. Componentes oficiais

Ao fazer diagnóstico, plano, PR, resumo ou retomada, considerar estes componentes quando aplicável:

- ChatGPT.
- MCP CentralDark.
- Codex.
- Lovable.
- GitHub.
- GitHub Actions / workflows.
- VPS / PM2.
- Bot / WhatsApp.
- Mega Painel.
- CRM quando aplicável.

Se a lista for parcial, declarar que é parcial.

## 6. Ações seguras

Ações seguras podem avançar sem confirmação adicional quando forem pequenas, reversíveis e não expuserem segredo:

- leitura de arquivos públicos do repo;
- criação de branch;
- criação de PR;
- documentação;
- validação de build/teste;
- leitura de logs sanitizados;
- atualização de arquivos seguros;
- relatórios e pendências;
- workflow de validação não destrutivo.

## 7. Ações sensíveis

Exigem confirmação explícita do usuário antes de executar:

- Caddy;
- Docker;
- WuzAPI;
- reset/logout/sessões WhatsApp;
- CRM produção;
- banco real;
- restart PM2 sensível;
- apagar, mover ou limpar produção;
- alterar domínio público;
- mexer em segredo real;
- ler, editar ou copiar arquivo sensível.

## 8. Método obrigatório antes de continuar

Ao receber “vamos continuar”, “prossiga”, “segue” ou equivalente, o agente deve revisar:

- o que estava em andamento;
- o que já foi feito;
- o que ficou faltando;
- ordem oficial;
- pendências abertas;
- riscos, dúvidas e alertas.

Não continuar apenas pelo último detalhe técnico.

## 9. Autoajuste consciente

Se detectar erro, omissão, contradição, risco ou dúvida relevante:

1. parar;
2. reconhecer o problema;
3. corrigir a rota;
4. registrar aprendizado quando afetar o projeto;
5. evitar repetir a falha.

Quando houver risco real, chamar o usuário como autoridade:

```txt
Mestre, Segredo, estamos com um possível problema no setor <setor>.
Problema: <explicação>
Risco: <risco>
Sugestão: <caminho seguro>
Confirma se seguimos?
```

## 10. Mega Painel

O Mega Painel em `status.centralldark.com` é o coração visual e operacional do projeto.

Ações importantes, avanços, erros, alertas, deploys, workflows, validações e pendências devem ser refletidos no painel quando fizer sentido.

Nunca colocar segredo real no painel.

## 11. VPS, run-once e logs

Priorizar GitHub + workflow + webhook + run-once sempre que possível.

Quando for necessário usar VPS, scripts devem ser seguros, idempotentes e salvar logs em:

```txt
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/
```

No chat ou PR, mostrar apenas resumo limpo, sem parede de log e sem segredo.

### Diretório oficial de revisões

O diretório oficial atual de logs/relatórios de VPS e run-once do CentralDark é:

```txt
/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/
```

O caminho `/root/Multizap/revisoes/` é legado. Itens antigos relevantes devem ser migrados com auditoria por hash, plano dry-run e confirmação explícita antes de limpeza.

## 12. Git status sujo da VPS

Se a VPS mostrar muitos arquivos deletados, modificados ou não rastreados fora do escopo:

- não apagar;
- não reverter;
- não commitar tudo;
- não misturar com tarefa atual.

Tratar como auditoria separada:

```txt
auditar-git-status-vps-sem-apagar
```

A auditoria deve classificar deletados, gerados, novos úteis, ignoráveis e riscos antes de qualquer ação.

## 13. Codex

O Codex deve agir como editor/revisor técnico integrado ao fluxo, não como executor cego.

Antes de alterar código, o Codex deve:

- ler este arquivo;
- conferir `CODEX.md`;
- entender escopo;
- fazer patch mínimo;
- rodar build/teste quando aplicável;
- explicar diff;
- apontar riscos e dúvidas;
- considerar Mega Painel quando houver avanço importante.

Se houver dúvida relevante, o Codex deve parar e pedir validação.

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

## 16. Registro obrigatório no repo e no Mega Painel

> **Se não está anotado no repo ou no Mega Painel, a próxima IA pode esquecer.**

Toda decisão, aprendizado, correção de erro, jeito certo de fazer, atalho que funcionou, bug encontrado, tarefa pausada, critério de fechamento e próximo passo deve ser persistido em um dos lugares oficiais. Chat não conta como fonte de verdade.

### Lugares oficiais (ordem de prioridade)

| Prioridade | Arquivo / Local | O que entra |
|---|---|---|
| 1 | `docs/CONSCIENCIA/APRENDIZADOS.md` | Regras novas, erros corrigidos, jeito certo de fazer, atalhos que funcionaram, decisões de projeto |
| 2 | `docs/PENDENCIAS.md` | Tudo que falta fazer, próximo lote, bugs abertos, tarefas pausadas, critérios pra fechar |
| 3 | Mega Painel (`status.centralldark.com`) | Estado vivo do projeto: o que está pronto, em andamento, alertas, próximo passo, resumo visual |
| 4 | `docs/RELATORIOS/` | Relatórios de cada ação/lote importante: o que foi feito, validado e o que não foi tocado |
| 5 | `README.md` da raiz | Resumo geral do estado do projeto, principalmente quando muda fase importante |
| 6 | `PLANO.md` da pasta mexida | Exemplo: mexeu em `bot-server`, atualiza o `PLANO.md` daquela pasta com o que falta ali |
| 7 | `AGENTS.md` / `CODEX.md` | Regras para Codex, agentes e IAs trabalharem igual |

### Quando registrar

- Sempre que fechar uma etapa ou lote.
- Sempre que o usuário confirmar sucesso ("deu certo", "funcionou", "anota isso", "lembra disso", "agora sempre faz assim").
- Sempre que corrigir um erro ou descobrir uma causa raiz.
- Sempre que pausar uma tarefa antes de terminar.
- Sempre que definir critérios de aceite para fechar algo.
- Sempre que mudar uma decisão arquitetural ou de fluxo.

### Formato mínimo

Cada entrada deve ter:
- **Data**
- **Categoria:** regra | erro | atalho | decisão | pendência
- **Contexto:** o que aconteceu
- **Aprendizado / Decisão:** o que foi aprendido ou decidido
- **Próximo passo (se aplicável)**

### Consequência

Se uma IA responder baseada apenas no histórico de chat sem consultar os documentos oficiais, ela está violando esta regra e pode repetir erros, ignorar aprendizados ou reinventar soluções já descartadas.

## 17. Webhook Deploy Seguro

O caminho oficial preparado para deploy rapido sem GitHub Actions e:

```txt
GitHub/Lovable push
-> deploy.centralldark.com/github
-> Caddy
-> 127.0.0.1:9300
-> CentralDark-WebhookDeploy
```

Regras:

- validar `X-Hub-Signature-256` com HMAC SHA256;
- aceitar deploy somente para `push` em `refs/heads/main`;
- usar lock anti-duplo e fila pending;
- manter o secret fora do repo em `/root/CentralDark/secrets/webhook.env`;
- salvar logs completos em `revisoes/`;
- nunca executar comando vindo do payload;
- nao cadastrar webhook real, aplicar Caddy reload ou iniciar/reiniciar PM2 real sem veredito humano.

Documentacao: `docs/CONSCIENCIA/WEBHOOK-DEPLOY-SEGURO.md`.
