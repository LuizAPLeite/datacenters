<?php
/**
 * Página de detalhes de um data center: história completa e imagens.
 * Uso: detalhes.php?id=1
 */

declare(strict_types=1);

require __DIR__ . '/config.php';

const IMAGEM_PADRAO = 'img/datacenters/placeholder.svg';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$dc = null;
$erro = null;

if (!$id) {
    http_response_code(400);
    $erro = 'Data center inválido.';
} else {
    try {
        $stmt = db()->prepare(
            'SELECT d.*, e.nome AS empresa, e.logo AS empresa_logo, e.site AS empresa_site,
                    e.logo_autor, e.logo_licenca, e.logo_fonte
               FROM datacenters d
               JOIN empresas e ON e.id = d.empresa_id
              WHERE d.id = :id AND d.ativo = 1'
        );
        $stmt->execute([':id' => $id]);
        $dc = $stmt->fetch() ?: null;
        if (!$dc) {
            http_response_code(404);
            $erro = 'Data center não encontrado.';
        }
    } catch (PDOException $ex) {
        error_log('[detalhes.php] ' . $ex->getMessage());
        http_response_code(500);
        $erro = 'Não foi possível acessar o banco de dados.' . (APP_DEBUG ? ' ' . $ex->getMessage() : '');
    }
}

// Galeria (JSON) e parágrafos da história
$imagens = $dc ? (json_decode($dc['imagens'] ?? '[]', true) ?: []) : [];
$paragrafos = $dc ? preg_split('/\R{2,}/', trim($dc['historia'])) : [];

/** Monta a linha de crédito "Autor · Licença · Fonte" de uma imagem. */
function credito(?string $autor, ?string $licenca, ?string $fonte): string
{
    $partes = array_filter([$autor, $licenca]);
    $html = e(implode(' · ', $partes));
    if ($fonte && filter_var($fonte, FILTER_VALIDATE_URL)) {
        $html .= ($html ? ' · ' : '') . '<a href="' . e($fonte) . '" target="_blank" rel="noopener">fonte</a>';
    }
    return $html;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= $dc ? e($dc['nome']) . ' — ' : '' ?>Mapa Mundial de Data Centers</title>
  <link rel="stylesheet" href="css/style.css?v=5">
</head>
<body class="pagina-detalhes">

  <nav class="voltar"><a href="index.html">&larr; Voltar ao globo</a></nav>

  <?php if ($erro): ?>
    <main class="detalhes">
      <h1>Ops!</h1>
      <p class="aviso"><?= e($erro) ?></p>
    </main>
  <?php else: ?>
    <main class="detalhes">
      <header class="detalhes__cabecalho">
        <?php if ($dc['empresa_logo']): ?>
          <img class="detalhes__logo" src="<?= e($dc['empresa_logo']) ?>" alt="Logo <?= e($dc['empresa']) ?>">
        <?php endif; ?>
        <div>
          <h1><?= e($dc['nome']) ?></h1>
          <p class="detalhes__meta">
            <?= e($dc['empresa']) ?> · <?= e($dc['cidade']) ?>, <?= e($dc['pais']) ?>
            <?php if ($dc['ano_inauguracao']): ?> · Inaugurado em <?= e((string) $dc['ano_inauguracao']) ?><?php endif; ?>
          </p>
        </div>
      </header>

      <figure class="detalhes__foto">
        <img src="<?= e($dc['imagem_principal'] ?: IMAGEM_PADRAO) ?>" alt="Foto de <?= e($dc['nome']) ?>">
        <?php if ($dc['imagem_principal']): ?>
          <figcaption>
            <?= e($dc['imagem_legenda']) ?>
            <small><?= credito($dc['imagem_autor'], $dc['imagem_licenca'], $dc['imagem_fonte']) ?></small>
          </figcaption>
        <?php endif; ?>
      </figure>

      <section class="detalhes__historia">
        <h2>História</h2>
        <?php foreach ($paragrafos as $p): ?>
          <p><?= nl2br(e($p)) ?></p>
        <?php endforeach; ?>
      </section>

      <section class="detalhes__ficha">
        <h2>Ficha técnica</h2>
        <dl>
          <dt>Empresa</dt>
          <dd>
            <?php if ($dc['empresa_site'] && filter_var($dc['empresa_site'], FILTER_VALIDATE_URL)): ?>
              <a href="<?= e($dc['empresa_site']) ?>" target="_blank" rel="noopener"><?= e($dc['empresa']) ?></a>
            <?php else: ?>
              <?= e($dc['empresa']) ?>
            <?php endif; ?>
          </dd>
          <dt>Localização</dt><dd><?= e($dc['cidade']) ?>, <?= e($dc['pais']) ?></dd>
          <dt>Coordenadas</dt><dd><?= e($dc['latitude']) ?>, <?= e($dc['longitude']) ?></dd>
          <?php if ($dc['ano_inauguracao']): ?>
            <dt>Inauguração</dt><dd><?= e((string) $dc['ano_inauguracao']) ?></dd>
          <?php endif; ?>
        </dl>
      </section>

      <?php if ($imagens): ?>
        <section class="detalhes__galeria">
          <h2>Imagens</h2>
          <div class="galeria">
            <?php foreach ($imagens as $img): ?>
              <figure>
                <img src="<?= e($img['arquivo'] ?? IMAGEM_PADRAO) ?>" alt="<?= e($img['legenda'] ?? '') ?>" loading="lazy">
                <figcaption>
                  <?= e($img['legenda'] ?? '') ?>
                  <small><?= credito($img['autor'] ?? null, $img['licenca'] ?? null, $img['fonte'] ?? null) ?></small>
                </figcaption>
              </figure>
            <?php endforeach; ?>
          </div>
        </section>
      <?php endif; ?>
    </main>
  <?php endif; ?>

  <footer class="rodape">Mapa Mundial de Data Centers</footer>
</body>
</html>
