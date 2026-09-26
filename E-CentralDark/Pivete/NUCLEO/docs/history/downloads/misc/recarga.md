# OUTRO - recarga.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.git.desativado-20260630-013358\recarg17asbrasil-main\recarga.js
**SHA:** 58f4e0d2044394b6
**Timestamp:** 2026-08-28T02:39:05.158610
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg-color); color: var(--text-primary); flex-direction: column; gap: 20px;">
- <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg-color); color: var(--text-primary); flex-direction: column; gap: 20px; text-align: center; 
- <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg-color); color: var(--text-primary); flex-direction: column; gap: 20px;">
- <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg-color); color: var(--text-primary); flex-direction: column; gap: 20px;">
- container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 12px; z-index: 10000;';
- modalContent += '<div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">';

### Ouro Bruto (primeiros 5000 chars)
```
// Recarga Public Page Logic
class RecargaPublic {
    constructor() {
        this.api = api;
        this.db = db;
        this.catalog = [];
        this.selectedCarrier = null;
        this.selectedValue = null;
        this.selectedPhone = '';
        this.currentStep = 1;
        this.revendedorId = null; // ID do revendedor que está vendendo
        this.currentPaymentId = null;
        this.currentPaymentEmail = null;
        this.pixCheckInterval = null;
        this.statusCheckInterval = null; // Polling até status "feita"
        this._rechargeProcessing = false; // Flag para evitar processamento duplicado
        this.siteTitle = 'Recarga Express';
        this.init();
    }

    async init() {
        await this.db.init();
        await this.loadApiConfig();
        this.checkRevendedor();
        await this.loadRevendedorConfig();

        // Se a URL tiver pedido= (ou id=), exibir apenas a view de status (link fixo)
        const urlParams = new URLSearchParams(window.location.search);
        const pedidoId = urlParams.get('pedido') || urlParams.get('id');
        if (pedidoId && this.revendedorId) {
            await this.loadStatusView(pedidoId);
            return;
        }

        this.setupEventListeners();
        await this.checkMinimumBalance();
        this.loadCatalog();
        if (this.revendedorId) {
            await this.loadAndDisplayFloatingContacts();
        }
    }

    async loadApiConfig() {
        try {
            // SEMPRE carregar do servidor primeiro (fonte da verdade)
            // Isso garante que funciona em modo anônimo e outras sessões
            // Usar caminho absoluto para funcionar de qualquer lugar
            const r = await fetch('/api/data.php?action=config_get');
            const j = await r.json();
            if (j && j.success && j.data && typeof j.data === 'object') {
                const c = j.data;
                
                // API Key e Base URL
                if (c.adminApiKey) {
                    // Não sobrescrever com valor mascarado "********"
                    if (!String(c.adminApiKey).includes('*')) {
                        this.api.setApiKey(c.adminApiKey);
                        localStorage.setItem('adminApiKey', c.adminApiKey);
                    }
                }
                if (c.adminApiBaseURL) {
                    this.api.setBaseURL(c.adminApiBaseURL);
                    localStorage.setItem('adminApiBaseURL', c.adminApiBaseURL);
                }
                
                // Configurações do Mercado Pago (para pagamentos PIX)
                if (c.adminMercadoPagoModo !== undefined && c.adminMercadoPagoModo !== null) {
                    const modo = (c.adminMercadoPagoModo === 'test' || c.adminMercadoPagoModo === 'prod') ? c.adminMercadoPagoModo : 'prod';
                    localStorage.setItem('adminMercadoPagoModo', modo);
                }
                // Chaves sensíveis: manter localStorage se servidor retornar mascarado
                if (c.adminMercadoPagoKeyTest !== undefined && c.adminMercadoPagoKeyTest !== null) {
                    if (!c.adminMercadoPagoKeyTest.includes('*') && c.adminMercadoPagoKeyTest !== '') {
                        localStorage.setItem('adminMercadoPagoKeyTest', c.adminMercadoPagoKeyTest);
                    }
                }
                if (c.adminMercadoPagoKeyProd !== undefined && c.adminMercadoPagoKeyProd !== null) {
                    if (!c.adminMercadoPagoKeyProd.includes('*') && c.adminMercadoPagoKeyProd !== '') {
                        localStorage.setItem('adminMercadoPagoKeyProd', c.adminMercadoPagoKeyProd);
                    }
                }
                // Configurações do Virtual Pay: manter localStorage se servidor retornar mascarado
                if (c.adminVirtualPayClientId !== undefined && c.adminVirtualPayClientId !== null) {
                    if (!c.adminVirtualPayClientId.includes('*') && c.adminVirtualPayClientId !== '') {
                        localStorage.setItem('adminVirtualPayClientId', c.adminVirtualPayClientId);
                    }
                }
                if (c.adminVirtualPayClientSecret !== undefined && c.adminVirtualPayClientSecret !== null) {
                    if (!c.adminVirtualPayClientSecret.includes('*') && c.adminVirtualPayClientSecret !== '') {
                        localStorage.setItem('adminVirtualPayClientSecret', c.adminVirtualPayClientSecret);
                    }
                }
                // Módulo de pagamento selecionado (admin - fallback)
                if (c.adminPaymentModule !== undefined && c.adminPaymentModule !== null) {
                    const paymentModule = (c.adminPaymentModule === 'mercadopago' || c.adminPaymentModule === 'virtualpay' || c.adminPaymentModule === 'pushinpay') ? c.adminPaymentModule : 'mercadopago';
                    localStorage.setItem('adminPaymentModule', paymentModule);
                } else {
                    loca
```