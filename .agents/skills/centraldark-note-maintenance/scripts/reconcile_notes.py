#!/usr/bin/env python3
"""
CentralDark Note Reconciliation Script
Applies 'Atualização Viva' rule: ensures all notes have 10 required properties.
Single writer — only this script modifies note metadata.
"""

import os
import hashlib
import yaml
from datetime import datetime
from pathlib import Path

# Configuration
NOTES_ROOT = Path("K:/docs/CONSCIENCIA/LEMBRANCAS")
GROUPS = [
    "01-cabeca-intencao",
    "02-loop-mestre",
    "03-evidencias-contraprovas",
    "04-pendencias-bloqueios",
    "05-aprendizados-kaizen"
]
TZ = "America/Sao_Paulo"
NOW_ISO = datetime.now().isoformat()

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

def write_note_with_frontmatter(path: Path, fm: dict, body: str):
    with open(path, 'w', encoding='utf-8') as f:
        f.write('---\n')
        yaml.dump(fm, f, allow_unicode=True, sort_keys=False)
        f.write('---\n')
        f.write(body)

def extract_date_from_filename(filename: str) -> str:
    parts = filename.split('-')
    if len(parts) >= 3:
        try:
            year = int(parts[0])
            month = int(parts[1])
            day = int(parts[2])
            if 2020 <= year <= 2030 and 1 <= month <= 12 and 1 <= day <= 31:
                return f"{year:04d}-{month:02d}-{day:02d}"
        except:
            pass
    return NOW_ISO.split('T')[0]

def reconcile_note(note_file: Path, group: str) -> dict:
    """Reconcile a single note, return status dict"""
    content = note_file.read_text(encoding='utf-8')
    fm, body = parse_frontmatter(content)
    
    content_hash = compute_hash(body)
    data_criacao = fm.get('date') or fm.get('data_criacao') or extract_date_from_filename(note_file.name)
    
    # Track what changed
    changes = []
    
    # 1. data_criacao - PRESERVE original
    if 'data_criacao' not in fm:
        fm['data_criacao'] = data_criacao
        changes.append('data_criacao added (preserved from filename/date)')
    elif fm['data_criacao'] != data_criacao:
        # Keep existing, don't overwrite
        changes.append(f'data_criacao preserved: {fm["data_criacao"]}')
    
    # 2. ultima_atualizacao
    fm['ultima_atualizacao'] = NOW_ISO
    changes.append('ultima_atualizacao updated')
    
    # 3. ultima_modificacao
    fm['ultima_modificacao'] = NOW_ISO
    changes.append('ultima_modificacao updated')
    
    # 4. ultima_verificacao
    fm['ultima_verificacao'] = NOW_ISO
    changes.append('ultima_verificacao updated')
    
    # 5. fuso_horario
    fm['fuso_horario'] = TZ
    changes.append('fuso_horario set')
    
    # 6. hash_conteudo
    fm['hash_conteudo'] = content_hash
    changes.append('hash_conteudo computed')
    
    # 7. rastro - APPEND ONLY
    if 'rastro' not in fm:
        fm['rastro'] = [{
            'acao': 'criacao_com_metadados_vivos',
            'timestamp': NOW_ISO,
            'autor': 'centraldark-note-maintenance',
            'detalhe': 'Adicionadas 10 propriedades obrigatorias da regra Atualizacao Viva'
        }]
        changes.append('rastro created')
    else:
        if not isinstance(fm['rastro'], list):
            fm['rastro'] = [fm['rastro']]
        fm['rastro'].append({
            'acao': 'reconciliacao_metadados_vivos',
            'timestamp': NOW_ISO,
            'autor': 'centraldark-note-maintenance',
            'detalhe': 'Regra Atualizacao Viva aplicada - 10 propriedades normalizadas'
        })
        changes.append('rastro appended')
    
    # 8. grupo_notas
    fm['grupo_notas'] = group
    changes.append('grupo_notas set')
    
    # 9. relacionado_a
    if 'relacionado_a' not in fm:
        fm['relacionado_a'] = []
        changes.append('relacionado_a initialized')
    elif not isinstance(fm['relacionado_a'], list):
        fm['relacionado_a'] = [fm['relacionado_a']]
        changes.append('relacionado_a normalized to list')
    
    # 10. estado_evidencia
    if 'estado_evidencia' not in fm:
        fm['estado_evidencia'] = 'PENDING'
        changes.append('estado_evidencia set to PENDING')
    
    # Write back
    write_note_with_frontmatter(note_file, fm, body)
    
    return {
        'file': note_file.name,
        'group': group,
        'hash': content_hash[:12],
        'changes': changes,
        'status': 'RECONCILED'
    }

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--all', action='store_true', help='Reconcile all notes in all groups')
    parser.add_argument('--group', help='Reconcile specific group')
    parser.add_argument('--file', help='Reconcile specific file')
    args = parser.parse_args()
    
    results = []
    
    if args.file:
        # Find file in groups
        for group in GROUPS:
            fpath = NOTES_ROOT / group / args.file
            if fpath.exists():
                results.append(reconcile_note(fpath, group))
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
                results.append(reconcile_note(note_file, args.group))
    else:
        # All groups
        for group in GROUPS:
            group_path = NOTES_ROOT / group
            if group_path.exists():
                for note_file in group_path.glob("*.md"):
                    if note_file.name not in ['LEMBRANCAS.md', 'README.md', 'lembrancas-202606.md']:
                        results.append(reconcile_note(note_file, group))
    
    # Summary
    print(f"\n=== RECONCILIATION SUMMARY ===")
    print(f"Total notes processed: {len(results)}")
    print(f"Timestamp: {NOW_ISO}")
    print(f"Timezone: {TZ}")
    for r in results:
        print(f"  [{r['group']}] {r['file']} - hash:{r['hash']} - {len(r['changes'])} changes")
    
    return 0

if __name__ == '__main__':
    exit(main())