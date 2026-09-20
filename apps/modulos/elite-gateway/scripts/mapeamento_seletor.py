import asyncio
import zendriver as uc

async def main():
    browser = await uc.start(
        user_data_dir="/root/.config/zendriver_chatgpt_profile",
        browser_executable_path="/usr/bin/google-chrome",
        no_sandbox=True,
        headless=True
    )
    page = await browser.get("https://chatgpt.com")
    await asyncio.sleep(8) # Espera o React montar o chat
    
    # Busca por elementos de input, textarea ou divs editáveis
    script = """
    Array.from(document.querySelectorAll('div[contenteditable="true"], textarea, input')).map(el => {
        return { tag: el.tagName, id: el.id, class: el.className, placeholder: el.placeholder };
    })
    """
    elementos = await page.evaluate(script)
    print(f"Elementos encontrados: {elementos}")
    
    await browser.stop()

if __name__ == "__main__":
    asyncio.run(main())
