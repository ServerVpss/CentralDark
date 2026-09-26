#!/usr/bin/env python
import sys, time
sys.path.insert(0, r'C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Lib\site-packages')
from pathlib import Path
router_dir = Path(r'E:\CentralDark\copilot-worktrees\CentralDark\feat-semantic-triggers-graphrag-fixedpoint-main90c4\apps\modulos\elite-gateway\scripts')
sys.path.insert(0, str(router_dir))
spec = importlib.util.spec_from_file_location(
    'centraldark_omni_router',
    str(router_dir / 'centraldark_omni_router.py'),
    submodule_search_locations=[str(router_dir)],
)
import importlib.util
mod = importlib.util.module_from_spec(spec)
sys.modules['centraldark_omni_router'] = mod
spec.loader.exec_module(mod)
from uvicorn import Config, Server
cfg = Config(mod.app, host='127.0.0.1', port=8099, log_level='warning')
srv = Server(cfg)
try:
    srv.install_signal_handlers()
except Exception as e:
    print('sh:', e, flush=True)

print('router: uvicorn starting on 127.0.0.1:8099', flush=True)
srv.run()
print('router: uvicorn exited', flush=True)
