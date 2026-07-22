// Autenticação e controle de acesso

async function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginPassword').value.trim();
    try {
        // Tenta login via Supabase (admin)
        const user = await apiLogin(email, senha);
        usuarioLogado = user;
        EV = await apiListarEventos();
        entrarSistema();
    } catch (e) {
        // Se falhar, tenta funcionário local
        if (typeof FN !== 'undefined' && Array.isArray(FN)) {
            const func = FN.find(f => f.email === email && (f.senha || '123456') === senha);
            if (func) {
                usuarioLogado = func;
                EV = await apiListarEventos();
                entrarSistema();
                return;
            }
        }
        alert('❌ ' + e.message);
    }
}

function entrarSistema() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('menuToggle').style.display = 'flex';
    atualizarInterfaceUsuario();
    aplicarPermissoes();
    showPage('inicio');
}

async function sairDoSistema() {
    try { await apiLogout(); } catch (e) {}
    sessao = null;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('menuToggle').style.display = 'none';
    closeMenu();
    usuarioLogado = null;
    eventoSelecionadoId = null;
}

function confirmarSaidaSistema() {
    confirmarAcao('Deseja realmente sair do sistema?', sairDoSistema);
}

function abrirAreaCliente() {
    const loginScreen = document.getElementById('loginScreen');
    const clienteScreen = document.getElementById('loginClienteScreen');
    if (loginScreen) loginScreen.style.display = 'none';
    if (clienteScreen) clienteScreen.style.display = 'flex';
}

function voltarLoginAdmin() {
    const clienteScreen = document.getElementById('loginClienteScreen');
    const loginScreen = document.getElementById('loginScreen');
    if (clienteScreen) clienteScreen.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
}

async function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginPassword').value.trim();
    try {
        // Tenta login via Supabase (admin)
        const user = await apiLogin(email, senha);
        usuarioLogado = user;
        EV = await apiListarEventos();
        // Carrega funcionários após login
        if (typeof carregarFuncionarios === 'function') {
            await carregarFuncionarios();
        }
        entrarSistema();
    } catch (e) {
        // Se falhar, tenta funcionário local
        // Se FN estiver vazio, tenta carregar do Supabase antes
        if (!FN || FN.length === 0) {
            try {
                if (typeof carregarFuncionarios === 'function') {
                    await carregarFuncionarios();
                }
            } catch (err) {
                console.warn('Não foi possível carregar funcionários.');
            }
        }
        const func = FN.find(f => f.email === email && f.senha === senha);
        if (func) {
            usuarioLogado = func;
            EV = await apiListarEventos();
            entrarSistema();
            return;
        }
        alert('❌ ' + e.message);
    }
}
function confirmarSaidaCliente() {
    confirmarAcao('Deseja realmente sair?', () => {
        localStorage.removeItem('clienteSession');
        document.getElementById('clienteDashboard').style.display = 'none';
        document.getElementById('loginClienteScreen').style.display = 'flex';
        eventoClienteAtual = null;
    });
}

function atualizarInterfaceUsuario() {
    const sidebarEmpresa = document.getElementById('sidebarEmpresaNome');
    if (sidebarEmpresa) sidebarEmpresa.textContent = CFG.empresaNome;
    const loginEmpresa = document.getElementById('loginEmpresaNome');
    if (loginEmpresa) loginEmpresa.textContent = CFG.empresaNome;

    const sidebarUser = document.getElementById('sidebarUserName');
    if (sidebarUser) sidebarUser.textContent = usuarioLogado ? usuarioLogado.nome.split(' ')[0] : 'Admin';
    const sidebarRole = document.getElementById('sidebarUserRole');
    if (sidebarRole) sidebarRole.textContent = usuarioLogado ? usuarioLogado.nivel : 'Administrador';

    const logotipo = CFG.logoUrl ? `<img src="${CFG.logoUrl}" style="max-width:100%;max-height:100%;object-fit:contain;">` : '🏢';
    document.getElementById('sidebarLogoImg').innerHTML = logotipo;
    document.getElementById('loginLogoPreview').innerHTML = logotipo;
    const clienteLoginLogo = document.getElementById('clienteLoginLogo');
    if (clienteLoginLogo) clienteLoginLogo.innerHTML = logotipo;
    const clienteLoginEmpresaNome = document.getElementById('clienteLoginEmpresaNome');
    if (clienteLoginEmpresaNome) clienteLoginEmpresaNome.textContent = CFG.empresaNome;
}

function preencherCamposConfiguracao() {
    const elNome = document.getElementById('configEmpresaNome');
    if (elNome) elNome.value = CFG.empresaNome;
    const elEmail = document.getElementById('configEmail');
    if (elEmail) elEmail.value = CFG.email;
    const elTelefone = document.getElementById('configTelefoneSuporte');
    if (elTelefone) elTelefone.value = CFG.telefoneSuporte;
    const elAdminNome = document.getElementById('configAdminNome');
    if (elAdminNome) elAdminNome.value = CFG.adminNome;
    const elAdminEmail = document.getElementById('configAdminEmail');
    if (elAdminEmail) elAdminEmail.value = CFG.adminEmail;
    const elAdminSenha = document.getElementById('configAdminSenha');
    if (elAdminSenha) elAdminSenha.value = '';
    configLogoTemp = CFG.logoUrl;
    atualizarPreviewLogoConfig();
}

function atualizarPreviewLogoConfig() {
    const preview = document.getElementById('configLogoPreview');
    if (preview) {
        preview.innerHTML = configLogoTemp ? `<img src="${configLogoTemp}" style="max-width:100%;max-height:100%;object-fit:contain;">` : '<span style="font-size:30px;">🏢</span>';
    }
}

function aplicarPermissoes() {
    const p = usuarioLogado?.permissoes || {};
    const menuFinanceiro = document.getElementById('menuFinanceiro');
    if (menuFinanceiro) menuFinanceiro.style.display = p.f ? 'flex' : 'none';
    const menuFuncionarios = document.getElementById('menuFuncionarios');
    if (menuFuncionarios) menuFuncionarios.style.display = p.g ? 'flex' : 'none';
    const menuConfig = document.getElementById('menuConfig');
    if (menuConfig) menuConfig.style.display = p.c ? 'flex' : 'none';
    const btnNovo = document.getElementById('btnNovoEvento');
    if (btnNovo) btnNovo.style.display = p.e ? 'inline-block' : 'none';
}
