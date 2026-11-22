"""PM caches are writable; shipped dependency environments stay immutable."""

from __future__ import annotations



import pm.packages as pkgs





def test_uv_cache_dir_seeds_from_payload(monkeypatch, tmp_path):
    home = tmp_path / "home"
    home.mkdir()
    payload = tmp_path / "payload"
    (payload / "uv-cache" / "wheels-v5").mkdir(parents=True)
    (payload / "uv-cache" / "wheels-v5" / "some.pkg").write_text("x", encoding="utf-8")

    import hermes_constants

    monkeypatch.setattr(hermes_constants, "get_default_hermes_root", lambda: home)
    import pm.paths as paths_mod

    monkeypatch.setattr(paths_mod, "store_root", lambda: payload / "tools")

    machine = pkgs.uv_cache_dir()
    assert machine == home / "cache" / "uv"
    # seed copied out
    assert (machine / "wheels-v5" / "some.pkg").read_text(encoding="utf-8") == "x"
    # seeded marker written → second call doesn't re-copy
    assert (machine / ".seeded").is_file()
    (payload / "uv-cache" / "wheels-v5" / "some.pkg").write_text("changed", encoding="utf-8")
    pkgs.uv_cache_dir()
    assert (machine / "wheels-v5" / "some.pkg").read_text(encoding="utf-8") == "x"


def test_uv_cache_dir_cold_machine_no_payload(monkeypatch, tmp_path):
    home = tmp_path / "home"
    home.mkdir()
    import hermes_constants

    monkeypatch.setattr(hermes_constants, "get_default_hermes_root", lambda: home)
    import pm.paths as paths_mod

    monkeypatch.setattr(paths_mod, "store_root", lambda: tmp_path / "nowhere" / "tools")

    machine = pkgs.uv_cache_dir()
    assert machine == home / "cache" / "uv"
    assert (machine / ".seeded").is_file()


def test_uv_cache_dir_recovers_dangling_windows_junction_without_replacing_it(monkeypatch, tmp_path):
    """uv receives the junction target; a missing target is recreated in place."""
    home = tmp_path / "home"
    slot = home / "cache" / "uv"
    slot.parent.mkdir(parents=True)
    target = tmp_path / "relocated" / "uv"

    import hermes_constants
    import pm.paths as paths_mod

    monkeypatch.setattr(hermes_constants, "get_default_hermes_root", lambda: home)
    monkeypatch.setattr(paths_mod, "store_root", lambda: tmp_path / "no-payload" / "tools")
    monkeypatch.setattr(pkgs, "is_junction", lambda path: path == slot)
    readlink = pkgs.os.readlink
    monkeypatch.setattr(pkgs.os, "readlink", lambda path: str(target) if path == slot else readlink(path))

    assert not target.exists()
    cache = pkgs.uv_cache_dir()

    assert cache == target
    assert cache.is_dir()
    assert (cache / ".seeded").is_file()
    # The alias is not replaced or deleted by this operation.
    assert not slot.exists()


def test_bundle_uses_shipped_environment_until_an_extension_is_committed(monkeypatch, tmp_path):
    import json
    from pm import paths

    home = tmp_path / "home"
    monkeypatch.setenv("HERMES_HOME", str(home))
    payload = tmp_path / "payload"
    core = payload / "hermes-agent"
    core.mkdir(parents=True)
    shipped = payload / "venv"
    shipped.mkdir()
    (payload / "manifest.json").write_text(json.dumps({"repo": "hermes-agent", "venv": "venv"}))
    monkeypatch.setattr(paths, "repo_root", lambda: core)

    assert pkgs.Venv().venv_dir() == shipped
    assert not home.exists(), "selecting shipped dependencies must not copy or mutate them"
