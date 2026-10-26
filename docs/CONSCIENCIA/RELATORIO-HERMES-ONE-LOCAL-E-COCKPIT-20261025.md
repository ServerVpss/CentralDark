# Hermes ONE local — Casa K: e superfícies distintas
Data: 2026-10-25
Owner: CentralDark Casa K: / apps/instinto-superior / apps/modulos/HERMES-CORE
@code_ref: apps/instinto-superior/src/components/central/CockpitShell.tsx; apps/instinto-superior/src/components/central/HermesOneWebLocal.tsx; scripts/casa/Hermes-One-Local.ps1; apps/instinto-superior/src/lib/modulos-cockpit.ts
@last_updated: 2026-10-25T12:00:00Z
@estado: LOCAL_WEB_PREVIEW; @pendente: Office 3D web, autenticação fim a fim, isolamento do runtime K: e ingress VPS; @next_cursor: adapter web autorizado do Hermes ONE Desktop

## Decisão de módulo
Duas entradas independentes no mesmo Cockpit:
- CentralDark Estúdio: AionUI existente; modulações internas e tema preservados.
- Hermes ONE: botão com SVG original de `K:\k\hermes-desktop-src\src\renderer\src\assets\hermes-one.svg` reutilizado como `public/brands/hermes-one.svg`. Abre a aba Hermes com painel de web nativo, sem AionUI. O Hermes Core da CentralDark permanece como aba interna independente.
- Minha conta > Configurações > Sistema > Módulos: controles locais de VISIBILIDADE / lazy mounting `ativo|sob-demanda|desativado` em localStorage (não gerencia processos físicos). Não alegar que alternar este controle interrompeu a VPS.

## Fontes comprovadas
1. Na Casa `SEGREDO`: Vite Cockpit TCP 8080 = HTTP 200, HMR `/@vite/client` = HTTP 200; Hermes Gateway Python instalado em `%LOCALAPPDATA%\hermes\hermes-agent` atende 8644 e status 9900; não criar outro gateway.
2. `hermes dashboard --help`: web oficial local `127.0.0.1:9119`, flag `--skip-build`, CLI `--status`, `--stop`, `--no-open`. Server principal com UI web em `hermes_cli/web_dist` instalado. UI oficial HTML retorna 200 e título `Hermes Agent - Dashboard`, favicon 200; não são a mesma interface do renderer Electron `hermes-one`.
3. `K:\scripts\casa\Hermes-One-Local.ps1` é um launcher idempotente `-Action status|start|stop`; valida owner `K:\apps\modulos\HERMES-CORE`, escuta somente loopback em 9119, grava stdout/stderr em `K:\apps\modulos\HERMES-CORE\.local-web`. **O binário Python e os perfis executados ainda residem no AppData; apenas launcher e logs estão em K**. NÃO apresentar como migração completa nem mover perfis de autenticação sem teste.
4. Dashboard web local ficou disponível na Casa e responde HTTP 200; `/api/status` também retornou 200 com `gateway_running=true`, mas `gateway_state=degraded` (não é GREEN do runtime completo).
5. Renderer do Hermes ONE Desktop usa `window.hermesAPI` do preload Electron e seus componentes (Office 3D, modelos, Kanban, provedores). Ele não é utilizável diretamente dentro de iframe web sem um adaptador nativo autorizado; não publicar workaround inseguro.
6. `HermesOneWebLocal.tsx` só monta iframe quando Cockpit autenticado e a origem do navegador for `localhost` ou `127.0.0.1`; recusa VPS e domínio público enquanto não houver ingress com autenticação. A prova favicon é prova limitada de serviço, NÃO de sessão/autorização, gateway HEALTH ou Office 3D.

## Segurança e uso
- Apenas localhost. Não fazer bind 0.0.0.0, expor porta 9119 publicamente, copiar chaves dos perfis, nem liberar start genérico via navegador.
- Casa Commander 9101 é bridge MCP autenticada e possui somente rota POST /tool com bearer e chave de escrita própria; NÃO é uma API pública de ciclo de vida de módulos. Não conectar o botão a /tool com token no browser.
- O launcher `-Action stop` deve ser usado somente depois de validar a propriedade dos listeners e verificar que não há outras instâncias Hermes Web. A CLI stop atual pode abranger várias instâncias — não automatizar até implementar parada por owner segura.
- Para usar manualmente o dashboard: PowerShell `K:\scripts\casa\Hermes-One-Local.ps1 -Action start`; verificar `-Action status`; navegar ao Cockpit local e clicar Hermes ONE. Não implica build Electron nem instala Go.
- Docker/sandbox e servidor Go para a VPS são decisões futuras. Go.exe está disponível na Casa, mas o serviço identificado é Python; não existe prova de servidor Go Hermes nativo canônico já iniciado em K.

## Gates e resultado
- PASS: processo único em 9119, Vite 8080 intacto, Gateway 8644 intacto, dashboard HTTP 200, favicon e asset 200, componentes TS sintáticos, PS parse PASS.
- PARCIAL: iframe UI web local iniciado e pronto para conferir visualmente no browser, estados de preferências locais; runtime web continua residente até stop manual.
- NOT_PROVEN: Office 3D do Hermes ONE Electron web, HMR do renderer Electron dentro do Cockpit, start/stop real por botão autenticado, HTTP da VPS, gateway status verde, performance/sandbox, integração do gateway via VPS e usuário autenticado no iframe.

META-LUPA: `UNKNOWN != PASS`. Preservar trabalho paralelo Claude e não implantar alterações no VPS nesta rodada.
