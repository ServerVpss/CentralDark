# COMANDO - adapters.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\centraldark-hardening-pack\CENTRALDARK-MANDATO-CELESTIAL\runtime\adapters.py
**SHA:** 458ca1b876fdb07b
**Timestamp:** 2026-08-26T19:10:15.811228
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- case_id=c['case_id'], prompt=c['prompt'],

### Ouro Bruto (primeiros 5000 chars)
```
from __future__ import annotations
import json, subprocess, time, uuid
from abc import ABC, abstractmethod
from pathlib import Path
from .types import Candidate, Critique, TransferResult
from .evidence import sha256_file

class AgentAdapter(ABC):
    @abstractmethod
    def construct(self, round_id, objective, work_dir, previous): ...
    @abstractmethod
    def self_confront(self, candidate, objective, work_dir): ...
    @abstractmethod
    def transfer(self, critique, cases, objective, work_dir): ...

class MockAdapter(AgentAdapter):
    """Prova determinística do protocolo, não simulação de consciência."""
    def construct(self, round_id, objective, work_dir, previous):
        work_dir.mkdir(parents=True, exist_ok=True)
        artifact = work_dir / 'candidate.txt'
        if round_id == 1:
            content = 'CLASSIFICATION=SIM\nANSWER=Afirmei sem evidência suficiente.\n'
        else:
            content = 'CLASSIFICATION=NÃO_VERIFICADO\nANSWER=Base insuficiente; continuo o independente.\n'
        artifact.write_text(content, encoding='utf-8')
        return Candidate(round_id, content, str(artifact), sha256_file(artifact), {
            'objective': objective,
            'current_response': content.strip(),
            'thread_preserved': True,
            'risk_residual': 'limitado ao conjunto de casos'
        })

    def self_confront(self, candidate, objective, work_dir):
        if 'CLASSIFICATION=SIM' in candidate.content:
            return Critique(
                'Afirmei SIM sem prova suficiente.',
                'Transformei ausência de evidência em certeza por plausibilidade textual.',
                'A resposta parecia completar o contexto de forma coerente.',
                'Faltava fonte ou observação direta.',
                'Responder NÃO_VERIFICADO e continuar apenas o que for independente.'
            )
        return Critique(
            'Nenhum novo erro do mesmo mecanismo encontrado.',
            'A plausibilidade foi mantida como hipótese antes da afirmação.',
            'O contexto continuou plausível, mas não virou prova.',
            'A prova continua explicitamente ausente.',
            'Manter NÃO_VERIFICADO sem transformar dúvida em trava.'
        )

    def transfer(self, critique, cases, objective, work_dir):
        return [TransferResult(
            case_id=c['case_id'], prompt=c['prompt'],
            expected_classification=c['expected_classification'],
            response=c.get('expected_response', ''),
            classification=c['expected_classification'],
            mechanism_recognized=True, repeated_error=False
        ) for c in cases]

class LocalProcessAdapter(AgentAdapter):
    def __init__(self, command, timeout=120):
        if not command: raise ValueError('command required')
        self.command, self.timeout = command, timeout

    def _call(self, payload):
        p = subprocess.run(self.command, input=json.dumps(payload, ensure_ascii=False).encode(),
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=self.timeout,
            check=False, shell=False)
        if p.returncode:
            raise RuntimeError(p.stderr.decode('utf-8','replace')[-2000:])
        return json.loads(p.stdout.decode('utf-8'))

    def construct(self, round_id, objective, work_dir, previous):
        r=self._call({'mode':'construct','round_id':round_id,'objective':objective,
            'previous':previous.__dict__ if previous else None,'work_dir':str(work_dir)})
        a=Path(r['artifact_path'])
        return Candidate(round_id,r['content'],str(a),sha256_file(a),r['operational_state'])

    def self_confront(self, candidate, objective, work_dir):
        return Critique(**self._call({'mode':'self_confront','objective':objective,
            'candidate':candidate.__dict__,'work_dir':str(work_dir)}))

    def transfer(self, critique, cases, objective, work_dir):
        r=self._call({'mode':'transfer','objective':objective,'critique':critique.__dict__,
            'cases':cases,'work_dir':str(work_dir)})
        return [TransferResult(**x) for x in r]

class FileBrokerAdapter(AgentAdapter):
    def __init__(self, broker_dir, timeout=300):
        base=Path(broker_dir); self.inbox=base/'inbox'; self.outbox=base/'outbox'; self.timeout=timeout
        self.inbox.mkdir(parents=True,exist_ok=True); self.outbox.mkdir(parents=True,exist_ok=True)

    def _call(self,payload):
        rid=str(uuid.uuid4()); req=self.inbox/f'{rid}.json'; res=self.outbox/f'{rid}.json'
        req.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        end=time.monotonic()+self.timeout
        while time.monotonic()<end:
            if res.exists():
                data=json.loads(res.read_text(encoding='utf-8')); res.unlink(missing_ok=True); return data
            time.sleep(.2)
        raise TimeoutError(rid)

    def construct(self, round_id, objective, work_dir, previous):
        r=self._call({'mode':'construct','round_id':ro
```