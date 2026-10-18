# Instinto Superior · Harness de módulos e loop direcional

## Decisão canônica

O Instinto Superior é a superfície visual. O CentralDark Harness é o orquestrador. Cada motor permanece no próprio owner, processo e transporte; o cockpit apenas resolve intenção, mostra capacidade e abre a rota original quando ela estiver comprovada.

Não existe segundo cockpit, clone de runtime, migração forçada ou arquitetura paralela.

## Loop obrigatório

`intenção → owner → transporte → execução → readback → receipt → CI`

Cada entrada deve carregar `owner`, `transport`, `scope`, `session` e `evidence`. Falha ou ausência de prova retorna `UNKNOWN`; nunca é promovida a `PASS`.

## Módulos

- DeepSeek: owner existente do harness.
- Hermes: owner `apps/modulos/HERMES-CORE`, transporte MCP/RDC.
- Claude Code: cliente externo/VS Code; sessão viva ainda requer prova.
- ChatGPT/Cowork: cliente externo/Work; rota viva ainda requer prova.
- VS Code: extensão/host existente; não recebe uma segunda extensão concorrente.
- Figma: connector MCP existente.
- Obsidian: Grafo Vivo existente; leitura e escrita dependem de readback do owner.

## Ciclo de branches, PR e CI

A branch do owner recebe o delta. O PR equivalente é a fila de revisão. O CI é disparado pelo commit do PR; somente o readback dos checks fecha o ciclo. Branches separadas não são absorvidas por cópia manual: entram por PR/merge da mesma linhagem.

## Memória persistente

Este arquivo é o registro técnico versionado. A publicação no Obsidian/Grafo Vivo deve ser confirmada pelo sensor do owner; enquanto `obsidian_live_graph_status` falhar, o estado permanece `UNKNOWN` e não é declarado sincronizado.

## Gate de implementação

A integração página por página/arquivo por arquivo só pode ser marcada 100% após inventário com origem, owner, hash/versão, consumidor e prova de runtime para cada item. O catálogo não substitui o inventário.

## D005 — 2026-10-18 · Uma intenção: Harness CentralDark / Instinto Superior / Desktop / PWA / OS

**INTENT_ID:** CENTRALDARK-HARNESS-ONE-CASCA-MULTI-MOTORES-20261018.
**GOAL:** produto = Harness CentralDark; identidade = Instinto Superior; slogan = "Movimentos inimagináveis na palma da sua mão". Uma casca, vários motores nativos, acesso em diferentes superfícies. Windows/Linux desktop Electron+Chromium, Mini-Harness PWA leve e evolução futura CentralDark-OS/openKylin são materializações da mesma intenção, não três cérebros.
**PR equivalente:** [#1832](https://github.com/ServerVpss/CentralDark/pull/1832), merged; não reabrir/criar PR para repetir sua função. Registro primário é este owner versionado na main.
**OWNER:** doc técnico atual; visual = apps/instinto-superior; desktop/Forja = apps/modulos/Bolt/source; Hermes = apps/modulos/HERMES-CORE; contratos de implantação, instalador, grafo e PWA permanecem em seus owners próprios.
**SOURCE_MAIN_SHA anterior ao registro:** 791bafe6199540c2a3aa4f9d532ade8c57669b54 (leitura via GitHub). O presente registro é documental, não deploy/execução.

### Lembranças do CHEFE e aprendizados a preservar

- **Casca única:** os motores oficiais Claude Code, Claude Desktop, ChatGPT/Work/Codex, VS Code, Jan/llama.cpp, DeepSeek, Obsidian, Hermes, Docker e outros permanecem em seus processos/owners; Instinto Superior gerencia a experiência sem copiar pesos, segredos ou motores proprietários. Atualizações das dependências usam as rotas oficiais quando aplicáveis; empacotar binários terceiros depende das condições de licença, compatibilidade, versão e hash.
- **Ícones e janelas:** clicar abre ou focaliza uma instância existente; minimizar recolhe ao dock; restaurar, destacar, mover, redimensionar, lado a lado/mosaico e múltiplas sessões devem reutilizar capacidades já existentes. Demonstrativo Bridher v1.3 foi mencionado em conversa anterior com UMA/DIVIDIR/3 PAINÉIS e abas Hermes/Claude/VS Code/Codex; arquivo/execução atual e incorporação nativa NÃO COMPROVADOS.
- **Chromium:** o Electron já contém Chromium para o renderer. Chrome for Testing/Playwright permanece navegador de teste/automação distinto; não reinstalá-lo como pré-requisito inventado do Electron. Página web compatível pode ser exibida pelo renderer; programa Windows/Linux pode ter sua janela controlada pelo sistema sem garantir incorporação literal ao DOM; CLI usa terminal nativo PowerShell 7 no Windows ou shell próprio do Linux. Respeitar sessões oficiais e limites de iframe/CSP.
- **Builder completo e personalizado:** detecção do SO, versões, dependências e perfis; opção FULL ou PERSONALIZADA para escolher módulos originais. FULL não significa iniciar todos simultaneamente. Por módulo, controles pretendidos: abrir/focar, ligar/parar/reiniciar, autostart, pausa de trabalho se suportada, estado CPU/RAM/GPU, versão oficial, tamanho de download quando informado e atualizar pelo instalador do owner. Instalação não comprova integração/saúde.
- **AppData:** desejo de agrupar catálogo/perfis sob Harness CentralDark, mas não mover à força diretórios Roaming/Local de programas sem opção oficial e readback. Referenciar instalações originais quando perfis não forem portáveis.
- **Hardware:** telas do CHEFE em 18/10 mostram Jan/monitor reconhecendo AMD Radeon RX 580 (8GB VRAM) em uma superfície e outra superfície dizendo nenhuma GPU detectada. Divergência deve virar teste discriminante de driver/backend/aceleração, não PASS baseado em texto. Modos leves e inicialização sob demanda atendem PCs modestos.
- **PWA:** Mini-Harness mantém identidade e cockpit, com tarefas pesadas executadas em Casa/host autenticado quando requerem recursos nativos. Não alegar que navegador móvel executa CLIs nativas; dados privados/admin não são cacheados offline.
- **Linux próprio:** CentralDark-OS é fase futura do owner já existente sobre openKylin; não declarar kernel próprio pronto. Reusar renderer, contratos, UI e catálogos.
- **Memória/Obsidian:** GitHub/main + recibos canônicos preservam aprendizagens, estado, origem e NEXT_CURSOR; Obsidian/Grafo é projeção/capacidade subordinada. Âncoras velhas apontam para novas sem apagar história.
- **Separar fato de objetivo:** screenshots provam visualização de janelas e interfaces, não que o docking interprocesso já está entregue; source presente não é sessão viva; ganho "1000x" é expectativa não medida.

### Owners, estado de source e frentes já existentes

| Cone | Fonte e PR equivalente | Prova / lacuna |
| --- | --- | --- |
| Harness/catálogo | apps/instinto-superior/config/harness-module-registry.json; #1832 | Catálogo em source; roundtrip por botão/instância ainda UNKNOWN. |
| Janela Electron | apps/modulos/Bolt/source/electron/main/ui/window.ts | BrowserWindow e widget flutuante em source; incorporação de aplicativo externo UNKNOWN. |
| Installer Desktop | apps/modulos/Bolt/source/electron-builder.yml e resources/runtime/manifest.json | Electron/NSIS e runtime manifest presentes; manifesto declara user_machine_package_install=false e hermes.bundle_status=UNKNOWN; FULL multi-motores ainda pendente. |
| Installer infraestrutura | scripts/installer/full-package.manifest.json | Contrato de infraestrutura existente, não seletor completo Windows de todos os apps. |
| PWA leve | [#1840](https://github.com/ServerVpss/CentralDark/pull/1840); apps/instinto-superior | Source de PWA parcial; iOS/offline/login/instalação E2E não comprovados. |
| PID e processos | [#1850](https://github.com/ServerVpss/CentralDark/pull/1850) | Painel de processos em PR; controle Casa com sensor vivo UNKNOWN. |
| AionUi/Chromium shell | [#1748](https://github.com/ServerVpss/CentralDark/pull/1748) | Protótipo instalado em contexto anterior; integração FULL e paridade de UI UNKNOWN. |
| Hermes+terminais VS Code | [#1851](https://github.com/ServerVpss/CentralDark/pull/1851) | Correção SSH/Linux na PR, instalação/ACK E2E separados. |
| CentralDark-OS | [owner Linux existente](https://github.com/ServerVpss/CentralDark/blob/main/docs/ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/INVENTARIO-KERNEL-PROPRIO.md) | Plano/protótipo, não distribuição completa comprovada. |

### Pendências recuperadas: uma missão, múltiplos owners, um escritor por escopo

- **P01 DOCK/JANELAS:** inventorizar dock/launcher/Janela Electron e os 4 temas do Instinto, vinculando ícone a instância original; provar foco, minimizar/restaurar, divisão e reuso, sem segunda casca.
- **P02 SESSÕES:** Hermes, Claude Code, Codex, VS Code, navegador e Jan: distinguir processo detectado de sessão executável autenticada; exigir identidade + ação autorizada + ACK/readback + receipt.
- **P03 BUILDER:** reconciliar o FULL/THIN do protótipo AionUi com o electron-builder e manifestos existentes; selecionar módulos oficiais por SO, licença, versão, checksum, atualização, desinstalação e perfis.
- **P04 RECURSOS:** ligar/desligar/reiniciar e autostart por módulo com dono/processo comprovados; pausa só pelo mecanismo suportado; reutilizar observabilidade #1850 sem disputar writer.
- **P05 GPU:** comparar sensor Jan vs monitor, detectar GPU/driver/backend e só promover aceleração após teste real; recolher métricas com timestamp.
- **P06 MINI-PWA:** seguir #1840 para instalabilidade e prova iPhone/HTTPS/cache público; UI compartilhada e ponte autenticada para capacidades nativas.
- **P07 CENTRALDARK-OS:** continuar owner openKylin, sem reinventar projeto ou declarar kernel final.
- **P08 MEMÓRIA/PROVA:** ligar catálogo, receipts e Grafo Vivo ao mesmo loop; histórico/documento/captura não vira PASS automaticamente.

**CONVERGÊNCIA:** P01–P08 são facetas de UMA INTENÇÃO. Não abrir nova PR, skill, HUD, gerenciador ou orquestrador concorrente só para registrar a história.
**FIXED_POINT:** registro documental com proveniência no owner existente, sem alterar binários, instaladores, processos, VPS ou hardware.
**NEXT_CURSOR:** identificar o owner efetivo do dock/gestão de instâncias no Electron e comparar com catálogo; escolher a menor lacuna implementável com contraprova; registrar receipt e promover por owner/escritor único.
