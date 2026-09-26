# SOL Desktop POC — Referência de Operação

**Localização:** `E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop`
**Tipo:** Vite + React 19 + Tauri v2 (app desktop nativo Windows)
**Status:** POC funcional — primeira prova executável da superfície SOL no Windows.

---

## Como subir (dev server web)

```bash
cd "E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop"
npm run dev
```

- Sobe em **porta 1420** (Vite auto-escolhe, não 5173)
- URL: `http://localhost:1420` ou `http://[::1]:1420`
- É a **versão web do POC** — roda no navegador
- Hot reload ativo

---

## Como subir (app nativo Tauri)

```bash
cd "E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop"
npm run tauri dev
```

Pré-requisitos:
- Node.js 22+
- Rust estável (`rustup default stable`)
- Ferramentas de build C++ do Visual Studio (Desktop development with C++)
- WebView2 Runtime (já incluso no Windows 10/11 atualizado)

---

## O que o POC já prova (do README)

| Funcionalidade | Status |
|----------------|--------|
| Janela flutuante always-on-top (Tauri) | ✅ |
| Temas: Overclock / CRM | ✅ |
| Módulos visíveis: SOL, PIVETE, Missões, Agentes, CRM, Builder, Voz | ✅ |
| Push-to-talk: botão + `Ctrl+Shift+Espaço` | ✅ |
| STT do sistema (quando WebView oferece API compatível) | ✅ |
| Entrada textual como fallback | ✅ |
| TTS via bridge CentralDark (quando configurado) | ✅ |
| TTS do Windows como fallback | ✅ |
| Roteador determinístico local: status, cancelamento, abrir módulos | ✅ |
| Gateway plugável para execução real | ✅ |
| Estado explícito + botão de interrupção | ✅ |
| Receipts sanitizados | ✅ |
| Zero chaves versionadas | ✅ |

---

## Configuração de voz (tela Config no app)

| Campo | Exemplo | Onde fica |
|-------|---------|-----------|
| `Gateway SOL` | `https://api.centralldark.com/v1/intent` (endpoint que recebe intenção e devolve `{ text, receipt }`) | LocalStorage da WebView |
| `Bridge TTS` | `https://bridge.centralldark.com/v1/audio/speech` (padrão) | LocalStorage da WebView |
| Chaves | Armazenadas só no LocalStorage da WebView — **nunca commitadas** | — |

---

## Limite honesto (do README)

- ❌ **Não** automatiza login na conta de consumidor do ChatGPT
- ❌ **Não** depende de sessão web privada
- ❌ Execução real entra por API/gateway autorizado (precisa configurar `Gateway SOL` + `Bridge TTS`)
- ✅ Modo local útil para testar: janela, voz, temas, interrupção, navegação antes do Gateway

---

## Regra clean-room

O arquivo local `APPCENTRALDARK EVOLUIR .zip` foi usado para mapear funções e comportamento. **Nenhum binário, arquivo compilado ou código proprietário do Overclock foi copiado**. A implementação é própria. Licença/origem do material de referência deve ser confirmada antes de qualquer reutilização literal.

---

## Integração com Hermes (profile pivete)

| Ponte | Como |
|-------|------|
| **MCP `hermes-studio-mcp.mjs`** | OpenClaw já tem este MCP — pode chamar Hermes Web UI (porta 8648) |
| **API Server Hermes** | Precisa `API_SERVER_KEY` no `.env` + restart gateway (R2) |
| **Arquivo compartilhado** | `C:\Shared\bridge\inbox.json` / `outbox.json` (R1) |
| **Claude Code CLI** | Ambos (OpenClaw agent:main E Hermes) podem spawnar `claude -p "..."` |

---

## Verificação rápida (read-only)

```bash
# Ver se dev server tá no ar
curl -s http://localhost:1420 | head -5

# Ver processos
tasklist | findstr -i "vite\|tauri\|node"

# Ver porta
netstat -an | findstr 1420
```

---

## Pitfalls conhecidos

| Problema | Causa | Solução |
|----------|-------|---------|
| Porta não é 5173 | Vite escolhe porta livre (1420) | Usar `curl http://localhost:1420` ou ver output do `npm run dev` |
| `npm run tauri dev` falha | Rust/WebView2/Visual Studio não instalados | Instalar pré-requisitos listados acima |
| TTS não fala | `Bridge TTS` não configurado ou chave inválida | Configurar na tela Config do app |
| STT não ouve | WebView2 não expõe API de reconhecimento | Usar entrada textual (fallback) |
| App não abre | Processo anterior travado | `taskkill /f /im sol-desktop.exe` e tentar de novo |

---

## Próximos passos para produção (fora do escopo do POC)

1. Configurar `Gateway SOL` real (CentralDark) + `Bridge TTS` real
2. Build Tauri: `npm run tauri build` → gera `.msi` / `.exe` instalável
3. Assinatura de código (code signing) para distribuição
4. Auto-updater (Tauri updater plugin)
5. Integração com Hermes profile pivete via MCP ou API Server

---

## Referências relacionadas

- `openclaw-vs-hermes-distinction.md` — arquitetura separada OpenClaw vs Hermes
- `boot-diagnostic-checklist.md` — procedimento de boot do profile pivete
- `desktop-dashboard-boundaries.md` — desktop × dashboard × gateway × profile
- `gateway-duplicate-loop.md` — diagnóstico de gateway duplicado