#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PAINEL DE LOGS AO VIVO -- ve o que acontece quando voce manda msg no bot.

Le os logs REAIS que o Hermes ja escreve (nao inventa fonte nova) e monta
uma pagina dividida por SETOR, pra voce achar o erro sem ler log cru.

Honestidade (mesma regra do atualizar-manual-sessao.sh, "verde nao e prova"):
este script so mostra o que esta escrito no log e o que o sistema operacional
responde sobre os processos. Ele NAO conclui que algo funciona -- so mostra
o que aconteceu, com hora e setor.

FONTE DA VERDADE (nao ha copia, le direto):
  C:/Users/danda/AppData/Local/hermes/profiles/<perfil>/logs/gateway.log
  .../agent.log     .../errors.log
  .../cron/jobs.json          <- jobs agendados
  .../gateway.pid             <- PID do gateway

USO:
  painel-logs.py                 gera a pagina uma vez
  painel-logs.py --watch         fica atualizando sozinho (Ctrl+C para)
  painel-logs.py --watch --seg 3 atualiza a cada 3 segundos
  painel-logs.py --perfil sol    so um perfil
"""

import argparse
import html
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

HERMES = Path(r"C:/Users/danda/AppData/Local/hermes")
PERFIS_PADRAO = ["sol", "pivete"]
SAIDA = Path(r"E:/CentralDark/Pivete/NUCLEO/MANUAL-SESSAO-19-07-2026/PAINEL-LOGS.html")

# ── SETORES ────────────────────────────────────────────────────────────
# Cada setor: (chave, titulo, emoji, cor, [regex]). A ordem manda na tela.
SETORES = [
    ("telegram", "Telegram — o que chega e o que sai", "📨", "#3b82f6", [
        r"inbound message",
        r"Sending response",
        r"Flushing (text|photo) batch",
        r"Cached user photo",
        r"Ignoring /start",
    ]),
    ("modelo", "Modelo — quem respondeu e em quanto tempo", "🧠", "#8b5cf6", [
        r"conversation turn",
        r"response ready",
        r"API call #",
        r"Image routing",
        r"OpenAI client created",
    ]),
    ("ferramentas", "Ferramentas — o que o bot executou", "🔧", "#10b981", [
        r"tool \w+ completed",
        r"Tool \w+ returned",
        r"Generating speech",
        r"TTS audio saved",
        r"vision_tools|Image analysis",
        r"tools\.registry",
    ]),
    ("erro", "Erros — o que quebrou", "🔴", "#ef4444", [
        r"\bERROR\b",
        r"AuthenticationError|APIStatusError",
        r"HTTP (401|402|403|404|429|500|502|503)",
        r"Non-retryable",
        r"failed|Failed",
        r"has no resolvable api_key",
        r"stale/unrefreshable",
    ]),
    ("cron", "Tarefas agendadas", "⏰", "#f59e0b", [
        r"cron",
        r"Cron Job",
    ]),
]

# Ruido que polui sem ajudar (some do painel, continua no log cru).
RUIDO = re.compile(
    r"google-drive|Unknown service_tier|check_fn .* returned False",
    re.IGNORECASE,
)

TS = re.compile(r"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})")

# Traducao de erro tecnico -> o que fazer. Cada entrada e um caso PROVADO
# nesta maquina (27/07/2026), nao um palpite generico.
DICA = [
    (r"401.*User not found",
     "A chave do OpenRouter nao vale mais. Troque OPENROUTER_API_KEY no .env do perfil."),
    (r"402.*(credits|spending-limit)",
     "Conta do Grok/xAI sem saldo. Poe credito em grok.com ou tire ele da fila de fallback."),
    (r"No endpoints found that support image input",
     "Voce mandou FOTO e a vez caiu num modelo que so le texto. Poe um modelo que enxerga no topo da fila."),
    (r"has no resolvable api_key",
     "Esse provider esta na fila mas nao tem chave no .env. Ou preenche a chave, ou comenta ele."),
    (r"stale/unrefreshable credential",
     "Credencial velha presa. Manda /model no Telegram pra refazer a sessao."),
    (r"404.*page not found|404 page not found",
     "O endereco (base_url) desse provider esta errado ou o servico saiu do ar."),
    (r"Fallback skip.*matches current provider/model",
     "A reserva e o MESMO modelo que ja esta em uso, entao foi pulada. Tire o modelo principal da lista de fallback."),
    (r"Interrupt recursion depth",
     "Voce mandou mensagem nova antes da anterior terminar. O sistema enfileirou em vez de travar."),
    (r"final stream delivery not confirmed",
     "A resposta anterior nao confirmou entrega e foi reenviada. Costuma vir junto com erro de modelo acima."),
    (r"ReadError|ConnectError|timed out|timeout",
     "Falha de rede na hora. Se repetir muito, olhe conexao ou proxy."),
]


def agora():
    return datetime.now().strftime("%d/%m/%Y %H:%M:%S")


def perfis_existentes(pedidos):
    out = []
    for p in pedidos:
        if (HERMES / "profiles" / p / "logs").is_dir():
            out.append(p)
    return out


def ler_fim(caminho, n_linhas):
    """Le as ultimas n linhas sem carregar o arquivo inteiro."""
    try:
        tam = caminho.stat().st_size
    except OSError:
        return []
    bloco = min(tam, max(65536, n_linhas * 400))
    try:
        with open(caminho, "rb") as f:
            f.seek(max(0, tam - bloco))
            dados = f.read()
    except OSError:
        return []
    txt = dados.decode("utf-8", errors="replace")
    linhas = txt.splitlines()
    if tam > bloco and linhas:
        linhas = linhas[1:]          # a primeira pode estar cortada ao meio
    return linhas[-n_linhas:]


def classificar(linha):
    for chave, _t, _e, _c, padroes in SETORES:
        for p in padroes:
            if re.search(p, linha, re.IGNORECASE):
                return chave
    return None


def dica_para(linha):
    for padrao, texto in DICA:
        if re.search(padrao, linha, re.IGNORECASE):
            return texto
    return None


def limpar(linha):
    """Tira o prefixo tecnico e deixa so o que interessa."""
    l = re.sub(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d+\s+", "", linha)
    l = re.sub(r"^(INFO|WARNING|ERROR|DEBUG)\s+", "", l)
    l = re.sub(r"\[\w{6,}\]\s*", "", l)
    l = re.sub(r"\b(gateway\.run|agent\.\w+|tools\.\w+|hermes_plugins\.[\w.]+|"
               r"hermes_cli\.\w+|run_agent)\s*:\s*", "", l)
    l = re.sub(r"thread=\S+\s*", "", l)
    return l.strip()


def coletar(perfil, n_por_arquivo):
    """Junta as linhas dos 3 logs do perfil, ordenadas por hora."""
    base = HERMES / "profiles" / perfil / "logs"
    eventos = []
    for arq in ("gateway.log", "agent.log", "errors.log"):
        cam = base / arq
        if not cam.exists():
            continue
        for linha in ler_fim(cam, n_por_arquivo):
            if not linha.strip() or RUIDO.search(linha):
                continue
            m = TS.match(linha)
            if not m:
                continue
            setor = classificar(linha)
            if not setor:
                continue
            eventos.append({
                "hora": m.group(1),
                "hhmmss": m.group(1)[11:],
                "setor": setor,
                "texto": limpar(linha),
                "dica": dica_para(linha),
                "arquivo": arq,
            })
    # dedup: mesma hora + mesmo texto vindo de 2 arquivos
    vistos, unicos = set(), []
    for e in sorted(eventos, key=lambda x: x["hora"], reverse=True):
        k = (e["hora"], e["texto"][:120])
        if k in vistos:
            continue
        vistos.add(k)
        unicos.append(e)
    return unicos


def estado_processos():
    """PIDs e jobs — fatos mecanicos, conferidos na hora."""
    linhas = []
    for p in ("pivete", "sol", "teste"):
        pid_f = HERMES / "profiles" / p / "gateway.pid"
        pid, vivo = None, False
        if pid_f.exists():
            try:
                pid = json.loads(pid_f.read_text(encoding="utf-8")).get("pid")
            except Exception:
                pid = None
        if pid:
            try:
                r = subprocess.run(
                    ["tasklist", "/FI", f"PID eq {pid}", "/NH"],
                    capture_output=True, text=True, timeout=12,
                )
                vivo = str(pid) in (r.stdout or "")
            except Exception:
                vivo = False
        if pid_f.exists():
            linhas.append({"nome": f"gateway {p}", "pid": pid, "vivo": vivo})
    return linhas


def jobs_cron(perfil):
    f = HERMES / "profiles" / perfil / "cron" / "jobs.json"
    if not f.exists():
        return []
    try:
        d = json.loads(f.read_text(encoding="utf-8"))
    except Exception:
        return []
    jobs = d if isinstance(d, list) else d.get("jobs", d)
    if isinstance(jobs, dict):
        jobs = list(jobs.values())
    out = []
    for j in jobs:
        if not isinstance(j, dict):
            continue
        out.append({
            "nome": str(j.get("name") or j.get("id", "?")),
            "quando": str((j.get("schedule") or {}).get("display", "?")),
            "ativo": bool(j.get("enabled")),
            "status": str(j.get("last_status") or "-"),
            "ultimo": str(j.get("last_run_at") or "-")[:19].replace("T", " "),
        })
    return out


def chaves_env(perfil):
    """Mostra se a chave EXISTE e o tamanho. NUNCA o valor."""
    f = HERMES / "profiles" / perfil / ".env"
    alvo = ["OPENROUTER_API_KEY", "GOOGLE_API_KEY", "TELEGRAM_BOT_TOKEN",
            "GEMINI_API_KEY", "HERMESONE_API_KEY", "TOKENHUB_API_KEY",
            "ANTHROPIC_API_KEY"]
    achado = {k: 0 for k in alvo}
    if f.exists():
        for linha in f.read_text(encoding="utf-8", errors="replace").splitlines():
            if linha.lstrip().startswith("#") or "=" not in linha:
                continue
            k, _, v = linha.partition("=")
            k = k.strip()
            if k in achado:
                achado[k] = max(achado[k], len(v.strip()))
    return achado


# ── HTML ───────────────────────────────────────────────────────────────

CSS = """
*{box-sizing:border-box}
body{margin:0;padding:16px;background:#0b0f17;color:#e6edf3;
 font:14px/1.55 ui-sans-serif,system-ui,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:1200px;margin:0 auto}
h1{font-size:19px;margin:0 0 4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sub{color:#8b98a9;font-size:12.5px;margin-bottom:16px}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));margin-bottom:18px}
.card{background:#131a26;border:1px solid #223049;border-radius:10px;padding:12px 14px;min-width:0}
.card h3{margin:0 0 8px;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#8b98a9}
.row{display:flex;justify-content:space-between;gap:10px;padding:3px 0;
 border-bottom:1px solid #1c2739;font-size:13px;min-width:0}
.row:last-child{border-bottom:0}
.row span:first-child{color:#b9c5d4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row span:last-child{flex:none;font-weight:600}
.on{color:#3fb950}.off{color:#f85149}.mid{color:#d29922}
details{background:#131a26;border:1px solid #223049;border-radius:10px;margin-bottom:10px;overflow:hidden}
summary{cursor:pointer;padding:11px 14px;font-weight:600;font-size:14px;
 display:flex;align-items:center;gap:9px;list-style:none;user-select:none}
summary::-webkit-details-marker{display:none}
summary::after{content:"▾";margin-left:auto;color:#8b98a9;font-size:12px}
details[open] summary::after{content:"▴"}
.cnt{background:#223049;color:#b9c5d4;border-radius:20px;padding:1px 9px;font-size:11.5px;font-weight:700}
.list{max-height:340px;overflow:auto;border-top:1px solid #223049}
.ev{display:flex;gap:10px;padding:7px 14px;border-bottom:1px solid #1a2434;
 font-family:ui-monospace,"Cascadia Code",Consolas,monospace;font-size:12.2px;align-items:flex-start}
.ev:last-child{border-bottom:0}
.h{color:#7d8aa0;flex:none}
.t{word-break:break-word;min-width:0;flex:1}
.dica{display:block;margin-top:4px;color:#f0c674;font-family:inherit;font-size:12px}
.dica b{color:#ffd479}
.vazio{padding:14px;color:#7d8aa0;font-size:13px}
table{width:100%;border-collapse:collapse;font-size:12.8px}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #1c2739}
th{color:#8b98a9;font-size:11px;text-transform:uppercase;letter-spacing:.07em}
.scroll{overflow-x:auto}
.pe{color:#7d8aa0;font-size:12px;margin-top:18px;text-align:center}
@media(max-width:640px){
 body{padding:10px}
 .ev{flex-direction:column;gap:2px}
 .h{font-size:11px}
 .grid{grid-template-columns:1fr}
}
"""


def bloco_eventos(perfil, eventos):
    partes = []
    for chave, titulo, emoji, cor, _ in SETORES:
        evs = [e for e in eventos if e["setor"] == chave][:60]
        aberto = " open" if chave in ("telegram", "erro") and evs else ""
        partes.append(f'<details{aberto}><summary><span style="color:{cor}">{emoji}</span>'
                      f'{html.escape(titulo)}<span class="cnt">{len(evs)}</span></summary>')
        if not evs:
            partes.append('<div class="vazio">Nada aqui nos ultimos registros.</div>')
        else:
            partes.append('<div class="list">')
            for e in evs:
                dica = ""
                if e["dica"]:
                    dica = f'<span class="dica"><b>O que fazer:</b> {html.escape(e["dica"])}</span>'
                partes.append(
                    f'<div class="ev"><span class="h">{e["hhmmss"]}</span>'
                    f'<span class="t">{html.escape(e["texto"][:400])}{dica}</span></div>'
                )
            partes.append("</div>")
        partes.append("</details>")
    return "".join(partes)


def montar(perfis, eventos_por_perfil, segundos):
    procs = estado_processos()
    p_html = []
    for p in procs:
        cls = "on" if p["vivo"] else "off"
        txt = f'PID {p["pid"]}' if p["vivo"] else "parado"
        p_html.append(f'<div class="row"><span>{html.escape(p["nome"])}</span>'
                      f'<span class="{cls}">{txt}</span></div>')

    blocos = []
    for perfil in perfis:
        eventos = eventos_por_perfil[perfil]
        n_err = sum(1 for e in eventos if e["setor"] == "erro")
        n_tg = sum(1 for e in eventos if e["setor"] == "telegram")

        ch = chaves_env(perfil)
        ch_html = []
        for k, tam in ch.items():
            if tam > 0:
                cls, txt = "on", f"ok ({tam})"
            else:
                cls, txt = "off", "vazia"
            ch_html.append(f'<div class="row"><span>{k}</span><span class="{cls}">{txt}</span></div>')

        jb = jobs_cron(perfil)
        if jb:
            linhas = "".join(
                f'<tr><td>{html.escape(j["nome"])}</td><td>{html.escape(j["quando"])}</td>'
                f'<td class="{"on" if j["status"]=="ok" else "mid"}">{html.escape(j["status"])}</td>'
                f'<td>{html.escape(j["ultimo"])}</td></tr>' for j in jb[:10])
            jb_html = ('<div class="scroll"><table><tr><th>Tarefa</th><th>Quando</th>'
                       f'<th>Ultimo</th><th>Rodou</th></tr>{linhas}</table></div>')
        else:
            jb_html = '<div class="vazio">Nenhuma tarefa agendada.</div>'

        blocos.append(f"""
<h1>Perfil <span style="color:#58a6ff">{html.escape(perfil)}</span></h1>
<div class="sub">{n_tg} eventos de Telegram &middot; <b class="{'off' if n_err else 'on'}">{n_err} erro(s)</b> nos registros recentes</div>
<div class="grid">
  <div class="card"><h3>Processos agora</h3>{"".join(p_html)}</div>
  <div class="card"><h3>Chaves no .env (so o tamanho, nunca o valor)</h3>{"".join(ch_html)}</div>
  <div class="card"><h3>Tarefas agendadas</h3>{jb_html}</div>
</div>
{bloco_eventos(perfil, eventos)}
""")

    refresh = f'<meta http-equiv="refresh" content="{segundos}">' if segundos else ""
    aviso = (f"Atualiza sozinho a cada {segundos}s." if segundos
             else "Pagina parada. Rode com --watch pra atualizar sozinho.")

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{refresh}
<title>Painel de Logs ao Vivo — CentralDark</title>
<style>{CSS}</style>
</head>
<body><div class="wrap">
<h1>📡 Painel de Logs ao Vivo</h1>
<div class="sub">Gerado em <b>{agora()}</b> &middot; {aviso}
&middot; Le direto de <code>profiles/&lt;perfil&gt;/logs/</code> — nao ha copia.</div>
{"".join(blocos)}
<div class="pe">Este painel mostra o que <b>esta escrito no log</b> e o que o sistema responde sobre os processos.<br>
Ele nao conclui que algo funciona — mostra o que aconteceu, com hora e setor.<br>
Gerado por <code>NUCLEO/motor/06-ferramentas/painel-logs.py</code></div>
</div></body></html>"""


def gerar(perfis, linhas, segundos):
    dados = {p: coletar(p, linhas) for p in perfis}
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(montar(perfis, dados, segundos), encoding="utf-8")
    return sum(len(v) for v in dados.values())


def main():
    ap = argparse.ArgumentParser(description="Painel de logs ao vivo do Hermes")
    ap.add_argument("--perfil", action="append", help="perfil (pode repetir)")
    ap.add_argument("--linhas", type=int, default=1200, help="linhas lidas por arquivo")
    ap.add_argument("--watch", action="store_true", help="fica atualizando")
    ap.add_argument("--seg", type=int, default=5, help="segundos entre atualizacoes")
    a = ap.parse_args()

    perfis = perfis_existentes(a.perfil or PERFIS_PADRAO)
    if not perfis:
        print("Nenhum perfil com logs encontrado.", file=sys.stderr)
        return 1

    if not a.watch:
        n = gerar(perfis, a.linhas, 0)
        print(f"Painel gerado: {SAIDA}")
        print(f"{n} eventos | perfis: {', '.join(perfis)}")
        return 0

    print(f"Atualizando a cada {a.seg}s. Abra: {SAIDA}")
    print("Ctrl+C para parar.")
    try:
        while True:
            n = gerar(perfis, a.linhas, a.seg)
            print(f"  {agora()} — {n} eventos", flush=True)
            time.sleep(a.seg)
    except KeyboardInterrupt:
        print("\nParado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
