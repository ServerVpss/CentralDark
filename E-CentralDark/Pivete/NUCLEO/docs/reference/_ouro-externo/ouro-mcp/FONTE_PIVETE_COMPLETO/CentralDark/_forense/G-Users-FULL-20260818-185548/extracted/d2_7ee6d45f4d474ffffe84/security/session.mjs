import {createHash} from 'node:crypto';
export function sessionFingerprint(id,salt){if(!id||!salt)return null;return createHash('sha256').update(String(salt)).update('\0').update(String(id)).digest('hex')}
export async function validateSession({token,verifyToken,isRevoked}){if(!token)return{valid:false,code:'missing_session'};const c=await verifyToken(token);if(!c?.subject)return{valid:false,code:'invalid_session'};if(await isRevoked(c))return{valid:false,code:'revoked_session',subject:c.subject};return{valid:true,subject:c.subject,claims:c}}
// Token nunca entra em log.
