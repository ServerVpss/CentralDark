// Exporta os arquivos selecionados da landing page em um ZIP, no próprio navegador.
// A área do repositório segue somente leitura: nada é gravado no GitHub nem no projeto.
import JSZip from "jszip";

export type ArquivoZip = { path: string; conteudo: string };

export async function baixarZipDaLanding(repo: string, branch: string, arquivos: ArquivoZip[]) {
  const zip = new JSZip();
  const pasta = zip.folder("landing") ?? zip;

  for (const a of arquivos) {
    pasta.file(a.path, a.conteudo);
  }

  pasta.file(
    "PROVENANCE.txt",
    [
      "CentralDark — exportação somente leitura",
      `Repositório: ${repo}`,
      `Branch: ${branch}`,
      `Lido em: ${new Date().toISOString()}`,
      `Arquivos: ${arquivos.length}`,
      "",
      "Conteúdo copiado do repositório no momento da leitura.",
      "Nada foi publicado, alterado ou sincronizado.",
    ].join("\n"),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `landing-${repo.replace(/[^\w.-]+/g, "-")}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
