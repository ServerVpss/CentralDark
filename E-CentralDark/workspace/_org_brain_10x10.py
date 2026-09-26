"""Rename BRAIN children to NUMERO-NOME. Max 10. No empty slots. Wikilinks by stem stay."""
from pathlib import Path
import subprocess, shutil

root = Path(r"E:/CentralDark/Pivete/CentralDark")
vault = root / "docs" / "BRAIN"
repo = root

def git_mv(src: Path, dst: Path):
    dst.parent.mkdir(parents=True, exist_ok=True)
    rel_s = src.relative_to(root).as_posix()
    rel_d = dst.relative_to(root).as_posix()
    r = subprocess.run(
        ["git", "-C", str(root), "mv", "-k", rel_s, rel_d],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        if not src.exists():
            print("MISS", src)
            return
        if dst.exists():
            print("EXISTS", dst)
            return
        shutil.move(str(src), str(dst))
        print("FS_MV", rel_s, "->", rel_d)
        return
    print("GIT_MV", rel_s, "->", rel_d)

moves = []

# 01-CONCEITOS dirs
c1 = vault / "01-CONCEITOS"
for old, new in [
    ("Artefatos", "01-ARTEFATOS"),
    ("Banda", "02-BANDA"),
    ("Dissonancia", "03-DISSONANCIA"),
    ("Identidade", "04-IDENTIDADE"),
    ("Mineração", "05-MINERACAO"),
    ("Orquestração", "06-ORQUESTRACAO"),
    ("Ouro", "07-OURO"),
]:
    moves.append((c1 / old, c1 / new))

# 02-ENTRADA
e2 = vault / "02-ENTRADA"
moves.append((e2 / "Raw", e2 / "01-RAW"))

# 03-DOCUMENTACAO dirs
d3 = vault / "03-DOCUMENTACAO"
moves.append((d3 / "AGENTS-LIBRARY", d3 / "01-AGENTS-LIBRARY"))
moves.append((d3 / "BIBLIOTECA", d3 / "02-BIBLIOTECA"))

# 08
a8 = vault / "08-ARTEFATOS-VISUAIS"
moves.append((a8 / "CARTAZES-CANONICOS", a8 / "01-CARTAZES-CANONICOS"))

# 00 overflow -> 3 subcats (20 files > 10)
m0 = vault / "00-MAPA-SISTEMA"
hub = m0 / "01-HUB"
graf = m0 / "02-GRAFOS"
mocs = m0 / "03-MOCS"
for d in (hub, graf, mocs):
    d.mkdir(exist_ok=True)

hub_files = [
    "BRAIN.md", "INDEX.md", "INDEX-MAPA.md", "00-MAPA.md",
    "00-LEIA-PRIMEIRO.md", "README.md", "PROTOCOLO-INICIALIZACAO.md",
    "00-POSTURA-PIVETE.md",
]
graf_files = [
    "GRAFO-VIVO.md", "ARVORE-SEMANTICA-DA-CASA.md", "MAPA-DO-CEREBRO.md",
    "MAPA-OBSIDIAN-BRAIN.md", "MAPA-DOS-BOTS.md", "DIRECAO-ATUAL-HERMES.md",
    "PLANO.md", "02-ARQUITETURA.md",
]
moc_files = [
    "MOC-CentralDark-HubBot.md", "MOC-GitHub.md", "MOC-MCP.md",
    "MOC-PM2.md", "MOC-Skills.md",
]
for n in hub_files:
    moves.append((m0 / n, hub / n))
for n in graf_files:
    moves.append((m0 / n, graf / n))
for n in moc_files:
    moves.append((m0 / n, mocs / n))

for src, dst in moves:
    if src.resolve() == dst.resolve():
        continue
    if not src.exists():
        print("SKIP_MISS", src.name)
        continue
    git_mv(src, dst)

print("DONE")
