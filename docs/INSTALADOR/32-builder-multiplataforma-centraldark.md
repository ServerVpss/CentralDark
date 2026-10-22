# 32 — Comandos do CHEFE: builder multiplataforma do CentralDark

**INTENT_ID:** CENTRALDARK-CHEFE-BUILDER-UNICO-AIONUI-RAKAZO-UNIGRAM-20261022  
**ESTADO:** contrato e receitas documentados; botão e orquestração multiplataforma ainda não implementados.  
**OWNER DA DOCUMENTAÇÃO:** docs/INSTALADOR (continuação da numeração existente).  
**OWNERS DE IMPLEMENTAÇÃO (REUTILIZAR):** experiments/aionui-centraldark-instinto-superior; apps/modulos/Bolt/source/electron; apps/instinto-superior/src/components/central/CockpitShell.tsx.  
**REGRA:** uma casca Electron CentralDark, um cockpit e Hermes/MCP existentes; nenhum segundo cérebro.

## Comando canônico 1 — reset de senha WebUI AionUI na VPS

Executar no terminal Linux da VPS; **operação manual de autenticação, nunca parte automática de um build**:

~~~bash
cd /opt/centraldark/aionui || exit 1
NODE_ENV=production bun run resetpass --data-dir /root/.aionui-web
~~~

A senha nova aparece apenas no terminal interativo do operador. Não colar senha em issue/commit/log, nem colocar essa etapa no botão de rebuild.

## Comando canônico 2 — atualizar WebUI da VPS

~~~bash
cd /opt/centraldark/aionui || exit 1
bun run package &&
systemctl restart centraldark-aionui-webui.service &&
curl -fsS -o /dev/null -w 'AIONUI_WEB_HTTP=%{http_code}\n' http://127.0.0.1:25808/
~~~

A localização /opt/centraldark/aionui é link para /var/opt/centraldark/aionui (medição de 22/10/2026), onde o serviço lê out/renderer. Versão Web não exige build de instalador Electron. Não confundir rebuild da interface com atualização automática dos dados de sessão ou cache persistente. Vite gera assets versionados; no navegador, atualizar com Ctrl+Shift+R quando necessário.

## Comando canônico 3 — instalador Electron Linux

~~~bash
cd /opt/centraldark/aionui || exit 1
bun run build-deb
find dist -maxdepth 3 -type f -name '*.deb' -print
~~~

O comando gera distribuição Linux quando o builder conclui com sucesso. Não reinicia WebUI por conta própria.

## Comando canônico 4 — instalador Electron Windows

Executar sobre o código sincronizado no **worker Windows autorizado (Casa / CI Windows)**; não pressupor que a compilação cruzada da VPS gere executável válido.

~~~powershell
Set-Location <CAMINHO_DO_CHECKOUT_AIONUI_NO_WINDOWS>
bun run build-win
Get-ChildItem .\dist -Recurse -Filter *.exe -File
~~~

Esse comando é específico do AionUI/Electron; não compila automaticamente Rakazo ou Unigram.

## Receita do CHEFE — três builds coordenados

**Intenção preservada:** WEB + LINUX + WINDOWS devem ser iniciados paralelamente e entregar três resultados ao cockpit, sem solicitar comandos repetidos.

**Correção antes de automatizar:** o combo de 22/10 que lançava bun run package, bun run build-deb e bun run build-win em background na MESMA árvore é uma receita experimental, não o executor canônico: jobs podem disputar out/, dist/ e arquivos temporários. Para execução automática, separar checkout/staging por target e usar runner Windows para o instalador Windows. Só publicar cada resultado ao terminar com sucesso.

Contrato pretendido do botão **Atualizar CentralDark** no cockpit:

~~~text
CHEFE: 1 clique autenticado
  → selecionar commit/estado aprovado
  → WEB:    worker Linux isolado → package → serviço 25808 → HTTP → receipt
  → LINUX:  worker Linux isolado → build-deb → .deb + SHA256 → receipt
  → WINDOWS: worker Windows isolado → build-win → .exe + SHA256 → receipt
  → consolidar STATUS por target no MESMO cockpit
  → permitir limpar somente caches temporários de build do job
  → não apagar dados, sessões, credenciais ou caches operacionais do usuário
~~~

A interface do botão ainda NÃO está implementada. Nenhum comando desta página significa que o build foi executado.

## Escala — cockpit inteiro, módulo por módulo

| Módulo | Presença/owner existente | Web | Windows | Linux |
|---|---|---|---|---|
| AionUI / CentralDark Estúdio | experiments/aionui-centraldark-instinto-superior + Electron existente | bundle WebUI e serviço | build-win (instalador Electron) | build-deb |
| Cockpit CentralDark | apps/instinto-superior + Shell Electron existente | app web do cockpit | hospedar cockpit dentro da casca Electron | hospedar cockpit dentro da casca Electron |
| Rakazo | /opt/centraldark/rakazo, Docker Compose images | atualizar imagem do serviço | capacidade WebView do shell, não instalador Rakazo nativo | capacidade WebView do shell, runtime Docker separado |
| Unigram / Telegram completo | apps/modulos/Bolt/source/electron (ponte nativa) + recibo unigram-native-surface-2026-10-15.md | não é interface web portável nativamente | Windows MSIX/Unigram + integração shell nativa autorizada | sem build Linux confirmado para este código |

**Rakazo (atualização da imagem já instalada na VPS):**

~~~bash
cd /opt/centraldark/rakazo || exit 1
docker compose -f docker-compose.images.yml pull web &&
docker compose -f docker-compose.images.yml up -d --no-deps --force-recreate web &&
curl -fsS -o /dev/null -w 'RAKAZO_WEB_HTTP=%{http_code}\n' http://127.0.0.1:25810/
~~~

Este comando atualiza um container com imagem publicada; não constrói código Rakazo, nem gera instaladores Electron.

**Unigram enviado pelo CHEFE em 22/10/2026:** Unigram-develop.zip contém README.md, Build.ps1 e fontes C#/XAML WinUI/UWP. O próprio Build.ps1 chama UpdateManifest.ps1 e Telegram.slnx com MSBuild para produzir pacote MSIX. Na cópia ZIP recebida **faltam UpdateManifest.ps1 e Telegram.slnx**: essa cópia não é um projeto compilável completo; não declarar build PASS. O owner já existente abre o Unigram original instalado por AUMID Windows numa janela própria e não hospeda a UI UWP dentro de iframe/Electron. A intenção nova de integrar o Telegram inteiro no mesmo produto requer pipeline Windows próprio e integração de janela/UX com permissões e identidade preservadas, sem fingir que Unigram vira Web/Linux automaticamente.

## Próximo cursor (ainda pendente)

1. Reutilizar o botão CentralDark Estúdio no CockpitShell existente e incorporar a página principal do cockpit dentro do Shell Electron (evitar loop cockpit→AionUI→cockpit).
2. Implementar um dispatcher único de build com jobs por host/target e isolamento de arquivos de saída, logs e cache temporário.
3. Reutilizar capacidade Rakazo por WebView/serviço existente, sem duplicar servidor.
4. Completar fontes e pipeline Windows do Unigram original, mantendo a ponte já existente e distinguindo pacote, app inicializado e janela visível.
5. Só declarar PASS de um target depois de artefato ou HTTP real, checksum e receipt.

**Lei:** BUILD_STARTED != BUILD_OK != INSTALLED != EMBEDDED; preservação do sistema existente e ONE_WRITER_PER_SCOPE.
