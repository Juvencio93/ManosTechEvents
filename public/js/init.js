// init.js – Inicialização do sistema
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (typeof apiCarregarConfig === 'function') {
            const cfg = await apiCarregarConfig();
            if (cfg) {
                CFG = cfg;
                if (typeof atualizarInterfaceUsuario === 'function') atualizarInterfaceUsuario();
            }
        }
    } catch (e) {}

    let ok = false;
    try {
        if (typeof apiRestaurarSessao === 'function') {
            const user = await apiRestaurarSessao();
            if (user) {
                usuarioLogado = user;
                EV = await apiListarEventos();
                if (typeof carregarFuncionarios === 'function') await carregarFuncionarios();
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('loginClienteScreen').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                document.getElementById('menuToggle').style.display = 'flex';
                atualizarInterfaceUsuario();
                aplicarPermissoes();
                if (document.getElementById('main-content')) showPage('inicio');
                ok = true;
            }
        }
    } catch (e) {}

    if (!ok) {
        try {
            const data = localStorage.getItem('clienteSession');
            if (data) {
                const { eventoId } = JSON.parse(data);
                if (EV.length === 0) EV = await apiListarEventos();
                const evento = EV.find(ev => ev.id === eventoId);
                if (evento) {
                    document.getElementById('loginScreen').style.display = 'none';
                    document.getElementById('loginClienteScreen').style.display = 'none';
                    document.getElementById('dashboard').style.display = 'none';
                    document.getElementById('clienteDashboard').style.display = 'block';
                    abrirAreaClienteEvento(evento);
                    ok = true;
                } else localStorage.removeItem('clienteSession');
            }
        } catch (e) {}
    }

    if (!ok) {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginClienteScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('clienteDashboard').style.display = 'none';
    }
});
