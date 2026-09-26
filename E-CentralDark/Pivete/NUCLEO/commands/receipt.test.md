# COMANDO - receipt.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\evidence\session-completa-20260806\.extracted_GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO\GATILHO-UNIVERSAL-IA\tests\receipt.test.mjs
**SHA:** ad0fceee11daab34
**Timestamp:** 2026-08-28T02:57:25.471142
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const receipt = buildReceipt({ command: "#x", mode: "standard", status: "PASS", configHash: "a", prompt: "b", output: "c", target: {} }, { hmacKey: "key" });
- const receipt = buildReceipt({ command: "#x", mode: "standard", status: "PASS", configHash: "a", prompt: "b", output: "c", target: {} }, { hmacKey: "key" });
- const receipt = buildReceipt({ command: "#x", mode: "standard", status: "PASS", configHash: "a", prompt: "b", output: "c", target: {} }, { hmacKey: "key" });

### Ouro Bruto (primeiros 5000 chars)
```
import test from "node:test";
import assert from "node:assert/strict";
import { buildReceipt, verifyReceiptSignature } from "../src/receipt.mjs";

test("receipt HMAC válido é verificável", () => {
  const receipt = buildReceipt({ command: "#x", mode: "standard", status: "PASS", configHash: "a", prompt: "b", output: "c", target: {} }, { hmacKey: "key" });
  assert.equal(verifyReceiptSignature(receipt, "key"), true);
});

test("receipt adulterado falha", () => {
  const receipt = buildReceipt({ command: "#x", mode: "standard", status: "PASS", configHash: "a", prompt: "b", output: "c", target: {} }, { hmacKey: "key" });
  receipt.status = "FAIL";
  assert.equal(verifyReceiptSignature(receipt, "key"), false);
});

test("receiptHash adulterado falha", () => {
  const receipt = buildReceipt({ command: "#x", mode: "standard", status: "PASS", configHash: "a", prompt: "b", output: "c", target: {} }, { hmacKey: "key" });
  receipt.receiptHash = "0".repeat(64);
  assert.equal(verifyReceiptSignature(receipt, "key"), false);
});

```