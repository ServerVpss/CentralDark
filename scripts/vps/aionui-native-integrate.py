#!/usr/bin/env python3
"""Replay the AionUi/Hermes binding using the existing CentralDark owners."""
import argparse,json,shutil,subprocess,urllib.request,urllib.parse,sys,hashlib
from pathlib import Path
import yaml
sys.path.insert(0, str(Path(__file__).resolve().parent))
parser=argparse.ArgumentParser()
parser.add_argument("--repo",type=Path,default=Path(__file__).resolve().parents[2])
parser.add_argument("--web-url",default="http://127.0.0.1:25808")
parser.add_argument("--apply",action="store_true")
parser.add_argument("--verify-only",action="store_true",help="Read-only proof of existing AionUi -> CentralDark MCP stdio binding; no API mutations")
args=parser.parse_args()
repo=args.repo.resolve()
if args.verify_only:
    # Idempotent proof: do not persist/process secrets or change the current runtime.
    entry=(repo/"apps/modulos/mcp/dist/mcp-server.js").resolve()
    node=Path("/usr/local/bin/node").resolve()
    inspected=0
    matches=0
    for proc in Path("/proc").iterdir():
        if not proc.name.isdigit():
            continue
        try:
            argv=[x.decode(errors="replace") for x in (proc/"cmdline").read_bytes().split(b"\\0") if x]
            if len(argv)<5 or Path(argv[0]).resolve()!=node or Path(argv[1]).resolve()!=entry:
                continue
            inspected+=1
            flags=set(argv[2:])
            parent=int(next(line.split()[1] for line in (proc/"status").read_text().splitlines() if line.startswith("PPid:")))
            parent_name=(Path("/proc")/str(parent)/"comm").read_text().strip()
            # Read only the required label. Never echo, hash, or persist credentials.
            label=next((item.split(b"=",1)[1] for item in (proc/"environ").read_bytes().split(b"\\0")
                        if item.startswith(b"CENTRALDARK_CLIENT_LABEL=")),b"")
            if {"--stdio","--compact","--admin"}.issubset(flags) and parent_name=="aioncore" and label==b"AionUi":
                matches+=1
        except (OSError,ValueError,StopIteration):
            continue
    try:
        with urllib.request.urlopen("http://127.0.0.1:25808/",timeout=5) as response:
            web_ok=response.status==200
    except (OSError,ValueError):
        web_ok=False
    entry_ok=entry.is_file()
    digest=hashlib.sha256(entry.read_bytes()).hexdigest() if entry_ok else None
    passed=bool(entry_ok and matches>0 and web_ok)
    print(json.dumps({"status":"PASS" if passed else "UNKNOWN",
       "owner":"scripts/vps/aionui-native-integrate.py",
       "binding":"AionUi -> aioncore -> existing CentralDark MCP stdio",
       "transport":"stdio","flags":["--stdio","--compact","--admin"],
       "client_label":"AionUi","matching_children":matches,
       "inspected_mcp_children":inspected,"webui_http_200":web_ok,
       "runtime_entry_exists":entry_ok,"runtime_dist_sha256":digest,
       "scope":"process_binding_only; tool_call_E2E_not_proven",
       "secrets_exposed":False},ensure_ascii=False))
    raise SystemExit(0 if passed else 2)
from current_model_resolver import resolve_current_model
current_model=resolve_current_model()
if urllib.parse.urlparse(args.web_url).hostname not in {"127.0.0.1","localhost"}:raise SystemExit("LOCAL_WEBUI_REQUIRED")
def api(path,data=None,method=None):
    req=urllib.request.Request(args.web_url+path,data=None if data is None else json.dumps(data).encode(),headers={"Content-Type":"application/json"},method=method)
    with urllib.request.urlopen(req,timeout=90) as response:value=json.load(response)
    if isinstance(value,dict) and value.get("success") is False:raise RuntimeError(value.get("error"))
    return value.get("data",value) if isinstance(value,dict) else value
def backup(path):
    target=Path.home()/".hermes/backups"/("aion-native-"+__import__("datetime").datetime.now().strftime("%Y%m%d-%H%M%S"))
    target.mkdir(parents=True,exist_ok=True)
    if path.exists():shutil.copy2(path,target/path.name)
if not args.apply:
    print(json.dumps({"servers":[{"id":s["id"],"name":s["name"],"enabled":s.get("enabled"),"status":s.get("last_test_status")} for s in api("/api/mcp/servers")],"providers":[{"id":p["id"],"name":p["name"],"models":p.get("models")} for p in api("/api/providers")]},ensure_ascii=False))
    raise SystemExit()
node=shutil.which("node")
if not node:raise SystemExit("NODE_UNAVAILABLE")
entry=repo/"apps/modulos/mcp/dist/mcp-server.js"
if not entry.exists():raise SystemExit("EXISTING_MCP_ENTRY_REQUIRED")
servers=api("/api/mcp/servers")
server=next((s for s in servers if s["name"]=="CentralDark"),None)
env=dict((server or {}).get("transport",{}).get("env",{}));env["CENTRALDARK_CLIENT_LABEL"]="AionUi"
transport={"type":"stdio","command":node,"args":[str(entry),"--stdio","--compact","--admin"],"env":env}
payload={"transport":transport}
server=api("/api/mcp/servers/"+server["id"],payload,"PUT") if server else api("/api/mcp/servers",{**payload,"name":"CentralDark","description":"Existing canonical catalog and native media bindings"})
test=api("/api/mcp/test-connection",server)
if not test.get("success"):raise SystemExit("MCP_TEST_FAILED:"+str(test.get("error")))
if not server.get("enabled"):server=api("/api/mcp/servers/"+server["id"]+"/toggle",{})
providers=api("/api/providers");provider=next((p for p in providers if p.get("base_url")=="http://127.0.0.1:18435/v1"),None)
payload={"model_protocols":{current_model:"openai"},"model_settings":{current_model:{"image_input":"unsupported","openai_api_mode":"chat_completions"}}}
if provider:
    payload["models"]=list(dict.fromkeys(provider.get("models",[])+[current_model]))
    provider=api("/api/providers/"+provider["id"],payload,"PUT")
else:provider=api("/api/providers",{**payload,"platform":"custom","name":"Kylin Native — existing bridge","base_url":"http://127.0.0.1:18435/v1","api_key":"local","models":[current_model],"enabled":True})
stt=api("/api/settings/client?keys=tools.speechToText").get("tools.speechToText") or {}
if not stt.get("enabled") or stt.get("openai",{}).get("base_url")=="http://127.0.0.1:18435/v1":
    api("/api/settings/client",{"tools.speechToText":{"enabled":True,"autoSend":False,"provider":"openai","openai":{"api_key":"local","base_url":"http://127.0.0.1:18435/v1","model":"ensemble-asr_paraformer_nonstreaming"}}},"PUT")
config=Path.home()/".hermes/config.yaml"
if config.exists():
    backup(config);value=yaml.safe_load(config.read_text()) or {}
    value.setdefault("mcp_servers",{})["centraldark"]={"command":node,"args":transport["args"],"env":{"CENTRALDARK_CLIENT_LABEL":"Hermes"},"timeout":180}
    config.write_text(yaml.safe_dump(value,allow_unicode=True,sort_keys=False))
bridge=Path.home()/".hermes/kylin_openai_bridge.py"
source=repo/"scripts/vps/kylin-openai-bridge.py"
changed=not bridge.exists() or bridge.read_bytes()!=source.read_bytes()
if changed:backup(bridge);shutil.copy2(source,bridge)
unit=Path("/etc/systemd/system/centraldark-kylin-native-bridge.service")
unit_text=f"""[Unit]
Description=CentralDark Kylin native SDK bridge (existing owner)
After=network.target kytensor.service

[Service]
Type=simple
ExecStart=/usr/bin/python3 {bridge}
Environment=CENTRALDARK_NATIVE_MEDIA_ADAPTER={repo}/scripts/vps/kylin-native-media.py
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
"""
unit_changed=not unit.exists() or unit.read_text()!=unit_text
if unit_changed:backup(unit);unit.write_text(unit_text)
subprocess.run(["systemctl","daemon-reload"],check=True)
subprocess.run(["systemctl","enable","centraldark-kylin-native-bridge.service"],check=True)
if changed or unit_changed:subprocess.run(["systemctl","restart","centraldark-kylin-native-bridge.service"],check=True)
else:subprocess.run(["systemctl","start","centraldark-kylin-native-bridge.service"],check=True)
# Relocate the same tree, preserving old absolute paths through a symlink.
old=Path("/tmp/aionui-v2.2.2");persistent=Path("/opt/centraldark/aionui")
if old.exists() and old.resolve()!=persistent and not persistent.exists():
    origin=old.resolve();persistent.parent.mkdir(parents=True,exist_ok=True)
    shutil.move(str(origin),str(persistent));origin.symlink_to(persistent,target_is_directory=True)
web_unit=Path("/etc/systemd/system/centraldark-aionui-webui.service")
if web_unit.exists() and persistent.exists():
    original=web_unit.read_text();updated=original.replace("WorkingDirectory=/tmp/aionui-v2.2.2","WorkingDirectory=/opt/centraldark/aionui")
    if original!=updated:backup(web_unit);web_unit.write_text(updated);subprocess.run(["systemctl","daemon-reload"],check=True)
print(json.dumps({"status":"BINDING_REPLAYED","mcp_id":server["id"],"provider_id":provider["id"],"visible_tools":len(test.get("tools",[])),"same_catalog_dispatcher":True,"runtime_effect_proof_required":True}))
