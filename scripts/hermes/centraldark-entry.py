#!/usr/bin/env python3
"""!CENTRALDARK: read latest verified mission and resume its existing executable plan.
Uses the proven Hermes checkpoint owner; never creates a second memory or scheduler.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import shutil

HERE = Path(__file__).resolve().parent
CHECKPOINT = HERE / "verified-checkpoint.py"
ROOT = Path(os.environ.get("CENTRALDARK_HERMES_CHECKPOINTS", str(Path.home() / ".hermes/centraldark/verified-execution"))).expanduser()

def invoke(*args, timeout=12):
    return subprocess.run([sys.executable, str(CHECKPOINT), *args],
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                          text=True, timeout=timeout, check=False)

def state():
    if not CHECKPOINT.is_file():
        return {"ok": False, "state": "OWNER_NOT_INSTALLED"}
    try:
        r = invoke("status", "--mission", "latest")
        if r.returncode != 0:
            return {"ok": False, "state": "NO_VERIFIED_CHECKPOINT" if "NO_VERIFIED_CHECKPOINT" in r.stderr else "CHECKPOINT_UNAVAILABLE"}
        d = json.loads(r.stdout)
        v = invoke("verify", "--mission", d["mission"])
        if v.returncode != 0 or json.loads(v.stdout).get("status") != "HASH_CHAIN_PASS":
            return {"ok": False, "state": "CHECKPOINT_INTEGRITY_FAILED"}
        latest = invoke("resume", "--mission", d["mission"], "--format", "json")
        if latest.returncode != 0:
            return {"ok": False, "state": "CHECKPOINT_READ_FAILED"}
        detail = json.loads(latest.stdout)
    except (OSError, ValueError, subprocess.TimeoutExpired, KeyError):
        return {"ok": False, "state": "CHECKPOINT_UNAVAILABLE"}
    folder = ROOT / d["mission"]
    plan = folder / "active-plan.json"
    permitted = (
        plan.is_file() and not plan.is_symlink()
        and folder.resolve().parent == ROOT.resolve()
    )
    can_run = False
    if permitted:
        try:
            p = json.loads(plan.read_text(encoding="utf-8"))
            can_run = p.get("mission") == d["mission"] and p.get("schema") == "centraldark.hermes.execution-plan.v1"
        except (ValueError, OSError):
            can_run = False
    return {
        "ok": True, "state": "VERIFIED_CHECKPOINT_FOUND",
        "mission": d["mission"], "last_step": d["last_step"],
        "next_cursor": d["next_cursor"], "intent": detail.get("intent", ""),
        "receipt_sha256": d["current_sha256"],
        "verified_steps": d["verified"], "events": d["events"],
        "at": detail.get("at"), "plan_ready": can_run,
        "dispatch_ready": (Path("/root/.local/bin/hermes").is_file() or shutil.which("hermes") is not None),
        "owner": "scripts/hermes/verified-checkpoint.py",
    }

def human_prompt(d):
    if not d.get("ok"):
        return ("!CENTRALDARK: " + d["state"] + "\n"
                "Não há prova atual para retomar; descobrir a intenção vigente e a primeira execução.")
    return (
        "!CENTRALDARK\n"
        "Recuperei o último checkpoint de execução VERIFICADO. Continue sem repetir etapas verdes.\n"
        f"MISSAO={d['mission']}\n"
        f"INTENCAO={d['intent']}\n"
        f"ULTIMO_PASS={d['last_step']}\n"
        f"NEXT_CURSOR={d['next_cursor']}\n"
        f"RECEIPT_SHA256={d['receipt_sha256']}\n"
        f"PLANO_EXECUTAVEL={'SIM' if d['plan_ready'] else 'NAO'}\n"
        f"HERMES_KANBAN_DISPONIVEL={'SIM' if d.get('dispatch_ready') else 'NAO'}\n"
        "Use os owners e ferramentas reais da superfície atual; execute NEXT_CURSOR e comprove antes de avançar.\n"
        "SOURCE=verified-checkpoint.py; INTEGRIDADE=HASH_CHAIN_PASS"
    )

def main():
    cli = argparse.ArgumentParser(description="!CENTRALDARK — retomar automaticamente a missão provada mais recente")
    cli.add_argument("--status", action="store_true", help="retornar estado filtrado em JSON")
    cli.add_argument("--continue", dest="resume_plan", action="store_true", help="retomar plano verificado ou despachar ao Kanban Hermes original")
    cli.add_argument("--help-cockpit", action="store_true", help="orientação curta para a interface")
    args = cli.parse_args()
    d = state()
    if args.help_cockpit:
        print("O cockpit Hermes mostra a última missão, o último PASS, NEXT_CURSOR, SHA e botões de atualização e continuidade.")
        return
    if args.status:
        print(json.dumps(d, ensure_ascii=False))
        return
    if args.resume_plan:
        if not d.get("ok"):
            print(json.dumps(d, ensure_ascii=False))
            raise SystemExit(4)
        if not d.get("plan_ready"):
            if not d.get("dispatch_ready"):
                print(json.dumps({**d, "state": "HERMES_EXECUTOR_UNAVAILABLE"}, ensure_ascii=False))
                raise SystemExit(5)
            hermes = "/root/.local/bin/hermes" if Path("/root/.local/bin/hermes").is_file() else shutil.which("hermes")
            if not hermes:
                raise SystemExit(5)
            key = "centraldark:resume:" + d["mission"] + ":" + d["receipt_sha256"][:16]
            title = "[CENTRALDARK] " + d["mission"][:75] + " · continuar de " + str(d["next_cursor"])[:60]
            body = (
                human_prompt(d) + "\n"
                "OPERACAO=CONTINUAR_MISSAO_ATUAL_COM_HERMES_KANBAN_EXISTENTE\n"
                "NEXT_CURSOR_OBRIGATORIO=" + str(d["next_cursor"]) + "\n"
                "JUIZ=REALIDADE_COM_READBACK; ENQUEUED_NOT_COMPLETED; NAO_REPETIR_ETAPAS_VERDES\n"
                "AO_CONCLUIR_CADA_ETAPA: USAR_OWNER_VERIFIED_CHECKPOINT_RUN_OU_PLAN_E_GRAVAR_RECEIPT\n"
                "MESMA_MISSAO=" + d["mission"] + "\n"
            )
            args = [hermes, "kanban", "create", "--goal", "--goal-max-turns", "12",
                    "--idempotency-key", key, "--body-file", "-",
                    "--created-by", "centraldark-checkpoint", "--json", title]
            try:
                p = subprocess.run(args, input=body, capture_output=True, text=True, timeout=45, check=False)
            except (OSError, subprocess.TimeoutExpired):
                print(json.dumps({**d, "ok": False, "state": "HERMES_KANBAN_DISPATCH_ERROR"}, ensure_ascii=False))
                raise SystemExit(5)
            if p.returncode != 0:
                print(json.dumps({**d, "ok": False, "state": "HERMES_KANBAN_DISPATCH_FAILED", "exit": p.returncode}, ensure_ascii=False))
                raise SystemExit(5)
            try:
                result = json.loads(p.stdout)
            except ValueError:
                result = {}
            task_id = result.get("id") or result.get("task_id")
            print(json.dumps({"ok": True, "status": "ENQUEUED_AWAITING_RUNTIME_PROOF",
                              "mission": d["mission"], "next_cursor": d["next_cursor"],
                              "task_id": task_id, "receipt_sha256": d["receipt_sha256"],
                              "same_task_reused_by_idempotency_key": True}, ensure_ascii=False))
            return
        plan = ROOT / d["mission"] / "active-plan.json"
        result = subprocess.run(
            [sys.executable, str(CHECKPOINT), "plan", "--mission", d["mission"], "--file", str(plan)],
            cwd="/root" if Path("/root").exists() else str(Path.home()),
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180, check=False,
        )
        print(result.stdout[-6000:], end="" if result.stdout.endswith("\n") else "\n")
        if result.stderr:
            print("PLAN_STDERR_REDACTED_IN_UI", file=sys.stderr)
        raise SystemExit(result.returncode)
    print(human_prompt(d))

if __name__ == "__main__":
    main()
