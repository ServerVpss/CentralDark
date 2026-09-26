# Catálogo de automação de navegador

## Natureza do artefato

Este arquivo é **memória de investigação**. Fica em `references/` e não faz parte do caminho normativo ou executável da skill.

```text
CATÁLOGO=DESCOBERTA
CATÁLOGO≠APROVAÇÃO
CATÁLOGO≠AUTORIZAÇÃO_DE_INSTALAÇÃO
CATÁLOGO≠AUTORIZAÇÃO_DE_EXECUÇÃO
```

Fluxo obrigatório:

```text
DESCOBERTO
→ NÃO_VERIFICADO
→ PESQUISA PRIMÁRIA
→ TESTE ISOLADO
→ VERIFICADO_COM_LIMITES ou REJEITADO
→ REVALIDAÇÃO TEMPORAL
```

## Schema obrigatório por candidato

```text
CANDIDATE_ID
STATUS=NAO_VERIFICADO|VERIFICADO_COM_LIMITES|REJEITADO|OBSOLETO
PRIMARY_SOURCE_URL
VERIFIED_AT
PRODUCT_VERSION
PLATFORM
USER_GESTURE_REQUIRED
AUTHENTICATED_TAB_BINDING
PERMISSIONS
COOKIE_OR_CREDENTIAL_ACCESS
REVOCATION_MECHANISM
AUDITABILITY
KNOWN_RISKS
EVIDENCE_HASH
```

Regras:

- marketing e README de terceiros não promovem candidato;
- somente documentação oficial + teste reproduzível promovem para `VERIFICADO_COM_LIMITES`;
- `NAO_VERIFICADO` nunca é selecionado automaticamente;
- `VERIFIED_AT`, versão e hash são obrigatórios para promoção;
- nenhuma incorporação silenciosa na skill;
- duplicatas são consolidadas pelo mecanismo, não pelo nome comercial;
- mudança de versão, permissão ou arquitetura exige revalidação;
- descoberta não autoriza instalação nem execução;
- rejeição pode ocorrer antes do teste quando o contrato declarado viola uma proibição dura, mas a evidência da violação deve ser preservada.

## Proibições arquiteturais

```text
<all_urls>
COOKIE_ACCESS
PROFILE_COPY
REMOTE_DEBUGGING_PUBLIC_PORT
UNBOUNDED_TAB_ENUMERATION
SILENT_NAVIGATION
RAW_CDP_COMO_FALSA_ISOLAÇÃO_POR_ABA
```

`targetId`, `tabId`, seletor ou window handle identificam alvo; não constituem autorização por si sós.

---

## Candidatos oficiais — extensão e consentimento por aba

### EXTENSION_ACTIVETAB_NATIVE_MESSAGING

```text
CANDIDATE_ID=EXTENSION_ACTIVETAB_NATIVE_MESSAGING
STATUS=NAO_VERIFICADO
PRIMARY_SOURCE_URL=https://developer.chrome.com/docs/extensions/develop/concepts/activeTab ; https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging ; https://developer.chrome.com/docs/extensions/reference/api/debugger
VERIFIED_AT=NONE
PRODUCT_VERSION=CHROME_EXTENSION_APIS_UNPINNED
PLATFORM=CHROME_DESKTOP
USER_GESTURE_REQUIRED=SIM_PARA_ACTIVETAB
AUTHENTICATED_TAB_BINDING=HIPOTESE_TABID+ORIGIN+NONCE+EXPIRATION
PERMISSIONS=activeTab+scripting; debugger somente se controle profundo for indispensável; nativeMessaging para ponte local
COOKIE_OR_CREDENTIAL_ACCESS=PROIBIDO_POR_CONTRATO
REVOCATION_MECHANISM=navegação para outra origem, fechamento da aba, expiração da missão e disconnect explícito
AUDITABILITY=captura antes/depois + log de missão + allowed_origins restrito ao ID exato da extensão
KNOWN_RISKS=debugger é poderoso; activeTab sozinho não cria token de missão; extensão mal configurada pode ampliar escopo
EVIDENCE_HASH=NONE
```

Contrato-alvo:

```text
USUÁRIO CLICA NA EXTENSÃO NA ABA
→ activeTab concede acesso temporário
→ extensão cria missão com tabId + origin + nonce + expiração
→ executor recebe somente ações autorizadas
→ captura antes
→ executa
→ captura depois
→ extensão desconecta e revoga a missão
```

`chrome.debugger` deve ficar atrás do mesmo consentimento e token; CDP bruto não é isolamento.

---

## Candidatos sem extensão

### COMPUTER_USE_WINDOW_SCOPED

```text
CANDIDATE_ID=COMPUTER_USE_WINDOW_SCOPED
STATUS=NAO_VERIFICADO
PRIMARY_SOURCE_URL=https://github.com/trycua/cua
VERIFIED_AT=NONE
PRODUCT_VERSION=UNPINNED
PLATFORM=WINDOWS
USER_GESTURE_REQUIRED=APROVAÇÃO_EXPLÍCITA_DO_WINDOW_HANDLE
AUTHENTICATED_TAB_BINDING=INDIRETO_POR_JANELA+PROCESSO+ORIGEM_VISÍVEL
PERMISSIONS=controle visual/UI do aplicativo; não é uma permissão nativa por aba do Chrome
COOKIE_OR_CREDENTIAL_ACCESS=NAO_DEVE_ACESSAR_CREDENCIAIS; opera a sessão já renderizada
REVOCATION_MECHANISM=release do alvo e encerramento da missão
AUDITABILITY=captura antes/depois + processo + título/origem + limite de ações
KNOWN_RISKS=acesso amplo ao desktop; visão pode errar; conteúdo de outras abas pode aparecer; ferramenta não está exposta nesta sessão
EVIDENCE_HASH=NONE
```

Contrato candidato:

```text
USER_APPROVES_WINDOW_HANDLE
→ VERIFY_PROCESS=chrome.exe
→ VERIFY_ORIGIN=chatgpt.com
→ CAPTURE_BEFORE
→ EXECUTE_AUTHORIZED_ACTIONS_ONLY
→ CAPTURE_AFTER
→ RELEASE_WINDOW
```

### WINDOWS_UI_AUTOMATION_WINDOW_SCOPED

```text
CANDIDATE_ID=WINDOWS_UI_AUTOMATION_WINDOW_SCOPED
STATUS=NAO_VERIFICADO
PRIMARY_SOURCE_URL=https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/ui-automation-overview
VERIFIED_AT=NONE
PRODUCT_VERSION=MICROSOFT_UI_AUTOMATION_DOC_LAST_UPDATED_2021-09-15
PLATFORM=WINDOWS
USER_GESTURE_REQUIRED=POLÍTICA_LOCAL_A_IMPLEMENTAR
AUTHENTICATED_TAB_BINDING=INDIRETO_POR_AUTOMATIONELEMENT+WINDOW_HANDLE+PROCESSO
PERMISSIONS=acesso programático a elementos expostos na árvore UIA e control patterns
COOKIE_OR_CREDENTIAL_ACCESS=NAO_NECESSÁRIO; sessão autenticada permanece no Chrome
REVOCATION_MECHANISM=descartar AutomationElement/handle e encerrar missão
AUDITABILITY=árvore UIA, handle, PID, título/origem e captura antes/depois
KNOWN_RISKS=árvore pode não expor DOM completo; canvas/controles customizados; janela não equivale a permissão por aba
EVIDENCE_HASH=NONE
```

Fonte oficial confirma acesso programático a elementos da UI e interação por control patterns; isso ainda não prova o comportamento do Chrome nesta máquina.

### PLAYWRIGHT_PERSISTENT_DEDICATED_PROFILE

```text
CANDIDATE_ID=PLAYWRIGHT_PERSISTENT_DEDICATED_PROFILE
STATUS=NAO_VERIFICADO
PRIMARY_SOURCE_URL=https://playwright.dev/docs/api/class-browsertype ; https://developer.chrome.com/blog/remote-debugging-port
VERIFIED_AT=NONE
PRODUCT_VERSION=PLAYWRIGHT_DOCS_UNPINNED; CHROME_POLICY_FROM_136
PLATFORM=WINDOWS|LINUX|MACOS
USER_GESTURE_REQUIRED=LOGIN_MANUAL_INICIAL_NO_PERFIL_DEDICADO
AUTHENTICATED_TAB_BINDING=NAO; CONTROLE_ABRANGE_O_CONTEXTO/PERFIL_DE_AUTOMAÇÃO
PERMISSIONS=controle amplo das páginas do contexto persistente
COOKIE_OR_CREDENTIAL_ACCESS=estado do perfil dedicado acessível; perfil pessoal e cópia de cookies proibidos
REVOCATION_MECHANISM=fechar contexto; revogar sessão no site; remover diretório dedicado mediante autorização
AUDITABILITY=traces, screenshots, logs e diretório dedicado identificável
KNOWN_RISKS=controle de todas as abas daquele contexto; persistência de sessão; versionamento Chrome/Playwright; não toca a aba pessoal já aberta
EVIDENCE_HASH=NONE
```

Contrato:

```text
COPIAR_PERFIL_PESSOAL=NAO
CDP_NO_CHROME_PADRAO=NAO
PERFIL_DE_AUTOMACAO_SEPARADO=SIM
LOGIN_MANUAL_PELO_USUARIO=SIM
```

A documentação oficial do Chrome informa que, desde Chrome 136, `--remote-debugging-port` e `--remote-debugging-pipe` não são respeitados no diretório de dados padrão e exigem `--user-data-dir` não padrão. Isso é evidência de arquitetura, não teste local.

### PLAYWRIGHT_CONNECT_OVER_CDP

```text
CANDIDATE_ID=PLAYWRIGHT_CONNECT_OVER_CDP
STATUS=NAO_VERIFICADO
PRIMARY_SOURCE_URL=https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp ; https://developer.chrome.com/blog/remote-debugging-port
VERIFIED_AT=NONE
PRODUCT_VERSION=PLAYWRIGHT_DOCS_UNPINNED; CHROME_POLICY_FROM_136
PLATFORM=CHROMIUM_BASED
USER_GESTURE_REQUIRED=NÃO_GARANTIDO_PELO_PROTOCOLO
AUTHENTICATED_TAB_BINDING=NAO; endpoint permite acesso ao browser/contexto, não autoridade limitada por aba
PERMISSIONS=CDP amplo; páginas do contexto padrão ficam enumeráveis
COOKIE_OR_CREDENTIAL_ACCESS=POTENCIAL_ACESSO_AO_ESTADO_DA_SESSÃO; perfil pessoal proibido
REVOCATION_MECHANISM=desconectar cliente e encerrar browser/perfil dedicado
AUDITABILITY=logs CDP + traces/screenshots quando suportados
KNOWN_RISKS=baixa fidelidade comparada ao protocolo Playwright; argumentos incompatíveis; endpoint concede controle amplo; porta não deve ser pública
EVIDENCE_HASH=NONE
```

A documentação do Playwright confirma que `connectOverCDP` anexa a uma instância Chromium e expõe o contexto padrão. Isso confirma capacidade técnica, não isolamento por aba.

### WEBDRIVER_OWN_SESSION

```text
CANDIDATE_ID=WEBDRIVER_OWN_SESSION
STATUS=NAO_VERIFICADO
PRIMARY_SOURCE_URL=https://www.w3.org/TR/webdriver2/
VERIFIED_AT=NONE
PRODUCT_VERSION=W3C_WORKING_DRAFT_2026-07-02
PLATFORM=CROSS_BROWSER_IMPLEMENTATION_DEPENDENT
USER_GESTURE_REQUIRED=NAO_POR_PADRÃO
AUTHENTICATED_TAB_BINDING=NORMALMENTE_SESSÃO_WEBDRIVER_PRÓPRIA; NÃO ANEXA NATURALMENTE À ABA PESSOAL
PERMISSIONS=controle remoto amplo do user agent dentro da sessão
COOKIE_OR_CREDENTIAL_ACCESS=estado/cookies da sessão controlada; perfil pessoal não deve ser reutilizado
REVOCATION_MECHANISM=Delete Session + encerramento do browser/driver
AUDITABILITY=comandos e respostas do protocolo; screenshot/log depende da implementação
KNOWN_RISKS=webdriver-active flag; sessão ampla; diferenças entre drivers; especificação é Working Draft
EVIDENCE_HASH=NONE
```

A especificação define WebDriver como interface remota para introspecção e controle do user agent. Ela não fornece consentimento físico por aba.

### API_BRIDGE_NO_BROWSER

```text
CANDIDATE_ID=API_BRIDGE_NO_BROWSER
STATUS=NAO_VERIFICADO
PRIMARY_SOURCE_URL=DEPENDE_DO_SERVIÇO_ALVO
VERIFIED_AT=NONE
PRODUCT_VERSION=NONE
PLATFORM=HTTP/API
USER_GESTURE_REQUIRED=DEPENDE_DO_CONTRATO
AUTHENTICATED_TAB_BINDING=NAO
PERMISSIONS=escopos da API
COOKIE_OR_CREDENTIAL_ACCESS=não usar cookie do navegador; credencial própria somente com autorização
REVOCATION_MECHANISM=revogar token/escopo
AUDITABILITY=request IDs e logs sanitizados
KNOWN_RISKS=não conversa com uma aba específica; API pode não existir ou não cobrir a ação
EVIDENCE_HASH=NONE
```

---

## Projetos comunitários descobertos

### SDEROSIAUX_CHROME_AGENT

```text
CANDIDATE_ID=SDEROSIAUX_CHROME_AGENT
STATUS=NAO_VERIFICADO
PRIMARY_SOURCE_URL=https://github.com/sderosiaux/chrome-agent
VERIFIED_AT=NONE
PRODUCT_VERSION=main@f3e7421c3bf2a8569018bbdadf40d5d18d148b0c (observado no GitHub; API de commit sofreu timeout)
PLATFORM=CHROME; RUST
USER_GESTURE_REQUIRED=NAO_DECLARADO
AUTHENTICATED_TAB_BINDING=CDP amplo; não provado por aba
PERMISSIONS=README declara --connect, tabs, network, eval, upload e outras ações CDP
COOKIE_OR_CREDENTIAL_ACCESS=README declara --copy-cookies; incompatível com a política da Casa
REVOCATION_MECHANISM=close/disconnect declarado; não testado
AUDITABILITY=JSON/verdicts declarados; não testados
KNOWN_RISKS=RAW_CDP; COPY_COOKIES; enumeração de abas; autoaceite de diálogos por padrão; projeto comunitário sem SLA
EVIDENCE_HASH=NONE
```

README é fonte primária do projeto, mas não promove segurança. `--copy-cookies` bloqueia seleção para a arquitetura da Casa enquanto não houver modo provadamente sem cópia e com escopo seguro.

### LEEGUOOOOO_CHROME_USE

```text
CANDIDATE_ID=LEEGUOOOOO_CHROME_USE
STATUS=NAO_VERIFICADO
PRIMARY_SOURCE_URL=https://github.com/leeguooooo/chrome-use
VERIFIED_AT=NONE
PRODUCT_VERSION=main@26bccb2f4ffe6d0cfd1cd2cfc81245eda0eda1fe
PLATFORM=WINDOWS|LINUX|MACOS; RUST+EXTENSION
USER_GESTURE_REQUIRED=README declara zero confirmação por uso; diverge do consentimento obrigatório por missão
AUTHENTICATED_TAB_BINDING=extensão+Native Messaging+chrome.debugger; isolamento real por aba não provado
PERMISSIONS=README declara 7 permissões e ausência de <all_urls>; manifest/código ainda precisam de auditoria
COOKIE_OR_CREDENTIAL_ACCESS=usa sessão real; acesso efetivo e limites ainda não testados
REVOCATION_MECHANISM=session stop/prune e relay declarados; revogação por missão não provada
AUDITABILITY=CLI JSON, sessões e screenshots declarados; não testados
KNOWN_RISKS=unattended/zero per-use confirmation; chrome.debugger poderoso; auto-connect; tab groups não equivalem a autorização; site adapters autoatualizáveis
EVIDENCE_HASH=NONE
```

A arquitetura declarada se aproxima da ponte local, mas o modelo “instale uma vez, zero confirmação por uso” não satisfaz automaticamente `USER_GESTURE_REQUIRED=SIM`.

---

## Fontes oficiais já localizadas

- <https://developer.chrome.com/docs/extensions/develop/concepts/activeTab>
- <https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging>
- <https://developer.chrome.com/docs/extensions/reference/api/debugger>
- <https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/ui-automation-overview>
- <https://playwright.dev/docs/api/class-browsertype>
- <https://developer.chrome.com/blog/remote-debugging-port>
- <https://www.w3.org/TR/webdriver2/>

Semente comunitária:

- <https://github.com/topics/chrome-automation>

Índices comunitários e README de terceiros servem para descoberta, nunca como prova final.

## Gate de seleção

```text
STATUS=NAO_VERIFICADO              → NÃO_SELECIONAR_AUTOMATICAMENTE
FONTE_OFICIAL_ATUAL=NAO            → NÃO_VERIFICADO
TESTE_ISOLADO=NAO                  → NÃO_PROMOVER
ESCOPO_DE_AUTORIDADE_INDEFINIDO    → REJEITAR_PARA_SESSÃO_AUTENTICADA
CREDENCIAL_EXTRAÍDA=SIM            → REJEITAR
PERFIL_PESSOAL_COPIADO=SIM         → REJEITAR
REMOTE_DEBUGGING_PUBLIC_PORT=SIM   → REJEITAR
CONFIRMAÇÃO_SENSÍVEL=NAO           → REJEITAR_PARA_AÇÃO_SENSÍVEL
LOG_E_EVIDÊNCIA=NAO                → CONDICIONAR
```

## Decisão arquitetural atual

```text
HANDSHAKE_IMEDIATO=COMPUTER_USE_OU_UIA_COM_ESCOPO_DE_JANELA, APÓS FERRAMENTA REAL E TESTE
AUTOMAÇÃO_ESTÁVEL_SEM_ABA_PESSOAL=PLAYWRIGHT_COM_PERFIL_DEDICADO
CONSENTIMENTO_MAIS_FORTE_POR_ABA=EXTENSÃO activeTab + missão temporária
PRODUÇÃO=API_PRÓPRIA_QUANDO_EXISTIR
RAW_CDP_COMO_ISOLAMENTO=REJEITAR
EXTENSÃO=OPCIONAL, NÃO ÚNICA ROTA
```

Nenhum candidato deste catálogo está autorizado para instalação ou execução apenas por aparecer aqui.
