# COMANDO - send_and_dump.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\elite-gateway\scripts\send_and_dump.py
**SHA:** fe976451fe8e5edd
**Timestamp:** 2026-08-28T02:56:24.335522
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for c in prompt:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
import asyncio, random, time, json, os
import zendriver as uc
from dotenv import load_dotenv
load_dotenv('/root/CentralDark/apps/modulos/elite-gateway/config/.env')

async def run(prompt):
    browser = await uc.start(
        user_data_dir=os.getenv('ZENDRIVER_PROFILE'),
        browser_executable_path=os.getenv('BROWSER_EXECUTABLE','/usr/bin/google-chrome'),
        no_sandbox=True, headless=True
    )
    page = await browser.get("https://chatgpt.com")
    await asyncio.sleep(5)
    inp = await page.find('div[contenteditable="true"]')
    await inp.click()
    for c in prompt:
        await page.keyboard.type(c)
        await asyncio.sleep(random.uniform(0.02,0.06))
    await page.keyboard.press("Enter")
    # aguarda e captura textos das mensagens a cada 1s por até 60s
    for i in range(60):
        script = """
        const msgs = Array.from(document.querySelectorAll('[data-message-author-role]')).slice(-10);
        return msgs.map(m => ({role: m.getAttribute('data-message-author-role'), text: (m.innerText||'').slice(0,1000)}));
        """
        msgs = await page.evaluate(script)
        if any(m['role']=='assistant' and m['text'].trim().length>10 for m in msgs):
            with open('/root/CentralDark/apps/modulos/elite-gateway/logs/last_messages.json','w', encoding='utf-8') as f:
                f.write(json.dumps(msgs, ensure_ascii=False, indent=2))
            print('Resposta capturada, salvo em /root/CentralDark/apps/modulos/elite-gateway/logs/last_messages.json')
            break
        await asyncio.sleep(1)
    await browser.stop()

if __name__ == "__main__":
    asyncio.run(run("Teste para mapear rota — responda apenas 'MAPEADO'"))

```