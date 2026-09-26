# COMANDO - monitor_tarefas.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\docs\tarefas\monitor_tarefas.py
**SHA:** b131d18ddbf52ba1
**Timestamp:** 2026-08-26T19:32:49.260308
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt = (

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import subprocess, time, shutil, re, os, json, select

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
        log("grok: CLI nao encontrado no PATH")
        return False, "Grok CLI não encontrado no PATH da VPS.", diagnostico

    prompt_path = Path("/tmp/monitor_tarefas_prompt.md")
    prompt_path.write_text(prompt, encoding="utf-8")

    comandos = [
        ("stdin", f"timeout {TIMEOUT_GROK}s grok", True),
        ("prompt-file", f'timeout {TIMEOUT_GROK}s grok -p "$(cat /tmp/monitor_tarefas_prompt.md)"', False),
        ("chat-stdin", f"timeout {TIMEOUT_GROK}s grok chat < /tmp/monitor_tarefas_prompt.md", False),
    ]

    log("grok: preparando execucao ao vivo")
    log("grok: tarefa enviada para processamento")

    for modo, cmd, manda_stdin in comandos:
        inicio = time.time()
        ultimo_aviso = inicio
        stdout_partes = []
        stderr_partes = []

        log(f"grok: iniciando tentativa {modo}")

        try:
            proc = subprocess.Popen(
                cmd,
                shell=True,
                text=True,
                stdin=subprocess.PIPE if manda_stdin else None,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                bufsize=1,
            )

            if manda_stdin and proc.stdin:
                try:
                    proc.stdin.write(prompt)
                    proc.stdin.close()
                except BrokenPipeError:
                    pass

            while proc.poll() is None:
                agora_ts = time.time()

                if agora_ts - ultimo_aviso >= 10:
                    log(f"grok: trabalhando ha {int(agora_ts - inicio)}s...")
                    ultimo_aviso = agora_ts

                fontes = [f for f in [proc.stdout, proc.stderr] if f and not f.closed]
                if not fontes:
                    time.sleep(1)
                    continue

                ready, _, _ = select.select(fontes, [], [], 1)

                for fonte in ready:
                    linha = fonte.readline()
                    if not linha:
                        continue

                    limpa_linha = limpar(linha.strip())
                    if not limpa_linha:
                        continue

                    if fonte is proc.stdout:
                        stdout_partes.append(limpa_linha)
                        log(f"grok_saida: {limpa_linha[:500]}")
               
```