"""Adiciona o diretório pai ao sys.path para importar classificador.py."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
