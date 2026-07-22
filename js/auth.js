async function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginPassword').value.trim();

    if (!FN || FN.length === 0) {
        try { if (typeof carregarFuncionarios === 'function') await carregarFuncionarios(); } catch (e) {}
    }
    const func = FN.find(f => f.email === email && f.senha === senha);
    if (func) {
        usuarioLogado = func;
        EV = await apiListarEventos();
        entrarSistema();
        return;
    }
    try {
        const user = await apiLogin(email, senha);
        usuarioLogado = user;
        EV = await apiListarEventos();
        entrarSistema();
    } catch (e) { alert('❌ ' + e.message); }
}

function entrarSistema() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('menuToggle').style.display = 'flex';
    atualizarInterfaceUsuario();
    aplicarPermissoes();
    showPage('inicio');
}

// ... (as demais funções – sairDoSistema, fazerLoginCliente, etc. – permanecem como estavam, sem alterações)
// Certifique-se de que a função atualizarInterfaceUsuario contenha o código que atualiza o nome do admin.
