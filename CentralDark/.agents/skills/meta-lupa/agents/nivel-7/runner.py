"""Runner isolado (fora de tests/): roda a suite sem gerar __pycache__.
Uso: python .agents/skills/meta-lupa/agents/nivel-7/runner.py
"""
import os, sys, shutil, subprocess, pathlib

os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
sys.dont_write_bytecode = True

ROOT = pathlib.Path(__file__).resolve().parent


def _limpar_pycache():
    for p in ROOT.rglob("__pycache__"):
        shutil.rmtree(p, ignore_errors=True)


def main() -> int:
    _limpar_pycache()
    env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}
    cmd = [
        sys.executable, "-B", "-m", "pytest",
        "-p", "no:cacheprovider",
        "--import-mode=importlib",
        "-q", str(ROOT / "tests"),
    ]
    proc = subprocess.run(cmd, env=env, cwd=str(ROOT))
    _limpar_pycache()
    return proc.returncode


if __name__ == "__main__":
    sys.exit(main())
