
<div align="center">
  <img src="https://playwright.dev/img/playwright-logo.svg" height="48" alt="Playwright" />
  <img src="https://skillicons.dev/icons?i=ts,nodejs,python" height="48" alt="TypeScript, Node.js e Python" />
</div>

# B3 Scraping TS
<br>

Scraper automatizado construído com TypeScript e Playwright para extrair "Relatórios Estruturados" do portal da B3. A extração de dados deste repositório alimenta um ecossistema maior focado em **Open Audit (auditoria aberta) utilizando Blockchain**.

O script navega retroativamente em blocos de 30 dias até 2021, interceptando as respostas da API da B3 e salvando na pasta `data/`. Um script Python consolida as extrações em um arquivo único.

## Como rodar o projeto

1. **Instale as dependências:**
```bash
   npm install

```

2. **Instale o navegador do Playwright (Firefox):**
```bash
npx playwright install firefox

```


3. **Execute o scraper:**
```bash
npm start

```


*Nota: O script roda nativamente via `node scrapper.ts`. Os arquivos parciais serão gerados dentro do diretório `./data`.*
4. **Consolide os dados gerados:**
```bash
python view.py

```


*Isso criará o arquivo final `dados.json` na raiz do repositório contendo todo o histórico extraído.*
