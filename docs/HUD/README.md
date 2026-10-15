# 🪬 HUD histórico → Instinto Superior · documento de migração

**Intenção do CHEFE (15/10/2026):** o `docs/HUD/HUD.html` é a **fonte de capacidades legado**. Todas as capacidades devem convergir para o **zone de navegação existente** no Instinto Superior. `docs/HUD` fica como referência, ensinamento, template e prova de paridade até que as funções sejam comprovadamente migradas. Nenhuma exclusão antes do inventário e do teste de paridade.

## Fonte e owners

- Fonte legada: `docs/HUD/HUD.html`; preservar selos, nomes, CSS/temas, JS, contratos de DOM, ações e histórico. **NÃO APAGAR** por haver novo botão.
- Linhagem atual: `docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json`. A fonte canônica tem **198 seções + L000**; o snapshot embutido no HUD HTML antigo dizia **169 elos**. UIDs legados e lacunas são preservados, não renumerados.
- Destino de UI: `apps/instinto-superior/src/components/central/CockpitShell.tsx`, reutilizando o `Tabs` autenticado. Componente parcial extraído: `HudDeterministico.tsx`. Sem segundo cockpit.
- Owners de runtime permanecem os mesmos: Hermes Gateway/kanban; MCP/log-funnel; One Heart; APIs autenticadas; extensão `skills/vs-code-restore`. Documentar aqui não cria serviços.
- ZIP/plug-and-play é um **artefato de atualização com hashes**, nunca autorização para substituir estado local divergente ou apagar dados.

## Inventário agrupado das capacidades do HUD

| Domínio legado observado | Destino no zone existente | Estado da migração nesta branch |
|---|---|---|
| Replay Gênesis, passo, pausa, reset, leitura de UID | HUD · Selos · Gênesis | **SOURCE_NATIVE**; readback gráfico pendente |
| Hermes tipado por UID, geração de missão sem IA | Mesmo zone, prévia e copiar missão | **SOURCE_NATIVE**; envio real ao Gateway NÃO migrado |
| Nomes de 15 cadeados históricos e lei ENTROU_TEM_QUE_SELAR | Mesmo zone, inventário histórico | **SOURCE_NATIVE**; verificação live de campos/selos NÃO migrada |
| Fixed Point (10 critérios observáveis) e aceite | Reality Judge/estado existente | **PENDENTE DE PARIDADE** |
| Estados de Casa, VPS, Tailscale, bridge privado e MCP | Sistema CentralDark/observabilidade existentes | **PENDENTE DE PARIDADE** |
| One Heart, mapa de API/13 rotas, metas/goal loop | Sistema CentralDark/owners já existentes | **PENDENTE DE PARIDADE** |
| MSI Afterburner (51 sensores), Screenpipe e telemetria | Observabilidade CentralDark | **PENDENTE DE PARIDADE** |
| Skins/temas, responsividade, HUD relógio e notificações | Design Center/peles e componentes existentes | **PENDENTE DE PARIDADE** |
| Operações GitHub, PRs, deploy, auto-sync, status de arquivos | Sync Center/Forja | **PENDENTE DE PARIDADE** |
| Mapas, Obsidian, grafos, instalação, bibliotecas e skills | Navegação de capacidades existente | **PENDENTE DE PARIDADE** |
| Auditores determinísticos de botões e lacunas | Reality Judge/QA | **PENDENTE DE PARIDADE** |

A tabela é **inventário por domínio**, não prova de censo individual de todos os botões/scripts do HUD. Inventário exaustivo de IDs, listeners, CSS e endpoints ainda é necessário para declarar migração integral.

## Leis de selo e de Gênesis

1. Um novo selo exige `owner, scope, proof-key, source-sha, receipt, readback, observed-at, next-cursor`.
2. Selos históricos são datados e não viram PASS CURRENT por apenas aparecerem em UI. Novos selos têm trilha operacional separada de UIDs Lxxx; replay de aprendizados não é execução.
3. O Gênesis só avança diante de `prev_uid/next_uid` íntegros, com último `PENDING_NEXT_CURSOR`. `PASS_REPLAY_DOCUMENTAL != GATE_CI_PASS != RUNTIME_PASS`.
4. Hermes sem IA: formar texto de missão determinístico é permitido; `PREPARED != TASK_CREATED != EXECUTED != RECEIPT_CONFIRMED`. API autenticada e autorização continuam separadas.
5. Um único writer por escopo; alterações locais sujas da Casa/VPS permanecem intactas. Novo componente é parte do cockpit original, não aplicação paralela.

## Provas observadas na branch

- Readback GitHub da fonte: `docs/HUD/HUD.html` ~4.030 linhas e manifesto `ENTROU_TEM_QUE_SELAR`; 15 nomes de cadeados.
- Linhagem JSON: `L000 + 198 nós`; arestas `prev_uid/next_uid` verificadas e último cursor `PENDING_NEXT_CURSOR`.
- Tab autenticada adicionada ao `CockpitShell` original; sem `iframe`, sem criar outro Hermes, sem modificar o HUD HTML antigo.
- Checagem estática: **10/10 invariantes** na mesma branch; são verificações de fonte, NÃO build/URL/UI.
- Suíte de regressão `apps/instinto-superior/scripts/verify-hud-zone.mjs` adicionada para rodar no checkout materializado: `node --test scripts/verify-hud-zone.mjs`, a partir da pasta do app. **Execução da suíte e build Vite ainda não comprovados.**

## NEXT_CURSOR

Build/CI da PR isolada → corrigir apenas falhas reais do owner → readback em zone autenticado → migrar em lotes de capacidades (sensores, contratos, temas, controle/aceite, Hermes Gateway) com prova de paridade → só então reduzir o legado a manifesto/template, nunca quebrar links/owners históricos.

**Conformidade por escopo:** fonte/inventário parcial documentados; `100%` de satisfação declarado pelo CHEFE não equivale a conformidade técnica integral. `RUNTIME_HUD_MIGRATED=NOT_PROVEN`.
