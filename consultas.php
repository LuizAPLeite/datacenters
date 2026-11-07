<?php
/**
 * Consultas compartilhadas entre api.php e exportar.php.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

/** Data centers em destaque (pins com logo), com os campos usados no globo. */
function listarDestaques(): array
{
    $linhas = db()->query(
        'SELECT d.id, d.nome, d.cidade, d.pais, d.latitude, d.longitude, d.resumo, d.ia, d.situacao,
                e.nome AS empresa, e.logo AS empresa_logo, e.cor AS empresa_cor
           FROM datacenters d
           JOIN empresas e ON e.id = d.empresa_id
          WHERE d.ativo = 1
          ORDER BY d.nome'
    )->fetchAll();

    foreach ($linhas as &$l) {
        $l['id']        = (int) $l['id'];
        $l['latitude']  = (float) $l['latitude'];
        $l['longitude'] = (float) $l['longitude'];
        $l['ia']        = (int) $l['ia'];
    }
    unset($l);
    return $linhas;
}

/**
 * Demais data centers (OpenStreetMap) em formato compacto, para economizar
 * espaço: [latitude, longitude, nome, operador, cidade, país, outros nomes, id OSM].
 */
function listarPontos(): array
{
    $linhas = db()->query(
        'SELECT latitude, longitude, nome, operador, cidade, pais, alt, osm_id FROM pontos ORDER BY id'
    )->fetchAll(PDO::FETCH_NUM);

    foreach ($linhas as &$l) {
        $l[0] = (float) $l[0];
        $l[1] = (float) $l[1];
    }
    unset($l);
    return $linhas;
}
