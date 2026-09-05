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
        print(f'Send result: {result}')
        
        # Now wait for assistant response by polling the DOM
        print('Waiting for assistant response...')
        for i in range(60):
            await asyncio.sleep(1)
            get_msgs_js = '''
            (function() {
                const nodes = Array.from(document.querySelectorAll('[data-message-author-role]'));
                const last = nodes.slice(-5).map(n => ({
                    role: n.getAttribute('data-message-author-role'),
                    text: (n.innerText||'').trim().slice(0,2000)
                }));
                return last;
            })();
            '''
            await ws.send(json.dumps({
                'id': 2,
                'method': 'Runtime.evaluate',
                'params': {'expression': get_msgs_js, 'returnByValue': True}
            }))
            msg_result = await ws.recv()
            print(f'Msg check {i}: {msg_result}')
            
            # Parse and check for assistant response
            try:
                msg_data = json.loads(msg_result)
                if 'result' in msg_data and 'result' in msg_data['result']:
                    msgs = msg_data['result']['result']['value']
                    for m in reversed(msgs):
                        if m.get('role') == 'assistant' and len(m.get('text', '')) > 10:
                            print(f'SUCCESS! Assistant response: {m["text"][:200]}')
                            return
            except:
                pass
            
            if i % 10 == 0:
                print(f'... waiting {i}s')
        
        print('Timeout waiting for response')

asyncio.run(test())