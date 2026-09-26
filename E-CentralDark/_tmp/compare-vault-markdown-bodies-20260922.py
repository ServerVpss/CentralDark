import json, hashlib, pathlib, re
report = pathlib.Path(r"E:\CentralDark\_tmp\brain-sync-classified-20260922.json")
main_root = pathlib.Path(r"E:\CentralDark\_tmp\centraldark-ci-main-20260919\docs\BRAIN")
vault_root = pathlib.Path(r"E:\CentralDark\Pivete\CASA-VAULT\00-CANONICO\docs\BRAIN")
rows = json.loads(report.read_text(encoding="utf-8-sig"))

def body(text):
    text=text.replace("\r\n","\n")
    if text.startswith("---\n"):
        end=text.find("\n---\n",4)
        if end>=0:
            text=text[end+5:]
    text="\n".join(line.rstrip() for line in text.split("\n")).strip()+"\n"
    return text

out=[]
for r in rows:
    rel=r["path"]
    if not rel.lower().endswith(".md"): continue
    if r["classification"] not in ("VAULT_CHANGED_ONLY","BOTH_CHANGED_CONFLICT"): continue
    a=main_root / pathlib.PureWindowsPath(rel)
    b=vault_root / pathlib.PureWindowsPath(rel)
    if not a.exists() or not b.exists(): continue
    ma=body(a.read_text(encoding="utf-8-sig"))
    vb=body(b.read_text(encoding="utf-8-sig"))
    out.append({
      "path":rel,
      "classification":r["classification"],
      "body_equal":ma==vb,
      "main_body_sha256":hashlib.sha256(ma.encode()).hexdigest(),
      "vault_body_sha256":hashlib.sha256(vb.encode()).hexdigest(),
      "main_body_lines":len(ma.splitlines()),
      "vault_body_lines":len(vb.splitlines())
    })
print(json.dumps(out,ensure_ascii=False,indent=2))
