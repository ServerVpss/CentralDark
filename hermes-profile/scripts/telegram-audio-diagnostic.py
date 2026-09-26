#!/usr/bin/env python3
"""
Hermes Telegram Audio Diagnostic
Verifica configuração e status do sistema de áudio do Telegram.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Configurações
HERMES_HOME = Path.home() / "AppData/Local/hermes"


def check_path(path: Path, description: str) -> dict:
    """Verifica se um path existe e retorna info."""
    exists = path.exists()
    result = {
        "description": description,
        "path": str(path),
        "exists": exists
    }
    
    if exists:
        if path.is_file():
            result["size"] = path.stat().st_size
            result["type"] = "file"
        else:
            result["contents"] = len(list(path.iterdir())) if path.is_dir() else 0
            result["type"] = "directory"
    
    return result


def read_env_secret(name: str) -> str:
    """Lê secret do .env de forma segura."""
    env_file = HERMES_HOME / ".env"
    if env_file.exists():
        try:
            content = env_file.read_text(encoding='utf-8', errors='ignore')
            for line in content.split('\n'):
                if line.startswith(f'{name}='):
                    value = line.split('=', 1)[1].strip()
                    # Mascarar token para segurança
                    if len(value) > 10:
                        return f"{value[:8]}...{value[-4:]}"
                    return value
        except:
            pass
    return "❌ Não encontrado"


def check_telegram_config() -> dict:
    """Verifica configuração completa do Telegram."""
    config = {
        "bot_token": read_env_secret("TELEGRAM_BOT_TOKEN"),
        "allowed_users": read_env_secret("TELEGRAM_ALLOWED_USERS"),
        "bot_username": read_env_secret("TELEGRAM_BOT_USERNAME"),
        "webhook_url": read_env_secret("TELEGRAM_WEBHOOK_URL"),
        "webhook_secret": "✓ Configurado" if read_env_secret("TELEGRAPH_WEBHOOK_SECRET") != "❌ Não encontrado" else "❌ Não encontrado",
    }
    
    # Verifica se token parece válido
    token = config["bot_token"]
    if token != "❌ Não encontrado":
        config["token_valid"] = "✅ Parece válido" if len(token) > 20 else "❌ Token muito curto"
    else:
        config["token_valid"] = "❌ Token não configurado"
    
    return config


def check_audio_cache() -> dict:
    """Verifica cache de áudio."""
    audio_cache = HERMES_HOME / "cache/audio"
    result = check_path(audio_cache, "Cache de áudio")
    
    if result["exists"]:
        files = list(audio_cache.glob("*.ogg"))
        result["files"] = []
        for f in files:
            result["files"].append({
                "name": f.name,
                "size": f.stat().st_size,
                "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
            })
        result["file_count"] = len(files)
    
    return result


def check_gateway_status() -> dict:
    """Verifica status do gateway Hermes."""
    import subprocess
    
    result = {
        "running": False,
        "error": None,
        "log_available": False,
        "log_lines": 0,
        "last_error": None,
        "telegram_connected": None
    }
    
    # Verifica se processo está rodando
    try:
        import psutil
        for proc in psutil.process_iter(['name', 'pid', 'cmdline']):
            try:
                if 'hermes' in proc.info.get('name', '').lower():
                    result["running"] = True
                    result["pid"] = proc.info['pid']
                    cmdline = proc.info.get('cmdline', [])
                    if cmdline:
                        result["cmdline"] = ' '.join(cmdline)[:200]
                    break
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
    except ImportError:
        result["error"] = "psutil não disponível"
    
    # Verifica logs
    log_file = HERMES_HOME / "logs/gateway.log"
    if log_file.exists():
        result["log_available"] = True
        result["log_lines"] = sum(1 for _ in log_file.open(encoding='utf-8', errors='ignore'))
        
        # Busca última entrada de erro
        try:
            with log_file.open(encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                for line in reversed(lines[-100:]):
                    if 'ERROR' in line and ('telegram' in line.lower() or 'voice' in line.lower()):
                        result["last_error"] = line.strip()[:300]
                        break
        except:
            pass
    
    return result


def check_ffmpeg() -> dict:
    """Verifica se ffmpeg está instalado."""
    import subprocess
    
    result = {
        "installed": False,
        "path": None,
        "version": None
    }
    
    try:
        proc = subprocess.run(
            ["where", "ffmpeg"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if proc.returncode == 0 and proc.stdout.strip():
            result["installed"] = True
            result["path"] = proc.stdout.strip().split('\n')[0]
            
            # Tenta pegar versão
            try:
                ver_proc = subprocess.run(
                    ["ffmpeg", "-version"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if ver_proc.returncode == 0:
                    lines = ver_proc.stdout.split('\n')
                    result["version"] = lines[0] if lines else None
            except:
                pass
    except Exception as e:
        result["error"] = str(e)
    
    return result


def check_python_deps() -> dict:
    """Verifica dependências Python necessárias."""
    deps = {
        "telegram": False,
        "asyncio": True,  # stdlib
        "psutil": False,
        "sounddevice": False,
    }
    
    for dep in deps:
        if dep == "asyncio":
            continue
        
        try:
            __import__(dep)
            deps[dep] = True
        except ImportError:
            deps[dep] = False
    
    return deps


def check_permissions() -> dict:
    """Verifica permissões necessárias."""
    result = {
        "audio_cache_writable": False,
        "logs_writable": False,
        "scripts_writable": False
    }
    
    audio_cache = HERMES_HOME / "cache/audio"
    if audio_cache.exists():
        result["audio_cache_writable"] = os.access(audio_cache, os.W_OK)
    
    logs_dir = HERMES_HOME / "logs"
    if logs_dir.exists():
        result["logs_writable"] = os.access(logs_dir, os.W_OK)
    
    scripts_dir = HERMES_HOME / "scripts"
    if scripts_dir.exists():
        result["scripts_writable"] = os.access(scripts_dir, os.W_OK)
    
    return result


def generate_report():
    """Gera relatório completo."""
    print("\n" + "="*60)
    print("🔍 HERMES TELEGRAM AUDIO - DIAGNÓSTICO RÁPIDO")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")
    
    # 1. Configuração do Telegram
    print("📱 CONFIGURAÇÃO DO TELEGRAM")
    print("-" * 40)
    config = check_telegram_config()
    for key, value in config.items():
        status = "✅" if "❌" not in str(value) else "❌"
        print(f"  {status} {key}: {value}")
    print()
    
    # 2. Cache de áudio
    print("🎵 CACHE DE ÁUDIO")
    print("-" * 40)
    audio = check_audio_cache()
    for key, value in audio.items():
        if key == "files":
            print(f"  📁 Arquivos: {value}")
            for f in value:
                print(f"      - {f['name']} ({f['size']} bytes)")
        elif key != "exists" and key != "path" and key != "type" and key != "description":
            print(f"  {'✅' if value else '❌'} {key}: {value}")
    print()
    
    # 3. Status do Gateway
    print("🚀 GATEWAY HERMES")
    print("-" * 40)
    gateway = check_gateway_status()
    status_icon = "✅" if gateway.get("running") else "❌"
    print(f"  {status_icon} Gateway rodando: {gateway.get('running', False)}")
    if gateway.get("pid"):
        print(f"     PID: {gateway['pid']}")
    if gateway.get("last_error"):
        print(f"  ⚠️ Último erro: {gateway['last_error'][:100]}...")
    if gateway.get("log_available"):
        print(f"  📋 Logs disponíveis: {gateway['log_lines']} linhas")
    if gateway.get("error"):
        print(f"  ❌ Erro: {gateway['error']}")
    print()
    
    # 4. ffmpeg
    print("🎬 FFMPEG (para conversão Edge → Opus)")
    print("-" * 40)
    ffmpeg = check_ffmpeg()
    status_icon = "✅" if ffmpeg.get("installed") else "❌"
    print(f"  {status_icon} Instalado: {ffmpeg.get('installed', False)}")
    if ffmpeg.get("path"):
        print(f"     Caminho: {ffmpeg['path']}")
    if ffmpeg.get("version"):
        print(f"     Versão: {ffmpeg['version']}")
    print()
    
    # 5. Dependências Python
    print("🐍 DEPENDÊNCIAS PYTHON")
    print("-" * 40)
    deps = check_python_deps()
    for dep, installed in deps.items():
        status_icon = "✅" if installed else "❌"
        print(f"  {status_icon} {dep}")
    print()
    
    # 6. Permissões
    print("🔐 PERMISSÕES")
    print("-" * 40)
    perms = check_permissions()
    for perm, accessible in perms.items():
        status_icon = "✅" if accessible else "❌"
        print(f"  {status_icon} {perm}")
    print()
    
    # 7. Scripts disponíveis
    print("📜 SCRIPTS DISPONÍVEIS")
    print("-" * 40)
    scripts_dir = HERMES_HOME / "scripts"
    if scripts_dir.exists():
        scripts = list(scripts_dir.glob("*.py"))
        for script in scripts:
            print(f"  📜 {script.name}")
    else:
        print("  ❌ Diretório de scripts não existe")
    print()
    
    # Resumo de ação
    print("="*60)
    print("📋 RESUMO DE AÇÃO")
    print("="*60)
    
    issues = []
    
    if config["bot_token"] == "❌ Não encontrado":
        issues.append("❌ Token do Telegram não configurado")
    
    if not gateway.get("running"):
        issues.append("❌ Gateway Hermes não está rodando")
    
    if not ffmpeg.get("installed"):
        issues.append("⚠️ ffmpeg não instalado (precisa para voice bubble nativo)")
    
    if audio.get("file_count", 0) == 0:
        issues.append("ℹ️ Sem áudios no cache")
    
    if not issues:
        print("✅ Sistema pronto para uso!")
    else:
        print("⚠️ Ações recomendadas:")
        for issue in issues:
            print(f"   {issue}")
    
    print()
    print("="*60)


if __name__ == "__main__":
    generate_report()
