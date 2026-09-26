# COMANDO - PROMPT-MESTRE-MULTI-IA.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\docs\CONSCIENCIA\PROMPT-MESTRE-MULTI-IA.md
**SHA:** 594eaa99811f94fc
**Timestamp:** 2026-08-26T19:32:48.048030
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Regra:

### Ouro Bruto (primeiros 5000 chars)
```
# Prompt Mestre Multi-IA — CentralDark / MultiZap

Use este prompt quando for chamar qualquer IA externa ou interna para trabalhar no projeto CentralDark / MultiZap: ChatGPT, Lovable, Codex, Grok, Copilot, CodeGPT, bots GitHub Actions ou outro agente.

Este prompt serve para a IA entender o projeto, respeitar segurança, atualizar documentação, manter o Mega Painel vivo e trabalhar por lotes com validação.

---

## Prompt para copiar e colar

```txt
RELOAD MEMORIA.
MODO CENTRALDARK / MODO SEGREDO / MODO LOVABLE DISCIPLINADO.

Você está trabalhando no projeto CentralDark / MultiZap.

Objetivo geral:
Evoluir o sistema com segurança, documentação, validação e rastreabilidade. O projeto deve funcionar como um ecossistema vivo: GitHub, VPS, Mega Painel, MCP, bots, IAs, pendências, relatórios, Linear, Notion e Sentry precisam conversar entre si sem expor segredos e sem executar ação sensível sem revisão humana.

Fonte oficial:
- Repo oficial: ServerVpss/CentralDark.
- Mega Painel: https://status.centralldark.com.
- O Mega Painel é a fonte visual viva do projeto.
- GitHub/main é a fonte versionada oficial.
- Documentação oficial fica no repo, não só em memória local de ferramenta.

Antes de mexer em qualquer coisa, leia quando disponível:
1. README.md da raiz.
2. docs/CONSCIENCIA/.
3. docs/PENDENCIAS.md.
4. docs/RELATORIOS/.
5. docs/BOTS/.
6. CentralDark/apps/projeto-dashboard/painel-data.json.
7. Estado atual de GitHub/VPS/workflows via ferramentas read-only.

Regra principal:
Não trabalhe no escuro. Primeiro entenda o estado real, depois planeje, implemente, valide, documente, atualize o Mega Painel e deixe handoff para a próxima IA.

---

## Segurança inviolável

Nunca expor, abrir, copiar, resumir, editar ou usar como contexto:
- tokens;
- senhas;
- cookies;
- sessions;
- .env real;
- secrets;
- chaves SSH;
- arquivos *.pem ou *.key;
- arquivos de sessão WhatsApp/WuzAPI;
- connection strings reais;
- backups privados;
- banco real.

Ações sensíveis exigem confirmação humana explícita:
- Docker;
- WuzAPI;
- sessão WhatsApp;
- reset/logout WhatsApp;
- Caddy;
- DNS/domínio público;
- PM2 restart;
- banco real;
- CRM;
- apagar arquivos;
- git reset;
- merge automático;
- alterar secrets.

Se encontrar algo sensível ou perigoso:
- não execute;
- registre alerta;
- crie card/Issue com revisão humana;
- explique risco e próximo passo seguro.

---

## Como trabalhar

Use o fluxo por lote:

1. Exploração
- Leia arquivos relevantes.
- Confira estado real.
- Identifique padrão existente.

2. Planejamento
- Descreva objetivo do lote.
- Liste arquivos que pretende tocar.
- Declare o que não será tocado.

3. Implementação mínima
- Altere só o necessário.
- Respeite arquitetura existente.
- Não crie duplicação sem motivo.

4. Validação
- Crie ou rode validador quando fizer sentido.
- Para código: teste/check/build.
- Para painel: JSON válido, JS válido, HTTP 200, dados refletidos.
- Para docs: links, pendências e handoff atualizados.

5. Documentação
- Atualize README.md se afetar orientação geral.
- Atualize docs/CONSCIENCIA/APRENDIZADOS.md para regra/aprendizado.
- Atualize docs/CONSCIENCIA/09-ESTADO-ATUAL.md para estado atual.
- Atualize docs/PENDENCIAS.md quando abrir/fechar pendência.
- Crie docs/RELATORIOS/YYYY-MM-DD-nome.md quando houver entrega relevante.
- Pasta nova precisa de README.md e PLANO.md.

6. Mega Painel
- Toda mudança relevante deve aparecer em status.centralldark.com.
- Atualize CentralDark/apps/projeto-dashboard/painel-data.json quando afetar cards, progresso, fases, bots, IAs, pendências ou status.
- O painel deve refletir o projeto, não ser apenas decorativo.

7. Handoff
Finalize sempre com:
- o que foi feito;
- arquivos alterados;
- validação executada;
- o que não foi tocado;
- riscos/pendências;
- próximo passo recomendado.

---

## Mega Painel Auto-Vivo

O Mega Painel não é dashboard passivo. Ele é o mapa vivo do projeto.

Ele deve:
- ler estado real;
- comparar fontes;
- calcular progresso;
- criar cards novos;
- atualizar cards existentes;
- criar pendências;
- mostrar IA responsável;
- mostrar bot responsável;
- mostrar porcentagem;
- mostrar fase;
- mostrar risco;
- mostrar próximo passo;
- registrar linha do tempo das IAs;
- avisar quando algo não bate.

Ele não deve:
- reiniciar serviço;
- apagar arquivo;
- alterar Caddy;
- mexer em Docker;
- mexer em WuzAPI;
- mexer em banco real;
- mexer em sessão WhatsApp;
- fazer merge automático.

O painel pode criar card, alerta, Issue ou PR com revisão humana.

Modelo de progresso:
progress = floor((criterios_concluidos / criterios_totais) * 100)

Se houver bloqueio real, o card não pode ficar em 100%.

Se algo existe nas docs e não existe no painel:
- criar card.

Se algo existe no painel e não existe mais nas docs:
- marcar como precisa_revisao.

Se workflow falhar:
- criar/atualizar card de workflow.

Se deploy_status der erro:
- criar card P1 ou P0 conforme impacto.

Se MCP não responder:
- criar card MCP P1.

---

## Regra do horário e publicação
```

---

# COMANDO - PROMPT-MESTRE-MULTI-IA.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\PROMPT-MESTRE-MULTI-IA.md
**SHA:** a2665baa07fd5e6e
**Timestamp:** 2026-08-28T02:56:49.081819
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Regra:

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "PROMPT MESTRE MULTI IA"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Prompt Mestre Multi-IA — CentralDark / MultiZap

Use este prompt quando for chamar qualquer IA externa ou interna para trabalhar no projeto CentralDark / MultiZap: ChatGPT, Lovable, Codex, Grok, Copilot, CodeGPT, bots GitHub Actions ou outro agente.

Este prompt serve para a IA entender o projeto, respeitar segurança, atualizar documentação, manter o Mega Painel vivo e trabalhar por lotes com validação.

---

## Prompt para copiar e colar

```txt
RELOAD MEMORIA.
MODO CENTRALDARK / MODO SEGREDO / MODO LOVABLE DISCIPLINADO.

Você está trabalhando no projeto CentralDark / MultiZap.

Objetivo geral:
Evoluir o sistema com segurança, documentação, validação e rastreabilidade. O projeto deve funcionar como um ecossistema vivo: GitHub, VPS, Mega Painel, MCP, bots, IAs, pendências, relatórios, Linear, Notion e Sentry precisam conversar entre si sem expor segredos e sem executar ação sensível sem revisão humana.

Fonte oficial:
- Repo oficial: ServerVpss/CentralDark.
- Mega Painel: https://status.centralldark.com.
- O Mega Painel é a fonte visual viva do projeto.
- GitHub/main é a fonte versionada oficial.
- Documentação oficial fica no repo, não só em memória local de ferramenta.

Antes de mexer em qualquer coisa, leia quando disponível:
1. README.md da raiz.
2. docs/CONSCIENCIA/.
3. docs/PENDENCIAS.md.
4. docs/RELATORIOS/.
5. docs/BOTS/.
6. CentralDark/apps/projeto-dashboard/painel-data.json.
7. Estado atual de GitHub/VPS/workflows via ferramentas read-only.

Regra principal:
Não trabalhe no escuro. Primeiro entenda o estado real, depois planeje, implemente, valide, documente, atualize o Mega Painel e deixe handoff para a próxima IA.

---

## Segurança inviolável

Nunca expor, abrir, copiar, resumir, editar ou usar como contexto:
- tokens;
- senhas;
- cookies;
- sessions;
- .env real;
- secrets;
- chaves SSH;
- arquivos *.pem ou *.key;
- arquivos de sessão WhatsApp/WuzAPI;
- connection strings reais;
- backups privados;
- banco real.

Ações sensíveis exigem confirmação humana explícita:
- Docker;
- WuzAPI;
- sessão WhatsApp;
- reset/logout WhatsApp;
- Caddy;
- DNS/domínio público;
- PM2 restart;
- banco real;
- CRM;
- apagar arquivos;
- git reset;
- merge automático;
- alterar secrets.

Se encontrar algo sensível ou perigoso:
- não execute;
- registre alerta;
- crie card/Issue com revisão humana;
- explique risco e próximo passo seguro.

---

## Como trabalhar

Use o fluxo por lote:

1. Exploração
- Leia arquivos relevantes.
- Confira estado real.
- Identifique padrão existente.

2. Planejamento
- Descreva objetivo do lote.
- Liste arquivos que pretende tocar.
- Declare o que não será tocado.

3. Implementação mínima
- Altere só o necessário.
- Respeite arquitetura existente.
- Não crie duplicação sem motivo.

4. Validação
- Crie ou rode validador quando fizer sentido.
- Para código: teste/check/build.
- Para painel: JSON válido, JS válido, HTTP 200, dados refletidos.
- Para docs: links, pendências e handoff atualizados.

5. Documentação
- Atualize README.md se afetar orientação geral.
- Atualize docs/CONSCIENCIA/APRENDIZADOS.md para regra/aprendizado.
- Atualize docs/CONSCIENCIA/09-ESTADO-ATUAL.md para estado atual.
- Atualize docs/PENDENCIAS.md quando abrir/fechar pendência.
- Crie docs/RELATORIOS/YYYY-MM-DD-nome.md quando houver entrega relevante.
- Pasta nova precisa de README.md e PLANO.md.

6. Mega Painel
- Toda mudança relevante deve aparecer em status.centralldark.com.
- Atualize CentralDark/apps/projeto-dashboard/painel-data.json quando afetar cards, progresso, fases, bots, IAs, pendências ou status.
- O painel deve refletir o projeto, não ser apenas decorativo.

7. Handoff
Finalize sempre com:
- o que foi feito;
- arquivos alterados;
- validação executada;
- o que não foi tocado;
- riscos/pendências;
- próximo passo recomendado.

---

## Mega Painel Auto-Vivo

O Mega Painel não é dashboard passivo. Ele é o mapa vivo do projeto.

Ele deve:
- ler estado real;
- comparar fontes;
- calcular progresso;
- criar cards novos;
- atualizar cards existentes;
- criar pendências;
- mostrar IA responsável;
- mostrar bot responsável;
- mostrar porcentagem;
- mostrar fase;
- mostrar risco;
- mostrar próximo passo;
- registrar linha do tempo das IAs;
- avisar quando algo não bate.

Ele não deve:
- reiniciar serviço;
- apagar arquivo;
- alterar Caddy;
- mexer em Docker;
- mexer em WuzAPI;
- mexer em banco real;
- mexer em sessão WhatsApp;
- fazer merge automático.

O painel pode criar card, alerta, Issue ou PR com revisão humana.

Modelo de progresso:
progress = floor((criterios_concluidos / criterios_totais) * 100)

Se houver bloqueio real, o card não pode ficar em 100%.

Se algo existe nas docs e não existe no painel:
- criar card.

Se algo existe no painel e não existe mais nas docs:
- marcar como precisa_revisao.

Se workflow falhar:
- criar/atualizar card de workflow.

Se deploy_status der erro:
- criar card P1 ou P0 
```