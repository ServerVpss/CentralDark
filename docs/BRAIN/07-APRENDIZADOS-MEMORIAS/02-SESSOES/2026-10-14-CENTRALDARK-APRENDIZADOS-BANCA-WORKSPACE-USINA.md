---
id: centraldark-banca-workspace-usina-20261014
status: OBSERVED_EVIDENCE_NOT_GLOBAL_FIXED_POINT
intent_owner: ADMIN
scope: "Aprendizados comprovados na conversa e por leituras read-only 2026-10-14"
canonical_promotion: PENDING_ONE_WRITER_RECONCILIATION
tags: [centraldark, workspace, vscode, cockpit, hud, forja, obsidian, screenpipe, rdc, ownership, fixed-point]
---

# 🪬 CENTRALDARK — Cristal de observações da bancada · 2026-10-14

**Regra de permanência:** nada que foi observado/provado pode sumir; nenhuma hipótese vira PASS; reutilizar antes de criar; um Hermes, um writer por escopo e um HUD por missão. Esta nota é registro de evidência e aprendizagem, **não substitui** `docs/CONSCIENCIA/APRENDIZADOS.md`, seu manifesto NeuroLink, `AGENTS.md` ou a gramática da SOL.

## A. Realidade visual observada nas capturas enviadas

- O VS Code é exibido como **CentralDark (Workspace) [Administrador]**; o painel de terminais está aberto com múltiplas sessões visíveis. A imagem é prova de **interface aberta**, não de execução/autorização de cada terminal.
- Captura da mesma bancada exibe **ChatGPT**, **Instinto Superior / Cockpit vivo** em uma janela de navegador e **HUD CentralDark** com abas `HUD`, `MAPA`, `FORJA`, `OPERAÇÃO` em outra janela.
- Os painéis ainda estão apresentados separadamente; não existe prova de que já viraram **uma superfície Chromium unificada com sincronização ponta a ponta**.
- O ADMIN chama a experiência de sua **usina**. O resultado desejado é **uma navegação humana** (Instinto Superior) consumindo motores existentes, sem encapsular todo código dentro da pasta de frontend.

## B. Contratos operacionais confirmados

- Os executores **AionUi**, **Bolt**, **Hermes**, **MCP**, **Screenpipe**, **Obsidian/Grafo Vivo** têm ownership técnico próprio. UI única não equivale a processos, portas, caches ou dados numa mesma pasta.
- `K:\` é a raiz do repositório local apresentada no Explorer; `K:\docs` abriga a documentação/memória; `K:\apps\modulos` são motores; `K:\apps\instinto-superior` é a UI; `K:\scripts` guarda automações. A VPS tem checkout `/root/CentralDark`. **Não criar `K:\root\CentralDark`** para imitar a VPS.
- Pastas ocultas `.agents`, `.hermes`, `.obsidian`, `.screenpipe`, `.vscode` foram vistas no Explorer de `K:\`; são configurações/dados/owners distintos e precisam ser inspecionadas antes de mudança.
- Rodar `npx @wonderwhy-er/desktop-commander@latest remote` com `K:\docs` como diretório atual não instala o software fisicamente no cofre. Desktop Commander é transporte/fallback; MCP CentralDark é plano de controle já existente.
- A leitura de `apps/modulos/screenpipe-launcher.mjs` confirma `CASA_WINDOWS` como host esperado. `127.0.0.1:3030` **na VPS** não prova o Screenpipe **na Casa**; o sensor da VPS respondeu HTTP 404. Não declarar Screenpipe da Casa parado por essa medição.
- O Desktop Commander da Casa figurou **offline** na sessão de ferramenta; a VPS apareceu **online por outra conexão**. Isto prova estado de rota, não desligamento do Windows.
- Catálogo MCP medido: **141 ferramentas de runtime**, **13 rotas registradas**, **20 operações destrutivas classificadas** em 2026-10-14 UTC. Rota registrada não prova serviço ativo.
- VS Code em `.vscode/tasks.json` já define `CentralDark: Bootstrap`, `CentralDark Claude: Hermes ON`, `Direct OFF`, `Route STATUS`. O comando correto deve reutilizar gate/delegação e produzir recibo, não criar outro orquestrador.
- `K:\docs\BRAIN\Excalidraw` existe como pasta no repositório VPS, com dois arquivos `.excalidraw.md` pequenos observados em leitura de diretório. **Nenhum foi identificado como o Fluxo Mestre de 41 etapas**.

## C. Memória e aprendizado

- `docs/BRAIN/07-APRENDIZADOS-MEMORIAS` já existe para registrar contexto; `docs/CONSCIENCIA/APRENDIZADOS.md` e manifesto NeuroLink mantêm o histórico canônico, que não deve ser reformatado ou sobrescrito.
- O plugin Obsidian Grafo Vivo registra eventos de criação/modificação de notas, com sincronização condicionada à configuração e prova. **Uma nota editada não é automaticamente um aprendizado validado**.
- Decisão do ADMIN: interação gera rastro; prova + contraprova gera candidato de aprendizado; writer do owner existente promove quando gates PASS; GitHub preserva conteúdo aprovado e recebe SHA/readback. Segredos e conteúdo privado não são publicados.
- As regras de comunicação incluem **Gramática de Ensino Operacional Fiel** como nome de estilo de explicação sugerido e aprovado na conversa, **não renomeação do arquivo canônico**. Sempre incluir **nível de conformidade** por escopo, sem inventar porcentagens; 98,9% foi **satisfação declarada pelo ADMIN**, não índice técnico do runtime.

## D. Acervo visual preservado e duplicações a contraprovar

- Cartazes canônicos com `README.md` e `manifest.json` já existem em `docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS`. O acervo ampliado inclui `BIBLIOTECA_CHATGPT`, `FORJA-VIVA`, `RECIBO` e hashes; reutilizar antes de criar outra galeria.
- Existe também `docs/BRAIN/08-ARTEFATOS-VISUAIS/01-CARTAZES-CANONICOS` contendo quatro WebP idênticos por SHA de blob às versões da pasta sem prefixo, mas **README e manifesto diferentes**. `DUPLICATE_CANDIDATE`, sem exclusão nem movimento antes de validar consumidores.
- `CENTRALDARK — Fluxo Mestre em Linha Única.pdf` (1 página panorâmica) e sua prévia `.png` foram anexados. Contêm as 9 fases resumidas e a sequência das 41 etapas; **não constituem arquivo-fonte editável Excalidraw**.
- A mesma obra deve ser aberta/consumida pelo **Obsidian, Grafo Vivo, Instinto Superior e FigJam original** por links e projeções, sem criar segunda verdade.

## E. Última reconciliação conhecida — snapshots, não estado eterno

- `main` GitHub medido em `d277495d1d4fed696b9fed66cfd7bdff86371a0d`.
- PRs observadas abertas: `#1793` (API/MCP/HUD), `#1804` (Hermes typed core) e `#1810` (Papagaio Fiel). Não editar simultaneamente seus owners sem reconciliação.
- Checkout VPS medido em `910c2d67f` com alterações locais. Não fazer reset, stash, checkout destrutivo ou overwrite.
- O Fluxo Mestre do PDF contém 41 etapas e 9 fases resumidas, não substitui o board FigJam original.

## F. Critérios para promoção e continuidade

1. Localizar o arquivo-fonte editável original do Excalidraw; conservar o PDF/PNG bytes e SHA.
2. Revalidar o `MAIN_CURRENT`, o owner e os writers ativos antes de promover notas ao Git.
3. Quando a rota Casa estiver viva, espelhar usando sync Obsidian existente com hash e prova de abertura.
4. Unir HUD ao cockpit por integração de capacidades; manter código e execução dos motores nos owners existentes.
5. Usar `scripts/agent-call.mjs` / MCP/Hermes autorizado para delegar, e exigir recibo (`intent_id`, `event_id`, `owner`, `sha`, `evidence`, `state`, `next_cursor`).
6. `FIXED_POINT` só no escopo comprovado; nenhum porcentual global inventado.

**NEXT_CURSOR:** `RECONCILIAR_WRITERS → REGISTRAR_EXCALIDRAW_ORIGINAL → LINKAR_NOTA_PDF_PNG → CASA_READBACK → DELEGACAO_HERMES_RECEIPT → GRAFO_HUD`. 