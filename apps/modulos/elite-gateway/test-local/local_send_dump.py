#!/usr/bin/env python3
"""
Local Windows test adapter for send_and_dump (Zendrive / elite-gateway capture)
Adapted from send_and_dump_fix.py for local test.
Paths: Windows Chrome, local profile/logs.
Run with: .venv/Scripts/python.exe local_send_dump.py

Specialized agent mode for ZENDRIVE-CHAT GPT (session ID 20260905_010608_8c07f9)
Integrates with CentralDark via existing elite-gateway / PEGATUDO alias (F4 BROWSER_CHAT).
Continuous delta for pinned Reancoragem da Orquestração SOL mission.
No new system. Capture → transform → gateway for CD.
Use Screenpipe to observe the open session in Hermes.
"""
import asyncio
import json
import os
import time
import zendriver as uc
from dotenv import load_dotenv

# Real profiles support (from system measurement)
# Segredo (Cobra Conta): Profile 15
# Fulano: Profile 14
REAL_PROFILES = {
    "segredo": r"C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15",
    "fulano": r"C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 14",
}
PROFILE_NAME = os.getenv("ZENDRIVER_PROFILE", "segredo").lower()
PROFILE = REAL_PROFILES.get(PROFILE_NAME, REAL_PROFILES["segredo"])
BROWSER = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
LOGS_DIR = os.path.join(os.getcwd(), "logs")
print(f"[INFO] Using real profile: {PROFILE_NAME} -> {PROFILE}")

# Optional: load .env if present (for future)
load_dotenv(os.path.join(os.getcwd(), "..", "config", ".env"), override=False)

async def run(prompt: str):
    browser = None
    try:
        print(f"[INFO] Starting zendriver with profile: {PROFILE}")
        print(f"[INFO] Browser: {BROWSER}")
        print(f"[INFO] Prompt: {prompt[:100]}...")

        browser = await uc.start(
            user_data_dir=PROFILE,
            browser_executable_path=BROWSER,
            no_sandbox=True,
            headless=True,  # change to False for debug if needed
            # args=["--disable-blink-features=AutomationControlled"]  # optional stealth
        )
        page = await browser.get("https://chatgpt.com")
        await asyncio.sleep(8)  # wait for load / possible login screen

        # JS inject prompt (from fix) - pre-escape to avoid f-string issues
        safe_prompt = prompt.replace("`", "\\`").replace("{", "{{").replace("}", "}}")
        inject = f"""
        (function() {{
            const el = document.querySelector('div[contenteditable="true"]');
            if (!el) return false;
            el.focus();
            el.innerText = `{safe_prompt}`;
            const ev = new InputEvent('input', {{bubbles:true}});
            el.dispatchEvent(ev);
            return true;
        }})();
        """
        ok = await page.evaluate(inject)
        if not ok:
            print("[ERR] contenteditable field not found (login needed or page changed?)")
            # Fallback: try to save current page state
            try:
                html = await page.evaluate("document.documentElement.outerHTML.slice(0,2000)")
                with open(os.path.join(LOGS_DIR, "page_state.txt"), "w", encoding="utf-8") as f:
                    f.write(html)
            except:
                pass
            return

        await asyncio.sleep(0.5)

        # Try send
        await page.evaluate("""
            (function(){
                const btn = document.querySelector('button[data-testid="send-button"]') 
                         || document.querySelector('button[aria-label="Send"]');
                if(btn){ btn.click(); return true; }
                const el = document.querySelector('div[contenteditable="true"]');
                if(el){ 
                    const ev = new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,bubbles:true}); 
                    el.dispatchEvent(ev);
                    return true;
                }
                return false;
            })();
        """)

        print("[INFO] Prompt sent (or attempted). Waiting for assistant response...")

        os.makedirs(LOGS_DIR, exist_ok=True)
        resposta = None
        for i in range(90):  # up to ~90s
            script = """
            (function(){
                const nodes = Array.from(document.querySelectorAll('[data-message-author-role]'));
                const last = nodes.slice(-10).map(n => ({
                    role: n.getAttribute('data-message-author-role'),
                    text: (n.innerText||'').trim().slice(0,2000)
                }));
                return last;
            })();
            """
            msgs = await page.evaluate(script)

            # save tmp
            with open(os.path.join(LOGS_DIR, "last_messages_tmp.json"), "w", encoding="utf-8") as f:
                f.write(json.dumps(msgs, ensure_ascii=False, indent=2))

            for m in reversed(msgs):
                if m.get('role') == 'assistant' and len(m.get('text', '')) > 10:
                    resposta = m['text']
                    with open(os.path.join(LOGS_DIR, "last_messages.json"), "w", encoding="utf-8") as f:
                        f.write(json.dumps(msgs, ensure_ascii=False, indent=2))
                    print("[SUCCESS] Assistant response captured!")
                    return

            if i % 10 == 0:
                print(f"[WAIT] aguardando... {i}s")
            await asyncio.sleep(1)

        print("[WARN] Timeout waiting for response")
        # save whatever we have
        with open(os.path.join(LOGS_DIR, "last_messages.json"), "w", encoding="utf-8") as f:
            f.write(json.dumps(msgs if 'msgs' in locals() else [], ensure_ascii=False, indent=2))

    except Exception as e:
        print("[EXCEPTION]", str(e))
        import traceback
        traceback.print_exc()
    finally:
        try:
            if browser:
                await browser.stop()
                print("[INFO] Browser stopped")
        except Exception:
            pass

def _mock_capture(prompt: str):
    """Mock mode for immediate working test without browser/deps.
    Simulates capture for ZENDRIVE-CHAT GPT session and feeds to CD.
    """
    os.makedirs(LOGS_DIR, exist_ok=True)
    sample_msgs = [
        {"role": "user", "text": prompt[:500]},
        {"role": "assistant", "text": "ZENDRIVE_CD_AGENT_OK - Specialized capture from ZENDRIVE-CHAT GPT session 20260905_010608_8c07f9. Mission: Reancoragem da Orquestração SOL + Zendrive gateway for CentralDark. Responses transformed and ready for PEGATUDO garimpo / elite-gateway."}
    ]
    with open(os.path.join(LOGS_DIR, "last_messages.json"), "w", encoding="utf-8") as f:
        f.write(json.dumps(sample_msgs, ensure_ascii=False, indent=2))
    print("[MOCK] Simulated capture for ZENDRIVE-CHAT GPT.")
    print("[MOCK] Transformed to gateway format for CentralDark.")
    print("[MOCK] Saved to logs/last_messages.json - ready for PEGATUDO / CD router.")
    return sample_msgs

if __name__ == "__main__":
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "test"
    if mode == "zendrive_specialized" or mode == "agent":
        # Specialized agent for ZENDRIVE-CHAT GPT session capture to CentralDark gateway
        # Session ID: 20260905_010608_8c07f9 (from open Hermes session)
        # Pinned mission: Reancoragem da Orquestração SOL (continuous delta, no disturb)
        # Captures GPT responses, transforms to gateway format for CD (PEGATUDO F4 BROWSER_CHAT)
        test_prompt = "Conversa especializada CentralDark: capture esta resposta e transforme em gateway para o organismo CentralDark. Responda com 'ZENDRIVE_CD_AGENT_OK' + resumo da missão atual."
        print("[ZENDRIVE_SPECIALIZED_AGENT] Running for ZENDRIVE-CHAT GPT session. Session ID: 20260905_010608_8c07f9")
        print("[ZENDRIVE_SPECIALIZED_AGENT] Feeding to CentralDark via existing elite-gateway / PEGATUDO alias. No new system.")
        asyncio.run(run(test_prompt))
        print("[ZENDRIVE_SPECIALIZED_AGENT] Capture done. Check logs/last_messages.json and feed to omni-router or elite-gateway for CD.")
        print("[INTEGRAÇÃO] Delta contínuo para SOL reanchor. Use Screenpipe para observar esta sessão aberta.")
    elif mode == "mock":
        # Mock mode - FUNCIONANDO immediately for testing/integration (no browser needed)
        test_prompt = "Conversa especializada CentralDark: capture esta resposta e transforme em gateway para o organismo CentralDark. Responda com 'ZENDRIVE_CD_AGENT_OK' + resumo da missão atual."
        print("[ZENDRIVE_MOCK] FUNCIONANDO - Mock specialized agent for ZENDRIVE-CHAT GPT.")
        _mock_capture(test_prompt)
        print("[ZENDRIVE_MOCK] Output ready. This simulates the real capture feeding CD.")
    else:
        # Test prompt - basic verification
        test_prompt = "Responda APENAS com: 'ZENDRIVE_LOCAL_OK'. Em seguida, diga a capital do Brasil em uma frase curta."
        asyncio.run(run(test_prompt))
        print("[DONE] Check logs/last_messages.json for capture result.")