/**
 * Globo 3D de data centers (Globe.gl).
 * Busca os dados em api.php (ou em js/dados.js, na versão estática),
 * desenha um pin com a logo de cada empresa e mostra um balão com o
 * resumo ao clicar.
 */
(function () {
  'use strict';

  const TEXTURAS = 'https://unpkg.com/three-globe@2.31.0/example/img/';
  const LOGO_PADRAO = 'img/datacenters/placeholder.svg';

  const elGlobo = document.getElementById('globo');
  const elBalao = document.getElementById('balao');
  const elStatus = document.getElementById('status');

  // ---------- Globo ----------
  const globo = Globe()(elGlobo)
    .globeImageUrl(TEXTURAS + 'earth-blue-marble.jpg')
    .bumpImageUrl(TEXTURAS + 'earth-topology.png')
    .backgroundImageUrl(TEXTURAS + 'night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#7dd3fc')
    .atmosphereAltitude(0.18)
    .htmlLat('latitude')
    .htmlLng('longitude')
    .htmlAltitude(0.01)
    .htmlElement(criarPin)
    .onGlobeClick(aoClicarNoGlobo);

  // Em telas estreitas (celular) a câmera fica mais longe para o globo caber inteiro
  function telaEstreita() { return window.innerWidth < 600; }
  function altitudeInicial() { return telaEstreita() ? 3.6 : 2.4; }
  function altitudeFoco() { return telaEstreita() ? 2.4 : 1.6; }

  // Começa com uma visão do Atlântico e rotação lenta
  globo.pointOfView({ lat: 20, lng: -40, altitude: altitudeInicial() });
  const controles = globo.controls();
  controles.autoRotate = true;
  controles.autoRotateSpeed = 0.35;

  // Ajusta o tamanho ao redimensionar a janela
  function ajustarTamanho() {
    globo.width(window.innerWidth).height(window.innerHeight);
  }
  window.addEventListener('resize', ajustarTamanho);
  ajustarTamanho();

  // ---------- Pins ----------
  /** Cria o elemento HTML do pin (logo da empresa dentro de um marcador). */
  function criarPin(dc) {
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

    // Globe.gl desativa eventos por padrão nos elementos HTML
    wrapper.style.pointerEvents = 'auto';
    pin.addEventListener('click', function (ev) {
      ev.stopPropagation();
      abrirBalao(dc);
    });
    wrapper.appendChild(pin);
    return wrapper;
  }

  // ---------- Balão ----------
  /** Preenche e mostra o balão. Usa textContent para evitar injeção de HTML. */
  function abrirBalao(dc) {
    controles.autoRotate = false;
    globo.pointOfView({ lat: dc.latitude, lng: dc.longitude, altitude: altitudeFoco() }, 900);

    elBalao.querySelector('.balao__logo').src = dc.empresa_logo || LOGO_PADRAO;
    elBalao.querySelector('.balao__logo').alt = 'Logo ' + dc.empresa;
    elBalao.querySelector('.balao__nome').textContent = dc.nome;
    elBalao.querySelector('.balao__empresa').textContent = dc.empresa;
    elBalao.querySelector('.balao__local').textContent = dc.cidade + ', ' + dc.pais;
    elBalao.querySelector('.balao__resumo').textContent = dc.resumo;
    elBalao.querySelector('.balao__detalhes').href =
      paginaDetalhes + '?id=' + encodeURIComponent(dc.id);
    elBalao.hidden = false;
  }

  function fecharBalao() {
    elBalao.hidden = true;
  }

  /**
   * A Globe.gl também trata o clique num pin como clique no globo
   * (escuta "pointerup" em captura e dispara no frame seguinte), o que
   * fechava o balão logo após abrir. Ignora cliques vindos de um pin.
   */
  function aoClicarNoGlobo(coords, ev) {
    if (ev && ev.target instanceof Element && ev.target.closest('.pin-wrapper')) return;
    fecharBalao();
  }

  elBalao.querySelector('.balao__fechar').addEventListener('click', fecharBalao);
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') fecharBalao();
  });

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

  // Com PHP (Laragon ou hospedagem com PHP) os dados vêm da API.
  // Sem PHP (GitHub Pages ou index.html aberto direto do disco) usa o
  // js/dados.js gerado por exportar.php e a página detalhes.html.
  let paginaDetalhes = 'detalhes.php';

  buscarJson('api.php?acao=listar')
    .catch(function (erro) {
      console.warn('API indisponível, usando js/dados.js:', erro.message);
      paginaDetalhes = 'detalhes.html';
      if (!Array.isArray(window.DADOS_DATACENTERS)) throw new Error('js/dados.js não encontrado');
      return window.DADOS_DATACENTERS;
    })
    .then(function (dados) {
      globo.htmlElementsData(dados);
      elStatus.textContent = dados.length + ' data centers no mapa';
      setTimeout(function () { elStatus.classList.add('status--oculto'); }, 2500);
    })
    .catch(function (erro) {
      console.error(erro);
      elStatus.textContent = 'Não foi possível carregar os dados: ' + erro.message;
      elStatus.classList.add('status--erro');
    });
})();
