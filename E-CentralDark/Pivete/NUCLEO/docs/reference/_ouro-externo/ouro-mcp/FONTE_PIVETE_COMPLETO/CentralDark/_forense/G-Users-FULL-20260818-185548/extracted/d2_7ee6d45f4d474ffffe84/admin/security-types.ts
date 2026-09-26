export type SecurityStatus='PASS'|'WARN'|'FAIL'|'UNKNOWN'|'UNPROVEN';
export interface SecurityControl{id:string;surface:string;name:string;status:SecurityStatus;summary:string;observed_at:string|null;evidence_ref:string|null}
export interface SecurityOverview{controls:SecurityControl[];open_incidents:number;revoked_sessions:number;last_restore_test:string|null}
