import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { sanitizeObject, sha256 } from "./sanitize.mjs";

/**
 * LEIGO: assina o comprovante para detectar alteração depois da execução.
 * PROFISSIONAL: HMAC-SHA256 sobre o receipt sem os campos de assinatura.
 */
export function signReceipt(receipt, hmacKey) {
  if (!hmacKey) return null;
  const payload = { ...receipt };
  delete payload.signature;
  return crypto.createHmac("sha256", hmacKey).update(JSON.stringify(payload)).digest("hex");
}

/**
 * LEIGO: confere se o comprovante assinado continua igual ao original.
 * PROFISSIONAL: recalcula HMAC e compara em tempo constante.
 */
export function verifyReceiptSignature(receipt, hmacKey) {
  if (!receipt?.signature || !hmacKey) return false;
  const unsigned = { ...receipt };
  delete unsigned.signature;
  const hashPayload = { ...unsigned };
  delete hashPayload.receiptHash;
  if (sha256(hashPayload) !== receipt.receiptHash) return false;
  const expected = Buffer.from(signReceipt(receipt, hmacKey), "hex");
  const actual = Buffer.from(String(receipt.signature), "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

/**
 * LEIGO: cria um comprovante com o que entrou, qual rota respondeu e qual foi o resultado.
 * PROFISSIONAL: produz receipt sanitizado com UUID, hashes de entrada/config/alvo, status tipado e HMAC opcional.
 */
export function buildReceipt(data, options = {}) {
  const safe = sanitizeObject(data);
  const receipt = {
    schemaVersion: 1,
    requestId: data.requestId || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    command: safe.command,
    mode: safe.mode,
    status: safe.status,
    provider: safe.provider || null,
    model: safe.model || null,
    endpoint: safe.endpoint || null,
    targetType: safe.target?.type || null,
    targetPath: safe.target?.path || null,
    targetHash: safe.target?.sha256 || null,
    configHash: safe.configHash,
    inputHash: sha256({ command: safe.command, target: safe.target, prompt: safe.prompt }),
    outputHash: safe.output ? sha256(safe.output) : null,
    independence: safe.independence || null,
    errors: safe.errors || [],
  };
  receipt.receiptHash = sha256(receipt);
  receipt.signature = signReceipt(receipt, options.hmacKey);
  return receipt;
}

/**
 * LEIGO: salva o comprovante sem sobrescrever outro.
 * PROFISSIONAL: usa nome UUID e rename atômico com temporário UUID para tolerar concorrência.
 */
export async function saveReceipt(receipt, receiptsDir) {
  await fs.mkdir(receiptsDir, { recursive: true });
  const finalPath = path.join(receiptsDir, `${receipt.requestId}.json`);
  const tempPath = `${finalPath}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
  await fs.rename(tempPath, finalPath);
  return finalPath;
}
