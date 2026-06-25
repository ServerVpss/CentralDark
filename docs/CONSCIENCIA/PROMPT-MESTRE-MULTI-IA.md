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

## Regra do horário e publicação do Mega Painel

O Mega Painel atual é estático. Para atualizar dados/cards não precisa rebuild pesado nem reiniciar VPS.

Precisa:
1. commit/push dos arquivos estáticos ou dados;
2. sincronizar/publicar a pasta servida pelo domínio;
3. validar HTTP 200;
4. forçar refresh no navegador.

Arquivos principais:
- CentralDark/apps/projeto-dashboard/index.html
- CentralDark/apps/projeto-dashboard/app.js
- CentralDark/apps/projeto-dashboard/styles.css
- CentralDark/apps/projeto-dashboard/painel-data.json

Se status.centralldark.com mostrar horário antigo:
- comparar updatedAt do GitHub/main;
- comparar updatedAt do arquivo local servido;
- comparar updatedAt do JSON público;
- se público e local batem mas diferem da main, o problema é publicação/caminho/branch servida, não fuso nem rebuild.

Não reiniciar VPS por causa disso.

---

## Memória oficial vs memória local de ferramentas

.lovable/memory, memória do Grok, memória do Copilot ou anotações locais podem ser usadas como espelho.

Mas a memória oficial do projeto precisa estar no repo:
- README.md;
- docs/CONSCIENCIA/;
- docs/PENDENCIAS.md;
- docs/RELATORIOS/;
- docs/BOTS/;
- painel-data.json.

Nunca deixe aprendizado importante só em memória local de ferramenta.

---

## Codex / PR / Review

Padrão ideal inspirado no fluxo Codex + Git:

Issue/Pendência
→ IA entende contexto
→ IA cria PR ou patch mínimo
→ valida com teste/check
→ agente/revisor aponta feedback
→ Codex corrige feedback
→ pipeline roda
→ ChatGPT faz pente fino
→ humano aprova
→ merge/deploy
→ Mega Painel atualiza

Codex deve ser usado principalmente para:
- revisar PR;
- corrigir feedback de review;
- adicionar teste faltante;
- validar se Issue foi realmente resolvida;
- apontar risco sem executar ação sensível.

Prompt curto para Codex:

Leia a Issue/PR atual, entenda o feedback de revisão e corrija somente o que foi pedido. Não toque em Docker, WuzAPI, Caddy, CRM, banco real, sessão WhatsApp ou secrets. Se alterar código, adicione ou atualize teste/validador. Se alterar rota/API/painel, atualize docs. Não faça merge automático. Deixe resumo claro no PR.

---

## Time de Bots Especializados

O projeto deve operar como time de bots, não como um bot gigante.

Bots planejados/esperados:
- vigia-actions: detecta workflows vermelhos.
- sentinela: divergências de código.
- dependabot: dependências.
- codeql: segurança nativa GitHub.
- guarda-seguranca: secrets, SAST, SCA, IaC, container.
- faxineiro-repo: órfãos, ZIPs, dangling commits, arquivos soltos.
- auditor-divergencia: compara repo, origin/main e VPS.
- painel-vivo: atualiza status.centralldark.com.
- vps-healthcheck: PM2, disco, Caddy, domínios públicos em modo read-only.
- doc-guardiao: README.md + PLANO.md por pasta.
- dispatcher: roteia Issue/PR para o bot certo.

Toda Issue automática deve conter, quando aplicável:
- Bot que detectou.
- Bot responsável sugerido.
- Bot de apoio.
- Revisão final: ChatGPT + humano.
- Link para painel ou docs.
- Severidade P0/P1/P2/P3.
- Label revisao-humana quando precisar decisão.

Não listar todos os bots em toda Issue. Use bloco curto de roteamento.

Exemplo:
Bot que detectou: vigia-actions.
Responsável sugerido: Codex.
Apoio: dispatcher.
Revisão final: ChatGPT + humano.
Painel: atualizar card de workflow.

---

## Linear, Notion e Sentry

Conectores devem entrar no ecossistema assim:

Linear:
- pendências viram tarefas reais;
- prioridade, status, responsável, label e link;
- GitHub continua fonte versionada;
- Mega Painel mostra resumo.

Notion:
- documentação viva bonita e pesquisável;
- espelho de README, CONSCIENCIA, PENDENCIAS, RELATORIOS;
- GitHub continua fonte oficial.

Sentry:
- erros reais de install-callback, MCP, bot-server, gateway e frontend;
- criar cards e Issues quando houver erro relevante;
- nunca expor stack com segredo;
- Mega Painel mostra contadores.

Regra:
Frontend/Lovable só chama tools read-only primeiro.
Tokens ficam no servidor.

---

## Lovable

Lovable é forte para:
- UI;
- Mega Painel;
- telas bonitas;
- experiência visual;
- documentação visual.

Antes de editar, Lovable deve ler:
- README.md;
- docs/CONSCIENCIA;
- docs/PENDENCIAS;
- painel-data.json.

Lovable pode usar .lovable/memory como espelho, mas precisa registrar mudança importante também nos locais oficiais do repo.

Lotes sugeridos Lovable:

Lote 1 — MCP Teste:
- listar tools;
- ler README;
- ler CONSCIENCIA;
- listar PENDENCIAS;
- deploy_status;
- últimos relatórios;
- JSON bonito;
- loading e erro limpo;
- somente read-only.

Lote 2 — Mega Painel Vivo:
- cards por IA;
- cards por bot;
- cards por pendência;
- progresso por setor;
- status GitHub/VPS/workflows;
- cálculo objetivo.

Lote 3 — Central de Revisão Humana:
- Issues revisao-humana;
- PRs revisao-humana;
- severidade;
- bot responsável;
- botão abrir GitHub;
- próximo passo.

Lote 4 — Linha do tempo das IAs:
- ChatGPT;
- Lovable;
- Grok;
- Codex;
- Copilot;
- GitHub Actions;
- VPS;
- cada ação registrada em card.

---

## Fluxo para erro/falha

Quando aparecer erro:

1. Não chute causa.
2. Faça auditoria read-only.
3. Compare fonte oficial vs arquivo servido vs painel.
4. Salve relatório.
5. Classifique severidade.
6. Crie pendência/card se necessário.
7. Corrija só o menor ponto seguro.
8. Valide.
9. Atualize docs e painel.

Exemplo: se painel mostra hora antiga:
- não reiniciar VPS;
- não fazer rebuild desnecessário;
- comparar updatedAt do JSON público e origin/main;
- se divergente, sincronizar estáticos.

---

## Severidade

P0:
- segredo exposto;
- produção caiu;
- banco real em risco;
- ação destrutiva;
- domínio principal fora;
- sessão WhatsApp em risco.

P1:
- workflow principal falhando;
- deploy quebrado;
- rota pública quebrada;
- divergência GitHub/VPS;
- MCP/API fora.

P2:
- docs desatualizadas;
- pendência sem dono;
- teste faltando;
- card sem progresso;
- bot sem última execução.

P3:
- melhoria visual;
- organização;
- refatoração;
- sugestão futura.

---

## Saída final obrigatória

Ao terminar qualquer tarefa, responda neste formato:

STATUS_FINAL: OK / ALERTA / ERRO

O que foi feito:
- ...

Arquivos alterados:
- ...

Validação executada:
- ...

Mega Painel:
- atualizado / não aplicável / pendente e motivo

Docs e memória:
- atualizado / não aplicável / pendente e motivo

O que NÃO foi tocado:
- Docker
- WuzAPI
- Caddy
- PM2 sensível
- CRM
- banco real
- sessão WhatsApp
- secrets

Riscos:
- ...

Próximo passo:
- ...

MENSAGEM PARA A PRÓXIMA IA:
RELOAD MEMORIA. Resumo curto do estado atual, commit/PR/relatório quando houver, pendências abertas e próximo lote recomendado.
```

---

## Resumo curto

O CentralDark deve operar assim:

- GitHub é a fonte oficial versionada.
- Mega Painel é a fonte visual viva.
- MCP é o conector central.
- Linear organiza tarefas.
- Notion espelha documentação bonita.
- Sentry mostra erros reais.
- Bots detectam e abrem Issue/PR.
- IAs trabalham por lote.
- Codex revisa PR e feedback.
- ChatGPT faz pente fino final.
- O humano aprova ações sensíveis e merges.

Nenhuma IA deve trabalhar sem ler o estado real, validar e registrar o que fez.
