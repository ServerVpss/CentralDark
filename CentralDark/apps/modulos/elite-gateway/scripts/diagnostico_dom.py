import asyncio
import zendriver as uc
import os

async def main():
    browser = await uc.start(
        user_data_dir="/root/.config/zendriver_chatgpt_profile",
        browser_executable_path="/usr/bin/google-chrome",
        no_sandbox=True,
        headless=True
    )
    page = await browser.get("https://chatgpt.com")
    
    # Tentativa de localizar o campo de entrada (Seletor padrão atual do ChatGPT)
    try:
        # Procuramos o elemento de texto que aceita digitação
        await page.wait_for_selector('div#prompt-textarea', timeout=10000)
        print("[SUCESSO] O campo de texto do ChatGPT foi localizado no DOM!")
    except:
        print("[ERRO] Campo de texto não encontrado. Verifique o seletor.")
        
    await browser.stop()

if __name__ == "__main__":
    asyncio.run(main())
