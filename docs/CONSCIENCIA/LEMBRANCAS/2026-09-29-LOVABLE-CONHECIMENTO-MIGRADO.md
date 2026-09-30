# LEMBRANCA — Conhecimento do Lovable migrado para dentro da casa

- Origem: Lovable (conector oficial, somente leitura)
- Projeto: 49f92031-3d87-4d3b-9c94-38149b9f4f65 (Central Dark Instinct)
- Workspace: 4w4KhpRnbiTxa4LyNgsg
- Commit lido dos planos: da34589a0b89f46e731a18775ab4ebe46af62cd0 (2026-09-29T05:30:47Z, "docs(instinto): marcar repo como projecao do owner canonico")
- Data da migracao: 2026-09-29
- **NADA FOI APAGADO DO LOVABLE.** Esta e uma copia de leitura. Nenhum credito foi gasto (so leitura).
- Segredos: nenhum apareceu no material lido; nada foi redigido.

Indice:
1. CONHECIMENTO DO PROJETO (integra)
2. CONHECIMENTO DO WORKSPACE (integra)
3. HABILIDADES (2: revenue-centric-design, skill-master)
4. PLANOS (10, integra)

---

# 1. CONHECIMENTO DO PROJETO (texto integro)

# CENTRALDARK — AUTONOMIA WRITER DO PROJETO

AUTORIDADE_HUMANA: SEGREDO/CHEFE concedeu autorização explícita para operar este projeto com autonomia de escrita dentro da missão CentralDark atual.

## Princípio
FULL_AUTONOMY_WRITER=true significa: medir → adquirir o Writer conforme o contrato vivo → agir → testar → contrap provar → corrigir → continuar até fixed point.
NÃO significa ignorar owners, writer lease, segurança, rollback, autenticação ou prova.

## Fonte e precedência
- Fonte canônica: ServerVpss/CentralDark@CURRENT.
- Releia/remeça o contrato vivo antes de mutação material; CURRENT > HISTORY.
- O conector CENTRALDARK já presente é a ponte preferida para repo/VPS/runtime quando a capability existir.
- #1562 é rendezvous/ledger; nunca use a PR-mãe como veículo de merge.
- REUSE_BEFORE_CREATE=true
- ONE_SYSTEM_ONLY=true
- ONE_WRITER_PER_SCOPE=true
- REALITY_IS_JUDGE=true
- UNKNOWN != PASS
- ACTION != PROOF
- DOCUMENTED != EXECUTED
- MERGED != DEPLOYED
- NO_V1_V2_V3=true

## Writer
- Trate a autorização desta missão como aprovação humana para mutações reversíveis e necessárias no escopo.
- Antes da primeira escrita no CentralDark, descubra o Writer atual/lease pelo owner canônico. Se livre, adquira-o usando o mecanismo existente; se ocupado, não crie segundo writer: leia em paralelo, aguarde/handoff pelo mecanismo canônico e continue assim que o escopo estiver disponível.
- Não se autodeclare writer global fora do mecanismo existente.
- Dentro do repositório deste projeto Lovable, você é o executor/escritor ativo desta missão e deve editar/buildar/testar sem pedir microaprovações.
- Não force-push, não reescreva histórico publicado, não destrua dados sem rollback.

## Autonomia
Não pare para perguntar informação descobrível por tools, código, CENTRALDARK MCP, GitHub, logs ou runtime.
Continue automaticamente por múltiplas etapas e corrija regressões.
Só devolva fronteira humana quando for REAL:
1. OAuth/login/consentimento que exige ação humana;
2. permissão externa inexistente;
3. ação destrutiva/irreversível sem autorização específica;
4. runtime físico Windows realmente inacessível após tentar o owner/bridge existente.

## Conectividade
- Reusar CENTRALDARK MCP OAuth existente.
- GitHub: preferir capability existente no CENTRALDARK; se o conector GitHub Lovable precisar de OAuth separado, deixar AUTH_REQUIRED sem bloquear o restante.
- Gmail: integrar pelo conector oficial Lovable somente após OAuth humano; nunca inventar credencial. Enquanto faltar OAuth, construir interface/adaptador e mostrar AUTH_REQUIRED.
- Segredos apenas server-side. Nunca expor bearer/token/cookie no client, log público ou ZIP.

## Ciclo
#ACORDAR → !CALIBRAR → medir CURRENT → identificar owner → adquirir Writer → implementar menor delta causal → build/lint/test → contrap prova → remedir runtime aplicável → receipt → NEXT_CURSOR → repetir.

## Regra de encerramento
Não encerrar por ter feito commit ou build.
Encerrar delta apenas quando:
- PASS comprovado no escopo executável; ou
- bloqueio humano real explicitamente identificado; ou
- fronteira técnica real com evidência.
Sempre separar PASS / RUNNING / AUTH_REQUIRED / BLOCKED / UNKNOWN / FAIL.

## Missão corrente
Executar o comandão já enfileirado que transforma o projeto existente Central Dark Instinct no site/cockpit vivo da CentralDark, com auto-sync, GitHub/Gmail, HUD, Hermes nas 3 superfícies, controle, pacote/ZIP/GIFs, integração Desktop pelo owner existente, build/deploy e prova, sem arquitetura paralela.

## OAuth não bloqueia o resto
OAUTH_NON_BLOCKING=true
Quando Gmail/GitHub connector pedir consentimento humano:
- registrar AUTH_REQUIRED;
- NÃO abrir espera interativa antes de concluir todo trabalho independente;
- continuar usando CENTRALDARK MCP para GitHub quando disponível;
- construir UI/adaptador/estado fail-closed sem credenciais falsas;
- somente no relatório final listar o consentimento pendente.


## CENTRALDARK_DESIGN_CONTRACT
DESIGN_OWNER=EXISTING_PROJECT
ONE_DESIGN_SYSTEM=true
REBUILD_IN_PLACE=true
NO_PARALLEL_DESIGN_APP=true
PRESERVE_EXISTING_COLORS=true
PRESERVE_INSTINTO_SUPERIOR_IDENTITY=true
HERMES_REDESIGN_FORBIDDEN=true
HERMES_16_FRAME_QUALITY_UPGRADE_ALLOWED=true
HERMES_MOTION_FLUIDITY_UPGRADE_ALLOWED=true
VISUAL_REGRESSION_FORBIDDEN=true
DESIGN_TOKENS_FROM_EXISTING_UI=true
PUBLIC_PRIVATE_BOUNDARY_VISIBLE=true
ACCESSIBILITY=true
RESPONSIVE=true
REALITY_IS_JUDGE=true

O “Designer” deve ser uma capacidade/seção do mesmo Cockpit, não um segundo sistema. Ele pode controlar e visualizar tokens, componentes, estados, Hermes, responsividade e previews; qualquer mudança material deve ter antes/depois, preview e rollback. Não mudar paleta aprovada nem identidade do Hermes Instinto Superior. A melhoria do Hermes agora é resolução/qualidade dos 16 quadros por ação e fluidez, preservando forma, cor e identidade.

## ADENDO 2026-09-24 — CANETA E CONSUMO
- CHEFE autorizou escrita até fechar a missão, sem revisão humana ou micropermissões para contrato, rotas, código, build e validação interna. Os gates são automáticos; não tratá-los como fila de aprovação. Credenciais/consentimento ausentes permanecem AUTH_REQUIRED, sem inventar conta admin.
- Quatro escopos coordenados: contrato/GitHub, auth/Supabase, painel/design, runtime/PDF Gate. Paralelismo de leitura; uma caneta material por escopo compartilhado, com handoff explícito.
- Acrescentar ao cockpit privado um painel grande, responsivo e legível de saldo Lovable, créditos consumidos, tokens, gasto por provedor/modelo e período, fonte, horário, orçamento e status. Nunca inventar números; sem API autorizada, exibir UNKNOWN ou AUTH_REQUIRED. Não expor consumo privado em /cockpit público.
- Login: e-mail/senha, Google, callback, recuperação, logout e sessão; /sala-controle exige papel admin verificado pelo servidor; conta comum não ganha admin por cadastro ou user_metadata. Testar anônimo, usuário comum e admin; nenhum segredo no client.
- Corrigir SHAs, horas e PASS fixos do cockpit: estado vivo só com leitura e timestamp de fonte real. Código, commit, build, deploy e processo são estados distintos.
- Lovable sem créditos: preservar delta e continuar no owner GitHub existente via caneta disponível. Não simular vinculação da integração GitHub nem publicação Lovable. Retomar quando créditos voltarem; não duplicar prompts.
- PDF Gate é validação interna do artefato conforme owner canônico; não requer apresentação/aprovação humana. Só marcar PASS conforme evidência gerada pelo sistema.

---

# 2. CONHECIMENTO DO WORKSPACE (texto integro)

Responder em PT-BR, direto, técnico e objetivo. Explicar leigo quando necessário.

CentralDark:
Pivete comanda. DarkAI debate. Actions provam. IAs variam. O método permanece.

Método:
Evidência primeiro. Correção mínima. Histórico no Git. Registrar o ouro no final.
Ler. Validar. Agir mínimo. Provar. Registrar. Retomar o fio.

Emojis:
🟢 sucesso/estável
🟡 atenção/pendência
🔴 erro/alerta
🚀 execução/deploy
🛠️ manutenção/infra
🔄 git/sincronia

Não pedir secrets, .env, token ou chave SSH.
Não fazer force-push.
Não fazer push direto da main local suja da VPS.
Não fazer restart, deploy, reset ou ação destrutiva sem autorização.

Ao concluir, informar: feito, evidência, pendência, próximo passo, qual BOOT usar e fio da missão.

## Autoevolução Mental do Pivete

Fonte canônica:
`docs/CONSCIENCIA/LEMBRANCAS/AUTO-EVOLUCAO-MENTAL-PIVETE.md`

Quando a tarefa envolver evolução do Pivete, Hermes doméstico, painel pessoal, consolidação de projetos, papel do Pivete ou delegação de agentes, consultar essa fonte antes de propor mudanças.

Princípios:
- o objetivo não é superioridade; é clareza de papel, expansão de compreensão e capacidade operacional;
- preservar criador, orquestrador, arquiteto, operador, revisor e dono da doutrina como competências;
- delegar execução repetitiva sem perder domínio intelectual;
- usar, quando necessário, três funções enxutas: Construtor, Guardião e Estrategista;
- Pivete formula problemas, define intenção, prioridade, direção, valor e mudanças críticas;
- não criar v1/v2/v3, cópias, diretórios, subdomínios, agentes ou sistemas paralelos quando houver equivalente;
- inventariar e revisar antes de eliminar; preservar o ouro útil;
- o painel futuro deve reutilizar fontes existentes e medir evolução somente por evidência;
- sem prova objetiva, registrar “sem mudança comprovada”.

Aplicar a Técnica da Lupa Premium: Zoom Out, Zoom In, Feynman, regressão, rollback, observabilidade e Autolupa. Rejeitar falso verde, over-engineering, duplicação e atividade sem ganho real.

## Ponte de Continuidade Multi-Agente

Fonte oficial no GitHub:
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md`
- `docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md`
- `docs/PROTOCOLO-BOOT.md`

Lovable guarda somente este ponteiro e contexto operacional mínimo; nunca cria história, missão, memória ou documentação concorrente.

`!CALIBRAR`:
- interromper novas ações;
- manter a mesma `MISSION_ID`;
- comparar conversa, Git, PR, Actions, logs e estado real;
- atualizar apenas os documentos canônicos que realmente mudaram;
- devolver missão, fase, última ação comprovada, evidência, próximo passo único, travas e divergências.

`!RELOAD`:
- entrar em read-only;
- reler as fontes oficiais e buscar semanticamente pela `MISSION_ID`;
- validar o checkpoint contra evidências reais;
- apontar divergências;
- retomar somente o próximo passo comprovado e autorizado.

Ponte entre aplicativos:
- se Lovable não possuir ferramenta, contexto, acesso ou capacidade suficiente, não improvisar;
- entregar a subtarefa delimitada ao agente autorizado mais adequado usando a mesma `MISSION_ID` e as referências canônicas;
- o receptor deve reler o GitHub e validar as evidências, não confiar apenas no texto encaminhado;
- o resultado retorna ao orquestrador original e ao mesmo fio;
- somente um agente mantém o papel de orquestrador da missão.

Distribuição sem cópias:
- missão, fase e próximo passo → `docs/PENDENCIAS.md`;
- estado comprovado → `docs/CONSCIENCIA/09-ESTADO-ATUAL.md`;
- decisão de caminho → `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`;
- aprendizado durável → `docs/CONSCIENCIA/APRENDIZADOS.md`;
- evidência → commit, PR, Actions, teste, log ou relatório canônico.

---

# 3. HABILIDADES (workspace 4w4KhpRnbiTxa4LyNgsg — 2 habilidades)

Observacao: a leitura so devolve o SKILL.md de cada habilidade. Os arquivos de referencia nao sao acessiveis pelas ferramentas de leitura usadas; por isso entram aqui com titulo, resumo de 3 linhas (a partir da descricao no SKILL.md) e tamanho. **A integra das referencias continua no Lovable.**

## 3.1 revenue-centric-design (SKILL.md, integra, 5998 bytes)

```
---
name: revenue-centric-design
description: >-
  Playbook for designing SaaS and startup products that convert, retain, and monetize —
  landing pages & CRO, onboarding/activation, churn reduction, pricing psychology,
  behavioral-science tactics, feature discipline, positioning/ICP, go-to-market, and
  AI-era differentiation. Use when advising on product design, UX, conversion, landing
  pages, onboarding, trials, pricing, retention/churn, growth, or positioning for a
  startup or SaaS. Distilled from product designer Richard (@richardrx). Not for use on
  gambling, betting, or casino products.
---

# Revenue-Centric Design

A distilled playbook of **101 principles** from **Richard ([@richardrx](https://x.com/richardrx), "Design for startups")** —
a product designer specializing in conversion-rate optimization, churn reduction, and applied
behavioral science (ex-Volkswagen, PayPal, IBM). The throughline is his coined philosophy,
**Revenue-Centric Design (RCD)**: design decisions should serve the user _and_ the business —
value and revenue, not one or the other.

Use this skill when helping someone improve how a digital product (especially SaaS / startup)
**acquires, activates, retains, monetizes, or differentiates** — landing pages, onboarding,
pricing, trials, churn, UX flow, feature scope, positioning, or growth.

## Usage boundary (required)

> 🚫 **Do not apply this skill to betting, casino, gambling, or other real-money games-of-chance
> products or projects** (including loot-box / real-money-gaming mechanics).

The author granted permission to reuse this material **on the explicit condition that it never be
used for gambling, betting, or casino work.** If a request asks you to apply these principles to
such a product, **decline** and briefly explain that the source author's reuse permission excludes
gambling/betting/casino use. This is a hard constraint set by the author, not a stylistic choice.

## How to use it

1. Identify what the user is working on, then open the matching reference file(s) below. Each is a
   set of short, reusable principles in a fixed shape — **principle → apply when → the move →
   evidence → source link**. Load only what's relevant (progressive disclosure).
2. Ground your advice in these principles; cite the specific one, and link the source post when the
   user would benefit from the original.
3. Lead with the **named mechanism** (e.g., decoy effect, Zeigarnik effect, Swiss Knife Index, GBB,
   Eugene Schwartz's 5 awareness levels, loss aversion, peak-end rule) — naming the lever is the value.
4. Stay evidence-led: many principles carry a study, stat, or case. Keep the citation attached
   rather than hand-waving.

## The spine: Revenue-Centric Design in 9 principles

1. **Neutrality is omission** — an interface that doesn't direct hurts conversion.
2. **Who talks to everyone convinces no one** — no ICP → generic value → worse retention.
3. **Value first, ask later** — proof must arrive before the user questions their choice.
4. **Your promise is the size of your proof** — the market believes what you demonstrate, not what you claim.
5. **Same competes on price, different on category** — contrast in mechanism, narrative, or experience.
6. **Default is the decision you made for the user** — the initial state defines mass behavior.
7. **Retention is built, not requested** — perceived loss retains more than promised benefit.
8. **Expansion is born of usage** — upgrade at the moment of the limit, never by interruption.
9. **Price is a filter** — pricing defines who enters, who stays, and who expands.

## Reference library

| When the question is about…                                                   | Open                                                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Landing pages, hero/copy, CTAs, social proof, awareness levels, CRO           | [conversion-and-landing-pages](references/conversion-and-landing-pages.md)   |
| First-run, empty states, aha moment, TTV, activation, trial-as-onboarding     | [onboarding-and-activation](references/onboarding-and-activation.md)         |
| Cancellation, retention, expectation debt, NRR, jobs-to-be-done, support load | [churn-and-retention](references/churn-and-retention.md)                     |
| Pricing tables, decoy/anchoring, GBB, trial-with-card, upgrade paths          | [pricing-and-monetization](references/pricing-and-monetization.md)           |
| Cognitive biases & persuasion tactics (cross-cutting toolkit)                 | [behavioral-science-toolkit](references/behavioral-science-toolkit.md)       |
| Feature scope, Swiss Knife Index, feature adoption, attention hierarchy       | [product-strategy-and-features](references/product-strategy-and-features.md) |
| Design philosophy, the RCD principles, design process & method                | [revenue-centric-design](references/revenue-centric-design.md)               |
| ICP, niche, founder-fit, distribution, PLG, Bullseye, first customers         | [positioning-icp-and-gtm](references/positioning-icp-and-gtm.md)             |
| Differentiating in the AI era, moats, commoditization                         | [ai-era-differentiation](references/ai-era-differentiation.md)               |
| A/B testing rigor, vanity metrics, churn→LTV math, signal quality             | [metrics-and-experimentation](references/metrics-and-experimentation.md)     |

Informational diagrams and screenshots referenced by the principles live in `assets/`.

## Provenance

101 curated posts by [@richardrx](https://x.com/richardrx), extracted with a valid X API key and
distilled **with the author's permission**, translated from Portuguese to English. Every principle
links back to its source post. Reuse is subject to the gambling/betting/casino exclusion above.
```

### 3.1.1 Referencias de revenue-centric-design (SO RESUMO; integra no Lovable)

| Arquivo | Tamanho | Titulo | Resumo (3 linhas) |
|---|---|---|---|
| references/conversion-and-landing-pages.md | 19029 bytes | Conversao e landing pages | Principios sobre hero/copy, CTAs, prova social e os 5 niveis de consciencia de Eugene Schwartz. |
| | | | Cada principio segue: principio, quando aplicar, a jogada, evidencia, link da fonte. |
| | | | Foco em CRO de paginas de venda de SaaS. |
| references/onboarding-and-activation.md | 22515 bytes | Onboarding e ativacao | Primeira execucao, estados vazios, momento aha, tempo ate o valor e trial como onboarding. |
| | | | Cada principio segue o mesmo formato com evidencia e fonte. |
| | | | Maior arquivo da biblioteca. |
| references/churn-and-retention.md | 11384 bytes | Churn e retencao | Cancelamento, divida de expectativa, NRR, jobs-to-be-done e carga de suporte. |
| | | | Tese: retencao se constroi, nao se pede; perda percebida retem mais que beneficio prometido. |
| | | | Formato padrao com evidencias. |
| references/pricing-and-monetization.md | 13839 bytes | Preco e monetizacao | Tabelas de preco, efeito isca/ancoragem, GBB, trial com cartao e caminhos de upgrade. |
| | | | Tese: preco e filtro; expansao nasce do uso, no momento do limite. |
| | | | Formato padrao com evidencias. |
| references/behavioral-science-toolkit.md | 8840 bytes | Kit de ciencia comportamental | Vieses cognitivos e taticas de persuasao transversais (aversao a perda, peak-end, Zeigarnik). |
| | | | Serve de caixa de ferramentas para as outras referencias. |
| | | | Formato padrao com evidencias. |
| references/product-strategy-and-features.md | 9012 bytes | Estrategia de produto e funcionalidades | Escopo de funcionalidades, Swiss Knife Index, adocao de features e hierarquia de atencao. |
| | | | Disciplina para nao inchar o produto. |
| | | | Formato padrao com evidencias. |
| references/revenue-centric-design.md | 16435 bytes | Revenue-Centric Design (filosofia) | Filosofia RCD, seus principios, processo e metodo de design. |
| | | | Decisoes de design servem ao usuario e ao negocio. |
| | | | Formato padrao com evidencias. |
| references/positioning-icp-and-gtm.md | 9570 bytes | Posicionamento, ICP e GTM | ICP, nicho, encaixe do fundador, distribuicao, PLG, Bullseye e primeiros clientes. |
| | | | Tese: quem fala com todos nao convence ninguem. |
| | | | Formato padrao com evidencias. |
| references/ai-era-differentiation.md | 8834 bytes | Diferenciacao na era da IA | Como se diferenciar, fossos e comoditizacao no cenario de IA. |
| | | | Tese: o mercado acredita no que voce demonstra. |
| | | | Formato padrao com evidencias. |
| references/metrics-and-experimentation.md | 3914 bytes | Metricas e experimentacao | Rigor em testes A/B, metricas de vaidade, conta churn para LTV e qualidade de sinal. |
| | | | Menor arquivo da biblioteca. |
| | | | Formato padrao com evidencias. |

Aviso de uso (obrigatorio, do autor): nao aplicar em apostas, cassino ou jogos de azar.

## 3.2 skill-master (SKILL.md, integra, 2526 bytes; sem referencias)

```
---
name: "skill-master"
description: "Unifica a descoberta de ferramentas, a invocação, a orquestração, o autoaperfeiçoamento, a otimização de memória, a programação e a excelência em design em uma única habilidade mestra. Os gatilhos incluem a habilidade mestra, o invocador unificado, o meta orquestrador, o encadeamento avançado de ferramentas e o autoaperfeiçoamento."
---

Skill Master
Overview
Ultimate unified skill combining full tool/skill invocation, dynamic orchestration, continuous self-improvement, memory optimization, programming/deploy-first excellence and design superiority. Replaces and surpasses previous separate skills.

Activation and Discovery
Analyze intent. Use search_connected_tools for any unknown capabilities. Build minimal execution plan. Route dynamically to best tools or patterns.

Unified Invocation and Orchestration
Invoke via call_connected_tool with exact schemas. Support parallel and chained calls. Verify state and outputs before proceeding. Gracefully fallback on errors. Defer to specialized bundled skills when optimal.

Memory Mastery
Edit memory only for accurate durable facts. Use precise replace to prevent duplication. Summarize prioritize and clean proactively. Record self-improvement insights and key learnings post-task.

Programming and Code Superiority
Read context first. Generate functional deploy-ready code following direct speed-first style. Use write edit bash for rapid creation testing and refinement. Add minimal TODOs only for non-critical. Validate immediately.

Design and Visual Excellence
Orchestrate image generation editing and search for visuals. Integrate document skills for polished professional outputs. Ensure consistency hierarchy and production quality. Adapt superior external patterns when relevant.

Self-Improvement Loop
Reflect after every task on performance gaps and optimizations. Propose concrete updates to this skill or new capabilities. Browse external skill repositories like anthropics/skills for advanced patterns and integrate the best. Log actionable improvements to memory.

Response Discipline
Deliver only brief direct core-point responses with fewest words possible. Eliminate all elaboration filler and follow-up questions. Strictly align to user preference for pragmatic speed and maximum value.

External Pattern Integration
When beneficial browse public agent skill repos for modular declarative best practices. Adapt orchestration memory and workflow patterns to continuously elevate this master skill.
```

Nao ha outras habilidades no workspace (total: 2).

---

# 4. PLANOS (.lovable/plan/*.md, 10 arquivos, texto integro, commit da34589a)

Indice (data vem do nome do arquivo):

| # | Data | Arquivo | Titulo | Resumo |
|---|---|---|---|---|
| 1 | 2026-09-21 | plano-timeline-forja-dourada-minimalista-2026-09-21.md | Timeline Forja Dourada Minimalista | Secao de evolucao com 6 etapas ligadas a uma trilha dourada. Brilho ambar sutil, textos e traducoes preservados. Adaptado para celular e movimento reduzido. |
| 2 | 2026-09-22 | hermes-3-peles-com-movimento-tudo-dentro-do-que-ja-existe-2026-09-22.md | Hermes, 3 peles com movimento | Mostra a folha de poses no site com contagem real de quadros. Prova movimento nas 3 peles e fecha o pacotao. Instalacao no PC fica com o Pivete. |
| 3 | 2026-09-22 | hermes-desktop-movimentos-reais-sem-mexer-no-fixed-point-2026-09-22.md | Hermes Desktop, movimentos reais | Nove movimentos reconhecíveis com movimento secundario de verdade. Prova medida por silhueta corporal, nao so pixels. Deslocamento da janela no Windows marcado BLOQUEADO se o app nao aceitar. |
| 4 | 2026-09-22 | hermes-instinto-superior-um-unico-boneco-animacao-completa-2026-09-22.md | Instinto Superior, um unico boneco | Usar somente o Hermes da imagem enviada, sem as 3 peles no pacote. Transformacao luminosa gravada nos quadros. Pacote unico instalavel com backup e medicao real. |
| 5 | 2026-09-22 | melhorar-o-visual-sem-trocar-o-sistema-atual-2026-09-22.md | Melhorar o visual sem trocar o sistema | Nao substituir o site atual; aproveitar so busca e densidade de indice tecnico do arquivo enviado. Dentro de Projecao e Leitura de Repositorio. Manter paleta dark-neon. |
| 6 | 2026-09-23 | arsenal-maximo-painel-midia-e-hermes-em-movimento-2026-09-23.md | Arsenal maximo | Painel de pele/acao/quadro, Hermes flutuante controlavel, GIF de 144 quadros e versao compacta para celular. Pacote atualizado; deslocamento no Windows segue BLOQUEADO. |
| 7 | 2026-09-24 | ampliar-as-posturas-do-hermes-instinto-superior-2026-09-24.md | Ampliar as posturas do Hermes | Manter as 9 acoes e 16 quadros e incorporar posturas soltas (alerta, agachado, canalizando, costas, impulso). Mesma folha, mesmo painel, sem mascote novo. |
| 8 | 2026-09-24 | design-center-e-cockpit-vivo-2026-09-24.md | Design Center e cockpit vivo | Navegacao interna no cockpit: visao geral, Sync Center, Design Center, Hermes, Downloads. Tokens reais, estados PASS a FAIL, antes/depois e rollback. Gmail segue AUTH_REQUIRED. |
| 9 | 2026-09-24 | hermes-passeando-nas-tres-telas-oficiais-2026-09-24.md | Hermes passeando nas tres telas | Mesmo Hermes em entrada publica, entrada do cockpit e cockpit logado. Componente compartilhado, areas de seguranca, esconder e movimento reduzido. Prova depende de sessao admin. |
| 10 | 2026-09-27 | consolidar-o-bloco-sistema-no-cockpit-centraldark-2026-09-27.md | Consolidar o bloco Sistema no Cockpit | Leva Mega Painel, Hub Seguranca, Cofre (ADM) e Status do TelePainel para o Cockpit existente. Prova antes de retirar os atalhos do TelePainel. Sem deploy sem ordem. |

---

## PLANO 1 — 2026-09-21 — plano-timeline-forja-dourada-minimalista-2026-09-21.md

# Plano — Timeline Forja Dourada Minimalista

## Resultado
A seção de evolução manterá as seis etapas e seus textos, mas ficará mais conectada à linha central, com um brilho dourado e âmbar simples que lembra metal aquecido.

## Alterações
- Reorganizar as seis etapas em composição alternada e mais próxima da trilha central.
- Transformar a linha em um rastro dourado contínuo, com centro luminoso e extremidades suaves.
- Conectar cada etapa à trilha por um nó dourado discreto e um pequeno traço lateral.
- Aplicar aproximação suave dos painéis ao entrar na tela e ao passar o ponteiro, sem deslocamentos bruscos.
- Usar brilho âmbar controlado nos nós e na borda próxima à trilha, evitando excesso de partículas.
- Preservar integralmente os títulos, descrições, ícones, ordem e traduções existentes.
- Adaptar o desenho para celular com trilha lateral e conteúdo legível, sem sobreposição.
- Respeitar a preferência de redução de movimento e manter a impressão em PDF limpa.

## Direção visual
- Paleta: fundo `#080909`, ouro `#C99123`, brasa `#FF6B35` e luz `#F7E7B2`.
- Tipografia da seção: Space Mono para destaques técnicos e Rubik para textos.
- Acabamento: forja dourada minimalista, compacto e preciso.

## Validação
- Conferir a seção em computador e celular.
- Confirmar foco, contraste e ausência de sobreposição.
- Verificar que a prévia continua sem erros e que a redução de movimento funciona.

---

## PLANO 2 — 2026-09-22 — hermes-3-peles-com-movimento-tudo-dentro-do-que-já-existe-2026-09-22.md

# Hermes — 3 peles com movimento, tudo dentro do que já existe

## O que já está pronto (medido agora)
- A seção "Hermes — três peles, um instinto" já existe no site e troca a pele em tempo real, sem ZIP.
- O Hermes já anima no site e no cantinho flutuante, usando a sua folha de poses original.
- As 3 folhas (Forja, Celestial, Ascensão) já estão publicadas no site.

Então nada novo é criado por fora: o plano só amplia o que existe.

## O que eu vou fazer

### 1. Mostrar a folha completa no site
Dentro da mesma seção do Hermes, um bloco "Folha de poses" que mostra, pela pele escolhida:
- cada pose com nome (parado, correndo direita, correndo esquerda, acenando, saltando, falhando, esperando, sentado, revisando);
- quantos quadros ela tem, contados de verdade da imagem — não número escrito na mão;
- cada pose rodando na tela, lado a lado, pra você ver na hora o que está bom e o que falta;
- um aviso claro nas poses com menos quadros (as de 4 e 5), que são as que "pulam" mais.

### 2. Garantir movimento nas 3 peles
Uma prova visível: cada pose de cada pele roda seus quadros na tela. Se alguma pele tiver quadro faltando, aparece marcado em dourado (não verificado) em vez de fingir que está certo.

### 3. Fechar o pacotão
Um único ZIP com as 3 peles já animadas, manifesto atualizado (poses, quadros, tamanho da célula, assinatura de cada folha) e o instalador de dois cliques com backup da versão antiga.

### 4. Instalar no seu PC
Isso eu não consigo fazer daqui — não tenho acesso à sua máquina. O que eu entrego é o pacotão de dois cliques; a instalação é você rodando ele. Depois, se quiser, te guio na conferência.

## Regra que eu vou respeitar
Sem criar segunda estrutura: mesmo componente do Hermes, mesmos textos nos três idiomas, mesmo contrato de folha (célula 192x208, grade 8x9), mesmo comportamento de animação reduzida. Nada de V2 do site.

## Detalhes técnicos
- `src/components/central/HermesPet.tsx` ganha `HermesFolha` reutilizando o `SpriteHermes` e a lista `POSES` existentes; nenhum componente paralelo.
- As contagens de quadros vêm de um JSON gerado por medição real dos atlas (alpha por célula), publicado como asset, em vez de constante escrita à mão.
- Novas chaves `pet.folha*` em pt/en/es em `src/lib/i18n.tsx`.
- Pacote montado em `/tmp` e entregue em `/mnt/documents` como um ZIP único.
- Validação: typecheck, build e Playwright nos três idiomas com captura de quadros diferentes por pose.

---

## PLANO 3 — 2026-09-22 — hermes-desktop-movimentos-reais-sem-mexer-no-fixed-point-2026-09-22.md

# Hermes Desktop — movimentos reais sem mexer no FIXED_POINT

## O que fica intocado
- O Hermes aprovado continua exatamente com a mesma identidade: armadura, elmo, asas, roupa, cajado, olhos, aura, faíscas, anel e cores.
- O FIXED_POINT atual continua sendo a referência visual principal.
- A transformação para Instinto Superior e a memória das três peles permanecem.
- Nada de V2, V3 ou estrutura paralela: será o mesmo Hermes, a mesma folha e o mesmo instalador.

## O erro que será removido
A versão atual desloca e ondula a imagem quase inteira. Isso produz quadros diferentes, mas não prova braços, pernas, roupa e cajado articulados. A validação atual será rebaixada nesse ponto e substituída por medição corporal verdadeira.

## O que vou construir

### 1. Nove movimentos reconhecíveis
Usar o Hermes aprovado como âncora e materializar desenhos-chave próprios para:
- parado;
- andando/correndo para a direita;
- andando/correndo para a esquerda;
- acenando;
- saltando e pousando;
- falhando/material alert;
- esperando;
- sentado, incluindo giro de costas e retorno;
- revisando.

Cada movimento terá passagem contínua entre as poses-chave, sem trocar o personagem nem redesenhar sua estética.

### 2. Movimento secundário de verdade
- braço e mão conduzem o cajado;
- cajado inclina, vibra e recupera o peso com atraso;
- capa, asas e roupa respondem depois do corpo;
- pernas e pés sustentam caminhada, salto, pouso e sentar;
- cabeça e tronco fazem antecipação e recuperação;
- aura, olhos, orbe, faíscas e anel continuam vivos em todos os quadros.

### 3. Hermes andando pelo computador
Manter a animação interna na folha e mapear esquerda/direita, espera, sentar, revisar, alerta e FIXED_POINT no contrato já usado pelo Hermes Desktop. Primeiro será conferido o contrato real aceito pelo aplicativo; se ele controlar deslocamento pela tela, o pacote entregará essa sequência. Se o aplicativo aceitar apenas a folha, o relatório marcará o deslocamento externo como **BLOQUEADO**, sem fingir que o ZIP sozinho move a janela.

### 4. Prova mensurável corrigida
O novo relatório medirá separadamente:
- mudança de silhueta corporal, não apenas pixels diferentes;
- trajetória do cajado e do orbe;
- movimento de braços, pernas, cabeça, capa e roupa;
- deslocamento e contato dos pés;
- continuidade entre primeiro e último quadro;
- variação da aura e das luzes;
- transparência e ausência de cortes.

Só receberá **PROVADO** o que passar nessas medições e na inspeção visual quadro a quadro.

### 5. Mesma entrega, sem regressão
- substituir a folha atual no site e no pacote somente depois da validação;
- manter a seção administrativa e as três peles antigas intactas;
- atualizar manifesto, prévia e instalador com backup;
- validar o site, a prévia animada e a integridade do ZIP final.

## Detalhes técnicos
- A folha continuará no contrato de células já aceito pelo projeto, ampliando quadros apenas se o leitor real suportar.
- As poses-chave serão criadas por edição da arte aprovada, não por geração solta.
- A interpolação será usada só entre poses aprovadas; deformação global não será aceita como articulação.
- O site e o pacote usarão a mesma folha validada, evitando duas versões do Hermes.

---

## PLANO 4 — 2026-09-22 — hermes-instinto-superior-um-único-boneco-animação-completa-2026-09-22.md

# Hermes Instinto Superior — um único boneco, animação completa

## Direção fechada
- Usar **somente o Hermes da imagem enviada**: mesma armadura azul, prata e dourada, mesmo elmo alado, capa, cajado e proporções.
- Ele não será tratado como quarta pele e não haverá Forja, Celestial ou Ascensão neste pacote.
- Reaproveitar o motor, o formato de instalação e a troca quadro a quadro já existentes. Nada de V2, V3 ou arquitetura paralela.
- O modo Instinto Superior é administrativo e não será apresentado como opção pública comum.

## O que será construído

### 1. Folha própria do Instinto Superior
Criar uma única folha animada a partir da arte limpa enviada, preservando o desenho do personagem. As capturas adicionais serão usadas apenas como referência visual da transformação.

Movimentos previstos:
- respiração e flutuação;
- olhar/vigilância;
- cajado erguido e canalizando;
- salto, queda e pouso;
- impulso curto para os lados;
- agachado/preparando ataque;
- agitado em alerta;
- transformação para Instinto Superior;
- estado superior sustentado;
- retorno suave ao estado de repouso.

A escolha dos movimentos será variada, com intervalos naturais, sem ficar repetindo sempre a mesma ordem. O boneco poderá flutuar, saltar, pousar e se agitar, mas continuará preso a uma área segura da tela para não atrapalhar o uso.

### 2. Transformação luminosa quadro a quadro
A transformação terá uma sequência própria, não apenas troca de imagem:
- visor e olhos acendem gradualmente;
- orbe e detalhes do cajado pulsam;
- aura prata-azulada com violeta percorre a silhueta;
- faíscas nascem perto do corpo e se dissipam;
- anel inferior abre, pulsa e fecha;
- luz acompanha cada quadro e cada gesto.

Os efeitos serão gravados nos próprios quadros para aparecerem também no aplicativo do computador, sem depender dos efeitos do site.

### 3. Um único pacote instalável
Refazer o pacote do computador com apenas `Hermes Instinto Superior`, mantendo:
- instalador de dois cliques;
- backup automático do Hermes anterior;
- prévia animada de todos os movimentos;
- manifesto e relatório de validação;
- restauração simples caso seja necessário voltar.

As três peles anteriores não serão apagadas do histórico nem sobrescritas sem backup, mas não farão parte deste novo pacote.

### 4. Medição real
O relatório provará, movimento por movimento:
- quantidade de quadros e quadros realmente diferentes;
- mudança corporal entre quadros;
- variação luminosa da aura, olhos e cajado;
- deslocamento máximo na tela;
- transparência preservada;
- identidade visual comparada com a imagem-base;
- ausência de cortes na asa, capa, cajado e círculo inferior.

Só será marcado como **PROVADO** o que passar na inspeção visual e nas medições. O canônico consultado confirmou o motor e o pacote funcional, mas não revelou poses adicionais prontas; portanto, os novos movimentos serão produzidos para este Hermes e declarados como novos, sem fingir que já existiam.

## Aplicação sem regressão
- Manter o movimento interno quadro a quadro e a flutuação externa existentes.
- Trocar somente a fonte visual e o repertório do Hermes administrativo.
- Preservar site, idiomas, acessibilidade, desempenho e todo o restante do projeto.
- Respeitar “reduzir movimento”: nesse caso, mostrar uma pose superior estável com brilho leve.
- Validar no site e no pacote do computador antes da entrega.

---

## PLANO 5 — 2026-09-22 — melhorar-o-visual-sem-trocar-o-sistema-atual-2026-09-22.md

# Melhorar o visual sem trocar o sistema atual

## Veredito medido
- O arquivo enviado é um retrato antigo: declara geração em **29/08/2026**, **1.360+ issues** e **47 skills**.
- A `main` viva já avançou para o commit **215dc369**, de **22/09/2026 às 07:47 UTC**. O arquivo enviado nem aparece com esse título na `main` atual.
- O site atual é superior como experiência principal: mantém os três idiomas, SEO, acessibilidade, PDF, doutrina completa, projeção medida e Hermes animado.
- O arquivo enviado é melhor somente como **índice técnico compacto**: busca instantânea, abas Mapa/Forja, cartões pequenos e três temas gerais.
- A versão publicada está saudável e já mostra as três peles do Hermes, mas ainda não exibe a folha completa de poses que existe no código local mais novo.

## O que fazer
1. **Não substituir o site atual** e não copiar os números ou estados antigos do arquivo.
2. Aproveitar apenas o acabamento útil do arquivo: visual mais compacto para dados técnicos, busca local e cartões de Forja.
3. Aplicar essas ideias dentro da seção **Projeção** e da página **Leitura de Repositório**, preservando a página principal e sua identidade dark-neon.
4. Manter as peles do Hermes como estão: Forja, Celestial e Ascensão, com movimento por pose e relevo leve. Não misturar com os temas Ouro/Ops/Esmeralda do arquivo.
5. Atualizar qualquer estado da `main` somente após nova medição; nunca transformar números antigos em “ao vivo”.
6. Conferir desktop e celular, os três idiomas, animação reduzida, PDF, console e publicação.

## Direção visual
- Manter o preto, dourado, azul, violeta e verde do site atual.
- Trazer do arquivo apenas a densidade elegante, a busca e o estilo de índice técnico.
- Não adotar as fontes antigas nem transformar toda a página em painel administrativo.
- Não criar outra versão, outra arquitetura ou uma página duplicada.

---

## PLANO 6 — 2026-09-23 — arsenal-máximo-painel-mídia-e-hermes-em-movimento-2026-09-23.md

# Arsenal máximo — painel, mídia e Hermes em movimento

## Classificação antes da escrita

- **PROVADO:** o site e o pacote usam a mesma folha administrativa com 9 ações, 16 quadros por ação, 144 quadros totais e 60 fps. O ZIP está íntegro e o hash da folha confere.
- **IMPLEMENTÁVEL AGORA:** painel de pele/ação/quadro, reprodução ao vivo, passeio controlável dentro do site, GIF completo e versão compacta para celular.
- **BLOQUEADO NO WINDOWS:** a folha contém corrida para os dois lados, mas o pacote não contém o motor que move a janela pela área de trabalho. Não vou declarar isso pronto sem o aplicativo Desktop real.
- **HABILIDADES:** nenhuma habilidade ativa foi encontrada neste espaço. A análise foi dividida deliberadamente entre três especialistas: estado real, mídia e experiência do painel.

## O que será construído

### 1. Painel do Hermes no site

Criar um painel único na seção atual, sem página ou sistema paralelo:
- estado visual: Instinto Superior administrativo, Forja, Celestial ou Ascensão;
- ação: as nove ações reconhecidas;
- quadro: controle de 1 até 16 no administrativo e até o limite real de cada pele antiga;
- reproduzir/pausar;
- prévia ao vivo usando a mesma folha do site e do pacote;
- controles acessíveis e versão compacta na parte inferior do celular.

O estado administrativo continuará separado da “Memória das Três Peles”; escolhê-lo no painel não apagará a pele antiga salva.

### 2. Hermes flutuante controlável no site

O Hermes flutuante passará a obedecer ao painel:
- ação escolhida ou modo automático;
- direção esquerda/direita;
- velocidade controlável;
- caminhada dentro dos limites visíveis da página, invertendo a direção nas bordas;
- modo parado mantém a flutuação atual;
- “reduzir movimento” mantém uma pose estável.

### 3. GIF familiar com os 144 quadros

Gerar um GIF transparente que percorra as nove ações em ordem e use cada um dos 144 quadros uma vez por ciclo. Validar:
- quantidade real de quadros;
- ordem das nove ações;
- transparência;
- ausência de cortes;
- inspeção visual de começo, meio e fim.

### 4. Hermes compacto para celular

Gerar uma folha e uma animação WebP em 96 × 104 por quadro, mantendo os 144 quadros e a suavidade. O site carregará essa versão apenas em telas pequenas, reduzindo memória e transferência sem mudar o desenho.

Meta: até 500 KB quando a qualidade visual permitir. Se passar disso, o relatório mostrará o tamanho real em vez de esconder a diferença.

### 5. Pacote atualizado, sem promessa falsa

Substituir a folha pelo material de 144 quadros já validado e acrescentar:
- GIF completo;
- versão compacta para celular;
- manifesto e relatório com dimensões, quadros, fps, tamanho e hashes;
- instalador com backup preservado.

O pacote continuará marcando o deslocamento da janela do Windows como **BLOQUEADO** até o motor Hermes Desktop ser fornecido ou localizado. Direção e velocidade funcionarão no site; não será criado um segundo aplicativo para fingir essa capacidade.

## Validação final

- conferir cada ação sem pulo abrupto entre os 16 quadros;
- testar pele, ação, quadro, pausa, direção e velocidade no computador e no celular;
- provar que o flutuante não sai da tela nem cobre os controles;
- conferir GIF e WebP quadro a quadro;
- validar o ZIP e o site sem erros.

---

## PLANO 7 — 2026-09-24 — ampliar-as-posturas-do-hermes-instinto-superior-2026-09-24.md

# Ampliar as posturas do Hermes Instinto Superior

## Objetivo
Manter o Hermes Instinto Superior exatamente com o desenho, as cores, a armadura, a aura e o cajado atuais, ampliando o conjunto único para incluir todas as posturas já existentes nos materiais do projeto.

## O que será feito
- Preservar as nove ações atuais e seus 16 quadros.
- Incorporar as posturas próprias hoje soltas: alerta, agachado, canalizando, costas, impulso e variações corporais válidas.
- Reunir tudo na mesma folha, no mesmo painel e no mesmo Hermes flutuante, sem criar outro mascote ou sistema.
- Produzir 16 quadros por postura, mantendo pixels integrais e movimento secundário de capa, roupa, cajado e aura.
- Atualizar nomes nos três idiomas, contagem total e pacote para computador.
- Conferir quadro a quadro, transições, painel, passeio e celular, com capturas e medidas.

## Regras invioláveis
- Não redesenhar nem recolorir o Instinto Superior.
- Forja, Celestial e Ascensão continuam como memória comparativa.
- Uma folha canônica, um motor e um painel; nada paralelo.
- Nenhuma postura entra como aprovada sem prova visual e continuidade medida.

## Detalhes técnicos
A folha atual de 9 linhas × 16 quadros será ampliada por novas linhas de 16 quadros. As imagens-chave existentes serão as fontes canônicas; a animação será criada por movimento em camadas e efeitos, sem alterar a identidade visual. O mesmo manifesto alimentará painel, flutuante e pacote.

---

## PLANO 8 — 2026-09-24 — design-center-e-cockpit-vivo-2026-09-24.md

# Design Center e cockpit vivo

## Direção
Estender o `CockpitShell` e o motor Hermes existentes. Não criar nova aplicação, rota paralela, mascote, paleta ou armazenamento.

A exigência de **9 ações / 144 quadros** será tratada como núcleo canônico aprovado. As sete posturas adicionais já existentes não serão apagadas: ficarão claramente marcadas como **EM TESTE**, preservando o trabalho atual e evitando regressão. O atlas, as cores e o desenho do Instinto Superior não serão alterados neste delta; a melhoria de pixels dos 16 quadros será registrada e comparável, com rollback, sem recoloração ou redesenho.

## Entregas
- Adicionar ao cockpit uma navegação interna entre **Visão geral**, **Sync Center**, **Design Center**, **Hermes** e **Downloads**.
- Extrair e exibir os tokens reais já usados: paleta, tipografia, espaçamento, raios, sombras, brilhos e estados.
- Montar biblioteca visual com os componentes atuais e os seis estados: `PASS`, `RUNNING`, `BLOCKED`, `AUTH_REQUIRED`, `UNKNOWN` e `FAIL`.
- Mostrar previews das três superfícies existentes em tamanhos computador e celular, sem iframe duplicado nem novo app.
- Reusar o `PainelHermes` para pele, ação, quadro, reprodução, direção e velocidade, conectado ao mesmo estado do Hermes flutuante.
- Mostrar comparação **antes/depois**, classificação **CANÔNICO / EM TESTE / PUBLICADO** e ação de rollback local para os controles visuais reversíveis.
- Preencher o Sync Center com a main real `6fce185…`, commits recentes, delta contra o servidor e data de medição, usando o canal CentralDark disponível como fonte independente de OAuth.
- Atualizar o HUD com main, servidor, build local, publicação, Gmail e Desktop, sem converter ausência de prova em sucesso.
- Ligar o Download Center ao ZIP real e explicar o instalador Windows, backup e rollback já incluídos no pacote.
- Manter Gmail como `AUTH_REQUIRED`; GitHub separado também será `AUTH_REQUIRED` se faltar autorização, sem bloquear a fonte CentralDark.

## Verificação
- Conferir consistência dos tokens e contraste dos textos/estados.
- Testar computador e celular, sobreposição do Hermes, navegação por teclado e `prefers-reduced-motion`.
- Verificar painel e Hermes flutuante usando o mesmo estado, sem duplicação.
- Validar ZIP, manifesto, instalador, backup e rollback.
- Rodar checagem de tipos, testes disponíveis e build automático.
- Capturar as superfícies públicas e o cockpit autenticado quando houver sessão; sem sessão, registrar a área protegida como `UNKNOWN`, não `PASS`.
- Registrar receipt final separando `PASS`, `RUNNING`, `AUTH_REQUIRED`, `BLOCKED`, `UNKNOWN` e `FAIL`.

---

## PLANO 9 — 2026-09-24 — hermes-passeando-nas-três-telas-oficiais-2026-09-24.md

# Hermes passeando nas três telas oficiais

## Objetivo
Levar o mesmo Hermes animado para a entrada pública, a entrada do cockpit e o cockpit após login, sem criar outro mascote nem alterar sua aparência aprovada.

## Execução
- Trabalhar em uma branch própria do repositório oficial, preservando a `main`.
- Consolidar o Hermes existente em um único componente compartilhado pelas três telas.
- Reaproveitar a folha atual de 144 quadros e os estados `running-left`, `running-right`, `idle` e `waiting`.
- Ativar direção, velocidade e inversão suave nas bordas em todas as telas.
- Criar áreas de segurança para ele não cobrir menus, botões, textos principais nem campos de uso.
- Manter “Esconder o Hermes”, respeitar redução de movimento e usar tamanho menor no celular.
- Preservar as reações do cockpit aos eventos sem duplicar a lógica visual.

## Prova
- Conferir entrada pública, entrada do cockpit e cockpit autenticado em computador e celular.
- Registrar uma captura de cada uma das três telas com o Hermes em posições diferentes.
- Validar que ele anda nos dois sentidos, para, retoma e inverte nas bordas sem saltos.
- Verificar erros visuais, carregamento dos quadros e mensagens do navegador antes de finalizar.

## Limite confirmado
A publicação atual ainda não expõe o cockpit nessas páginas; a prova final dependerá da prévia gerada pela branch oficial e de uma sessão administrativa válida para a terceira captura.

---

## PLANO 10 — 2026-09-27 — consolidar-o-bloco-sistema-no-cockpit-centraldark-2026-09-27.md

# Consolidar o bloco Sistema no Cockpit CentralDark

## Objetivo
Levar integralmente **Mega Painel**, **Hub Segurança**, **Cofre (ADM)** e **Status** para o Cockpit CentralDark existente, sem criar outro portal, cockpit ou sistema paralelo. O TelePainel só perde os quatro atalhos após as novas áreas funcionarem e serem comprovadas.

## Estado calibrado
- Fonte oficial: `ServerVpss/CentralDark@main` no SHA `d5cc45905a985259500b9ec468ac1d39d97397f7`.
- O Cockpit CentralDark atual já possui autenticação administrativa real e bloqueio para não administradores.
- Os quatro recursos ainda vivem na árvore do TelePainel e dependem de telas, leituras e controles próprios.
- Existem árvores antiga e consolidada no repositório oficial; a consolidada em `src/apps/modulos/telepainel/` será preservada como referência mais avançada.

## Execução
1. **Inventariar o conjunto completo**
   - Ler as quatro telas atuais e todas as dependências diretas: notificações, bots, rotas, contas, módulos, instalador, saúde, deploys, MCP e histórico.
   - Classificar cada capacidade como reutilizável, específica do TelePainel, dependente de fonte externa ou ainda sem prova.

2. **Integrar ao Cockpit existente**
   - Criar as quatro áreas dentro da Sala de Controle administrativa já existente.
   - Reaproveitar os controles e estados atuais da CentralDark; não duplicar autenticação, HUD, roteador, Hermes, consumo ou navegação.
   - Manter dados sem fonte verificável como `UNKNOWN` ou `AUTH_REQUIRED`, nunca como sucesso.

3. **Preservar segurança e acessos**
   - Manter `/sala-controle` protegido por papel administrativo validado no servidor.
   - Não expor contas, comandos, instaladores ou dados operacionais no cockpit público.
   - Ações materiais ficam bloqueadas quando não houver integração autorizada; nenhuma credencial será copiada.

4. **Provar antes de retirar**
   - Validar anônimo, usuário sem permissão e administrador.
   - Abrir e testar os quatro botões em computador e celular.
   - Rodar lint e build, conferir erros de execução e verificar que as telas existentes continuam funcionando.

5. **Convergir no repositório oficial**
   - Recomparar a `main` antes da escrita e aplicar apenas o menor delta no owner `public/central-dark-instinct-2/`.
   - Após a prova do novo Cockpit, remover somente os quatro itens do menu do TelePainel, preservando suas demais funções.
   - Registrar evidência, arquivos alterados, SHA final, pendências reais e ausência de segredos copiados.

## Resultado esperado
```text
Cockpit CentralDark administrativo
├── Mega Painel
├── Hub Segurança
├── Cofre (ADM)
└── Status

TelePainel
└── mantém apenas suas funções próprias
```

## Travas
- Sem publicação ou deploy sem ordem explícita.
- Sem remoção antecipada do TelePainel.
- Sem segunda arquitetura ou cópia funcional permanente.
- Se uma dependência externa não puder ser medida, a área permanece visível com estado real `UNKNOWN`/`AUTH_REQUIRED`.

---

FIM DA LEMBRANCA. Origem: Lovable, somente leitura. Nada foi apagado do Lovable.
