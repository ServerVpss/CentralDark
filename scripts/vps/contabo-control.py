#!/usr/bin/env python3
"""CentralDark — Contabo Control Plane.

Owner: scripts/vps/ | PR-mãe: #1562
Resolve o objetivo `contabo_operavel` via cláusulas:

    contabo_autenticado  <- credenciais_presentes (env)
    instance_medido      <- contabo_autenticado
    snapshot_ready       <- contabo_autenticado
    reinstalado          <- reinstall_armed, mutacao_permitida, imagem

Regras invioláveis:
  - Segredos SÓ vêm do ambiente (nunca literais no código, log, receipt).
  - NUNCA imprime valor de token/secret/password.
  - Mutação (reinstall/reset) TRAVADA por CONTABO_MUTATION=1 + --confirm.
  - Leitura (auth/instance/snapshot/images) sempre liberada.

Uso:
    contabo-control.py auth
    contabo-control.py instance      [--id vmiXXXX]
    contabo-control.py snapshot      [--id vmiXXXX] [--snap snapXXXX]
    contabo-control.py images
    contabo-control.py reinstall --image-id <id> --confirm   # GATED
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid


def env(key, default=""):
    return os.getenv(key, default).strip()


def die(msg, code=1):
    print(f"CONTABO_CONTROL=FAIL {msg}", file=sys.stderr)
    sys.exit(code)


def redact_len(secret):
    """Prova de presença sem vazar valor."""
    return f"len={len(secret)}" if secret else "ABSENT"


def get_token():
    required = {
        "client_id": env("CONTABO_CLIENT_ID"),
        "client_secret": env("CONTABO_CLIENT_SECRET"),
        "username": env("CONTABO_API_USER"),
        "password": env("CONTABO_API_PASSWORD"),
    }
    auth_url = env("CONTABO_AUTH_URL")
    absent = [k for k, v in required.items() if not v] + (
        [] if auth_url else ["auth_url"]
    )
    if absent:
        die("MISSING_ENV=" + ",".join(absent))

    payload = urllib.parse.urlencode({**required, "grant_type": "password"}).encode()
    req = urllib.request.Request(auth_url, data=payload, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.load(r)
    except urllib.error.HTTPError as e:
        die(f"AUTH_HTTP={e.code}")
    except Exception as e:  # noqa: BLE001
        die(f"AUTH_ERR={type(e).__name__}")
    token = data.get("access_token", "")
    if not token:
        die("AUTH_NO_TOKEN")
    return token


def api_get(path):
    base = env("CONTABO_API_BASE").rstrip("/")
    if not base:
        die("MISSING_ENV=CONTABO_API_BASE")
    token = get_token()
    req = urllib.request.Request(
        f"{base}{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "x-request-id": str(uuid.uuid4()),
            "Accept": "application/json",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, json.load(r)


def api_post(path, body):
    base = env("CONTABO_API_BASE").rstrip("/")
    if not base:
        die("MISSING_ENV=CONTABO_API_BASE")
    token = get_token()
    req = urllib.request.Request(
        f"{base}{path}",
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "x-request-id": str(uuid.uuid4()),
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status, json.load(r)


def cmd_auth(_args):
    # Prova de credenciais sem vazar valor.
    print("CONTABO_CLIENT_ID=" + ("PRESENT" if env("CONTABO_CLIENT_ID") else "ABSENT"))
    print("CONTABO_CLIENT_SECRET=" + redact_len(env("CONTABO_CLIENT_SECRET")))
    print("CONTABO_API_USER=" + ("PRESENT" if env("CONTABO_API_USER") else "ABSENT"))
    print("CONTABO_API_PASSWORD=" + redact_len(env("CONTABO_API_PASSWORD")))
    token = get_token()
    print("CONTABO_AUTH=PASS")
    print("TOKEN=" + redact_len(token))
    print("CONTABO_MUTATION=" + env("CONTABO_MUTATION", "0"))


def resolve_instance_id(identifier):
    """Resolve the existing provider name without guessing its numeric ID."""
    if str(identifier).isdecimal():
        return str(identifier)
    matches = []
    page = 1
    while True:
        _, listing = api_get(f"/compute/instances?size=100&page={page}")
        matches.extend(i for i in listing.get("data", []) if i.get("name") == identifier)
        if page >= listing.get("_pagination", {}).get("totalPages", 1):
            break
        page += 1
    if len(matches) != 1 or not str(matches[0].get("instanceId", "")).isdecimal():
        die("INSTANCE_ALIAS_UNRESOLVED_OR_AMBIGUOUS")
    print("INSTANCE_ALIAS=" + identifier)
    return str(matches[0]["instanceId"])


def cmd_instance(args):
    iid = resolve_instance_id(args.id or env("CONTABO_INSTANCE_ID", "vmi3256920"))
    status, data = api_get(f"/compute/instances/{iid}")
    inst = (data.get("data") or [{}])[0]
    print(f"HTTP={status}")
    print("INSTANCE_ID=" + str(iid))
    print("STATUS=" + str(inst.get("status", "")))
    print("NAME=" + str(inst.get("name", "")))
    print("IMAGE_ID=" + str(inst.get("imageId", "")))
    print("PRODUCT=" + str(inst.get("productId", "")))
    print("REGION=" + str(inst.get("region", "")))
    ip = (inst.get("ipConfig") or {}).get("v4", {}).get("ip", "")
    print("IPv4=" + str(ip))
    print("CPU_CORES=" + str(inst.get("cpuCores", "")))
    ram = inst.get("ramMb")
    print("RAM_GB=" + (str(ram // 1024) if isinstance(ram, int) else str(ram)))
    disk = inst.get("diskMb")
    print("DISK_GB=" + (str(disk // 1024) if isinstance(disk, int) else str(disk)))


def cmd_snapshot(args):
    iid = resolve_instance_id(args.id or env("CONTABO_INSTANCE_ID", "vmi3256920"))
    snap = args.snap or env("CONTABO_SNAPSHOT_ID", "snap1790430960")
    status, data = api_get(f"/compute/instances/{iid}/snapshots/{snap}")
    s = (data.get("data") or [{}])[0]
    print(f"HTTP={status}")
    print("SNAPSHOT_ID=" + str(snap))
    print("SNAP_NAME=" + str(s.get("name", "")))
    print("SNAP_STATUS=" + str(s.get("status") or "UNKNOWN"))
    print("SNAP_CREATED=" + str(s.get("createdDate", "")))
    print("SNAP_IMAGE=" + str(s.get("imageId", "")))


def cmd_images(_args):
    page, imgs = 1, []
    while True:
        status, data = api_get(
            f"/compute/images?size=100&page={page}&orderBy=name:asc"
        )
        imgs.extend(data.get("data", []))
        if page >= data.get("_pagination", {}).get("totalPages", 1):
            break
        page += 1
    print(f"HTTP={status}")
    print("IMAGE_COUNT=" + str(len(imgs)))
    for img in imgs:
        name = str(img.get("name", ""))
        st = str(img.get("status") or "UNKNOWN")
        std = "STANDARD" if img.get("standardImage") else "CUSTOM"
        print(f"IMAGE: id={img.get('imageId','')} name={name} status={st} kind={std}")


def cmd_reinstall(args):
    # CLÁUSULA GATED: mutação exige CONTABO_MUTATION=1 + --confirm explícito.
    if env("CONTABO_MUTATION", "0") != "1":
        die("MUTATION_BLOCKED CONTABO_MUTATION!=1 (leitura ok, mutação travada)")
    if not args.confirm:
        die("MUTATION_BLOCKED missing --confirm")
    if not args.image_id:
        die("MISSING_ARG=--image-id")
    iid = resolve_instance_id(args.id or env("CONTABO_INSTANCE_ID", "vmi3256920"))
    body = {"imageId": args.image_id}
    if args.ssh_keys:
        body["sshKeys"] = [int(k) for k in args.ssh_keys.split(",") if k.strip()]
    if args.user_data_file:
        with open(args.user_data_file, "r", encoding="utf-8") as f:
            body["userData"] = f.read()
    status, data = api_post(f"/compute/instances/{iid}", body)
    print(f"HTTP={status}")
    print("REINSTALL_REQUESTED=1")
    print("INSTANCE_ID=" + str(iid))
    print("IMAGE_ID=" + str(args.image_id))
    print("RESPONSE=" + json.dumps(data)[:400])


def main():
    p = argparse.ArgumentParser(description="Contabo Control Plane — CentralDark")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("auth").set_defaults(func=cmd_auth)

    pi = sub.add_parser("instance")
    pi.add_argument("--id")
    pi.set_defaults(func=cmd_instance)

    ps = sub.add_parser("snapshot")
    ps.add_argument("--id")
    ps.add_argument("--snap")
    ps.set_defaults(func=cmd_snapshot)

    sub.add_parser("images").set_defaults(func=cmd_images)

    pr = sub.add_parser("reinstall")
    pr.add_argument("--id")
    pr.add_argument("--image-id", required=False)
    pr.add_argument("--ssh-keys", help="IDs separados por vírgula")
    pr.add_argument("--user-data-file")
    pr.add_argument("--confirm", action="store_true")
    pr.set_defaults(func=cmd_reinstall)

    args = p.parse_args()
    try:
        args.func(args)
    except urllib.error.HTTPError as e:
        die(f"HTTP={e.code} {e.reason}")
    except Exception as e:  # noqa: BLE001
        die(f"{type(e).__name__}")


if __name__ == "__main__":
    main()
