# 🧿 CENTRALDARK · DEDUP RECEIPT

- `CentralDark-OneShot-Integrated` foi absorvido no mesmo corpo `CentralDark-Unified-OneShot`.
- arquivos idênticos entre os dois pacotes ficaram uma única vez.
- conflitos de mesmo caminho ficaram com a implementação canônica/unificada.
- a árvore antiga `CentralDark-Remote-Tray-NPX-ATUAL-FIX-20260909` não foi duplicada.
- o Remote Tray útil permanece em `vendor/remote-tray/CentralDark-Remote-Tray`.
- WebView2 Fixed Runtime foi absorvido uma única vez em `runtime/`.
- Bridge C# foi ajustado para compilador do Windows PowerShell 5.1.
- Remote Tray é reutilizado se já estiver rodando; não tenta abrir segunda instância.
- Segredo e Fulano mantêm OAuth/DPAPI separados no mesmo UnifiedRuntime.

`REUSE_BEFORE_CREATE=true`  
`ONE_SYSTEM_ONLY=true`  
`UNKNOWN_IS_NOT_PASS=true`
