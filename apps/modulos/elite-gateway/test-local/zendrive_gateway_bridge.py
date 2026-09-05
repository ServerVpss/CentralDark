#!/usr/bin/env python3
"""CentralDark Zendrive handoff.

Uma rota real, sem resolver paralelo:
Zendrive → centraldark_master_cycle.py → contexto RANDOLF → Hub CANDIDATE
→ Central de Notificações. UNKNOWN != PASS.
"""

import argparse
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = Path(__file__).resolve().parents[4]
LOGS_DIR = BASE_DIR / "logs"
MASTER_CYCLE = REPO_ROOT / "scripts" / "trigger-fabric" / "centraldark_master_cycle.py"
CANONICAL_PROFILE_ID = "ORQUESTRACAO_SOL"
CANONICAL_PROFILE_DISPLAY = "😎 Orquestração SOL 🌞"
DEFAULT_HUB_URL = "https://api.centralldark.com/memoria/ingest"


def load_dump(filename="last_messages.json"):
    path = LOGS_DIR / filename
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    return payload if isinstance(payload, list) else []


def get_last_message(dump, role):
    for message in reversed(dump):
        if message.get("role") == role and message.get("text"):
            return str(message["text"])
    return None


def current_head_sha():
    try:
        proc = subprocess.run(
            ["git", "-C", str(REPO_ROOT), "rev-parse", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
            timeout=10,
        )
        return proc.stdout.strip() or None
    except (OSError, subprocess.SubprocessError):
        return None


def post_json(url, payload, headers, timeout=20):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = Request(url, data=data, headers=headers, method="POST")
    try:
        with urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            status = int(response.status)
    except HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        status = int(exc.code)
    except (URLError, TimeoutError, OSError) as exc:
        return {"transport_ok": False, "status": None, "body": None, "error": str(exc)}
    try:
        body = json.loads(raw or "{}")
    except ValueError:
        body = {"raw": raw[:2048]}
    return {"transport_ok": True, "status": status, "body": body, "error": None}


def resolve_master_cycle(trigger_text, input_mode, source_surface, session_id):
    if not MASTER_CYCLE.exists():
        return {"status": "QUEBRADO", "reason": "MASTER_CYCLE_ABSENT", "receipt": None}
    command = [
        sys.executable, str(MASTER_CYCLE),
        "--text", trigger_text or "",
        "--chefe-source",
        "--input-mode", input_mode,
        "--source-surface", source_surface,
        "--profile-id", CANONICAL_PROFILE_ID,
        "--profile-display", CANONICAL_PROFILE_DISPLAY,
    ]
    if session_id:
        command.extend(["--session-id", session_id])
    try:
        proc = subprocess.run(command, check=False, capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError) as exc:
        return {"status": "QUEBRADO", "reason": f"MASTER_CYCLE_EXEC_ERROR:{exc}", "receipt": None}
    if proc.returncode != 0:
        return {"status": "QUEBRADO", "reason": f"MASTER_CYCLE_EXIT_{proc.returncode}", "receipt": None}
    try:
        receipt = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return {"status": "QUEBRADO", "reason": "MASTER_CYCLE_INVALID_JSON", "receipt": None}
    active = bool(receipt.get("master_cycle_active"))
    return {
        "status": "PROVADO" if active else "EVIDENCIA_FALTANTE",
        "reason": None if active else "MASTER_CYCLE_NOT_ACTIVATED",
        "receipt": receipt,
    }


def build_context(master_result, session_id, source_surface, intent_goal):
    receipt = master_result.get("receipt") or {}
    provenance = receipt.get("session_provenance") or {}
    telemetry = receipt.get("guided_telemetry") or {}
    return {
        "source_surface": source_surface,
        "session_id": session_id or provenance.get("session_id"),
        "profile_id": provenance.get("profile_id") or CANONICAL_PROFILE_ID,
        "profile_display": provenance.get("profile_display") or CANONICAL_PROFILE_DISPLAY,
        "intent_goal": intent_goal,
        "owner": "apps/modulos/elite-gateway/test-local/zendrive_gateway_bridge.py",
        "head_sha": current_head_sha(),
        "next_cursor": telemetry.get("next_cursor"),
        "runtime": "LOCAL_ZENDRIVE_BRIDGE",
        "master_cycle_status": master_result.get("status"),
        "master_cycle_activation_source": receipt.get("activation_source"),
    }


def build_knowledge_event(assistant_text, context):
    stable = json.dumps(
        {
            "assistant": assistant_text,
            "session_id": context.get("session_id"),
            "intent_goal": context.get("intent_goal"),
            "head_sha": context.get("head_sha"),
        },
        ensure_ascii=False,
        sort_keys=True,
    )
    event_id = f"zendrive-{hashlib.sha256(stable.encode('utf-8')).hexdigest()[:24]}"
    return {
        "event_id": event_id,
        "source": "elite-gateway-zendrive",
        "kind": "session.handoff",
        "title": "Zendrive → CentralDark · handoff de sessão",
        "text": assistant_text,
        "intent_goal": context.get("intent_goal"),
        "owner": context.get("owner"),
        "provenance": json.dumps(context, ensure_ascii=False, sort_keys=True),
        "source_surface": context.get("source_surface"),
        "session_id": context.get("session_id"),
        "profile_id": context.get("profile_id"),
        "profile_display": context.get("profile_display"),
        "head_sha": context.get("head_sha"),
        "next_cursor": context.get("next_cursor"),
        "metadata": {
            "component": "elite-gateway",
            "runtime": context.get("runtime"),
            "owner": context.get("owner"),
            "head_sha": context.get("head_sha"),
            "status": context.get("master_cycle_status"),
            "source_surface": context.get("source_surface"),
            "session_id": context.get("session_id"),
            "profile_id": context.get("profile_id"),
            "profile_display": context.get("profile_display"),
            "next_cursor": context.get("next_cursor"),
        },
    }


def publish_hub(event):
    token = os.getenv("MEMORIA_INGEST_TOKEN", "").strip()
    url = os.getenv("CENTRALDARK_KNOWLEDGE_HUB_URL", DEFAULT_HUB_URL).strip()
    if not token or not url:
        return {"status": "EVIDENCIA_FALTANTE", "reason": "HUB_TOKEN_OR_URL_UNCONFIGURED", "receipt": None}
    result = post_json(
        url,
        event,
        {"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    if not result["transport_ok"]:
        return {"status": "QUEBRADO", "reason": f"HUB_REQUEST_ERROR:{result['error']}", "receipt": None}
    body = result["body"] or {}
    ok = result["status"] == 202 and bool(body.get("accepted"))
    return {
        "status": "PROVADO" if ok else "QUEBRADO",
        "reason": None if ok else f"HUB_HTTP_{result['status']}",
        "receipt": body,
    }


def project_notification(context, hub_result):
    base = os.getenv("HUB_SUPABASE_URL", "").strip().rstrip("/")
    anon = os.getenv("HUB_SUPABASE_ANON_KEY", "").strip()
    if not base or not anon:
        return {"status": "EVIDENCIA_FALTANTE", "reason": "NOTIFICATION_RUNTIME_ENV_UNCONFIGURED"}
    hub_receipt = hub_result.get("receipt") or {}
    payload = {
        **context,
        "knowledge_event_id": hub_receipt.get("event_id"),
        "status": hub_result.get("status"),
        "recurso": "CENTRALDARK_KNOWLEDGE_HUB",
        "acao": "SESSION_HANDOFF",
        "ia": "SOL/HERMES",
    }
    result = post_json(
        f"{base}/functions/v1/notify-event",
        {
            "event_key": "centraldark.session.handoff",
            "severity": "sucesso" if hub_result.get("status") == "PROVADO" else "aviso",
            "title": "SOL · sessão encaminhada pelo Hub",
            "body": "Zendrive → Master Cycle → RANDOLF/Hub → Central de Notificações",
            "payload": payload,
            "group_key": f"centraldark-session-{context.get('session_id') or 'unknown'}",
            "debounce_seconds": 30,
        },
        {"Authorization": f"Bearer {anon}", "apikey": anon, "Content-Type": "application/json"},
    )
    if not result["transport_ok"]:
        return {"status": "QUEBRADO", "reason": f"NOTIFICATION_REQUEST_ERROR:{result['error']}"}
    ok = result["status"] is not None and 200 <= result["status"] < 300
    return {"status": "PROVADO" if ok else "QUEBRADO", "reason": None if ok else f"NOTIFICATION_HTTP_{result['status']}"}


def self_test():
    dump = [{"role": "user", "text": "!CENTRALDARK"}, {"role": "assistant", "text": "ok"}]
    fake_master = {
        "status": "PROVADO",
        "receipt": {
            "activation_source": "EXPLICIT_TRIGGER",
            "session_provenance": {
                "session_id": "test-session",
                "profile_id": CANONICAL_PROFILE_ID,
                "profile_display": CANONICAL_PROFILE_DISPLAY,
            },
            "guided_telemetry": {"next_cursor": "ACORDAR"},
        },
    }
    context = build_context(fake_master, "test-session", "SELF_TEST", get_last_message(dump, "user"))
    event = build_knowledge_event(get_last_message(dump, "assistant"), context)
    checks = {
        "master_cycle_exists": MASTER_CYCLE.exists(),
        "last_user_recovered": get_last_message(dump, "user") == "!CENTRALDARK",
        "last_assistant_recovered": get_last_message(dump, "assistant") == "ok",
        "profile_preserved": event.get("profile_id") == CANONICAL_PROFILE_ID,
        "session_preserved": event.get("session_id") == "test-session",
        "next_cursor_preserved": event.get("next_cursor") == "ACORDAR",
        "owner_is_existing_bridge": event.get("owner", "").endswith("zendrive_gateway_bridge.py"),
        "network_not_required_for_self_test": True,
    }
    return {"ok": all(checks.values()), "checks": checks}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--no-publish", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        print(json.dumps(self_test(), ensure_ascii=False, indent=2))
        return 0

    dump = load_dump("reconciled_both.json") or load_dump("last_messages.json")
    if not dump:
        print(json.dumps({"status": "QUEBRADO", "reason": "DUMP_ABSENT"}, ensure_ascii=False))
        return 1
    assistant_text = get_last_message(dump, "assistant")
    trigger_text = get_last_message(dump, "user") or os.getenv("CENTRALDARK_TRIGGER_TEXT", "")
    if not assistant_text:
        print(json.dumps({"status": "QUEBRADO", "reason": "ASSISTANT_RESPONSE_ABSENT"}, ensure_ascii=False))
        return 1

    input_mode = os.getenv("CENTRALDARK_INPUT_MODE", "text").strip().lower()
    if input_mode not in {"text", "voice"}:
        input_mode = "text"
    source_surface = os.getenv("CENTRALDARK_SOURCE_SURFACE", "HERMES_DESKTOP_ZENDRIVE").strip() or "HERMES_DESKTOP_ZENDRIVE"
    session_id = os.getenv("CENTRALDARK_SESSION_ID", "").strip() or None

    master_result = resolve_master_cycle(trigger_text, input_mode, source_surface, session_id)
    context = build_context(master_result, session_id, source_surface, trigger_text)
    event = build_knowledge_event(assistant_text, context)
    if args.no_publish:
        hub_result = {"status": "EVIDENCIA_FALTANTE", "reason": "PUBLISH_DISABLED", "receipt": None}
        notification_result = {"status": "EVIDENCIA_FALTANTE", "reason": "PUBLISH_DISABLED"}
    else:
        hub_result = publish_hub(event)
        notification_result = project_notification(context, hub_result)

    receipt = {
        "schema": "centraldark.zendrive-handoff.v1",
        "master_cycle": master_result,
        "randolf_context": context,
        "knowledge_event": {k: v for k, v in event.items() if k != "text"},
        "hub": hub_result,
        "notification": notification_result,
        "gateway_response": {
            "id": event["event_id"],
            "object": "chat.completion",
            "model": "zendrive/contra",
            "choices": [{"message": {"role": "assistant", "content": assistant_text}}],
        },
        "all_points_connected": (
            master_result.get("status") == "PROVADO"
            and hub_result.get("status") == "PROVADO"
            and notification_result.get("status") == "PROVADO"
        ),
        "unknown_is_pass": False,
    }
    print(json.dumps(receipt, ensure_ascii=False, indent=2))
    return 0 if receipt["all_points_connected"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
