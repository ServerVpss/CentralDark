"""
core/classifier.py — Engine de classificação cirúrgica
"""
import time
from dataclasses import dataclass
from pathlib import Path
from typing import List, Dict, Tuple

from config import (
    ROOT_DIR, REVISAO_MAX_DAYS, LOG_MAX_DAYS, NEVER_DELETE_DIRS, CATEGORIAS
)
from core.scanner import ScanResult, DirItem, FileItem


CATEGORIA_KEYS = list(CATEGORIAS.keys())


@dataclass
class ClassifiedDir:
    item: DirItem
    categoria: str
    motivo: str


@dataclass
class ClassifiedFile:
    item: FileItem
    categoria: str
    motivo: str


@dataclass
class ClassificationResult:
    dirs:  List[ClassifiedDir]
    files: List[ClassifiedFile]

    def by_categoria(self, cat: str) -> List:
        return [d for d in self.dirs if d.categoria == cat] + \
               [f for f in self.files if f.categoria == cat]

    def size_by_categoria(self, cat: str) -> int:
        size = sum(d.item.size_bytes for d in self.dirs if d.categoria == cat)
        size += sum(f.item.size_bytes for f in self.files if f.categoria == cat)
        return size

    def all_lixo_bytes(self) -> int:
        return self.size_by_categoria("LIXO_DELETAR") + self.size_by_categoria("LIXO_ARQUIVAR")

    def duplicates(self) -> List[Tuple[ClassifiedFile, ClassifiedFile]]:
        """Pares de arquivos duplicados (mesmo nome + mesmo tamanho)."""
        seen: Dict[Tuple[str, int], ClassifiedFile] = {}
        pairs = []
        for cf in self.files:
            key = (cf.item.path.name, cf.item.size_bytes)
            if key in seen and cf.item.size_bytes > 0:
                pairs.append((seen[key], cf))
            else:
                seen[key] = cf
        return pairs


class Classifier:
    def classify(self, scan: ScanResult) -> ClassificationResult:
        classified_dirs  = [self._classify_dir(d)  for d in scan.dirs]
        classified_files = [self._classify_file(f) for f in scan.files]
        return ClassificationResult(dirs=classified_dirs, files=classified_files)

    # ── Classificação de diretórios ───────────────────────────────────────────

    def _classify_dir(self, d: DirItem) -> ClassifiedDir:
        rel = d.rel_path
        parts = Path(rel).parts
        top = parts[0] if parts else rel

        # Proteção absoluta
        if top in NEVER_DELETE_DIRS:
            return ClassifiedDir(d, "PRODUCAO", f"Diretório protegido: {top}")

        # revisoes/ — sessões antigas de IA
        if top == "revisoes":
            if d.depth == 1:
                return ClassifiedDir(d, "LIXO_DELETAR",
                    f"Pasta de revisões: {d.age_days:.0f} dias sem modificação, {d.size_mb:.0f} MB")
            if d.age_days > REVISAO_MAX_DAYS:
                return ClassifiedDir(d, "LIXO_DELETAR",
                    f"Sessão de revisão antiga: {d.age_days:.0f} dias")
            return ClassifiedDir(d, "UTIL", "Revisão recente (< 7 dias)")

        # quarantine/
        if top == "quarantine":
            return ClassifiedDir(d, "LIXO_ARQUIVAR", "Código em quarentena — arquivar antes de apagar")

        # logs/
        if top == "logs":
            if d.age_days > LOG_MAX_DAYS:
                return ClassifiedDir(d, "LIXO_DELETAR", f"Pasta de logs antiga: {d.age_days:.0f} dias")
            return ClassifiedDir(d, "UTIL", "Logs recentes")

        # CentralDark/CentralDark — pasta duplicada suspeita
        if rel == "CentralDark" or (len(parts) > 1 and parts[0] == "CentralDark" and parts[1] == "CentralDark"):
            return ClassifiedDir(d, "SUSPEITO", "Diretório com mesmo nome que o root — investigar")

        # node_modules (já skippados no scanner, mas podem aparecer como dir)
        if "node_modules" in parts:
            return ClassifiedDir(d, "UTIL", f"node_modules — {d.size_mb:.0f} MB (necessário)")

        # actions-runner
        if top == "actions-runner":
            return ClassifiedDir(d, "UTIL", "GitHub Actions runner — não tocar")

        # .github
        if top == ".github":
            return ClassifiedDir(d, "PRODUCAO", "Configurações GitHub Actions")

        # docs/
        if top == "docs":
            return ClassifiedDir(d, "PRODUCAO", "Documentação ativa")

        # apps/ — produção
        if top == "apps":
            # dist/ sem package.json no pai = build órfão
            if parts[-1] == "dist" and not (d.path.parent / "package.json").exists():
                return ClassifiedDir(d, "LIXO_ARQUIVAR", "Build dist/ sem package.json no pai — órfão")
            return ClassifiedDir(d, "PRODUCAO", "Código de aplicação")

        # scripts/
        if top == "scripts":
            return ClassifiedDir(d, "PRODUCAO", "Scripts de automação")

        # infra/
        if top == "infra":
            return ClassifiedDir(d, "PRODUCAO", "Infraestrutura e configurações")

        # src/
        if top == "src":
            return ClassifiedDir(d, "PRODUCAO", "Código fonte")

        # skills/
        if top == "skills":
            return ClassifiedDir(d, "UTIL", "Skills do agente IA")

        # tools/
        if top == "tools":
            return ClassifiedDir(d, "UTIL", "Ferramentas auxiliares")

        # guarda/ (segurança)
        if top == "guarda":
            return ClassifiedDir(d, "PRODUCAO", "Sistema de guarda/segurança")

        # central-horario/
        if top == "central-horario":
            return ClassifiedDir(d, "UTIL", "Módulo de horário")

        # supabase/
        if top == "supabase":
            return ClassifiedDir(d, "PRODUCAO", "Configurações Supabase")

        # security/
        if top == "security":
            return ClassifiedDir(d, "PRODUCAO", "Políticas de segurança")

        # .agents/, .claude/, .lovable/
        if top.startswith("."):
            return ClassifiedDir(d, "UTIL", f"Config oculta: {top}")

        return ClassifiedDir(d, "UTIL", "Diretório sem regra específica — revisar")

    # ── Classificação de arquivos ─────────────────────────────────────────────

    def _classify_file(self, f: FileItem) -> ClassifiedFile:
        rel   = f.rel_path
        parts = Path(rel).parts
        top   = parts[0] if parts else rel
        name  = f.path.name
        ext   = f.extension

        # Proteção absoluta
        if top in NEVER_DELETE_DIRS:
            return ClassifiedFile(f, "PRODUCAO", f"Arquivo protegido em {top}/")

        # Arquivo de secrets/env
        if ext in (".env", ".key", ".pem") or "secrets" in rel:
            return ClassifiedFile(f, "PRODUCAO", "Secrets/credenciais — nunca apagar")

        # revisoes/
        if top == "revisoes":
            if f.age_days > REVISAO_MAX_DAYS:
                return ClassifiedFile(f, "LIXO_DELETAR", f"Arquivo de revisão antiga ({f.age_days:.0f} dias)")
            return ClassifiedFile(f, "UTIL", "Revisão recente")

        # Logs velhos
        if ext == ".log" and f.age_days > LOG_MAX_DAYS:
            return ClassifiedFile(f, "LIXO_DELETAR", f"Log antigo: {f.age_days:.0f} dias")

        # Backups e temporários
        if ext in (".bak", ".tmp", ".swp") or ".backup." in name:
            return ClassifiedFile(f, "LIXO_DELETAR", f"Arquivo temporário/backup: {ext}")

        # Arquivos comprimidos antigos de log
        if ext in (".gz", ".zip") and "log" in name.lower() and f.age_days > 7:
            return ClassifiedFile(f, "LIXO_DELETAR", f"Log comprimido antigo: {f.age_days:.0f} dias")

        # Arquivo muito grande e suspeito (> 100 MB)
        if f.size_mb > 100 and ext not in (".db", ".sqlite", ".sqlite3"):
            return ClassifiedFile(f, "SUSPEITO", f"Arquivo grande inesperado: {f.size_mb:.0f} MB")

        # Arquivo sem extensão e grande
        if not ext and f.size_mb > 10:
            return ClassifiedFile(f, "SUSPEITO", f"Sem extensão e grande: {f.size_mb:.0f} MB")

        # quarantine/
        if top == "quarantine":
            return ClassifiedFile(f, "LIXO_ARQUIVAR", "Em quarentena")

        # Padrões de produção
        if ext in (".py", ".ts", ".js", ".mjs", ".cjs", ".tsx", ".jsx", ".sh", ".yml", ".yaml", ".json", ".md", ".toml", ".lock"):
            return ClassifiedFile(f, "PRODUCAO", "Código/config de produção")

        return ClassifiedFile(f, "UTIL", "Arquivo sem regra específica")
