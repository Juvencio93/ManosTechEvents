<?php
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit;
}
header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Registro público (portal cativo)
    $dados = json_decode(file_get_contents('php://input'), true);
    $token = $dados['token'] ?? '';
    // Localiza o evento pelo token
    $stmt = $pdo->prepare("SELECT id FROM eventos WHERE token = ?");
    $stmt->execute([$token]);
    $evento = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$evento) {
        http_response_code(404);
        echo json_encode(['erro' => 'Evento inválido']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO visitantes (evento_id, nome, email, whatsapp, acesso, hora, dispositivo, ip)
        VALUES (?, ?, ?, ?, datetime('now','localtime'), ?, ?, ?)");
    $stmt->execute([
        $evento['id'],
        $dados['nome'],
        $dados['email'],
        $dados['whatsapp'] ?? '',
        (int)date('H'),
        $dados['dispositivo'] ?? 'Desktop',
        $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'
    ]);
    echo json_encode(['sucesso' => true]);
    exit;
}

// GET: listar visitantes de um evento (requer sessão)
require_once 'verificar_sessao.php';
$evento_id = $_GET['evento_id'] ?? null;
if (!$evento_id) {
    http_response_code(400);
    echo json_encode(['erro' => 'evento_id obrigatório']);
    exit;
}
$stmt = $pdo->prepare("SELECT * FROM visitantes WHERE evento_id = ? ORDER BY id DESC");
$stmt->execute([$evento_id]);
$visitantes = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['visitantes' => $visitantes]);
