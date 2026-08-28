# conftest — expõe módulos irmãos ao pytest de cada agente
import sys, pathlib
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
