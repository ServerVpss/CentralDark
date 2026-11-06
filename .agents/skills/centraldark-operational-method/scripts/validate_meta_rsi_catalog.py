from pathlib import Path
import json,subprocess
R=Path(__file__).resolve().parents[1]
W=R.parents[2]
cat=json.loads((R/"Skills/meta-rsi/catalog.json").read_text(encoding="utf-8"))
assert len(cat["methods"])==40
assert [x["id"] for x in cat["methods"]]==list(range(1,41))
assert len(set(x["slug"] for x in cat["methods"]))==40
for x in cat["methods"]+cat["meta_adapters"]:
    p=W/x["contract"]
    assert p.is_file(),x["contract"]
    assert "Skill Mae" in p.read_text(encoding="utf-8"),x["contract"]
for x in cat["meta_adapters"]:
    assert (W/x["source"]).is_file() or subprocess.run(["git","-C",str(W),"cat-file","-e","HEAD:"+x["source"]],capture_output=True).returncode==0,x["source"]
print(json.dumps({"result":"PASS","self_methods":40,"adapters":len(cat["meta_adapters"]),"runtime":"UNKNOWN"}))
