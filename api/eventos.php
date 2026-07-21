<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Para o portal cativo, GET com token não requer sessão
if ($method === 'GET' && isset($_GET['token'])) {
    $stmt = $pdo->prepare("SELECT * FROM eventos WHERE token = ?");
    $stmt->execute([$_GET['token']]);
    $evento = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($evento) {
        echo json_encode($evento);
    } else {
        http_response_code(404);
        echo json_encode(['erro' => 'Evento não encontrado']);
    }
    exit;
}

// Demais operações exigem autenticação
require_once 'verificar_sessao.php';

if ($method === 'GET') {
    // Listar todos os eventos (admin)
    $stmt = $pdo->query("SELECT * FROM eventos ORDER BY id DESC");
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['eventos' => $eventos]);

} elseif ($method === 'POST') {
    // Criar evento
    $dados = json_decode(file_get_contents('php://input'), true);
    // Gera token único
    $token = bin2hex(random_bytes(8));
    $stmt = $pdo->prepare("INSERT INTO eventos (nome, cliente, data_inicio, data_fim, local, patrocinadores, logo_url, valor_cobrado, custo_operacional, valor_pago, vencimento, forma_pagamento, parcelas, observacoes, status_manual, cliente_usuario, cliente_senha, token)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
        $dados['nome'], $dados['cliente'], $dados['dataInicio'], $dados['dataFim'],
        $dados['local'], $dados['patrocinadores'] ?? '', $dados['logoUrl'] ?? '',
        $dados['valorCobrado'] ?? 0, $dados['custoOperacional'] ?? 0, $dados['valorPago'] ?? 0,
        $dados['vencimento'] ?? null, $dados['formaPagamento'] ?? '', $dados['parcelas'] ?? 1,
        $dados['observacoes'] ?? '', $dados['statusManual'] ?? '',
        $dados['clienteUsuario'] ?? '', $dados['clienteSenha'] ?? '', $token
    ]);
    $id = $pdo->lastInsertId();
    echo json_encode(['sucesso' => true, 'id' => $id, 'token' => $token]);

} elseif ($method === 'PUT') {
    // Atualizar evento
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['erro' => 'ID não informado']); exit; }
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE eventos SET nome=?, cliente=?, data_inicio=?, data_fim=?, local=?, patrocinadores=?, logo_url=?, valor_cobrado=?, custo_operacional=?, valor_pago=?, vencimento=?, forma_pagamento=?, parcelas=?, observacoes=?, status_manual=?, cliente_usuario=?, cliente_senha=? WHERE id=?");
    $stmt->execute([
        $dados['nome'], $dados['cliente'], $dados['dataInicio'], $dados['dataFim'],
        $dados['local'], $dados['patrocinadores'] ?? '', $dados['logoUrl'] ?? '',
        $dados['valorCobrado'] ?? 0, $dados['custoOperacional'] ?? 0, $dados['valorPago'] ?? 0,
        $dados['vencimento'] ?? null, $dados['formaPagamento'] ?? '', $dados['parcelas'] ?? 1,
        $dados['observacoes'] ?? '', $dados['statusManual'] ?? '',
        $dados['clienteUsuario'] ?? '', $dados['clienteSenha'] ?? '', $id
    ]);
    echo json_encode(['sucesso' => true]);

} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['erro' => 'ID não informado']); exit; }
    $stmt = $pdo->prepare("DELETE FROM eventos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['sucesso' => true]);
} else {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}
