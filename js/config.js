// config.js – Estado global (sem localStorage)
let CFG = {
    empresaNome: 'Manos Tech',
    email: 'contato@manostech.com.br',
    telefoneSuporte: '(11) 99999-9999',
    adminNome: 'Carlos Silva',
    adminEmail: 'admin@manostech.com.br',
    adminSenha: '123456',
    logoUrl: ''
};

let EV = [];
let FN = [];

// Funções mantidas apenas para compatibilidade – não fazem mais nada.
function carregarDados() {}
function salvarDados() {}

let usuarioLogado = null;
let eventoEmEdicao = null;
let funcionarioEmEdicao = null;
let eventoSelecionadoId = null;
let logoTemporario = null;
let configLogoTemp = null;
let patrocinadoresTemp = [];
let eventoClienteAtual = null;
let callbackConfirmacao = null;
