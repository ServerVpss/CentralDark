import { ipcRenderer, contextBridge, type IpcRendererEvent } from 'electron';

const ipc = {
  invoke(...args: any[]) {
    return ipcRenderer.invoke('ipcTest', ...args);
  },
  // Compatibilidade com consumidores existentes; canais novos usam a ponte tipada abaixo.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  on(channel: string, func: Function) {
    const listener = (event: IpcRendererEvent, ...args: any[]) => func(...[event, ...args]);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
};

const centraldark = Object.freeze({
  getRuntime: () => ipcRenderer.invoke('centraldark:runtime:get'),
  getHermesHealth: () => ipcRenderer.invoke('centraldark:hermes:health'),
  openIntent: (intent: string) => ipcRenderer.invoke('centraldark:intent:open', intent),
  showMain: () => ipcRenderer.invoke('centraldark:main:show'),
  toggleWidget: () => ipcRenderer.invoke('centraldark:widget:toggle'),
  hideWidget: () => ipcRenderer.invoke('centraldark:widget:hide'),
});

contextBridge.exposeInMainWorld('ipc', ipc);
contextBridge.exposeInMainWorld('centraldark', centraldark);
