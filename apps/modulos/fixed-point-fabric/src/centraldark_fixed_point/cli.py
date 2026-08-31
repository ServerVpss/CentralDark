from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from pathlib import Path

from .config import load_config
from .dashboard import serve
from .codec import compact_project, decode_bytes, encode_bytes
from .engine import FixedPointEngine, receipt_json
from .github_state import GitHubStateLibrary
from .policy import FixedPointPolicy
from .probes import GitHubProbe, LocalProbe, ScreenpipeProbe, VPSProbe
from .store import EventStore
from .seal import build_seal, verify_seal
from .webhook import serve as serve_webhook


def build_engine(config: dict) -> FixedPointEngine:
    data_dir = Path(config.get("data_dir", ".centraldark-fp"))
    store = EventStore(data_dir / "fixed-point.db")
    policy_config = config.get("policy", {})
    policy = FixedPointPolicy(
        required_domains=tuple(policy_config.get("required_domains", ["local", "vps", "github", "screenpipe"])),
        required_stable_samples=int(policy_config.get("required_stable_samples", 2)),
        max_observation_age_seconds=int(policy_config.get("max_observation_age_seconds", 120)),
        max_open_promotion_prs=int(policy_config.get("max_open_promotion_prs", 1)),
    )
    probes = [
        LocalProbe(config.get("local", {})),
        VPSProbe(config.get("vps", {})),
        GitHubProbe({**config.get("github", {}), "max_open_promotion_prs": policy.max_open_promotion_prs}),
        ScreenpipeProbe(config.get("screenpipe", {})),
    ]
    return FixedPointEngine(
        probes=probes,
        store=store,
        policy=policy,
        sample_interval_seconds=float(policy_config.get("sample_interval_seconds", 10)),
        max_rounds=int(policy_config.get("max_rounds", 12)),
    )


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="centraldark-fp")
    parser.add_argument("--config", default="config/centraldark.fixed-point.json")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("once")
    sub.add_parser("watch")
    sub.add_parser("status")
    sub.add_parser("verify-chain")
    doctor = sub.add_parser("doctor")
    doctor.add_argument("--json", action="store_true")
    dashboard = sub.add_parser("dashboard")
    dashboard.add_argument("--host", default="127.0.0.1")
    dashboard.add_argument("--port", type=int, default=8788)
    webhook = sub.add_parser("webhook-server")
    webhook.add_argument("--host", default="127.0.0.1")
    webhook.add_argument("--port", type=int, default=8790)
    encode = sub.add_parser("encode")
    encode.add_argument("source")
    decode = sub.add_parser("decode")
    decode.add_argument("envelope")
    decode.add_argument("destination")
    pack = sub.add_parser("pack")
    pack.add_argument("source")
    pack.add_argument("destination")
    seal = sub.add_parser("seal")
    seal.add_argument("root")
    seal.add_argument("output")
    seal.add_argument("paths", nargs="+")
    verify = sub.add_parser("verify-seal")
    verify.add_argument("root")
    verify.add_argument("seal")
    args = parser.parse_args(argv)

    config = load_config(args.config)
    engine = build_engine(config)
    if args.command == "once":
        snapshot, decision = engine.run_once()
    elif args.command == "watch":
        snapshot, decision = engine.run_until_fixed_point()
    elif args.command == "status":
        print(json.dumps(engine.store.get_state("last_verdict", {}), ensure_ascii=False, indent=2))
        return 0
    elif args.command == "verify-chain":
        valid, count = engine.store.verify_chain()
        print(json.dumps({"valid": valid, "events": count}))
        return 0 if valid else 2
    elif args.command == "doctor":
        result = {"python": sys.version.split()[0], "git": shutil.which("git"), "config": str(Path(args.config).resolve()), "store": str(engine.store.path.resolve())}
        print(json.dumps(result, ensure_ascii=False, indent=2) if args.json else "\n".join(f"{k}: {v}" for k, v in result.items()))
        return 0 if result["git"] else 2
    elif args.command == "dashboard":
        serve(engine.store, args.host, args.port)
        return 0
    elif args.command == "webhook-server":
        secret_env = config.get("github_webhook", {}).get("secret_env", "CENTRALDARK_GITHUB_WEBHOOK_SECRET")
        secret = os.getenv(secret_env)
        if not secret:
            print(f"missing webhook secret in {secret_env}", file=sys.stderr)
            return 2
        serve_webhook(GitHubStateLibrary(engine.store, secret), args.host, args.port)
        return 0
    elif args.command == "encode":
        print(json.dumps(encode_bytes(Path(args.source).read_bytes()), indent=2))
        return 0
    elif args.command == "decode":
        envelope = json.loads(Path(args.envelope).read_text(encoding="utf-8"))
        Path(args.destination).write_bytes(decode_bytes(envelope))
        return 0
    elif args.command == "pack":
        print(json.dumps(compact_project(Path(args.source), Path(args.destination)), indent=2))
        return 0
    elif args.command == "seal":
        seal_payload = build_seal(Path(args.root), args.paths)
        Path(args.output).write_text(json.dumps(seal_payload, indent=2), encoding="utf-8")
        print(json.dumps(seal_payload, indent=2))
        return 0
    elif args.command == "verify-seal":
        seal_payload = json.loads(Path(args.seal).read_text(encoding="utf-8"))
        result = verify_seal(Path(args.root), seal_payload)
        print(json.dumps(result, indent=2))
        return 0 if result["valid"] else 4
    else:
        return 2
    print(receipt_json(snapshot, decision))
    return 0 if decision.reached else 3
