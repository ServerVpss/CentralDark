import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

// Botões de exportação. O módulo de impressão entra por import dinâmico
// (fica fora do bundle inicial) para não pesar no primeiro carregamento.
export function ExportPdf({ compacto = false }: { compacto?: boolean }) {
  const { t, lang } = useI18n();
  const [ocupado, setOcupado] = useState<null | "completo" | "chave">(null);

  const exportar = async (modo: "completo" | "chave") => {
    setOcupado(modo);
    try {
      const { exportarPdf } = await import("@/lib/export-pdf");
      exportarPdf(modo, {
        titulo: "CentralDark — Instinto Superior",
        aviso: t("prov.body"),
        rotuloIdioma: t("pdf.lang"),
        rotuloData: t("pdf.date"),
        rotuloOrigem: t("pdf.source"),
        idioma: lang,
      });
    } finally {
      setOcupado(null);
    }
  };

  if (compacto) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="min-h-11 gap-2 print:hidden sm:min-h-9"
        onClick={() => exportar("completo")}
        aria-label={t("pdf.full")}
      >
        {ocupado ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
        <span className="hidden sm:inline">PDF</span>
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 print:hidden">
      <Button size="lg" className="glow-gold min-h-11" onClick={() => exportar("completo")}>
        <FileDown className="mr-1 size-4" />
        {t("pdf.full")}
      </Button>
      <Button size="lg" variant="outline" className="min-h-11" onClick={() => exportar("chave")}>
        {t("pdf.key")}
      </Button>
    </div>
  );
}
