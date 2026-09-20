"""
core/scanner.py — Varredura recursiva do filesystem
"""
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Dict

from config import ROOT_DIR, SKIP_SUBTREE_DIRS


@dataclass
class DirItem:
    path: Path
    size_bytes: int
    mtime: float          # unix timestamp
    file_count: int
    depth: int            # profundidade a partir do ROOT_DIR
    rel_path: str         # path relativo ao ROOT_DIR

    @property
    def size_mb(self) -> float:
        return self.size_bytes / (1024 * 1024)

    @property
    def age_days(self) -> float:
        return (time.time() - self.mtime) / 86400

    @property
    def top_level(self) -> str:
        """Nome do diretório de primeiro nível abaixo de ROOT_DIR."""
        parts = Path(self.rel_path).parts
        return parts[0] if parts else self.rel_path


@dataclass
class FileItem:
    path: Path
    size_bytes: int
    mtime: float
    extension: str
    rel_path: str

    @property
    def size_mb(self) -> float:
        return self.size_bytes / (1024 * 1024)

    @property
    def age_days(self) -> float:
        return (time.time() - self.mtime) / 86400


@dataclass
class ScanResult:
    root: Path
    dirs: List[DirItem] = field(default_factory=list)
    files: List[FileItem] = field(default_factory=list)
    total_size_bytes: int = 0
    total_files: int = 0
    skipped_dirs: List[str] = field(default_factory=list)
    scan_duration_s: float = 0.0

    @property
    def total_size_mb(self) -> float:
        return self.total_size_bytes / (1024 * 1024)

    @property
    def total_size_gb(self) -> float:
        return self.total_size_bytes / (1024 ** 3)


class Scanner:
    def __init__(self, root: Path = ROOT_DIR, verbose: bool = True):
        self.root    = root
        self.verbose = verbose

    def scan(self) -> ScanResult:
        t0     = time.time()
        result = ScanResult(root=self.root)

        if self.verbose:
            print(f"[SCANNER] Iniciando varredura em {self.root}")

        self._walk(self.root, result, depth=0)

        result.scan_duration_s = round(time.time() - t0, 1)
        if self.verbose:
            print(
                f"[SCANNER] Concluído em {result.scan_duration_s}s — "
                f"{len(result.dirs)} dirs, {result.total_files} arquivos, "
                f"{result.total_size_gb:.1f} GB"
            )
        return result

    def _walk(self, current: Path, result: ScanResult, depth: int):
        try:
            entries = list(os.scandir(current))
        except PermissionError:
            return

        dir_size   = 0
        dir_files  = 0
        latest_mtime = 0.0

        for entry in entries:
            try:
                stat = entry.stat(follow_symlinks=False)
            except OSError:
                continue

            if entry.is_symlink():
                continue

            if entry.is_file(follow_symlinks=False):
                size  = stat.st_size
                mtime = stat.st_mtime
                ext   = Path(entry.name).suffix.lower()
                rel   = str(Path(entry.path).relative_to(self.root))

                fi = FileItem(
                    path=Path(entry.path),
                    size_bytes=size,
                    mtime=mtime,
                    extension=ext,
                    rel_path=rel,
                )
                result.files.append(fi)
                result.total_size_bytes += size
                result.total_files      += 1
                dir_size  += size
                dir_files += 1
                if mtime > latest_mtime:
                    latest_mtime = mtime

            elif entry.is_dir(follow_symlinks=False):
                name = entry.name
                rel  = str(Path(entry.path).relative_to(self.root))

                if name in SKIP_SUBTREE_DIRS:
                    # Mede tamanho total mas não percorre filhos individualmente
                    sub_size = self._measure_dir(Path(entry.path))
                    result.total_size_bytes += sub_size
                    result.skipped_dirs.append(rel)
                    di = DirItem(
                        path=Path(entry.path),
                        size_bytes=sub_size,
                        mtime=stat.st_mtime,
                        file_count=-1,  # desconhecido (não percorrido)
                        depth=depth + 1,
                        rel_path=rel,
                    )
                    result.dirs.append(di)
                    dir_size += sub_size
                    continue

                # Percorrer recursivamente
                sub_before = result.total_size_bytes
                self._walk(Path(entry.path), result, depth + 1)
                sub_size = result.total_size_bytes - sub_before
                dir_size += sub_size

                di = DirItem(
                    path=Path(entry.path),
                    size_bytes=sub_size,
                    mtime=stat.st_mtime,
                    file_count=0,
                    depth=depth + 1,
                    rel_path=rel,
                )
                result.dirs.append(di)

    @staticmethod
    def _measure_dir(path: Path) -> int:
        total = 0
        try:
            for dirpath, _, filenames in os.walk(path):
                for f in filenames:
                    try:
                        total += os.path.getsize(os.path.join(dirpath, f))
                    except OSError:
                        pass
        except PermissionError:
            pass
        return total

    @staticmethod
    def top_level_summary(result: ScanResult) -> Dict[str, int]:
        """Tamanho por diretório de primeiro nível."""
        summary: Dict[str, int] = {}
        for d in result.dirs:
            if d.depth == 1:
                summary[d.rel_path] = d.size_bytes
        return dict(sorted(summary.items(), key=lambda x: x[1], reverse=True))
