import {createHash,randomUUID} from 'node:crypto';
function canonical(v){if(Array.isArray(v))return'['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v)}
export function hashAuditEvent(e,prev=''){const p={...e};delete p.event_hash;return createHash('sha256').update(prev).update('\n').update(canonical(p)).digest('hex')}
export function makeAuditEvent(i,prev=''){const e={event_id:i.event_id||randomUUID(),observed_at:i.observed_at||new Date().toISOString(),kind:i.kind,severity:i.severity||'INFO',decision:i.decision,request_id:i.request_id,evidence:i.evidence||{},previous_hash:prev||null};e.event_hash=hashAuditEvent(e,prev);return e}
