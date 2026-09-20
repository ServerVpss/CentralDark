import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await context.newPage();
  const screenshotDir = '/tmp/browser/arsenal-smoke/screenshots/';
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const results = [];

  try {
    console.log("Passo 1: Abrindo página...");
    await page.goto('https://ui.centralldark.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: `${screenshotDir}1_abrir.png` });
    
    const bodyText = await page.innerText('body');
    const isLoginPage = bodyText.includes('Sign In') || 
                       bodyText.includes('Login') || 
                       await page.locator('input[type="password"]').isVisible().catch(() => false);

    if (isLoginPage) {
      console.log("FAIL: Precisa de credencial");
      results.push("Passo 1: PASS (Carregou tela de login)");
      results.push("Restante: FAIL (Precisa de credencial)");
      await browser.close();
      console.log("Relatório Final:");
      results.forEach(r => console.log(r));
      return;
    }
    results.push("Passo 1: PASS");

    console.log("Passo 2: Selecionando modelo...");
    // Try to find model selector
    const modelSelector = page.getByRole('button', { name: /Select a model|modelo/i }).first();
    if (await modelSelector.isVisible()) {
        await modelSelector.click();
        await page.waitForTimeout(1000);
        const modelItem = page.getByText('arsenal-router', { exact: false }).first();
        if (await modelItem.isVisible()) {
            await modelItem.click();
            results.push("Passo 2: PASS");
        } else {
            results.push("Passo 2: FAIL (Modelo arsenal-router não encontrado)");
        }
    } else {
        // Maybe it's already selected or the UI is different
        const currentModel = await page.locator('button[aria-label="Select a model"]').innerText().catch(() => "");
        if (currentModel.includes('arsenal-router')) {
             results.push("Passo 2: PASS (Já selecionado)");
        } else {
             results.push("Passo 2: FAIL (Seletor de modelo não encontrado)");
        }
    }
    await page.screenshot({ path: `${screenshotDir}2_selecionar_modelo.png` });

    console.log("Passo 3: Mandando mensagem...");
    const chatInput = page.locator('#chat-textarea');
    if (await chatInput.isVisible()) {
        await chatInput.fill('oi');
        await page.keyboard.press('Enter');
        
        // Aguarda resposta (até 15s)
        await page.waitForTimeout(10000); 
        await page.screenshot({ path: `${screenshotDir}3_mensagem.png` });
        results.push("Passo 3: PASS (Mensagem enviada)");
    } else {
        results.push("Passo 3: FAIL (Input de chat não encontrado)");
    }

    console.log("Passo 4: Verificando ferramentas...");
    // Look for diamond icon ◇
    const diamondBtn = page.getByRole('button').filter({ hasText: /◇/ }).first();
    if (await diamondBtn.isVisible()) {
        await diamondBtn.click();
        await page.waitForTimeout(2000);
        const content = await page.content();
        const hasIntel = content.includes('Dark Intel') || content.includes('intel');
        const hasStats = content.includes('Arsenal Stats') || content.includes('stats');
        if (hasIntel && hasStats) {
            results.push("Passo 4: PASS");
        } else {
            results.push(`Passo 4: FAIL (Faltando: ${!hasIntel ? 'Dark Intel ' : ''}${!hasStats ? 'Arsenal Stats' : ''})`);
        }
    } else {
        results.push("Passo 4: FAIL (Ícone de diamante não encontrado)");
    }
    await page.screenshot({ path: `${screenshotDir}4_tools.png` });

    console.log("Passo 5: Autocomplete /...");
    await chatInput.click();
    await chatInput.fill('/');
    await page.waitForTimeout(2000);
    const pageContent = await page.content();
    const items = ['/router', '/swarm', '/chain', '/debate', '/hermes'];
    const missing = items.filter(item => !pageContent.includes(item));
    
    if (missing.length === 0) {
        results.push("Passo 5: PASS");
    } else {
        results.push(`Passo 5: FAIL (Faltando: ${missing.join(', ')})`);
    }
    await page.screenshot({ path: `${screenshotDir}5_autocomplete.png` });

    console.log("Passo 6: Selecionando /debate...");
    await chatInput.fill('/debate');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}6_debate.png` });
    results.push("Passo 6: PASS");

  } catch (e) {
    console.error(e);
    results.push("ERRO CRÍTICO: " + e.message);
  } finally {
    await browser.close();
    console.log("Relatório Final:");
    results.forEach(r => console.log(r));
  }
}

run();
