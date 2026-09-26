from pathlib import Path
import re
repo = Path(r'E:\CentralDark\worktrees\pr-mae-issues-20260915')
# settings.ts
p = repo/'apps/modulos/obsidian-plugin-grafo-vivo/src/settings.ts'
s = p.read_text(encoding='utf-8')
s = re.sub(r'<<<<<<< HEAD\n  // Padrão 2026:.*?>>>>>>> d41054839 \(🧿 fix\(graph\): convergir Obsidian pela API única\)\n', '  // Padrão 2026-09-15: consumidores internos passam pela API única CentralDark.\n  // A API segura encaminha /api/graph ao GraphPanel; grafo.centralldark.com fica origem interna/legado.\n', s, flags=re.S)
s = re.sub(r'<<<<<<< HEAD\n\s*\.setDesc\("Endpoint autenticado da API CentralDark que retorna \{nodes, edges\}\."\)\n=======\n\s*\.setDesc\("Endpoint seguro da API única que retorna o JSON \{nodes, edges\}\."\)\n>>>>>>> d41054839 \(🧿 fix\(graph\): convergir Obsidian pela API única\)\n', '      .setDesc("Endpoint seguro/autenticado da API única CentralDark que retorna o JSON {nodes, edges}.")\n', s)
p.write_text(s, encoding='utf-8')
# view.ts
p = repo/'apps/modulos/obsidian-plugin-grafo-vivo/src/view.ts'
s = p.read_text(encoding='utf-8')
s = re.sub(r'const headers = this\.plugin\.settings\.knowledgeHubToken\n<<<<<<< HEAD\n\s*\? \{ Authorization: `Bearer \$\{this\.plugin\.settings\.knowledgeHubToken\}` \}\n=======\n\s*\? \{ Authorization: `Bearer \$\{this\.plugin\.settings\.knowledgeHubToken\}`, "x-api-key": this\.plugin\.settings\.knowledgeHubToken \}\n>>>>>>> d41054839 \(🧿 fix\(graph\): convergir Obsidian pela API única\)\n\s*: undefined;', 'const headers = this.plugin.settings.knowledgeHubToken\n        ? { Authorization: `Bearer ${this.plugin.settings.knowledgeHubToken}`, "x-api-key": this.plugin.settings.knowledgeHubToken }\n        : undefined;', s, flags=re.S)
s = s.replace('interface ArestaGrafo {\n  source: string;\n  target: string;\n  ativa?: boolean;\n}', 'interface ArestaGrafo {\n  source: string;\n  target: string;\n  ativa?: boolean;\n  visual?: boolean;\n}')
p.write_text(s, encoding='utf-8')
# view3d.ts
p = repo/'apps/modulos/obsidian-plugin-grafo-vivo/src/view3d.ts'
s = p.read_text(encoding='utf-8')
pattern = r'const headers = this\.plugin\.settings\.knowledgeHubToken\n\s*\? \{ Authorization: `Bearer \$\{this\.plugin\.settings\.knowledgeHubToken\}` \}\n\s*: undefined;\n\s*const resp = await requestUrl\(\{\n<<<<<<< HEAD\n\s*url: this\.plugin\.settings\.urlGrafo,\n\s*method: "GET",\n\s*headers,\n=======\n\s*url: this\.plugin\.settings\.urlGrafo\.replace\(/\\\?\.\*\$/, ""\) \+ "\?mode=full",\n\s*method: "GET",\n\s*headers: this\.plugin\.settings\.knowledgeHubToken\n\s*\? \{ Authorization: `Bearer \$\{this\.plugin\.settings\.knowledgeHubToken\}`, "x-api-key": this\.plugin\.settings\.knowledgeHubToken \}\n\s*: undefined,\n>>>>>>> d41054839 \(🧿 fix\(graph\): convergir Obsidian pela API única\)\n\s*\}\);'
repl = 'const headers = this.plugin.settings.knowledgeHubToken\n        ? { Authorization: `Bearer ${this.plugin.settings.knowledgeHubToken}`, "x-api-key": this.plugin.settings.knowledgeHubToken }\n        : undefined;\n      const url = this.plugin.settings.urlGrafo.replace(/\\?.*$/, "") + "?mode=full";\n      const resp = await requestUrl({ url, method: "GET", headers });'
s2 = re.sub(pattern, repl, s, flags=re.S)
if s2 == s:
    s2 = s.replace('<<<<<<< HEAD\n        url: this.plugin.settings.urlGrafo,\n        method: "GET",\n        headers,\n=======\n        url: this.plugin.settings.urlGrafo.replace(/\\?.*$/, "") + "?mode=full",\n        method: "GET",\n        headers: this.plugin.settings.knowledgeHubToken\n          ? { Authorization: `Bearer ${this.plugin.settings.knowledgeHubToken}`, "x-api-key": this.plugin.settings.knowledgeHubToken }\n          : undefined,\n>>>>>>> d41054839 (🧿 fix(graph): convergir Obsidian pela API única)\n', '        url: this.plugin.settings.urlGrafo.replace(/\\?.*$/, "") + "?mode=full",\n        method: "GET",\n        headers: this.plugin.settings.knowledgeHubToken\n          ? { Authorization: `Bearer ${this.plugin.settings.knowledgeHubToken}`, "x-api-key": this.plugin.settings.knowledgeHubToken }\n          : undefined,\n')
p.write_text(s2, encoding='utf-8')
bad=[]
for rel in ['apps/modulos/obsidian-plugin-grafo-vivo/src/settings.ts','apps/modulos/obsidian-plugin-grafo-vivo/src/view.ts','apps/modulos/obsidian-plugin-grafo-vivo/src/view3d.ts']:
    txt=(repo/rel).read_text(encoding='utf-8')
    if any(x in txt for x in ['<<<<<<<','=======','>>>>>>>']): bad.append(rel)
print('CONFLICT_MARKERS_LEFT=' + (','.join(bad) if bad else '0'))
