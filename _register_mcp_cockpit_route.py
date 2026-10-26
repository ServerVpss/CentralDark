from pathlib import Path
p=Path(r"F:\_worktrees\mcp-api-cockpit-20261024\apps\instinto-superior\src\routeTree.gen.ts")
s=p.read_text(encoding="utf-8")
def add_before(marker,value,expected=1):
    global s
    if s.count(marker)!=expected:raise ValueError(str(s.count(marker))+" x "+marker[:30])
    s=s.replace(marker,value+marker)
add_before("import { Route as CockpitRouteImport }",
           "import { Route as McpAutorizarRouteImport } from './routes/mcp-autorizar'\n")
add_before("const CockpitRoute = CockpitRouteImport.update({",
'''const McpAutorizarRoute = McpAutorizarRouteImport.update({
  id: '/mcp-autorizar',
  path: '/mcp-autorizar',
  getParentRoute: () => rootRouteImport,
} as any)
''')
for marker in [
"export interface FileRoutesByFullPath {",
"export interface FileRoutesByTo {",
"export interface FileRoutesById {"
]:
    add_before(marker+"\n",marker+"\n  '/mcp-autorizar': typeof McpAutorizarRoute\n",1)
    s=s.replace(marker+"\n"+marker+"\n","",1) if marker+"\n"+marker+"\n" in s else s
# Above add_before already includes marker; remove duplicate occurrence in place manually
s=s.replace("export interface FileRoutesByFullPath {\n  '/mcp-autorizar': typeof McpAutorizarRoute\nexport interface FileRoutesByFullPath {\n",
            "export interface FileRoutesByFullPath {\n  '/mcp-autorizar': typeof McpAutorizarRoute\n")
s=s.replace("export interface FileRoutesByTo {\n  '/mcp-autorizar': typeof McpAutorizarRoute\nexport interface FileRoutesByTo {\n",
            "export interface FileRoutesByTo {\n  '/mcp-autorizar': typeof McpAutorizarRoute\n")
s=s.replace("export interface FileRoutesById {\n  '/mcp-autorizar': typeof McpAutorizarRoute\nexport interface FileRoutesById {\n",
            "export interface FileRoutesById {\n  '/mcp-autorizar': typeof McpAutorizarRoute\n")
# Adicionar aos unions de fullPath, to, id
s=s.replace("    | '/cockpit'\n","    | '/cockpit'\n    | '/mcp-autorizar'\n",2)
s=s.replace("    | '/_authenticated'\n","    | '/_authenticated'\n    | '/mcp-autorizar'\n",1)
s=s.replace("export interface RootRouteChildren {\n",
            "export interface RootRouteChildren {\n  McpAutorizarRoute: typeof McpAutorizarRoute\n",1)
needle="    '/cockpit': {\n      id: '/cockpit'"
segment="""    '/mcp-autorizar': {
      id: '/mcp-autorizar'
      path: '/mcp-autorizar'
      fullPath: '/mcp-autorizar'
      preLoaderRoute: typeof McpAutorizarRouteImport
      parentRoute: typeof rootRouteImport
    }
"""
if s.count(needle)!=1:raise ValueError("missing FileRoutesByPath anchor")
s=s.replace(needle,segment+needle,1)
s=s.replace("  CockpitRoute: CockpitRoute,\n","  CockpitRoute: CockpitRoute,\n  McpAutorizarRoute: McpAutorizarRoute,\n",1)
p.write_text(s,encoding="utf-8",newline="\n")
print("New /mcp-autorizar route registered in Cockpit routeTree")
