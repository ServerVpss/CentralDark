// Monta um HTML isolado para prévia somente leitura da landing page do repositório.
// Nada é publicado, copiado ou gravado no projeto atual.

export type ArquivoLido = { path: string; conteudo: string };

const AVISO = `
<div style="position:fixed;inset:auto 0 0 0;z-index:2147483647;background:#080909;color:#F7E7B2;
font:11px/1.6 ui-monospace,monospace;padding:6px 10px;border-top:1px solid #C99123;text-align:center">
PRÉVIA SOMENTE LEITURA — conteúdo do repositório GitHub, sem publicação nem cópia
</div>`;

function escapar(texto: string) {
  return texto.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}

export function montarPrevia(arquivos: ArquivoLido[]) {
  const html = arquivos.find((a) => a.path.toLowerCase().endsWith(".html"));
  const css = arquivos.filter((a) => a.path.toLowerCase().endsWith(".css"));
  const estilos = css.map((a) => `<style>\n${a.conteudo}\n</style>`).join("\n");

  if (html) {
    let doc = html.conteudo;
    // Remove scripts: a prévia é estática e isolada
    doc = doc.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    // Neutraliza referências locais que não existem dentro da prévia
    doc = doc.replace(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi, "");
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `${estilos}</head>`);
    } else {
      doc = estilos + doc;
    }
    if (/<\/body>/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `${AVISO}</body>`);
    } else {
      doc += AVISO;
    }
    return doc;
  }

  // Sem HTML: mostra o código dos arquivos encontrados, ainda em prévia isolada
  const blocos = arquivos
    .map((a) => `<h2>${escapar(a.path)}</h2><pre>${escapar(a.conteudo || "(vazio)")}</pre>`)
    .join("\n");

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<style>
body{margin:0;padding:24px 16px 48px;background:#080909;color:#cfcfcf;
font:12px/1.7 ui-monospace,monospace}
h2{color:#C99123;font-size:12px;letter-spacing:.08em;margin:24px 0 8px}
pre{white-space:pre-wrap;word-break:break-word;background:#0f1011;border:1px solid #2a2622;
border-radius:8px;padding:12px;overflow:auto}
</style></head><body>
<p style="color:#F7E7B2">Nenhum HTML renderizável — exibindo o código dos arquivos da landing page.</p>
${blocos}${AVISO}</body></html>`;
}
