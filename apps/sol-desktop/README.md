# SOL Desktop · Voice-First POC

O código-fonte completo desta primeira prova está congelado em:

`artifacts/sol-desktop-poc/sol-desktop-poc-source.zip`

SHA-256: `cbde3ed45617ebfcea2c8fbe882272177f85e5b0c24d0af7f7016ab701c6bc13`

## Extrair no Windows

A partir da raiz do clone, nesta branch:

```powershell
Expand-Archive -Force artifacts/sol-desktop-poc/sol-desktop-poc-source.zip .sol-poc
Copy-Item -Recurse -Force .sol-poc/apps/sol-desktop apps/sol-desktop
cd apps/sol-desktop
npm install
npm test
npm run tauri dev
```

## Cadeia canônica

```text
👑 SEGREDO/CHEFE
→ voz ou texto
→ SOL interpreta e coordena
→ PIVETE/HERMES fornece memória e continuidade
→ Gateway/tools executam
→ SOL devolve prova por tela e voz
```

## Incluído

- Tauri v2 + React/TypeScript/Vite;
- janela flutuante e always-on-top;
- temas Overclock e CRM;
- menus SOL, PIVETE, Missões, Agentes, CRM, Builder, Voz e Config;
- push-to-talk por botão e `Ctrl+Shift+Espaço`;
- entrada textual;
- reconhecimento de voz do sistema quando disponível;
- TTS pelo bridge CentralDark ou fallback do Windows;
- gateway plugável;
- botão de interrupção;
- roteador local determinístico;
- receipts com redação de segredos;
- testes unitários do núcleo.

## Limite honesto

O app não automatiza login na conta de consumidor do ChatGPT. A execução real deve usar API ou Gateway CentralDark autorizado. O build Tauri precisa ser provado no Windows do Chefe; neste ambiente foram executados 6/6 testes determinísticos do núcleo e validação dos JSONs, mas a instalação NPM completa ficou bloqueada pela conectividade do registry do sandbox.

## Clean-room

`APPCENTRALDARK EVOLUIR .zip` foi usado como referência funcional. Nenhum binário, banco, sessão, secret ou código compilado do Overclock foi redistribuído. A reutilização literal depende de licença/permissão confirmada com o autor.
