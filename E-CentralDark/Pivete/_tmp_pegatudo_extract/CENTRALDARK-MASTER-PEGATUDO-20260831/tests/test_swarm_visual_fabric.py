from pathlib import Path
import json
import yaml

ROOT = Path(__file__).resolve().parents[1]


def test_swarm_fanout_is_bounded_and_read_only_mirrors():
    c = yaml.safe_load((ROOT/'integration'/'swarm-graph-mirror.yml').read_text(encoding='utf-8'))
    assert c['mode'] == 'EXTEND_EXISTING_ONLY'
    assert c['master']['no_second_orchestrator'] is True
    assert c['swarm']['fanout']['max'] == 10
    assert c['mirror']['factor_max'] == 5
    assert c['mirror']['may_write'] is False
    assert c['mirror']['may_self_approve'] is False
    assert c['triaxial_graph_sweep']['rendezvous_required'] is True


def test_visual_alias_cannot_change_semantics():
    c = yaml.safe_load((ROOT/'integration'/'tui-visual-fabric.yml').read_text(encoding='utf-8'))
    assert c['semantics']['canonical_id_immutable_by_visual_alias'] is True
    assert c['semantics']['emoji_is_semantic_id'] is False
    assert c['accessibility']['plain_text_receipts_required'] is True
    assert c['profiles']['professional']['default'] is True


def test_emoji_registry_has_semantic_core_and_seed():
    c = json.loads((ROOT/'ui'/'emoji-tui'/'emoji-registry.json').read_text(encoding='utf-8'))
    assert c['authority'] is False
    assert c['semantic']['PASS'] == '✅'
    assert c['semantic']['FAIL'] == '❌'
    assert len(c['popular_seed']) >= 70


def test_external_emoji_provider_is_reference_only():
    c = yaml.safe_load((ROOT/'ui'/'emoji-tui'/'external-sources.yml').read_text(encoding='utf-8'))
    src = c['sources']['emoji_keyboard_pt']
    assert src['role'] == 'REFERENCE_PROVIDER'
    assert src['authority'] is False
    assert src['ingest']['store_external_prose'] is False
