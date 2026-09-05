import asyncio, json, aiohttp, websockets

async def test():
    async with aiohttp.ClientSession() as session:
        async with session.get('http://localhost:9222/json') as resp:
            tabs = await resp.json()
    
    chat_tabs = [t for t in tabs if 'chatgpt.com' in t.get('url', '') and 'accounts.google.com' not in t.get('url', '')]
    
    if not chat_tabs:
        chat_tabs = [t for t in tabs if 'chatgpt.com' in t.get('url', '')]
    
    if not chat_tabs:
        print("Nenhuma aba chatgpt.com encontrada")
        return
        
    tab = chat_tabs[0]
    print(f"=== USANDO ABA: {tab.get('url')} ===")
    ws_url = tab['webSocketDebuggerUrl']
    
    # Get full page HTML
    get_html_js = """
    (function() {
        return document.documentElement.outerHTML;
    })();
    """
    
    async with websockets.connect(ws_url) as ws:
        await ws.send(json.dumps({
            'id': 1,
            'method': 'Runtime.evaluate',
            'params': {'expression': get_html_js, 'returnByValue': True}
        }))
        result = await ws.recv()
        
        # Save to file for inspection
        import json as json_lib
        try:
            data = json_lib.loads(result)
            html = data['result']['result']['value']
            with open('page_full.html', 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"HTML saved to page_full.html ({len(html)} chars)")
            # Search for ZENDRIVE or assistant content
            if 'ZENDRIVE' in html:
                print("FOUND ZENDRIVE in HTML!")
            if 'Brasília' in html or 'capital do Brasil' in html:
                print("FOUND BRASILIA in HTML!")
            # Print first 5000 chars
            print(html[:5000])
        except Exception as e:
            print(f"Error parsing: {e}")

asyncio.run(test())