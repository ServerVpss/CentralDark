#!/usr/bin/env python3
"""MetaLupa Bayesiana - calculadora determinística + auto-registro de uso.

Substitui cálculo manual (SKILL.md Fase 5). Todos os cálculos são
reprodutíveis e sem dependências externas.

Uso (cálculo):
  python lupa_bayesiana.py --prior 0.3 --lr 5 2
  python lupa_bayesiana.py --entropia 0.5
  python lupa_bayesiana.py --voi 10 2 1

Uso (auto-registro obrigatório de uso da skill - BOOT):
  python lupa_bayesiana.py begin-use --repo ServerVpss/CentralDark \
      --mission-id <id> --skill-path .agents/skills/lupa-bayesiana/SKILL.md \
      --skill-ref <ref> --skill-commit-sha <sha> --workspace-head <sha> \
      --mode read-only
  python lupa_bayesiana.py finish-use --mission-id <id> \
      --verdict APROVAR --autolupa sim --point-fixed sim \
      --tests-manifest <json> --evidence-manifest <json>
  python lupa_bayesiana.py verify-ledger
  python lupa_bayesiana.py promote-learning --usage-id <id>

LUPA_REGISTRATION_MODE=1 desliga a abertura de recibo aninhado (anti-recursão).
"""
import argparse
import hashlib
import json
import math
import os
import re
import sys
import tempfile
from datetime import datetime, timezone

LEDGER_NAME = "references/uso-ledger.jsonl"
SCHEMA_VERSION = 1
REGISTRATION_ENV = "LUPA_REGISTRATION_MODE"

SECRET_PATTERNS = [
    re.compile(r"Authorization:\s*Bearer\s+\S+", re.I),
    re.compile(r"(WEBUI_LOVABLE_KEY|SUPABASE_KEY|SERVICE_ROLE|API_KEY|TOKEN|SECRET)\s*[=:]\s*\S+", re.I),
    re.compile(r"ssh-ed25519\s+[A-Za-z0-9+/]{20,}"),
    re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"),
    re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
    re.compile(r"(pk|sk|rk)_(live|test)_[A-Za-z0-9]{10,}"),  # stripe-style
    re.compile(r"[a-z]+://[^:\s]+:[^@\s]+@"),  # url com credencial usuario:senha@
    re.compile(r"(ghp_|github_pat_|glpat-|hf_)[A-Za-z0-9]{10,}"),  # pats comuns
]


def odds(p: float) -> float:
    if p <= 0 or p >= 1:
        raise ValueError("prior deve estar estritamente em (0,1); 0 e 1 tornam crenca dogmatica")
    return p / (1 - p)


def prob(o: float) -> float:
    return o / (1 + o)


def posterior(prior: float, lrs: list[float]) -> float:
    o = odds(prior)
    for lr in lrs:
        o *= lr
    return prob(o)


def entropia(p: float) -> float:
    if p <= 0 or p >= 1:
        return 0.0
    return -p * math.log2(p) - (1 - p) * math.log2(1 - p)


def voi(perda_antes: float, perda_depois: float, custo: float) -> float:
    return perda_antes - perda_depois - custo


# ---- Auto-registro ----

def _ledger_path() -> str:
    env = os.environ.get("LUPA_LEDGER_PATH")
    if env:
        return env
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(here, LEDGER_NAME)


def _now_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def usage_id(schema_version: int, repo: str, mission_id: str, skill_commit_sha: str, workspace_head: str) -> str:
    canonical = json.dumps(
        {
            "schema_version": schema_version,
            "repo": repo,
            "mission_id": mission_id,
            "skill_commit_sha": skill_commit_sha,
            "workspace_head": workspace_head,
        },
        sort_keys=True,
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def sanitize(text: str) -> tuple[str, bool]:
    blocked = False
    out = text
    for pat in SECRET_PATTERNS:
        if pat.search(out):
            blocked = True
            out = pat.sub("[REDACTED]", out)
    # paths com usuario
    out = re.sub(r"[A-Za-z]:\\Users\\[^\\ ]+", "[REDACTED_USER]", out)
    out = re.sub(r"/home/[^/ ]+/", "[REDACTED_USER]/", out)
    return out, blocked


def _record_hash(rec: dict) -> str:
    # exclui campos volateis (timestamps, proprio hash) para que idempotencia
    # seja por conteudo semantico, nao por hora de gravacao
    volatile = {"started_at_utc", "finished_at_utc", "record_hash"}
    payload = {k: v for k, v in rec.items() if k not in volatile}
    payload = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _read_ledger() -> list[dict]:
    path = _ledger_path()
    if not os.path.exists(path):
        return []
    out = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            out.append(json.loads(line))
    return out


def _append_atomic(rec: dict) -> None:
    path = _ledger_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    data = json.dumps(rec, ensure_ascii=False) + "\n"
    # lock exclusivo simples cross-platform (evita corrida de escrita - caso 11)
    lock = path + ".lock"
    lf = open(lock, "w", encoding="utf-8")
    try:
        try:
            import msvcrt
            msvcrt.locking(lf.fileno(), msvcrt.LK_LOCK, 1)
        except ImportError:
            import fcntl
            fcntl.flock(lf.fileno(), fcntl.LOCK_EX)
        # APPEND real: reler conteudo existente + acrescentar
        existing = ""
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                existing = f.read()
        fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(existing + data)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    finally:
        try:
            lf.close()
        except Exception:
            pass
        if os.path.exists(lock):
            try:
                os.remove(lock)
            except Exception:
                pass


def _registration_active() -> bool:
    return os.environ.get(REGISTRATION_ENV) == "1"


def cmd_begin_use(args) -> int:
    if _registration_active():
        return 0  # anti-recursao: nao abre recibo do recibo
    uid = usage_id(SCHEMA_VERSION, args.repo, args.mission_id, args.skill_commit_sha, args.workspace_head)
    # idempotencia
    for rec in _read_ledger():
        if rec.get("usage_id") == uid and rec.get("event") == "BEGIN":
            print(f"BEGIN_EXISTS usage_id={uid}")
            return 0
    rec = {
        "schema_version": SCHEMA_VERSION,
        "event": "BEGIN",
        "usage_id": uid,
        "started_at_utc": _now_utc(),
        "repo": args.repo,
        "mission_id": args.mission_id,
        "workspace_branch": args.workspace_branch,
        "workspace_head": args.workspace_head,
        "skill_path": args.skill_path,
        "skill_ref": args.skill_ref,
        "skill_commit_sha": args.skill_commit_sha,
        "skill_blob_sha": args.skill_blob_sha,
        "mode": args.mode,
        "authorization": "PERMITO PIVETE SEM AÇÃO DESTRUTIVA",
        "source": "git",
    }
    rec["record_hash"] = _record_hash({k: v for k, v in rec.items() if k != "record_hash"})
    _append_atomic(rec)
    print(f"BEGIN_RECORDED usage_id={uid}")
    return 0


def cmd_finish_use(args) -> int:
    if _registration_active():
        return 0
    uid = args.usage_id or os.environ.get("LUPA_USAGE_ID", "")
    if not uid:
        # tenta recuperar ultimo BEGIN orfao desta mission
        for rec in reversed(_read_ledger()):
            if rec.get("event") == "BEGIN" and rec.get("mission_id") == args.mission_id:
                uid = rec["usage_id"]
                break
    if not uid:
        print("NO_BEGIN_FOUND", file=sys.stderr)
        return 1
    # idempotencia: FINAL existente
    existing = [r for r in _read_ledger() if r.get("usage_id") == uid and r.get("event") == "FINAL"]
    rec = {
        "schema_version": SCHEMA_VERSION,
        "event": "FINAL",
        "usage_id": uid,
        "finished_at_utc": _now_utc(),
        "verdict": args.verdict,
        "autolupa_executed": args.autolupa == "sim",
        "point_fixed_evidential": args.point_fixed == "sim",
        "own_errors_found": [],
        "corrections": [],
        "test_suites": args.test_suites,
        "checks": args.checks,
        "test_cases": args.test_cases,
        "property_cases": args.property_cases,
        "pass": args.pass_,
        "fail": args.fail,
        "files_changed": args.files_changed or [],
        "pr": args.pr,
        "evidence": args.evidence or [],
        "new_defect_ids": [],
        "duplicate_defect_ids": [],
        "xp_valid": args.xp_valid,
        "xp_rejected": args.xp_rejected,
        "residual_risk": args.residual_risk or [],
        "result": args.result,
    }
    rec["record_hash"] = _record_hash({k: v for k, v in rec.items() if k != "record_hash"})
    if existing:
        if existing[0]["record_hash"] == rec["record_hash"]:
            print(f"FINAL_IDEMPOTENT usage_id={uid}")
            return 0
        print(f"FINAL_CONFLICT usage_id={uid}", file=sys.stderr)
        return 2
    _append_atomic(rec)
    print(f"FINAL_RECORDED usage_id={uid}")
    return 0


def cmd_verify_ledger(args) -> int:
    recs = _read_ledger()
    begins = [r for r in recs if r.get("event") == "BEGIN"]
    finals = [r for r in recs if r.get("event") == "FINAL"]
    orphan = [b["usage_id"] for b in begins if b["usage_id"] not in {f["usage_id"] for f in finals}]
    print(f"TOTAL={len(recs)} BEGIN={len(begins)} FINAL={len(finals)} ORPHAN_BEGIN={len(orphan)}")
    for o in orphan:
        print(f"ORPHAN_BEGIN usage_id={o}")
    return 0


def cmd_promote_learning(args) -> int:
    uid = args.usage_id
    recs = _read_ledger()
    final = [r for r in recs if r.get("usage_id") == uid and r.get("event") == "FINAL"]
    if not final:
        print("NO_FINAL_FOR_USAGE", file=sys.stderr)
        return 1
    # gate: somente aprendizado novo comprovado sobe (validado externamente)
    print(f"PROMOTE_GATE_OPEN usage_id={uid} (validar causa raiz + teste de reincidencia + crítico)")
    return 0


def main() -> None:
    ap = argparse.ArgumentParser(description="MetaLupa Bayesiana - calculo deterministico + auto-registro")
    ap.add_argument("--prior", type=float, help="probabilidade prior em (0,1)")
    ap.add_argument("--lr", type=float, nargs="*", default=[], help="likelihood ratios")
    ap.add_argument("--entropia", type=float, help="calcula H(p) para p dado")
    ap.add_argument("--voi", nargs=3, type=float, metavar=("ANTES", "DEPOIS", "CUSTO"), help="valor esperado da informacao")

    sub = ap.add_subparsers(dest="cmd")

    b = sub.add_parser("begin-use")
    b.add_argument("--repo", required=True)
    b.add_argument("--mission-id", required=True)
    b.add_argument("--skill-path", required=True)
    b.add_argument("--skill-ref", required=True)
    b.add_argument("--skill-commit-sha", required=True)
    b.add_argument("--skill-blob-sha", default="")
    b.add_argument("--workspace-branch", default="")
    b.add_argument("--workspace-head", required=True)
    b.add_argument("--mode", default="read-only")
    b.set_defaults(func=cmd_begin_use)

    f = sub.add_parser("finish-use")
    f.add_argument("--mission-id", required=True)
    f.add_argument("--usage-id", default="")
    f.add_argument("--verdict", required=True)
    f.add_argument("--autolupa", required=True)
    f.add_argument("--point-fixed", required=True)
    f.add_argument("--tests-manifest", default="")
    f.add_argument("--evidence-manifest", default="")
    f.add_argument("--test-suites", type=int, default=0)
    f.add_argument("--checks", type=int, default=0)
    f.add_argument("--test-cases", type=int, default=0)
    f.add_argument("--property-cases", type=int, default=0)
    f.add_argument("--pass", dest="pass_", type=int, default=0)
    f.add_argument("--fail", type=int, default=0)
    f.add_argument("--files-changed", nargs="*", default=[])
    f.add_argument("--pr", default=None)
    f.add_argument("--evidence", nargs="*", default=[])
    f.add_argument("--xp-valid", type=int, default=0)
    f.add_argument("--xp-rejected", type=int, default=0)
    f.add_argument("--residual-risk", nargs="*", default=[])
    f.add_argument("--result", default="CONCLUIDO")
    f.set_defaults(func=cmd_finish_use)

    v = sub.add_parser("verify-ledger")
    v.set_defaults(func=cmd_verify_ledger)

    p = sub.add_parser("promote-learning")
    p.add_argument("--usage-id", required=True)
    p.set_defaults(func=cmd_promote_learning)

    args = ap.parse_args()

    if args.cmd:
        sys.exit(args.func(args))

    if args.entropia is not None:
        print(f"H({args.entropia:.4f}) = {entropia(args.entropia):.4f} bits")
    if args.prior is not None:
        post = posterior(args.prior, args.lr)
        h0 = entropia(args.prior)
        h1 = entropia(post)
        print(f"prior={args.prior} LR={args.lr} -> posterior={post:.4f}")
        print(f"entropia antes={h0:.4f} depois={h1:.4f} reducao={h0 - h1:.4f}")
    if args.voi is not None:
        a, d, c = args.voi
        print(f"VOI = {voi(a, d, c):.4f}")


if __name__ == "__main__":
    main()
