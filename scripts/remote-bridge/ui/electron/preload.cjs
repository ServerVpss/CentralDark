const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("centralDark", {
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
});
