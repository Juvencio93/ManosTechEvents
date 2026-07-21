// Autenticação e controle de acesso
function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginPassword').value.trim();
    if (email === CFG.adminEmail && senha === CFG.adminSenha) {
        usuarioLogado = {
            nome: CFG.adminNome,
            nivel: 'Administrador',
            permissoes: { v: true, d: true, vi: true, e: true, x: true, f: true, g: true, c: true, r: true }
        };
        entrarSistema();
        return;
    }
    const func = FN.find(f => f.email === email && (f.senha || '123456') === senha);
    if (func) {
        usuarioLogado = func;
        entrarSistema();
        return;
    }
    alert('❌ Credenciais inválidas!');
}

function entrarSistema() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('menuToggle').style.display = 'flex';
    // Apenas atualiza elementos globais (sidebar, logo)
    atualizarInterfaceUsuario();
    aplicarPermissoes();
    salvarDados();
    // O carregamento da página inicial e preenchimento de selects será feito por showPage('inicio')
}

function sairDoSistema() {
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

function fazerLoginCliente() {
    const usuario = document.getElementById('clienteUsuario').value.trim();
    const senha = document.getElementById('clienteSenha').value.trim();
    const evento = EV.find(ev => ev.clienteUsuario === usuario && ev.clienteSenha === senha);
    if (evento) {
        document.getElementById('loginClienteScreen').style.display = 'none';
        document.getElementById('clienteDashboard').style.display = 'block';
        abrirAreaClienteEvento(evento);
    } else {
        alert('❌ Usuário ou senha inválidos!');
    }
}

function confirmarSaidaCliente() {
    confirmarAcao('Deseja realmente sair?', () => {
        document.getElementById('clienteDashboard').style.display = 'none';
        document.getElementById('loginClienteScreen').style.display = 'flex';
        eventoClienteAtual = null;
    });
}

// Atualiza apenas elementos fixos (sidebar, logo)
function atualizarInterfaceUsuario() {
    // Sidebar
    const sidebarEmpresa = document.getElementById('sidebarEmpresaNome');
    if (sidebarEmpresa) sidebarEmpresa.textContent = CFG.empresaNome;
    const loginEmpresa = document.getElementById('loginEmpresaNome');
    if (loginEmpresa) loginEmpresa.textContent = CFG.empresaNome;
    
    const sidebarUser = document.getElementById('sidebarUserName');
    if (sidebarUser) sidebarUser.textContent = usuarioLogado ? usuarioLogado.nome.split(' ')[0] : 'Admin';
    const sidebarRole = document.getElementById('sidebarUserRole');
    if (sidebarRole) sidebarRole.textContent = usuarioLogado ? usuarioLogado.nivel : 'Administrador';

    const logo = CFG.logoUrl ? `<img src="${CFG.logoUrl}" style="max-width:100%;max-height:100%;object-fit:contain;">` : '🏢';
    const sidebarLogoImg = document.getElementById('sidebarLogoImg');
    if (sidebarLogoImg) sidebarLogoImg.innerHTML = logo;
    const loginLogoPreview = document.getElementById('loginLogoPreview');
    if (loginLogoPreview) loginLogoPreview.innerHTML = logo;
}

// Preenche campos da página de configuração – chamada apenas quando a página config é carregada
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
