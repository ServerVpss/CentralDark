// @owner: source_remote_bridge/ui/electron/preload.cjs
// @responsabilidade: UI/Tray e pareamento na instancia existente
// @pode: executar apenas funcoes ja autorizadas, respeitar contrato, isolamento e estado atual.
// @nao_pode: duplicar executor, quebrar consumidores, expor credenciais, mudar rede ou permissao por conta propria.
// @criterio: validar sintaxe/testes/readback; UNKNOWN nao e PASS; migracao nao ativa automaticamente outro runtime.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("centralDark", {
  onSidebarToggle: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = () => callback();
    ipcRenderer.on("bridge:ui-sidebar-toggle", listener);
    return () => ipcRenderer.removeListener("bridge:ui-sidebar-toggle", listener);
  },
  getAuthStatus: () => ipcRenderer.invoke("bridge:auth-status"),
  login: (email, password) => ipcRenderer.invoke("bridge:login", email, password),
  logout: () => ipcRenderer.invoke("bridge:logout"),
  getStatus: () => ipcRenderer.invoke("bridge:status"),
  onPairingStatus: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = (_event, state) => {
      if (state && typeof state.state === "string") callback(state);
    };
    ipcRenderer.on("bridge:pairing-status", listener);
    return () => ipcRenderer.removeListener("bridge:pairing-status", listener);
  },
  pairCasa: () => ipcRenderer.invoke("bridge:pair"),
  confirmPair: () => ipcRenderer.invoke("bridge:confirm-pair"),
  startBridge: () => ipcRenderer.invoke("bridge:start"),
  openCockpit: () => ipcRenderer.invoke("bridge:open-cockpit"),
  openCentralDarkOs: () => ipcRenderer.invoke("bridge:open-os"),
});
