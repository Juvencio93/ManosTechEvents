// js/auth.js – Centraliza autenticação usando a nova API

const Auth = (() => {
    let currentUser = null;
    let currentProfile = null;

    // Carrega o usuário do localStorage (apenas para manter estado entre recargas)
    function loadFromStorage() {
        try {
            const savedUser = localStorage.getItem('manos_user');
            const savedProfile = localStorage.getItem('manos_profile');
            if (savedUser) currentUser = JSON.parse(savedUser);
            if (savedProfile) currentProfile = JSON.parse(savedProfile);
        } catch (e) {}
    }
    loadFromStorage();

    // ---------- Login (admin ou funcionário) ----------
    async function login(email, password) {
        try {
            // Tenta login via API (que usa Supabase)
            const result = await API.login(email, password);
            if (!result.success) throw new Error(result.error);

            currentUser = result.user;
            currentProfile = result.perfil;

            // Persiste no localStorage (opcional, para manter estado)
            localStorage.setItem('manos_user', JSON.stringify(currentUser));
            localStorage.setItem('manos_profile', JSON.stringify(currentProfile));

            return { success: true, user: currentUser, perfil: currentProfile };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ---------- Logout ----------
    async function logout() {
        try {
            await API.logout();
            currentUser = null;
            currentProfile = null;
            localStorage.removeItem('manos_user');
            localStorage.removeItem('manos_profile');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ---------- Restaurar sessão (admin) ----------
    async function restaurarSessao() {
        try {
            const result = await API.restaurarSessao();
            if (result.success && result.data) {
                currentUser = { email: result.data.email, id: result.data.id };
                currentProfile = { nome: result.data.nome, nivel: result.data.nivel, permissoes: result.data.permissoes };
                localStorage.setItem('manos_user', JSON.stringify(currentUser));
                localStorage.setItem('manos_profile', JSON.stringify(currentProfile));
                return { success: true, user: currentUser, perfil: currentProfile };
            }
            return { success: false };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ---------- Restaurar sessão do cliente (baseado no evento) ----------
    async function restaurarSessaoCliente() {
        try {
            // Tenta restaurar a sessão via Supabase (verifica se há um cliente logado)
            const result = await API.restaurarSessao();
            if (result.success && result.data) {
                const email = result.data.email;
                if (email && email.startsWith('cliente_')) {
                    // Extrai o ID do evento do email
                    const idEvento = parseInt(email.split('_')[1]);
                    if (!isNaN(idEvento)) {
                        // Busca o evento na lista global EV (supondo que já esteja carregada)
                        if (typeof EV !== 'undefined') {
                            const evento = EV.find(ev => ev.id === idEvento);
                            if (evento) {
                                window.eventoClienteAtual = evento;
                                return { success: true, evento };
                            }
                        }
                    }
                }
            }
            return { success: false };
        } catch (error) {
            console.warn('Erro ao restaurar sessão do cliente:', error);
            return { success: false, error: error.message };
        }
    }

    // ---------- Verificar se está logado ----------
    function isLoggedIn() {
        return !!currentUser;
    }

    // ---------- Obter usuário ----------
    function usuario() {
        return currentUser;
    }

    // ---------- Obter perfil ----------
    function perfil() {
        return currentProfile;
    }

    // ---------- Verificar permissão ----------
    function temPermissao(permissao) {
        if (!currentProfile) return false;
        if (currentProfile.nivel === 'Administrador') return true;
        if (Array.isArray(currentProfile.permissoes)) {
            return currentProfile.permissoes.includes(permissao);
        }
        return false;
    }

    // ---------- API pública ----------
    return {
        login,
        logout,
        restaurarSessao,
        restaurarSessaoCliente,
        isLoggedIn,
        usuario,
        perfil,
        temPermissao
    };
})();

// Expor globalmente
window.Auth = Auth;
