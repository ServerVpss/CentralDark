# Primeiro builder registrado no catálogo CentralDark — 1.0.0

**Data da prova:** 25/10/2026, Casa Windows SEGREDO (UTC-03). **Owner:** app existente em apps/modulos/Bolt/source, Skill Mãe centraldark-operational-method. **Missão mãe:** t_911e17ff. **Classificação:** BOUNDED; Concentração, Trovão, Lua e Regeneração → Fixed Point local.

## Marco com evidências reais

- **Builder catalogado:** 1.0.0 (primeira entrada do histórico novo; não afirma ser a primeira compilação de toda a vida do repositório).
- **Source commit:** 90511519b60a6a566a7d3fe8e86170c1a5027cb8; referência histórica [PR #1954](https://github.com/ServerVpss/CentralDark/pull/1954). PR referenciado não equivale a merge/deploy.
- **Clone de prova:** F:\_worktrees\bolt-ai-fix-20261025 (somente leitura neste trabalho); output em apps\modulos\Bolt\source\dist.
- **Instalador:** CentralDark-Setup-1.0.0-x64.exe, 141506702 bytes, SHA256 ad5af9fd50714e76bcc6bb07ab893ec58f9c74dc9ca6ff77a903dfd220bc4be3, timestamp NTFS 25/10/2026 07:37:09 -03.
- **Executável:** win-unpacked\CentralDark.exe, 211032064 bytes, SHA256 81838d3d501f9070bcec318846c63e9a96a84c6947fb62fe81db0f1fe07ed615.
- **Build PASS:** build-logs\build-retry.log conclui BUILD_RC=0; electron-builder gerou NSIS x64.
- **Smoke local PASS:** build-logs\exe-check-report.txt registra janela do teste, PID 15168 parado, stdout "Server build loaded successfully" às 07:46:52; stderr sem matches fatais. Relatório encerra DONE às 07:47:07 -03. Este é o horário do último **smoke validado**, distinto do timestamp de criação do instalador.
- **Avisos remanescentes:** recursos estáticos ausentes, provider externo indisponível e feed de update 404 aparecem nos logs, mas não impediram carregar o servidor. Não promover a ZERO ERROS.
- **Sem prova:** instalar este setup em outra máquina; UI revisada deste PR instalada; serviço em produção; completude do HUD e sidecars. BUILD_PASS != RUNTIME_LOCAL_PASS != INSTALLED_ELSEWHERE != DEPLOYED.

## Único inventário/versionador oficial

- apps/modulos/Bolt/source/resources/build-history.json é o **registro cumulativo de builds que passaram**. É empacotado pela configuração Electron existente (resources/**/*), sem criar outro serviço.
- O Cockpit Desktop existente mostra contagem derivada de entries.length, versão, horário Bahia, histórico, hashes e receita no cartão Builders CentralDark. IPC estreito centraldark:builders:get via preload; web ou runtime sem ledger mostra UNKNOWN, não 0 imaginário.
- Cada build bem-sucedido recebe a próxima **versão patch**: 1.0.0 → 1.0.1 → 1.0.2. A versão de app em package.json só avança após o build local concluído e os arquivos de saída terem hashes novos; em falha, volta ao conteúdo anterior.
- A nova receita scripts/centraldark-rebuild.mjs executa o comando original pnpm centraldark:build:win, registra log, hashes, timestamp de arquivo, commit e status BUILD_PASS_RUNTIME_PENDING. **Não** promove smoke PASS sem teste do executável.
- O botão Rebuild Windows usa IPC centraldark:builders:rebuild. Só dispara após confirmação e origin guard do próprio Electron, workspace local pré-configurado e a receita de código fixa. Não recebe shell command nem path do navegador. Recusa worktree suja e build concorrente; não executa push/merge/deploy.
- Se o checkout for ocupado, definir CENTRALDARK_BUILD_WORKSPACE para o caminho absoluto do módulo apps/modulos/Bolt/source **em uma worktree exclusiva limpa** antes de abrir o Desktop; caso contrário, a receita rejeita a operação. O fallback é K:\apps\modulos\Bolt\source, mas worktree ocupada não pode ser sobrescrita.
- A fonte de verdade é o registro JSON em cada checkout/release; o Cockpit lê primeiro a fonte configurada disponível e depois o ledger empacotado. Para refletir o código novo no aplicativo instalado, é necessário gerar/instalar build contendo o código do painel, o que não ocorreu nesta etapa.

## Receita de reprodução (executar somente em worktree exclusiva e autorizada)

1. Ler o ledger; checar últimas entradas e sha, checkout limpo e sem outro writer.
2. Confirmação humana do clique ou pedido explícito de build, em Windows com Node e pnpm.
3. Definir NODE_ENV=development; executar pnpm install --frozen-lockfile --prod=false para evitar o erro anterior de Husky/prepare por falta de devDependencies.
4. O script grava a próxima versão patch temporariamente no package.json e roda **pnpm centraldark:build:win** (renderer + preload + main + electron-builder NSIS). Não editar lockfile fora do contrato.
5. Somente se exit 0, instalador e exe novos, SHA256 e mtime plausível: fazer append idempotente ao ledger com PASS_BUILD, runtime NOT_PROVEN, deploy NOT_PROVEN; preservar log.
6. Smoke independente: executar o exe com --enable-logging e observar startup e ausência de regressão do renderer; atualizar prova de runtime por processo de validação, não por inferência.
7. PR e gates oficiais preservam a genealogia. Merge, instalação, deploy e saúde em outro host precisam de autorizações e provas próprias.

## Por que esta melhoria

- **Por que fazer:** evitar repetir troubleshooting já resolvido, acompanhar volume e versões de builds reais e recuperar a última receita de sucesso.
- **Por que não construir outro sistema:** o Desktop/Bolt, bridge IPC, Skill Mãe, HUD e Kanban já existem; um segundo painel ou worker teria ownership e histórico divergentes.
- **Por que usar:** artefatos locais e hashes já comprovados, ledger simples empacotado e IPC estreito.
- **Por que modificar:** o Desktop não mostrava builds históricos nem oferecia entrada de rebuild com confirmação/versionamento.
- **O que mudou:** ledger versionado, receita de rebuild, IPC leitura + solicitação, cartão na coluna de status, contrato e testes.
- **Prova da mudança de código:** node --test scripts/centraldark-build-ledger.test.mjs scripts/centraldark-desktop-contract.test.mjs: **16/16 PASS** no checkout isolado; script --verify: count=1 latest=1.0.0. Typecheck/renderer visual no app atualizado ainda devem ser verificados.
- **Contraprova:** nenhum rebuild adicional foi iniciado para gerar o código novo; não contá-lo como Builder 1.0.1. Histórico anterior desconhecido permanece UNKNOWN.
- **NEXT_CURSOR:** comprovar transpile/compilação do delta, abrir PR histórica sem merge; gerar um novo build validado só com worktree exclusiva, inspecionar card real no app instalado e registrar smoke independente.

**Princípio:** um owner, uma receita, um histórico imutável de sucessos; o carimbo Fixed Point é por escopo, não certificação global.
