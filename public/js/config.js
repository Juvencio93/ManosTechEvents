// config.js – Estado global (apenas declaração de variáveis)
let CFG = {
    empresaNome: 'Manos Tech',
    email: 'contato@manostech.com.br',
    telefoneSuporte: '(11) 99999-9999',
    adminNome: 'Carlos Silva',
    adminEmail: 'admin@manostech.com.br',
    logoUrl: ''
};

let EV = [];
let FN = [];

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
