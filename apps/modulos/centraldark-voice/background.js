// Service worker mínimo — só existe pra MV3 aceitar o manifest e
// pra reagir a instalações. Não faz nada pesado.
chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log("[CentralDark Voice] instalado:", reason);
  if (reason === "install") {
    chrome.runtime.openOptionsPage?.();
    chrome.action?.openPopup?.().catch(() => {});
  }
});
