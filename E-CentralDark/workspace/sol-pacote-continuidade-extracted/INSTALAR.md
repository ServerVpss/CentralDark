# Pacote SOL — continuidade + gateway local

Destino: `E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop\`

Extraia por cima. Os caminhos já batem. Só `opcional/` exige decisão sua.

## O que vai substituir

| Arquivo | O que muda |
|---|---|
| `src/core/state.ts` | ganha a continuidade (checkpoint, âncora, μ, ponto fixo, autorização). A máquina de estados antiga fica intacta. |
| `src/core/state.test.ts` | os 2 testes originais preservados + T01..T18. |
| `scripts/sol-gateway-local.mjs` | **novo**. Gateway local read-only na 8787. |

Nada mais é tocado. `App.tsx`, `intent.ts`, `redaction.ts`, `gateway.ts`,
`voice.ts`, `settings.ts`, Tauri e UI ficam byte a byte iguais.

## Subir

```powershell
cd E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop

npm test                       # esperado: 24 passed
node scripts\sol-gateway-local.mjs     # deixe rodando nesta janela
```

Outra janela:

```powershell
cd E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop
npm run tauri dev
```

Na SOL, Config → Gateway SOL = `http://127.0.0.1:8787/v1/sol/respond` → salvar.

## Testar

| Digite | Esperado |
|---|---|
| `qual o status da missão delta` | resposta do gateway, receipt com `mode: GATEWAY_LOCAL`, `mutation: false` |
| `abre o CRM` | troca de módulo, receipt `status: PASS` |
| `faz deploy agora` | recusa com `status: BLOCKED_AUTHORIZATION` |
| `para tudo` | "Interrupção confirmada" |
| feche o gateway e repita | volta a `Falha controlada` — a menos que aplique `opcional/` |

## opcional/gateway.ts

Faz o app cair no roteador local quando o gateway está fora do ar, em vez de
travar em BLOQUEADA. A degradação fica **marcada**: `gateway_unreachable: true`
e `status: "UNKNOWN"` no receipt, `source: "local"`. Degradar não vira verde.

Só copie para `src/lib/gateway.ts` se quiser esse comportamento. Deixar como
está — quebrando na cara quando o gateway some — também é defensável.

Verificado nas duas configurações: 24 testes passam, e o `tsc` continua com os
mesmos 2 erros que já existiam antes de qualquer mudança (`App.tsx:171` e
`tsconfig.node.json:7`). Nenhum erro novo. Esses 2 são pré-existentes e ficam
fora do escopo deste pacote — são eles que impedem `npm run build`.
