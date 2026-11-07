<?php
/**
 * Configuração da aplicação.
 *
 * Lê as credenciais do arquivo .env (que não é versionado) e expõe
 * uma conexão PDO única via db(). Nenhuma senha fica escrita no código.
 */

declare(strict_types=1);

/**
 * Carrega variáveis no formato CHAVE=valor de um arquivo .env.
 * Linhas vazias e comentários (#) são ignorados.
 */
function carregarEnv(string $caminho): array
{
    if (!is_readable($caminho)) {
        return [];
    }

    $vars = [];
    foreach (file($caminho, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linha) {
        $linha = trim($linha);
        if ($linha === '' || str_starts_with($linha, '#') || !str_contains($linha, '=')) {
            continue;
        }
        [$chave, $valor] = array_map('trim', explode('=', $linha, 2));
        // Remove aspas opcionais: DB_PASS="segredo"
        $vars[$chave] = trim($valor, "\"'");
    }
    return $vars;
}

$ENV = carregarEnv(__DIR__ . '/.env');

/** Retorna uma variável de configuração com valor padrão. */
function env(string $chave, string $padrao = ''): string
{
    global $ENV;
    return $ENV[$chave] ?? (getenv($chave) !== false ? (string) getenv($chave) : $padrao);
}

define('APP_DEBUG', filter_var(env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN));

// Números no JSON com a menor forma exata (56.494, e não 56.493999999999999772...).
// Algumas hospedagens configuram precisão 17, o que deixa as respostas bem maiores.
ini_set('serialize_precision', '-1');

/** Conexão PDO compartilhada (criada sob demanda). */
function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        env('DB_HOST', '127.0.0.1'),
        env('DB_PORT', '3306'),
        env('DB_NAME', 'datacenters'),
        env('DB_CHARSET', 'utf8mb4')
    );

    $pdo = new PDO($dsn, env('DB_USER', 'root'), env('DB_PASS'), [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

/** Escapa texto para saída segura em HTML. */
function e(?string $texto): string
{
    return htmlspecialchars((string) $texto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
