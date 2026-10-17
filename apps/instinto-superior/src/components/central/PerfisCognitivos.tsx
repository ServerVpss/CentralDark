import { useState } from "react";
import { Card } from "@/components/ui/card";

type Papel = "system_prompt" | "soul" | "behavior" | "reference";
type Perfil = {
  id: string;
  nome: string;
  papel: Papel;
  conteudo: string;
  fonte: string;
  valido: boolean;
};
const BASE: Perfil[] = [
  {
    id: "perfil-a",
    nome: "⚡ Perfil A · Executor",
    papel: "behavior",
    fonte: "Exemplo integrado",
    valido: true,
    conteudo:
      "Priorize ações diretas e reversíveis dentro do escopo autorizado. Teste e devolva evidência.",
  },
  {
    id: "perfil-b",
    nome: "🧠 Perfil B · Crítico",
    papel: "behavior",
    fonte: "Exemplo integrado",
    valido: true,
    conteudo:
      "Examine pressupostos, proponha contrapontos, distinga fato e hipótese; não invente provas.",
  },
  {
    id: "perfil-c",
    nome: "🪬 Perfil C · Incremental",
    papel: "behavior",
    fonte: "Exemplo integrado",
    valido: true,
    conteudo:
      "Busque o owner existente, preserve o que funciona, implemente o menor delta e confira o resultado.",
  },
];
const TIPOS = ["system_prompt", "soul", "behavior", "reference"] as const;
function textoValido(s: string) {
  return s.trim().length >= 30 && s.length <= 100_000 && !s.includes("\u0000");
}
function importarPerfil(nomeArquivo: string, txt: string): Perfil {
  const ext = nomeArquivo.split(".").pop()?.toLowerCase();
  if (!["json", "md", "markdown", "txt"].includes(ext ?? "")) throw Error("Formato não suportado.");
  let nome = nomeArquivo.replace(/\.(json|md|markdown|txt)$/i, "");
  let conteudo = txt;
  let papel: Papel = "reference";
  if (ext === "json") {
    let obj: unknown;
    try {
      obj = JSON.parse(txt);
    } catch {
      throw Error("JSON inválido.");
    }
    if (!obj || typeof obj !== "object" || Array.isArray(obj))
      throw Error("JSON deve ser um objeto.");
    const d = obj as Record<string, unknown>;
    nome = typeof d.name === "string" ? d.name : nome;
    const kind = d.kind ?? d.type ?? d.role;
    if (typeof kind === "string" && TIPOS.includes(kind as Papel)) papel = kind as Papel;
    conteudo =
      typeof d.instructions === "string"
        ? d.instructions
        : typeof d.content === "string"
          ? d.content
          : "";
  } else {
    const front = txt.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (front) {
      const title = front[1].match(/^name:\s*(.+)$/m);
      const kind = front[1].match(/^(kind|role|type):\s*(.+)$/m);
      if (title) nome = title[1].replace(/^["']|["']$/g, "");
      if (kind && TIPOS.includes(kind[2].trim() as Papel)) papel = kind[2].trim() as Papel;
      conteudo = txt.slice(front[0].length);
    }
  }
  if (!textoValido(conteudo))
    throw Error("Instruções ausentes, menores que 30 caracteres ou acima do limite de 100 KB.");
  if (!nome.trim() || nome.length > 90) throw Error("Nome inválido.");
  return { id: crypto.randomUUID(), nome, papel, conteudo, fonte: nomeArquivo, valido: true };
}
export function PerfisCognitivos() {
  const [perfis, setPerfis] = useState<Perfil[]>(BASE);
  const [selecionado, setSelecionado] = useState(BASE[0].id);
  const [aviso, setAviso] = useState("Nenhum perfil foi injetado no runtime.");
  const [modo, setModo] = useState<"isolado" | "comparar">("isolado");
  const ativo = perfis.find((p) => p.id === selecionado);
  async function importar(files: FileList | null) {
    if (!files?.length) return;
    let added = 0;
    for (const f of Array.from(files).slice(0, 12)) {
      try {
        if (f.size > 120_000) throw Error("Arquivo acima de 120 KB.");
        if (/\.pdf$/i.test(f.name)) {
          setAviso(
            "PDF detectado, mas ainda precisa de extração/validação antes de virar perfil. Nada foi ativado.",
          );
          continue;
        }
        const p = importarPerfil(f.name, await f.text());
        setPerfis((v) => [...v, p]);
        setSelecionado(p.id);
        added++;
      } catch (e) {
        setAviso(`${f.name}: ${e instanceof Error ? e.message : "Falha na validação"}`);
      }
    }
    if (added)
      setAviso(
        `${added} perfil(is) validado(s) e preparado(s). Ativação no motor ainda não comprovada.`,
      );
  }
  function preparar() {
    if (!ativo) return;
    const payload = {
      schema: "centraldark.harness.profile-request.v1",
      status: "NOT_INJECTED",
      profile: { name: ativo.nome, kind: ativo.papel, instructions: ativo.conteudo },
      comparison_mode: modo,
      constraints:
        "Aplica somente por adapter autorizado e nova sessão; nunca substitui system instructions da plataforma.",
    };
    void navigator.clipboard
      .writeText(JSON.stringify(payload, null, 2))
      .then(() => setAviso("Solicitação copiada; runtime NÃO foi alterado."))
      .catch(() => setAviso("Cópia indisponível; runtime NÃO foi alterado."));
  }
  return (
    <Card className="border border-border p-6" aria-label="Perfis Cognitivos da Forja">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            🧠 Perfis Cognitivos · Um motor, muitos comportamentos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ⚡ A Executor · 🧠 B Crítico · 🪬 C Incremental → 🧿 Reality Judge. A mesma tarefa pode
            ser comparada entre perfis sem trocar o modelo base.
          </p>
        </div>
        <span className="rounded-md border border-amber-500/50 px-3 py-1 text-xs text-amber-500">
          PERFIS PRONTOS · INJEÇÃO PENDENTE
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {perfis.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelecionado(p.id)}
            aria-pressed={selecionado === p.id}
            className={`rounded-lg border p-4 text-left text-sm ${selecionado === p.id ? "border-emerald-500 bg-emerald-500/10" : "border-border"}`}
          >
            <strong>{p.nome}</strong>
            <span className="mt-2 block text-xs text-muted-foreground">
              {p.papel} · {p.fonte} · VALIDADO / RUNTIME UNKNOWN
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">📁 Adicionar perfil (.json, .md, .txt)</span>
          <input
            type="file"
            accept=".json,.md,.markdown,.txt,.pdf,application/json,text/plain,text/markdown,application/pdf"
            multiple
            onChange={(e) => {
              void importar(e.target.files);
              e.target.value = "";
            }}
            className="rounded-md border border-border p-2 text-xs"
          />
          <span className="text-xs text-muted-foreground">
            JSON usa name, kind e instructions. Markdown aceita frontmatter name/kind. PDF somente
            reconhecido nesta fase: exige extração segura antes de ativar.
          </span>
        </label>
        <div className="rounded-lg border border-border p-3 text-sm">
          <strong>⚖️ Comparação / Reality Judge</strong>
          <div className="mt-3 flex gap-4">
            <label>
              <input
                type="radio"
                checked={modo === "isolado"}
                onChange={() => setModo("isolado")}
              />{" "}
              Isolado
            </label>
            <label>
              <input
                type="radio"
                checked={modo === "comparar"}
                onChange={() => setModo("comparar")}
              />{" "}
              Comparar
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            A comparação real depende do dispatcher, respostas e testes; sem unanimidade fictícia.
          </p>
        </div>
      </div>
      <details className="mt-4 rounded-lg border border-border p-3">
        <summary className="cursor-pointer text-sm font-medium">
          🔎 Visualizar perfil selecionado · {ativo?.nome}
        </summary>
        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
          {ativo?.conteudo}
        </pre>
      </details>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={preparar}
          disabled={!ativo}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          📋 Preparar instruções para o Harness
        </button>
        <span className="text-xs text-muted-foreground">
          Selecionar ≠ injetar. SOUL original e memória permanecem intactos.
        </span>
      </div>
      <p role="status" className="mt-3 text-xs text-muted-foreground">
        {aviso}
      </p>
    </Card>
  );
}
