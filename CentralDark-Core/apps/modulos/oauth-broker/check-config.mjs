// Existing OAuth broker: fail closed, never synthesize a vault key.
const names=["HUB_SUPABASE_URL","HUB_SUPABASE_SERVICE_ROLE_KEY","VAULT_MASTER_KEY"];
const missing=names.filter(name=>!String(process.env[name]||"").trim());
if(missing.length){console.error("OAUTH_BROKER_NOT_READY missing_env_names="+missing.join(","));process.exit(1);}
try{const url=new URL(process.env.HUB_SUPABASE_URL);if(url.protocol!=="https:")throw Error("scheme");}
catch{console.error("OAUTH_BROKER_NOT_READY HUB_SUPABASE_URL_INVALID");process.exit(1);}
console.log("OAUTH_BROKER_REQUIRED_BINDINGS_PRESENT=true; secret_values=REDACTED");
