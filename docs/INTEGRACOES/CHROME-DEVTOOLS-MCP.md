# Chrome DevTools MCP — integração segura na Refinaria

Status: CANDIDATE_INTEGRATION

Fonte oficial observada: `ChromeDevTools/chrome-devtools-mcp`.

O projeto fornece um servidor MCP para controlar e inspecionar um Chrome vivo, com automação via Puppeteer, debugging de console/rede, screenshots/snapshots, performance traces, Lighthouse, memória e ferramentas de navegador.

Na CentralDark ele entra como **sensor/corpo de observação**, não como autoridade e não como Writer.

```text
CHROME_DEVTOOLS_MCP
→ BROWSER_OBSERVATION
→ ARTIFACT_CAPABILITY_ADAPTER
→ SIGNALS
→ DEDUPE
→ META_LUPA / CONTRAPROVA
→ OWNER CANONICO
→ TESTE
→ CANDIDATE|NO_CHANGE|CRYSTAL
```

Invariantes:

```text
SOURCE_IS_AUTHORITY=false
DIRECT_CANONICAL_MUTATION=false
APPLY_ALLOWED=false
BROWSER_OBSERVATION_IS_EVIDENCE_INPUT=true
OBSERVATION_MUST_MATCH_CLAIM=true
MUTATION_REQUIRES_EXISTING_WRITER=true
ZERO_DEPLOY=true
ZERO_RESTART=true
```

Classes úteis de evidência vindas do navegador:

- snapshot/DOM observado;
- console e stack trace;
- requests/responses de rede;
- trace/performance/Core Web Vitals;
- Lighthouse;
- screenshot/screencast;
- estado de página/navegação;
- heap/memory quando aplicável.

Segurança: o upstream alerta que o MCP expõe o conteúdo da instância do navegador aos clientes MCP e pode inspecionar/modificar dados do navegador. Portanto, usar apenas em superfícies autorizadas e sem transportar secrets para prompts/artefatos.

Privacidade operacional: o upstream informa telemetria de uso habilitada por padrão e permite desabilitar com `--no-usage-statistics` ou `CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS`; também há `--no-performance-crux` para evitar consulta CrUX durante análise de performance quando desejado.

Instalação/runtime não é feita por este contrato. Este arquivo apenas fixa o encaixe e a interpretação segura da capacidade externa.
