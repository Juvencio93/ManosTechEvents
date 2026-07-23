// ============================================================
// LOGIN DO CLIENTE – AGORA USANDO SUPABASE (sem localStorage)
// ============================================================

async function fazerLoginCliente() {
    const usuario = document.getElementById('clienteUsuario').value.trim();
    const senha = document.getElementById('clienteSenha').value.trim();

    if (!EV || EV.length === 0) {
        try {
            EV = await apiListarEventos();
        } catch (e) {
            alert('❌ Erro ao conectar.');
            return;
        }
    }

    // Busca o evento com as credenciais fornecidas
    const evento = EV.find(ev => ev.clienteUsuario === usuario && ev.clienteSenha === senha);
    if (!evento) {
        alert('❌ Usuário ou senha inválidos!');
        return;
    }

    // --- AGORA USAMOS A AUTENTICAÇÃO DO SUPABASE ---
    // Construímos um email único para o cliente (baseado no ID do evento)
    const emailCliente = `cliente_${evento.id}@eventos.local`;
    try {
        // Tenta logar com as credenciais (o Supabase já deve ter esse usuário criado)
        const result = await apiLogin(emailCliente, senha);
        // Se chegou aqui, login bem-sucedido
        eventoClienteAtual = evento; // guarda o evento na memória

        // Fecha a tela de login e abre o dashboard do cliente
        document.getElementById('loginClienteScreen').style.display = 'none';
        document.getElementById('clienteDashboard').style.display = 'block';
        abrirAreaClienteEvento(evento);

        // NÃO USAMOS localStorage – a sessão fica no Supabase (cookie/token)

    } catch (error) {
        // Se o usuário não existir no Supabase, podemos criá-lo agora
        if (error.message.includes('Invalid login credentials')) {
            // Cria o usuário no Supabase (primeiro acesso)
            try {
                await supabaseClient.auth.signUp({
                    email: emailCliente,
                    password: senha,
                });
                // Após criar, faz login novamente
                await apiLogin(emailCliente, senha);
                eventoClienteAtual = evento;
                document.getElementById('loginClienteScreen').style.display = 'none';
                document.getElementById('clienteDashboard').style.display = 'block';
                abrirAreaClienteEvento(evento);
            } catch (e) {
                alert('❌ Erro ao criar conta do cliente: ' + e.message);
            }
        } else {
            alert('❌ Erro no login: ' + error.message);
        }
    }
}

// ============================================================
// SAÍDA DO CLIENTE
// ============================================================

function confirmarSaidaCliente() {
    confirmarAcao('Deseja realmente sair?', async () => {
        // Faz logout no Supabase
        try {
            await apiLogout();
        } catch (e) {
            console.warn('Erro ao deslogar:', e);
        }
        // Limpa variáveis locais
        eventoClienteAtual = null;
        // Fecha o dashboard e mostra a tela de login do cliente
        document.getElementById('clienteDashboard').style.display = 'none';
        document.getElementById('loginClienteScreen').style.display = 'flex';
    });
}

// ============================================================
// RESTAURAR SESSÃO DO CLIENTE (ao recarregar a página)
// ============================================================

async function restaurarSessaoCliente() {
    // Tenta restaurar a sessão via Supabase
    try {
        const sessao = await apiRestaurarSessao();
        if (sessao) {
            // Se a sessão for de um cliente (email começa com "cliente_")
            if (sessao.email && sessao.email.startsWith('cliente_')) {
                // Extrai o ID do evento do email
                const idEvento = parseInt(sessao.email.split('_')[1]);
                const evento = EV.find(ev => ev.id === idEvento);
                if (evento) {
                    eventoClienteAtual = evento;
                    document.getElementById('loginClienteScreen').style.display = 'none';
                    document.getElementById('clienteDashboard').style.display = 'block';
                    abrirAreaClienteEvento(evento);
                    return true;
                }
            }
        }
    } catch (e) {
        console.warn('Erro ao restaurar sessão do cliente:', e);
    }
    return false;
}

// ============================================================
// CHAMAR A RESTAURAÇÃO NA INICIALIZAÇÃO DA PÁGINA
// ============================================================

// Adicione esta chamada ao final do seu script de inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // ... (outras inicializações)
    await restaurarSessaoCliente();
});
