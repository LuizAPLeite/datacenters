<?php
/**
 * Exporta os data centers do MySQL para dados.json.
 *
 * O dados.json é usado pela versão estática do site (GitHub Pages), que
 * não roda PHP. Rode sempre que alterar o banco:
 *
 *   php exportar.php
 */

declare(strict_types=1);

// Só pode ser executado pelo terminal, nunca pelo navegador
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Acesso negado.');
}

require __DIR__ . '/config.php';

try {
    $linhas = db()->query(
        'SELECT d.id, d.nome, d.cidade, d.pais, d.latitude, d.longitude, d.ano_inauguracao,
                d.resumo, d.historia, d.imagem_principal, d.imagem_legenda, d.imagem_autor,
                d.imagem_licenca, d.imagem_fonte, d.imagens,
                e.nome AS empresa, e.logo AS empresa_logo, e.cor AS empresa_cor, e.site AS empresa_site
           FROM datacenters d
           JOIN empresas e ON e.id = d.empresa_id
          WHERE d.ativo = 1
          ORDER BY d.nome'
    )->fetchAll();
} catch (PDOException $ex) {
    fwrite(STDERR, 'Erro ao ler o banco: ' . $ex->getMessage() . PHP_EOL);
    exit(1);
}

// Mesmos tipos que a API devolve
foreach ($linhas as &$l) {
    $l['id']              = (int) $l['id'];
    $l['latitude']        = (float) $l['latitude'];
    $l['longitude']       = (float) $l['longitude'];
    $l['ano_inauguracao'] = $l['ano_inauguracao'] !== null ? (int) $l['ano_inauguracao'] : null;
    $l['imagens']         = json_decode($l['imagens'] ?? '[]', true) ?: [];
}
unset($l);

$json = json_encode($linhas, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
if ($json === false || file_put_contents(__DIR__ . '/dados.json', $json . PHP_EOL) === false) {
    fwrite(STDERR, 'Erro ao gravar dados.json.' . PHP_EOL);
    exit(1);
}

echo count($linhas) . ' data centers exportados para dados.json' . PHP_EOL;
