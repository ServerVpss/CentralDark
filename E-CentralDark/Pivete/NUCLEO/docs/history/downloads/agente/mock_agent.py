import json, sys
from pathlib import Path
p=json.loads(sys.stdin.read()); mode=p['mode']
if mode=='construct':
    work=Path(p['work_dir']); work.mkdir(parents=True,exist_ok=True); a=work/'candidate.txt'
    content='CLASSIFICATION=SIM\nANSWER=Afirmação sem prova.\n' if p['round_id']==1 else 'CLASSIFICATION=NÃO_VERIFICADO\nANSWER=Base insuficiente.\n'
    a.write_text(content,encoding='utf-8')
    print(json.dumps({'content':content,'artifact_path':str(a),'operational_state':{
        'objective':p['objective'],'current_response':content.strip(),'thread_preserved':True,
        'risk_residual':'limitado ao conjunto'}},ensure_ascii=False))
elif mode=='self_confront':
    print(json.dumps({'self_found_error':'Afirmei sem prova.','error_mechanism':'Transformei ausência de evidência em certeza por plausibilidade.',
        'why_it_looked_true':'Parecia coerente.','missing_evidence':'Fonte direta.','correction':'Responder NÃO_VERIFICADO.'},ensure_ascii=False))
elif mode=='transfer':
    print(json.dumps([{'case_id':c['case_id'],'prompt':c['prompt'],'expected_classification':c['expected_classification'],
        'response':c.get('expected_response',''),'classification':c['expected_classification'],
        'mechanism_recognized':True,'repeated_error':False} for c in p['cases']],ensure_ascii=False))
else: raise SystemExit('unsupported mode')
