# PADRAO - test-forged-receipt.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\test-forged-receipt.mjs
**SHA:** c0d45dede1b1b61a
**Timestamp:** 2026-08-26T19:10:23.677657
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- proven:true, estado:'VERDE_CONSOLIDADO', pattern:'invented pattern', errorExact:'invented error', cause:'invented cause', fix:'invented fix',

### Ouro Bruto (primeiros 5000 chars)
```
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root='/mnt/data/audit-rigor/qa.teste-de-software.MARKDOWN';
const l=await import(pathToFileURL(path.join(root,'runtime','learning-store.mjs')).href+'?x='+Date.now());
const learningDir=await fs.mkdtemp(path.join(os.tmpdir(),'forge-learning-'));
const record={
 proven:true, estado:'VERDE_CONSOLIDADO', pattern:'invented pattern', errorExact:'invented error', cause:'invented cause', fix:'invented fix',
 sourceIds:[], testBefore:'FAIL', testAfter:'PASS', regression:'PASS', negativeCase:'PASS', fail:0, skipped:0, unknown:0, filesOutOfScope:0,
 finalHead:'a'.repeat(40), rollback:'git revert '+'a'.repeat(40)
};
const receipt=await l.createEvidenceReceipt(record,{command:'echo fake',stdout:'all good',exitCode:0},{learningDir});
record.sourceIds=[receipt.id];
const result=await l.registerLearning(record,{learningDir});
console.log(JSON.stringify({learningDir,receipt,result:{promoted:result.promoted,reason:result.reason,id:result.id,verifiedReceiptIds:result.entry?.verifiedReceiptIds}},null,2));

```