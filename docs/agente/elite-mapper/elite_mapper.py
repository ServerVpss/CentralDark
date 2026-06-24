#!/usr/bin/env python3
"""
elite_mapper.py — Agente de Mapeamento e Limpeza Cirúrgica do CentralDark

Uso:
  python3 elite_mapper.py                  → scan completo + relatórios + Telegram
  python3 elite_mapper.py --dry-run        → scan + relatórios (sem Telegram)
  python3 elite_mapper.py --report-only    → só regera relatórios (usa scan anterior)
  python3 elite_mapper.py --telegram-guide → exibe guia de integração com o bot
"""
import argparse
import sys
import time
from pathlib import Path

# Adiciona o diretório do agente ao path para imports relativos
sys.path.insert(0, str(Path(__file__).parent))

from config import ROOT_DIR, REPORTS_DIR, CATEGORIAS
from core.scanner    import Scanner
from core.classifier import Classifier
from core.reporter   import Reporter
from integrations.telegram_notifier import TelegramNotifier
from integrations.telegram_menu     import print_integration_guide


BANNER = """
╔══════════════════════════════════════════════════╗
║       CentralDark — Elite Mapper v1.0            ║
║   Mapeamento e Limpeza Cirúrgica do Projeto      ║
╚══════════════════════════════════════════════════╝
"""


def fmt_mb(b: int) -> str:
    if b >= 1024 ** 3: return f"{b / 1024**3:.1f} GB"
    if b >= 1024 ** 2: return f"{b / 1024**2:.0f} MB"
    return f"{b / 1024:.0f} KB"


def run(dry_run: bool = False, verbose: bool = True) -> dict:
    print(BANNER)
    t0 = time.time()

    notifier   = TelegramNotifier()
    scanner    = Scanner(root=ROOT_DIR, verbose=verbose)
    classifier = Classifier()
    reporter   = Reporter()

    # 1. Notifica início
    if not dry_run:
        notifier.notify_start()

    # 2. Scan
    print(f"\n[1/4] Varrendo {ROOT_DIR} ...")
    scan = scanner.scan()

    # 3. Classificação
    print(f"\n[2/4] Classificando {len(scan.dirs)} diretórios e {len(scan.files)} arquivos ...")
    clf = classifier.classify(scan)

    # 4. Relatórios
    print(f"\n[3/4] Gerando relatórios em {REPORTS_DIR} ...")
    reporter.generate_all(scan, clf)

    # 5. Estatísticas
    lixo_bytes  = clf.all_lixo_bytes()
    duplicatas  = len(clf.duplicates())
    suspeitos   = (len([d for d in clf.dirs  if d.categoria == "SUSPEITO"]) +
                   len([f for f in clf.files if f.categoria == "SUSPEITO"]))
    duracao     = round(time.time() - t0, 1)

    stats = {
        "total_gb":    scan.total_size_gb,
        "total_files": scan.total_files,
        "lixo_total_mb": lixo_bytes / (1024 ** 2),
        "duplicatas":  duplicatas,
        "suspeitos":   suspeitos,
        "duracao_s":   duracao,
    }

    # 6. Notifica conclusão (inteligente — só se relevante)
    if not dry_run:
        notifier.notify_complete(stats)

    # 7. Resumo no terminal
    print(f"\n{'═'*52}")
    print(f"  ELITE MAPPER — RESUMO FINAL")
    print(f"{'═'*52}")
    print(f"  Root:          {ROOT_DIR}")
    print(f"  Total:         {scan.total_size_gb:.1f} GB  ({scan.total_files:,} arquivos)")
    print(f"  Duração:       {duracao}s\n")

    for cat, label in CATEGORIAS.items():
        sz = clf.size_by_categoria(cat)
        n  = (len([d for d in clf.dirs  if d.categoria == cat]) +
              len([f for f in clf.files if f.categoria == cat]))
        print(f"  {label:<30} {fmt_mb(sz):>10}  ({n} itens)")

    print(f"\n  ⚠️  Lixo total:   {fmt_mb(lixo_bytes)}  ← pode ser recuperado")
    print(f"  🟠  Duplicatas:   {duplicatas} pares")
    print(f"  ⚪  Suspeitos:    {suspeitos} itens")
    print(f"\n  📄 Relatórios:  {REPORTS_DIR}")
    print(f"{'═'*52}\n")

    return stats


def main():
    parser = argparse.ArgumentParser(
        description="Elite Mapper — Mapeamento e Limpeza Cirúrgica do CentralDark"
    )
    parser.add_argument("--dry-run",        action="store_true",
                        help="Roda scan e gera relatórios, mas não notifica Telegram")
    parser.add_argument("--report-only",    action="store_true",
                        help="Só regera relatórios do último scan (não implementado ainda)")
    parser.add_argument("--telegram-guide", action="store_true",
                        help="Exibe guia de integração com o bot Telegram")
    parser.add_argument("--quiet",          action="store_true",
                        help="Modo silencioso (menos output no terminal)")
    args = parser.parse_args()

    if args.telegram_guide:
        print_integration_guide()
        return

    if args.report_only:
        print("⚠️  --report-only ainda não implementado. Rode sem flags para scan completo.")
        sys.exit(1)

    run(dry_run=args.dry_run, verbose=not args.quiet)


if __name__ == "__main__":
    main()
