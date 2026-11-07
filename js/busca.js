/**
 * Barra de pesquisa do globo.
 * Procura data centers (destaques e pontos do OpenStreetMap) por nome,
 * empresa, cidade ou país e também lista "lugares" (cidades e países)
 * com a quantidade de data centers em cada um.
 *
 * Uso: const busca = criarBusca({ campo, resultados, limpar, aoEscolher });
 *      busca.definirItens(itens);   // itens no formato unificado de app.js
 */
(function () {
  'use strict';

  const MAX_LUGARES = 5;
  const MAX_DATACENTERS = 8;

  /** Minúsculas e sem acentos, para comparar "São Paulo" com "sao paulo". */
  function normalizar(texto) {
    return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  /**
   * Nota de relevância: 0 = começa com a busca, 1 = alguma palavra começa
   * com ela, 2 = contém. Retorna -1 se algum termo não aparece.
   */
  function nota(chave, termos, consulta) {
    if (!termos.every(function (t) { return chave.indexOf(t) !== -1; })) return -1;
    if (chave.indexOf(consulta) === 0) return 0;
    if ((' ' + chave).indexOf(' ' + termos[0]) !== -1) return 1;
    return 2;
  }

  /** Centro e abrangência (em graus) de um conjunto de itens. */
  function centro(itens) {
    let lat = 0, lng = 0;
    itens.forEach(function (i) { lat += i.lat; lng += i.lng; });
    lat /= itens.length; lng /= itens.length;
    let raio = 0;
    itens.forEach(function (i) { raio = Math.max(raio, Math.abs(i.lat - lat), Math.abs(i.lng - lng)); });
    return { lat: lat, lng: lng, raio: raio };
  }

  function criarBusca(opcoes) {
    const campo = opcoes.campo;
    const caixa = opcoes.resultados;
    const limpar = opcoes.limpar;

    let indiceItens = [];   // { item, chave }
    let indiceLugares = []; // { titulo, tipo, chave, itens }
    let opcoesAtuais = [];  // resultados exibidos, na ordem
    let ativo = -1;
    let espera = null;

    function definirItens(itens) {
      indiceItens = itens
        .filter(function (i) { return i.nome || i.empresa; })
        .map(function (i) {
          return { item: i, chave: normalizar([i.nome, i.empresa, i.cidade, i.pais, i.alt].filter(Boolean).join(' ')) };
        });

      // Agrupa por país e por cidade
      const grupos = new Map();
      function adicionar(chaveGrupo, titulo, tipo, item) {
        if (!grupos.has(chaveGrupo)) grupos.set(chaveGrupo, { titulo: titulo, tipo: tipo, itens: [] });
        grupos.get(chaveGrupo).itens.push(item);
      }
      itens.forEach(function (i) {
        if (i.pais) adicionar('p:' + i.pais, i.pais, 'pais', i);
        if (i.cidade) adicionar('c:' + i.cidade + '|' + (i.pais || ''), i.cidade + (i.pais ? ', ' + i.pais : ''), 'cidade', i);
      });
      indiceLugares = Array.from(grupos.values()).map(function (g) {
        g.chave = normalizar(g.titulo);
        return g;
      });
      if (campo.value.trim()) pesquisar();
    }

    function pesquisar() {
      const consulta = normalizar(campo.value.trim());
      limpar.hidden = !campo.value;
      if (consulta.length < 2) { fechar(); return; }
      const termos = consulta.split(/\s+/);

      const lugares = indiceLugares
        .map(function (l) { return { l: l, n: nota(l.chave, termos, consulta) }; })
        .filter(function (r) { return r.n >= 0; })
        .sort(function (a, b) {
          return a.n - b.n || (a.l.tipo === 'pais' ? -1 : 0) - (b.l.tipo === 'pais' ? -1 : 0) || b.l.itens.length - a.l.itens.length;
        })
        .slice(0, MAX_LUGARES)
        .map(function (r) { return r.l; });

      const dcs = indiceItens
        .map(function (r) { return { i: r.item, n: nota(r.chave, termos, consulta) }; })
        .filter(function (r) { return r.n >= 0; })
        .sort(function (a, b) {
          return (a.i.tipo === 'destaque' ? 0 : 1) - (b.i.tipo === 'destaque' ? 0 : 1) || a.n - b.n ||
            String(a.i.nome || a.i.empresa).localeCompare(String(b.i.nome || b.i.empresa), 'pt-BR');
        })
        .slice(0, MAX_DATACENTERS)
        .map(function (r) { return r.i; });

      renderizar(lugares, dcs, campo.value.trim());
    }

    function opcao(titulo, subtitulo, classe) {
      const li = document.createElement('li');
      li.className = 'busca__opcao ' + (classe || '');
      li.setAttribute('role', 'option');
      li.id = 'busca-opcao-' + opcoesAtuais.length;
      const t = document.createElement('span');
      t.className = 'busca__opcao-titulo';
      t.textContent = titulo;
      const s = document.createElement('span');
      s.className = 'busca__opcao-sub';
      s.textContent = subtitulo;
      li.append(t, s);
      return li;
    }

    function secao(titulo) {
      const h = document.createElement('p');
      h.className = 'busca__secao';
      h.textContent = titulo;
      return h;
    }

    function renderizar(lugares, dcs, texto) {
      caixa.replaceChildren();
      opcoesAtuais = [];
      ativo = -1;

      if (!lugares.length && !dcs.length) {
        caixa.append(secao('Nenhum resultado para “' + texto + '”'));
      }
      if (lugares.length) {
        caixa.append(secao('Lugares'));
        const ul = document.createElement('ul');
        lugares.forEach(function (l) {
          const n = l.itens.length;
          const li = opcao(l.titulo, n + (n === 1 ? ' data center' : ' data centers'), 'busca__opcao--lugar');
          const c = centro(l.itens);
          opcoesAtuais.push({ tipo: 'lugar', titulo: l.titulo, abrangencia: l.tipo, itens: l.itens, lat: c.lat, lng: c.lng, raio: c.raio });
          ul.append(li);
        });
        caixa.append(ul);
      }
      if (dcs.length) {
        caixa.append(secao('Data centers'));
        const ul = document.createElement('ul');
        dcs.forEach(function (i) {
          const local = [i.cidade, i.pais].filter(Boolean).join(', ');
          const sub = [i.nome ? i.empresa : null, local].filter(Boolean).join(' · ') || 'Local não informado';
          const li = opcao(i.nome || i.empresa, sub, i.tipo === 'destaque' ? 'busca__opcao--destaque' : '');
          opcoesAtuais.push({ tipo: 'item', item: i });
          ul.append(li);
        });
        caixa.append(ul);
      }

      caixa.querySelectorAll('.busca__opcao').forEach(function (li, idx) {
        li.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
        li.addEventListener('click', function () { escolher(idx); });
      });
      caixa.hidden = false;
      campo.setAttribute('aria-expanded', 'true');
    }

    function marcar(idx) {
      const lis = caixa.querySelectorAll('.busca__opcao');
      if (!lis.length) return;
      ativo = (idx + lis.length) % lis.length;
      lis.forEach(function (li, i) { li.setAttribute('aria-selected', i === ativo ? 'true' : 'false'); });
      lis[ativo].scrollIntoView({ block: 'nearest' });
      campo.setAttribute('aria-activedescendant', lis[ativo].id);
    }

    function escolher(idx) {
      const r = opcoesAtuais[idx];
      if (!r) return;
      fechar();
      campo.blur();
      opcoes.aoEscolher(r);
    }

    function fechar() {
      caixa.hidden = true;
      campo.setAttribute('aria-expanded', 'false');
      campo.removeAttribute('aria-activedescendant');
    }

    campo.addEventListener('input', function () {
      clearTimeout(espera);
      espera = setTimeout(pesquisar, 120);
    });
    campo.addEventListener('focus', function () { if (campo.value.trim().length >= 2) pesquisar(); });
    campo.addEventListener('blur', function () { setTimeout(fechar, 150); });
    campo.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); marcar(ativo + 1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); marcar(ativo - 1); }
      else if (ev.key === 'Enter') { ev.preventDefault(); escolher(ativo >= 0 ? ativo : 0); }
      else if (ev.key === 'Escape') { fechar(); campo.blur(); }
    });
    limpar.addEventListener('click', function () {
      campo.value = '';
      limpar.hidden = true;
      fechar();
      campo.focus();
    });

    return { definirItens: definirItens };
  }

  window.criarBusca = criarBusca;
})();
