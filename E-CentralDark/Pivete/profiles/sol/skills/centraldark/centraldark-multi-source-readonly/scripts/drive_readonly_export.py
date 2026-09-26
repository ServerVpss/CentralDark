#!/usr/bin/env python3
"""
Google Drive Read-Only Export para CentralDark
Usa skill google-drive-document-handling para exportar/normalizar → destino canônico
"""

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


def run_cmd(cmd: List[str], cwd: Optional[str] = None, timeout: int = 60) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=timeout)


def log(msg: str):
    print(f"[DRIVE-EXPORT] {msg}")


def download_drive_file(drive_url: str, dest_path: Path) -> bool:
    """
    Baixa arquivo do Google Drive.
    Suporta: export?format=pdf, export?format=docx, ou link direto de download.
    NOTA: Docs privados precisam auth (gdrive CLI com OAuth ou cookie).
    """
    try:
        # Extrai file ID do URL
        import re
        match = re.search(r'/d/([a-zA-Z0-9-_]+)', drive_url)
        if not match:
            log(f"ERRO: Não conseguiu extrair file ID de {drive_url}")
            return False

        file_id = match.group(1)

        # Tenta exportar como PDF primeiro (mais confiável para Google Docs)
        export_url = f"https://docs.google.com/document/d/{file_id}/export?format=pdf"
        
        log(f"Baixando {export_url} -> {dest_path}")
        urllib.request.urlretrieve(export_url, dest_path)
        
        if dest_path.exists() and dest_path.stat().st_size > 0:
            log(f"Download OK: {dest_path.stat().st_size} bytes")
            return True
        else:
            log("ERRO: Arquivo vazio")
            return False

    except urllib.error.HTTPError as e:
        if e.code == 401:
            log("ERRO 401: Documento privado — requer autenticação")
            log("Soluções:")
            log("  1. gdrive CLI: `gdrive download --format pdf <file_id>` (precisa OAuth)")
            log("  2. Browser: abrir URL, File > Download > PDF, salvar manualmente")
            log("  3. Compartilhar doc como 'Anyone with link can view'")
            return False
        log(f"ERRO HTTP {e.code}: {e}")
        return False
    except Exception as e:
        log(f"ERRO no download: {e}")
        return False


def detect_format(file_path: Path) -> str:
    """Detecta formato real do arquivo (file command)."""
    try:
        r = run_cmd(["file", "--brief", str(file_path)])
        if r.returncode == 0:
            return r.stdout.strip().lower()
    except Exception:
        pass
    return "unknown"


def extract_text(file_path: Path, fmt: str) -> Optional[str]:
    """Extrai texto baseado no formato."""
    try:
        if "pdf" in fmt:
            # pymupdf
            import fitz
            doc = fitz.open(str(file_path))
            text = "".join(page.get_text() for page in doc)
            doc.close()
            return text
        elif "word" in fmt or "docx" in fmt or "ooxml" in fmt:
            # python-docx
            from docx import Document
            doc = Document(str(file_path))
            return "\n".join(p.text for p in doc.paragraphs)
        elif "text" in fmt or "markdown" in fmt or file_path.suffix in [".md", ".txt"]:
            return file_path.read_text(encoding="utf-8", errors="replace")
        else:
            log(f"Formato não suportado: {fmt}")
            return None
    except Exception as e:
        log(f"ERRO extraindo texto: {e}")
        return None


def normalize_text(text: str) -> str:
    """Normaliza: UTF-8, remove BOM, line endings."""
    # Remove BOM
    if text.startswith('\ufeff'):
        text = text[1:]
    # Normaliza line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Remove trailing whitespace por linha
    lines = [line.rstrip() for line in text.split('\n')]
    return '\n'.join(lines)


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def compare_with_canonical(text: str, canonical_path: str) -> Dict:
    """Compara com versão no origin/main."""
    try:
        r = run_cmd(["git", "show", f"origin/main:{canonical_path}"], cwd="E:/CentralDark/Pivete/CentralDark")
        if r.returncode == 0 and r.stdout.strip():
            canonical_text = r.stdout
            canonical_hash = sha256_text(canonical_text)
            current_hash = sha256_text(text)
            
            if canonical_hash == current_hash:
                return {"status": "IDENTICAL", "canonical_hash": canonical_hash, "current_hash": current_hash}
            else:
                # Calcula diff aproximado
                return {"status": "DIFFERENT", "canonical_hash": canonical_hash, "current_hash": current_hash, "has_delta": True}
        else:
            return {"status": "NOT_IN_CANONICAL", "current_hash": sha256_text(text)}
    except Exception as e:
        log(f"ERRO comparando com canônico: {e}")
        return {"status": "ERROR", "error": str(e)}


def main():
    parser = argparse.ArgumentParser(description="Google Drive Read-Only Export para CentralDark")
    parser.add_argument("--drive-url", required=True, help="URL do Google Drive/Docs")
    parser.add_argument("--destino", required=True, help="Caminho canônico destino (ex: docs/ARQUITETURA/.../DELTA-CONTINUO.md)")
    parser.add_argument("--mission-id", help="ID da missão")
    args = parser.parse_args()

    mission_id = args.mission_id or f"drive-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"

    print(f"\n{'='*60}")
    print(f"GOOGLE DRIVE READ-ONLY EXPORT")
    print(f"Mission: {mission_id}")
    print(f"Source: {args.drive_url}")
    print(f"Destino: {args.destino}")
    print(f"{'='*60}\n")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        
        # 1. Download
        downloaded_file = tmp_path / "downloaded.pdf"
        if not download_drive_file(args.drive_url, downloaded_file):
            sys.exit(1)

        # 2. Detecta formato
        fmt = detect_format(downloaded_file)
        log(f"Formato detectado: {fmt}")

        # 3. Extrai texto
        text = extract_text(downloaded_file, fmt)
        if not text:
            log("ERRO: Falha ao extrair texto")
            sys.exit(1)
        
        log(f"Texto extraído: {len(text)} chars")

        # 4. Normaliza
        text = normalize_text(text)
        log(f"Texto normalizado: {len(text)} chars")

        # 5. Hash
        content_hash = sha256_text(text)
        log(f"SHA256: {content_hash}")

        # 6. Compara com canônico
        comparison = compare_with_canonical(text, args.destino)
        log(f"Comparação: {comparison.get('status')}")

        # 7. Receipt
        receipt = {
            "schema": "centraldark.drive-export-receipt.v1",
            "mission_id": mission_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "source_url": args.drive_url,
            "destino_canonico": args.destino,
            "format_detected": fmt,
            "content_hash": content_hash,
            "content_length": len(text),
            "comparison": comparison,
            "delta_useful": comparison.get("has_delta", False) or comparison.get("status") == "NOT_IN_CANONICAL",
            "reuse_before_create": comparison.get("status") != "NOT_IN_CANONICAL",
            "no_v2_v3": True
        }

        # 8. Salva receipt
        receipt_dir = Path("E:/CentralDark/Pivete/runtime/receipts")
        receipt_dir.mkdir(parents=True, exist_ok=True)
        receipt_file = receipt_dir / f"{mission_id}.json"
        receipt_file.write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding="utf-8")
        log(f"Receipt salvo: {receipt_file}")

        # 9. Preview do conteúdo (primeiras 2000 chars)
        print(f"\n--- PREVIEW (primeiros 2000 chars) ---")
        print(text[:2000])
        print(f"\n--- FIM PREVIEW ---\n")

        # Output JSON
        print(json.dumps(receipt, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()