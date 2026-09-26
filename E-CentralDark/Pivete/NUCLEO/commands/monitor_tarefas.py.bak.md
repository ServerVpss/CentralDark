# COMANDO - monitor_tarefas.py.bak.20260606-235529
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\docs\tarefas\monitor_tarefas.py.bak.20260606-235529
**SHA:** e19255e9791fbf7b
**Timestamp:** 2026-08-26T19:32:49.272423
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt = (

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import subprocess, time, shutil, re, os, json

PAUSA = int(os.environ.get("MONITOR_TAREFAS_PAUSA", "10"))
TIMEOUT_GROK = int(os.environ.get("MONITOR_TAREFAS_GROK_TIMEOUT", "180"))

def sh(cmd, ok=True, timeout=None, stdin=None):
    p = subprocess.run(cmd, shell=True, text=True, input=stdin, capture_output=True, timeout=timeout)
    if p.returncode and not ok:
        raise RuntimeError(p.stderr or p.stdout)
    return p.returncode, p.stdout or "", p.stderr or ""

def raiz():
    return Path(subprocess.check_output("git rev-parse --show-toplevel", shell=True, text=True).strip())

ROOT = raiz()
BASE = ROOT / "docs" / "tarefas"
ABERTAS = BASE / "abertas"
ANDAMENTO = BASE / "em_andamento"
CONCLUIDAS = BASE / "concluidas"
ERRO = BASE / "com_erro"
RESULTADOS = BASE / "resultados"
LOGS = BASE / "logs"

SEGREDOS = [
    re.compile(r"(token|password|authorization|apikey|api_key|secret|senha|cookie)[=: ]+[^\s,\"]+", re.I),
    re.compile(r"\bghp_[A-Za-z0-9]{20,}\b"),
    re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
    re.compile(r"\beyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\b"),
]

def agora():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def limpar(txt):
    txt = txt or ""
    for r in SEGREDOS:
        txt = r.sub("***OCULTO***", txt)
    return txt

def log(msg):
    LOGS.mkdir(parents=True, exist_ok=True)
    linha = f"[{agora()}] {limpar(msg)}\n"
    print(linha, end="", flush=True)
    with (LOGS / "monitor_tarefas.log").open("a", encoding="utf-8") as f:
        f.write(linha)

def preparar():
    for p in [ABERTAS, ANDAMENTO, CONCLUIDAS, ERRO, RESULTADOS, LOGS]:
        p.mkdir(parents=True, exist_ok=True)
        (p / ".gitkeep").touch()

def commit_push(msg):
    sh("git add docs/tarefas", True)
    code, out, err = sh(f'git commit -m "{msg}"', True)
    if code == 0:
        sh("git pull --rebase --autostash", True)
        sh("git push", True)

def metadados(conteudo):
    meta = {}
    if conteudo.startswith("---"):
        partes = conteudo.split("---", 2)
        if len(partes) >= 3:
            for linha in partes[1].splitlines():
                if ":" in linha:
                    k, v = linha.split(":", 1)
                    meta[k.strip().lower()] = v.strip()
    return meta

def grok_disponivel():
    code, out, err = sh("command -v grok", True)
    if code == 0 and out.strip():
        return out.strip()
    return ""

def executar_grok(prompt):
    caminho = grok_disponivel()
    diagnostico = {
        "grok_bin": caminho or "nao_encontrado",
        "tentativas": []
    }

    if not caminho:
        return False, "Grok CLI não encontrado no PATH da VPS.", diagnostico

    comandos = [
        f'timeout {TIMEOUT_GROK}s grok',
        f'timeout {TIMEOUT_GROK}s grok -p "$(cat /tmp/monitor_tarefas_prompt.md)"',
        f'timeout {TIMEOUT_GROK}s grok chat < /tmp/monitor_tarefas_prompt.md',
    ]

    Path("/tmp/monitor_tarefas_prompt.md").write_text(prompt, encoding="utf-8")

    for cmd in comandos:
        try:
            code, out, err = sh(cmd, True, timeout=TIMEOUT_GROK + 10, stdin=prompt if cmd.endswith("grok") else None)
            diagnostico["tentativas"].append({"cmd": cmd, "code": code, "stderr": limpar(err[:500])})
            texto = limpar((out or "").strip())
            if code == 0 and texto:
                return True, texto, diagnostico
        except Exception as e:
            diagnostico["tentativas"].append({"cmd": cmd, "erro": limpar(str(e)[:500])})

    code, help_out, help_err = sh("grok --help | head -80", True)
    diagnostico["help"] = limpar((help_out or help_err)[:2000])
    return False, "Grok foi encontrado, mas não respondeu em modo não interativo. Ver diagnostico.", diagnostico

def resultado_markdown(tarefa_id, executor, status, corpo, tarefa_original, extra=""):
    return (
        "---\n"
        f"id: {tarefa_id}\n"
        f"executor: {executor}\n"
        f"status: {status}\n"
        f"finalizado_em: {agora()}\n"
        "---\n\n"
        "# Resultado\n\n"
        f"{corpo}\n\n"
        f"{extra}\n"
        "## Tarefa lida\n\n"
        "```md\n" + tarefa_original + "\n```\n"
    )

def processar(tarefa):
    nome = tarefa.name
    tarefa_id = tarefa.stem
    em_andamento = ANDAMENTO / nome
    concluida = CONCLUIDAS / nome
    resultado = RESULTADOS / nome
    falha = ERRO / nome

    log(f"pegando tarefa {nome}")
    shutil.move(str(tarefa), str(em_andamento))

    try:
        conteudo = limpar(em_andamento.read_text(encoding="utf-8", errors="replace"))
        meta = metadados(conteudo)
        destino = meta.get("destino", "").lower()

        if destino == "grok":
            prompt = (
                "Você é o Grok trabalhando como executor assíncrono do projeto CentralDark.\n"
                "Leia a tarefa abaixo e responda de forma objetiva.\n"
                "Não exponha secrets. Não execute ação sensível. Apenas responda
```