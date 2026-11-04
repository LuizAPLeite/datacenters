# Projeto: Mapa Mundial de Data Centers

## Objetivo do projeto
Site com globo 3D (estilo Google Earth) que mostra onde ficam os data centers do mundo.
- Cada data center aparece no globo como um pin com a logo da empresa.
- Ao clicar no pin, abre um balão com poucas informações (nome, empresa, localização, resumo) e um botão "Mais detalhes".
- O botão "Mais detalhes" abre uma página com a história completa do data center, foto e outras imagens relevantes.
- Stack: HTML, CSS, JavaScript, PHP e MySQL. Biblioteca do globo: Globe.gl.
- Todos os textos do site em português do Brasil.
- A publicação do site só será tratada depois que ele estiver pronto e polido. Nessa hora, ensinar o passo a passo de hospedagem.
- Imagens e logos: preferir fontes com licença livre (ex.: Wikimedia Commons), registrando autor e licença.

## Ambiente local (Laragon, Windows)
- Pasta do projeto: `C:\laragon\www\datacenters`
- URLs: `http://datacenters.test` ou `http://localhost/datacenters/`
- Banco: MySQL do Laragon, banco `datacenters`
- Serviços: Apache, MySQL e PHP locais

### Comandos permitidos no terminal
- PHP: `php <script>`
- Composer: `composer install`, `composer require <pacote>`, `composer update`
- MySQL: `mysql -u root -p`, `mysqldump`
- NPM (assets): `npm install`, `npm run dev`, `npm run build`

## Regras de edição
1. Antes de alterar arquivos existentes, analise a estrutura do projeto. Altere apenas o necessário.
2. Mantenha o estilo de código consistente com o que já existe. Escreva código limpo, modular e comentado quando necessário.
3. Trate erros de forma defensiva em consultas SQL, APIs e formulários (use PDO com prepared statements e escape de saída com htmlspecialchars).
4. Credenciais do banco ficam em `.env` ou `config.php` local, nunca escritas direto no código. Nunca exponha senhas.

## Fluxo de trabalho
1. Análise: inspecione a estrutura e o código relevante.
2. Execução: crie ou modifique os arquivos necessários.
3. Comandos: rode migrações, Composer, NPM ou scripts PHP quando precisar validar.
4. Resumo ao final: diga quais arquivos mudaram, quais comandos foram rodados e como testar no navegador (ex.: `http://datacenters.test`).