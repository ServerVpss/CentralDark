# Integrar diretamente na sua API

## Uma única função

```javascript
import { runUniversal } from "./GATILHO-UNIVERSAL-IA/src/index.mjs";

const result = await runUniversal(
  "!auditar",
  "C:\\caminho\\do\\alvo",
  {
    provider: "centraldark",
    model: "gpt-5",
    allowedRoot: "C:\\caminho",
    env: process.env
  }
);

console.log(result.output);
console.log(result.receipt);
```

## Express/Fastify/outro framework

A função não depende de Express. No seu endpoint, valide o usuário e repasse somente `command`, `target`, `provider` e `model` para `runUniversal`.

## Assinatura do receipt

Para detectar adulteração posterior:

```powershell
$env:UNIVERSAL_RECEIPT_HMAC_KEY = "<CHAVE_INTERNA_DE_ASSINATURA>"
```

O receipt passa a incluir `signature`. A função `verifyReceiptSignature()` confere a assinatura.
