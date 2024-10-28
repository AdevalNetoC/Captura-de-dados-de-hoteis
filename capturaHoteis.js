const cheerio = require('cheerio'); 
const puppeteer = require('puppeteer');
const fs = require('fs'); 

const htmlEstruturado = `
<div class="hotel">
  <h2>Hotel Exemplo A</h2>
  <p class="endereco">Endereço: Rua Principal, 123, Cidade X</p>
  <p class="preco">Preço: R$ 250</p>
</div>
<div class="hotel">
  <h2>Hotel Exemplo B</h2>
  <p class="endereco">Endereço: Av. Central, 456, Cidade Y</p>
  <p class="preco">Preço: R$ 300</p>
</div>
`;

const $ = cheerio.load(htmlEstruturado);
const dadosHoteis = [];

$('.hotel').each((index, element) => {
  const nome = $(element).find('h2').text();
  const endereco = $(element).find('.endereco').text().replace('Endereço: ', '');
  const preco = $(element).find('.preco').text().replace('Preço: R$ ', '');
  dadosHoteis.push({ nome, endereco, preco });
});

async function capturaDadosNaoEstruturados() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.booking.com/hotel/br/magna-praia.pt-br.html?label=brave_nonbrand_city_br_85386afe-6467-451e-aa47-108e42171541&sid=9a0939b10a4e3aa09afce628b8902fdc&aid=2405612');
  
    const dadosNaoEstruturados = await page.evaluate(() => {
      const dados = [];
      document.querySelectorAll('.hotel').forEach((hotel) => {
        const nome = hotel.querySelector('h2') ? hotel.querySelector('h2').innerText : '';
        const endereco = hotel.querySelector('.endereco') ? hotel.querySelector('.endereco').innerText : '';
        const preco = hotel.querySelector('.preco') ? hotel.querySelector('.preco').innerText : '';
        dados.push({ nome, endereco, preco });
      });
      return dados;
    });
  
    await browser.close();
    return dadosNaoEstruturados;
  }

  function salvarEmArquivo(dados, nomeArquivo) {
    const linhas = dados.map(dado => `${dado.nome}, ${dado.endereco}, ${dado.preco}`).join('\n');
    fs.writeFileSync(nomeArquivo, linhas);
    console.log(`Dados salvos em ${nomeArquivo}`);
  }
  
  // Salvando dados estruturados e semiestruturados
  salvarEmArquivo(dadosHoteis, 'dados_hoteis_estruturados.csv');
  
  // Captura de dados não estruturados e salvamento
  capturaDadosNaoEstruturados().then(dadosNaoEstruturados => {
    salvarEmArquivo(dadosNaoEstruturados, 'dados_hoteis_nao_estruturados.csv');
  });
  