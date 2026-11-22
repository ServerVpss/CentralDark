#!/usr/bin/env python3
"""
CentralDark - OpenAI Compatible HTTP Gateway (Corrigido)
"""
import asyncio
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from dotenv import load_dotenv
import zendriver as uc
import time

load_dotenv('/root/CentralDark/apps/modulos/elite-gateway/config/.env')

PROFILE_DIR = os.getenv("ZENDRIVER_PROFILE", "/root/.config/zendriver_chatgpt_profile")
BROWSER_EXECUTABLE = os.getenv("BROWSER_EXECUTABLE", "/usr/bin/google-chrome")

app = FastAPI(title="CentralDark OpenAI Proxy")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str = "gpt-4o"
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    stream: Optional[bool] = False

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    try:
        # Pega última mensagem do usuário
        user_message = next((m.content for m in reversed(request.messages) if m.role == "user"), None)
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Nenhuma mensagem de usuário encontrada")

        print(f"[GATEWAY] Prompt recebido: {user_message[:60]}...")

        # Inicia o browser com no_sandbox=True (obrigatório como root)
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
        await asyncio.sleep(2.5)

        # Resposta temporária (vamos melhorar depois)
        response_text = f"Resposta do ChatGPT (simulada): {user_message}"

        await browser.stop()

        return {
            "id": f"chatcmpl-{int(time.time())}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": request.model,
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": response_text
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(user_message.split()),
                "completion_tokens": len(response_text.split()),
                "total_tokens": len(user_message.split()) + len(response_text.split())
            }
        }

    except Exception as e:
        print(f"[GATEWAY] Erro: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
