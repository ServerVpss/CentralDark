#!/usr/bin/env python3
"""
CentralDark HUD - NOTAS_DESATUALIZADAS metric
Returns count of notes missing required properties or with invalid hashes.
Source: Fixed Point note reconciliation delta
"""

import hashlib
import yaml
from pathlib import Path

NOTES_ROOT = Path("K:/docs/CONSCIENCIA/LEMBRANCAS")
GROUPS = [
    "01-cabeca-intencao",
    "02-loop-mestre",
    "03-evidencias-contraprovas",
    "04-pendencias-bloqueios",
    "05-aprendizados-kaizen"
]

REQUIRED_PROPS = [
    "data_criacao",
    "ultima_atualizacao",
    "ultima_modificacao",
    "ultima_verificacao",
    "fuso_horario",
    "hash_conteudo",
    "rastro",
    "grupo_notas",
    "relacionado_a",
    "estado_evidencia"
]

VALID_ESTADO_EVIDENCIA = {"PROVED", "UNKNOWN", "PENDING", "BLOCKED"}
VALID_GROUPS = set(GROUPS)

def compute_hash(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def parse_frontmatter(content: str):
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            try:
                fm = yaml.safe_load(parts[1]) or {}
                body = parts[2].lstrip('\n')
                return fm, body
            except yaml.YAMLError:
                pass
    return {}, content

def check_note(note_file: Path, group: str) -> bool:
    """Return True if note is OUTDATED (missing props or invalid hash)"""
    content = note_file.read_text(encoding='utf-8')
    fm, body = parse_frontmatter(content)
    
    # Check all 10 required properties
    for prop in REQUIRED_PROPS:
        if prop not in fm:
            return True
    
    # Check hash
    if 'hash_conteudo' in fm:
        expected_hash = compute_hash(body)
        if fm['hash_conteudo'] != expected_hash:
            return True
    
    # Check grupo_notas
    if fm.get('grupo_notas') != group:
        return True
    
    # Check estado_evidencia valid
    if fm.get('estado_evidencia') not in VALID_ESTADO_EVIDENCIA:
        return True
    
    return False

def main():
    outdated = []
    total = 0
    
    for group in GROUPS:
        group_path = NOTES_ROOT / group
        if group_path.exists():
            for note_file in group_path.glob("*.md"):
                if note_file.name not in ['LEMBRANCAS.md', 'README.md', 'lembrancas-202606.md']:
                    total += 1
                    if check_note(note_file, group):
                        outdated.append(f"{group}/{note_file.name}")
    
    count = len(outdated)
    
    # Output for HUD consumption (JSON)
    import json
    result = {
        "field": "NOTAS_DESATUALIZADAS",
        "count": count,
        "total_notes": total,
        "percentage": round(count / total * 100, 1) if total > 0 else 0,
        "source": "Fixed Point note reconciliation delta",
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "outdated_notes": outdated
    }
    
    print(json.dumps(result, ensure_ascii=False))
    return 0 if count == 0 else 1

if __name__ == '__main__':
    import sys
    sys.exit(main())