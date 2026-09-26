#!/usr/bin/env python3
"""Detect and extract text from files that may be PDF, DOCX, TXT, or markdown."""

import sys
import os
import subprocess

def detect_format(filepath):
    try:
        result = subprocess.run(['file', filepath], capture_output=True, text=True, timeout=10)
        output = result.stdout.strip()
        if 'PDF document' in output:
            return {'type': 'pdf', 'raw': output}
        elif 'text' in output.lower():
            return {'type': 'text', 'raw': output}
        elif 'Zip archive' in output or 'Microsoft Word' in output:
            return {'type': 'docx', 'raw': output}
        else:
            return {'type': 'unknown', 'raw': output}
    except Exception as e:
        return {'type': 'error', 'error': str(e)}

def extract_pdf(filepath, output_path=None):
    try:
        import fitz
    except ImportError:
        print("ERROR: PyMuPDF not installed. Install with: pip install pymupdf", file=sys.stderr)
        sys.exit(1)
    doc = fitz.open(filepath)
    full_text = ''.join(page.get_text() for page in doc)
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        print(f"Extracted {len(doc)} pages, {len(full_text)} chars → {output_path}")
    else:
        print(f"Extracted {len(doc)} pages, {len(full_text)} chars (preview):")
        print(full_text[:1000])
    return {'pages': len(doc), 'total_chars': len(full_text)}

def extract_docx(filepath, output_path=None):
    try:
        from docx import Document
    except ImportError:
        print("ERROR: python-docx not installed. Install with: pip install python-docx", file=sys.stderr)
        sys.exit(1)
    doc = Document(filepath)
    full_text = '\n'.join(p.text for p in doc.paragraphs if p.text.strip())
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        print(f"Extracted {len(doc.paragraphs)} paragraphs, {len(full_text)} chars → {output_path}")
    else:
        print(f"Extracted {len(doc.paragraphs)} paragraphs, {len(full_text)} chars:")
        print(full_text[:1000])
    return {'paragraphs': len(doc.paragraphs), 'total_chars': len(full_text)}

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <input_file> [output_file]", file=sys.stderr)
        sys.exit(1)
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    if not os.path.exists(input_file):
        print(f"ERROR: File not found: {input_file}", file=sys.stderr)
        sys.exit(1)
    format_info = detect_format(input_file)
    print(f"Detected: {format_info['type']}")
    print(f"Details: {format_info.get('raw', 'N/A')[:200]}")
    if format_info['type'] == 'pdf':
        result = extract_pdf(input_file, output_file)
    elif format_info['type'] == 'docx':
        result = extract_docx(input_file, output_file)
    elif format_info['type'] == 'text':
        with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Copied {len(content)} chars → {output_file}")
        else:
            print(f"Content ({len(content)} chars):")
            print(content[:1000])
        result = {'chars': len(content)}
    else:
        print(f"ERROR: Cannot extract from format: {format_info['type']}", file=sys.stderr)
        sys.exit(1)
    print("\n=== Summary ===")
    for k, v in result.items():
        print(f"{k}: {v}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
