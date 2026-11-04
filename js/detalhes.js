/**
 * Página de detalhes estática (detalhes.html?id=N).
 * Lê dados.json e monta o mesmo conteúdo de detalhes.php.
 * Todo texto entra via textContent, sem montar HTML com dados.
 */
(function () {
  'use strict';

  const IMAGEM_PADRAO = 'img/datacenters/placeholder.svg';
  const elMain = document.getElementById('detalhes');

  /** Cria um elemento com classe e texto opcionais. */
  function el(tag, classe, texto) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto !== undefined && texto !== null) n.textContent = texto;
    return n;
  }

  /** Aceita apenas links http(s). */
  function urlSegura(url) {
    try {
      const u = new URL(url, location.href);
      return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  function link(url, texto) {
    const a = el('a', null, texto);
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  }

  /** Linha de crédito "Autor · Licença · fonte". */
  function credito(autor, licenca, fonte) {
    const small = el('small', null, [autor, licenca].filter(Boolean).join(' · '));
    const url = fonte && urlSegura(fonte);
    if (url) {
      if (small.textContent) small.append(' · ');
      small.append(link(url, 'fonte'));
    }
    return small;
  }

  function figura(arquivo, legenda, autor, licenca, fonte, classe) {
    const fig = el('figure', classe);
    const img = el('img');
    img.src = arquivo || IMAGEM_PADRAO;
    img.alt = legenda || '';
    img.loading = 'lazy';
    fig.append(img);
    if (arquivo) {
      const cap = el('figcaption', null, legenda);
      cap.append(credito(autor, licenca, fonte));
      fig.append(cap);
    }
    return fig;
  }

  function mostrarErro(msg) {
    elMain.replaceChildren(el('h1', null, 'Ops!'), el('p', 'aviso', msg));
  }

  function renderizar(dc) {
    document.title = dc.nome + ' — Mapa Mundial de Data Centers';
    const local = dc.cidade + ', ' + dc.pais;

    // Cabeçalho
    const cab = el('header', 'detalhes__cabecalho');
    if (dc.empresa_logo) {
      const logo = el('img', 'detalhes__logo');
      logo.src = dc.empresa_logo;
      logo.alt = 'Logo ' + dc.empresa;
      cab.append(logo);
    }
    const meta = [dc.empresa, local];
    if (dc.ano_inauguracao) meta.push('Inaugurado em ' + dc.ano_inauguracao);
    const titulo = el('div');
    titulo.append(el('h1', null, dc.nome), el('p', 'detalhes__meta', meta.join(' · ')));
    cab.append(titulo);

    // Foto principal
    const foto = figura(dc.imagem_principal, dc.imagem_legenda, dc.imagem_autor,
      dc.imagem_licenca, dc.imagem_fonte, 'detalhes__foto');
    foto.querySelector('img').alt = 'Foto de ' + dc.nome;
    foto.querySelector('img').loading = 'eager';

    // História (parágrafos separados por linha em branco)
    const hist = el('section', 'detalhes__historia');
    hist.append(el('h2', null, 'História'));
    String(dc.historia).trim().split(/\r?\n\s*\r?\n/).forEach(function (p) {
      hist.append(el('p', null, p));
    });

    // Ficha técnica
    const ficha = el('section', 'detalhes__ficha');
    const dl = el('dl');
    function item(rotulo, valor) {
      const dd = el('dd');
      dd.append(valor);
      dl.append(el('dt', null, rotulo), dd);
    }
    const site = dc.empresa_site && urlSegura(dc.empresa_site);
    item('Empresa', site ? link(site, dc.empresa) : dc.empresa);
    item('Localização', local);
    item('Coordenadas', dc.latitude + ', ' + dc.longitude);
    if (dc.ano_inauguracao) item('Inauguração', String(dc.ano_inauguracao));
    ficha.append(el('h2', null, 'Ficha técnica'), dl);

    elMain.replaceChildren(cab, foto, hist, ficha);

    // Galeria
    if (dc.imagens && dc.imagens.length) {
      const sec = el('section', 'detalhes__galeria');
      const grade = el('div', 'galeria');
      dc.imagens.forEach(function (img) {
        grade.append(figura(img.arquivo, img.legenda, img.autor, img.licenca, img.fonte));
      });
      sec.append(el('h2', null, 'Imagens'), grade);
      elMain.append(sec);
    }
  }

  const id = parseInt(new URLSearchParams(location.search).get('id'), 10);
  if (!(id > 0)) {
    mostrarErro('Data center inválido.');
    return;
  }

  fetch('dados.json')
    .then(function (resp) {
      if (!resp.ok) throw new Error('Erro ' + resp.status);
      return resp.json();
    })
    .then(function (lista) {
      const dc = lista.find(function (d) { return d.id === id; });
      if (dc) renderizar(dc);
      else mostrarErro('Data center não encontrado.');
    })
    .catch(function (erro) {
      console.error(erro);
      mostrarErro('Não foi possível carregar os dados.');
    });
})();
