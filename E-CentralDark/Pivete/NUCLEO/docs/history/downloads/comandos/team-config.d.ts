export declare const HOSTED_TEAM_API = "https://screenpi.pe/api/enterprise/v1";
export declare function readEnterpriseJson(homedir?: string): Record<string, unknown> | null;
/**
 * Team token resolution:
 *   1. SCREENPIPE_ENTERPRISE_TOKEN env (Claude config, terminal)
 *   2. team_api_token in ~/.screenpipe/enterprise.json (written by the
 *      desktop app's Settings → Privacy → Admin Team API Token)
 * Empty/missing → team tools are not registered.
 */
export declare function discoverTeamToken(env?: NodeJS.ProcessEnv, homedir?: string): string;
/**
 * Team API base resolution (mirrors the local-API URL resolution):
 *   1. --team-api-url flag
 *   2. SCREENPIPE_TEAM_API_URL env
 *   3. gateway_url in ~/.screenpipe/enterprise.json (written by the
 *      desktop app from the org's storage-binding gateway URL)
 *   4. hosted default
 */
export declare function discoverTeamApiBase(flagOverride?: string, env?: NodeJS.ProcessEnv, homedir?: string): string;
