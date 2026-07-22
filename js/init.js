// init.js – Inicialização do sistema
document.addEventListener('DOMContentLoaded', async () => {
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

    // 2. Tenta restaurar sessão do admin (Supabase)
    let sessaoRestaurada = false;
    try {
        if (typeof apiRestaurarSessao === 'function') {
            const user = await apiRestaurarSessao();
            if (user) {
                usuarioLogado = user;
                EV = await apiListarEventos();
                if (typeof carregarFuncionarios === 'function') {
                    await carregarFuncionarios();
                }
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('loginClienteScreen').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                document.getElementById('menuToggle').style.display = 'flex';
                atualizarInterfaceUsuario();
                aplicarPermissoes();
                // Carrega a página inicial
                if (document.getElementById('main-content')) {
                    showPage('inicio');
                }
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
                if (EV.length === 0) {
                    EV = await apiListarEventos();
                }
                const evento = EV.find(ev => ev.id === eventoId);
                if (evento) {
                    document.getElementById('loginScreen').style.display = 'none';
                    document.getElementById('loginClienteScreen').style.display = 'none';
                    document.getElementById('dashboard').style.display = 'none';
                    document.getElementById('clienteDashboard').style.display = 'block';
                    abrirAreaClienteEvento(evento);
                    sessaoRestaurada = true;
                } else {
                    localStorage.removeItem('clienteSession');
                }
            }
        } catch (e) {
            console.warn('Sessão de cliente inválida.');
        }
    }

    // 4. Se nenhuma sessão, mostra o login do admin
    if (!sessaoRestaurada) {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginClienteScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('clienteDashboard').style.display = 'none';
    }
});
