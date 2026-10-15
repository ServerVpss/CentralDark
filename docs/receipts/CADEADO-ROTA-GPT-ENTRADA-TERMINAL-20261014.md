# 🔒 Selo de observação — entrada GPT no terminal (2026-10-14)

## Intenção e evidência
O CHEFE confirmou em conversa que a rota observada é o **comando/entrada `GPT` no terminal**, **não** a identidade nem a disponibilidade de um modelo.

Evidência de origem: fotografia enviada na conversa de 2026-10-14 (não copiada para o repositório). A imagem mostra:
- campo de entrada do terminal com o texto `GPT` e cursor;
- sugestões repetidas `gpt-5.6-luna-900k` com coluna `ctx --`;
- nenhum resultado de execução do comando `GPT` visível nesse recorte.

## Fronteira da prova
```text
TERMINAL_GPT_INPUT_VISIBLE=PASS
CHEFE_CONFIRMOU_ROTA=YES
COMANDO_GPT_EXECUTADO=NOT_PROVEN
COMANDO_GPT_RESOLVE_DESTINO=UNKNOWN
AUTENTICACAO_DA_ROTA=UNKNOWN
MODELO_GPT_ATIVO=NOT_PROVEN
INTEGRACAO_CENTRALDARK_RUNTIME=NOT_PROVEN
TECHNICAL_ACL_LOCK=NOT_APPLIED
```

**Selo restrito:** somente a entrada visível `GPT` e a confirmação do CHEFE. Não atribuir execução, autenticação, disponibilidade de modelo, CLI instalada ou persistência fora desse recibo.

## Reuso no Circuito / Instinto Superior
- Rota candidata: `Terminal → GPT`; registrar como **entrada observada**.
- Antes de promover a `PASS EXECUTÁVEL`, confirmar o comando exato acionado, o resultado de execução e a conexão ao owner existente, com timestamp e receipt sanitizado.
- Reutilizar o botão `👁️ Circuito — Vazamentos` do HUD existente; não criar núcleo paralelo nem exibir verde falso.
- Segredos não transitam por GitHub, HUD, logs ou recibos.

## Ledger
Repositório `ServerVpss/CentralDark` · `main` · PR-mãe #1562 somente como âncora, não mergear. 
Método: observar → registrar evidência → entregar rastro → selar somente o escopo comprovado.

## Delta de prova — 2026-10-14: voz → Terminal 6 → mensagem `Oi Hermes`

**Intenção específica:** CHEFE ditou `Oi Hermes` por voz; executar o Enter **na mesma sessão já aberta** do VS Code, sem criar outro Hermes nem reescrever a entrada. A confirmação de recebimento veio do próprio CHEFE após a ação. Esta etapa é distinta do `GPT` observado na fotografia original.

**Rastro de execução observado nesta conversa:**
- Origem: Casa `SEGREDO`, via Desktop Commander autorizado; destino da ação: janela `HERMES-WIRITER - Visual Studio Code [Administrador]`, processo Windows `Code` PID `26296` (PID volátil).
- O teste discriminante anterior mostrou erro de foco: janela `ChatGPT`/`Terminal input`, portanto **não** foi contado como Enter no VS Code.
- Na tentativa válida houve `APPACTIVATE=True`, janela ativa `HERMES-WIRITER` e foco UIAutomation `Terminal 6, HERMES-WIRITER`, classe `xterm-helper-textarea`, PID `26296`. O programa de envio retornou `ENTER_DISPATCHED_TO_CONFIRMED_TERMINAL_6` e completou.
- Texto já presente antes do Enter: `Oi Hermes`, conforme confirmação visual e correção do CHEFE. **Não houve nova digitação no envio válido.**
- Contraprova humana imediata do CHEFE: **“O Enter já foi enviado, você já mandô e já acabou de chegá. Sela.”** A recepção é classificada como **confirmada pelo CHEFE**; não como leitura automatizada da resposta do Hermes.

**Skill / owner reutilizado:** `skills/vs-code-restore/SKILL.md` e `skills/vs-code-restore/tools/map-vscode-ui.ps1` foram lidos na `main`; orientam identificação de janela/controle antes de agir e contraprova após a ação. A execução usou **Windows UIAutomation + Desktop Commander**, sensor complementar previsto na skill. **Não** se invocou `CentralDark: Restaurar bancada` nem `centraldark.restoreWorkspace`, pois isso criaria terminais novos. A extensão nativa instalada/ativa continua sujeita à prova própria; este receipt não a promove a runtime PASS.

```text
CASA_DEVICE_ROUTE=OBSERVED_ONLINE
TARGET_WINDOW_REIDENTIFIED=PASS
TARGET_TERMINAL_6_FOCUS=PASS
ENTER_DISPATCH_TO_TERMINAL_6=PASS
MESSAGE_DELIVERY=CHEFE_CONFIRMED
HERMES_RESPONSE_PAYLOAD_READBACK=NOT_MEASURED
VOICE_TO_UI_THIS_MESSAGE=RECEIVED_USER_CONFIRMATION
JARVIS_VOICE_GENERAL_AUTOMATION=NOT_PROVEN
GPT_COMMAND_EXECUTION=NOT_PROVEN
TECHNICAL_ACL_LOCK=NOT_APPLIED
SEAL_SCOPE=THIS_MESSAGE_DELIVERY_ONLY
```

**🔒 Cadeado documental:** selo para **esta entrega de mensagem** com ação local comprovada e recepção confirmada pelo CHEFE. Não selar autonomamente a CLI `GPT`, um modelo, todas as sessões Hermes, o circuito inteiro ou um mecanismo técnico de bloqueio contra escrita.

**NEXT_CURSOR:** reutilizar a mesma janela/terminal e a sequência de foco comprovada; obter readback da resposta do Hermes e só depois promover um contrato determinístico de ida e volta. Sem duplicar skill, terminal ou arquitetura.
