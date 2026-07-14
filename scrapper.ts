import { firefox } from 'playwright';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

async function runScraper() {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const url = 'https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/acoes/consultas/informacoes-por-periodo/relatorios-estruturados/';
  await page.goto(url);

  await page.locator('#onetrust-accept-btn-handler').click();

  const frame = page.frameLocator('#bvmf_iframe');

  await frame.locator('#bkdp_loading_b3').waitFor({ state: 'hidden', timeout: 60000 });
  await frame.locator('#docCategory').click();
  await frame.locator('id=4').click();

  

  const respostaPromise = page.waitForResponse(
    (response) => response.url().includes('sistemaswebb3-listados.b3.com.br')
  );

  await frame.locator('.b3-ga-button.btn.btn-primary').click();
  const resposta = await respostaPromise;
  const jsonResponse = await resposta.json();
  const items = jsonResponse.results || [];
  
  console.log(`Encontrados ${items.length} itens.`);

  console.log('[*] dfp selecionado');

  console.log('[*] LISTA DE ITENS:');
  
  const hashaArquivo = crypto.createHash('sha256').update(JSON.stringify(items)).digest('hex');
  const nomeArquivo = hashaArquivo + '.json';
  console.log(`[*] Salvando arquivo: ${nomeArquivo}`);

  console.log('[*] Scraper finalizado');
  await browser.close();


}

runScraper().catch(console.error);