import importlib.util
import sys

spec = importlib.util.spec_from_file_location("meta_lupa_old", "meta_lupa_old.py")
old = importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)

sys.path.insert(0, r"E:/CentralDark/Pivete/worktrees/pr585-findings/.agents/skills/meta-lupa/scripts")
import meta_lupa as new  # noqa: E402


def receipt(**overrides):
    base = {
        "mission_id": "X", "host": "h", "timestamp_utc": "2026-08-01T19:20:00Z",
        "repository": "ServerVpss/CentralDark", "target": "t",
        "branch": "some-other-branch", "head_sha": "8f5925f0abef0467f8204d327c97cebe152351d4",
        "evidence_path": "p", "evidence_sha256": "a" * 64,
        "writer": "claude", "judge": "NONE", "status": "PASS", "reason": "",
        "impact": "", "mutations": [], "tests": [], "counterproof": [],
        "rollback": "", "chief_decision": "APPROVED", "next_step": "",
    }
    base.update(overrides)
    return base


print("=== ACHADO 1: placeholder de judge ('NONE') ===")
repo_root_for_r1 = "E:/CentralDark/Pivete/worktrees/pr585-findings"
import subprocess as _sp
real_head_for_r1 = _sp.run(["git", "-C", repo_root_for_r1, "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
r1 = receipt(head_sha=real_head_for_r1, judge="NONE")

ok_old, _, det_old = old.validate_operation_receipt(r1, repo_root=repo_root_for_r1)
print(f"OLD (0bf226ae5): ok={ok_old} head_sha_verified={det_old.get('head_sha_verified')} approved_for_promotion={det_old.get('approved_for_promotion')}  <- judge='NONE' contava como judge real")

ok_new, _, det_new = new.validate_operation_receipt(r1, repo_root=repo_root_for_r1)
print(f"NEW (atual):     ok={ok_new} head_sha_verified={det_new.get('head_sha_verified')} approved_for_promotion={det_new.get('approved_for_promotion')}  <- judge='NONE' normalizado para ausente")

print()
print("=== ACHADO 2: HEAD ancestral aceito como HEAD atual (sem binding exato) ===")
repo_root = "E:/CentralDark/Pivete/worktrees/pr585-findings"
import subprocess
ancestor = subprocess.run(["git", "-C", repo_root, "rev-parse", "HEAD~5"], capture_output=True, text=True).stdout.strip()
current = subprocess.run(["git", "-C", repo_root, "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
print(f"ancestor={ancestor} current={current}")

r = receipt(head_sha=ancestor, judge="JUDGE_REAL")
ok_old, _, det_old = old.validate_operation_receipt(r, repo_root=repo_root)
print(f"OLD (0bf226ae5): ok={ok_old} head_sha_verified={det_old.get('head_sha_verified')} approved_for_promotion={det_old.get('approved_for_promotion')}  <- aceitava ancestral como se fosse HEAD atual")

ok_new, reason_new, det_new = new.validate_operation_receipt(
    r, repo_root=repo_root, expected_head=current, expected_branch="some-other-branch", expected_target="t"
)
print(f"NEW (atual):     ok={ok_new} reason={reason_new}  <- rejeita por nao bater com expected_head")

print()
print("=== ACHADO 3: evidence_sha256 nunca verificado contra bytes reais (so formato) ===")
import tempfile, hashlib
tmpdir = tempfile.mkdtemp()
evidence_file = f"{tmpdir}/evidence.txt"
with open(evidence_file, "w", encoding="utf-8") as fh:
    fh.write("conteudo original")
real_hash_of_original = hashlib.sha256(b"conteudo original").hexdigest()
fake_hash = "0" * 64  # nao bate com o conteudo real, mas tem formato valido

r3 = receipt(evidence_path="evidence.txt", evidence_sha256=fake_hash, judge="JUDGE_REAL", head_sha=current)
ok_old, _, det_old = old.validate_operation_receipt(r3, repo_root=repo_root)
print(f"OLD (0bf226ae5): ok={ok_old}  <- nao tinha nocao de evidence_root, so checava o FORMATO do hash (aceita hash que nao bate com o arquivo real)")

ok_new, reason_new, det_new = new.validate_operation_receipt(r3, repo_root=repo_root, evidence_root=tmpdir)
print(f"NEW (atual):     ok={ok_new} reason={reason_new}  <- calcula o sha256 real do arquivo e rejeita por nao bater")

