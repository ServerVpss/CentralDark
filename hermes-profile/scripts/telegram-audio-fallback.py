#!/usr/bin/env python3
"""
Hermes Telegram Audio Fallback Sender
Envia áudio como arquivo de document quando voice bubble falha.
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import Optional

# Configurações
HERMES_HOME = Path.home() / "AppData/Local/hermes"
AUDIO_CACHE = HERMES_HOME / "cache/audio"

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


class TelegramAudioFallback:
    """Envia áudio como documento quando voice bubble falha."""
    
    def __init__(self):
        self.bot_token = self._get_bot_token()
        self.allowed_users = self._get_allowed_users()
        
    def _get_bot_token(self) -> Optional[str]:
        """Pega token do bot do .env."""
        env_file = HERMES_HOME / ".env"
        if env_file.exists():
            try:
                content = env_file.read_text(encoding='utf-8', errors='ignore')
                for line in content.split('\n'):
                    if line.startswith('TELEGRAM_BOT_TOKEN='):
                        return line.split('=', 1)[1].strip()
            except:
                pass
        return None
    
    def _get_allowed_users(self) -> list:
        """Pega lista de usuários permitidos."""
        env_file = HERMES_HOME / ".env"
        users = []
        if env_file.exists():
            try:
                content = env_file.read_text(encoding='utf-8', errors='ignore')
                for line in content.split('\n'):
                    if line.startswith('TELEGRAM_ALLOWED_USERS='):
                        users = [u.strip() for u in line.split('=', 1)[1].split(',')]
                        break
            except:
                pass
        return users
    
    async def send_as_voice(self, audio_path: str, chat_id: str) -> bool:
        """Tenta enviar como voice bubble."""
        try:
            from telegram import Bot
            bot = Bot(token=self.bot_token)
            
            with open(audio_path, 'rb') as f:
                await bot.send_voice(
                    chat_id=chat_id,
                    voice=f,
                    caption=f"🎤 Áudio gerado por Hermes"
                )
            
            logger.info(f"✅ Voice bubble enviado com sucesso para {chat_id}")
            return True
            
        except Exception as e:
            error_msg = str(e)
            logger.warning(f"❌ Falha ao enviar voice: {error_msg}")
            return False
    
    async def send_as_audio_document(self, audio_path: str, chat_id: str) -> bool:
        """Fallback: envia como arquivo de áudio/documento."""
        try:
            from telegram import Bot
            bot = Bot(token=self.bot_token)
            
            file_name = Path(audio_path).name
            
            with open(audio_path, 'rb') as f:
                await bot.send_audio(
                    chat_id=chat_id,
                    audio=f,
                    caption=f"📎 Áudio enviado como documento (fallback)",
                    title="Hermes Audio",
                    performer="Hermes Agent"
                )
            
            logger.info(f"✅ Áudio enviado como documento para {chat_id}")
            return True
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Falha ao enviar como documento: {error_msg}")
            return False
    
    async def send_as_generic_file(self, audio_path: str, chat_id: str) -> bool:
        """Fallback final: envia como qualquer arquivo."""
        try:
            from telegram import Bot
            bot = Bot(token=self.bot_token)
            
            file_name = Path(audio_path).name
            
            with open(audio_path, 'rb') as f:
                await bot.send_document(
                    chat_id=chat_id,
                    document=f,
                    caption=f"📁 Áudio disponível para download"
                )
            
            logger.info(f"✅ Arquivo enviado para {chat_id}")
            return True
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Falha ao enviar arquivo: {error_msg}")
            return False
    
    async def send_with_auto_fallback(self, audio_path: str, chat_id: str) -> bool:
        """Tenta enviar com fallback automático nos métodos disponíveis."""
        # Método 1: Voice bubble (preferido)
        if await self.send_as_voice(audio_path, chat_id):
            return True
        
        # Método 2: Audio (fallback)
        if await self.send_as_audio_document(audio_path, chat_id):
            return True
        
        # Método 3: Document (fallback final)
        if await self.send_as_generic_file(audio_path, chat_id):
            return True
        
        logger.error("❌ Todos os métodos de envio falharam")
        return False


async def send_audio(audio_path: str, chat_id: str):
    """Envia áudio com fallback automático."""
    sender = TelegramAudioFallback()
    
    if not sender.bot_token:
        logger.error("❌ Token do Telegram não encontrado no .env")
        return False
    
    logger.info(f"📤 Enviando áudio: {audio_path}")
    logger.info(f"💬 Chat ID: {chat_id}")
    
    success = await sender.send_with_auto_fallback(audio_path, chat_id)
    
    if success:
        logger.info("✅ Entrega concluída com sucesso!")
    else:
        logger.error("❌ Entrega falhou após todos os métodos")
    
    return success


def main():
    """Ponto de entrada."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Hermes Telegram Audio Fallback Sender")
    parser.add_argument("audio_path", nargs="?", help="Caminho do arquivo de áudio")
    parser.add_argument("chat_id", nargs="?", help="Chat ID do Telegram")
    parser.add_argument("--list", "-l", action="store_true", help="Listar áudios no cache")
    parser.add_argument("--test", "-t", action="store_true", help="Teste de conexão")
    
    args = parser.parse_args()
    
    sender = TelegramAudioFallback()
    
    if args.list:
        if not AUDIO_CACHE.exists():
            print("❌ Cache de áudio não existe")
            return
        
        files = list(AUDIO_CACHE.glob("*.ogg"))
        print(f"📁 Áudios no cache: {len(files)}")
        for f in files:
            size = f.stat().st_size
            print(f"  - {f.name} ({size} bytes)")
        return
    
    if args.test:
        if sender.bot_token:
            print("✅ Token configurado")
            print(f"👥 Usuários permitidos: {sender.allowed_users}")
        else:
            print("❌ Token não configurado")
        return
    
    if not args.audio_path or not args.chat_id:
        parser.print_help()
        return
    
    if not Path(args.audio_path).exists():
        print(f"❌ Arquivo não encontrado: {args.audio_path}")
        return
    
    asyncio.run(send_audio(args.audio_path, args.chat_id))


if __name__ == "__main__":
    main()
