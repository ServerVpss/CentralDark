import path from 'node:path'; import {pathToFileURL} from 'node:url';
const root='/mnt/data/audit-rigor/qa.teste-de-software.MARKDOWN';
const o=await import(pathToFileURL(path.join(root,'runtime','orchestrator.mjs')).href+'?x='+Date.now());
const r=await o.orchestrate({event:'TEST_FAILED',mission:{id:'M',state:'FAILED',nextState:'FIX'},evidence:{error:'x'}},{root});
console.log(r.delta.split('\n').filter(x=>/^(STATUS|REGRESSAO_|MISSAO_|AUTO_APPLY)/.test(x)).join('\n'));
