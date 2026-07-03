#!/usr/bin/env python3
"""
CentralDark - elite_ws_gateway.py
WebSocket Gateway com Zendriver
"""
import asyncio
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import zendriver as uc

load_dotenv('/root/CentralDark/apps/modulos/elite-gateway/config/.env')

TOKEN = os.getenv("ELITE_WS_TOKEN")
PROFILE_DIR = os.getenv("ZENDRIVER_PROFILE", "/root/.config/zendriver_chatgpt_profile")
BROWSER_EXECUTABLE = os.getenv("BROWSER_EXECUTABLE", "/usr/bin/google-chrome")

app = FastAPI(title="CentralDark Elite WS Gateway")

@app.get("/")
async def root():
    return {"status": "CentralDark Elite Gateway V2", "port": 8765}

@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Verificação de token
    token = await websocket.receive_text()
    if token != TOKEN:
        await websocket.send_text("Token inválido")
        await websocket.close(code=4001)
        return

    browser = None
    try:
        # Inicia o browser
        browser = await uc.start(
            user_data_dir=PROFILE_DIR,
            browser_args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--window-size=1920,1080"
            ],
            browser_executable_path=BROWSER_EXECUTABLE,
            no_sandbox=True,
            headless=True
        )
        
        page = await browser.get("https://chatgpt.com")
        await asyncio.sleep(2)

        while True:
            message = await websocket.receive_text()
            
            # Aqui você pode adicionar a lógica de envio de prompt
            # Por enquanto só retorna um echo
            await websocket.send_text(f"Recebido: {message}")

    except WebSocketDisconnect:
        print("[GATEWAY] Cliente desconectado")
    except Exception as e:
        print(f"[GATEWAY] Erro: {e}")
    finally:
        if browser:
            await browser.stop()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8765)
