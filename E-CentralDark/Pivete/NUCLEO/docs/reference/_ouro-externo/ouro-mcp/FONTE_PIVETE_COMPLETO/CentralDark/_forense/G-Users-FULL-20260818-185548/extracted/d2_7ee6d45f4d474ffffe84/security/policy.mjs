export const DECISIONS=Object.freeze({ALLOW:'ALLOW',CHALLENGE:'CHALLENGE',THROTTLE:'THROTTLE',DENY:'DENY',REVOKE_SESSION:'REVOKE_SESSION',DROP:'DROP',QUARANTINE:'QUARANTINE',DECOY:'DECOY'});
export function decideSecurityAction(i={}){
 if(i.integrity===false||i.criticalPolicyViolation===true)return{decision:DECISIONS.DROP,reason:'policy_or_integrity'};
 if(i.sessionRevoked===true)return{decision:DECISIONS.REVOKE_SESSION,reason:'session_revoked'};
 if(i.rateLimited===true)return{decision:DECISIONS.THROTTLE,reason:'rate_limited'};
 if(i.requiresAuthentication===true&&i.authenticated!==true)return{decision:DECISIONS.CHALLENGE,reason:'authentication_required'};
 if(i.authorized!==true)return{decision:DECISIONS.DENY,reason:'not_authorized'};
 return{decision:DECISIONS.ALLOW,reason:'explicit_policy_allow'};
}
