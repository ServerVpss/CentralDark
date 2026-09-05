import asyncio, json, aiohttp, websockets

async def test():
    async with aiohttp.ClientSession() as session:
        async with session.get('http://localhost:9222/json') as resp:
            tabs = await resp.json()
    
    print("=== TODAS AS ABAS ===")
    for i, t in enumerate(tabs):
        print(f"Tab {i}: {t.get('url', 'N/A')[:100]} | title: {t.get('title', 'N/A')[:50]}")
    
    # Find chatgpt.com tab that's NOT a login page
    chat_tabs = [t for t in tabs if 'chatgpt.com' in t.get('url', '') and 'accounts.google.com' not in t.get('url', '')]
    
    if not chat_tabs:
        print("\n=== NENHUMA ABA DO CHATGPT LOGADA ENCONTRADA ===")
        chat_tabs = [t for t in tabs if 'chatgpt.com' in t.get('url', '')]
    
    if not chat_tabs:
        print("Nenhuma aba chatgpt.com encontrada")
        return
        
    tab = chat_tabs[0]
    print(f"\n=== USANDO ABA: {tab.get('url')} ===")
    ws_url = tab['webSocketDebuggerUrl']
    
    get_msgs_js = """
    (function() {
        let nodes = Array.from(document.querySelectorAll('[data-message-author-role]'));
        const last = nodes.slice(-10).map(n => {
            // Get full text including children
            let fullText = n.innerText || '';
            // Also try to find specific child elements
            let childText = '';
            const children = n.querySelectorAll('*');
            for (let c of children) {
                if (c.innerText && c.innerText.length > childText.length) {
                    childText = c.innerText;
                }
            }
            return {
                role: n.getAttribute('data-message-author-role'),
                text: fullText.trim().slice(0,500),
                childText: childText.trim().slice(0,500),
                html: n.innerHTML.slice(0,200)
            };
        });
        return { count: nodes.length, messages: last };
    })();
    """
    
    async with websockets.connect(ws_url) as ws:
        await ws.send(json.dumps({
            'id': 1,
            'method': 'Runtime.evaluate',
            'params': {'expression': get_msgs_js, 'returnByValue': True}
        }))
        result = await ws.recv()
        print(f'Messages: {result}')

asyncio.run(test())