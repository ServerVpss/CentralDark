#!/usr/bin/env python3
"""
Hermes Telegram Audio Fallback Sender
Envia áudio como documento quando voice bubble falha.
"""

import asyncio
import logging
from pathlib import Path
from typing import Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)


class TelegramAudioFallback:
    def __init__(self):
        self.bot_token = self._get_bot_token()
    
    def _get_bot_token(self) -> Optional[str]:
        env_file = Path.home() / "AppData/Local/hermes/.env"
        if env_file.exists():
            try:
                content = env_file.read_text(encoding='utf-8', errors='ignore')
                for line in content.split('\n'):
                    if line.startswith('TELEGRAM_BOT_TOKEN='):
                        return line.split('=', 1)[1].strip()
            except:
                pass
        return None
    
    async def send_as_voice(self, audio_path: str, chat_id: str) -> bool:
        try:
            from telegram import Bot
            bot = Bot(token=self.bot_token)
            with open(audio_path, 'rb') as f:
                await bot.send_voice(chat_id=chat_id, voice=f)
            logger.info(f"✅ Voice bubble enviado")
            return True
        except Exception as e:
            logger.warning(f"❌ Falha voice: {e}")
            return False
    
    async def send_as_audio(self, audio_path: str, chat_id: str) -> bool:
        try:
            from telegram import Bot
            bot = Bot(token=self.bot_token)
            with open(audio_path, 'rb') as f:
                await bot.send_audio(chat_id=chat_id, audio=f)
            logger.info(f"✅ Audio enviado")
            return True
        except Exception as e:
            logger.error(f"❌ Falha audio: {e}")
            return False
    
    async def send_as_document(self, audio_path: str, chat_id: str) -> bool:
        try:
            from telegram import Bot
            bot = Bot(token=self.bot_token)
            with open(audio_path, 'rb') as f:
                await bot.send_document(chat_id=chat_id, document=f)
            logger.info(f"✅ Documento enviado")
            return True
        except Exception as e:
            logger.error(f"❌ Falha documento: {e}")
            return False
    
    async def send_with_fallback(self, audio_path: str, chat_id: str) -> bool:
        if await self.send_as_voice(audio_path, chat_id):
            return True
        if await self.send_as_audio(audio_path, chat_id):
            return True
        if await self.send_as_document(audio_path, chat_id):
            return True
        logger.error("❌ Todos os métodos falharam")
        return False


async def main_send(audio_path: str, chat_id: str):
    sender = TelegramAudioFallback()
    if not sender.bot_token:
        logger.error("❌ Token não encontrado")
        return False
    return await sender.send_with_fallback(audio_path, chat_id)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Hermes Telegram Audio Fallback")
    parser.add_argument("audio_path", nargs="?", help="Caminho do áudio")
    parser.add_argument("chat_id", nargs="?", help="Chat ID")
    parser.add_argument("--list", "-l", action="store_true", help="Listar áudios no cache")
    args = parser.parse_args()
    
    audio_cache = Path.home() / "AppData/Local/hermes/cache/audio"
    
    if args.list:
        if not audio_cache.exists():
            print("❌ Cache não existe")
            return
        files = list(audio_cache.glob("*.ogg"))
        print(f"📁 Áudios: {len(files)}")
        for f in files:
            print(f"  - {f.name} ({f.stat().st_size} bytes)")
        return
    
    if not args.audio_path or not args.chat_id:
        parser.print_help()
        return
    
    if not Path(args.audio_path).exists():
        print(f"❌ Arquivo não encontrado: {args.audio_path}")
        return
    
    asyncio.run(main_send(args.audio_path, args.chat_id))


if __name__ == "__main__":
    main()
