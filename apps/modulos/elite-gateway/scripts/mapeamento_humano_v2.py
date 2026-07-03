import asyncio
import zendriver as uc

async def main():
    browser = await uc.start(
        user_data_dir="/root/.config/zendriver_chatgpt_profile",
        browser_executable_path="/usr/bin/google-chrome",
        no_sandbox=True,
        headless=True,
        browser_args=[
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "--disable-blink-features=AutomationControlled"
        ]
    )
    page = await browser.get("https://chatgpt.com")
    await asyncio.sleep(10)
    
    # Sintaxe corrigida para o zendriver atual
    titulo = await page.title
    print(f"Título da página: {titulo}")
    
    # Verifica a URL final (para saber se o Cloudflare redirecionou)
    url_atual = await page.url
    print(f"URL atual: {url_atual}")
    
    # Mapeia campos editáveis (onde digitamos)
    script = "document.querySelectorAll('div[contenteditable=\"true\"]').length"
    count = await page.evaluate(script)
    print(f"Campos de chat encontrados: {count}")
    
    await browser.stop()

if __name__ == "__main__":
    asyncio.run(main())
