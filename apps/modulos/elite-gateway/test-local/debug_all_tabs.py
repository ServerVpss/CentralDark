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
        # Try the first chatgpt.com tab anyway
        chat_tabs = [t for t in tabs if 'chatgpt.com' in t.get('url', '')]
    
    if not chat_tabs:
        print("Nenhuma aba chatgpt.com encontrada")
        return
        
    tab = chat_tabs[0]
    print(f"\n=== USANDO ABA: {tab.get('url')} ===")
    ws_url = tab['webSocketDebuggerUrl']
    
    get_msgs_js = """
    (function() {
        let selectors = [
            '[data-message-author-role]',
            '.message',
            '[data-testid*="message"]',
            '[class*="message"]',
            'article',
            '[data-testid="conversation-turn"]',
            '.group',
            '[data-author]'
        ];
        let nodes = [];
        for (let sel of selectors) {
            nodes = Array.from(document.querySelectorAll(sel));
            if (nodes.length > 0) {
                console.log('Found with selector: ' + sel + ', count: ' + nodes.length);
                break;
            }
        }
        const last = nodes.slice(-5).map(n => ({
            role: n.getAttribute('data-message-author-role') || n.getAttribute('data-author') || (n.querySelector('[data-message-author-role]') ? n.querySelector('[data-message-author-role]').getAttribute('data-message-author-role') : 'unknown'),
            text: (n.innerText||'').trim().slice(0,500)
        }));
        return { selector_used: selectors[0], count: nodes.length, messages: last };
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