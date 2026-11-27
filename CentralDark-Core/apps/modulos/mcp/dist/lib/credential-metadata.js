// Metadados NAO-SENSIVEIS de credenciais. Unico lugar que descreve credencial para o MCP.
// Regra (decisao do CHEFE, Missao 9): o valor real NUNCA sai por ferramenta MCP consumida
// por modelo. O MCP devolve so existencia, origem, tamanho, idade e fingerprint parcial.
// O valor real so e inspecionavel por canal local fora do modelo: scripts/inspect-credential-local.mjs.
import { createHash } from "node:crypto";
// provider -> NOME_CANONICO -> variaveis de ambiente aceitas (ordem de precedencia).
export const CREDENTIAL_ENV_MAP = Object.freeze({
    cloudflare: { CLOUDFLARE_API_TOKEN: ["CLOUDFLARE_API_TOKEN", "CF_API_TOKEN"] },
    contabo: {
        CONTABO_CLIENT_ID: ["CONTABO_CLIENT_ID"],
        CONTABO_CLIENT_SECRET: ["CONTABO_CLIENT_SECRET"],
        CONTABO_API_USER: ["CONTABO_API_USER"],
        CONTABO_API_PASSWORD: ["CONTABO_API_PASSWORD"],
    },
    tailscale: { TAILSCALE_API_KEY: ["TAILSCALE_API_KEY", "TS_API_KEY"] },
    buildkite: { BUILDKITE_API_TOKEN: ["BUILDKITE_API_TOKEN", "BUILDKITE_TOKEN"] },
});
// Abaixo deste tamanho o hash curto seria atacavel por forca bruta: fingerprint omitido.
export const MIN_LENGTH_FOR_FINGERPRINT = 20;
const FINGERPRINT_HEX = 8;
export function resolveCredential(env, aliases) {
    for (const alias of aliases) {
        const raw = env?.[alias];
        if (raw && String(raw).trim())
            return { alias, raw: String(raw) };
    }
    return null;
}
export function fingerprintOf(value) {
    const s = String(value);
    if (s.length < MIN_LENGTH_FOR_FINGERPRINT)
        return "OMITIDO_VALOR_CURTO";
    return "sha256:" + createHash("sha256").update(s).digest("hex").slice(0, FINGERPRINT_HEX);
}
// Chaves de saida escolhidas para NAO casar com o redator por nome de chave
// (authorization|cookie|password|secret|token|api_key...), senao o proprio metadado seria apagado.
export function credentialMetadata({ provider, name, aliases }, env = process.env, observedAtMs = null) {
    const found = resolveCredential(env, aliases);
    if (!found) {
        return { provider, name, configured: false, origin: "AUSENTE", length: 0, fingerprint: null, ageDays: "NAO_MEDIDO" };
    }
    const ageDays = Number.isFinite(observedAtMs)
        ? Math.max(0, Math.floor((Date.now() - observedAtMs) / 86400000))
        : "NAO_MEDIDO";
    return {
        provider,
        name,
        configured: true,
        origin: `env:${found.alias}`,
        length: found.raw.length,
        fingerprint: fingerprintOf(found.raw),
        ageDays,
    };
}
export function allCredentialMetadata(env = process.env) {
    const out = [];
    for (const [provider, names] of Object.entries(CREDENTIAL_ENV_MAP)) {
        for (const [name, aliases] of Object.entries(names)) {
            out.push(credentialMetadata({ provider, name, aliases }, env));
        }
    }
    return out;
}
export function findCredentialSpec(name) {
    for (const [provider, names] of Object.entries(CREDENTIAL_ENV_MAP)) {
        if (Object.hasOwn(names, name))
            return { provider, name, aliases: names[name] };
    }
    return null;
}
//# sourceMappingURL=credential-metadata.js.map