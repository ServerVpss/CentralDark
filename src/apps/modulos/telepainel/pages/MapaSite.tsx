import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

type ItemPagina = {
  arquivo: string;
  nome: string;
  registrado: boolean;
};

type Relatorio = {
  geradoEm: string;
  total: number;
  cadastradas: number;
  orfas: number;
  itens: ItemPagina[];
};

// Tenta inferir a URL pública a partir do caminho do arquivo —
// é só uma sugestão visual, baseada no nome do arquivo.
function sugerirRota(nome: string): string {
  if (nome === "Index") return "/telepainel/dashboard";
  if (nome === "LandingCentralDark") return "/";
  if (nome.startsWith("Landing")) return "/" + nome.replace("Landing", "").toLowerCase();
  return "/" + nome.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
}

export default function MapaSite() {
  const [dados, setDados] = useState<Relatorio | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/paginas.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setDados)
      .catch(() => setErro("Não consegui carregar /data/paginas.json. Rode `node scripts/audit-pages.mjs`."));
  }, []);

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Mapa do Site</h1>
        <p className="text-muted-foreground">
          Relatório automático de todas as páginas existentes em <code>src/apps/**/pages</code> e quais já têm rota registrada no <code>App.tsx</code>.
        </p>
      </header>

      {erro && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">{erro}</CardContent>
        </Card>
      )}

      {dados && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{dados.total}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Cadastradas</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold text-emerald-600">{dados.cadastradas}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Órfãs</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold text-destructive">{dados.orfas}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Páginas</CardTitle>
              <p className="text-xs text-muted-foreground">Gerado em {new Date(dados.geradoEm).toLocaleString("pt-BR")}</p>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {dados.itens.map((p) => (
                  <li key={p.arquivo} className="flex items-center justify-between py-2 gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.nome}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.arquivo}</div>
                    </div>
                    {p.registrado ? (
                      <a
                        href={sugerirRota(p.nome)}
                        className="shrink-0"
                      >
                        <Badge variant="default">registrada</Badge>
                      </a>
                    ) : (
                      <Badge variant="destructive" className="shrink-0">órfã</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
