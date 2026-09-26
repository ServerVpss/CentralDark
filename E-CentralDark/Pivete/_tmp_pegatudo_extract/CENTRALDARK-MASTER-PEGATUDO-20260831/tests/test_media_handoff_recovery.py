from pathlib import Path
import json, subprocess, sys, yaml

ROOT=Path(__file__).resolve().parents[1]

def test_contract_extends_existing_only():
    c=yaml.safe_load((ROOT/'integration'/'media-caption-handoff.yml').read_text(encoding='utf-8'))
    assert c['mode']=='EXTEND_EXISTING_ONLY'
    assert c['no_new_engine'] is True
    assert c['capability_harvest']['search_only_complete'] is False
    assert c['named_skill_recovery']['exact_missing_creates_skill'] is False
    assert c['dense_handoff']['grammar_may_be_sacrificed'] is True
    assert c['dense_handoff']['semantics_may_be_sacrificed'] is False
    assert c['media']['youtube_debug_json_is_full_caption_payload'] is False
    assert c['complete_text_gate']['partial_is_complete'] is False

def test_debug_locator_extracts_video_and_track(tmp_path):
    p=tmp_path/'debug.json'
    p.write_text(json.dumps({'docid':'WNx-s-RxVxk','debug_videoId':'WNx-s-RxVxk','len':'740.481','cc':'ta.en.pt','reqBlocked':'ratelimited'}),encoding='utf-8')
    url='https://www.youtube.com/api/timedtext?v=WNx-s-RxVxk&lang=pt&kind=asr&fmt=json3'
    cp=subprocess.run([sys.executable,str(ROOT/'scripts'/'youtube_debug_locator.py'),str(p),'--timedtext-url',url],capture_output=True,text=True,check=True)
    out=json.loads(cp.stdout)
    assert out['video_id']=='WNx-s-RxVxk'
    assert out['caption_track']['lang']=='pt'
    assert out['caption_track']['kind']=='asr'
    assert out['complete_caption_payload'] is False
    assert out['debug_json_is_full_caption_payload'] is False

def test_dense_handoff_required_fields():
    c=yaml.safe_load((ROOT/'02-CENTRALDARK-MASTER.yml').read_text(encoding='utf-8'))
    required={'SKILL','TRIG','OWNER','IN','PRE','EXEC','OUT','PROOF','FAIL','NEXT','REV'}
    assert set(c['dense_skill_handoff']['required_fields'])==required
    assert c['dense_skill_handoff']['sacrifice_grammar_for_concision'] is True
    assert c['dense_skill_handoff']['sacrifice_semantic_fields'] is False

def test_named_skill_missing_does_not_fabricate():
    c=yaml.safe_load((ROOT/'02-CENTRALDARK-MASTER.yml').read_text(encoding='utf-8'))
    r=c['capability_harvest']['named_skill_resolution']
    assert r['exact_name_missing_is_new_skill_permission'] is False
    assert 'IF_MISSING_SEARCH_BY_CAPABILITY' in r['flow']
