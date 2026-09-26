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
import json
import os
import time
from pathlib import Path

import zendriver as uc
from dotenv import load_dotenv
import aiohttp
import websockets

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
    try:
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
        safe_prompt = prompt.replace("`", "\`").replace("{", "{{").replace("}", "}}")
        js = f"""
        (function() {{
            const el = document.querySelector('div[contenteditable="true"]') || document.querySelector('textarea');
            if (!el) return false;
            el.focus();
            if (el.tagName === 'TEXTAREA') {{
                el.value = `{safe_prompt}`;
            }} else {{
                el.innerText = `{safe_prompt}`;
            }}
            el.dispatchEvent(new InputEvent('input', {{bubbles:true}}));
            el.dispatchEvent(new KeyboardEvent('keydown', {{key:'Enter', code:'Enter', bubbles:true}}));
            return true;
        }})();
        """
        async with websockets.connect(ws_url) as ws:
            await ws.send(json.dumps({
                "id": 1,
                "method": "Runtime.evaluate",
                "params": {"expression": js, "returnByValue": True if False else True},
            }))
            await ws.recv()
            print("[INFO] Prompt sent via CDP to existing authenticated session")
            return True
    except Exception as exc:
        print(f"[ERR] Attach CDP failed: {exc}")
        return False


async def run(prompt: str):
    browser = None
    try:
        if ATTACH_PORT:
            print(f"[INFO] ATTACH mode to existing session on port {ATTACH_PORT}")
            success = await send_prompt_via_cdp(ATTACH_PORT, prompt)
            if not success:
                print("[ERR] Failed to send to existing session")
                return
            os.makedirs(LOGS_DIR, exist_ok=True)
            with open(os.path.join(LOGS_DIR, "last_messages.json"), "w", encoding="utf-8") as handle:
                json.dump([
                    {"role": "user", "text": prompt},
                    {"role": "assistant", "text": "Response visible in the open browser; capture pending."},
                ], handle, ensure_ascii=False, indent=2)
            return

        print(f"[INFO] Starting zendriver with profile: {PROFILE_NAME}")
        print(f"[INFO] Browser: {BROWSER}")
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
                    return
            if i % 10 == 0:
                print(f"[WAIT] aguardando... {i}s")
            await asyncio.sleep(1)

        print("[WARN] Timeout waiting for response")
        with open(os.path.join(LOGS_DIR, "last_messages.json"), "w", encoding="utf-8") as handle:
            json.dump(msgs, handle, ensure_ascii=False, indent=2)
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


if __name__ == "__main__":
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "test"
    prompt = " ".join(sys.argv[2:]).strip() if len(sys.argv) > 2 else ""
    if not prompt:
        prompt = "Responda APENAS com: ZENDRIVE_LOCAL_OK. Em seguida, diga a capital do Brasil em uma frase curta."

    if mode == "mock":
        _mock_capture(prompt)
    else:
        asyncio.run(run(prompt))
        print("[DONE] Check logs/last_messages.json")
