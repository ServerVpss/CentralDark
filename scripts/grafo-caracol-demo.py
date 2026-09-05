#!/usr/bin/env python3
"""
Grafo Caracol Demo — MAPA DO CEREBRO em espiral contínua.
REUSE: standalone pure-Python SVG generator (no new deps, no new arch).
Nodes placed along Archimedean spiral trajectory (exterior → núcleo).
Real relations drawn as edges on top (cross-turn ok).
Position on spiral != semantic relation.
CARACOL_VISUAL test: hide edges → spiral must be recognizable from points+curve alone.
"""

import math
from datetime import datetime

# Representative nodes from CentralDark SOUL / BRAIN structure (demo subset)
# Order: outer (high index start) to inner (core last) for trajectory
NODES = [
    {"id": "exterior1", "label": "EXTERIOR\nNotas Soltas", "group": "periferia"},
    {"id": "exterior2", "label": "Rascunhos", "group": "periferia"},
    {"id": "aprendizados", "label": "Aprendizados", "group": "cognicao"},
    {"id": "banda", "label": "BANDA", "group": "cognicao"},
    {"id": "mineracao", "label": "MINERAÇÃO\nOURO", "group": "cognicao"},
    {"id": "orquestracao", "label": "ORQUESTRAÇÃO", "group": "cognicao"},
    {"id": "identidade", "label": "IDENTIDADE\nSOUL", "group": "nucleo"},
    {"id": "missao", "label": "MISSÃO\nVER→ENTENDER→...", "group": "nucleo"},
    {"id": "linguagem", "label": "LINGUAGEM\nSINAL", "group": "cognicao"},
    {"id": "meta", "label": "META(X)\nLUPA", "group": "cognicao"},
    {"id": "proof", "label": "PROOF DAG\nREALITY=JUDGE", "group": "nucleo"},
    {"id": "seguranca", "label": "SEGURANÇA\nINVARIANTE", "group": "nucleo"},
    {"id": "casa", "label": "CASA\nFUNCIONAL", "group": "cognicao"},
    {"id": "reuse", "label": "REUSE\nBEFORE CREATE", "group": "governanca"},
    {"id": "onewriter", "label": "ONE WRITER\nPER SCOPE", "group": "governanca"},
    {"id": "sol", "label": "SOL\nJARVIS", "group": "nucleo"},
    {"id": "pivete", "label": "PIVETE\nHERMES", "group": "nucleo"},
    {"id": "segredo", "label": "SEGREDO\nCHEFE", "group": "nucleo"},
    {"id": "nucleo", "label": "🌀 NÚCLEO\nMAPA DO CEREBRO", "group": "nucleo"},
]

# Logical real relations (subset; do not invent for proximity)
EDGES = [
    ("segredo", "sol", "autoria"),
    ("segredo", "pivete", "autoridade"),
    ("sol", "pivete", "orquestra"),
    ("sol", "missao", "define"),
    ("sol", "nucleo", "cristaliza"),
    ("pivete", "nucleo", "executa"),
    ("missao", "linguagem", "sinal"),
    ("missao", "meta", "aplica"),
    ("meta", "proof", "falsifica"),
    ("proof", "seguranca", "invariante"),
    ("casa", "orquestracao", "compoe"),
    ("casa", "mineracao", "absorve"),
    ("aprendizados", "banda", "respira"),
    ("banda", "meta", "calibra"),
    ("identidade", "sol", "contrato"),
    ("identidade", "segredo", "humano"),
    ("reuse", "onewriter", "regra"),
    ("onewriter", "nucleo", "preserva"),
    ("exterior1", "aprendizados", "fonte"),
    ("linguagem", "casa", "sinal"),
    ("orquestracao", "sol", "partitura"),
]

def compute_spiral_positions(n_nodes, turns=4.5, a=5, b=12, scale=1.0, center_x=0, center_y=0, reverse=False):
    """Archimedean spiral: r = a + b*theta. Multiple turns, progressive inward.
    i=0 outer, increasing t inward.
    """
    positions = []
    for i in range(n_nodes):
        # Parameter t from 0 (outer) to 1 (inner)
        t = i / max(1, n_nodes - 1)
        if reverse:
            t = 1 - t
        theta = t * turns * 2 * math.pi
        r = a + b * theta
        x = center_x + scale * r * math.cos(theta)
        y = center_y + scale * r * math.sin(theta)
        positions.append((x, y))
    return positions

def main():
    n = len(NODES)
    positions = compute_spiral_positions(n, turns=5.0, a=8, b=15, scale=2.5, center_x=300, center_y=300)

    # Assign positions to nodes (order defines trajectory)
    for i, node in enumerate(NODES):
        node["x"], node["y"] = positions[i]

    # Core is last (innermost)
    core = NODES[-1]
    core["x"] = 300  # force exact center for nucleus
    core["y"] = 300
    core["r"] = 18  # larger

    svg_width = 700
    svg_height = 700
    viewbox = f"0 0 {svg_width} {svg_height}"

    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{svg_width}" height="{svg_height}" viewBox="{viewbox}" style="background:#0a0a0a;">',
        '  <defs>',
        '    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">',
        '      <path d="M0,0 L0,6 L9,3 z" fill="#a78bfa" />',
        '    </marker>',
        '  </defs>',
        '  <!-- Spiral trajectory curve (visible for CARACOL test even without edges) -->',
    ]

    # Draw faint spiral curve for recognizability
    spiral_path_d = []
    for i in range(200):
        t = i / 199.0
        theta = t * 5.0 * 2 * math.pi
        r = 8 + 15 * theta
        x = 300 + 2.5 * r * math.cos(theta)
        y = 300 + 2.5 * r * math.sin(theta)
        if i == 0:
            spiral_path_d.append(f"M {x:.1f},{y:.1f}")
        else:
            spiral_path_d.append(f"L {x:.1f},{y:.1f}")
    svg_parts.append(f'  <path d="{" ".join(spiral_path_d)}" fill="none" stroke="#4c1d95" stroke-width="1.5" stroke-opacity="0.35" stroke-dasharray="3,2" />')

    # Title / legend
    svg_parts.append('  <text x="350" y="40" fill="#c4b5fd" font-family="sans-serif" font-size="18" text-anchor="middle" font-weight="bold">🌀 MAPA DO CEREBRO — CARACOL (FORA → NÚCLEO)</text>')
    svg_parts.append('  <text x="350" y="65" fill="#a5b4fc" font-family="sans-serif" font-size="11" text-anchor="middle">Trajetória contínua • Múltiplas voltas • Posição ≠ relação semântica • Arestas reais preservadas</text>')
    svg_parts.append('  <text x="350" y="82" fill="#64748b" font-family="sans-serif" font-size="9" text-anchor="middle">TESTE_DO_CARACOL: esconda arestas → espiral visível só pelos pontos + curva?</text>')

    # Edges first (behind nodes)
    svg_parts.append('  <!-- Real edges (cross turns ok) -->')
    node_map = {n["id"]: n for n in NODES}
    for src, tgt, label in EDGES:
        if src in node_map and tgt in node_map:
            s = node_map[src]
            t = node_map[tgt]
            svg_parts.append(
                f'  <line x1="{s["x"]:.1f}" y1="{s["y"]:.1f}" x2="{t["x"]:.1f}" y2="{t["y"]:.1f}" '
                f'stroke="#64748b" stroke-width="1" stroke-opacity="0.6" />'
            )
            # optional small label mid
            mx = (s["x"] + t["x"]) / 2
            my = (s["y"] + t["y"]) / 2
            svg_parts.append(
                f'  <text x="{mx:.1f}" y="{my:.1f}" fill="#475569" font-family="sans-serif" font-size="6" text-anchor="middle">{label}</text>'
            )

    # Nodes
    svg_parts.append('  <!-- Nodes along spiral -->')
    for node in NODES:
        is_core = node["id"] == "nucleo"
        r = node.get("r", 9 if is_core else 7)
        fill = "#a78bfa" if is_core else "#e0e7ff"
        stroke = "#c026ff" if is_core else "#6366f1"
        svg_parts.append(
            f'  <circle cx="{node["x"]:.1f}" cy="{node["y"]:.1f}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{2 if is_core else 1}" />'
        )
        # Label (simple, offset to avoid overlap)
        lx = node["x"] + (12 if node["x"] > 300 else -12)
        ly = node["y"] - 8
        font_size = "8" if is_core else "6.5"
        color = "#ede9fe" if is_core else "#c7d2fe"
        svg_parts.append(
            f'  <text x="{lx:.1f}" y="{ly:.1f}" fill="{color}" font-family="sans-serif" font-size="{font_size}" text-anchor="middle" dominant-baseline="middle">{node["label"].replace(chr(10), " ")}</text>'
        )

    # Legend arrows
    svg_parts.append('  <text x="80" y="620" fill="#a5b4fc" font-family="sans-serif" font-size="10">🌀 EXTERIOR → NÚCLEO (CARACOL_FORWARD)</text>')
    svg_parts.append('  <text x="80" y="635" fill="#64748b" font-family="sans-serif" font-size="9">NÚCLEO → EXTERIOR (CARACOL_REVERSE) possível</text>')
    svg_parts.append(f'  <text x="350" y="680" fill="#475569" font-family="sans-serif" font-size="8" text-anchor="middle">Gerado {datetime.utcnow().isoformat()}Z • Demo subset • Reutiliza estrutura Casa • Sem nova arquitetura</text>')

    svg_parts.append('</svg>')

    svg = "\n".join(svg_parts)

    out_path = "docs/BRAIN/08-ARTEFATOS-VISUAIS/mapa-cerebro-caracol.svg"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(svg)

    print(f"SVG gerado: {out_path}")
    print(f"Nodes: {n}")
    print(f"Edges: {len(EDGES)}")
    print("CARACOL_VISUAL: curva + pontos em espiral contínua (5 voltas).")
    print("TESTE: abra o SVG, esconda as <line> mentalmente ou com CSS → espiral deve ser óbvia pela curva tracejada + nós alinhados.")
    print("Arestas reais preservadas (ex: segredo-sol, sol-pivete, meta-proof etc.).")
    print("Nenhuma relação inventada por proximidade visual.")

if __name__ == "__main__":
    main()
