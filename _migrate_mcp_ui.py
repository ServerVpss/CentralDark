from pathlib import Path
import re
root=Path(r"F:\_worktrees\mcp-api-cockpit-20261024")
mcp=root/"apps/modulos/mcp/src"
site=root/"apps/instinto-superior"
arc=site/"public/mcp-legado"
arc.mkdir(parents=True,exist_ok=True)
def read(p):return p.read_text(encoding="utf-8")
def save(p,t):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(t,encoding="utf-8",newline="\n")
def subonce(t,a,b):
    if t.count(a)!=1:raise ValueError("ANCHOR "+a[:50]+" COUNT "+str(t.count(a)))
    return t.replace(a,b,1)
def between(t,a,b):
    x=t.find(a); y=t.find(b,x+len(a))
    if x<0 or y<0:raise ValueError("BETWEEN "+a[:50])
    return t[:x]+t[y:],t[x:y]

# UI de painel, padroes e testes originais arquivados sob o owner Cockpit.
for source,dest in [
    ("painel.js","painel.original.js.txt"),
    ("admin-patterns-ui.js","padroes.original.js.txt"),
    ("admin-patterns-ui.test.mjs","padroes.test.original.txt")
]:
    f=mcp/source;save(arc/dest,read(f));f.unlink()

p=mcp/"admin.js";a=read(p)
a=subonce(a,'import { injectPatternAdmin } from "./admin-patterns-ui.js";\n',"")
for n in ("LOGIN_HTML","NOC_HTML","INTENT_CONTROLS"):
    tick=chr(96)
    pattern=re.compile("const "+n+" = "+re.escape(tick)+r"(.*?)"+re.escape(tick)+r";\s*\n",re.S)
    m=pattern.search(a)
    if not m:raise ValueError("HTML_TEMPLATE "+n+" NOT_FOUND")
    save(arc/(n.lower()+".original.txt"),m.group(1))
    a=a[:m.start()]+a[m.end():]
a,old=between(a,"export function adminGet(req, res) {","export async function adminGraphProxy")
a=a.replace("export async function adminGraphProxy",'''export function adminGet(_req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.redirect(302, "https://admin.centralldark.com/sala-controle");
}
export async function adminGraphProxy''',1)
a=subonce(a,'res.status(500).type("text/html").send(LOGIN_HTML.replace("__ERR__", "MCP_ADMIN_PASSWORD não configurada no .env"));','res.status(500).json({ok:false,error:"MCP_ADMIN_PASSWORD_NOT_CONFIGURED"});')
a=subonce(a,'res.status(401).type("text/html").send(LOGIN_HTML.replace("__ERR__", "Senha incorreta."));','res.status(401).json({ok:false,error:"MCP_ADMIN_PASSWORD_INVALID"});')
a=subonce(a,'    res.redirect(302, "/admin");\n}\n\nexport function adminLogout','    if (req.accepts("json")) res.json({ok:true,authenticated:true});\n    else res.redirect(302, "https://admin.centralldark.com/sala-controle");\n}\n\nexport function adminLogout')
a=subonce(a,'    res.redirect(302, "/admin");\n}\n\nexport function adminRotas','    res.redirect(302, "https://admin.centralldark.com/sala-controle");\n}\n\nexport function adminRotas')
save(p,a)

p=mcp/"tools/status.js";s=read(p);pos=s.index("export async function getStatusHtml")
save(arc/"status.original.js.txt",s[pos:]);save(p,s[:pos]+"// UI transferida para Sala de Controle do Cockpit.\n")

p=mcp/"index.js";i=read(p)
i=subonce(i,'import { getStatusHtml, getStatusJson } from "./tools/status.js";','import { getStatusJson } from "./tools/status.js";')
i,pairing=between(i,'app.get("/admin/pairing", (req, res) => {','\napp.post("/integrations/buildkite/webhook"')
save(arc/"pareamento.original.src.txt",pairing)
i=i.replace('\napp.post("/integrations/buildkite/webhook"','''app.get("/admin/pairing", (_req, res) => {
    res.redirect(302, "https://admin.centralldark.com/sala-controle");
});
app.post("/integrations/buildkite/webhook"''',1)
i=subonce(i,'''app.get("/status", (req, res) => {
    getStatusHtml(req, res).catch(() => {
        if (!res.headersSent)
            res.status(500).send("Erro ao gerar status.");
    });
});''','''app.get("/status", (_req, res) => {
    res.redirect(302, "https://admin.centralldark.com/sala-controle");
});''')
i=subonce(i,'app.post("/mcp", (req, res) => {','app.post("/api/mcp", (req, res) => {')
i=subonce(i,'app.get("/mcp", (req, res) => {','app.get("/api/mcp", (req, res) => {')
i=subonce(i,'''        admin: false,
        callerUser: r.callerUser,''','''        admin: /(?:^|\s)admin(?:\s|$)/.test(String(r.oauthScope || "")),
        authProvenance: /(?:^|\s)admin(?:\s|$)/.test(String(r.oauthScope || "")) ? "verified_oauth_admin" : null,
        callerUser: r.callerUser,''')
i,legacy_admin=between(i,'// ─────────────── /admin/mcp — endpoint MCP com escopo admin obrigatório ───────────────','app.get("/admin/catalog"')
i,legacy_alias=between(i,'// Alias de compatibilidade: /mcp/admin converge para o MESMO handler /admin/mcp.','// /mcp-public removido')
i=subonce(i,'''    if (req.method === "GET"
        && (path === "/admin/api/logs" || path === "/admin/api/metricas")
        && cockpitAdminReadOrigins.has(origin)) {''','''    if (cockpitAdminReadOrigins.has(origin)
        && (path.startsWith("/admin/api/") || path === "/admin/login" || path === "/admin/logout"
            || path.startsWith("/device/"))) {''')
i=subonce(i,'const app = express();\napp.disable("x-powered-by");','''const app = express();
app.disable("x-powered-by");
app.get("/", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ ok:true, service:"CentralDark MCP", api:"/api/mcp",
        ui:"https://admin.centralldark.com/sala-controle" });
});''')
i=i.replace('"/mcp": {','"/api/mcp": {')
# OpenAPI: remove entrada legada /admin/mcp (a API e uma unica rota).
start=i.find('        "/admin/mcp": {')
if start>=0:
    end=i.find('        "/status.json": {',start)
    if end<0:raise ValueError("OPENAPI_END_MISSING")
    i=i[:start]+i[end:]
i=i.replace('replacement: "/mcp"','replacement: "/api/mcp"')
i=i.replace('POST /mcp ', 'POST /api/mcp ')
i=i.replace('em /mcp.', 'em /api/mcp.')
save(p,i)

p=site/"src/components/central/CockpitShell.tsx";c=read(p)
c=subonce(c,'import { PainelAdminCentralDark } from "@/components/central/PainelAdminCentralDark";',
'''import { PainelAdminCentralDark } from "@/components/central/PainelAdminCentralDark";
import { McpConsoleCentralDark } from "@/components/central/McpConsoleCentralDark";''')
c=subonce(c,'                <div className="mt-6"><PainelAdminCentralDark key={versaoAdmin} estado={dado} abaInicial={abaAdminInicial} /></div>',
'''                <div className="mt-6"><PainelAdminCentralDark key={versaoAdmin} estado={dado} abaInicial={abaAdminInicial} /></div>
                <McpConsoleCentralDark />''')
save(p,c)

p=site/"src/components/central/McpConsoleCentralDark.tsx";c=read(p)
c=c.replace('endpoint: "/admin/', 'publico: false, endpoint: "/admin/')
c=c.replace('endpoint: "/device/devices"', 'publico: false, endpoint: "/device/devices"')
save(p,c)
print("UI moved to Cockpit; MCP endpoint /api/mcp; old HTML removed from admin, status, index, painel")
