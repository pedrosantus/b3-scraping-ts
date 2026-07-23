import { firefox } from 'playwright';
import fs from 'node:fs/promises';

function formatDate(data: Date): string {
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

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

  let dataFinal: Date = new Date();
  const anoLimite: number = 2021;

  while (dataFinal.getFullYear() >= anoLimite) {
    let dataInicial: Date = new Date(dataFinal);
    dataInicial.setDate(dataFinal.getDate() - 29);

    let stringDataInicial: string = formatDate(dataInicial);
    let stringDataFinal: string = formatDate(dataFinal);

    console.log(`\n[*] Buscando período: ${stringDataInicial} até ${stringDataFinal}`);

    const inputInitial = frame.locator('#initialDate');
    const inputFinal = frame.locator('#endDate');
    const pagination = frame.locator('#div_ > input');

    await inputInitial.clear();
    await inputInitial.pressSequentially(stringDataInicial, { delay: 50 });
    await inputInitial.press('Tab');

    await inputFinal.clear();
    await inputFinal.pressSequentially(stringDataFinal, { delay: 50 });
    await inputFinal.press('Tab');

    let respostaPromise = page.waitForResponse(
      (response) => response.url().includes('sistemaswebb3-listados.b3.com.br')
    );
    await frame.locator('.b3-ga-button.btn.btn-primary').click();

    await frame.locator('#bkdp_loading_b3').waitFor({ state: 'hidden', timeout: 60000 }).catch(() => { });
    const allData: Record<string, any>[] = [];

    let hasNextPage = true;
    while (hasNextPage) {
      const resposta = await respostaPromise;
      const jsonResponse = await resposta.json();
      const items = jsonResponse.results || [];

      console.log(`[*] Encontrados ${items.length} itens na página atual.`);

      allData.push(...items);
      await page.waitForTimeout(1000);

      const nextButton = frame.locator('#paginator_btn_nextPage');
      const classAttribute = await nextButton.getAttribute('class');
      if (classAttribute?.includes('disabled')) {
        hasNextPage = false;
        console.log(`[*] Não há mais páginas para processar.`);
      } else {
        respostaPromise = page.waitForResponse(
          (response) => response.url().includes('sistemaswebb3-listados.b3.com.br')
        );
        
        await frame.locator('#bkdp_loading_b3').waitFor({ state: 'hidden', timeout: 60000 }).catch(() => { });

        await nextButton.locator('a').click({ force: true });
      }
    }


    let nomeArquivo = `${stringDataInicial.replaceAll('/', '-')}_a_${stringDataFinal.replaceAll('/', '-')}.json`;

    try {
      console.log(`[*] Salvando arquivo: ${nomeArquivo}`);
      await fs.writeFile(`./data/${nomeArquivo}`, JSON.stringify(allData, null, 2));
    } catch (error) {
      console.error(`[*] Erro ao salvar o arquivo: ${error}`);
    }

    dataFinal = new Date(dataInicial);
    dataFinal.setDate(dataInicial.getDate() - 1);

    await page.waitForTimeout(1000);
  }

  console.log('\n[*] Scraper finalizado');
  await browser.close();
}

runScraper().catch(console.error);