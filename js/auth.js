// Autenticação (Supabase puro)

async function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginPassword').value.trim();
    try {
        const user = await apiLogin(email, senha);   // senha é enviada como password pelo api.js
        usuarioLogado = user;
        EV = await apiListarEventos();
        entrarSistema();
    } catch (e) {
        alert('❌ ' + e.message);
    }
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
