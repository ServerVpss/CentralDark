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
    
    # Aguarda um tempo extra para o JS do site carregar
    await asyncio.sleep(5)
    
    # Extrai o conteúdo do HTML para buscarmos o campo de input
    content = await page.get_content()
    with open("/root/CentralDark/apps/modulos/elite-gateway/dom_debug.txt", "w", encoding="utf-8") as f:
        f.write(content[:20000]) # Salva apenas o início do DOM
        
    print("[RELATÓRIO] DOM extraído para /root/CentralDark/apps/modulos/elite-gateway/dom_debug.txt")
    await browser.stop()

if __name__ == "__main__":
    asyncio.run(main())
