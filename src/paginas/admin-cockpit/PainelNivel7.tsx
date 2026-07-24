// Aba N7 — Desafio Nível 7. Lê apenas manifesto estático público.
import { useEffect, useState } from "react";

type Manifest = {
  titulo: string;
  autoria_conceitual: string;
  agentes: { id: string; papel: string }[];
  testes: { total: number; verdes: number; novos_permanentes: string[] };
  erro_real_capturado_na_missao: {
    descricao: string; causa: string; correcao_minima: string; teste_permanente: string;
  };
  autolupa: { rodadas: number; ponto_fixo_atingido: boolean };
  zip: { nome: string; sha256: string; download_path: string; reprodutivel_duas_builds: boolean };
  pr: string;
};

export function PainelNivel7() {
  const [m, setM] = useState<Manifest | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/downloads/nivel-7-manifest.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then(setM)
      .catch((e) => setErro(String(e)));
  }, []);

  if (erro) return <div className="sc-panel"><h2>N7</h2><div className="sc-empty">manifesto indisponível: {erro}</div></div>;
  if (!m) return <div className="sc-panel"><h2>N7</h2><div className="sc-empty">carregando manifesto…</div></div>;

  const okColor = "var(--sc-em-hi)";
  const warnColor = "#e2c46b";
  return (
    <div className="sc-panel" style={{ overflow: "auto", maxHeight: "100%" }}>
      <h2 style={{ margin: "0 0 6px" }}>◆ {m.titulo}</h2>
      <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 10 }}>autoria conceitual · {m.autoria_conceitual}</div>

      <section style={{ marginBottom: 10 }}>
        <b>Agentes</b>
        <ul style={{ margin: "4px 0 0 16px", padding: 0, fontSize: 11 }}>
          {m.agentes.map((a) => (
            <li key={a.id}><code>{a.id}</code> · {a.papel}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 10 }}>
        <b>Testes</b> · <span style={{ color: m.testes.verdes === m.testes.total ? okColor : warnColor }}>
          {m.testes.verdes}/{m.testes.total} verdes
        </span>
        <ul style={{ margin: "4px 0 0 16px", padding: 0, fontSize: 11 }}>
          {m.testes.novos_permanentes.map((t) => <li key={t}><code>{t}</code></li>)}
        </ul>
      </section>

      <section style={{ marginBottom: 10 }}>
        <b>Erro real capturado na missão</b>
        <div style={{ fontSize: 11, marginTop: 4 }}>
          <div>• descrição: {m.erro_real_capturado_na_missao.descricao}</div>
          <div>• causa: {m.erro_real_capturado_na_missao.causa}</div>
          <div>• correção mínima: {m.erro_real_capturado_na_missao.correcao_minima}</div>
          <div>• teste permanente: <code>{m.erro_real_capturado_na_missao.teste_permanente}</code></div>
        </div>
      </section>

      <section style={{ marginBottom: 10 }}>
        <b>AutoLupa</b> · rodadas={m.autolupa.rodadas} ·{" "}
        <span style={{ color: m.autolupa.ponto_fixo_atingido ? okColor : warnColor }}>
          PONTO_FIXO_ATINGIDO={m.autolupa.ponto_fixo_atingido ? "sim" : "não"}
        </span>
      </section>

      <section style={{ marginBottom: 10 }}>
        <b>ZIP reprodutível</b>
        <div style={{ fontSize: 11, marginTop: 4 }}>
          <div>• {m.zip.nome}</div>
          <div>• sha256: <code style={{ fontSize: 10 }}>{m.zip.sha256}</code></div>
          <div>• duas builds iguais: {m.zip.reprodutivel_duas_builds ? "sim" : "não"}</div>
        </div>
        <a
          href={m.zip.download_path}
          download
          style={{
            display: "inline-block", marginTop: 8, padding: "6px 12px",
            border: "1px solid var(--sc-em-hi)", color: "var(--sc-em-hi)",
            textDecoration: "none", fontSize: 11,
          }}
        >
          ⬇ baixar ZIP
        </a>
      </section>

      <section>
        <b>PR</b>: <code style={{ color: warnColor }}>{m.pr}</code>
      </section>
    </div>
  );
}
