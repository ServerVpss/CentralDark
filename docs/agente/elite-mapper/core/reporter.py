"""
core/reporter.py — Geração dos 7 relatórios Markdown
"""
import time
from pathlib import Path
from typing import Dict, List

from config import REPORTS_DIR, CATEGORIAS, ROOT_DIR
from core.scanner import ScanResult
from core.classifier import ClassificationResult, ClassifiedDir, ClassifiedFile


def _fmt_mb(b: int) -> str:
    if b >= 1024 ** 3:
        return f"{b / 1024**3:.1f} GB"
    if b >= 1024 ** 2:
        return f"{b / 1024**2:.0f} MB"
    return f"{b / 1024:.0f} KB"


def _now() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())


class Reporter:
    def __init__(self):
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    def generate_all(self, scan: ScanResult, clf: ClassificationResult) -> List[Path]:
        gerados = [
            self._resumo_executivo(scan, clf),
            self._mapeamento_estrutura(scan),
            self._lixo_deletar(clf),
            self._lixo_arquivar(clf),
            self._duplicatas(clf),
            self._proposta_estrutura(scan, clf),
            self._estatisticas(scan, clf),
        ]
        print(f"[REPORTER] {len(gerados)} relatórios gerados em {REPORTS_DIR}")
        return gerados

    # ── 00 ────────────────────────────────────────────────────────────────────

    def _resumo_executivo(self, scan: ScanResult, clf: ClassificationResult) -> Path:
        path = REPORTS_DIR / "00_RESUMO_EXECUTIVO.md"

        total_lixo = clf.all_lixo_bytes()
        pct_lixo   = total_lixo / max(scan.total_size_bytes, 1) * 100
        pct_prod   = clf.size_by_categoria("PRODUCAO") / max(scan.total_size_bytes, 1) * 100

        # Top 5 itens de lixo por tamanho
        lixo_dirs = sorted(
            [d for d in clf.dirs if d.categoria in ("LIXO_DELETAR", "LIXO_ARQUIVAR")],
            key=lambda x: x.item.size_bytes, reverse=True
        )[:5]

        lines = [
            f"# 00 — Resumo Executivo\n",
            f"> Gerado em: {_now()}  \n> Root: `{ROOT_DIR}`\n",
            "---\n",
            "## Visão Geral\n",
            f"| Item | Valor |",
            f"|------|-------|",
            f"| Total no disco | **{_fmt_mb(scan.total_size_bytes)}** |",
            f"| Total de arquivos | **{scan.total_files:,}** |",
            f"| Diretórios varridos | **{len(scan.dirs):,}** |",
            f"| Tempo de varredura | **{scan.scan_duration_s}s** |",
            f"| Lixo total identificado | **{_fmt_mb(total_lixo)}** ({pct_lixo:.0f}% do projeto) |",
            f"| Espaço a recuperar | **{_fmt_mb(total_lixo)}** |",
            f"| Código de produção | **{_fmt_mb(clf.size_by_categoria('PRODUCAO'))}** ({pct_prod:.0f}%) |\n",
            "## Distribuição por Categoria\n",
            "| Categoria | Tamanho | % |",
            "|-----------|---------|---|",
        ]

        for cat, label in CATEGORIAS.items():
            sz  = clf.size_by_categoria(cat)
            pct = sz / max(scan.total_size_bytes, 1) * 100
            lines.append(f"| {label} | {_fmt_mb(sz)} | {pct:.1f}% |")

        lines += [
            "\n## Top 5 Maiores Itens de Lixo\n",
            "| Path | Tamanho | Motivo |",
            "|------|---------|--------|",
        ]
        for d in lixo_dirs:
            lines.append(f"| `{d.item.rel_path}` | {_fmt_mb(d.item.size_bytes)} | {d.motivo} |")

        dup_count = len(clf.duplicates())
        sus_count = len([d for d in clf.dirs if d.categoria == "SUSPEITO"]) + \
                    len([f for f in clf.files if f.categoria == "SUSPEITO"])

        lines += [
            "\n## Alertas\n",
            f"- 🔴 **{len([d for d in clf.dirs if d.categoria == 'LIXO_DELETAR'])}** diretórios para deletar",
            f"- 🟡 **{len([d for d in clf.dirs if d.categoria == 'LIXO_ARQUIVAR'])}** diretórios para arquivar",
            f"- 🟠 **{dup_count}** pares de duplicatas encontrados",
            f"- ⚪ **{sus_count}** itens suspeitos para investigar",
            "\n## Próximos Passos\n",
            "1. Revisar `02_LIXO_PARA_DELETAR.md` e confirmar antes de apagar",
            "2. Mover `03_LIXO_PARA_ARQUIVAR.md` para storage externo ou deletar",
            "3. Investigar `04_DUPLICATAS_ENCONTRADAS.md`",
            "4. Aplicar `05_PROPOSTA_ESTRUTURA_NOVA.md` gradualmente",
        ]

        path.write_text("\n".join(lines), encoding="utf-8")
        return path

    # ── 01 ────────────────────────────────────────────────────────────────────

    def _mapeamento_estrutura(self, scan: ScanResult) -> Path:
        path = REPORTS_DIR / "01_MAPEAMENTO_ESTRUTURA.md"

        top_dirs = sorted(
            [d for d in scan.dirs if d.depth == 1],
            key=lambda x: x.size_bytes, reverse=True
        )

        lines = [
            f"# 01 — Mapeamento de Estrutura\n",
            f"> Gerado em: {_now()}\n",
            "## Diretórios de Primeiro Nível (por tamanho)\n",
            "| Diretório | Tamanho | Modificado há |",
            "|-----------|---------|---------------|",
        ]
        for d in top_dirs:
            lines.append(
                f"| `{d.rel_path}/` | {_fmt_mb(d.size_bytes)} | {d.age_days:.0f} dias |"
            )

        # Sub-níveis por top-dir
        lines += ["\n## Detalhamento por Área\n"]
        by_top: Dict[str, List] = {}
        for d in scan.dirs:
            if d.depth == 2:
                top = Path(d.rel_path).parts[0]
                by_top.setdefault(top, []).append(d)

        for top, sub_dirs in sorted(by_top.items()):
            sub_dirs_sorted = sorted(sub_dirs, key=lambda x: x.size_bytes, reverse=True)[:10]
            lines.append(f"\n### `{top}/`\n")
            lines.append("| Sub-diretório | Tamanho | Dias desde modificação |")
            lines.append("|---------------|---------|------------------------|")
            for d in sub_dirs_sorted:
                lines.append(
                    f"| `{Path(d.rel_path).name}/` | {_fmt_mb(d.size_bytes)} | {d.age_days:.0f}d |"
                )

        path.write_text("\n".join(lines), encoding="utf-8")
        return path

    # ── 02 ────────────────────────────────────────────────────────────────────

    def _lixo_deletar(self, clf: ClassificationResult) -> Path:
        path = REPORTS_DIR / "02_LIXO_PARA_DELETAR.md"

        lixo_dirs  = sorted(
            [d for d in clf.dirs  if d.categoria == "LIXO_DELETAR"],
            key=lambda x: x.item.size_bytes, reverse=True
        )
        lixo_files = sorted(
            [f for f in clf.files if f.categoria == "LIXO_DELETAR"],
            key=lambda x: x.item.size_bytes, reverse=True
        )
        total = sum(d.item.size_bytes for d in lixo_dirs) + \
                sum(f.item.size_bytes for f in lixo_files)

        lines = [
            f"# 02 — Lixo para Deletar\n",
            f"> Gerado em: {_now()}  \n> ⚠️ **Confirme antes de executar qualquer `rm -rf`**\n",
            f"**Total a recuperar: {_fmt_mb(total)}**\n",
            "## Diretórios ({} itens)\n".format(len(lixo_dirs)),
            "| Path | Tamanho | Idade | Motivo |",
            "|------|---------|-------|--------|",
        ]
        for d in lixo_dirs:
            lines.append(
                f"| `{d.item.rel_path}/` | {_fmt_mb(d.item.size_bytes)} | {d.item.age_days:.0f}d | {d.motivo} |"
            )

        if lixo_files:
            lines += [
                f"\n## Arquivos ({len(lixo_files)} itens)\n",
                "| Path | Tamanho | Idade | Motivo |",
                "|------|---------|-------|--------|",
            ]
            for f in lixo_files[:50]:  # máx 50 para não explodir o relatório
                lines.append(
                    f"| `{f.item.rel_path}` | {_fmt_mb(f.item.size_bytes)} | {f.item.age_days:.0f}d | {f.motivo} |"
                )
            if len(lixo_files) > 50:
                lines.append(f"\n_... e mais {len(lixo_files) - 50} arquivos (omitidos por brevidade)_")

        lines += [
            "\n## Comando de Limpeza (REVISAR ANTES!)\n",
            "```bash",
            "# Deletar TODAS as pastas de revisoes/ com mais de 7 dias:",
            f"find {ROOT_DIR}/revisoes -mindepth 1 -maxdepth 1 -mtime +7 -exec rm -rf {{}} \\;",
            "",
            "# Deletar logs antigos:",
            f"find {ROOT_DIR}/logs -name '*.log' -mtime +30 -delete",
            "```",
        ]

        path.write_text("\n".join(lines), encoding="utf-8")
        return path

    # ── 03 ────────────────────────────────────────────────────────────────────

    def _lixo_arquivar(self, clf: ClassificationResult) -> Path:
        path = REPORTS_DIR / "03_LIXO_PARA_ARQUIVAR.md"

        arq_dirs  = sorted(
            [d for d in clf.dirs  if d.categoria == "LIXO_ARQUIVAR"],
            key=lambda x: x.item.size_bytes, reverse=True
        )
        arq_files = sorted(
            [f for f in clf.files if f.categoria == "LIXO_ARQUIVAR"],
            key=lambda x: x.item.size_bytes, reverse=True
        )
        total = sum(d.item.size_bytes for d in arq_dirs) + \
                sum(f.item.size_bytes for f in arq_files)

        lines = [
            f"# 03 — Lixo para Arquivar\n",
            f"> Gerado em: {_now()}  \n> Estes itens têm valor histórico — arquivar antes de apagar.\n",
            f"**Total: {_fmt_mb(total)}**\n",
            "## Diretórios\n",
            "| Path | Tamanho | Motivo |",
            "|------|---------|--------|",
        ]
        for d in arq_dirs:
            lines.append(f"| `{d.item.rel_path}/` | {_fmt_mb(d.item.size_bytes)} | {d.motivo} |")

        if arq_files:
            lines += ["\n## Arquivos\n", "| Path | Tamanho | Motivo |", "|------|---------|--------|"]
            for f in arq_files[:30]:
                lines.append(f"| `{f.item.rel_path}` | {_fmt_mb(f.item.size_bytes)} | {f.motivo} |")

        path.write_text("\n".join(lines), encoding="utf-8")
        return path

    # ── 04 ────────────────────────────────────────────────────────────────────

    def _duplicatas(self, clf: ClassificationResult) -> Path:
        path = REPORTS_DIR / "04_DUPLICATAS_ENCONTRADAS.md"
        pairs = clf.duplicates()
        total = sum(b.item.size_bytes for _, b in pairs)  # espaço desperdiçado

        lines = [
            f"# 04 — Duplicatas Encontradas\n",
            f"> Gerado em: {_now()}\n",
            f"**{len(pairs)} pares de duplicatas — {_fmt_mb(total)} de espaço desperdiçado**\n",
            "| Arquivo | Cópia 1 | Cópia 2 | Tamanho |",
            "|---------|---------|---------|---------|",
        ]
        for a, b in pairs[:100]:
            lines.append(
                f"| `{a.item.path.name}` | `{a.item.rel_path}` | `{b.item.rel_path}` | {_fmt_mb(a.item.size_bytes)} |"
            )
        if len(pairs) > 100:
            lines.append(f"\n_... e mais {len(pairs) - 100} pares (omitidos)_")

        path.write_text("\n".join(lines), encoding="utf-8")
        return path

    # ── 05 ────────────────────────────────────────────────────────────────────

    def _proposta_estrutura(self, scan: ScanResult, clf: ClassificationResult) -> Path:
        path = REPORTS_DIR / "05_PROPOSTA_ESTRUTURA_NOVA.md"
        total_lixo = clf.all_lixo_bytes()

        lines = [
            f"# 05 — Proposta de Estrutura Nova\n",
            f"> Gerado em: {_now()}\n",
            "## Estrutura Atual (problemas)\n",
            "```",
            "/root/CentralDark/",
            "├── revisoes/          ← 849 MB / 324 pastas — TODO LIXO",
            "├── CentralDark/       ← Pasta com mesmo nome que root — SUSPEITO",
            "├── quarantine/        ← Código morto — ARQUIVAR",
            "├── apps/              ← 13 GB — node_modules inflam muito",
            "├── logs/              ← Acumulando sem rotação",
            "└── actions-runner/    ← 574 MB — necessário mas pesado",
            "```\n",
            "## Estrutura Proposta (após limpeza)\n",
            "```",
            "/root/CentralDark/",
            "├── apps/              ← Código das aplicações (limpo de node_modules desnecessários)",
            "├── docs/              ← Documentação + agentes",
            "│   └── agente/        ← Pasta oficial de agentes (elite-mapper, infra-recovery...)",
            "├── infra/             ← Caddy, Docker, configurações de infra",
            "├── scripts/           ← Automações, crons, healthchecks",
            "├── secrets/           ← Credenciais (nunca tocar)",
            "├── security/          ← Políticas de segurança",
            "├── skills/            ← Skills da IA",
            "└── supabase/          ← Configurações do banco",
            "",
            "# REMOVIDOS:",
            "# ✗ revisoes/         → DELETAR (849 MB recuperados)",
            "# ✗ quarantine/       → ARQUIVAR em storage externo",
            "# ✗ CentralDark/      → INVESTIGAR (provavelmente apagar)",
            "# ✗ logs/*.log antigos → DELETAR",
            "```\n",
            "## Impacto Esperado\n",
            f"| Métrica | Antes | Depois |",
            f"|---------|-------|--------|",
            f"| Espaço em disco | ~22 GB | ~{(scan.total_size_bytes - total_lixo) / 1024**3:.0f} GB |",
            f"| Pastas de revisão | 324 | 0 |",
            f"| Clareza da estrutura | Baixa | Alta |",
            "\n## Ações Recomendadas (em ordem)\n",
            "1. `rm -rf /root/CentralDark/revisoes/*` — **849 MB imediatos**",
            "2. Investigar `/root/CentralDark/CentralDark/` — pode ser clone duplicado",
            "3. Arquivar `/root/CentralDark/quarantine/` para storage externo",
            "4. Configurar rotação de logs em `/root/CentralDark/logs/`",
            "5. Revisar `apps/*/node_modules/` — instalar só o necessário",
        ]

        path.write_text("\n".join(lines), encoding="utf-8")
        return path

    # ── 06 ────────────────────────────────────────────────────────────────────

    def _estatisticas(self, scan: ScanResult, clf: ClassificationResult) -> Path:
        path = REPORTS_DIR / "06_ESTATISTICAS.md"

        lines = [
            f"# 06 — Estatísticas\n",
            f"> Gerado em: {_now()}\n",
            "## Arquivos por Categoria\n",
            "| Categoria | Dirs | Arquivos | Tamanho |",
            "|-----------|------|----------|---------|",
        ]
        for cat, label in CATEGORIAS.items():
            n_dirs  = len([d for d in clf.dirs  if d.categoria == cat])
            n_files = len([f for f in clf.files if f.categoria == cat])
            sz      = clf.size_by_categoria(cat)
            lines.append(f"| {label} | {n_dirs} | {n_files} | {_fmt_mb(sz)} |")

        # Gráfico ASCII de barras por categoria
        lines += ["\n## Distribuição (gráfico ASCII)\n", "```"]
        max_size = max((clf.size_by_categoria(c) for c in CATEGORIAS), default=1)
        bar_width = 40
        for cat, label in CATEGORIAS.items():
            sz   = clf.size_by_categoria(cat)
            bars = int(sz / max_size * bar_width)
            lines.append(f"{label[:20]:<20} {'█' * bars} {_fmt_mb(sz)}")
        lines.append("```\n")

        # Top extensões
        ext_count: Dict[str, int] = {}
        ext_size:  Dict[str, int] = {}
        for f in clf.files:
            e = f.item.extension or "(sem ext)"
            ext_count[e] = ext_count.get(e, 0) + 1
            ext_size[e]  = ext_size.get(e, 0) + f.item.size_bytes

        top_ext = sorted(ext_count.items(), key=lambda x: x[1], reverse=True)[:15]
        lines += [
            "## Top 15 Extensões por Quantidade\n",
            "| Extensão | Arquivos | Tamanho total |",
            "|----------|----------|---------------|",
        ]
        for ext, cnt in top_ext:
            lines.append(f"| `{ext}` | {cnt:,} | {_fmt_mb(ext_size.get(ext, 0))} |")

        lines += [
            "\n## Resumo do Scan\n",
            f"- **Tempo de varredura:** {scan.scan_duration_s}s",
            f"- **Diretórios ignorados (node_modules/etc):** {len(scan.skipped_dirs)}",
            f"- **Duplicatas detectadas:** {len(clf.duplicates())} pares",
        ]

        path.write_text("\n".join(lines), encoding="utf-8")
        return path
