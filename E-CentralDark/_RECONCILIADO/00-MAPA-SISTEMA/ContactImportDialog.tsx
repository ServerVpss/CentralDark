// Modal de importação de contatos (CSV/XLSX).
// Parsing acontece no client (papaparse / xlsx); só JSON sobe pro servidor.
import { useState, useRef, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import Papa from "papaparse";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

import { previewContactImport, commitContactImport, type ImportRowResult } from "@/lib/contacts.functions";

type Step = "upload" | "mapping" | "preview" | "done";

type RawRow = Record<string, unknown>;

const FIELD_LABELS: Record<string, string> = {
  name: "Nome",
  phone: "Telefone",
  email: "E-mail (opcional)",
  tag: "Etiqueta (opcional)",
  notes: "Observação (opcional)",
};

const FIELD_KEYS = ["name", "phone", "email", "tag", "notes"] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

const AUTO_HINTS: Record<FieldKey, string[]> = {
  name: ["nome", "name", "contato", "cliente"],
  phone: ["telefone", "phone", "celular", "whatsapp", "numero", "número", "fone"],
  email: ["email", "e-mail", "mail"],
  tag: ["tag", "etiqueta", "categoria", "segmento"],
  notes: ["observacao", "observação", "obs", "notes", "nota"],
};

function autoDetect(headers: string[]): Record<FieldKey, string | null> {
  const out: Record<FieldKey, string | null> = { name: null, phone: null, email: null, tag: null, notes: null };
  for (const f of FIELD_KEYS) {
    const hit = headers.find((h) => AUTO_HINTS[f].some((hint) => h.toLowerCase().trim().includes(hint)));
    if (hit) out[f] = hit;
  }
  return out;
}

export function ContactImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImported?: () => void;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [filename, setFilename] = useState("");
  const [fileType, setFileType] = useState<"csv" | "xlsx">("csv");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string | null>>({
    name: null, phone: null, email: null, tag: null, notes: null,
  });
  const [preview, setPreview] = useState<ImportRowResult[]>([]);
  const [stats, setStats] = useState<{ total: number; valid: number; duplicate: number; invalid: number; existing: number } | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewFn = useServerFn(previewContactImport);
  const commitFn = useServerFn(commitContactImport);
  const qc = useQueryClient();

  function resetAll() {
    setStep("upload");
    setFilename("");
    setHeaders([]);
    setRawRows([]);
    setMapping({ name: null, phone: null, email: null, tag: null, notes: null });
    setPreview([]);
    setStats(null);
    setOverwrite(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    setParsing(true);
    setFilename(file.name);
    try {
      const isXlsx = /\.xlsx$/i.test(file.name);
      setFileType(isXlsx ? "xlsx" : "csv");
      let rows: RawRow[] = [];
      let cols: string[] = [];
      if (isXlsx) {
        const ExcelJS = (await import("exceljs")).default;
        const buf = await file.arrayBuffer();
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buf);
        const sheet = wb.worksheets[0];
        if (!sheet) {
          toast.error("Planilha vazia.");
          setParsing(false);
          return;
        }
        const headerRow = sheet.getRow(1);
        cols = (headerRow.values as unknown[])
          .slice(1)
          .map((v) => (v == null ? "" : String(v).trim()))
          .filter((v) => v.length > 0);
        const json: Record<string, unknown>[] = [];
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const values = row.values as unknown[];
          const obj: Record<string, unknown> = {};
          cols.forEach((col, idx) => {
            const cell = values[idx + 1];
            obj[col] = cell == null ? "" : typeof cell === "object" && "text" in (cell as object)
              ? String((cell as { text: unknown }).text ?? "")
              : String(cell);
          });
          json.push(obj);
        });
        rows = json;
      } else {
        const text = await file.text();
        const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true });
        rows = parsed.data;
        cols = parsed.meta.fields ?? [];
      }
      if (rows.length === 0) {
        toast.error("Arquivo vazio ou sem cabeçalho válido.");
        setParsing(false);
        return;
      }
      if (rows.length > 5000) {
        toast.error("Limite de 5.000 linhas por importação.");
        setParsing(false);
        return;
      }
      setRawRows(rows);
      setHeaders(cols);
      setMapping(autoDetect(cols));
      setStep("mapping");
    } catch (e) {
      toast.error("Não consegui ler o arquivo: " + (e as Error).message);
    } finally {
      setParsing(false);
    }
  }

  const mappedRows = useMemo(() => {
    return rawRows.map((row) => {
      const out: RawRow = {};
      for (const f of FIELD_KEYS) {
        const col = mapping[f];
        if (col) out[f] = (row as Record<string, unknown>)[col] ?? null;
      }
      return out;
    });
  }, [rawRows, mapping]);

  const previewMut = useMutation({
    mutationFn: async () => previewFn({ data: { rows: mappedRows } }),
    onSuccess: (data) => {
      setPreview(data.results);
      setStats(data.stats);
      setStep("preview");
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const commitMut = useMutation({
    mutationFn: async () =>
      commitFn({
        data: {
          rows: mappedRows,
          filename: filename || "import",
          fileType,
          overwriteDuplicates: overwrite,
        },
      }),
    onSuccess: (r) => {
      toast.success(
        `Importação concluída: ${r.created} criado(s), ${r.updated} atualizado(s), ${r.skippedDuplicate} ignorado(s), ${r.errors} erro(s).`,
      );
      qc.invalidateQueries({ queryKey: ["app-contacts"] });
      onImported?.();
      setStep("done");
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  function close(v: boolean) {
    if (!v) resetAll();
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Importar contatos
          </DialogTitle>
          <DialogDescription>
            Envie uma planilha CSV ou XLSX. Vamos validar tudo antes de salvar.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-10 text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Selecione um arquivo .csv ou .xlsx</p>
              <p className="text-sm text-muted-foreground">Até 5.000 linhas por importação.</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <Button onClick={() => inputRef.current?.click()} disabled={parsing}>
              {parsing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Lendo...</> : "Escolher arquivo"}
            </Button>
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Conferimos as colunas automaticamente. Ajuste se algo ficou trocado.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FIELD_KEYS.map((f) => (
                <div key={f} className="space-y-1.5">
                  <Label className="text-xs">
                    {FIELD_LABELS[f]} {(f === "name" || f === "phone") && <span className="text-destructive">*</span>}
                  </Label>
                  <Select
                    value={mapping[f] ?? "__none__"}
                    onValueChange={(v) => setMapping((m) => ({ ...m, [f]: v === "__none__" ? null : v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="— não usar —" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— não usar —</SelectItem>
                      {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("upload")}>Voltar</Button>
              <Button
                disabled={!mapping.phone || previewMut.isPending}
                onClick={() => previewMut.mutate()}
              >
                {previewMut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validando...</> : `Validar ${rawRows.length} linha(s)`}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "preview" && stats && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{stats.total} total</Badge>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">{stats.valid} válido(s)</Badge>
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white">{stats.duplicate} duplicado(s)</Badge>
              <Badge variant="destructive">{stats.invalid} com erro</Badge>
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3">
              <Switch id="ovw" checked={overwrite} onCheckedChange={setOverwrite} />
              <Label htmlFor="ovw" className="text-sm">
                Sobrescrever contatos duplicados existentes (atualiza nome/email/tag/observação)
              </Label>
            </div>
            <ScrollArea className="h-72 rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 w-10">#</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">Telefone</th>
                    <th className="px-3 py-2">E-mail</th>
                    <th className="px-3 py-2">Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 500).map((r) => (
                    <tr key={r.index} className="border-t">
                      <td className="px-3 py-2 text-muted-foreground">{r.index + 1}</td>
                      <td className="px-3 py-2">
                        {r.status === "valid" && <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" />válido</span>}
                        {r.status === "duplicate" && <span className="inline-flex items-center gap-1 text-amber-600"><AlertTriangle className="h-3 w-3" />duplicado</span>}
                        {r.status === "invalid" && <span className="inline-flex items-center gap-1 text-destructive"><AlertCircle className="h-3 w-3" />erro</span>}
                      </td>
                      <td className="px-3 py-2">{r.normalized.name ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.normalized.phone ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.normalized.email ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.error ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 500 && (
                <p className="p-3 text-center text-xs text-muted-foreground">
                  Mostrando 500 de {preview.length} linhas. Todas serão processadas na importação.
                </p>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("mapping")}>Voltar</Button>
              <Button
                disabled={stats.valid === 0 && !(overwrite && stats.existing > 0) || commitMut.isPending}
                onClick={() => commitMut.mutate()}
              >
                {commitMut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importando...</> : `Importar ${stats.valid + (overwrite ? stats.existing : 0)} contato(s)`}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="font-medium">Pronto! Seus contatos foram importados.</p>
            <Button onClick={() => close(false)}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
