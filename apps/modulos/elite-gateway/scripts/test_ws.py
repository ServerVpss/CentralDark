import asyncio
import websockets
import os
from dotenv import load_dotenv

load_dotenv('/root/CentralDark/apps/modulos/elite-gateway/config/.env')
# Puxa o token do .env (ou usa o padrão que configuramos no gateway)
TOKEN = os.getenv("ELITE_WS_TOKEN", "SEGREDO_ELITE_123")

async def test_connection():
    uri = "ws://localhost:8765/ws"
    print(f"\n[CLIENTE] Tentando conectar no Gateway V2 ({uri})...")
    try:
        async with websockets.connect(uri) as websocket:
            print("[CLIENTE] Conectado! Enviando Token de Autenticação...")
            await websocket.send(TOKEN)
            
            # Fica aguardando a resposta do servidor
            resposta = await websocket.recv()
            print(f"[SERVIDOR RESPONDEU] -> {resposta}\n")
    except Exception as e:
        print(f"[ERRO FATAL] Conexão recusada: {e}\n")

if __name__ == "__main__":
    asyncio.run(test_connection())
