import asyncio, json, aiohttp, websockets

async def test():
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
    ws_url = tab['webSocketDebuggerUrl']
    
    get_msgs_js = """
    (function() {
        // Try multiple selectors
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