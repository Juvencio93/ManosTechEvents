<?php
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit;
}// Configuração do banco de dados SQLite
define('DB_PATH', __DIR__ . '/database.sqlite');

try {
    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("PRAGMA journal_mode=WAL"); // performance
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro na conexão com o banco']);
    exit;
}
