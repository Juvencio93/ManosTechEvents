// Autenticação (Supabase puro)

async function fazerLogin() {
    const emailEl = document.getElementById('loginEmail');
    const senhaEl = document.getElementById('loginPassword');

    if (!emailEl || !senhaEl) {
        alert('❌ Erro interno: campos de login não encontrados.');
        return;
    }

    const email = emailEl.value.trim();
    const senha = senhaEl.value.trim();

    console.log('Tentando login com:', email); // apenas para depuração, remova depois

    try {
        const user = await apiLogin(email, senha);
        usuarioLogado = user;
        EV = await apiListarEventos();
        entrarSistema();
    } catch (e) {
        console.error('Erro no login:', e);
        alert('❌ ' + e.message);
    }
}

// ... (o restante das funções permanece exatamente como você já tem) ...
