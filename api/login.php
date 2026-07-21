<?php
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit;
}
session_start();
header('Content-Type: application/json');
require_once 'config.php';

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
    echo json_encode(['sucesso' => true, 'usuario' => $_SESSION['usuario']]);
} else {
    http_response_code(401);
    echo json_encode(['erro' => 'Credenciais inválidas']);
}
