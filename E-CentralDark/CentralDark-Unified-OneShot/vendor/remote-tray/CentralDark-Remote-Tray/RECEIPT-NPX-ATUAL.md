# RECEIPT · NPX ATUAL

Correção aplicada porque a realidade mostrou o comando funcional:

```text
npx @wonderwhy-er/desktop-commander@latest remote
```

Delta:
- engine voltou para `@wonderwhy-er/desktop-commander@latest`;
- adicionados `ABRIR-MODO-TERMINAL-NPX-ATUAL.cmd` e `RUN-NPX-ATUAL.cmd`;
- pacote mantém o Tray, mas agora também tem entrada terminal que mostra exatamente o fluxo `Starting MCP Device -> Connected -> Device ready`;
- sem Screenpipe;
- sem Hermes como runtime;
- sem linhagem paralela numerada.

Estado medido por este chat após instalação do app ChatGPT:

```text
ChatGPT Remote_Desktop_Commander.list_devices = []
```

Logo: CASA_LOCAL pelo print/log do usuário está online, mas CHATGPT_TOOL_DEVICE ainda não está vinculado.
