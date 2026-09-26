import io, subprocess, sys, shutil, re

SRC = "validar-escritor-unico.mjs"
TEST = "validar-escritor-unico.test.mjs"
GUARD = "/tmp/orig-guard.mjs"

shutil.copy(SRC, GUARD)
h_antes = subprocess.run(["git", "hash-object", SRC], capture_output=True, text=True).stdout.strip()
print(f"HASH_ANTES={h_antes}\n")

MUTANTES = [
    ("REMOVE_FRONTIER_SCOPE",
     "    if (isHistory) {\n      historySeen.add(writer);",
     "    if (false) {\n      historySeen.add(writer);"),
    ("REMOVE_RANGE_VALIDATION",
     "  if (!RANGE_RE.test(value)) {\n    throw new Error(`RANGE_INVALID:${value.slice(0, 40)}`);\n  }\n  const raw = execFileSync(\"git\", [\"log\", \"--format=%H%x1f%B%x1e\", value, \"--\"]",
     "  const raw = execFileSync(\"git\", [\"log\", \"--format=%H%x1f%B%x1e\", value, \"--\"]"),
    ("REMOVE_NON_LINEAR_GUARD",
     'if (mode === "migrate" && hasMergeCommits(range)) {',
     'if (false) {'),
    ("MIGRATE_SEM_FRONTEIRA_PASSA",
     '  if (mode === "migrate" && !enforceFrom) {\n    return shell({ problems: ["ACTIVATION_FRONTIER_REQUIRED"] });\n  }\n',
     ''),
    ("FRONTEIRA_INEXISTENTE_VIRA_VERDE",
     'return shell({ problems: [`ACTIVATION_FRONTIER_NOT_FOUND:${enforceFrom.slice(0, 12)}`] });',
     'frontierIndex = commits.length;'),
    ("TIP_INVALIDO_PASSA",
     'if (!tip || tip.status !== "OK" || tip.scope !== "enforced" || !tip.writer) {',
     'if (false) {'),
]

resultados = []
for nome, velho, novo in MUTANTES:
    shutil.copy(GUARD, SRC)
    s = io.open(SRC, encoding="utf8").read()
    if s.count(velho) != 1:
        resultados.append((nome, "SKIP", f"padrao casou {s.count(velho)}x"))
        continue
    io.open(SRC, "w", encoding="utf8").write(s.replace(velho, novo, 1))
    if io.open(SRC, encoding="utf8").read() == io.open(GUARD, encoding="utf8").read():
        resultados.append((nome, "SKIP", "mutacao nao alterou o arquivo"))
        continue
    r = subprocess.run(["node", "--test", TEST], capture_output=True, text=True)
    saida = r.stdout + r.stderr
    m = re.search(r"^# fail (\d+)", saida, re.M)
    falhas = int(m.group(1)) if m else -1
    if "SyntaxError" in saida or falhas < 0:
        resultados.append((nome, "SKIP", "mutante nao compila"))
        continue
    resultados.append((nome, "MORTO" if falhas > 0 else "SOBREVIVEU", f"{falhas} falha(s)"))

shutil.copy(GUARD, SRC)
h_depois = subprocess.run(["git", "hash-object", SRC], capture_output=True, text=True).stdout.strip()

for nome, estado, detalhe in resultados:
    print(f"{estado:12} {nome:34} {detalhe}")

mortos = sum(1 for _, e, _ in resultados if e == "MORTO")
validos = sum(1 for _, e, _ in resultados if e in ("MORTO", "SOBREVIVEU"))
print(f"\nSCORE={mortos}/{validos}")
print(f"HASH_DEPOIS={h_depois}")
print("RESTAURACAO=" + ("PROVADA" if h_antes == h_depois else "FALHOU"))
sys.exit(0 if mortos == validos and validos == len(MUTANTES) else 1)
