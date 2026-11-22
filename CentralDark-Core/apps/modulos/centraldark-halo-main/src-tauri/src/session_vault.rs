//! CentralDark Agente Remoto — encrypted session vault for the signed-in Windows user.
//! Uses Windows DPAPI (CryptProtectData/CryptUnprotectData), not a second auth provider.
//! Stores only a Supabase session; NEVER a password or service-role credential.
use serde_json::Value;
use std::{fs, path::PathBuf};

#[cfg(windows)]
mod dpapi {
    use std::{ffi::c_void, ptr};

    #[repr(C)]
    struct DataBlob {
        len: u32,
        data: *mut u8,
    }

    #[link(name = "Crypt32")]
    extern "system" {
        fn CryptProtectData(
            input: *mut DataBlob, description: *const u16, entropy: *mut DataBlob,
            reserved: *mut c_void, prompt: *mut c_void, flags: u32, output: *mut DataBlob,
        ) -> i32;
        fn CryptUnprotectData(
            input: *mut DataBlob, description: *mut *mut u16, entropy: *mut DataBlob,
            reserved: *mut c_void, prompt: *mut c_void, flags: u32, output: *mut DataBlob,
        ) -> i32;
    }
    #[link(name = "Kernel32")]
    extern "system" {
        fn LocalFree(ptr: *mut c_void) -> *mut c_void;
    }
    const CRYPTPROTECT_UI_FORBIDDEN: u32 = 0x1;

    fn transform(input: &[u8], encrypt: bool) -> Result<Vec<u8>, String> {
        let len = u32::try_from(input.len()).map_err(|_| "SESSION_TOO_LARGE")?;
        let mut input_blob = DataBlob { len, data: input.as_ptr() as *mut u8 };
        let mut output_blob = DataBlob { len: 0, data: ptr::null_mut() };
        // DPAPI protects data for the current Windows user. No admin privileges required.
        let ok = unsafe {
            if encrypt {
                CryptProtectData(
                    &mut input_blob, ptr::null(), ptr::null_mut(), ptr::null_mut(),
                    ptr::null_mut(), CRYPTPROTECT_UI_FORBIDDEN, &mut output_blob,
                )
            } else {
                CryptUnprotectData(
                    &mut input_blob, ptr::null_mut(), ptr::null_mut(), ptr::null_mut(),
                    ptr::null_mut(), CRYPTPROTECT_UI_FORBIDDEN, &mut output_blob,
                )
            }
        };
        if ok == 0 { return Err("WINDOWS_DPAPI_UNAVAILABLE".into()); }
        if output_blob.data.is_null() { return Err("WINDOWS_DPAPI_EMPTY".into()); }
        let bytes = unsafe {
            let copy = std::slice::from_raw_parts(output_blob.data, output_blob.len as usize).to_vec();
            LocalFree(output_blob.data.cast());
            copy
        };
        Ok(bytes)
    }

    pub fn protect(input: &[u8]) -> Result<Vec<u8>, String> { transform(input, true) }
    pub fn unprotect(input: &[u8]) -> Result<Vec<u8>, String> { transform(input, false) }
}

#[cfg(windows)]
fn replace_existing(target: &std::path::Path, replacement: &std::path::Path) -> Result<(), String> {
    use std::os::windows::ffi::OsStrExt;
    #[link(name = "Kernel32")]
    extern "system" {
        fn ReplaceFileW(replaced: *const u16, replacement: *const u16, backup: *const u16,
            flags: u32, exclude: *mut std::ffi::c_void, reserved: *mut std::ffi::c_void) -> i32;
    }
    let old: Vec<u16> = target.as_os_str().encode_wide().chain(Some(0)).collect();
    let new: Vec<u16> = replacement.as_os_str().encode_wide().chain(Some(0)).collect();
    let ok = unsafe {
        ReplaceFileW(old.as_ptr(), new.as_ptr(), std::ptr::null(), 0,
            std::ptr::null_mut(), std::ptr::null_mut())
    };
    if ok == 0 { Err("SESSION_ATOMIC_REPLACE_FAILED".into()) } else { Ok(()) }
}
/// !RASTRO: barreira de label na entrada de comandos com dados da conta.
/// POR_QUE: renderer overlay-* nao pode consultar nem alterar tokens DPAPI.
/// INVARIANTE: somente agent-control e aceito, mesmo se renderer invocar comando.
fn require_control_window(window: &tauri::WebviewWindow) -> Result<(), String> {
    if window.label() != "agent-control" {
        return Err("AUTH_VAULT_FORBIDDEN_FOR_WINDOW".into());
    }
    Ok(())
}
fn session_file() -> Result<PathBuf, String> {
    let mut path = dirs::data_local_dir().ok_or("LOCAL_DATA_UNAVAILABLE")?;
    path.push("CentralDark");
    path.push("AgenteRemoto");
    path.push("supabase-session.dpapi");
    Ok(path)
}

/// !RASTRO: verifica presenca do formato minimo de sessao Supabase.
/// LIMITE: formato valido nao significa token ainda autentico; refresh e obrigatorio.
fn valid_session(value: &Value) -> bool {
    value.get("access_token").and_then(Value::as_str).is_some_and(|s| !s.is_empty())
        && value.get("refresh_token").and_then(Value::as_str).is_some_and(|s| !s.is_empty())
        && value.pointer("/user/id").and_then(Value::as_str).is_some_and(|s| !s.is_empty())
}

/// !RASTRO: salva somente sessao validada sob DPAPI do usuario Windows.
/// POR_QUE: persistir login sem senha nem token em texto claro.
/// INVARIANTES: agent-control, gravacao atomica e rollback de arquivo temporario.
/// PROVA: salvar, reiniciar, recuperar/refresh e limpar cofre.
#[tauri::command]
pub(crate) fn save_agent_session(window: tauri::WebviewWindow, session: Value) -> Result<(), String> {
    require_control_window(&window)?;
    if !valid_session(&session) {
        crate::logging::diag("vault", "error", "INVALID_SUPABASE_SESSION");
        return Err("INVALID_SUPABASE_SESSION".into());
    }
    let file = session_file()?;
    let parent = file.parent().ok_or("SESSION_PATH_INVALID")?;
    fs::create_dir_all(parent).map_err(|_| "SESSION_DIRECTORY_UNAVAILABLE")?;
    let raw = serde_json::to_vec(&session).map_err(|_| "SESSION_SERIALIZATION_FAILED")?;
    #[cfg(windows)]
    let encrypted = dpapi::protect(&raw)?;
    #[cfg(not(windows))]
    return Err("WINDOWS_DPAPI_REQUIRED".into());
    #[cfg(windows)]
    {
        let tmp = file.with_extension("tmp");
        fs::write(&tmp, encrypted).map_err(|_| "SESSION_WRITE_FAILED")?;
        let committed = if file.exists() { replace_existing(&file, &tmp) } else { fs::rename(&tmp, &file).map_err(|_| "SESSION_ATOMIC_RENAME_FAILED".to_string()) };
        if committed.is_err() {
            let _ = fs::remove_file(&tmp);
            return Err("SESSION_ATOMIC_RENAME_FAILED".into());
        }
        crate::logging::diag("vault", "ok", "SESSION_DPAPI_SAVED");
        Ok(())
    }
}

/// !RASTRO: recupera blob protegido para renovar sessao com Supabase.
/// POR_QUE: nao pedir senha outra vez se o usuario ativou persistencia.
/// LIMITE: descriptografia nao e autenticacao; o React valida refresh antes do painel.
#[tauri::command]
pub(crate) fn load_agent_session(window: tauri::WebviewWindow) -> Result<Option<Value>, String> {
    require_control_window(&window)?;
    let file = session_file()?;
    if !file.exists() {
        crate::logging::diag_transition("vault", "missing", "SESSION_NOT_FOUND");
        return Ok(None);
    }
    let encrypted = fs::read(file).map_err(|_| {
        crate::logging::diag("vault", "error", "SESSION_READ_FAILED");
        "SESSION_READ_FAILED"
    })?;
    #[cfg(windows)]
    let plain = dpapi::unprotect(&encrypted)?;
    #[cfg(not(windows))]
    return Err("WINDOWS_DPAPI_REQUIRED".into());
    #[cfg(windows)]
    {
        let session: Value = serde_json::from_slice(&plain).map_err(|_| "SESSION_CORRUPT")?;
        if !valid_session(&session) {
            crate::logging::diag("vault", "error", "INVALID_SUPABASE_SESSION");
            return Err("INVALID_SUPABASE_SESSION".into());
        }
        crate::logging::diag_transition("vault", "ok", "SESSION_DPAPI_LOADED");
        Ok(Some(session))
    }
}

/// !RASTRO: apaga sessao local em logout explicito, somente na agent-control.
/// INVARIANTE: erro nao pode ser reportado como logout concluido.
#[tauri::command]
pub(crate) fn clear_agent_session(window: tauri::WebviewWindow) -> Result<(), String> {
    require_control_window(&window)?;
    let file = session_file()?;
    if file.exists() { fs::remove_file(file).map_err(|_| "SESSION_CLEAR_FAILED")?; }
    crate::logging::diag("vault", "ok", "SESSION_SIGNED_OUT");
    Ok(())
}


// Pareamento nativo do mesmo Agente Remoto. Nao cria servidor, executor ou
// janela paralela: reutiliza o OAuth e as rotas /device do MCP CentralDark.
// Credenciais de dispositivo ficam no mesmo cofre DPAPI da sessao Supabase.
use serde_json::json;
use std::sync::Mutex as PairMutex;
use std::time::Duration;

const MCP_ORIGIN: &str = "https://mcp.centralldark.com";
const PAIR_CLIENT: &str = "centraldark.remote-bridge";

#[derive(Clone)]
struct PendingRemotePair {
    id: String,
    secret: String,
    code: String,
    expires_at: String,
}
static PENDING_REMOTE_PAIR: PairMutex<Option<PendingRemotePair>> = PairMutex::new(None);

fn device_auth_file() -> Result<PathBuf, String> {
    let mut path = dirs::data_local_dir().ok_or("LOCAL_DATA_UNAVAILABLE")?;
    path.push("CentralDark");
    path.push("AgenteRemoto");
    path.push("device-auth.dpapi");
    Ok(path)
}

fn load_device_auth() -> Result<Option<Value>, String> {
    let file = device_auth_file()?;
    if !file.exists() {
        crate::logging::diag_transition("device_vault", "missing", "DEVICE_AUTH_NOT_FOUND");
        return Ok(None);
    }
    let encrypted = fs::read(file).map_err(|_| "DEVICE_AUTH_READ_FAILED")?;
    #[cfg(windows)]
    {
        let raw = dpapi::unprotect(&encrypted)?;
        let value: Value = serde_json::from_slice(&raw).map_err(|_| "DEVICE_AUTH_CORRUPT")?;
        if value.get("token").and_then(Value::as_str).is_none()
            || value.get("refresh_token").and_then(Value::as_str).is_none()
            || value.get("device_id").and_then(Value::as_str).is_none()
            || value.get("owner_user_id").and_then(Value::as_str).is_none()
        {
            crate::logging::diag_transition("device_vault", "error", "DEVICE_AUTH_INVALID");
            return Err("DEVICE_AUTH_INVALID".into());
        }
        crate::logging::diag_transition("device_vault", "ok", "DEVICE_AUTH_DPAPI_LOADED");
        Ok(Some(value))
    }
    #[cfg(not(windows))]
    { let _ = encrypted; Err("WINDOWS_DPAPI_REQUIRED".into()) }
}

fn save_device_auth(value: &Value) -> Result<(), String> {
    let file = device_auth_file()?;
    let parent = file.parent().ok_or("DEVICE_AUTH_PATH_INVALID")?;
    fs::create_dir_all(parent).map_err(|_| "DEVICE_AUTH_DIRECTORY_UNAVAILABLE")?;
    let raw = serde_json::to_vec(value).map_err(|_| "DEVICE_AUTH_SERIALIZATION_FAILED")?;
    #[cfg(windows)]
    {
        let protected = dpapi::protect(&raw)?;
        let tmp = file.with_extension("tmp");
        fs::write(&tmp, protected).map_err(|_| "DEVICE_AUTH_WRITE_FAILED")?;
        let result = if file.exists() {
            replace_existing(&file, &tmp)
        } else {
            fs::rename(&tmp, &file).map_err(|_| "DEVICE_AUTH_RENAME_FAILED".to_string())
        };
        if result.is_err() {
            let _ = fs::remove_file(&tmp);
            crate::logging::diag_transition("device_vault", "error", "DEVICE_AUTH_WRITE_FAILED");
        } else {
            crate::logging::diag_transition("device_vault", "ok", "DEVICE_AUTH_DPAPI_SAVED");
        }
        result
    }
    #[cfg(not(windows))]
    { let _ = raw; Err("WINDOWS_DPAPI_REQUIRED".into()) }
}

fn mcp_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(12))
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|_| "MCP_HTTP_CLIENT_UNAVAILABLE".into())
}

// !RASTRO: usar o cliente HTTPS Rust existente para a autenticacao Supabase no .exe.
// POR_QUE: falha de fetch no WebView2 mesmo quando a rede/TLS foi confirmada.
// OWNER: sessao e pareamento continuam neste modulo; nao criar outro provedor.
// SEGURANCA: host/config publica fixa no build, rotas allowlisted, sem logs de senhas,
// tokens ou respostas de erro brutas, sem seguir redirecionamentos.
#[tauri::command]
pub(crate) async fn agent_supabase_auth_request(
    window: tauri::WebviewWindow,
    route: String,
    payload: Value,
) -> Result<Value, String> {
    require_control_window(&window)?;
    if !matches!(route.as_str(),
        "signup" | "token?grant_type=password" | "token?grant_type=refresh_token"
    ) {
        crate::logging::diag("supabase_auth", "error", "ROUTE_NOT_ALLOWED");
        return Err("SUPABASE_AUTH_ROUTE_NOT_ALLOWED".into());
    }
    let operation = match route.as_str() {
        "signup" => "signup",
        "token?grant_type=password" => "login",
        _ => "refresh",
    };
    // Nunca registrar email, senha, refresh token ou payload.
    log::info!("AGENT_DIAG stage=supabase_auth state=start operation={operation}");
    if !payload.is_object() {
        return Err("SUPABASE_AUTH_INPUT_INVALID".into());
    }
    let public_config: Value = serde_json::from_str(include_str!(
        concat!(env!("CARGO_MANIFEST_DIR"), "/../public/centraldark-auth-public.json")
    )).map_err(|_| "SUPABASE_AUTH_CONFIG_INVALID")?;
    const AUTH_ORIGIN: &str = "https://lyoigsqluyktoclwdaft.supabase.co";
    if public_config.get("url").and_then(Value::as_str) != Some(AUTH_ORIGIN) {
        return Err("SUPABASE_AUTH_ORIGIN_INVALID".into());
    }
    let public_key = public_config.get("publishableKey")
        .and_then(Value::as_str)
        .filter(|key| key.starts_with("sb_publishable_") || key.starts_with("eyJ"))
        .ok_or("SUPABASE_AUTH_PUBLIC_KEY_MISSING")?;
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|_| "SUPABASE_AUTH_CLIENT_UNAVAILABLE")?;
    let response = client.post(format!("{AUTH_ORIGIN}/auth/v1/{route}"))
        .header("apikey", public_key)
        .json(&payload)
        .send().await
        .map_err(|error| if error.is_timeout() {
            crate::logging::diag("supabase_auth", "error", "HTTPS_TIMEOUT");
            "SUPABASE_AUTH_TIMEOUT".to_owned()
        } else {
            crate::logging::diag("supabase_auth", "error", "HTTPS_NETWORK_UNAVAILABLE");
            "SUPABASE_AUTH_NETWORK_UNAVAILABLE".to_owned()
        })?;
    let status = response.status();
    let result: Value = response.json().await
        .map_err(|_| {
            crate::logging::diag("supabase_auth", "error", "INVALID_JSON");
            "SUPABASE_AUTH_INVALID_RESPONSE"
        })?;
    if !status.is_success() {
        log::warn!("AGENT_DIAG stage=supabase_auth state=error operation={operation} http_status={}", status.as_u16());
        let code = result.get("code").or_else(|| result.get("error_code"))
            .and_then(Value::as_str)
            .filter(|s| s.len() <= 64 && s.bytes().all(|b|
                b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'_'))
            .unwrap_or("unknown");
        return Err(code.to_owned());
    }
    log::info!("AGENT_DIAG stage=supabase_auth state=ok operation={operation}");
    Ok(result)
}

async fn device_post(route: &str, value: &Value, bearer: Option<&str>) -> Result<Value, String> {
    // Cada rota pertence ao owner existente; nunca gravar value nem bearer.
    let stage = match route {
        "/heartbeat" => "mcp_heartbeat",
        "/pair/start" => "mcp_pair_start",
        "/pair/status" => "mcp_pair_status",
        "/token/refresh" => "mcp_token_refresh",
        _ => "mcp_device",
    };
    let mut req = mcp_client()?.post(format!("{MCP_ORIGIN}/device{route}")).json(value);
    if let Some(token) = bearer { req = req.bearer_auth(token); }
    let res = req.send().await.map_err(|_| {
        crate::logging::diag_transition(stage, "error", "HTTP_REQUEST_UNAVAILABLE");
        "MCP_DEVICE_REQUEST_UNAVAILABLE"
    })?;
    let status = res.status();
    if !status.is_success() {
        let code = match status.as_u16() {
            400 => "HTTP_400",
            401 => "HTTP_401",
            403 => "HTTP_403",
            404 => "HTTP_404",
            409 => "HTTP_409",
            429 => "HTTP_429",
            500..=599 => "HTTP_5XX",
            _ => "HTTP_REJECTED",
        };
        crate::logging::diag_transition(stage, "error", code);
        return Err(format!("MCP_DEVICE_HTTP_{}", status.as_u16()));
    }
    let response = res.json::<Value>().await.map_err(|_| {
        crate::logging::diag_transition(stage, "error", "INVALID_JSON");
        "MCP_DEVICE_INVALID_JSON"
    })?;
    crate::logging::diag_transition(stage, "ok", "HTTP_2XX");
    Ok(response)
}

/// !RASTRO: exige sessao do dono antes de consultar pareamento.
/// LIMITE: token local nao concede por si so aprovacao do dispositivo/acao remota.
fn native_owner(window: &tauri::WebviewWindow) -> Result<Value, String> {
    let session = load_agent_session(window.clone())?.ok_or("SUPABASE_SESSION_REQUIRED")?;
    if session.pointer("/user/id").and_then(Value::as_str).is_none()
        || session.get("access_token").and_then(Value::as_str).is_none()
    { return Err("SUPABASE_SESSION_INVALID".into()); }
    Ok(session)
}

/// !RASTRO: confirmar vinculo pelo heartbeat remoto e renovar token se preciso.
/// POR_QUE: somente um retorno verificado pode anunciar PAIRED_VERIFIED.
/// INVARIANTE: conferir device_id antes de gravar refresh; motor ainda pendente.
async fn verify_native_device(mut auth: Value) -> Result<Value, String> {
    let token = auth.get("token").and_then(Value::as_str).ok_or("DEVICE_TOKEN_MISSING")?;
    let body = json!({"capabilities": {
        "runtime": "tauri-rust",
        "halo_glow": true,
        "remote_execution": "not_verified"
    }});
    let first = device_post("/heartbeat", &body, Some(token)).await;
    let result = match first {
        Ok(value) => value,
        Err(_) => {
            crate::logging::diag_transition("mcp_heartbeat", "pending", "TOKEN_REFRESH_REQUIRED");
            let refresh = auth.get("refresh_token").and_then(Value::as_str).ok_or("DEVICE_REFRESH_MISSING")?;
            let new_auth = device_post("/token/refresh", &json!({}), Some(refresh)).await?;
            let old_id = auth.get("device_id").and_then(Value::as_str);
            if new_auth.get("device_id").and_then(Value::as_str) != old_id {
                return Err("DEVICE_REFRESH_ID_MISMATCH".into());
            }
            let new_token = new_auth.get("token").and_then(Value::as_str).ok_or("DEVICE_REFRESH_INVALID")?;
            auth["token"] = json!(new_token);
            auth["token_expires_at"] = new_auth["token_expires_at"].clone();
            save_device_auth(&auth)?;
            device_post("/heartbeat", &body, Some(new_token)).await?
        }
    };
    if result.get("ok").and_then(Value::as_bool) != Some(true)
        || result.get("device_id").and_then(Value::as_str)
            != auth.get("device_id").and_then(Value::as_str)
    { return Err("DEVICE_HEARTBEAT_UNVERIFIED".into()); }
    Ok(json!({"state":"PAIRED_VERIFIED","deviceId":auth["device_id"],"engine":"PENDING_EXECUTION_PROOF"}))
}

/// !RASTRO: resolver status de pareamento sem inventar confirmacao.
/// CONTRATO: dono autenticado; pending requer consentimento; approved salva DPAPI;
/// so heartbeat confirmado gera PAIRED_VERIFIED, nunca prova motor remoto.
/// EFEITO: pode renovar o token do dispositivo e limpar pending verificado.
#[tauri::command]
pub(crate) async fn remote_pairing_status(window: tauri::WebviewWindow) -> Result<Value, String> {
    let result = remote_pairing_status_impl(window).await;
    let (state, code) = match &result {
        Ok(value) => match value.get("state").and_then(Value::as_str) {
            Some("UNPAIRED") => ("unpaired", "NO_DEVICE_AUTH"),
            Some("WAITING_OWNER_CONSENT") => ("pending", "OWNER_CONSENT_WAIT"),
            Some("PAIRED_VERIFIED") => ("ok", "DEVICE_HEARTBEAT_VERIFIED"),
            Some("LOCAL_TOKEN_UNVERIFIED") => ("error", "LOCAL_TOKEN_UNVERIFIED"),
            Some("TOKEN_SAVED_HEARTBEAT_PENDING") => ("pending", "DEVICE_HEARTBEAT_PENDING"),
            _ => ("pending", "PAIRING_STATE_OTHER"),
        },
        Err(_) => ("error", "PAIRING_STATUS_FAILED"),
    };
    crate::logging::diag_transition("pairing", state, code);
    result
}

async fn remote_pairing_status_impl(window: tauri::WebviewWindow) -> Result<Value, String> {
    require_control_window(&window)?;
    let owner = native_owner(&window)?;
    let owner_id = owner.pointer("/user/id").and_then(Value::as_str);
    if let Some(auth) = load_device_auth()? {
        if auth.get("owner_user_id").and_then(Value::as_str) != owner_id {
            return Err("DEVICE_BELONGS_TO_ANOTHER_ACCOUNT".into());
        }
        return match verify_native_device(auth).await {
            Ok(result) => Ok(result),
            Err(_) => Ok(json!({"state":"LOCAL_TOKEN_UNVERIFIED","engine":"PENDING"})),
        };
    }
    // Liberar o MutexGuard antes de qualquer await (Tauri exige Future: Send).
    let pending_pair = {
        PENDING_REMOTE_PAIR.lock()
            .map_err(|_| "PAIRING_LOCK_FAILED")?.clone()
    };
    if let Some(pending) = pending_pair {
        let result = device_post("/pair/status",
            &json!({"id":pending.id,"secret":pending.secret}), None).await?;
        match result.get("status").and_then(Value::as_str) {
            Some("pending") => return Ok(json!({"state":"WAITING_OWNER_CONSENT",
                "code":pending.code,"expiresAt":pending.expires_at})),
            Some("approved") => {
                let token = result.get("token").and_then(Value::as_str);
                let refresh = result.get("refresh_token").and_then(Value::as_str);
                let device_id = result.get("device_id").and_then(Value::as_str);
                if let (Some(token), Some(refresh), Some(device_id)) = (token, refresh, device_id) {
                    let auth = json!({"token":token,"refresh_token":refresh,
                        "token_expires_at":result["token_expires_at"],
                        "device_id":device_id,"owner_user_id":owner_id});
                    save_device_auth(&auth)?;
                    *PENDING_REMOTE_PAIR.lock().map_err(|_| "PAIRING_LOCK_FAILED")? = None;
                    return match verify_native_device(auth).await {
                        Ok(value) => Ok(value),
                        Err(_) => Ok(json!({"state":"TOKEN_SAVED_HEARTBEAT_PENDING",
                            "engine":"PENDING"})),
                    };
                }
                return Err("PAIRING_APPROVED_TOKEN_INCOMPLETE".into());
            }
            Some(status) => {
                *PENDING_REMOTE_PAIR.lock().map_err(|_| "PAIRING_LOCK_FAILED")? = None;
                return Ok(json!({"state":format!("PAIRING_{}",status.to_uppercase())}));
            }
            None => return Err("PAIRING_RESPONSE_INVALID".into()),
        }
    }
    Ok(json!({"state":"UNPAIRED","engine":"PENDING"}))
}

/// !RASTRO: iniciar desafio do MESMO dispositivo, idempotente enquanto pending.
/// POR_QUE: mostrar codigo ao dono sem criar um pareamento paralelo.
/// INVARIANTE: login necessario e nenhuma operacao remota concedida ao iniciar.
#[tauri::command]
pub(crate) async fn start_remote_pairing(window: tauri::WebviewWindow) -> Result<Value, String> {
    crate::logging::diag("pairing_start", "start", "REQUESTED");
    require_control_window(&window)?;
    let _ = native_owner(&window)?;
    if load_device_auth()?.is_some() {
        return remote_pairing_status(window).await;
    }
    let pending_pair = {
        PENDING_REMOTE_PAIR.lock().map_err(|_| "PAIRING_LOCK_FAILED")?.clone()
    };
    if let Some(p) = pending_pair {
        return Ok(json!({"state":"WAITING_OWNER_CONSENT","code":p.code,"expiresAt":p.expires_at}));
    }
    let result = device_post("/pair/start", &json!({
        "device_name":std::env::var("COMPUTERNAME").unwrap_or_else(|_| "SEGREDO".into()),
        "executor":"remote-bridge","surface":"tauri-windows-tray"
    }), None).await?;
    if result.get("ok").and_then(Value::as_bool) != Some(true) {
        return Err("PAIRING_START_REJECTED".into());
    }
    let p = PendingRemotePair {
        id: result.get("pair_id").and_then(Value::as_str)
            .ok_or("PAIRING_ID_MISSING")?.to_owned(),
        secret: result.get("pair_secret").and_then(Value::as_str)
            .ok_or("PAIRING_SECRET_MISSING")?.to_owned(),
        code: result.get("code").and_then(Value::as_str)
            .ok_or("PAIRING_CODE_MISSING")?.to_owned(),
        expires_at: result.get("expires_at").and_then(Value::as_str)
            .ok_or("PAIRING_EXPIRY_MISSING")?.to_owned(),
    };
    let public = json!({"state":"WAITING_OWNER_CONSENT",
        "code":p.code,"expiresAt":p.expires_at});
    *PENDING_REMOTE_PAIR.lock().map_err(|_| "PAIRING_LOCK_FAILED")? = Some(p);
    crate::logging::diag("pairing_start", "ok", "CHALLENGE_CREATED");
    Ok(public)
}

/// !RASTRO: concluir a aprovacao do dono em desafio autenticado.
/// POR_QUE: parear sem senha extra mas nunca sem autorizacao explicita.
/// INVARIANTES: validar origin, nonce, codigo e pair_id; nao seguir redirect
/// arbitrario nem confundir conta Supabase com acesso ao motor remoto.
#[tauri::command]
pub(crate) async fn approve_remote_pairing(window: tauri::WebviewWindow) -> Result<Value, String> {
    crate::logging::diag("pairing_approval", "start", "OWNER_APPROVAL_REQUESTED");
    require_control_window(&window)?;
    let owner = native_owner(&window)?;
    let pending = PENDING_REMOTE_PAIR.lock()
        .map_err(|_| "PAIRING_LOCK_FAILED")?.clone().ok_or("PAIRING_NOT_PENDING")?;
    let bearer = owner.get("access_token").and_then(Value::as_str)
        .ok_or("SUPABASE_ACCESS_TOKEN_MISSING")?;
    let client = mcp_client()?;
    let challenge = client.get(format!("{MCP_ORIGIN}/authorize"))
        .query(&[("client_id", PAIR_CLIENT), ("pair_id", pending.id.as_str())])
        .send().await.map_err(|_| "PAIRING_CHALLENGE_UNAVAILABLE")?;
    if challenge.status().as_u16() != 302 {
        return Err("PAIRING_CHALLENGE_NOT_REDIRECT".into());
    }
    let location = challenge.headers().get(reqwest::header::LOCATION)
        .and_then(|h| h.to_str().ok()).ok_or("PAIRING_CHALLENGE_LOCATION_MISSING")?;
    let redirect = reqwest::Url::parse(MCP_ORIGIN).map_err(|_| "MCP_URL_INVALID")?
        .join(location).map_err(|_| "PAIRING_REDIRECT_INVALID")?;
    if redirect.origin().ascii_serialization() != "https://admin.centralldark.com"
        || redirect.path() != "/mcp-autorizar" {
        return Err("PAIRING_CHALLENGE_ORIGIN_MISMATCH".into());
    }
    let nonce = redirect.query_pairs().find(|(k,_)|k=="pair_nonce")
        .map(|(_,v)|v.into_owned()).ok_or("PAIRING_NONCE_MISSING")?;
    let pair_code = redirect.query_pairs().find(|(k,_)|k=="pair_code")
        .map(|(_,v)|v.into_owned()).ok_or("PAIRING_CODE_MISSING")?;
    let pair_id = redirect.query_pairs().find(|(k,_)|k=="pair_id")
        .map(|(_,v)|v.into_owned()).ok_or("PAIRING_ID_MISSING")?;
    if pair_id != pending.id || pair_code != pending.code {
        return Err("PAIRING_CHALLENGE_ID_MISMATCH".into());
    }
    let approved = client.post(format!("{MCP_ORIGIN}/authorize"))
        .bearer_auth(bearer).form(&[
            ("client_id",PAIR_CLIENT),("pair_id",pending.id.as_str()),
            ("pair_code",pending.code.as_str()),("pair_nonce",nonce.as_str()),
        ]).send().await.map_err(|_| "PAIRING_OWNER_APPROVAL_UNAVAILABLE")?;
    if approved.status().as_u16() != 302 {
        return Err(format!("PAIRING_OWNER_APPROVAL_HTTP_{}", approved.status().as_u16()));
    }
    let target = approved.headers().get(reqwest::header::LOCATION)
        .and_then(|h|h.to_str().ok()).ok_or("PAIRING_APPROVAL_REDIRECT_MISSING")?;
    let redirect = reqwest::Url::parse(MCP_ORIGIN).map_err(|_| "MCP_URL_INVALID")?
        .join(target).map_err(|_| "PAIRING_APPROVAL_REDIRECT_INVALID")?;
    if redirect.origin().ascii_serialization() != "https://admin.centralldark.com"
        || redirect.path() != "/mcp-autorizar"
        || !redirect.query_pairs().any(|(k,v)|k=="success" && v=="1") {
        return Err("PAIRING_OWNER_APPROVAL_UNVERIFIED".into());
    }
    crate::logging::diag("pairing_approval", "ok", "AUTH_RESULT_PENDING");
    Ok(json!({"state":"AUTH_RESULT_PENDING","code":pending.code}))
}


/// !RASTRO: leitura do endpoint local de saude do Casa Agent (sem escrita).
/// POR_QUE: engine_connected e tool receipt sao independentes do HTTP 200.
/// INVARIANTE: retornar somente campos filtrados para a interface do cliente.
#[tauri::command]
pub(crate) async fn local_bridge_health(window: tauri::WebviewWindow) -> Result<Value, String> {
    require_control_window(&window)?;
    let result = mcp_client()?
        .get("http://127.0.0.1:9101/health")
        .send().await.map_err(|_| {
            // 127.0.0.1 referencia ESTE PC; notebook sem Casa Agent nao e falha de Tailscale.
            crate::logging::diag_transition("local_bridge", "error", "LOOPBACK_9101_UNREACHABLE");
            "CASA_COMMANDER_UNAVAILABLE"
        })?;
    if !result.status().is_success() {
        crate::logging::diag_transition("local_bridge", "error", "HEALTH_HTTP_REJECTED");
        return Err(format!("CASA_COMMANDER_HTTP_{}", result.status().as_u16()));
    }
    let health: Value = result.json().await.map_err(|_| {
        crate::logging::diag_transition("local_bridge", "error", "HEALTH_INVALID_JSON");
        "CASA_COMMANDER_INVALID_JSON"
    })?;
    if health.get("engine_connected").and_then(Value::as_bool) == Some(true) {
        crate::logging::diag_transition("local_bridge", "ok", "ENGINE_CONNECTED");
    } else {
        crate::logging::diag_transition("local_bridge", "pending", "ENGINE_NOT_CONNECTED");
    }
    Ok(json!({
        "reachable": health.get("ok").and_then(Value::as_bool).unwrap_or(false),
        "engineConnected": health.get("engine_connected").and_then(Value::as_bool).unwrap_or(false),
        "remoteVendor": false,
        "receipt": health.pointer("/last_authorized_tool/verified")
            .and_then(Value::as_bool).unwrap_or(false)
    }))
}


// Leitura de conexoes do Bridge original, sem iniciar outro executor.
// Somente agent-control pode consultar o status; nenhum token e exposto.
/// !RASTRO: consolidar apenas status de Tailscale e MCP publico na UI.
/// POR_QUE: disponibilidade da rede nao equivale a capacidade de execucao.
/// INVARIANTES: sem console Windows, sem tokens e sem iniciar outro executor.
#[tauri::command]
pub(crate) async fn remote_network_status(window: tauri::WebviewWindow) -> Result<Value, String> {
    require_control_window(&window)?;

    #[cfg(target_os = "windows")]
    let tailscale = tauri::async_runtime::spawn_blocking(|| {
        use std::os::windows::process::CommandExt;
        let program_files = std::env::var("ProgramFiles")
            .unwrap_or_else(|_| r"C:\Program Files".to_owned());
        let exe = std::path::Path::new(&program_files)
            .join("Tailscale").join("tailscale.exe");
        if !exe.is_file() {
            return json!({"available": false, "state": "UNKNOWN"});
        }
        // CREATE_NO_WINDOW: consultar a rede sem abrir console no Windows.
        let output = std::process::Command::new(exe)
            .args(["status", "--json"])
            .creation_flags(0x0800_0000)
            .output();
        if let Ok(result) = output {
            if result.status.success() {
                if let Ok(state) = serde_json::from_slice::<Value>(&result.stdout) {
                    return json!({
                        "available": true,
                        "state": state.get("BackendState")
                            .and_then(Value::as_str).unwrap_or("UNKNOWN"),
                        "self": state.pointer("/Self/HostName")
                            .and_then(Value::as_str)
                    });
                }
            }
        }
        json!({"available": false, "state": "UNKNOWN"})
    }).await.map_err(|_| "TAILSCALE_STATUS_UNAVAILABLE")?;

    #[cfg(not(target_os = "windows"))]
    let tailscale = json!({"available": false, "state": "UNKNOWN"});

    // O health HTTP publico confirma o tunel MCP, nao permissao de usar ferramentas.
    let mcp = match mcp_client()?
        .get("https://mcp.centralldark.com/health")
        .send().await
    {
        Ok(response) if response.status().is_success() => match response.json::<Value>().await {
            Ok(payload) => json!({
                "reachable": payload.get("ok").and_then(Value::as_bool) == Some(true)
                    && payload.get("service").and_then(Value::as_str) == Some("mcp-centraldark"),
                "toolCount": payload.get("toolCount").and_then(Value::as_u64),
            }),
            Err(_) => json!({"reachable": false}),
        },
        _ => json!({"reachable": false}),
    };

    // Somente alteracoes de estado: sem hostnames, IPs, tokens ou payloads nos logs.
    if tailscale.get("state").and_then(Value::as_str) == Some("Running") {
        crate::logging::diag_transition("tailscale", "ok", "BACKEND_RUNNING");
    } else if tailscale.get("available").and_then(Value::as_bool) == Some(false) {
        crate::logging::diag_transition("tailscale", "error", "CLI_OR_DAEMON_UNAVAILABLE");
    } else {
        crate::logging::diag_transition("tailscale", "pending", "BACKEND_NOT_RUNNING");
    }
    if mcp.get("reachable").and_then(Value::as_bool) == Some(true) {
        crate::logging::diag_transition("mcp_public", "ok", "HEALTH_VERIFIED");
    } else {
        crate::logging::diag_transition("mcp_public", "error", "HEALTH_UNAVAILABLE");
    }
    Ok(json!({"tailscale": tailscale, "mcp": mcp}))
}


// Abre somente a URL fixa do Cockpit no navegador padrao.
// Nao cria outro WebView nem amplia permissoes de controle remoto.
/// !RASTRO: abrir URL fixa do painel mediante clique na agent-control.
/// CONTRATO: nao aceitar URL arbitraria nem criar outra janela WebView.
#[tauri::command]
pub(crate) fn open_cockpit_in_browser(window: tauri::WebviewWindow) -> Result<Value, String> {
    require_control_window(&window)?;
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        std::process::Command::new("explorer.exe")
            .arg("https://admin.centralldark.com")
            .creation_flags(0x0800_0000)
            .spawn()
            .map_err(|_| "COCKPIT_BROWSER_LAUNCH_FAILED")?;
        Ok(json!({"requested": true}))
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("COCKPIT_BROWSER_WINDOWS_ONLY".into())
    }
}
