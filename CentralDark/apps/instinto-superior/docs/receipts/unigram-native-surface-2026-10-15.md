# 🪬 Unigram original como superfície nativa do Instinto Superior — 15/10/2026

**INTENT_ID:** CENTRALDARK-UNIGRAM-ORIGINAL-CASCA-20261015  
**OWNER:** `apps/modulos/Bolt/source` (Electron + preload + cockpit) e `apps/instinto-superior/src/components/central/CockpitShell.tsx` (aba visual)  
**WRITER:** uma branch isolada, sem edição do checkout ocupado da Casa.  
**Regra:** REUSE_BEFORE_CREATE · ONE_WRITER_PER_SCOPE · UNKNOWN != PASS · APPX_PRESENT != APP_CAN_LAUNCH · DISPATCHED != WINDOW_VISIBLE.

## Intenção do CHEFE

Acrescentar **um botão Unigram ao leque** do Instinto Superior que abra o **aplicativo original, completo e separado em sua própria janela**, coordenado pela entrada única CentralDark; não reescrever UI, copiar mensagens/sessões, criar cliente MTProto concorrente nem alterar o Unigram. O navegador puro **não** pode ativar aplicativos Windows locais: somente o `CentralDark.exe` oferece a ponte nativa tipada.

## Evidência da Casa (leitura de metadados, sem abrir mensagens ou segredos)

- `C:\Users\Administrador\Downloads\Unigram-13.0.1\Unigram-13.0.1` é **árvore de código-fonte**, com `Telegram.slnx`, `Build.ps1`, `Telegram.Msix`, `Libraries`. Não é `.exe` nem pacote MSIX instalável. Nenhum arquivo de certificado/credencial dessa árvore foi lido, copiado ou publicado.
- `Get-AppxPackage`: `38833FF26BA1D.UnigramPreview`, versão **12.10.7.0**, `Status=Ok`, instalado em WindowsApps.
- `Get-StartApps`: `Unigram` → `38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App` (AUMID fixo do pacote instalado). Manifest: `Application.Id=App`, `Executable=Telegram.exe`.
- Prova Windows de ativação **sem reinstalar nem mudar contas**: `explorer.exe shell:AppsFolder\38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App` retornou comando despachado; a inspeção de processo passou de 0 para 1 `Telegram.exe` associado ao pacote. Event Log AppModel Runtime registrou criação de processo e TWinUI evento 1621 para a mesma aplicação. **MainWindowHandle=0** em consulta seguinte: ainda NÃO há prova de janela gráfica pronta.
- Contraprova histórica (13/10, aprendizado `L185`): versão MSIX anteriormente apresentava falha de registro `0x80073CF6`/`0xD0000001`. A prova nova de processo não apaga a história, nem transforma a árvore de código-fonte 13.0.1 em uma instalação dessa versão.
- Checkout local `K:\_worktrees\bolt-desktop`: arquivos envolvidos no delta sem modificação local no momento da medição. Outros owners/arquivos locais continuam sujos e intocados.

## Delta mínimo — contratos e separação de responsabilidades

1. **Electron main existente:** canal `centraldark:unigram:open` somente da `mainWindow`, validado por `webContents.id` e mesma origem `rendererURL`; no Windows, despacha o AUMID **estático/allowlisted** via `spawn(explorer.exe)` sem `shell:true`, sem parâmetros provenientes do renderer, sem scraping, cliente alternativo ou segunda memória.
2. **Preload existente:** expõe só `openUnigramDesktop()`; não expõe filesystem, processo, login, contato ou API Telegram.
3. **Cockpit nativo:** botão `Unigram` ao lado das capacidades existentes; estado explícito `PENDING/REQUESTED/UNAVAILABLE/ERROR`. Um `REQUESTED` nunca aparece como `ONLINE` nem `PASS`.
4. **Instinto Superior web:** aba `Unigram` usa a **mesma ponte quando hospedada na casca nativa**; em Chrome/Edge sem preload, exibe necessidade do `CentralDark.exe`, sem tentar URI remota para comandar o PC.
5. **Inventário e teste existentes:** catalogam a superfície como `PARTIAL`; teste de contrato verifica allowlist, ausência de acesso à conta e fallback.

## Limites e próximo cursor

- **Não é embed HTML da UI UWP** nem cópia de source `13.0.1`: a UI original é executada intacta em sua própria janela, lado a lado. Web não recebe capacidade de abrir processos locais pela internet.
- Abrir a aplicação não integra automaticamente suas mensagens/contatos ao Hermes ou à memória CentralDark; qualquer automação de Telegram necessita API legítima, permissões específicas, isolamento de dados e recibos.
- `SOURCE_COMMITTED != BUILT != INSTALLED != BUTTON_E2E_PROVEN`. Ainda faltam testes TypeScript/build no mesmo SHA, uma instalação testada do CentralDark.exe com renderer saudável, clique real do botão, confirmação de janela Unigram e ausência de duplicação de processos.
- Se a versão desejada for exatamente **13.0.1**, há tarefa distinta de build/empacotamento do código-fonte, exigindo dependências e assinatura legítima; **não** foi feita implicitamente por este delta.
- Próximo cursor: gates no GitHub → build isolado e instalador existente → Windows pós-instalação → clique `Unigram` → medir janela/processo → screenshot/receipt sanitizado. Sem merge ou deploy não autorizados por contraprova.


<!-- CENTRALDARK_UNIGRAM_NATIVE_DOCK_HANDOFF_20261021 -->
## 👑🪬 DELTA 21/10/2026 — Unigram **inteiro** no quadrante do Cockpit, original preservado

**Intenção atualizada:** CHEFE agora quer o **aplicativo Unigram original completo dentro da experiência da Sala de Controle / CentralDark Harness**, com navegação lateral e abas conservadas, não somente “Abrir aplicativo” em janela separada. Isto atualiza a intenção histórica de 15/10 sem apagar a prova antiga, nem autoriza cópia de mensagens, criação de cliente MTProto, logout ou reinstalação.

### Owners conferidos no HEAD da PR #1895

| Camada | Owner existente | Prova atual |
| --- | --- | --- |
| Ativação Windows | `apps/modulos/Bolt/source/electron/main/index.ts` | `centraldark:unigram:open`, AUMID allowlisted, `REQUESTED`; sem HWND |
| Preload tipado | `apps/modulos/Bolt/source/electron/preload/index.ts` | `openUnigramDesktop()` |
| Interface nativa | `apps/modulos/Bolt/source/app/components/centraldark/CentralDarkCockpitShell.client.tsx` | botão com status em separado |
| Aba web 8080 | `apps/instinto-superior/src/components/central/CockpitShell.tsx` | `TabsContent value="unigram"`, apenas botão e explicação; DOM real do browser mostrou aba existente, não janela embutida |
| Contraprova | `apps/modulos/Bolt/source/scripts/centraldark-desktop-contract.test.mjs` | teste SOURCE para allowlist/preload/fallback; não mede janela/área nativa |

**Caso histórico da Casa:** pacote MSIX `38833FF26BA1D.UnigramPreview` 12.10.7.0, AUMID `38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App`. A árvore `Unigram-13.0.1` era source, **não** instalador. `Telegram.exe` foi visto após ativação do app, mas `MainWindowHandle=0`; disponibilidade gráfica atual continua `UNKNOWN`.

### Distinção crítica do alvo e mínimo MVP

1. **Prova zero da janela real (leitura na Casa via terminal já existente, sem Desktop Commander):** medir pacote/APPMODEL, processo do mesmo package family, sessão do usuário, janela visível e HWND real; associar ao pacote e identidade do processo, nunca por título genérico. Se `HWND=0` ou pacote indisponível, `UNIGRAM_NATIVE_WINDOW=UNKNOWN/BLOCKED`, não simular.
2. **MVP — janela gerenciada pela casca:** reutilizar `centraldark:unigram:open` e acrescentar um contrato tipado mínimo de `window_status`/`focus`/`close_surface` no **mesmo** `electron/main` + preload, sem permitir argumentos de comandos ou handles arbitrários vindos do renderer. Exibir “Unigram (original)” como aba do Shell, mantendo o processo e perfil originais; posicionar/mostrar/restaurar a janela autorizada no quadrante, sem prometer que uma janela coordenada virou HTML ou filho nativo. Esconder a superfície sem matar o Unigram; foco, resize e saída do Shell preservam o app.
3. **Dock literal dentro do quadrante (somente após prova da janela e consentimento técnico):** realizar POC Windows isolada e reversível de hospedagem de HWND externo no Shell. Provar parent/estilos originais e restauração, DPI, foco, teclado, IME, atalhos, minimização, resize, multi-monitor, UAC/integridade, pacote MSIX/WinUI e fechamento; `SetParent` cross-process é sujeito a DPI/estilos, pode falhar ou desestabilizar. Sem tentativa no ambiente ocupado sem checkpoint e rollback. `Electron.WebContentsView` só renderiza WebContents, **não** janelas de outro aplicativo.
4. **Aba 8080 no Chrome/VS Code Simple Browser:** é HTML e não tem HWND de host para aplicativo Windows. **Não declarar embed verdadeiro via iframe**. Se uso nessa superfície for obrigatório, precisaria de ponte nativa local autenticada e prévia da janela com privacidade/consentimento e input controlado; é outra etapa, não requisito de MVP nem captura automática de mensagens.
5. **Provas de fechamento:** `AUMID_PACKAGE_MATCH`, `PROCESS_VISIBLE`, `WINDOW_HWND_VISIBLE`, `APP_UNCHANGED`, `SHELL_FOCUS_RESIZE_MINIMIZE`, `DETACH_ROLLBACK`, `PROFILE_UNTOUCHED`, `BUILDER_COEXISTENCE`, `WEB_FALLBACK_HONEST`, `BUILD_WIN_SAME_SHA`, `RECEIPT`. Somente nomear `NATIVE_DOCK_PASS` se o parent/viewport dentro da janela real e os eventos forem observados e contraprova de restauração passar.

**Regra de dados privados:** não ler chats, contatos, sessões, credenciais, notificações pessoais, áudio ou histórico para provar integração. Prova usa só metadados de janela/versão/processo ou captura sanitizada da moldura em tela de teste escolhida pelo CHEFE; não gerar cliente Telegram paralelo.

**Writer/DELTA mínimo:** arquivos executáveis de Shell/Cockpit pertencem ao integrador ativo da Casa; este registro é **somente handoff no owner já existente**, sem edição conflitante de `CockpitShell.tsx` ou `electron/main/index.ts`, sem mudanças no Windows, sem alterar 4 peles e 3 previews.

**STATE:** `UNIGRAM_LAUNCH_SOURCE=PASS`; `UNIGRAM_NATIVE_PROCESS_HISTORICAL=PASS`; `UNIGRAM_WINDOW_VISIBLE_CURRENT=UNKNOWN`; `MANAGED_APP_WINDOW=NOT_IMPLEMENTED`; `NATIVE_DOCK=NOT_IMPLEMENTED`; `WEB_NATIVE_EMBED=NOT_SUPPORTED_BY_CURRENT_OWNER`; `LIVE_CASA_BUILD=UNKNOWN`.

**NEXT_CURSOR:** `VERIFY_WIN_PACKAGE → MEASURE_VISIBLE_HWND → REUSE_IPC → MANAGED_NATIVE_WINDOW_MVP → WINDOW_RESTORE_PROOF → DOCK_POC_ONLY_IF_SAFE → BUILD_SAME_SHA → COCKPIT_E2E → RECEIPT`.
<!-- /CENTRALDARK_UNIGRAM_NATIVE_DOCK_HANDOFF_20261021 -->
