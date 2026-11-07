# 🌍 Mapa Mundial de Data Centers

Globo 3D interativo com mais de 5 mil data centers do mundo. Os destaques aparecem como pins com a logo da empresa: ao tocar num deles, surge um resumo, e o botão **Mais detalhes** abre a história completa, com fotos e ficha técnica. Os demais aparecem como pontos, e uma barra de pesquisa encontra qualquer data center, empresa, cidade ou país.

**🔗 Ver o site:** https://luizapleite.github.io/datacenters/

![Globo com os pins dos data centers](img/preview.jpg)

## Destaques

- **Globo 3D** com rotação, zoom e arraste, feito com [Globe.gl](https://globe.gl/).
- **26 destaques em 6 continentes**: Google, Meta, Microsoft, AWS, Apple, Equinix, Teraco, NEXTDC, HostDime, OpenAI e xAI.
- **Data centers de IA** marcados com selo roxo, incluindo os gigantes recentes: Stargate, Colossus, Fairwater, Project Rainier, Prometheus e Hyperion.
- **Mais de 5 mil data centers** do OpenStreetMap, desenhados como pontos leves que funcionam até no celular.
- **Barra de pesquisa** por data center, empresa, cidade ou país, sem precisar de acentos. Ao escolher um lugar, abre a lista dos data centers de lá.
- **Filtros**: só destaques, todos os data centers ou só IA.
- **Histórias verdadeiras**, escritas a partir de anúncios oficiais e notícias, com datas e números conferidos.
- **Imagens com licença livre** do Wikimedia Commons, todas com autor, licença e link para a fonte.
- **Funciona no celular**: o globo se ajusta à tela e o balão vira um painel na parte de baixo.
- Todo o conteúdo em **português do Brasil**.

<img src="img/preview-celular.jpg" alt="Versão para celular com o balão aberto" width="260">

## Tecnologias

| Camada | Uso |
|---|---|
| HTML, CSS e JavaScript | Interface, globo e página de detalhes |
| [Globe.gl](https://globe.gl/) (Three.js) | Renderização do globo 3D |
| PHP 8 + PDO | API (`api.php`) e página de detalhes (`detalhes.php`) |
| MySQL | Banco com as tabelas `empresas`, `datacenters` e `pontos` |

## Duas formas de rodar

O projeto funciona com **PHP + MySQL** (desenvolvimento local ou hospedagem com PHP) e também como **site estático** (GitHub Pages, ou abrindo o `index.html` direto do disco). O `js/app.js` tenta usar a API em PHP. Se ela não estiver disponível, usa os dados de `js/dados.js` e `js/pontos.js` e abre `detalhes.html` em vez de `detalhes.php`.

```
MySQL ──► api.php / detalhes.php                     (com PHP)
  │
  └─► php exportar.php ──► js/dados.js + js/pontos.js ──► detalhes.html   (estático)
```

### Localmente, com Laragon (PHP + MySQL)

1. Clone o repositório dentro de `C:\laragon\www\` e inicie o Laragon.
2. Copie `.env.example` para `.env` e ajuste as credenciais do banco.
3. Crie e popule o banco:
   ```bash
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS datacenters CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
   mysql -u root --default-character-set=utf8mb4 datacenters < database.sql
   ```
4. Acesse `http://datacenters.test`.

### Atualizando a versão estática

Depois de alterar o banco, gere o `js/dados.js` e o `js/pontos.js` de novo e faça commit:

```bash
php exportar.php
```

## Estrutura

```
├── index.html          Página do globo
├── detalhes.php        Detalhes (versão PHP)
├── detalhes.html       Detalhes (versão estática)
├── api.php             API JSON (listar / pontos / detalhe)
├── config.php          Lê o .env e cria a conexão PDO
├── consultas.php       Consultas usadas pela API e pela exportação
├── exportar.php        Gera js/dados.js e js/pontos.js a partir do banco (só pelo terminal)
├── database.sql        Esquema e dados (destaques e pontos do OpenStreetMap)
├── css/style.css
├── js/dados.js         Destaques exportados para a versão estática
├── js/pontos.js        Pontos do OpenStreetMap para a versão estática
├── js/app.js           Globo, pins, pontos, filtros e balão
├── js/busca.js         Barra de pesquisa
├── js/detalhes.js      Monta a página de detalhes estática
└── img/
    ├── logos/          Logos das empresas
    ├── datacenters/    Fotos
    └── CREDITOS.md     Autor, licença e fonte de cada imagem e dos dados
```

## Segurança

- As credenciais ficam no `.env`, que está no `.gitignore` e nunca vai para o repositório.
- Consultas com PDO e *prepared statements*; saída escapada com `htmlspecialchars` (PHP) e `textContent` (JavaScript).
- O `.htaccess` bloqueia acesso direto ao `.env` e ao `.sql` em servidores Apache.

## Créditos

- Fotos e logos: [Wikimedia Commons](https://commons.wikimedia.org/). A lista completa está em [img/CREDITOS.md](img/CREDITOS.md).
- Pontos dos data centers: © colaboradores do [OpenStreetMap](https://www.openstreetmap.org/copyright), licença ODbL. País e cidade calculados com [Natural Earth](https://www.naturalearthdata.com/) (domínio público).
- A maioria dos destaques de IA não tem foto livre do prédio; nesses casos a página mostra uma foto da cidade, com legenda indicando isso.
- As logos são marcas registradas de suas respectivas empresas. A licença livre cobre o arquivo de imagem, não o uso da marca. Teraco e NEXTDC usam marcadores provisórios.
- Texturas da Terra: exemplos do projeto [three-globe](https://github.com/vasturiano/three-globe).
- Os endereços das regiões de nuvem (AWS, por exemplo) não são públicos. Nesses casos a posição no mapa é aproximada.
