#!/usr/bin/env python3
"""Auditoria estrutural de documentação CentralDark.

Não injeta comentários no código. Produz inventário de símbolos/faixas e falha fechado
quando uma linguagem material não pode ser analisada com parser estrutural disponível.
"""
from __future__ import annotations
import argparse, ast, json, subprocess, sys, re
from pathlib import Path

JS_EXT={'.js','.jsx','.ts','.tsx','.mjs','.cjs','.mts','.cts'}
JS_FALLBACK_EXT={'.js','.jsx','.mjs','.cjs'}
PY_EXT={'.py'}


def scan_python(path: Path):
    tree=ast.parse(path.read_text(encoding='utf-8', errors='replace'), filename=str(path))
    out=[]
    for node in ast.walk(tree):
        if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)):
            if getattr(node,'name','').startswith('_'):
                continue
            out.append({
                'name':node.name,
                'kind':'class' if isinstance(node,ast.ClassDef) else 'function',
                'line_start':node.lineno,
                'line_end':getattr(node,'end_lineno',node.lineno),
                'has_inline_doc':bool(ast.get_docstring(node)),
            })
    return out


def scan_js_fallback(path: Path):
    syntax=subprocess.run(['node','--check',str(path)],capture_output=True,text=True,timeout=30)
    if syntax.returncode!=0:
        raise RuntimeError('JS_SYNTAX_FAILED:'+syntax.stderr.strip()[:300])
    text=path.read_text(encoding='utf-8',errors='replace')
    rows=[]
    patterns=[
        (r'(?m)^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(', 'function'),
        (r'(?m)^\s*(?:export\s+)?class\s+([A-Za-z_$][\w$]*)\b', 'class'),
        (r'(?m)^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^\n]*\)\s*=>', 'function'),
    ]
    for rx,kind in patterns:
        for m in re.finditer(rx,text):
            line=text.count('\n',0,m.start())+1
            rows.append({'name':m.group(1),'kind':kind,'line_start':line,'line_end':line,'parser':'NODE_CHECK_PLUS_LEXICAL'})
    return rows

def scan_js_ts(path: Path, helper: Path):
    p=subprocess.run(['node',str(helper),str(path)],capture_output=True,text=True,timeout=30)
    if p.returncode==3:
        if path.suffix.lower() in JS_FALLBACK_EXT:
            return scan_js_fallback(path)
        raise RuntimeError('TYPESCRIPT_PARSER_UNAVAILABLE')
    if p.returncode!=0:
        raise RuntimeError('TS_PARSE_FAILED:'+p.stderr.strip()[:300])
    return json.loads(p.stdout)


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('root')
    ap.add_argument('--output')
    args=ap.parse_args()
    root=Path(args.root).resolve()
    helper=Path(__file__).with_name('audit_ts_symbols.mjs')
    report={'root':str(root),'files':[],'unknown_parsers':[]}
    for p in sorted(root.rglob('*')):
        if not p.is_file() or any(part in {'.git','node_modules','dist','build','.next'} for part in p.parts):
            continue
        try:
            if p.suffix.lower() in PY_EXT:
                symbols=scan_python(p)
            elif p.suffix.lower() in JS_EXT:
                symbols=scan_js_ts(p,helper)
            else:
                continue
            report['files'].append({'path':str(p.relative_to(root)),'symbols':symbols})
        except Exception as e:
            report['unknown_parsers'].append({'path':str(p.relative_to(root)),'error':str(e)})
    report['pass']=not report['unknown_parsers']
    text=json.dumps(report,ensure_ascii=False,indent=2)
    if args.output:
        Path(args.output).write_text(text,encoding='utf-8')
    else:
        print(text)
    return 0 if report['pass'] else 2

if __name__=='__main__':
    raise SystemExit(main())
