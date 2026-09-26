# SOL Desktop · Voice-First POC

Primeira prova executável da superfície SOL no Windows.

## Cadeia canônica

```text
👑 SEGREDO/CHEFE
→ voz ou texto
→ SOL interpreta e coordena
→ PIVETE/HERMES fornece memória e continuidade
→ Gateway/tools executam
→ SOL devolve prova por tela e voz
```

## O que esta versão já prova

- shell Tauri v2 flutuante e always-on-top;
- dois temas: Overclock e CRM;
- módulos visíveis para SOL, PIVETE, Missões, Agentes, CRM, Builder e Voz;
- push-to-talk por botão e `Ctrl+Shift+Espaço`;
- reconhecimento de voz do sistema quando a WebView oferecer API compatível;
- entrada textual como fallback;
- TTS pelo bridge CentralDark quando configurado;
- TTS do Windows como fallback;
- roteador determinístico local para status, cancelamento e abertura de módulos;
- gateway plugável para execução real;
- estado explícito e botão de interrupção;
- receipts sanitizados;
- nenhuma chave versionada.

## Rodar no Windows

Pré-requisitos: Node.js 22+, Rust estável, ferramentas de build C++ do Visual Studio e WebView2.

```powershell
cd apps/sol-desktop
npm install
npm test
npm run tauri dev
```

## Configurar voz SOL

Na tela **Config**:

- `Gateway SOL`: endpoint CentralDark que recebe intenção e devolve `{ text, receipt }`;
- `Bridge TTS`: por padrão `https://bridge.centralldark.com/v1/audio/speech`;
- chaves são armazenadas apenas no armazenamento local da WebView;
- nenhuma chave deve ser commitada.

## Limite honesto da prova

Esta versão não automatiza login na conta de consumidor do ChatGPT e não depende de sessão web privada. Execução real entra por API/gateway autorizado. O modo local continua útil para testar janela, voz, temas, interrupção e navegação antes do Gateway.

## Regra clean-room

O arquivo local `APPCENTRALDARK EVOLUIR .zip` foi usado para mapear funções e comportamento. Nenhum binário, arquivo compilado ou código proprietário do Overclock foi copiado para este app. A implementação é própria e a licença/origem do material de referência deve ser confirmada antes de qualquer reutilização literal.
