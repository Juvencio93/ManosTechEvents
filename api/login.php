<?php
session_start();
session_regenerate_id(true); // Previne session fixation

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$email = $dados['email'] ?? '';
$senha = $dados['senha'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($senha, $user['senha_hash'])) {
    $_SESSION['usuario'] = [
        'id' => $user['id'],
        'nome' => $user['nome'],
        'email' => $user['email'],
        'nivel' => $user['nivel'],
        'permissoes' => json_decode($user['permissoes'], true)
    ];

    // Gera CSRF token se não existir
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    echo json_encode([
        'sucesso' => true,
        'usuario' => $_SESSION['usuario'],
        'csrf_token' => $_SESSION['csrf_token']
    ]);
} else {
    http_response_code(401);
    echo json_encode(['erro' => 'Credenciais inválidas']);
}
