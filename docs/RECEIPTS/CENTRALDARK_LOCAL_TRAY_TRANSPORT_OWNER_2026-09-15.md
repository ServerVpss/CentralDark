# 👑🪬 CENTRALDARK — TRAY COMO TRANSPORTE LOCAL ÚNICO

Data: 2026-09-15
Branch: feat/boot-delta-util-tlc23-20260915
PR: #1548
Owner lógico: `CENTRALDARK_AI_BOOT.yaml`
Owner futuro de implementação: a descobrir/reutilizar; não criar bridge paralelo.

## Intenção cristalizada

O Chefe fechou o desenho local correto:

```text
NÃO:
ChatGPT ↔ bridge A ↔ bridge B ↔ Remote Desktop Commander ↔ Hermes ↔ outro socket ↔ outro gateway ↔ Casa

SIM:
☁️ CENTRALDARK Site/API/MCP
        │
        ▼
1 conexão persistente
        │
        ▼
🟢 CENTRALDARK TRAY
        │
        ├── Hermes
        ├── Casa/FS
        └── ferramentas locais
        │
        ▼
receipt/prova
```

O Tray é a porta local única até o `CentralDark Cockpit.exe` ficar pronto.

## Papel do Tray

```yaml
TRAY_OWNER: LOCAL_TRANSPORT
RESPONSABILIDADES:
  - iniciar_com_Windows
  - manter_device_identity
  - renovar_autenticacao
  - manter_1_conexao_outbound
  - anunciar_online_offline
  - receber_missao
  - rotear_para_Hermes_ou_capability_existente
  - devolver_resultado_prova
  - guardar_somente_credenciais_locais_necessarias
  - nunca_virar_segundo_cerebro
```

O Tray é presença física da Casa, não cérebro novo.

## Papel do Desktop Commander

```yaml
REMOTE_DESKTOP_COMMANDER:
  role:
    - bootstrap
    - recuperacao
    - manutencao
  not_role:
    - transporte_principal_permanente_da_CentralDark
    - cerebro
    - owner_de_governanca
    - bridge_a_mais_quando_o_tray_existir
```

Enquanto o Tray/Cockpit não absorve a capacidade, Desktop Commander pode ser usado como ferramenta de manutenção autorizada.

## Futuro Cockpit

Quando o executável ficar pronto:

```text
CENTRALDARK TRAY + CENTRALDARK COCKPIT.EXE
        ↓
MESMO PROCESSO / MESMO CONTRATO
```

O Cockpit deve consumir o mesmo serviço local do Tray, preferencialmente via IPC local seguro:

```text
Cockpit.exe
    ↓
Named Pipe ou loopback local
    ↓
Tray
    ↓
MCP/API CentralDark
```

Não criar outro bridge para o Cockpit.

## Separação de credenciais

O desenho mantém as classes de autenticação separadas:

```text
CentralDark API key
MCP OAuth access token
MCP/admin session
Device access/refresh tokens
Provider OAuth tokens
```

A regra continua:

- não commitar segredo bruto;
- não colar segredo em prompt;
- não registrar token em receipt;
- tokens locais vivem em store/runtime local seguro;
- provider OAuth permanece cifrado/persistido pelo owner correto;
- uma experiência de login não significa uma credencial universal.

## Encaixe com a sequência do produto

Agora:

```text
VPS
→ site público novo
→ admin novo
→ login/HUB
→ MCP/API/providers
→ rotas/funções sobreviventes migradas
→ publicar nova estrutura
```

Depois:

```text
Casa/Windows
→ Hermes Desktop e apps de terceiros continuam
→ CentralDark.exe / Cockpit / Builder
→ Tray embutido ou compartilhado
→ controle local da Casa e VPS
```

## Contraprova

- `TRAY_ONLINE` não prova Hermes executando.
- `DEVICE_ONLINE` não prova tool ativa.
- `MCP_CONNECTED` não prova permissão de mutação.
- `102 tools` ou `115 tools` listadas não provam execução ponta a ponta.
- `Desktop Commander autorizado` não torna ele owner principal.
- `Cockpit aberto` não deve criar novo socket/bridge se o Tray já for o transporte local.

## Regra TLC23/Horn aplicada

Fatos medidos + intenção recorrente derivam o menor modelo que satisfaz o escopo:

```text
GIT      = memória/contrato versionado
TRAY     = presença/transporte local persistente
HERMES   = executor local/remoto conforme escopo
COCKPIT  = interface futura
MCP/API  = capacidade remota central
REALITY  = juiz
```

Este é o modelo mínimo atual. Se aparecer contradição material ou owner existente melhor, rederivar somente o cone afetado.

## Status

```yaml
LOCAL_TRAY_AS_TRANSPORT_OWNER: CRISTALIZADO_COMO_DECISAO_DE_ARQUITETURA
REMOTE_DESKTOP_COMMANDER_ROLE: BOOTSTRAP_RECOVERY_MAINTENANCE
CENTRALDARK_COCKPIT_EXE: FUTURE_PHASE
ONE_LOCAL_TRANSPORT_PER_DEVICE: TARGET
IMPLEMENTATION_OWNER: UNKNOWN_UNTIL_AUDIT
DEPLOYED: NO
RUNTIME_CONSUMER_PROVEN: UNKNOWN
```

## Next cursor

1. achar owner local existente do Tray/Remote-Tray/UnifiedRuntime;
2. provar se já existe implementação reutilizável;
3. ligar device identity + token manager + outbound connection;
4. manter Desktop Commander como manutenção, não transporte principal;
5. só depois absorver no Cockpit/Builder.

BIBLE_REF: 1Co 14:40
BIBLE_SENSE: uma casa organizada, cada peça no seu lugar.
BAIANES_VERSE: “Oxe, uma porteira só no terreiro; quem trabalha por baixo trabalha calado, mas deixa recibo.”
TECHNICAL_PROOF: receipt versionado em branch; runtime ainda não provado.