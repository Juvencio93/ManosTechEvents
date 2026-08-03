<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $headers = getallheaders();
    $token = $headers['X-CSRF-Token'] ?? '';
    if (!isset($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['erro' => 'Token CSRF inválido']);
        exit;
    }
}
