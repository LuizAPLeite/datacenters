/**
 * Globo 3D de data centers (Globe.gl).
 *
 * Duas camadas:
 *  - Destaques: pins com a logo da empresa, resumo e página de detalhes.
 *  - Todos os data centers: pontos pequenos com dados do OpenStreetMap.
 *
 * Os dados vêm de api.php (com PHP) ou de js/dados.js e js/pontos.js
 * (versão estática: GitHub Pages ou index.html aberto direto do disco).
 */
(function () {
  'use strict';

  const TEXTURAS = 'https://unpkg.com/three-globe@2.31.0/example/img/';
  const LOGO_PADRAO = 'img/datacenters/placeholder.svg';
  const ICONE_PONTO = 'img/ponto.svg';
  const COR_PONTO = '#fbbf24';
  const MAX_ITENS_LISTA = 300;

  const elGlobo = document.getElementById('globo');
  const elBalao = document.getElementById('balao');
  const elLista = document.getElementById('lista');
  const elStatus = document.getElementById('status');

  let destaques = [];       // itens unificados (tipo 'destaque')
  let pontos = [];          // itens unificados (tipo 'ponto')
  let paginaDetalhes = 'detalhes.php';
  let veioDaLista = false;
  const filtros = { destaques: true, todos: true, ia: false };

  // ---------- Globo ----------
  const globo = Globe()(elGlobo)
    .globeImageUrl(TEXTURAS + 'earth-blue-marble.jpg')
    .bumpImageUrl(TEXTURAS + 'earth-topology.png')
    .backgroundImageUrl(TEXTURAS + 'night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#7dd3fc')
    .atmosphereAltitude(0.18)
    // Destaques: elementos HTML (pins com logo)
    .htmlLat('lat')
    .htmlLng('lng')
    .htmlAltitude(0.01)
    .htmlElement(criarPin)
    // Demais data centers: pontos 3D mesclados numa só geometria (leve com milhares)
    .pointLat('lat')
    .pointLng('lng')
    .pointColor(function () { return COR_PONTO; })
    .pointAltitude(0.004)
    .pointRadius(0.09)
    .pointResolution(6)
    .pointsMerge(true)
    // Anel pulsante no item selecionado
    .ringLat('lat')
    .ringLng('lng')
    .ringColor(function () { return function (t) { return 'rgba(251, 191, 36, ' + (1 - t) + ')'; }; })
    .ringMaxRadius(2.5)
    .ringPropagationSpeed(2.5)
    .ringRepeatPeriod(900);

  // Em telas estreitas (celular) a câmera fica mais longe para o globo caber inteiro
  function telaEstreita() { return window.innerWidth < 600; }
  function altitudeInicial() { return telaEstreita() ? 3.6 : 2.4; }
  /** Zoom ao abrir um item: nunca afasta a câmera se ela já estiver mais perto. */
  function altitudeFoco(item) {
    const alvo = (item && item.tipo === 'ponto' ? 0.45 : 1.6) * (telaEstreita() ? 1.5 : 1);
    return Math.min(globo.pointOfView().altitude, alvo);
  }

  // Começa com uma visão do Atlântico e rotação lenta
  globo.pointOfView({ lat: 20, lng: -40, altitude: altitudeInicial() });
  const controles = globo.controls();
  controles.autoRotate = true;
  controles.autoRotateSpeed = 0.35;

  function ajustarTamanho() {
    globo.width(window.innerWidth).height(window.innerHeight);
  }
  window.addEventListener('resize', ajustarTamanho);
  ajustarTamanho();

  function voarPara(lat, lng, altitude) {
    controles.autoRotate = false;
    globo.pointOfView({ lat: lat, lng: lng, altitude: altitude }, 900);
  }

  // ---------- Pins (destaques) ----------
  /** Cria o elemento HTML do pin (logo da empresa dentro de um marcador). */
  function criarPin(item) {
    const dc = item.dc;
    // O wrapper recebe o transform de posicionamento da Globe.gl;
    // o botão interno pode ter seu próprio transform (formato de gota).
    const wrapper = document.createElement('div');
    wrapper.className = 'pin-wrapper';

    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'pin';
    pin.style.setProperty('--cor', dc.empresa_cor || '#3b82f6');
    pin.title = dc.nome + ' — ' + dc.empresa;
    pin.setAttribute('aria-label', dc.nome);

    const img = document.createElement('img');
    img.src = dc.empresa_logo || LOGO_PADRAO;
    img.alt = dc.empresa;
    img.onerror = function () { this.src = LOGO_PADRAO; };
    pin.appendChild(img);
    wrapper.appendChild(pin);

    if (dc.ia) {
      const selo = document.createElement('span');
      selo.className = 'pin-ia';
      selo.textContent = 'IA';
      wrapper.appendChild(selo);
    }

    // Globe.gl desativa eventos por padrão nos elementos HTML
    wrapper.style.pointerEvents = 'auto';
    pin.addEventListener('click', function (ev) {
      ev.stopPropagation();
      veioDaLista = false;
      abrirItem(item);
    });
    return wrapper;
  }

  // ---------- Cliques no globo ----------
  /*
   * Os pontos são mesclados numa só geometria (para não pesar com milhares),
   * e a Globe.gl não avisa cliques sobre geometria mesclada. Por isso o
   * clique é detectado aqui: se o ponteiro não foi arrastado, converte a
   * posição da tela em latitude/longitude e procura o ponto mais próximo.
   * Cliques que começam num pin são tratados pelo próprio pin.
   */
  let inicioToque = null;
  elGlobo.addEventListener('pointerdown', function (ev) {
    inicioToque = { x: ev.clientX, y: ev.clientY };
  });
  elGlobo.addEventListener('pointerup', function (ev) {
    if (!inicioToque || ev.button !== 0) return;
    const arrastou = Math.hypot(ev.clientX - inicioToque.x, ev.clientY - inicioToque.y) > 6;
    inicioToque = null;
    if (arrastou) return;
    const r = elGlobo.getBoundingClientRect();
    tratarClique(globo.toGlobeCoords(ev.clientX - r.left, ev.clientY - r.top), ev);
  });

  function tratarClique(coords, ev) {
    if (ev && ev.target instanceof Element && ev.target.closest('.pin-wrapper')) return;
    const p = coords && pontoMaisProximo(coords.lat, coords.lng);
    if (p) {
      veioDaLista = false;
      abrirItem(p, { semVoo: true });
    } else {
      fecharBalao();
    }
  }

  function pontoMaisProximo(lat, lng) {
    if (!filtros.todos || filtros.ia) return null;
    const limite = Math.max(0.02, globo.pointOfView().altitude * 0.8);
    const cos = Math.cos(lat * Math.PI / 180);
    let melhor = null, menor = limite * limite;
    pontos.forEach(function (p) {
      const dLat = p.lat - lat;
      let dLng = p.lng - lng;
      if (dLng > 180) dLng -= 360; else if (dLng < -180) dLng += 360;
      const d = dLat * dLat + (dLng * cos) * (dLng * cos);
      if (d < menor) { menor = d; melhor = p; }
    });
    return melhor;
  }

  // ---------- Balão ----------
  function etiqueta(texto, classe) {
    const s = document.createElement('span');
    s.className = 'etiqueta ' + (classe || '');
    s.textContent = texto;
    return s;
  }

  /** Abre o balão de um destaque ou ponto. Usa textContent para evitar injeção de HTML. */
  function abrirItem(item, opcoes) {
    opcoes = opcoes || {};
    if (!opcoes.semVoo) voarPara(item.lat, item.lng, altitudeFoco(item));
    globo.ringsData([item]);

    const logo = elBalao.querySelector('.balao__logo');
    const etiquetas = elBalao.querySelector('.balao__etiquetas');
    const link = elBalao.querySelector('.balao__detalhes');
    etiquetas.replaceChildren();

    if (item.tipo === 'destaque') {
      const dc = item.dc;
      logo.src = dc.empresa_logo || LOGO_PADRAO;
      logo.alt = 'Logo ' + dc.empresa;
      elBalao.querySelector('.balao__nome').textContent = dc.nome;
      elBalao.querySelector('.balao__empresa').textContent = dc.empresa;
      elBalao.querySelector('.balao__resumo').textContent = dc.resumo;
      if (dc.ia) etiquetas.append(etiqueta('IA', 'etiqueta--ia'));
      if (dc.situacao === 'construcao') etiquetas.append(etiqueta('Em construção', 'etiqueta--obra'));
      link.textContent = 'Mais detalhes';
      link.href = paginaDetalhes + '?id=' + encodeURIComponent(dc.id);
      link.removeAttribute('target');
      link.removeAttribute('rel');
    } else {
      logo.src = ICONE_PONTO;
      logo.alt = '';
      elBalao.querySelector('.balao__nome').textContent = item.nome || 'Data center sem nome';
      elBalao.querySelector('.balao__empresa').textContent = item.nome ? (item.empresa || 'Operador não informado') : 'Nome não informado no mapa';
      elBalao.querySelector('.balao__resumo').textContent =
        'Informações do OpenStreetMap. Este data center ainda não tem página com história e fotos.';
      etiquetas.append(etiqueta('OpenStreetMap', 'etiqueta--osm'));
      link.textContent = 'Ver no OpenStreetMap';
      link.href = urlOsm(item.osm);
      link.target = '_blank';
      link.rel = 'noopener';
    }
    etiquetas.hidden = !etiquetas.childNodes.length;
    elBalao.querySelector('.balao__local').textContent =
      [item.cidade, item.pais].filter(Boolean).join(', ') || 'Local não identificado';

    elBalao.querySelector('.balao__voltar').hidden = !veioDaLista;
    // No celular, balão e lista ocupam o mesmo espaço
    if (telaEstreita()) elLista.hidden = true;
    elBalao.hidden = false;
  }

  function urlOsm(id) {
    const tipos = { n: 'node', w: 'way', r: 'relation' };
    const m = /^([nwr])(\d+)$/.exec(id || '');
    return m ? 'https://www.openstreetmap.org/' + tipos[m[1]] + '/' + m[2] : 'https://www.openstreetmap.org/';
  }

  function fecharBalao() {
    elBalao.hidden = true;
    globo.ringsData([]);
  }

  elBalao.querySelector('.balao__fechar').addEventListener('click', fecharBalao);
  elBalao.querySelector('.balao__voltar').addEventListener('click', function () {
    fecharBalao();
    elLista.hidden = false;
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && document.activeElement && document.activeElement.id !== 'busca') fecharBalao();
  });

  // ---------- Lista de um lugar (cidade ou país) ----------
  function mostrarLista(lugar) {
    const itens = lugar.itens.slice().sort(function (a, b) {
      return (a.tipo === 'destaque' ? 0 : 1) - (b.tipo === 'destaque' ? 0 : 1) ||
        (a.nome ? 0 : 1) - (b.nome ? 0 : 1) ||
        String(a.nome || a.empresa || '').localeCompare(String(b.nome || b.empresa || ''), 'pt-BR');
    });
    const n = itens.length;
    // "Brasil · 59 data centers" evita concordância errada ("em Brasil")
    elLista.querySelector('.lista__titulo').textContent =
      lugar.titulo + ' · ' + n + (n === 1 ? ' data center' : ' data centers');

    const ul = elLista.querySelector('.lista__itens');
    ul.replaceChildren();
    itens.slice(0, MAX_ITENS_LISTA).forEach(function (item) {
      const li = document.createElement('li');
      const bt = document.createElement('button');
      bt.type = 'button';
      bt.className = 'lista__item' + (item.tipo === 'destaque' ? ' lista__item--destaque' : '');
      const img = document.createElement('img');
      img.src = item.tipo === 'destaque' ? (item.dc.empresa_logo || LOGO_PADRAO) : ICONE_PONTO;
      img.alt = '';
      const txt = document.createElement('span');
      const t = document.createElement('strong');
      t.textContent = item.nome || item.empresa || 'Data center sem nome';
      const s = document.createElement('small');
      s.textContent = [item.nome ? item.empresa : null, item.cidade].filter(Boolean).join(' · ') || 'Sem mais informações';
      txt.append(t, s);
      bt.append(img, txt);
      bt.addEventListener('click', function () {
        veioDaLista = true;
        abrirItem(item);
      });
      li.append(bt);
      ul.append(li);
    });
    if (n > MAX_ITENS_LISTA) {
      const li = document.createElement('li');
      li.className = 'lista__mais';
      li.textContent = 'E mais ' + (n - MAX_ITENS_LISTA) + '. Refine a pesquisa por cidade para ver todos.';
      ul.append(li);
    }

    fecharBalao();
    elLista.hidden = false;
    ul.scrollTop = 0;
    // Quanto mais espalhados os data centers, mais longe fica a câmera
    const altitude = Math.min(2.4, Math.max(0.25, lugar.raio * 0.045 + 0.2)) * (telaEstreita() ? 1.4 : 1);
    voarPara(lugar.lat, lugar.lng, altitude);
  }

  elLista.querySelector('.lista__fechar').addEventListener('click', function () {
    elLista.hidden = true;
  });

  // ---------- Filtros ----------
  function aplicarFiltros() {
    let visiveis = filtros.destaques ? destaques : [];
    if (filtros.ia) visiveis = destaques.filter(function (d) { return d.dc.ia; });
    globo.htmlElementsData(visiveis);
    globo.pointsData(filtros.todos && !filtros.ia ? pontos : []);

    // Os botões mostram o que está visível de fato ("Todos" fica desmarcado no modo IA)
    const visivel = { destaques: filtros.destaques, todos: filtros.todos && !filtros.ia, ia: filtros.ia };
    document.querySelectorAll('.filtro').forEach(function (bt) {
      bt.setAttribute('aria-pressed', visivel[bt.dataset.filtro] ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.filtro').forEach(function (bt) {
    bt.addEventListener('click', function () {
      const f = bt.dataset.filtro;
      if (f === 'ia') {
        filtros.ia = !filtros.ia;
        if (filtros.ia) filtros.destaques = true;
      } else if (filtros.ia) {
        // Saindo do modo IA: mostra a camada escolhida
        filtros.ia = false;
        filtros[f] = true;
      } else {
        filtros[f] = !filtros[f];
      }
      aplicarFiltros();
    });
  });

  // ---------- Busca ----------
  const busca = window.criarBusca({
    campo: document.getElementById('busca'),
    resultados: document.getElementById('busca-resultados'),
    limpar: document.querySelector('.busca__limpar'),
    aoEscolher: function (r) {
      if (r.tipo === 'lugar') {
        mostrarLista(r);
      } else {
        veioDaLista = false;
        abrirItem(r.item);
      }
    },
  });

  function atualizarBusca() {
    busca.definirItens(destaques.concat(pontos));
  }

  // ---------- Dados ----------
  /** Busca um JSON e rejeita em caso de erro HTTP ou resposta inválida. */
  function buscarJson(url) {
    return fetch(url).then(function (resp) {
      return resp.json().then(function (dados) {
        if (!resp.ok) throw new Error(dados.erro || 'Erro ' + resp.status);
        return dados;
      });
    });
  }

  /** Carrega um script (funciona também em file://, ao contrário de fetch). */
  function carregarScript(src) {
    return new Promise(function (ok, falha) {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = function () { falha(new Error('Não foi possível carregar ' + src)); };
      document.body.appendChild(s);
    });
  }

  function paraDestaque(dc) {
    return { tipo: 'destaque', nome: dc.nome, empresa: dc.empresa, cidade: dc.cidade, pais: dc.pais,
      lat: dc.latitude, lng: dc.longitude, dc: dc };
  }

  // Formato compacto: [lat, lng, nome, operador, cidade, país, outros nomes, id OSM]
  function paraPonto(p) {
    return { tipo: 'ponto', lat: p[0], lng: p[1], nome: p[2], empresa: p[3], cidade: p[4], pais: p[5], alt: p[6], osm: p[7] };
  }

  function atualizarStatus() {
    const fmt = function (n) { return n.toLocaleString('pt-BR'); };
    elStatus.textContent = fmt(destaques.length) + ' destaques' +
      (pontos.length ? ' e ' + fmt(pontos.length) + ' data centers no mapa' : '');
  }

  // Com PHP (Laragon ou hospedagem com PHP) os dados vêm da API.
  // Sem PHP usa js/dados.js, js/pontos.js e a página detalhes.html.
  let semPhp = false;

  buscarJson('api.php?acao=listar')
    .catch(function (erro) {
      console.warn('API indisponível, usando js/dados.js:', erro.message);
      semPhp = true;
      paginaDetalhes = 'detalhes.html';
      if (!Array.isArray(window.DADOS_DATACENTERS)) throw new Error('js/dados.js não encontrado');
      return window.DADOS_DATACENTERS;
    })
    .then(function (dados) {
      destaques = dados.map(paraDestaque);
      aplicarFiltros();
      atualizarStatus();
      atualizarBusca();
      return semPhp
        ? carregarScript('js/pontos.js?v=6').then(function () { return window.PONTOS_DATACENTERS || []; })
        : buscarJson('api.php?acao=pontos');
    })
    .then(function (lista) {
      pontos = lista.map(paraPonto);
      aplicarFiltros();
      atualizarStatus();
      atualizarBusca();
      setTimeout(function () { elStatus.classList.add('status--oculto'); }, 3500);
    })
    .catch(function (erro) {
      console.error(erro);
      elStatus.textContent = 'Não foi possível carregar os dados: ' + erro.message;
      elStatus.classList.add('status--erro');
    });
})();
