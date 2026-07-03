#!/usr/bin/env python3
import asyncio, json, os, time
import zendriver as uc
from dotenv import load_dotenv
load_dotenv('/root/CentralDark/apps/modulos/elite-gateway/config/.env')

PROFILE = os.getenv('ZENDRIVER_PROFILE','/root/.config/zendriver_chatgpt_profile')
BROWSER = os.getenv('BROWSER_EXECUTABLE','/usr/bin/google-chrome')

async def run(prompt):
    browser = None
    try:
        browser = await uc.start(
            user_data_dir=PROFILE,
            browser_executable_path=BROWSER,
            no_sandbox=True,
            headless=True
        )
        page = await browser.get("https://chatgpt.com")
        await asyncio.sleep(5)

        # Encontra o elemento contenteditable e injeta texto via JS, disparando events
        inject = f"""
        (function() {{
            const el = document.querySelector('div[contenteditable=\"true\"]');
            if (!el) return false;
            el.focus();
            el.innerText = `{prompt.replace("`","\\`")}`;
            const ev = new InputEvent('input', {{bubbles:true}});
            el.dispatchEvent(ev);
            return true;
        }})();
        """
        ok = await page.evaluate(inject)
        if not ok:
            print("[ERR] Campo contenteditable não encontrado")
            return

        # Tenta clicar no botão send se existir
        await asyncio.sleep(0.5)
        await page.evaluate("""
            (function(){
                const btn = document.querySelector('button[data-testid=\"send-button\"]') 
                         || document.querySelector('button[aria-label=\"Send\"]');
                if(btn){ btn.click(); return true; }
                // fallback: dispara Enter no elemento com contenteditable
                const el = document.querySelector('div[contenteditable=\"true\"]');
                if(el){ const ev = new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13}); el.dispatchEvent(ev); return true; }
                return false;
            })();
        """)

        print("[INFO] Prompt enviado, aguardando resposta...")

        # Loop de captura das últimas mensagens
        os.makedirs('/root/CentralDark/apps/modulos/elite-gateway/logs', exist_ok=True)
        resposta = None
        for i in range(120):  # até 120s
            script = """
            (function(){
                const nodes = Array.from(document.querySelectorAll('[data-message-author-role]'));
                const last = nodes.slice(-10).map(n => ({
                    role: n.getAttribute('data-message-author-role'),
                    text: (n.innerText||'').trim()
                }));
                return last;
            })();
            """
            msgs = await page.evaluate(script)
            # salva temporário para inspeção
            with open('/root/CentralDark/apps/modulos/elite-gateway/logs/last_messages_tmp.json','w',encoding='utf-8') as f:
                f.write(json.dumps(msgs, ensure_ascii=False, indent=2))
            for m in reversed(msgs):
                if m.get('role')=='assistant' and len(m.get('text',''))>10:
                    resposta = m['text']
                    with open('/root/CentralDark/apps/modulos/elite-gateway/logs/last_messages.json','w',encoding='utf-8') as f:
                        f.write(json.dumps(msgs, ensure_ascii=False, indent=2))
                    return
            if i % 10 == 0:
                print(f"[WAIT] aguardando resposta... {i}s")
            await asyncio.sleep(1)

        print("[WARN] Timeout aguardando resposta")
    except Exception as e:
        print("[EXCEPTION]", e)
    finally:
        try:
            if browser:
                await browser.stop()
        except Exception:
            pass

if __name__ == "__main__":
    asyncio.run(run("Teste para mapear rota — responda apenas MAPEADO"))
