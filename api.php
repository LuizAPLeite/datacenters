<?php
/**
 * API JSON do mapa.
 *
 *   api.php?acao=listar          → data centers em destaque (dados resumidos para o globo)
 *   api.php?acao=pontos          → demais data centers (OpenStreetMap), formato compacto
 *   api.php?acao=detalhe&id=1    → um data center com dados completos
 */

declare(strict_types=1);

require __DIR__ . '/consultas.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/** Envia a resposta JSON e encerra. */
function responder(mixed $dados, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$acao = $_GET['acao'] ?? 'listar';

try {
    switch ($acao) {
        case 'listar':
            responder(listarDestaques());

        case 'pontos':
            responder(listarPontos());

        case 'detalhe':
            $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if (!$id) {
                responder(['erro' => 'Parâmetro "id" inválido.'], 400);
            }
            $stmt = db()->prepare(
                'SELECT d.*, e.nome AS empresa, e.logo AS empresa_logo, e.site AS empresa_site
                   FROM datacenters d
                   JOIN empresas e ON e.id = d.empresa_id
                  WHERE d.id = :id AND d.ativo = 1'
            );
            $stmt->execute([':id' => $id]);
            $dc = $stmt->fetch();
            if (!$dc) {
                responder(['erro' => 'Data center não encontrado.'], 404);
            }
            $dc['imagens'] = json_decode($dc['imagens'] ?? '[]', true) ?: [];
            responder($dc);

        default:
            responder(['erro' => 'Ação desconhecida.'], 400);
    }
} catch (PDOException $ex) {
    error_log('[api.php] ' . $ex->getMessage());
    responder([
        'erro' => 'Não foi possível acessar o banco de dados.',
        'detalhe' => APP_DEBUG ? $ex->getMessage() : null,
    ], 500);
}
