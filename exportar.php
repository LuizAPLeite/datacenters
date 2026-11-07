<?php
/**
 * Exporta os data centers do MySQL para js/dados.js (destaques) e
 * js/pontos.js (demais data centers, do OpenStreetMap).
 *
 * O js/dados.js é usado pela versão estática do site (GitHub Pages ou
 * index.html aberto direto do disco), que não roda PHP. É um script
 * comum (e não um .json buscado com fetch) para funcionar também em
 * file://, onde o navegador bloqueia fetch. Rode sempre que alterar o banco:
 *
 *   php exportar.php
 */

declare(strict_types=1);

// Só pode ser executado pelo terminal, nunca pelo navegador
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Acesso negado.');
}

require __DIR__ . '/consultas.php';

try {
    $linhas = db()->query(
        'SELECT d.id, d.nome, d.cidade, d.pais, d.latitude, d.longitude, d.ano_inauguracao,
                d.resumo, d.historia, d.imagem_principal, d.imagem_legenda, d.imagem_autor,
                d.imagem_licenca, d.imagem_fonte, d.imagens, d.ia, d.situacao,
                e.nome AS empresa, e.logo AS empresa_logo, e.cor AS empresa_cor, e.site AS empresa_site
           FROM datacenters d
           JOIN empresas e ON e.id = d.empresa_id
          WHERE d.ativo = 1
          ORDER BY d.nome'
    )->fetchAll();
    $pontos = listarPontos();
} catch (PDOException $ex) {
    fwrite(STDERR, 'Erro ao ler o banco: ' . $ex->getMessage() . PHP_EOL);
    exit(1);
}

// Mesmos tipos que a API devolve
foreach ($linhas as &$l) {
    $l['id']              = (int) $l['id'];
    $l['latitude']        = (float) $l['latitude'];
    $l['longitude']       = (float) $l['longitude'];
    $l['ia']              = (int) $l['ia'];
    $l['ano_inauguracao'] = $l['ano_inauguracao'] !== null ? (int) $l['ano_inauguracao'] : null;
    $l['imagens']         = json_decode($l['imagens'] ?? '[]', true) ?: [];
}
unset($l);

$json = json_encode($linhas, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
$js = "// Gerado por exportar.php — não edite à mão.\nwindow.DADOS_DATACENTERS = " . $json . ";\n";
if ($json === false || file_put_contents(__DIR__ . '/js/dados.js', $js) === false) {
    fwrite(STDERR, 'Erro ao gravar js/dados.js.' . PHP_EOL);
    exit(1);
}

// Pontos do OpenStreetMap: arquivo separado, carregado só quando não há PHP
$jsPontos = "// Gerado por exportar.php — não edite à mão.\n"
    . "// Dados © colaboradores do OpenStreetMap, licença ODbL (https://www.openstreetmap.org/copyright).\n"
    . "// Formato: [latitude, longitude, nome, operador, cidade, país, outros nomes, id OSM]\n"
    . 'window.PONTOS_DATACENTERS = ' . json_encode($pontos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n";
if (file_put_contents(__DIR__ . '/js/pontos.js', $jsPontos) === false) {
    fwrite(STDERR, 'Erro ao gravar js/pontos.js.' . PHP_EOL);
    exit(1);
}

echo count($linhas) . ' destaques exportados para js/dados.js e ' . count($pontos) . ' pontos para js/pontos.js' . PHP_EOL;
