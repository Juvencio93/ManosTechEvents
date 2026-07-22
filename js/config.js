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
                console.log('✅ Sessão de admin restaurada.');
            }
        }
    } catch (e) {
        console.warn('Nenhuma sessão de admin ativa.');
    }

    // 3. Se não restaurou admin, tenta restaurar sessão do cliente
    if (!sessaoRestaurada) {
        try {
            const clienteData = localStorage.getItem('clienteSession');
            console.log('🔍 Verificando clienteSession:', clienteData);
            if (clienteData) {
                const { eventoId } = JSON.parse(clienteData);
                console.log('🔍 Evento ID:', eventoId);
                // Carrega eventos se necessário
                if (EV.length === 0) {
                    EV = await apiListarEventos();
                    console.log('📋 Eventos carregados:', EV.length);
                }
                const evento = EV.find(ev => ev.id === eventoId);
                if (evento) {
                    console.log('🎯 Evento encontrado para o cliente:', evento.nome);
                    if (typeof abrirAreaClienteEvento !== 'function') {
                        console.error('❌ Função abrirAreaClienteEvento não definida!');
                    } else {
                        // Exibe a área do cliente
                        document.getElementById('loginScreen').style.display = 'none';
                        document.getElementById('loginClienteScreen').style.display = 'none';
                        document.getElementById('dashboard').style.display = 'none';
                        document.getElementById('clienteDashboard').style.display = 'block';
                        abrirAreaClienteEvento(evento);
                        sessaoRestaurada = true;
                        console.log('✅ Sessão de cliente restaurada.');
                    }
                } else {
                    console.warn('❌ Evento não encontrado. Removendo sessão de cliente.');
                    localStorage.removeItem('clienteSession');
                }
            }
        } catch (e) {
            console.error('❌ Erro ao restaurar sessão de cliente:', e);
            localStorage.removeItem('clienteSession');
        }
    }

    // 4. Se nenhuma sessão foi restaurada, mostra o login do admin
    if (!sessaoRestaurada) {
        console.log('🔑 Nenhuma sessão ativa. Exibindo login admin.');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginClienteScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('clienteDashboard').style.display = 'none';
    }
});
