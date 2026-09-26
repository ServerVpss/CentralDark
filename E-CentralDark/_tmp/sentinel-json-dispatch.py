import os, pathlib, subprocess, sys
sentinel = pathlib.Path(sys.argv[1])
payload = pathlib.Path(sys.argv[2]).read_text(encoding="utf-8-sig")
env = os.environ.copy()
env["PYTHONIOENCODING"] = "utf-8"
env["PYTHONUTF8"] = "1"
p = subprocess.run(
    [sys.executable, str(sentinel), "--event-json", payload],
    text=True,
    capture_output=True,
    encoding="utf-8",
    errors="replace",
    env=env,
)
if p.stdout:
    sys.stdout.write(p.stdout)
if p.stderr:
    sys.stderr.write(p.stderr)
raise SystemExit(p.returncode)
