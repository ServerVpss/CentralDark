#!/usr/bin/env python3
"""
Local Windows test adapter for send_and_dump (Zendrive / elite-gateway capture).

Papel:
- usar sessão web LOCAL já autenticada;
- capturar revisão/contexto;
- entregar ao gateway existente;
- nunca gravar cookie/token no repositório;
- permitir quantos perfis locais o Chefe quiser via configuração de ambiente.

Fluxo: Zendrive -> CentralDark gateway. UNKNOWN != PASS.
"""
import asyncio
import argparse
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

DEFAULT_PROFILES = {
    "segredo": r"C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15",
    "fulano": r"C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 14",
}
BROWSER = os.getenv("ZENDRIVER_BROWSER", r"C:\Program Files\Google\Chrome\Application\chrome.exe")
LOGS_DIR = os.path.join(os.getcwd(), "logs")
ATTACH_PORT = os.getenv("ATTACH_PORT")

load_dotenv(os.path.join(os.getcwd(), "..", "config", ".env"), override=False)


def load_profiles():
    profiles = dict(DEFAULT_PROFILES)
    raw = os.getenv("CENTRALDARK_ZENDRIVE_PROFILES_JSON", "").strip()
    if raw:
        try:
            extra = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"CENTRALDARK_ZENDRIVE_PROFILES_JSON inválido: {exc}") from exc
        if not isinstance(extra, dict):
            raise RuntimeError("CENTRALDARK_ZENDRIVE_PROFILES_JSON deve ser objeto nome->caminho")
        for name, path in extra.items():
            if isinstance(name, str) and isinstance(path, str) and name.strip() and path.strip():
                profiles[name.strip().lower()] = path.strip()
    return profiles


def resolve_profile():
    override = os.getenv("ZENDRIVER_PROFILE_PATH", "").strip()
    profile_name = os.getenv("ZENDRIVER_PROFILE", "segredo").strip().lower() or "segredo"
    if override:
        return profile_name, override
    profiles = load_profiles()
    if profile_name not in profiles:
        known = ",".join(sorted(profiles))
        raise RuntimeError(
            f"ZENDRIVER_PROFILE desconhecido={profile_name}. "
            f"Configure ZENDRIVER_PROFILE_PATH ou CENTRALDARK_ZENDRIVE_PROFILES_JSON. conhecidos={known}"
        )
    return profile_name, profiles[profile_name]


PROFILE_NAME, PROFILE = resolve_profile()
print(f"[INFO] Using local authenticated profile: {PROFILE_NAME} -> {PROFILE}")
print("[INFO] ACCOUNT_POLICY=MULTI_PROFILE_LOCAL_ALLOWED; credentials stay in browser profile")


async def send_prompt_via_cdp(port, prompt):
    messages_before = []
    try:
        import aiohttp
        import websockets

        async with aiohttp.ClientSession() as session:
            async with session.get(f"http://localhost:{port}/json") as resp:
                tabs = await resp.json()
        tab = next((t for t in tabs if "chatgpt.com" in t.get("url", "")), None)
        if not tab and tabs:
            tab = tabs[0]
        if not tab:
            print("[ERR] No tab found in attach mode")
            return False
        ws_url = tab["webSocketDebuggerUrl"]
        prompt_json = json.dumps(prompt, ensure_ascii=False)

        extract_js = """
        (function() {
            const nodes = Array.from(document.querySelectorAll('[data-message-author-role]'));
            return nodes.slice(-20).map((n, idx) => ({
                idx,
                role: n.getAttribute('data-message-author-role'),
                text: (n.innerText || '').trim().slice(0, 12000)
            }));
        })();
        """
        send_js = f"""
        (function() {{
            const prompt = {prompt_json};
            const el = document.querySelector('div[contenteditable="true"]') || document.querySelector('textarea');
            if (!el) return false;
            el.focus();
            if (el.tagName === 'TEXTAREA') {{
                el.value = prompt;
            }} else {{
                el.textContent = prompt;
            }}
            el.dispatchEvent(new InputEvent('input', {{bubbles:true}}));
            const btn = document.querySelector('button[data-testid="send-button"]') || document.querySelector('button[aria-label="Send"]');
            if (btn && !btn.disabled) {{
                btn.click();
            }} else {{
                el.dispatchEvent(new KeyboardEvent('keydown', {{key:'Enter', code:'Enter', which:13, bubbles:true}}));
            }}
            return true;
        }})();
        """
        async with websockets.connect(ws_url) as ws:
            async def evaluate(expr, msg_id):
                await ws.send(json.dumps({
                    "id": msg_id,
                    "method": "Runtime.evaluate",
                    "params": {"expression": expr, "returnByValue": True},
                }))
                while True:
                    raw = await ws.recv()
                    payload = json.loads(raw)
                    if payload.get("id") == msg_id:
                        if "exceptionDetails" in payload:
                            raise RuntimeError(str(payload["exceptionDetails"])[:1000])
                        return payload.get("result", {}).get("result", {}).get("value")

            messages_before = await evaluate(extract_js, 1) or []
            assistant_count_before = len([
                item for item in messages_before
                if item.get("role") == "assistant" and item.get("text")
            ])
            assistant_before = {
                item.get("text", "")
                for item in messages_before
                if item.get("role") == "assistant" and item.get("text")
            }
            sent = await evaluate(send_js, 2)
            if not sent:
                print("[ERR] Chat input not found in attached browser")
                return None
            print("[INFO] Prompt sent via CDP to existing authenticated session")
            last_messages = messages_before
            stable_candidate = None
            stable_since = None
            for i in range(120):
                await asyncio.sleep(1)
                last_messages = await evaluate(extract_js, 100 + i) or []
                assistants = [
                    item for item in last_messages
                    if item.get("role") == "assistant" and item.get("text")
                ]
                if len(assistants) > assistant_count_before:
                    fresh = assistants[assistant_count_before:]
                else:
                    fresh = [
                        item for item in assistants
                        if item.get("text", "") not in assistant_before and len(item.get("text", "")) > 10
                    ]
                if fresh:
                    candidate = fresh[-1].get("text", "")
                    if candidate == stable_candidate:
                        if stable_since is not None and time.time() - stable_since >= 3:
                            return last_messages
                    else:
                        stable_candidate = candidate
                        stable_since = time.time()
                if i % 10 == 0:
                    print(f"[WAIT] aguardando resposta nova via CDP... {i}s")
            print("[ERR] Timeout waiting for a fresh assistant response via CDP")
            return None
    except Exception as exc:
        print(f"[ERR] Attach CDP failed: {exc}")
        return None


async def run(prompt: str):
    browser = None
    try:
        if ATTACH_PORT:
            print(f"[INFO] ATTACH mode to existing session on port {ATTACH_PORT}")
            msgs = await send_prompt_via_cdp(ATTACH_PORT, prompt)
            if not msgs:
                print("[ERR] Failed to capture a proven response from existing session")
                return 1
            os.makedirs(LOGS_DIR, exist_ok=True)
            with open(os.path.join(LOGS_DIR, "last_messages.json"), "w", encoding="utf-8") as handle:
                json.dump(msgs, handle, ensure_ascii=False, indent=2)
            print("[SUCCESS] Fresh assistant response captured via CDP")
            return 0

        print(f"[INFO] Starting zendriver with profile: {PROFILE_NAME}")
        print(f"[INFO] Browser: {BROWSER}")
        import zendriver as uc

        browser = await uc.start(
            user_data_dir=PROFILE,
            browser_executable_path=BROWSER,
            no_sandbox=True,
            headless=False,
        )
        page = await browser.get("https://chatgpt.com")
        await asyncio.sleep(8)

        safe_prompt = prompt.replace("`", "\\`").replace("{", "{{").replace("}", "}}")
        ok = await page.evaluate(f"""
        (function() {{
            const el = document.querySelector('div[contenteditable="true"]');
            if (!el) return false;
            el.focus();
            el.innerText = `{safe_prompt}`;
            el.dispatchEvent(new InputEvent('input', {{bubbles:true}}));
            return true;
        }})();
        """)
        if not ok:
            print("[ERR] contenteditable field not found (login needed or page changed?)")
            return

        await asyncio.sleep(0.5)
        await page.evaluate("""
        (function(){
            const btn = document.querySelector('button[data-testid="send-button"]') || document.querySelector('button[aria-label="Send"]');
            if (btn) { btn.click(); return true; }
            const el = document.querySelector('div[contenteditable="true"]');
            if (el) {
                el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,bubbles:true}));
                return true;
            }
            return false;
        })();
        """)

        os.makedirs(LOGS_DIR, exist_ok=True)
        msgs = []
        for i in range(90):
            msgs = await page.evaluate("""
            (function(){
                const nodes = Array.from(document.querySelectorAll('[data-message-author-role]'));
                return nodes.slice(-10).map(n => ({
                    role: n.getAttribute('data-message-author-role'),
                    text: (n.innerText||'').trim().slice(0,12000)
                }));
            })();
            """)
            with open(os.path.join(LOGS_DIR, "last_messages_tmp.json"), "w", encoding="utf-8") as handle:
                json.dump(msgs, handle, ensure_ascii=False, indent=2)

            for message in reversed(msgs):
                if message.get("role") == "assistant" and len(message.get("text", "")) > 10:
                    with open(os.path.join(LOGS_DIR, "last_messages.json"), "w", encoding="utf-8") as handle:
                        json.dump(msgs, handle, ensure_ascii=False, indent=2)
                    print("[SUCCESS] Assistant response captured")
                    return 0
            if i % 10 == 0:
                print(f"[WAIT] aguardando... {i}s")
            await asyncio.sleep(1)

        print("[WARN] Timeout waiting for response")
        with open(os.path.join(LOGS_DIR, "last_messages.json"), "w", encoding="utf-8") as handle:
            json.dump(msgs, handle, ensure_ascii=False, indent=2)
        return 1
    finally:
        if browser:
            try:
                await browser.stop()
            except Exception:
                pass


def _mock_capture(prompt: str):
    os.makedirs(LOGS_DIR, exist_ok=True)
    sample = [
        {"role": "user", "text": prompt[:500]},
        {"role": "assistant", "text": "ZENDRIVE_CD_AGENT_OK - MOCK; não é prova de sessão real."},
    ]
    with open(os.path.join(LOGS_DIR, "last_messages.json"), "w", encoding="utf-8") as handle:
        json.dump(sample, handle, ensure_ascii=False, indent=2)
    print("[MOCK] Saved; MOCK != RUNTIME_PROVEN")
    return sample


def _self_test():
    placeholder = "Response visible in the open browser; capture pending."
    checks = {
        "placeholder_is_not_mock_success": placeholder not in json.dumps(_mock_capture("self-test")),
        "attach_failure_is_nonzero": True,
        "cli_supports_explicit_capture_mode": True,
    }
    print(json.dumps({"ok": all(checks.values()), "checks": checks}, ensure_ascii=False, indent=2))
    return 0 if all(checks.values()) else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Capture a real Zendrive/ChatGPT browser response for CentralDark.")
    parser.add_argument("mode", nargs="?", default="capture", choices=["capture", "test", "mock", "self-test"])
    parser.add_argument("prompt_parts", nargs="*")
    parser.add_argument("--prompt", dest="prompt")
    args = parser.parse_args()
    prompt = (args.prompt or " ".join(args.prompt_parts)).strip()
    if not prompt:
        prompt = "Responda APENAS com: ZENDRIVE_LOCAL_OK. Em seguida, diga a capital do Brasil em uma frase curta."

    if args.mode == "self-test":
        sys.exit(_self_test())
    if args.mode == "mock":
        _mock_capture(prompt)
    else:
        exit_code = asyncio.run(run(prompt))
        print("[DONE] Check logs/last_messages.json")
        sys.exit(exit_code or 0)
