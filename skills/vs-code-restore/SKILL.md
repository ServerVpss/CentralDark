---
name: vs-code-restore
description: Restaura a bancada do workspace CentralDark no VS Code (terminais, abas e checagem de extensoes) a partir do mapa salvo, sem depender do Claude. Use ao abrir o workspace CentralDark ou quando quiser reconstruir a bancada.
version: 0.1.0
metadata: {"status":"em_construcao","mapa":"workspace-map-20261014.json","compilado":false,"testado_no_vscode":false}
---

# VS Code Restore: CentralDark

Plugin local do VS Code que reconstroi a bancada do workspace CentralDark quando voce abre o programa. Roda sozinho, sem Claude.

## O que restaura

- 4 terminais PowerShell 7 no diretorio `K:\`: Hermes 1, Hermes 2, Claude Code e um terminal vazio.
- Abas de editor que tiverem URL ou arquivo no mapa. Hoje o mapa tem 17 entradas, mas nenhuma com URL preenchida, entao nenhuma aba e reaberta ainda.
- Checagem das 20 extensoes do mapa, avisando as que faltam. Nao instala nada.

## O que NAO restaura (limites da API do VS Code)

- Posicao das janelas em cada monitor. A extensao nao consegue mover janelas do sistema.
- Abas de outras janelas do VS Code: tudo abre no grupo ativo.
- Sessoes de IA que ja estavam em andamento: o plugin abre novas.

## Arquivos

- `SKILL.md`: esta documentacao.
- `workspace-map-20261014.json`: mapa capturado em 14/10/2026. E a fonte da verdade do plugin.
- `package.json`: manifesto, comando e configuracoes.
- `tsconfig.json`: compilacao.
- `src/extension.ts`: codigo do plugin.

## Configuracoes

- `centraldark.restore.onOpen` (padrao `false`): restaura ao abrir o VS Code.
- `centraldark.restore.startAgents` (padrao `false`): executa `hermes chat` e `claude` nos terminais. Desligue se nao quiser abrir agentes automaticamente.

## Comando manual

- `CentralDark: Restaurar bancada`, pela paleta de comandos (`Ctrl+Shift+P`).

## Como compilar

1. `cd K:\skills\vs-code-restore`
2. `npm install`
3. `npm run compile`

Para instalar localmente, gerar o pacote com `npx @vscode/vsce package` e depois instalar o `.vsix` no VS Code.

## Estado atual (medido)

- Mapa: **parcial**. Capturadas 17 entradas em Editores Abertos. Faltam: rolar a lista, Saida, Debug e Extensoes, e as URLs reais das abas web.
- Plugin: codigo escrito, **nao compilado e nao testado** dentro do VS Code.
- Git: arquivos criados so na Casa, **sem commit e sem push**.

## Manutencao

Quando o layout mudar, recapturar e atualizar o `workspace-map-20261014.json`. Nao mexer no codigo para trocar abas ou terminais.

## 🪬 Mapeamento contínuo da UI — mesmo owner

INTENÇÃO: mapear o VS Code e aprender a operar os controles reais sem perder
identidade das janelas, ações, permissões, evidências nem o trabalho do CHEFE.
Não cria segundo plugin, nova skill, scheduler, memória ou roteador. Reutiliza
a extensão centraldark-vscode-restore e o Desktop Commander da Casa.

### Sensores complementares (não intercambiáveis)

1. Windows UIAutomation: tools/map-vscode-ui.ps1 inventaria janelas VS Code,
   MenuItem, Button, TabItem, ComboBox e Hyperlink, com nomes acessíveis,
   automation_id, enabled e offscreen. Filtra URLs, paths e termos sensíveis.
   Não move foco, não clica nem lê conteúdo de chats/documentos.
2. Extensão nativa VS Code: comando "CentralDark: Mapear interface (read-only)"
   observa comandos, terminais com PID, abas, extensões e pastas do workspace
   pela API oficial. Grava vscode-native-map.json no armazenamento persistente
   da extensão e abre o resultado. Não dispara comandos do inventário.
3. Desktop Commander: atua no Windows mediante reidentificação da janela
   e do controle imediatamente antes da ação; coordenadas antigas não valem.

### Como medir novamente

powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'K:\skills\vs-code-restore\tools\map-vscode-ui.ps1'

O snapshot UIAutomation é salvo atomicamente em
skills/vs-code-restore/ui-accessibility-20261014.json, no mesmo owner.
Cada medição substitui apenas esse snapshot de observação. Preservar
workspace-map-20261014.json com as escolhas e referências anteriores.
No VS Code, Ctrl+Shift+P e "CentralDark: Mapear interface (read-only)"
atualiza o snapshot nativo depois de instalar/ativar a extensão.

### Protocolo de aprendizado por botão

TARGET_WINDOW → ROLE+LABEL+AUTOMATION_ID → BEFORE →
CHECK_SCOPE/AUTHORITY → INVOKE_ONCE → AFTER → COMPARE →
PASS|FAIL|UNKNOWN → RECEIPT → NEXT_CURSOR.

- OBSERVED significa que existe, não que foi testado ou funciona.
- Não misturar controles de janelas, terminais, extensões e perfis diferentes.
- Começar por comandos reversíveis: Explorador, Terminal, Paleta, layout.
- Delete, Discard, Reset, Push, Merge, Deploy, instalar plugin, autenticar,
  mudar permissões ou executar comando desconhecido exige escopo próprio.
- Se um elemento mudar ou desaparecer, remapear e retornar a UNKNOWN.
- Guardar fonte, janela, role, ID, efeito, hora, owner/SHA e recibo existente.
- API VS Code não expõe literalmente todos os botões do Electron; UIAutomation
  cobre os visíveis ao sensor, menus fechados ficam UNKNOWN.

### Contraprova inicial — 2026-10-14

- Casa SEGREDO: Desktop Commander acessível pela conta CENTRALDARK.
- 3 janelas VS Code inventariadas via UIAutomation.
- 118 + 106 + 95 = 319 controles deduplicados registrados, ainda não testados.
- Janela superior e Terminal pwsh já tiveram foco confirmado em observação anterior.
- TypeScript da extensão: npm run compile, TSC_EXIT=0.
- Comando instalado e todos os botões testados: UNKNOWN.
- Não apagar artefatos locais existentes nem lançar outros executores.
