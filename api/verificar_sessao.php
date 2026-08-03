<?php
session_start();
if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['erro' => 'Não autenticado']);
    exit;
}
