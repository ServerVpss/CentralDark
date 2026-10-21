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
