<?php
require_once 'config.php';

$queries = [
    "CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        nivel TEXT DEFAULT 'Técnico',
        permissoes TEXT DEFAULT '{}',  -- JSON
        ativo INTEGER DEFAULT 1
    )",
    "CREATE TABLE IF NOT EXISTS eventos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cliente TEXT,
        data_inicio TEXT,
        data_fim TEXT,
        local TEXT,
        patrocinadores TEXT,
        logo_url TEXT,
        valor_cobrado REAL DEFAULT 0,
        custo_operacional REAL DEFAULT 0,
        valor_pago REAL DEFAULT 0,
        vencimento TEXT,
        forma_pagamento TEXT,
        parcelas INTEGER DEFAULT 1,
        observacoes TEXT,
        status_manual TEXT,
        cliente_usuario TEXT,
        cliente_senha TEXT,
        token TEXT UNIQUE NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS visitantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        evento_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        whatsapp TEXT,
        acesso DATETIME DEFAULT CURRENT_TIMESTAMP,
        hora INTEGER,
        dispositivo TEXT,
        ip TEXT,
        FOREIGN KEY (evento_id) REFERENCES eventos(id)
    )"
];

foreach ($queries as $sql) {
    $pdo->exec($sql);
}

// Inserir admin padrão (se não existir)
$stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE email = 'admin@manostech.com.br'");
$stmt->execute();
if ($stmt->fetchColumn() == 0) {
    $senhaHash = password_hash('123456', PASSWORD_BCRYPT);
    $pdo->prepare("INSERT INTO usuarios (nome, email, senha_hash, nivel, permissoes)
        VALUES ('Carlos Silva', 'admin@manostech.com.br', ?, 'Administrador', '{\"v\":true,\"d\":true,\"vi\":true,\"e\":true,\"x\":true,\"f\":true,\"g\":true,\"c\":true,\"r\":true}')")
        ->execute([$senhaHash]);
    echo "Admin criado.<br>";
}

echo "Tabelas criadas com sucesso!";
