#!/usr/bin/env python3
"""
CentralDark Note Verification Script
Verifies all notes have 10 required properties with valid hashes.
Used by fiscal check: ALL_NOTES_HAVE_10_PROPS_AND_VALID_HASH
"""

import hashlib
import yaml
from pathlib import Path
from datetime import datetime

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

def verify_note(note_file: Path, group: str) -> dict:
    """Verify a single note, return status dict"""
    content = note_file.read_text(encoding='utf-8')
    fm, body = parse_frontmatter(content)
    
    errors = []
    warnings = []
    
    # Check all 10 required properties
    for prop in REQUIRED_PROPS:
        if prop not in fm:
            errors.append(f"MISSING_PROP: {prop}")
    
    # Validate hash_conteudo
    if 'hash_conteudo' in fm:
        expected_hash = compute_hash(body)
        if fm['hash_conteudo'] != expected_hash:
            errors.append(f"HASH_MISMATCH: stored={fm['hash_conteudo'][:12]}... computed={expected_hash[:12]}...")
    
    # Validate grupo_notas matches actual group
    if fm.get('grupo_notas') != group:
        errors.append(f"GRUPO_MISMATCH: frontmatter={fm.get('grupo_notas')} actual={group}")
    
    # Validate grupo_notas is valid
    if fm.get('grupo_notas') not in VALID_GROUPS:
        errors.append(f"INVALID_GROUP: {fm.get('grupo_notas')}")
    
    # Validate estado_evidencia
    if fm.get('estado_evidencia') not in VALID_ESTADO_EVIDENCIA:
        errors.append(f"INVALID_ESTADO_EVIDENCIA: {fm.get('estado_evidencia')}")
    
    # Validate rastro is list
    if 'rastro' in fm and not isinstance(fm['rastro'], list):
        errors.append("RASTRO_NOT_LIST")
    
    # Validate relacionado_a is list
    if 'relacionado_a' in fm and not isinstance(fm['relacionado_a'], list):
        errors.append("RELACIONADO_A_NOT_LIST")
    
    # Validate data_criacao format
    if 'data_criacao' in fm:
        try:
            datetime.strptime(fm['data_criacao'], '%Y-%m-%d')
        except:
            warnings.append(f"INVALID_DATA_CRIACAO_FORMAT: {fm['data_criacao']}")
    
    # Validate timestamps are ISO format
    for ts_prop in ['ultima_atualizacao', 'ultima_modificacao', 'ultima_verificacao']:
        if ts_prop in fm:
            try:
                datetime.fromisoformat(fm[ts_prop].replace('Z', '+00:00'))
            except:
                warnings.append(f"INVALID_{ts_prop.upper()}_FORMAT: {fm[ts_prop]}")
    
    return {
        'file': note_file.name,
        'group': group,
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'hash': fm.get('hash_conteudo', '')[:12] if fm.get('hash_conteudo') else 'MISSING',
        'estado_evidencia': fm.get('estado_evidencia', 'MISSING'),
        'props_present': sum(1 for p in REQUIRED_PROPS if p in fm),
        'props_required': len(REQUIRED_PROPS)
    }

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--all', action='store_true', help='Verify all notes in all groups')
    parser.add_argument('--group', help='Verify specific group')
    parser.add_argument('--file', help='Verify specific file')
    args = parser.parse_args()
    
    results = []
    
    if args.file:
        for group in GROUPS:
            fpath = NOTES_ROOT / group / args.file
            if fpath.exists():
                results.append(verify_note(fpath, group))
                break
        else:
            print(f"File {args.file} not found in any group")
            return 1
    elif args.group:
        if args.group not in GROUPS:
            print(f"Invalid group: {args.group}")
            return 1
        group_path = NOTES_ROOT / args.group
        for note_file in group_path.glob("*.md"):
            if note_file.name not in ['LEMBRANCAS.md', 'README.md', 'lembrancas-202606.md']:
                results.append(verify_note(note_file, args.group))
    else:
        for group in GROUPS:
            group_path = NOTES_ROOT / group
            if group_path.exists():
                for note_file in group_path.glob("*.md"):
                    if note_file.name not in ['LEMBRANCAS.md', 'README.md', 'lembrancas-202606.md']:
                        results.append(verify_note(note_file, group))
    
    # Summary
    total = len(results)
    valid = sum(1 for r in results if r['valid'])
    invalid = total - valid
    total_props_missing = sum(r['props_required'] - r['props_present'] for r in results)
    
    print(f"\n=== VERIFICATION SUMMARY ===")
    print(f"Total notes: {total}")
    print(f"Valid (all 10 props + valid hash): {valid}")
    print(f"Invalid: {invalid}")
    print(f"Total missing properties: {total_props_missing}")
    
    if invalid > 0:
        print(f"\n--- INVALID NOTES ---")
        for r in results:
            if not r['valid']:
                print(f"  [{r['group']}] {r['file']} - props: {r['props_present']}/{r['props_required']} - hash: {r['hash']} - estado: {r['estado_evidencia']}")
                for e in r['errors']:
                    print(f"    ERROR: {e}")
                for w in r['warnings']:
                    print(f"    WARN: {w}")
    
    # Exit code for CI/automation
    if invalid > 0 or total_props_missing > 0:
        print(f"\nFAIL: ZERO_NOTES_MISSING_PROPS condition not met")
        return 1
    else:
        print(f"\nPASS: All notes have 10 required properties and valid hashes")
        return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())