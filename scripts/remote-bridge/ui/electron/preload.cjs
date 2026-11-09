const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("centralDark", {
  getStatus: () => ipcRenderer.invoke("bridge:status"),
  pairCasa: () => ipcRenderer.invoke("bridge:pair"),
  startBridge: () => ipcRenderer.invoke("bridge:start"),
  openCockpit: () => ipcRenderer.invoke("bridge:open-cockpit"),
});
