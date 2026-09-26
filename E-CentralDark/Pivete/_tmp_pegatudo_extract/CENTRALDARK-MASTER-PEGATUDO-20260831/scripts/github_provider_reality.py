#!/usr/bin/env python3
import urllib.request, json, hashlib, datetime, sys

API_VERSION="2026-03-10"

def canon(obj):
    return json.dumps(obj,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode("utf-8")

def h(obj):
    return hashlib.sha256(canon(obj)).hexdigest()

def fetch_json(url):
    req=urllib.request.Request(url,headers={
        "Accept":"application/vnd.github+json",
        "X-GitHub-Api-Version":API_VERSION,
        "User-Agent":"CentralDark-Provider-Reality"
    })
    with urllib.request.urlopen(req,timeout=15) as r:
        return json.load(r)

def build_receipt(meta, versions=None):
    domains=meta.get("domains",{})
    return {
        "observed_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "api_version":API_VERSION,
        "meta_sha256":h(meta),
        "domains_sha256":h(domains),
        "hooks_sha256":h(meta.get("hooks",[])),
        "api_ranges_sha256":h(meta.get("api",[])),
        "actions_ranges_sha256":h(meta.get("actions",[])),
        "ssh_fingerprints_sha256":h(meta.get("ssh_key_fingerprints",{})),
        "commit_signing_keys_sha256":h(meta.get("commit_signing_keys",[])),
        "versions_sha256":h(versions) if versions is not None else None,
        "meta_is_webhook_authentication":False
    }

if __name__=="__main__":
    meta=fetch_json("https://api.github.com/meta")
    try:
        versions=fetch_json("https://api.github.com/versions")
    except Exception:
        versions=None
    print(json.dumps(build_receipt(meta,versions),indent=2))
