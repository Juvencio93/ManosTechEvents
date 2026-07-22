// config.js – Estado global com restauração de sessão
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

// Inicialização: carrega configuração e restaura sessão
window.addEventListener('load', async () => {
    // 1. Carrega configurações do Supabase
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
        console.warn('Usando configurações padrão.');
    }

    // 2. Tenta restaurar a sessão do Supabase
    try {
        if (typeof apiRestaurarSessao === 'function') {
            const user = await apiRestaurarSessao();
            if (user) {
                usuarioLogado = user;
                EV = await apiListarEventos();
                entrarSistema(); // já exibe o dashboard diretamente
            }
        }
    } catch (e) {
        console.warn('Nenhuma sessão ativa. Exibindo login.');
    }
});
