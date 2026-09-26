# Hermes telegram adapter: loader + Path

## Loader
Avoid:
```python
spec = importlib.util.spec_from_file_location(...)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)  # loader may be None → NoneType.__dict__
```

Prefer:
```python
sys.path.insert(0, menu_dir)
import combo_menu_engine as mod
mod = importlib.reload(mod)
```
or `runpy.run_path(path, run_name="combo_menu_engine")`.

## Path alias
If file has `from pathlib import Path as _Path`, bare `Path` inside helpers fails.
Use `from pathlib import Path as ComboPath` inside the helper.

## After edit
Restart pivete gateway; prove with `/combo_potencia`, not only unit tests.
