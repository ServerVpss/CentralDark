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
  getCentralHealth: () => ipcRenderer.invoke('centraldark:omni:health'),
  // Alias legado preservado: agora mede a porta única da CentralDark, não Hermes direto.
  getHermesHealth: () => ipcRenderer.invoke('centraldark:omni:health'),
  getScreenpipeHealth: () => ipcRenderer.invoke('centraldark:screenpipe:health'),
  openIntent: (intent: string) => ipcRenderer.invoke('centraldark:intent:open', intent),
  showMain: () => ipcRenderer.invoke('centraldark:main:show'),
  toggleWidget: () => ipcRenderer.invoke('centraldark:widget:toggle'),
  openUnigramDesktop: () => ipcRenderer.invoke('centraldark:unigram:open'),
  hideWidget: () => ipcRenderer.invoke('centraldark:widget:hide'),
});

contextBridge.exposeInMainWorld('ipc', ipc);
contextBridge.exposeInMainWorld('centraldark', centraldark);
