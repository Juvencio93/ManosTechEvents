<?php
function validarEvento($dados) {
    $erros = [];
    if (empty($dados['nome'])) $erros[] = 'Nome é obrigatório';
    if (empty($dados['cliente'])) $erros[] = 'Cliente é obrigatório';
    if (empty($dados['dataInicio'])) $erros[] = 'Data inicial é obrigatória';
    if (empty($dados['dataFim'])) $erros[] = 'Data final é obrigatória';
    if (empty($dados['local'])) $erros[] = 'Local é obrigatório';
    if (!empty($dados['clienteUsuario']) && strlen($dados['clienteUsuario']) < 3) {
        $erros[] = 'Usuário do cliente deve ter ao menos 3 caracteres';
    }
    if (!empty($dados['clienteSenha']) && strlen($dados['clienteSenha']) < 4) {
        $erros[] = 'Senha do cliente deve ter ao menos 4 caracteres';
    }
    return $erros;
}
