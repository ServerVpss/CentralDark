export const DESKTOP_SURFACE = "centraldark-desktop-commander";
export const DESKTOP_ORIGIN = "https://mcp.centralldark.com";
export const SUPABASE_ORIGIN = "https://lyoigsqluyktoclwdaft.supabase.co";
export const DESKTOP_PROTOCOL = "centraldark-device-v1";
export function getDesktopPairingConfig(env = process.env) {
    if (env.CENTRALDARK_DESKTOP_PAIRING_ENABLED !== "1") return null;
    return getCentralDarkSupabaseAuthConfig(env);
}
export function getCentralDarkSupabaseAuthConfig(env = process.env) {
    const url = String(env.HUB_SUPABASE_URL || env.SUPABASE_URL || "").replace(/\/$/, "");
    const key = String(env.HUB_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "");
    if (url !== SUPABASE_ORIGIN || !key || key.length > 4096)
        return null;
    if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
        try {
            const parts = key.split(".");
            if (parts.length !== 3)
                return null;
            const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
            if (claims.role !== "anon" || claims.ref !== "lyoigsqluyktoclwdaft")
                return null;
        }
        catch {
            return null;
        }
    }
    return { protocol: DESKTOP_PROTOCOL, supabaseUrl: SUPABASE_ORIGIN, supabasePublishableKey: key, pairingOnly: true };
}
//# sourceMappingURL=desktop-pairing-config.js.map