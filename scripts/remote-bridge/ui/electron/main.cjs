// #OBSERVACOES#
// @owner scripts/remote-bridge/ui/electron/main.cjs
// @doc_ref scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md
// @last_updated 2026-11-09T02:43:17Z
// @implementado icone PNG real na bandeja e dialogo X: minimizar/encerrar/cancelar
// @estado SOURCE_EDITED_BUILD_PENDING
// @next_cursor compilar pacote com recursos internos, validar tray e OAuth real

const { app, BrowserWindow, Menu, Tray, dialog, ipcMain, nativeImage, safeStorage, shell } = require("electron");
const { execFile, spawn } = require("node:child_process");
const { promisify } = require("node:util");
const fs = require("node:fs");
const path = require("node:path");
const { hostname } = require("node:os");

const execFileAsync = promisify(execFile);
const HEALTH_URL = "http://127.0.0.1:9101/health";
const MCP_BASE = "https://mcp.centralldark.com";
const DEVICE_CLIENT_ID = "centraldark.remote-bridge";
const COCKPIT_URL =
  process.env.CENTRALDARK_COCKPIT_URL ||
  "https://admin.centralldark.com/sala-controle";

let supabaseSession = null;
// Session and device credentials use Electron safeStorage in the same userData vault.
function supabaseSessionFile() { return path.join(app.getPath("userData"), "supabase-session.json"); }
function saveSupabaseSession(session) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error("WINDOWS_DPAPI_UNAVAILABLE");
  const target = supabaseSessionFile();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const encrypted = safeStorage.encryptString(JSON.stringify(session)).toString("base64");
  fs.writeFileSync(target + ".tmp", JSON.stringify({
    schema: "centraldark.remote-bridge.supabase-session.v1", encrypted,
  }), { mode: 0o600 });
  fs.renameSync(target + ".tmp", target);
}
function loadSupabaseSession() {
  try {
    if (!safeStorage.isEncryptionAvailable()) return null;
    const saved = JSON.parse(fs.readFileSync(supabaseSessionFile(), "utf8"));
    if (saved.schema !== "centraldark.remote-bridge.supabase-session.v1") return null;
    const session = JSON.parse(safeStorage.decryptString(Buffer.from(saved.encrypted, "base64")));
    if (!session?.access_token || !session?.refresh_token || !session?.user?.id) return null;
    // Sessões antigas não tinham carimbo inicial: iniciar a medição na migração.
    if (!Number.isSafeInteger(session.session_started_at) ||
        session.session_started_at < 1600000000000 ||
        session.session_started_at > Date.now() + 1000) {
      session.session_started_at = Date.now();
      saveSupabaseSession(session);
    }
    return session;
  } catch { return null; }
}
function clearSupabaseSession() {
  try { fs.rmSync(supabaseSessionFile(), { force: true }); } catch {}
}

function getSupabaseConfig() {
  const cfgPath = bridgeResourcePath(
    "canonical/CENTRALDARK-REMOTE-BRIDGE.config.json",
    "ui/assets/client-config.json",
  );
  const config = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  const auth = config.supabase_auth || {};
  const url = String(auth.url || process.env.CENTRALDARK_SUPABASE_URL || "").replace(/\/$/, "");
  const key = String(auth.publishable_key || process.env.CENTRALDARK_SUPABASE_PUBLISHABLE_KEY || "");
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(url) || !key || key.startsWith("sb_secret_")) {
    throw new Error("SUPABASE_PUBLIC_CONFIG_REQUIRED");
  }
  return { url, key };
}

async function supabaseAuthCall(pathname, { token, data, method = "GET" } = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(url + "/auth/v1/" + pathname, {
    method,
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
    signal: AbortSignal.timeout(12000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Exibir apenas cÃ³digos conhecidos do Supabase: nunca vazar resposta bruta,
    // senhas, e-mails, refresh tokens, JWTs nem detalhes internos no renderer.
    const known = {
      invalid_credentials: "E-mail ou senha incorretos. Confira os dados usados no Cockpit.",
      email_not_confirmed: "Confirme o e-mail cadastrado no Supabase antes de entrar.",
      validation_failed: "Dados de login invÃ¡lidos. Confira e-mail e senha.",
      over_request_rate_limit: "Muitas tentativas. Aguarde o limite do Supabase.",
      over_email_send_rate_limit: "Limite de envios de e-mail do Supabase atingido.",
      user_banned: "Conta desabilitada no Supabase.",
      signup_disabled: "Cadastro desabilitado. Use uma conta existente.",
    };
    const code = typeof result?.code === "string" ? result.code : "";
    if (known[code]) throw new Error(known[code] + " [" + code + "]");
    // Alguns projetos retornam 400 sem 'code', com 'error' genÃ©rico.
    const legacy = result?.error === "invalid_grant" ? "invalid_credentials" : null;
    if (legacy) throw new Error(known[legacy] + " [" + legacy + "]");
    throw new Error("Falha no login Supabase (HTTP " + response.status +
      "). CÃ³digo de diagnÃ³stico: " + (/^[a-z_]{3,60}$/.test(code) ? code : "UNKNOWN") + ".");
  }
  return result;
}

async function authenticatedOwner() {
  if (!supabaseSession?.access_token) throw new Error("SUPABASE_LOGIN_REQUIRED");
  if (Date.now() > (supabaseSession.expires_at * 1000) - 30000) {
    try {
      const refreshed = await supabaseAuthCall("token?grant_type=refresh_token", {
        method: "POST", data: { refresh_token: supabaseSession.refresh_token },
      });
      if (!refreshed?.access_token || !refreshed?.refresh_token ||
          refreshed?.user?.id !== supabaseSession.user?.id) {
        throw new Error("SUPABASE_REFRESH_USER_MISMATCH");
      }
      // Refresh renova o JWT, sem reiniciar o tempo da sessão do usuário.
      const renewed = { ...refreshed,
        session_started_at: supabaseSession.session_started_at || Date.now() };
      saveSupabaseSession(renewed);
      supabaseSession = renewed;
    } catch (error) {
      if (/invalid_credentials|invalid_refresh_token|MISMATCH/.test(String(error.message))) {
        supabaseSession = null;
        clearSupabaseSession();
      }
      throw error;
    }
  }
  try {
    const user = await supabaseAuthCall("user", { token: supabaseSession.access_token });
    if (!user?.id || user.id !== supabaseSession.user?.id || user.is_anonymous === true) {
      throw new Error("SUPABASE_USER_MISMATCH");
    }
    // Client support accounts require a verified Supabase user, not an admin role.
    return { id: user.id, email: user.email || "" };
  } catch (error) {
    // A network outage is not a logout; keep the encrypted session for retry.
    if (/SUPABASE_USER_MISMATCH|HTTP 401/.test(String(error.message))) {
      supabaseSession = null;
      clearSupabaseSession();
    }
    throw error;
  }
}

async function loginSupabase(email, password) {
  const validEmail = typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!validEmail || typeof password !== "string" || password.length < 1 || password.length > 1024) {
    throw new Error("LOGIN_INPUT_INVALID");
  }
  const session = await supabaseAuthCall("token?grant_type=password", {
    method: "POST", data: { email, password },
  });
  if (!session?.access_token || !session?.refresh_token || !session?.user?.id) {
    throw new Error("SUPABASE_SESSION_INVALID");
  }
  supabaseSession = { ...session, session_started_at: Date.now() };
  try {
    const user = await authenticatedOwner();
    saveSupabaseSession(supabaseSession);
    return { authenticated: true, user, sessionStartedAt: supabaseSession.session_started_at };
  } catch (error) { supabaseSession = null; throw error; }
}

let mainWindow;
let tray;
let quitting = false;
let pendingPair = null;
let pairingTimer = null;
let pairingPolling = false;
let pairing = { state: "UNPAIRED", code: null, expiresAt: null, deviceId: null, error: null };
let lastPairingBroadcast = "";
function publishPairingStatus() {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isDestroyed()) return;
  // Somente status publico: nunca enviar posse do dispositivo, JWT ou refresh token.
  const payload = {
    state: pairing.state, code: pairing.code || null,
    expiresAt: pairing.expiresAt || null,
    deviceId: pairing.deviceId || null, error: pairing.error || null,
  };
  const snapshot = JSON.stringify(payload);
  if (snapshot === lastPairingBroadcast) return;
  lastPairingBroadcast = snapshot;
  mainWindow.webContents.send("bridge:pairing-status", payload);
}

function bridgeResourcePath(fileName, developmentRelativePath = fileName) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "bridge", fileName);
  }

  return path.resolve(__dirname, "..", "..", developmentRelativePath);
}

function createTrayImage() {
  // Electron/Windows nao garante renderizacao de SVG em Tray: usar PNG real.
  const iconPath = path.join(__dirname, "..", "assets", "tray.png");
  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty() && fs.existsSync(iconPath)) {
    icon = nativeImage.createFromBuffer(fs.readFileSync(iconPath));
  }
  if (icon.isEmpty()) {
    throw new Error(`TRAY_ICON_MISSING_OR_EMPTY:${iconPath}`);
  }
  return icon.resize({ width: 16, height: 16 });
}

function showWindow() {
  if (!mainWindow) {
    return;
  }

  mainWindow.show();
  mainWindow.restore();
  mainWindow.focus();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 920,
    minHeight: 620,
    show: false,
    backgroundColor: "#171816",
    title: "CentralDark Remote Bridge",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#171816",
      symbolColor: "#f3e8bd",
      height: 42,
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const devUrl = !app.isPackaged && process.env.CENTRALDARK_BRIDGE_DEV_URL;
  if (devUrl && /^http:\/\/127\.0\.0\.1:5173\/?$/.test(devUrl)) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("close", (event) => {
    if (quitting) return;
    event.preventDefault();
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: "question",
      title: "CentralDark Remote Bridge",
      message: "O que deseja fazer com o Remote Bridge?",
      detail: "Minimizar mantÃ©m a ponte na bandeja do Windows. Encerrar fecha o aplicativo.",
      buttons: ["Minimizar para bandeja", "Encerrar completamente", "Cancelar"],
      defaultId: 0,
      cancelId: 2,
      noLink: true,
    });
    if (choice === 0) mainWindow.hide();
    if (choice === 1) {
      quitting = true;
      app.quit();
    }
  });
}

function createTray() {
  tray = new Tray(createTrayImage());
  tray.setToolTip("CentralDark Remote Bridge");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Abrir CentralDark Remote Bridge", click: showWindow },
      { label: "Abrir Cockpit", click: () => shell.openExternal(COCKPIT_URL) },
      { type: "separator" },
      {
        label: "Sair",
        click: () => {
          quitting = true;
          app.quit();
        },
      },
    ]),
  );
  tray.on("double-click", showWindow);
}

async function readHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(HEALTH_URL, { signal: controller.signal });
    const data = await response.json();
    return {
      reachable: response.ok,
      statusCode: response.status,
      name: data.name || "CentralDark Casa Commander",
      engineConnected: data.engine_connected === true,
      remoteVendor: data.remote_vendor === true,
      receipt: data.last_tool_receipt || data.last_authorized_tool || null,
    };
  } catch (error) {
    return {
      reachable: false,
      statusCode: 0,
      error: error.name === "AbortError" ? "TIMEOUT" : "UNREACHABLE",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function readTailscale() {
  const candidates = [
    path.join(process.env.ProgramFiles || "", "Tailscale", "tailscale.exe"),
    "tailscale.exe",
  ];

  for (const executable of candidates) {
    try {
      const { stdout } = await execFileAsync(executable, ["status", "--json"], {
        windowsHide: true,
        timeout: 4000,
      });
      const status = JSON.parse(stdout);
      return {
        available: true,
        state: status.BackendState || "UNKNOWN",
        self: status.Self?.HostName || null,
      };
    } catch {
      // Try the next known owner path.
    }
  }

  return { available: false, state: "UNKNOWN" };
}

function launchPowerShell(scriptPath) {
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`SCRIPT_NOT_FOUND:${scriptPath}`);
  }

  const child = spawn(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
    ],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  child.unref();
  return child.pid;
}

// Reutiliza o pareamento de dispositivos do MCP CentralDark, sem OAuth admin
// no computador do cliente e sem enviar segredo de posse para o navegador.
function authFile() {
  return path.join(app.getPath("userData"), "device-auth.json");
}

function saveDeviceAuth(auth) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error("WINDOWS_DPAPI_UNAVAILABLE");
  const target = authFile();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const encrypted = safeStorage.encryptString(JSON.stringify(auth)).toString("base64");
  fs.writeFileSync(target, JSON.stringify({
    schema: "centraldark.remote-bridge.device-auth.v1",
    encrypted,
  }), { mode: 0o600 });
}

function loadDeviceAuth() {
  try {
    if (!safeStorage.isEncryptionAvailable()) return null;
    const saved = JSON.parse(fs.readFileSync(authFile(), "utf8"));
    if (saved.schema !== "centraldark.remote-bridge.device-auth.v1") return null;
    return JSON.parse(safeStorage.decryptString(Buffer.from(saved.encrypted, "base64")));
  } catch {
    return null;
  }
}

async function postDevice(route, body, token = null) {
  const response = await fetch(MCP_BASE + "/device" + route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error("CENTRALDARK_MCP_HTTP_" + response.status + ":" +
      String(result.error || "ROUTE_UNAVAILABLE").slice(0, 80));
  }
  return result;
}

function stopPairingPoll() {
  if (pairingTimer) clearInterval(pairingTimer);
  pairingTimer = null;
  pendingPair = null;
}

async function verifyDeviceAuth(auth) {
  if (!auth?.token || !auth?.refresh_token || auth.revocation_pending)
    throw new Error("PAIRING_TOKEN_MISSING_OR_REVOKING");
  let current = auth;
  if (!current.token_expires_at ||
      Date.parse(current.token_expires_at) < Date.now() + 60000) {
    const fresh = await postDevice("/token/refresh", {}, current.refresh_token);
    if (!fresh.ok || fresh.device_id !== current.device_id || !fresh.token || !fresh.token_expires_at)
      throw new Error("PAIRING_REFRESH_UNVERIFIED");
    current = { ...current, token: fresh.token, token_expires_at: fresh.token_expires_at };
    saveDeviceAuth(current);
  }
  const heartbeat = await postDevice("/heartbeat", {
    capabilities: { remote_bridge: true, source: "centraldark-remote-bridge" },
  }, current.token);
  if (!heartbeat.ok || heartbeat.device_id !== current.device_id)
    throw new Error("PAIRING_HEARTBEAT_UNVERIFIED");
  return heartbeat;
}
function clearDeviceAuth() { try { fs.rmSync(authFile(), { force: true }); } catch {} }
async function retryDeviceRevocation() {
  const auth = loadDeviceAuth();
  if (!auth?.revocation_pending) return true;
  try {
    const result = await postDevice("/devices/self/revoke", { device_id: auth.device_id }, auth.token);
    if (!result.ok || result.device_id !== auth.device_id) throw new Error("REVOCATION_UNVERIFIED");
    clearDeviceAuth();
    return true;
  } catch { return false; }
}

async function pollPairing() {
  if (!pendingPair || pairingPolling) return;
  if (Date.now() >= pendingPair.expiresAt) {
    pairing = { ...pairing, state: "PAIRING_EXPIRED", error: "PRAZO_DE_120_SEGUNDOS_ENCERRADO" };
    stopPairingPoll();
    publishPairingStatus();
    return;
  }
  pairingPolling = true;
  try {
    const result = await postDevice("/pair/status", {
      id: pendingPair.id,
      secret: pendingPair.secret,
    });
    if (result.status === "pending") return;
    if (result.status !== "approved") {
      pairing = { ...pairing, state: "PAIRING_" + String(result.status).toUpperCase() };
      stopPairingPoll();
      return;
    }
    if (!result.token || !result.refresh_token || !result.device_id) {
      throw new Error("PAIRING_TOKEN_INCOMPLETE");
    }
    const auth = {
      device_id: result.device_id,
      token: result.token,
      refresh_token: result.refresh_token,
      token_expires_at: result.token_expires_at,
      owner_user_id: supabaseSession?.user?.id || null,
    };
    if (!auth.owner_user_id) throw new Error("SUPABASE_SESSION_LOST_DURING_PAIRING");
    saveDeviceAuth(auth); // DPAPI antes do heartbeat: token de uso unico nao se perde.
    stopPairingPoll();
    try {
      await verifyDeviceAuth(auth);
      pairing = { state: "PAIRED_VERIFIED", code: null, expiresAt: null,
        deviceId: auth.device_id, error: null };
    } catch {
      pairing = { state: "TOKEN_SAVED_HEARTBEAT_PENDING", code: null,
        expiresAt: null, deviceId: auth.device_id, error: "MCP_HEARTBEAT_UNVERIFIED" };
    }
  } catch (error) {
    pairing = { ...pairing, error: String(error.message || "PAIRING_POLL_FAILED").slice(0, 100) };
  } finally {
    pairingPolling = false;
    publishPairingStatus();
  }
}

async function confirmPairInApp() {
  const owner = await authenticatedOwner();
  if (!owner || !pendingPair || Date.now() >= pendingPair.expiresAt) {
    throw new Error("PAIRING_NOT_PENDING");
  }
  // Reutiliza o /authorize canÃ´nico, sem abrir navegador e sem expor o nonce ao renderer.
  const url = new URL(MCP_BASE + "/authorize");
  url.searchParams.set("client_id", DEVICE_CLIENT_ID);
  url.searchParams.set("pair_id", pendingPair.id);
  const consent = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8000) });
  const redirect = new URL(consent.headers.get("location") || "", MCP_BASE);
  if (consent.status !== 302 || redirect.origin !== "https://admin.centralldark.com" ||
    redirect.pathname !== "/mcp-autorizar" || redirect.searchParams.get("pair_code") !== pairing.code ||
    redirect.searchParams.get("pair_id") !== pendingPair.id ||
    !redirect.searchParams.get("pair_nonce")) {
    throw new Error("PAIRING_CHALLENGE_UNVERIFIED");
  }
  const approval = await fetch(MCP_BASE + "/authorize", {
    method: "POST", redirect: "manual",
    headers: { Authorization: "Bearer " + supabaseSession.access_token,
      "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DEVICE_CLIENT_ID, pair_id: pendingPair.id, pair_code: pairing.code,
      pair_nonce: redirect.searchParams.get("pair_nonce"),
    }).toString(),
    signal: AbortSignal.timeout(10000),
  });
  const location = new URL(approval.headers.get("location") || "", MCP_BASE);
  if (approval.status !== 302 || location.origin !== "https://admin.centralldark.com" ||
      location.searchParams.get("success") !== "1") {
    const checks = [[
      "G01_HTTP_001", approval.status === 302],
      ["G02_REDIRECT_001", location.protocol === "https:"],
      ["G02_REDIRECT_002", location.origin === "https://admin.centralldark.com"],
      ["G02_REDIRECT_003", location.pathname === "/mcp-autorizar"],
      ["G03_APPROVAL_001", location.searchParams.get("success") === "1"],
    ];
    const reason = checks.filter(([, ok]) => !ok).map(([id]) => id).join("+") || "G00_UNKNOWN_001";
    throw new Error("MCP_OWNER_APPROVAL_NOT_ACCEPTED_" + approval.status + "_" + reason);
  }
  return { state: "AUTH_RESULT_PENDING", code: pairing.code };
}

async function pairCasa() {
  if (pendingPair && Date.now() < pendingPair.expiresAt) {
    return { state: "WAITING_OWNER_CONSENT", code: pairing.code };
  }
  const owner = await authenticatedOwner();
  const existing = loadDeviceAuth();
  if (existing?.revocation_pending) {
    if (!(await retryDeviceRevocation())) throw new Error("PAIRING_PREVIOUS_REVOCATION_PENDING");
  } else if (existing?.token && existing.owner_user_id !== owner.id) {
    throw new Error("PAIRING_BELONGS_TO_OTHER_ACCOUNT");
  }
  if (existing?.token && existing.owner_user_id === owner.id && !existing.revocation_pending) {
    try {
      await verifyDeviceAuth(existing);
      pairing = { state: "PAIRED_VERIFIED", code: null, expiresAt: null,
        deviceId: existing.device_id, error: null };
      publishPairingStatus();
      return { state: "PAIRED_VERIFIED" };
    } catch {
      // Sessao antiga nao equivale a login confirmado; iniciar tentativa nova.
    }
  }
  const request = await postDevice("/pair/start", {
    device_name: hostname(),
    executor: "remote-bridge",
    surface: "windows-tray",
  });
  if (!request.ok || !/^[A-F0-9]{4}-[A-F0-9]{4}$/.test(request.code) ||
      !request.pair_id || !request.pair_secret) {
    throw new Error("PAIRING_START_INVALID");
  }
  const expiresAt = Date.parse(request.expires_at);
  if (!Number.isFinite(expiresAt)) throw new Error("PAIRING_EXPIRATION_INVALID");
  pendingPair = { id: request.pair_id, secret: request.pair_secret, expiresAt };
  pairing = { state: "WAITING_OWNER_CONSENT", code: request.code,
    expiresAt: request.expires_at, deviceId: null, error: null };
  publishPairingStatus();
  pairingTimer = setInterval(() => { void pollPairing(); }, 1800);
  pairingTimer.unref?.();
  return { state: "AUTH_RESULT_PENDING", code: request.code };
}

ipcMain.handle("bridge:auth-status", async () => {
  if (!supabaseSession) return { authenticated: false };
  try {
    return { authenticated: true, user: await authenticatedOwner(),
      sessionStartedAt: supabaseSession.session_started_at };
  } catch { return { authenticated: false, offline: Boolean(supabaseSession) }; }
});
ipcMain.handle("bridge:login", async (_event, email, password) => loginSupabase(email, password));
ipcMain.handle("bridge:logout", async () => {
  stopPairingPoll();
  const auth = loadDeviceAuth();
  if (auth?.token && auth.device_id) {
    saveDeviceAuth({ ...auth, revocation_pending: true });
    await retryDeviceRevocation();
  } else { clearDeviceAuth(); }
  supabaseSession = null;
  clearSupabaseSession();
  pairing = { state: loadDeviceAuth()?.revocation_pending ? "REVOKE_PENDING_NETWORK" : "UNPAIRED",
    code: null, expiresAt: null, deviceId: null, error: null };
  publishPairingStatus();
  return { authenticated: false };
});
ipcMain.handle("bridge:status", async () => {
  await authenticatedOwner();
  const [health, tailscale] = await Promise.all([readHealth(), readTailscale()]);
  return {
    observedAt: new Date().toISOString(),
    health, tailscale, pairing: { ...pairing },
  };
});

ipcMain.handle("bridge:pair", async () => { await authenticatedOwner(); return pairCasa(); });
ipcMain.handle("bridge:confirm-pair", async () => confirmPairInApp());

ipcMain.handle("bridge:start", async () => {
  await authenticatedOwner();
  const script = bridgeResourcePath("CentralDark-Remote-Bridge.ps1");
  const config = bridgeResourcePath(
    path.join("canonical", "CENTRALDARK-REMOTE-BRIDGE.config.json"));
  const agent = bridgeResourcePath("CentralDark-Casa-Agent.mjs");
  for (const resource of [script, config, agent]) {
    if (!fs.existsSync(resource)) throw new Error("BRIDGE_RESOURCE_MISSING:" + path.basename(resource));
  }
  return { started: true, pid: launchPowerShell(script), state: "STARTED_EFFECT_PENDING" };
});

ipcMain.handle("bridge:open-cockpit", async () => {
  await authenticatedOwner();
  await shell.openExternal(COCKPIT_URL);
  return { opened: true, url: COCKPIT_URL };
});

if (!app.isPackaged && process.env.CENTRALDARK_BRIDGE_DEV_URL) {
  app.setPath("userData", path.join(app.getPath("userData"), "dev"));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", showWindow);
  app.whenReady().then(() => {
    supabaseSession = loadSupabaseSession();
    createWindow();
    createTray();
    const saved = loadDeviceAuth();
    if (saved?.revocation_pending) {
      pairing = { state: "REVOKE_PENDING_NETWORK", code: null,
        expiresAt: null, deviceId: null, error: null };
      void retryDeviceRevocation();
    } else if (saved?.token && saved.owner_user_id === supabaseSession?.user?.id) {
      pairing = { state: "LOCAL_TOKEN_UNVERIFIED", code: null, expiresAt: null,
        deviceId: saved.device_id || null, error: null };
      void verifyDeviceAuth(saved).then(() => {
        pairing = { ...pairing, state: "PAIRED_VERIFIED" };
        publishPairingStatus();
      }).catch(() => {
        pairing = { ...pairing, state: "LOCAL_TOKEN_UNVERIFIED", error: "HEARTBEAT_UNVERIFIED" };
        publishPairingStatus();
      });
    }
    // Keep session and device alive in the main process while window is minimized.
    let busy = false;
    const continuity = setInterval(async () => {
      if (busy) return;
      busy = true;
      try {
        if (!(await retryDeviceRevocation())) return;
        if (!supabaseSession) return;
        const user = await authenticatedOwner();
        const current = loadDeviceAuth();
        if (!current?.token || current.owner_user_id !== user.id || current.revocation_pending) return;
        await verifyDeviceAuth(current);
        pairing = { state: "PAIRED_VERIFIED", code: null,
          expiresAt: null, deviceId: current.device_id, error: null };
      } catch (error) {
        if (loadDeviceAuth()?.token)
          pairing = { ...pairing, state: "LOCAL_TOKEN_UNVERIFIED",
            error: String(error.message || "CONNECTION_RETRY_PENDING").slice(0,90) };
      } finally {
        busy = false;
        publishPairingStatus();
      }
    }, 30000);
    continuity.unref?.();
  });
}

app.on("before-quit", () => {
  quitting = true;
  stopPairingPoll();
});

app.on("window-all-closed", () => {
  // The tray remains the single owner of the running application.
});
