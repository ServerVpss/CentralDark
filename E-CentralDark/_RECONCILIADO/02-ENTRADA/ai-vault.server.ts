// Cofre de chaves de IA (server-only).
// Criptografa/descriptografa api_key usando AI_VAULT_KEY com AES-256-GCM.
// Formato armazenado: v1.<iv_b64>.<tag_b64>.<cipher_b64>
// NUNCA importar em código de browser.

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const secret = process.env.AI_VAULT_KEY;
  if (!secret || secret.length < 16) {
    throw new Error("AI_VAULT_KEY ausente ou fraco. Avise o suporte técnico.");
  }
  // Deriva 32 bytes determinísticos a partir do segredo
  cachedKey = scryptSync(secret, "multizap-ai-vault-v1", 32);
  return cachedKey;
}

export function encryptApiKey(plain: string): string {
  if (!plain) throw new Error("Chave vazia.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

export function decryptApiKey(stored: string): string {
  if (!stored?.startsWith("v1.")) {
    throw new Error("Formato de chave inválido no cofre.");
  }
  const [, ivB64, tagB64, encB64] = stored.split(".");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const enc = Buffer.from(encB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

export function last4(plain: string): string {
  return plain.slice(-4);
}
