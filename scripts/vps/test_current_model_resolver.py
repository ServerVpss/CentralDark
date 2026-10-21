#!/usr/bin/env python3
import pytest
import current_model_resolver as r


def test_inherits_same_user_kylin_runtime_session_environment(monkeypatch, tmp_path):
    proc = tmp_path / "proc"
    runtime = proc / "42"
    runtime.mkdir(parents=True)
    (runtime / "cmdline").write_bytes(b"/usr/bin/kylin-ai-runtime\0--service\0")
    (runtime / "environ").write_bytes(
        b"DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/0/bus\0"
        b"XDG_RUNTIME_DIR=/run/user/0\0DISPLAY=:0\0IGNORED_SECRET=nope\0"
    )
    monkeypatch.delenv("DBUS_SESSION_BUS_ADDRESS", raising=False)
    monkeypatch.delenv("XDG_RUNTIME_DIR", raising=False)
    monkeypatch.delenv("DISPLAY", raising=False)
    monkeypatch.setattr(r.os, "getuid", lambda: runtime.stat().st_uid)

    inherited = r.inherit_kylin_runtime_environment(proc)

    assert inherited == {
        "DBUS_SESSION_BUS_ADDRESS": "unix:path=/run/user/0/bus",
        "XDG_RUNTIME_DIR": "/run/user/0",
        "DISPLAY": ":0",
    }
    assert "IGNORED_SECRET" not in r.os.environ


def test_does_not_override_existing_session_environment(monkeypatch, tmp_path):
    monkeypatch.setenv("DBUS_SESSION_BUS_ADDRESS", "unix:path=/already/bus")
    monkeypatch.setenv("XDG_RUNTIME_DIR", "/already")
    assert r.inherit_kylin_runtime_environment(tmp_path / "missing") == {}

def test_env_binding_wins(monkeypatch, tmp_path):
    monkeypatch.setenv("CENTRALDARK_MODEL_BINDING_STATE", "off")
    monkeypatch.setenv("CENTRALDARK_LOCAL_MODEL", "selected-model")
    monkeypatch.setattr(r, "_gsettings_get", lambda *_: "should-not-be-used")
    assert r.resolve_current_model() == "selected-model"

def test_current_kylin_selection_beats_stale_hermes_catalog(monkeypatch, tmp_path):
    config = tmp_path / "config.yaml"
    config.write_text("custom_providers:\n  - name: centraldark-kylin\n    models:\n      stale-model: {}\n")
    monkeypatch.setenv("HERMES_CONFIG", str(config))
    monkeypatch.setenv("CENTRALDARK_MODEL_BINDING_STATE", "off")
    monkeypatch.delenv("CENTRALDARK_LOCAL_MODEL", raising=False)
    values = {
        ("com.kylin.aisdk.model.cloud", "enabled"): "true",
        ("com.kylin.aisdk.model.cloud", "priority"): "1",
        ("com.kylin.aisdk.model.cloud", "nlp"): "'{\\n\\t\\\"currentModel\\\" : \\\"kylin-qwen-plus\\\"\\n}\\n'",
    }
    monkeypatch.setattr(r, "_gsettings_get", lambda schema, key: values.get((schema, key), ""))
    details = r.resolve_current_model_details()
    assert details["model"] == "kylin-qwen-plus"
    assert details["source"] == "gsettings:com.kylin.aisdk.model.cloud.nlp"
    assert details["execution_class"] == "cloud"

def test_hermes_catalog_is_fallback(monkeypatch, tmp_path):
    config = tmp_path / "config.yaml"
    config.write_text("custom_providers:\n  - name: centraldark-kylin\n    models:\n      catalog-model: {}\n")
    monkeypatch.setenv("HERMES_CONFIG", str(config))
    monkeypatch.setenv("CENTRALDARK_MODEL_BINDING_STATE", "off")
    monkeypatch.delenv("CENTRALDARK_LOCAL_MODEL", raising=False)
    monkeypatch.setattr(r, "_gsettings_get", lambda *_: "")
    assert r.resolve_current_model() == "catalog-model"

def test_unresolved_fails_closed(monkeypatch, tmp_path):
    config = tmp_path / "config.yaml"
    config.write_text("custom_providers:\n  - name: other\n    models:\n      unrelated: {}\n")
    monkeypatch.setenv("HERMES_CONFIG", str(config))
    monkeypatch.setenv("CENTRALDARK_MODEL_BINDING_STATE", "off")
    monkeypatch.delenv("CENTRALDARK_LOCAL_MODEL", raising=False)
    monkeypatch.setattr(r, "_gsettings_get", lambda *_: "")
    with pytest.raises(RuntimeError, match="CURRENT_LOCAL_MODEL_UNRESOLVED"):
        r.resolve_current_model()
