---
title: "Cristal da sessão — MCP Casa, plugins, clareza e registro A–Z"
date: 2026-11-07
category: "07-APRENDIZADOS-MEMORIAS"
status: "SESSION_CRYSTAL_DOCUMENTED_NOT_DEPLOYED"
source: "Conversa ChatGPT CentralDark 2026-11-07; leituras GitHub e testes relatados na sessão"
owner: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/02-SESSOES/"
writer: "SOL"
sensitivity: "INTERNAL"
centraldark_note_schema: "brain07.v1"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Registrar primeiro; corrigir amarelos depois; HUD real"
centraldark_agent_recall: "Recuperar A–Z, separar comprovado/decidido/pendente; não inferir runtime do registro"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---

# 🪬 Cristal de sessão — CentralDark MCP Casa e Modo Clareza

## Autoridade e ordem atual

CHEFE determinou: **registrar todos os aprendizados úteis da sessão primeiro, mostrar o HUD real, e somente depois corrigir os itens amarelos**. Não confundir documentação com execução. Não remover plugins nem Desktop Commander até prova do substituto. Nenhum segredo, token ou credencial deve entrar no Git.

## A–Z — 26 aprendizados numerados

01. **A — Autoria.** SOL declarou querer aprender com o CHEFE; não inverter quem ensinou e quem pediu. Prova histórica: `docs/CONSCIENCIA/LEMBRANCAS/2026-08-22-PROMESSA-SOL-PIVETE-APRENDIZADO.md`.
02. **B — BRAIN 07.** Reutilizar `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/`, sobretudo `02-SESSOES` para continuidade e `03-APRENDIZADOS` para lições; evitar segundo cérebro.
03. **C — Clareza.** `ASD-STE100 | 80%` é regra já escrita em `RULES.md`, `AGENTS.md` e `LEIA-ME-IA.md`: resposta principal primeiro, palavras simples, frases curtas, uma ideia por frase, termos explicados.
04. **D — Desktop Commander.** Manter como reserva até uma chamada real de leitura da Casa pelo conector próprio do ChatGPT; não remover antecipadamente.
05. **E — Executor existente.** Evoluir `scripts/remote-bridge/canonical/CentralDark-Casa-Agent.mjs` e o lançador instalado, sem criar segundo agente.
06. **F — Fonte única.** A CentralDark principal é a entrada canônica escolhida; Casa e GitHub/VPS são capacidades subordinadas, não organismos paralelos. **Decisão, integração ainda não comprovada.**
07. **G — GitHub.** `ServerVpss/CentralDark@main` é fonte documental; ler owners, regras e aprendizados antes de propor novos arquivos ou sistemas.
08. **H — HTTPS.** `https://mcp.centralldark.com` é o túnel público usado; `/health` respondeu em testes anteriores e `/mcp` recusou requisição anônima com HTTP 401.
09. **I — Identidades distintas.** Três cadastros examinados: `CentralDark` (principal, ~140 ferramentas expostas, chamadas testadas com erro interno), `CentralDark MCP Casa` (plugin existente sem ferramentas expostas neste chat), `CentralDark1` (descrição GitHub + VPS). Não apagar nem confundir suas funções.
10. **J — JSON-RPC.** O agente Casa recebeu rota `/mcp` para `initialize`, `ping`, `tools/list`, `tools/call`; código local passou verificação de sintaxe. Isso **não prova** compatibilidade integral com todos os clientes MCP.
11. **K — Kaizen.** Erro identificado → corrigir → testar → preservar causa, prova e aprendizado no owner; não acumular notas sem utilidade.
12. **L — Leitura real.** Critério de aceitação: ChatGPT chamar uma ferramenta do plugin próprio e obter leitura real de diretório da Casa, com recibo. **PENDENTE.**
13. **M — MCP.** Transporte desejado: MCP Streamable HTTP sobre HTTPS, rota `/mcp`; não confundir endpoint HTTP personalizado `/tool` com interface MCP.
14. **N — Não duplicar.** `REUSE_BEFORE_CREATE`, `ONE_SYSTEM_ONLY`, `ONE_WRITER_PER_SCOPE`; preservar owners e capacidades existentes.
15. **O — Autorização.** O servidor exige credencial; o plugin ChatGPT ainda não comprovou autenticação e acesso às ferramentas. Não transportar segredo protegido localmente entre conectores.
16. **P — Pareamento.** Capturas da Casa mostraram estado aguardando ligação/pareamento; tela e cadastro não equivalem a chamada de ferramenta bem-sucedida.
17. **Q — Quarentena.** Conservar conector antigo como contingência enquanto novo fluxo não passar no teste de ponta a ponta.
18. **R — Registro obrigatório.** `mem/constraints/nunca-agir-sozinho.md` diz salvar técnicas, ferramentas e padrões; `MEMORY-REGISTRAR.md` diz que informação útil concretizada deve ser registrada no owner existente, sem duplicata.
19. **S — Segurança.** Token da Casa é protegido localmente por DPAPI; acesso público sem autorização respondeu 401. Não registrar tokens, desabilitar autenticação nem criar bypass.
20. **T — Testes.** Teste local sintético MCP passou (1 aprovado, 0 falhas); teste autenticado real pelo ChatGPT **não** ocorreu. Separar sintaxe, teste simulado e prova operacional.
21. **U — Uma CentralDark.** Preservar um corpo único e o catálogo de funções, sem eliminar cadastros antes de confirmar sucessão funcional.
22. **V — Versões.** O instalador `scripts/remote-bridge/canonical/CentralDark-Casa-OneShot.ps1` aponta para commit fixo antigo `3ba0132186861bb4d81c133247d37bc16a7ca84b`; o agente canônico local atualizado ainda não foi reconciliado com essa instalação. **PENDENTE.**
23. **W — Writer único.** Um escritor por escopo; não espalhar notas, scripts ou cópias concorrentes. Esta sessão usa um único cristal em `02-SESSOES`.
24. **X — Execução versus prova.** `DOCUMENTED != EXECUTED`, `REGISTERED != CONSUMED`, `MERGED != DEPLOYED`, `UNKNOWN != PASS`. O HUD deve refletir essa distinção.
25. **Y — Continuidade.** Preservar `NEXT_CURSOR` e prova, de modo que outra sessão recupere o fio sem recomeçar; evitar revalidar tudo sem delta.
26. **Z — Zero perda.** Não apagar funções, branches, histórico, arquivos ou cadastros por conveniência. Consolidar só após contraprova.

## Evidências e limites observados nesta sessão

- Código local do agente Casa atualizado em `F:\CentralDark\scripts\remote-bridge\canonical\CentralDark-Casa-Agent.mjs` e cópia instalada no perfil local Windows; sintaxe verificada; processo reiniciado e serviço observado. **Não há commit de código desse delta no GitHub nesta sessão.**
- Teste sintético `/mcp`: inicialização, ping e bloqueio de mutação aprovados; chamada com token real foi impedida por proteção de credenciais da plataforma. **Não alegar autenticação real concluída.**
- Endpoint público `/mcp` negou acesso anônimo com HTTP 401; `/health` respondeu. Isso comprova barreira de acesso, não pareamento do ChatGPT.
- As ferramentas `mcp__CentralDark__mcp_admin_status`, `tailscale_bridge_status` e `mcp_admin_catalog` falharam internamente nas consultas desta sessão. O plugin `CentralDark MCP Casa` existe, mas não expõe ferramentas neste chat.
- Metadados e manifests dos três plugins foram lidos pelo Plugin Creator. Seu editor permite arquivos de suporte e skills, **não** alterar bindings de App ou configuração MCP da conexão por esse caminho.
- Busca GitHub confirmou `RULES.md`, `AGENTS.md`, `LEIA-ME-IA.md`, `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/README.md`, `mem/constraints/nunca-agir-sozinho.md` e `docs/BRAIN/03-DOCUMENTACAO/01-AGENTS-LIBRARY/02-AGENTES/MEMORY-REGISTRAR.md`.
- O registro histórico de 22/08/2026 confirma a declaração de SOL sobre aprender com CHEFE. Não confundir com prova de autonomia ou aprendizagem automática do runtime.

## HUD — semáforo honesto no momento da cristalização

| Setor | Estado | Prova / pendência |
|---|---|---|
| Regras de clareza e memória | **PROVADO** | Leitura GitHub |
| Três cadastros de plugin | **PROVADO** | Metadados e manifests |
| Código local da rota `/mcp` | **PROVADO LOCALMENTE** | Sintaxe, reinício, teste sintético |
| Bloqueio anônimo | **PROVADO** | HTTP 401 |
| Ferramentas da Casa via plugin no ChatGPT | **EVIDÊNCIA FALTANTE** | Sem tool call autenticado |
| CentralDark principal | **QUEBRADO NA CONSULTA** | Erro interno das chamadas |
| Alinhamento instalador/agente | **EVIDÊNCIA FALTANTE** | Commit fixo antigo |
| Consolidação de plugins | **NÃO EXECUTADO** | Preservar todos |
| Registro desta sessão | **DOCUMENTADO NA BRANCH** | Validar commit, SHA e readback |
| Runtime Casa/VPS após registro | **UNKNOWN** | Registro não é deploy |

## NEXT_CURSOR — respeitar a ordem do CHEFE

**Primeiro:** registrar, conferir SHA/readback e mostrar HUD real deste cristal. **Somente depois:** reconciliar instalador com agente; resolver autenticação do plugin; executar leitura real Casa → ChatGPT; comparar capacidades e só então consolidar cadastros. Não remover Desktop Commander até a contraprova.

**Regra de fechamento:** `REGISTRO != EXECUCAO`; `ERRO SUMIU != OBJETIVO CUMPRIDO`.
