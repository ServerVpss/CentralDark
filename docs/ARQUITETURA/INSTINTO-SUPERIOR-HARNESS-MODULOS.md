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

<a id="rota-casa-jea-winrm"></a>
## Rota Casa JEA via Tailscale (WinRM 5985) — Hermes skill devops/centraldark-casa-jea

<!--
#OBSERVACOES# | CENTRALDARK.HARNESS.CASA_JEA
@code_ref: apps/instinto-superior/config/harness-module-registry.json
@code_ref: apps/instinto-superior/src/components/central/HarnessModuleRegistry.tsx
@code_ref: scripts/lupa/validar-harness-casa-jea.mjs
@code_ref: scripts/lupa/validar-harness-casa-jea.test.mjs
@last_updated: 2026-10-23T03:05:00.000Z
-->

**Dado estruturado (fonte única):** `apps/instinto-superior/config/harness-module-registry.json` → módulo `casa-jea-winrm`. O card do Cockpit (`HarnessModuleRegistry.tsx`) só projeta esse registro. Este documento não duplica valores.

| Capacidade | Estado | Prova (22/10/2026, BRT) |
|---|---|---|
| VER | 🟢🔒 PROVEN | T1 `ps` 438 processos · T2 `tcp` 79 portas em escuta |
| PEDIR / negação | 🟢🔒 PROVEN | T4–T6 "is not recognized" · T7 PID 4 e T8 Spooler → `NEGADO_ALLOWLIST` |
| MEXER | 🟢🔒 PROVEN | stop PID 17056 (Cockpit 8080) ok=True às 23:37:33 · porta caiu em menos de 1 s · religado pela receita oficial com HTTP 200 às 23:37:53 |
| allow | 🟢🔒 PROVEN | T3 devolve o JSON da allowlist (antes respondia `None`) |

- **Auditoria:** `/var/log/centraldark/casa-jea.jsonl` (VPS) e `C:\CentralDark\audit\jea\` (Casa, 25 transcrições no fechamento). Vazamento medido: 0.
- **Allowlist:** `C:\CentralDark\harness\allowlist.json`. O CHEFE edita; vale na próxima chamada.
- **Credencial:** só o caminho `/etc/centraldark/secrets/casa-jea.env`. O conteúdo nunca entra em repositório, log ou chat.
- **Receita oficial para religar o Cockpit 8080:** `Start-ScheduledTask -TaskName 'CentralDark-Cockpit-8080'`. A tarefa roda como SYSTEM o `K:\scripts\casa\instinto-cockpit-autostart.ps1`, que sobe o Vite em `K:\apps\instinto-superior` na porta 8080. A tarefa também é watchdog de 1 minuto.
- **Sensor:** `node scripts/lupa/validar-harness-casa-jea.mjs` valida o PROVEN. Com `--live <json>`, classifica a sessão ao vivo: rota desligada vira ⚠️ com a causa, e o PROVEN continua 🔒.
- **Rollback:** está no campo `rollback` do registro.
- **Rotas medidas e descartadas:** estão no campo `measured_routes` do registro (Serve 9100/3000 sem destino, "SSH reverso" que na verdade é SOCKS, 8080 é Vite dev, RDC na direção errada, RDP só tela).

<a id="rota-terminal-visivel-sol-casa"></a>
## Rota Terminal visível SOL → Casa (Desktop Commander + conhost)

**Dado estruturado:** `harness-module-registry.json` → módulo `terminal-visivel-sol-casa`. Provado em 22/10/2026 23:47 BRT, só leitura, visível e executando (🟢🔒). O pedido do CHEFE pelo celular (Dispatch) virou uma tarefa Cowork; o Desktop Commander abriu um PowerShell **visível** na sessão 1 com título "SOL -> Casa", e a saída foi `hostname = SEGREDO` e `whoami = segredo\administrador`.

- **Receita oficial:** `Start-Process conhost.exe "powershell.exe -NoExit -Command <script>"`.
- **Anti-receita:** `Start-Process powershell`. No Windows 11 vira aba do Windows Terminal já aberto, em vez de janela própria.
- **Limite:** o computer-use não digita em terminais nem IDEs (tier click). A rota é Desktop Commander + conhost, não teclado.
- **Evidência:** foto confirmada pelo CHEFE; o screenshot fica na sessão Cowork e não é versionado. Escrita por essa rota: UNKNOWN.

## D006 - 2026-10-20 | Configuracoes do Harness: inventario incremental e PREVIA

**INTENT_ID:** CENTRALDARK-HARNESS-CONFIGURACOES-INVENTARIO-PREVIEW-20261020.
**CHEFE:** primeiro visualizar todas as opcoes e pendencias; escolher/ligar motor e a ULTIMA etapa. Uma unica casca, dono por arquivo. Casa `K:\` antes de GitHub/main e VPS.
**FRONTEIRA:** o menu `config-harness` ja existe localmente em `apps/instinto-superior/src/components/central/CockpitShell.tsx` com cor delimitada `#d0e8f5`. Seus links nao significam parametrizacao, persistencia ou E2E. Dados ilustrativos sempre exibidos como **PREVIA - FALTA IMPLEMENTAR**; nenhuma alteracao real ao motor, GPU, credencial ou aplicacao.

### Inventario de setores e owners a reutilizar

| Setor pretendido | Owner existente / fonte canonica | Estado comprovado ou lacuna | Exemplos EXCLUSIVAMENTE de PREVIA |
| --- | --- | --- | --- |
| Geral / inicio | `CockpitShell.tsx`, `SistemaCentralDark.tsx` | UI existente; preferencias persistentes UNKNOWN | Iniciar no login: DESLIGADO (PREVIA) |
| Modelos e motores | `config/harness-module-registry.json`, Design Center, Jan externo | Catalogo em source; binding e modelo ativo por runtime UNKNOWN | Jan 4B; temperatura 0,7; Top P 0,8; Top K 20; GPU layers AUTO (PREVIA) |
| Conversas / Hermes / Jarvis | `apps/modulos/HERMES-CORE`, `HermesPet.tsx` | Interfaces presentes; controles persistentes por sessao UNKNOWN | Historico ligado; selecao Hermes (PREVIA) |
| Ferramentas / MCP / Tool Calls | `apps/modulos/mcp/src/audit-logger.js`, Admin, Observabilidade | Auditar eventos existente; payload por clique e ligacao cliente externo UNKNOWN | Mostrar PID, call ID, duracao, solicitar/resposta sanitizados (PREVIA quando nao medidos) |
| Voz / audio / multimodal | `JarvisParticleOrb.tsx`, Screenpipe, navegadores | Screenpipe audio_stalled nao significa Jarvis quebrado; permissao de microfone exige gesto | Entrada default, voz de saida, foto, OCR (PREVIA) |
| Aparencia / acessibilidade / idioma | `DesignCenter.tsx`, cascas existentes | Tema e cor visuais existentes; roundtrip de preferencias UNKNOWN | Dark, contraste Sistema, cor #d0e8f5, fonte media (PREVIA onde nao salvo) |
| Notificacoes / sino | `CentralNotificacoes.tsx`, `notifications_log` | UI existe, entrega real requer recibo de evento | Ativar alertas, agrupar por missao (PREVIA) |
| Conexoes / Tailscale / Casa-VPS | `cockpit.functions.ts`, `StatusPanel.tsx` | Medicoes parciais com semantica UNKNOWN != PASS | Reconnect remoto, alertas da malha (PREVIA) |
| Hardware / RX 580 / processos | `SistemaCentralDark.tsx`, sensor Windows, PR #1850 | GPU detectada nao prova offload; controles de processo nao comprovados | GPU layers AUTO; 8GB VRAM declarada (PREVIA) |
| Seguranca / conta / credenciais | Admin autenticado; owners de secrets existentes | Preservar restricoes; nunca renderizar segredo nem simular conta | Sessao ativa / acesso admin (PREVIA/UNKNOWN sem sessao) |
| Armazenamento / backups | `SyncCenter.tsx`, Minha Oficina, receipts | Backups/sync exigem readback; nenhuma acao automatica por abrir menu | Limite 8192 MiB, guardar historico (PREVIA) |
| Pendencias / memorias / aprendizado | `docs/PENDENCIAS.md`, `docs/BRAIN/04-DECISOES/01-PENDENCIAS.md`, `docs/CAPACIDADES/pendencias-painel-centraldark.md` | Documentos historicos nao sao runtime; falta associar card a owner + evidencia | Aberta / em andamento / bloqueada / resolvida (PREVIA) |
| Horario / operacoes / logs | `central-horario/frontend.ts` e central-horario cross-platform | Owner de formatacao real. Relogio compartilhado de segundos implementado em source; consumidor UI ainda pendente | BRT HH:mm:ss em tempo real (ligar apos ACK UI) |
| Plugins / extensoes / Builder | `DesignCenter.tsx`, `skills/centraldark-delegacao/SKILL.md`, PR #1874 | Catalogo/delegacao existem em source; ACK por sessoes desconhecido | Plugin ativo, permissao, instalacao (PREVIA) |

**Fontes consultadas:** `docs/ARQUITETURA/INSTINTO-SUPERIOR-HARNESS-MODULOS.md` D005, `docs/PENDENCIAS.md`, `docs/BRAIN/04-DECISOES/01-PENDENCIAS.md`, `docs/CAPACIDADES/pendencias-painel-centraldark.md`, `docs/CONSCIENCIA/07-PENDENCIAS-E-HORARIO.md`, conversas/prints recentes (evidencia visual, nao state runtime).

### Relogio compartilhado de um unico produtor
- Owner ativo `central-horario/frontend.ts`: `inscreverRelogioCentralDark` / `lerRelogioCentralDarkMs` / `lerRelogioCentralDarkSSR`. Um timeout alinhado ao proximo segundo e compartilhado entre ouvintes; liberado apos o ultimo unsubscribe. Formatacao `formatBrasiliaTime`, fuso `America/Sao_Paulo` e localidade `pt-BR`.
- Cliente React usa `useSyncExternalStore(inscreverRelogioCentralDark, lerRelogioCentralDarkMs, lerRelogioCentralDarkSSR)`, depois `formatBrasiliaTime(new Date(ms))` se `ms > 0`; sem setInterval por card. Tempo atual e timestamp da ultima medicao sao campos DIFERENTES.
- Prova 20/10: dois assinantes receberam ticks sincronizados por 1s, timer limpo apos ultimo unsubscribe, formato BRT PASS. **Hidrata??o/UI nao executadas neste recibo**.

### Handoff sem conflito
- PR #1874 comment #6285216552: pedido enviado ao escritor da UI para o unico trecho `config-harness` do `CockpitShell.tsx`. **AWAIT_ACK**; comentario nao equivale a colaboracao ativa.
- SOL escrita restrita a `central-horario/frontend.ts` e a este documento. Nao alterar `CockpitShell.tsx` durante a posse UI. Um writer por arquivo; nao criar segundo relogio, HUD, fila ou agente.
- **NEXT_CURSOR:** `PR1874_HANDOFF_ACK -> CONFIG_PREVIA_UI -> CLOCK_CONSUMER -> 8080_BROWSER_READBACK -> GATES -> MAIN -> VPS_DEPOIS`.
