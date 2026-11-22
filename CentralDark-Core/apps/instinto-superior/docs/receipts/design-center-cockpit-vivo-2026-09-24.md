# Receipt — Design Center e Cockpit vivo

Data da medição: 2026-09-24

## PASS

- Design Center incorporado ao `CockpitShell`; nenhum novo app, backend ou motor Hermes.
- Tokens, biblioteca dos seis estados, previews das três superfícies, comparação e rollback local de preview.
- Painel único controla pele, ação, quadro, direção e velocidade do mesmo Hermes flutuante.
- Sync Center mostra main `6fce1850bce9889955b6a1a803815730a1d18ef0`, VPS `ec52fad88be4e06421ab5ddb075668d2a7c14064`, delta 1 e quatro commits recentes.
- ZIP Windows publicado com 16 ações, 256 quadros, dois destinos reais, backup e rollback executável.
- ZIP: 47.307.928 bytes; SHA-256 `d2777818b2fc5dfb4374d2bbcba2063eaee19fccbc4c44b99fc4adef0a8258de`; integridade `testzip` OK; 17 entradas.
- Playwright em 1280×1800, 390×844 e `prefers-reduced-motion: reduce`: zero erros de console e tabs sem sobreposição.
- Typecheck e build concluídos sem erro.

## AUTH_REQUIRED

- Gmail: OAuth humano ausente; não bloqueou as demais capacidades.
- Conector GitHub Lovable separado: OAuth não usado; medição veio da CentralDark.

## FAIL

- Servidor publicado: VPS um commit atrás; deploy medido com JSON PM2 malformado.

## UNKNOWN

- Execução física do instalador em outro computador.
- Área autenticada: o projeto não possui usuário Supabase para cunhar sessão de prova.

## Preservado

- Paleta, tipografia, desenho, cores, aura e cajado do Hermes Instinto Superior.
- Nove ações canônicas e sete posturas adicionais, todas com 16 quadros.
- Três peles de memória: Forja, Celestial e Ascensão.

## 15/10/2026 — Galeria ZENDRIVE CLI (delta no mesmo Design Center)

**Intenção do CHEFE:** guardar o ZENDRIVE CLI na galeria de extensões do Instinto Superior, dentro do cockpit/builder, sem criar outro produto, extensão ou runtime.

**Owners reutilizados:** UI `apps/instinto-superior/src/components/central/DesignCenter.tsx`; entrada autenticada `CockpitShell.tsx` → `/_authenticated/sala-controle`; extensão `skills/vs-code-restore`; telemetria `.agents/skills/centraldark-vscode-log-bridge` (PR #1820); coletor `apps/modulos/mcp/src/log-funnel.js`.

**Implementação em source:** nova aba `Galeria de extensões` no Design Center existente, visível **somente com `autenticado=true`**. Ficha `ZENDRIVE CLI`, versão `centraldark.centraldark-vscode-restore@0.1.1`, comando `CentralDark: ZENDRIVE CLI (terminal existente)`, informação do escopo medido, indicador de estado geral UNKNOWN e links verificáveis para fonte e PR. Não há botão simulado de instalar ou executar remoto. `DesignCenter` recebe `autenticado` de `CockpitShell`, cuja flag vem da sala `/_authenticated/sala-controle` após gate de administrador já existente.

**Commits:** `a743b66c3f21eff887c85a0a0acfb6c5d4abf9eb` (ficha da galeria) e `35165b57d4b0a72761fe8b171450248718ba5eba` (passagem do gate). Artefato de extensão instalado na Casa, mas **não distribuído como instalador no cockpit**.

**Provas separadas:** instalação Casa VS Code 0.1.1 e eventos reais `cli_focus`, `shell_start`, `shell_end exit=ok` entregues ao log-funnel via Tailscale/VPS até offset `3028322`: PASS na sessão medida. Disponibilidade da ficha **no source do cockpit**: PASS; build/typecheck com o novo delta, login humano no cockpit, deploy web e apresentação visual em navegador: **NOT_MEASURED**. Provider ChatGPT Zendrive ao vivo: **NOT_PROVEN** (Omni 8099 e CDP Casa 9222 ausentes na medição).

**Fixed point escopado:** galeria persistida em `main`, vinculada aos owners existentes. `SOURCE_COMMITTED != BUILT != DEPLOYED != UI_PROVEN`. Não promover todos a verde por transição de source.
