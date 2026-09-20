#!/usr/bin/env python3
import asyncio
import zendriver as uc
import os
from dotenv import load_dotenv
import random

load_dotenv('/root/CentralDark/apps/modulos/elite-gateway/config/.env')
PROFILE_DIR = os.getenv("ZENDRIVER_PROFILE", "/root/.config/zendriver_chatgpt_profile")

BROWSER_ARGS = [
    "--disable-blink-features=AutomationControlled",
    "--disable-infobars",
    "--disable-dev-shm-usage",
    "--window-size=1920,1080"
]

async def human_warmup():
    print("[HUMANIZER] Iniciando aquecimento (Modo Stealth)...")
    
    # Adicionado no_sandbox=True e headless=True para rodar como root
    browser = await uc.start(
        user_data_dir=PROFILE_DIR, 
        browser_args=BROWSER_ARGS,
        browser_executable_path="/usr/bin/google-chrome",
        no_sandbox=True,
        headless=True
    )
    page = await browser.get("https://chatgpt.com")
    
    await asyncio.sleep(random.uniform(2.5, 4.0))
    
    # Simula scroll humano
    for _ in range(random.randint(2, 4)):
        await page.scroll_down(random.randint(150, 400))
        await asyncio.sleep(random.uniform(0.8, 1.8))
        
    try:
        await page.click('button[aria-label*="New chat"]', timeout=3)
    except:
        pass
        
    await asyncio.sleep(random.uniform(1.5, 3.0))
    print("[HUMANIZER] Warm-up completo. Perfil aquecido e pronto.")
    await browser.stop()

if __name__ == "__main__":
    asyncio.run(human_warmup())
