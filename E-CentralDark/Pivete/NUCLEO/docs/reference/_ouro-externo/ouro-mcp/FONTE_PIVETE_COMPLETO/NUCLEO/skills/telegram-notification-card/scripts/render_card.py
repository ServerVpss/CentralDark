#!/usr/bin/env python3
"""Render + verify the canonical Card Hermes (PADRAO-CARD-HERMES v1.2).

Aligns by DISPLAY WIDTH, not string length: color emoji (supplementary plane,
U+1Fxxx) render as 2 monospace columns in Telegram <pre>. Padding by len()
drifts the right border. Run: python scripts/render_card.py
"""
import sys
import unicodedata

INNER = 36          # spec: 36 visual columns
FRAME = INNER + 2   # 2 x '║'

def dwidth(ch: str) -> int:
    cp = ord(ch)
    if cp > 0xFFFF:
        return 2
    if 0x1F000 <= cp <= 0x1FAFF:
        return 2
    if cp == 0xFE0F:          # variation selector, zero width
        return 0
    if unicodedata.east_asian_width(ch) in ('W', 'F'):
        return 2
    return 1

def width(s: str) -> int:
    return sum(dwidth(c) for c in s)

def bar(c='═'):
    return '╔' + c * INNER + '╗'

def bar_close(c='═'):
    return '╚' + c * INNER + '╝'

def sep():
    return '─' * FRAME

def L(t=''):
    inner = t[:INNER]
    pad = INNER - width(inner)
    if pad < 0:
        pad = 0
    return '║' + inner + ' ' * pad + '║'

def I(t, p=2):
    return L(' ' * p + t)

def build():
    return [
        bar(),
        L('HERMES / REVISÃO-PADRÃO'),
        L('PADRAO-CARD-HERMES v1.2'),
        bar_close(),
        L(),
        I('STATUS:    ✅ OK'),
        I('PRIORID:   🟡 Média'),
        I('RESPONS:   @segredounlocker'),
        L(),
        I('🎯 MISSÃO: Revisar card vs p1.2'),
        I('📌 FASE:   Leitura → Decisão'),
        I('⏱  TEMPO:  sessão'),
        L(),
        I('📘 LEIGO'),
        I('  Padrão oficial achado/travado.'),
        I('  Parado no teu ok modo 1/2.'),
        L(),
        I('⚙️  AÇÃO'),
        I('  ✅ Achado PADRAO-CARD v1.2'),
        I('  ✅ Lido antes de mexer'),
        I('  ✅ Card moldura 36 corrigido'),
        I('  ⏳ Espera teu 1 ou 2'),
        L(),
        I('📊 PROGRESSO'),
        I('  NÍVEL: [████████░░] Lv.7'),
        I('  XP:    [██████████] 120/120'),
        I('  PROG:  80%'),
        L(),
        I('🧠 SKILLS UP'),
        I('  • lupa-bayesiana  +40 (Lv.5)'),
        I('  • tecnica-lupa    +30 (Lv.4)'),
        L(),
        I('🚨 BLOQUEIOS'),
        I('  Decisão modo 1/2 pendente'),
        L(),
        I('🎯 PRÓXIMO PASSO'),
        I('  Teu 1 ou 2 libera ajuste'),
        L(),
        sep(),
        I('🔧 DETALHE TÉCNICO (PROVA)'),
        I('  Arquivo: PADRAO-CARD-HERMES'),
        I('  Commits: 059c5891 (v1.2)'),
        I('  Validad: Pivete 04/07/2026'),
        I('  Log ID:  a3f7c1e2'),
        I('  Tags:    #dev #consciencia'),
        bar_close(),
    ]

def main():
    lines = build()
    bad = [(i, width(l)) for i, l in enumerate(lines)
           if l and l[0] in '╔║╚╝' and width(l) != FRAME]
    ok = not bad
    print('\n'.join(lines))
    print(f'\nDISPLAY_WIDTH_BAD: {bad}')
    print(f'ALL_{FRAME}_WIDE: {ok}')
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    main()
