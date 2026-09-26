from pathlib import Path
import subprocess, sys, yaml
ROOT=Path(__file__).resolve().parents[1]

def cfg(): return yaml.safe_load((ROOT/'02-CENTRALDARK-MASTER.yml').read_text(encoding='utf-8'))

def test_house_documentation_contract_present():
    d=cfg()['house_documentation_standard']
    assert d['human_language']=='pt-BR'
    assert d['code_identifiers']=='ENGLISH'
    assert d['technical_view_required'] is True
    assert d['mental_map_required'] is True
    assert d['mental_map_may_replace_technical_view'] is False
    assert d['material_line_traceability_required'] is True
    assert d['comment_every_line_required'] is False
    assert d['missing_doc_is_pass'] is False

def test_communication_mode_is_serious_by_default():
    d=cfg()['communication_modes']
    assert d['default']=='TRABALHO'
    assert d['resenha_requires_explicit_operator_intent'] is True
    assert d['work_mode']['parrot_request'] is False

def test_plug_play_contract_is_fail_closed():
    d=cfg()['plug_play_capability_package']
    assert d['install_to_guessed_path'] is False
    assert d['parallel_owner_allowed'] is False
    assert d['raw_secret_allowed'] is False
    assert d['documentation_gate_required'] is True

def test_hermes_bridge_preserves_shell():
    d=cfg()['hermes_upstream_bridge']
    assert d['centraldark_cli_is_operator_owned_shell'] is True
    assert d['blind_upstream_merge_forbidden'] is True
    assert d['check_before_apply'] is True
    assert d['sandbox_before_promotion'] is True
    assert d['rollback_required'] is True

def test_python_documentation_scanner():
    fixture=ROOT/'tests'/'_tmp_doc_fixture.py'
    fixture.write_text('def hello(name):\n    return name\n\nclass World:\n    pass\n',encoding='utf-8')
    try:
        p=subprocess.run([sys.executable,str(ROOT/'scripts'/'audit_code_documentation.py'),str(fixture.parent)],capture_output=True,text=True)
        # O diretório de testes contém JS/TS? não; parser Python deve conseguir produzir relatório.
        assert 'hello' in p.stdout
        assert 'World' in p.stdout
    finally:
        fixture.unlink(missing_ok=True)

def test_docs_and_toolchain_files_exist():
    for rel in [
        'docs/CODE-DOCUMENTATION-HOUSE-STANDARD.yml',
        'docs/COMMUNICATION-MODES.yml',
        'docs/GITHUB-PROFILE-CONTINUOUS-README.md',
        'docs/JS-TS-RUST-TOOLCHAIN-CANDIDATES-2026-08-31.yml',
        'plugin/capability-package-contract.yml',
        'integration/documentation-upstream-hermes.yml',
        'architecture/21-DOCUMENTACAO-DUPLA-E-HERMES-UPSTREAM-BRIDGE.md',
        'diagrams/19-doc-gate-hermes-upstream-bridge.mmd',
        'ui/admin/documentation-code-map.json',
    ]:
        assert (ROOT/rel).exists(), rel
