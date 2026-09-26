# 🏺 CENTRALDARK-HARNESS-CASA — Arquitetura Total

> Documento vivo da arquitetura full-stack, runtime, agentes, bridges, browser, captura, observabilidade, provas, dependências e decisões estruturais da CentralDark.

**Status:** VIVO / ACUMULATIVO  
**Criado em:** 2026-09-09 10:33 -03:00  
**Owner:** CENTRALDARK-HARNESS-CASA  
**Regra:** a árvore cresce; ramo já provado não desaparece da documentação.

## 1. Princípios operacionais

- `REALIDADE_IS_JUDGE=true`
- `UNKNOWN_IS_NOT_PASS=true`
- `MERGED != DEPLOYED`
- `DOCUMENTED != EXECUTED`
- `REUSE_BEFORE_CREATE=true`
- `ONE_SYSTEM_ONLY=true`
- `NO_DUPLICATION=true`
- `NO_BLIND_OVERWRITE=true`
- `ZERO_REGRESSION=true`

## 2. Regra da cadeirinha

`INVENTARIAR → CLASSIFICAR → ESPELHAR → TESTAR → PROTEGER ESTADO VIVO → MOVER SOMENTE DEPOIS`

Nenhum arquivo de estado, perfil, runtime ou credencial é movido apenas porque ocupa espaço. Primeiro é medido, classificado e testado.
## 3. 🌳 Árvore acumulada da Casa

```text
CENTRALDARK-HARNESS-CASA
├─ 🧠 ESTADO / MEMÓRIA VIVA
│  ├─ E:\CentralDark\Pivete\state.db
│  ├─ E:\CentralDark\Pivete\state.db-wal
│  ├─ E:\CentralDark\Pivete\verification_evidence.db
│  ├─ E:\CentralDark\Pivete\processes.json
│  ├─ E:\CentralDark\Pivete\.hermes_history
│  ├─ E:\CentralDark\Pivete\.skills_prompt_snapshot.json
│  └─ E:\CentralDark\Pivete\cache\delegation\live\*
├─ 🤖 AGENTES / MODELOS
│  ├─ C:\Users\danda\AppData\Local\hermes
│  ├─ C:\Users\danda\.hermes
│  ├─ C:\Users\danda\.agents
│  ├─ C:\Users\danda\.mcpjam
│  ├─ C:\Users\danda\.codex
│  ├─ C:\Users\danda\.claude
│  └─ C:\Users\danda\.claude-server-commander
├─ 🧩 CARCAÇAS / HARNESS
│  ├─ E:\CentralDark\sol-desktop-poc\BridgeMind One
│  ├─ ...\Packages\Claude_pzs8sxrjxfjjc
│  ├─ ...\Packages\OpenAI.Codex_2p2nqsd0c76g0
│  └─ ...\Packages\PeterGuide.GemioAI-OverseasE-commerce_eda29k5gbrq92
```
```text
├─ 🖥️ COCKPIT / DESENVOLVIMENTO
│  ├─ C:\Users\danda\.vscode
│  ├─ apps\modulos\HERMES-CORE\extensions\hermes-vscode-router-provider
│  ├─ PowerShell 7
│  └─ Git Intelligence / logs / models
├─ 📡 PONTES / TRANSPORTE
│  ├─ Desktop Commander Remote v0.2.48
│  ├─ CentralDark-Remote-Bridge.ps1
│  ├─ CENTRALDARK-REMOTE-BRIDGE.config.json
│  ├─ VS Code SSH :35645 / :49930
│  ├─ WinRM :5985
│  ├─ Tailscale :443
│  └─ CentralDark MCP
├─ 🌐 BROWSER / VISÃO
│  ├─ C:\Users\danda\.agent-browser
│  ├─ Chrome 152
│  ├─ chrome-devtools-mcp
│  ├─ Chrome User Data / CEF User Data
│  └─ Edge / WebView2
├─ 📸 CAPTURA
│  ├─ Lightshot 5.5.0.7
│  ├─ DXGIODScreenshot.dll
│  ├─ System.Windows.Forms.Screen
│  ├─ System.Drawing.Graphics.CopyFromScreen
│  └─ Remote_Desktop_Commander.read_file
└─ ⚖️ PROVA / OBSERVABILIDADE
   ├─ interrupt_debug.log
   ├─ receipts\remote-bridge
   ├─ runtime_plug_conformance.py
   └─ casa_boot.py
```
## 4. 🧼 Padrão profissional de código e documentação

O código deve ser legível por estrutura e nomes. Comentários registram principalmente **por que** uma decisão existe, riscos, invariantes, contrato e contexto; não repetem o que a linha já diz.

### Comentários por linguagem

- JavaScript/TypeScript/Java/C#/C++: `// comentário curto` e `/* bloco */`.
- Python/Bash/Ruby: `# comentário curto`.
- Python: `"""docstring"""` para módulos, classes e funções públicas.
- TODO/FIXME só podem existir com contexto, owner e condição de fechamento.

### Regras de legibilidade

- nomes descritivos; evitar abreviações obscuras;
- métodos/funções com responsabilidade única e escopo pequeno;
- reduzir aninhamento e separar validações do fluxo principal;
- extrair comportamento reutilizável em owner existente;
- uniformidade de padrões entre autores e agentes;
- testes automatizados para contratos e invariantes importantes;
- comentário não substitui teste, receipt ou prova de runtime.

## 5. 📚 Lei da documentação junto da mudança

Toda mudança material deve atualizar no mesmo ciclo:

`CÓDIGO → TESTE → DOCUMENTAÇÃO → CADERNETA → PROVA`

A documentação não é tarefa futura. Se o componente nasceu ou mudou, sua documentação nasce ou muda junto.
## 6. 🧾 Registro obrigatório por mudança

Cada alteração relevante deve registrar:

- `DATE/TIME`
- `COMPONENT`
- `OWNER`
- `VERSION_BEFORE → VERSION_AFTER`
- `FILES_CHANGED`
- `DEPENDENCIES_ADDED/REMOVED/UPDATED`
- `REASON / INTENT`
- `RISK`
- `TEST_COMMAND`
- `TEST_RESULT`
- `RUNTIME_EVIDENCE`
- `ROLLBACK`
- `STATUS` 🟢/🟡/🔴
- `NEXT_CURSOR`

## 7. 🔩 Dependências conhecidas

- Node.js 26.5.1
- Python 3.13.15
- PowerShell 7.6.5
- VS Code
- OpenSSH
- WinRM
- Tailscale
- Desktop Commander 0.2.48
- Chrome/Chromium 152
- Edge/WebView2
- Lightshot 5.5.0.7
- System.Windows.Forms / System.Drawing
- Codex runtime / Claude Native Host / Hermes Router
## 8. 🏷️ Versionamento e decisões arquiteturais

- Componentes devem declarar versão quando houver contrato público ou integração externa.
- Mudança incompatível exige registro explícito de migração; não criar `v2/v3` paralela por conveniência.
- Decisões relevantes devem gerar uma entrada ADR curta: contexto, decisão, alternativas, consequência e rollback.
- Dependência nova entra no inventário com nome, versão, origem, finalidade, licença quando aplicável e owner.
- Dependência removida permanece no histórico com motivo e versão de remoção.

## 9. 📈 Status vivo

- 🟢 `PROVADO`: evidência atual e reproduzível.
- 🟡 `PARCIAL/DEGRADADO/UNKNOWN`: existe sinal, mas falta prova completa ou há falha não crítica.
- 🔴 `CRÍTICO`: rompe comunicação/execução essencial da Casa.
- Status sempre registra timestamp, origem, versão/SHA quando houver e causa observada.

## 10. 📌 Fontes de boas práticas usadas como referência

- Christian Melo, “Boas práticas de codificação” (LinkedIn, 2022): manutenção, legibilidade, testabilidade, compreensão, nomes claros, redução de aninhamento e métodos especializados.
  https://pt.linkedin.com/pulse/boas-pr%C3%A1ticas-de-codifica%C3%A7%C3%A3o-christian-melo
- Campus Code, “Boas práticas de código” (2022; rev. 2023): clareza, leitura, compreensão, manutenção, detecção de erros e uniformidade em equipes.
  https://www.campuscode.com.br/conteudos/boas-praticas-de-codigo

## 11. 🧿 Regra de evolução deste documento

Este arquivo é **acumulativo**. Toda nova capacidade, ponte, dependência, diretório relevante, teste ou ferida medida deve ser encaixada na árvore e registrada aqui ou em documento especializado sob `docs/`, mantendo link de volta para este índice-raiz.

**Última regra:** mapa completo primeiro; intervenção localizada depois.## 🔒 Cadeado operacional da raiz

A raiz `HARNESS-INVENTARIO` adota um guard lógico obrigatório:

- arquivo de estado: `.centraldark-lock.json`
- política: `docs/DANGER-LOCK-POLICY.md`
- estado padrão fora de edição: `CLOSED`
- leitura com `CLOSED`: permitida
- mutação com `CLOSED`: proibida
- abertura: somente com autorização explícita `PERMITO SEGREDO`
- ao concluir a ação: fechamento automático lógico para `CLOSED`

### Classificação
- 🚨 `DANGER`: delete, move, ACL, credenciais, estado vivo, alteração destrutiva.
- ⚠️ `CAUTION`: edição controlada de documentação, manifesto e configuração.

### Limite atual
O cadeado é um **guard de política e estado**, já documentado e verificável. Não foram aplicadas ACLs NTFS destrutivas nesta etapa, pois isso exigiria teste isolado de unlock/rollback para não cortar a própria ponte de administração.
## 🧿 Expansão epistemológica e experimental — 2026-09-09

### Novo eixo de prova
`CLAIM → CLASSIFY → REQUIRED_EVIDENCE → FORMAL/HORN GATE → LIVE TEST → COUNTERPROOF → PROOF LEDGER → META-JUDGE`

Estados: `PROVED_IN_SCOPE`, `REFUTED_IN_SCOPE`, `SUPPORTED`, `PARTIALLY_SUPPORTED`, `UNKNOWN`, `UNDECIDABLE_IN_MODEL`, `OUT_OF_SCOPE`.

### Fontes e owners reaproveitados
- `tlc23(3).pdf`: Horn, satisfazibilidade, Herbrand, modelo mínimo e resolução.
- `docs/CONSCIENCIA/PROOF-OWNERSHIP.json`: prova acíclica e âncora externa.
- PR `#1463`: Horn Line Gate, Preanswer Gate, PR-Trilho e continuidade viva.

### Ramo SOL POC
`E:\CentralDark\sol-desktop-poc` entra como superfície experimental paralela.
Não cria segundo Core e não ganha autoridade própria.
Pode rodar lado a lado quando portas/writers não colidem e deve publicar métricas/receipts no mesmo esquema do Harness.

### Lei refinada
`REALITY_JUDGE = juiz do observável no escopo`.
`EPISTEMIC_CORE = limite do que se pode concluir`.
`FIXED_POINT = fechamento sob premissas e escopo atuais`.
Nenhum dos três significa verdade absoluta.
## ☿ Hermes CLI Overlay / Sync Gate — 2026-09-09

Novo ramo acumulativo:
`HERMES_UPSTREAM → CENTRALDARK_CLI_OVERLAY → CENTRALDARK_SYNC_GATE → PROOF_LEDGER → REALITY_JUDGE`

Capacidades planejadas e cristalizadas:
- idioma `pt-BR/en-US` sem fork do upstream.
- `/language`, `/lang pt-BR`, `/lang en-US`.
- `/updateBR` como alias de update + reconcile + verify, não updater paralelo.
- rodapé mensurável com idioma, main/VPS sync, skills e estado upstream.
- promoção de mutação versionável da VPS somente por owner/diff/teste/contraprova/receipt.
- secrets, cache, PID, socket, banco local e logs transitórios ficam fora do fluxo de Git.

Owners reaproveitados:
- `apps/modulos/HERMES-CORE/prompts/hermes-core.md`.
- `apps/modulos/HERMES-CORE/core/scope-lock-gate.mjs`.
- `apps/modulos/HERMES-CORE/core/universal-method-contract.mjs`.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`.

Owner gap atual: implementação direta de locale/overlay ainda precisa ser medida dentro do HERMES-CORE antes de código novo.
