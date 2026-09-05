import asyncio, os, json, aiohttp, websockets

async def test():
    prompt = 'Diga APENAS ZENDRIVE_LOCAL_OK. Depois diga a capital do Brasil em uma frase curta e clara.'
    safe_prompt = prompt.replace('`', '\\`').replace('{', '{{').replace('}', '}}')
    
    async with aiohttp.ClientSession() as session:
        async with session.get('http://localhost:9222/json') as resp:
            tabs = await resp.json()
    tab = None
    for t in tabs:
        if 'chatgpt.com' in t.get('url', ''):
            tab = t
            break
    if not tab and tabs:
        tab = tabs[0]
    if not tab:
        print('[ERR] No tab found')
        return
    ws_url = tab['webSocketDebuggerUrl']
    print(f'Found tab: {tab["url"]}')
    
    js = f'''
    (function() {{
        const el = document.querySelector('div[contenteditable="true"]') || document.querySelector('textarea');
        if (!el) return false;
        el.focus();
        if (el.tagName === "TEXTAREA") {{
            el.value = `{safe_prompt}`;
        }} else {{
            el.innerText = `{safe_prompt}`;
        }}
        const ev = new InputEvent('input', {{bubbles:true}});
        el.dispatchEvent(ev);
        const enterEvent = new KeyboardEvent('keydown', {{key: 'Enter', code: 'Enter', bubbles:true}});
        el.dispatchEvent(enterEvent);
        return true;
    }})();
    '''
    
    async with websockets.connect(ws_url) as ws:
        await ws.send(json.dumps({
            'id': 1,
            'method': 'Runtime.evaluate',
            'params': {'expression': js, 'returnByValue': True}
        }))
        result = await ws.recv()
        print(f'Result: {result}')

asyncio.run(test())