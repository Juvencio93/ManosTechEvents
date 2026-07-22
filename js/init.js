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
                // Força o carregamento da página inicial com um pequeno delay
                setTimeout(() => showPage('inicio'), 100);
                sessaoRestaurada = true;
                console.log('✅ Sessão de admin restaurada.');
            }
        }
    } catch (e) {
        console.warn('Nenhuma sessão de admin ativa.');
    }

    // ... (restante igual ao anterior)
});
