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
    
    get_msgs_js = """
    (function() {
        let nodes = Array.from(document.querySelectorAll('[data-message-author-role="assistant"]'));
        const results = nodes.slice(-5).map(n => {
            // Find all text nodes and elements within
            let allText = '';
            // Method 1: innerText of the whole element
            allText += 'innerText: ' + (n.innerText || '').trim().slice(0,500) + ' | ';
            
            // Method 2: textContent
            allText += 'textContent: ' + (n.textContent || '').trim().slice(0,500) + ' | ';
            
            // Method 3: Find specific child elements that might contain the response
            const children = n.querySelectorAll('*');
            let childTexts = [];
            for (let c of children) {
                if (c.innerText && c.innerText.trim().length > 5) {
                    childTexts.push(c.innerText.trim().slice(0,300));
                }
            }
            allText += 'childTexts: ' + childTexts.join(' || ') + ' | ';
            
            // Method 4: Look for specific classes/patterns
            const responseElements = n.querySelectorAll('[class*="markdown"], [class*="prose"], [class*="response"], [data-testid*="response"], .markdown, .prose');
            let responseTexts = [];
            for (let r of responseElements) {
                if (r.innerText && r.innerText.trim().length > 5) {
                    responseTexts.push(r.innerText.trim().slice(0,300));
                }
            }
            allText += 'responseTexts: ' + responseTexts.join(' || ') + ' | ';
            
            // Method 5: Direct query for common assistant content classes
            const allElements = n.querySelectorAll('p, span, div');
            let elementTexts = [];
            for (let e of allElements) {
                if (e.innerText && e.innerText.trim().length > 10) {
                    elementTexts.push(e.innerText.trim().slice(0,300));
                }
            }
            allText += 'elementTexts: ' + elementTexts.slice(0,5).join(' || ');
            
            return {
                role: n.getAttribute('data-message-author-role'),
                allText: allText
            };
        });
        return { count: nodes.length, messages: results };
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