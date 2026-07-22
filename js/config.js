// config.js – Estado global com restauração de sessão (admin e cliente)
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
        console.warn('Usando configurações padrão.');
    }

    // 2. Tenta restaurar sessão do admin (Supabase)
    let sessaoRestaurada = false;
    try {
        if (typeof apiRestaurarSessao === 'function') {
            const user = await apiRestaurarSessao();
            if (user) {
                usuarioLogado = user;
                EV = await apiListarEventos();
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('loginClienteScreen').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                document.getElementById('menuToggle').style.display = 'flex';
                atualizarInterfaceUsuario();
                aplicarPermissoes();
                showPage('inicio');
                sessaoRestaurada = true;
            }
        }
    } catch (e) {
        console.warn('Nenhuma sessão de admin ativa.');
    }

    // 3. Se não restaurou admin, tenta restaurar sessão do cliente
    if (!sessaoRestaurada) {
        try {
            const clienteData = localStorage.getItem('clienteSession');
            if (clienteData) {
                const { eventoId } = JSON.parse(clienteData);
                // Carrega eventos (se ainda não estiverem)
                if (EV.length === 0) {
                    EV = await apiListarEventos();
                }
                const evento = EV.find(ev => ev.id === eventoId);
                if (evento) {
                    // Exibe diretamente a área do cliente
                    document.getElementById('loginScreen').style.display = 'none';
                    document.getElementById('loginClienteScreen').style.display = 'none';
                    document.getElementById('dashboard').style.display = 'none';
                    document.getElementById('clienteDashboard').style.display = 'block';
                    abrirAreaClienteEvento(evento);
                    sessaoRestaurada = true;
                } else {
                    // Se o evento não existe mais, limpa a sessão inválida
                    localStorage.removeItem('clienteSession');
                }
            }
        } catch (e) {
            console.warn('Sessão de cliente inválida.');
        }
    }

    // 4. Se nenhuma sessão foi restaurada, mostra o login do admin
    if (!sessaoRestaurada) {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginClienteScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('clienteDashboard').style.display = 'none';
    }
});
