from pathlib import Path
import re
root=Path(r"F:\_worktrees\mcp-api-cockpit-20261024")
p=root/"apps/modulos/mcp/src/oauth.js"
c=root/"apps/instinto-superior/public/mcp-legado"
c.mkdir(parents=True,exist_ok=True)
s=p.read_text(encoding="utf-8")
def between(s,a,b):
    x=s.find(a);y=s.find(b,x+len(a))
    if x<0 or y<0: raise Exception("ANCHOR_MISSING:"+a)
    return s[:x]+s[y:],s[x:y]
s, success=between(s,"function sendOAuthSuccessPage(res, input) {","export function getProtectedResourceMetadata")
(c/"oauth-sucesso.original.src.txt").write_text(success,encoding="utf-8")
s, consent=between(s,"const SCOPE_LABELS = {","export function postRegister")
(c/"oauth-consentimento.original.src.txt").write_text(consent,encoding="utf-8")
new='''function sendOwnerConsentPage(res, input) {
    const url = new URL("https://admin.centralldark.com/mcp-autorizar");
    const values = {
        client_id: input.client_id,
        client_name: input.client_name,
        redirect_uri: input.redirect_uri,
        response_type: input.response_type,
        code_challenge: input.code_challenge,
        code_challenge_method: input.code_challenge_method,
        state: input.client_state,
        scope: input.scope,
        pair_id: input.device?.pairId,
        error: input.error,
        success: input.success === true ? "1" : undefined,
    };
    for (const [key, value] of Object.entries(values)) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.redirect(302, url.toString());
}
'''
s=s.replace("export function postRegister",new+"export function postRegister",1)
s,helpers=between(s,"function escapeHtml(value) {","export function getProtectedResourceMetadata")
# URI OAuth expõe apenas /api/mcp como resource, independentemente do perfil.
s,count=re.subn(r'(?m)^\s*resource:.*?\b(?:admin/mcp|"/mcp").*?,\s*$','        resource: config.publicUrl + "/api/mcp",',s,count=1)
if count!=1:raise Exception("OAUTH_RESOURCE_URL_NOT_FOUND")
s,count=re.subn(r'(?m)^\s*resource_documentation:.*?,\s*$','        resource_documentation: "https://admin.centralldark.com/sala-controle",',s,count=1)
if count!=1:raise Exception("OAUTH_RESOURCE_DOC_NOT_FOUND")
s=s.replace('const isAdminResource = /\\/admin\\/mcp(?:$|[?#])/.test(resource);',
'''const isAdminResource = /(?:^|\\s)admin(?:\\s|$)/.test(requestedScope)
            || /\\/admin\\/mcp(?:$|[?#])/.test(resource);''')
if "const isAdminResource = /\\/admin\\/mcp" in s:raise Exception("OAUTH_SCOPE_PATCH_FAILED")
s=s.replace('pairId, code: param(req, "pair_code"), nonce: param(req, "pair_nonce")',
            'pairId, code: param(req, "pair_code"), nonce: pair.nonce')
p.write_text(s,encoding="utf-8",newline="\n")
print("OAuth screens moved to Cockpit /mcp-autorizar")
