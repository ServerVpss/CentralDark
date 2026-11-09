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

let mainWindow;
let tray;
let quitting = false;
let pendingPair = null;
let pairingTimer = null;
let pairingPolling = false;
let pairing = { state: "UNPAIRED", code: null, expiresAt: null, deviceId: null, error: null };

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

  mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("close", (event) => {
    if (quitting) return;
    event.preventDefault();
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: "question",
      title: "CentralDark Remote Bridge",
      message: "O que deseja fazer com o Remote Bridge?",
      detail: "Minimizar mantém a ponte na bandeja do Windows. Encerrar fecha o aplicativo.",
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
  const heartbeat = await postDevice("/heartbeat", {
    capabilities: { remote_bridge: true, source: "centraldark-remote-bridge" },
  }, auth.token);
  if (!heartbeat.ok || heartbeat.device_id !== auth.device_id) {
    throw new Error("PAIRING_HEARTBEAT_UNVERIFIED");
  }
  return heartbeat;
}

async function pollPairing() {
  if (!pendingPair || pairingPolling) return;
  if (Date.now() >= pendingPair.expiresAt) {
    pairing = { ...pairing, state: "PAIRING_EXPIRED", error: "PRAZO_DE_120_SEGUNDOS_ENCERRADO" };
    stopPairingPoll();
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
    };
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
  }
}

async function openPairConsent(method = "code") {
  if (!pendingPair || Date.now() >= pendingPair.expiresAt)
    throw new Error("PAIRING_NOT_PENDING");
  const url = new URL(MCP_BASE + "/authorize");
  url.searchParams.set("client_id", DEVICE_CLIENT_ID);
  url.searchParams.set("pair_id", pendingPair.id);
  url.searchParams.set("auth_method", method === "password" ? "password" : "code");
  await shell.openExternal(url.toString());
  return { state: "AUTH_RESULT_PENDING", code: pairing.code };
}

async function pairCasa() {
  if (pendingPair && Date.now() < pendingPair.expiresAt) {
    return openPairConsent("code");
  }
  const existing = loadDeviceAuth();
  if (existing?.token) {
    try {
      await verifyDeviceAuth(existing);
      pairing = { state: "PAIRED_VERIFIED", code: null, expiresAt: null,
        deviceId: existing.device_id, error: null };
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
  try {
    await openPairConsent("code");
  } catch (error) {
    stopPairingPoll();
    pairing = { ...pairing, state: "BROWSER_OPEN_FAILED", error: "BROWSER_OPEN_FAILED" };
    throw error;
  }
  pairingTimer = setInterval(() => { void pollPairing(); }, 1800);
  pairingTimer.unref?.();
  return { state: "AUTH_RESULT_PENDING", code: request.code };
}

ipcMain.handle("bridge:status", async () => ({
  observedAt: new Date().toISOString(),
  health: await readHealth(),
  tailscale: await readTailscale(),
  pairing: { ...pairing },
}));

ipcMain.handle("bridge:pair", async () => pairCasa());
ipcMain.handle("bridge:open-consent", async (_event, method) => openPairConsent(method));

ipcMain.handle("bridge:start", async () => {
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
  await shell.openExternal(COCKPIT_URL);
  return { opened: true, url: COCKPIT_URL };
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", showWindow);
  app.whenReady().then(() => {
    createWindow();
    createTray();
    const saved = loadDeviceAuth();
    if (saved?.token) {
      pairing = { state: "LOCAL_TOKEN_UNVERIFIED", code: null, expiresAt: null,
        deviceId: saved.device_id || null, error: null };
      void verifyDeviceAuth(saved).then(() => {
        pairing = { ...pairing, state: "PAIRED_VERIFIED" };
      }).catch(() => {
        pairing = { ...pairing, state: "LOCAL_TOKEN_UNVERIFIED", error: "HEARTBEAT_UNVERIFIED" };
      });
    }
  });
}

app.on("before-quit", () => {
  quitting = true;
  stopPairingPoll();
});

app.on("window-all-closed", () => {
  // The tray remains the single owner of the running application.
});
