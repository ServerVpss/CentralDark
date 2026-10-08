// Exportação para PDF via impressão do navegador (sem backend, local-first).
// Modo "completo" imprime tudo; modo "chave" imprime só as seções marcadas com data-key.

export type ModoExport = "completo" | "chave";

type MarcasProvenance = {
  titulo: string;
  aviso: string;
  rotuloIdioma: string;
  rotuloData: string;
  rotuloOrigem: string;
  idioma: string;
};

const ID_SELO = "cd-print-stamp";

function montarSelo(marcas: MarcasProvenance, modo: ModoExport) {
  let el = document.getElementById(ID_SELO);
  if (!el) {
    el = document.createElement("div");
    el.id = ID_SELO;
    el.className = "print-stamp";
    document.body.prepend(el);
  }

  const agora = new Date().toLocaleString(marcas.idioma);
  const origem = typeof window !== "undefined" ? window.location.href : "local-first";

  el.innerHTML = `
    <h1>${marcas.titulo}</h1>
    <p class="print-stamp-meta">
      ${marcas.rotuloIdioma}: ${marcas.idioma} ·
      ${marcas.rotuloData}: ${agora} ·
      ${marcas.rotuloOrigem}: ${origem} ·
      ${modo === "chave" ? "SCOPE: KEY_SECTIONS" : "SCOPE: FULL"}
    </p>
    <p class="print-stamp-warn">${marcas.aviso}</p>
  `;
  return el;
}

export function exportarPdf(modo: ModoExport, marcas: MarcasProvenance) {
  if (typeof window === "undefined") return;

  montarSelo(marcas, modo);
  document.body.dataset["print"] = modo;

  const limpar = () => {
    delete document.body.dataset["print"];
    window.removeEventListener("afterprint", limpar);
  };
  window.addEventListener("afterprint", limpar);

  // deixa o navegador aplicar o CSS de impressão antes de abrir a caixa
  window.setTimeout(() => window.print(), 60);
}
