// config.js – Estado global com restauração de sessão e exibição imediata
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

// Inicialização: ocorre assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carrega configurações
    try {
        if (typeof apiCarregarConfig === 'function') {
            const cfg = await apiCarregarConfig();
            if (cfg) {
                CFG = cfg;
                if (typeof atualizarInterfaceUsuario === 'function') {
                    atualizarInterfaceUsuario();
                }
            }
        }
    } catch (e) {
        console.warn('Configurações padrão.');
    }

    // 2. Tenta restaurar sessão e exibe a tela correta imediatamente
    try {
        if (typeof apiRestaurarSessao === 'function') {
            const user = await apiRestaurarSessao();
            if (user) {
                usuarioLogado = user;
                EV = await apiListarEventos();
                // Exibe o dashboard diretamente (sem flash)
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('loginClienteScreen').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                document.getElementById('menuToggle').style.display = 'flex';
                atualizarInterfaceUsuario();
                aplicarPermissoes();
                showPage('inicio');
                return;
            }
        }
    } catch (e) {
        console.warn('Nenhuma sessão ativa.');
    }

    // Se não há sessão, mostra a tela de login do admin
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginClienteScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('clienteDashboard').style.display = 'none';
});
