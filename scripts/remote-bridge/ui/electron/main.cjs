// #OBSERVACOES#
// @owner scripts/remote-bridge/ui/electron/main.cjs
// @doc_ref scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md
// @last_updated 2026-11-09T00:08:00Z
// @implementado janela Electron, bandeja unica, health 9101 e OAuth existente
// @estado PACKAGED_RUNTIME_PASS
// @next_cursor validar visual e executar pareamento OAuth autorizado

const { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, shell } = require("electron");
const { execFile, spawn } = require("node:child_process");
const { promisify } = require("node:util");
const fs = require("node:fs");
const path = require("node:path");

const execFileAsync = promisify(execFile);
const HEALTH_URL = "http://127.0.0.1:9101/health";
const COCKPIT_URL =
  process.env.CENTRALDARK_COCKPIT_URL ||
  "http://127.0.0.1:8080/sala-controle?aba=admin";

let mainWindow;
let tray;
let quitting = false;

function bridgeResourcePath(fileName, developmentRelativePath = fileName) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "bridge", fileName);
  }

  return path.resolve(__dirname, "..", "..", developmentRelativePath);
}

function createTrayImage() {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">',
    '<rect width="32" height="32" rx="8" fill="#171816"/>',
    '<circle cx="16" cy="16" r="10" fill="none" stroke="#d6ad4b" stroke-width="2"/>',
    '<path d="M10 18l4-7 3 5 5-2" fill="none" stroke="#f5df9a" stroke-width="2" stroke-linecap="round"/>',
    "</svg>",
  ].join("");

  return nativeImage
    .createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`)
    .resize({ width: 16, height: 16 });
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
    if (!quitting) {
      event.preventDefault();
      mainWindow.hide();
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

ipcMain.handle("bridge:status", async () => ({
  observedAt: new Date().toISOString(),
  health: await readHealth(),
  tailscale: await readTailscale(),
}));

ipcMain.handle("bridge:pair", async () => ({
  started: true,
  pid: launchPowerShell(
    bridgeResourcePath(
      "CENTRALDARK-OAUTH-TRAY.ps1",
      path.join("canonical", "CENTRALDARK-OAUTH-TRAY.ps1"),
    ),
  ),
  state: "AUTH_RESULT_PENDING",
}));

ipcMain.handle("bridge:start", async () => ({
  started: true,
  pid: launchPowerShell(
    bridgeResourcePath("CentralDark-Remote-Bridge.ps1"),
  ),
  state: "STARTED_EFFECT_PENDING",
}));

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
  });
}

app.on("before-quit", () => {
  quitting = true;
});

app.on("window-all-closed", () => {
  // The tray remains the single owner of the running application.
});
