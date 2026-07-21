const STORAGE_KEY = 'sge_v9';

let CFG = {
    empresaNome: 'Manos Tech',
    email: 'contato@manostech.com.br',
    telefoneSuporte: '(11) 99999-9999',
    adminNome: 'Carlos Silva',
    adminEmail: 'admin@manostech.com.br',
    adminSenha: '123456',
    logoUrl: ''
};

let EV = [];
let FN = [];

const DADOS_INICIAIS = {
    config: CFG,
    eventos: [
        {
            id: 1,
            nome: 'Feira de Tecnologia 2026',
            cliente: 'TechCorp',
            dataInicio: '2026-07-07',
            dataFim: '2026-07-10',
            local: 'Centro de Convenções SP',
            patrocinadores: 'TechCorp • InovaSoft',
            patrocinadoresLogos: [],
            logoUrl: '',
            valorCobrado: 8500,
            custoOperacional: 3200,
            valorPago: 5000,
            vencimento: '2026-06-20',
            formaPagamento: 'pix',
            parcelas: 1,
            observacoes: '',
            statusManual: '',
            clienteUsuario: 'techcorp',
            clienteSenha: '123456',
            visitantes: [],
            totalVisitantes: 0,
            tempoMedio: 42,
            pctMobile: 87
        }
    ],
    funcionarios: [
        {
            nome: 'Carlos Silva',
            email: 'carlos@manostech.com.br',
            nivel: 'Administrador',
            senha: '123456',
            eventos: 'Todos',
            permissoes: { v: true, d: true, vi: true, e: true, x: true, f: true, g: true, c: true, r: true }
        },
        {
            nome: 'Ana Souza',
            email: 'ana@manostech.com.br',
            nivel: 'Técnico',
            senha: '123456',
            eventos: 'Feira Tech',
            permissoes: { v: true, d: true, vi: true, e: false, x: false, f: false, g: false, c: false, r: true }
        }
    ]
};

let usuarioLogado = null;
let eventoEmEdicao = null;
let funcionarioEmEdicao = null;
let eventoSelecionadoId = null;
let logoTemporario = null;
let configLogoTemp = null;
let patrocinadoresTemp = [];
let eventoClienteAtual = null;
let callbackConfirmacao = null;

function carregarDados() {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (dados) {
        try {
            const parsed = JSON.parse(dados);
            if (parsed.config) CFG = parsed.config;
            if (parsed.eventos) EV = parsed.eventos;
            if (parsed.funcionarios) FN = parsed.funcionarios;
            return;
        } catch (e) {}
    }
    CFG = DADOS_INICIAIS.config;
    EV = DADOS_INICIAIS.eventos;
    FN = DADOS_INICIAIS.funcionarios;
    salvarDados();
}

function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config: CFG, eventos: EV, funcionarios: FN }));
}

function formatarData(data) {
    if (!data) return '';
    const partes = data.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
}

function calcularStatusEvento(evento) {
    if (evento.statusManual) return evento.statusManual;
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const inicio = new Date(evento.dataInicio + 'T00:00:00');
    const fim = new Date(evento.dataFim + 'T23:59:59');
    if (hoje < inicio) return 'Agendado';
    if (hoje >= inicio && hoje <= fim) return 'Ativo';
    return 'Encerrado';
}

function statusBadgeClass(status) {
    if (status === 'Ativo') return 'badge-success';
    if (status === 'Agendado') return 'badge-warning';
    return 'badge-secondary';
}

function statusPagamento(evento) {
    const pago = evento.valorPago || 0;
    const total = evento.valorCobrado || 0;
    if (pago >= total && total > 0) return { texto: 'Pago', classe: 'badge-success' };
    if (pago > 0) return { texto: 'Parcial', classe: 'badge-warning' };
    return { texto: 'Pendente', classe: 'badge-danger' };
}

function gerarLinkPortal(evento) {
    const slug = evento.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `https://portal.manostech.com.br/evento/${evento.id}/${slug}`;
}

function escapeHtml(texto) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(texto).replace(/[&<>"']/g, m => map[m]);
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatarMoeda(valor) {
    return 'R$ ' + Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function toast(mensagem) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = mensagem;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function toggleMenu() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('menuOverlay');
    if (sb) sb.classList.toggle('open');
    if (ov) ov.classList.toggle('active');
}

function closeMenu() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('menuOverlay');
    if (sb) sb.classList.remove('open');
    if (ov) ov.classList.remove('active');
}

function confirmarAcao(mensagem, callback) {
    document.getElementById('confirmMessage').textContent = mensagem;
    callbackConfirmacao = callback;
    abrirModal('confirmModal');
}

['eventoModal', 'funcionarioModal', 'portalModal', 'qrModal', 'confirmModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) fecharModal(id);
        });
    }
});

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
    atualizarInterfaceUsuario();
    preencherSelectsEventos();
    renderizarEventos();
    renderizarFuncionarios();
    aplicarPermissoes();
    atualizarResumoFinanceiroGeral();
    salvarDados();
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

function atualizarInterfaceUsuario() {
    document.getElementById('sidebarEmpresaNome').textContent = CFG.empresaNome;
    document.getElementById('loginEmpresaNome').textContent = CFG.empresaNome;
    document.getElementById('sidebarUserName').textContent = usuarioLogado ? usuarioLogado.nome.split(' ')[0] : 'Admin';
    document.getElementById('sidebarUserRole').textContent = usuarioLogado ? usuarioLogado.nivel : 'Administrador';

    const logo = CFG.logoUrl ? `<img src="${CFG.logoUrl}" style="max-width:100%;max-height:100%;object-fit:contain;">` : '🏢';
    document.getElementById('sidebarLogoImg').innerHTML = logo;
    document.getElementById('loginLogoPreview').innerHTML = logo;

    document.getElementById('configEmpresaNome').value = CFG.empresaNome;
    document.getElementById('configEmail').value = CFG.email;
    document.getElementById('configTelefoneSuporte').value = CFG.telefoneSuporte;
    document.getElementById('configAdminNome').value = CFG.adminNome;
    document.getElementById('configAdminEmail').value = CFG.adminEmail;
    document.getElementById('configAdminSenha').value = '';
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
    document.getElementById('menuFinanceiro').style.display = p.f ? 'flex' : 'none';
    document.getElementById('menuFuncionarios').style.display = p.g ? 'flex' : 'none';
    document.getElementById('menuConfig').style.display = p.c ? 'flex' : 'none';
    const btnNovo = document.getElementById('btnNovoEvento');
    if (btnNovo) btnNovo.style.display = p.e ? 'inline-block' : 'none';
}

function preencherSelectsEventos() {
    const opcoes = EV.map(e => `<option value="${e.id}">${e.nome} - ${e.cliente} (${calcularStatusEvento(e)})</option>`).join('');
    ['eventoSelect', 'eventoSelectFinanceiro'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<option value="">-- Escolha --</option>' + opcoes;
    });
    const relEl = document.getElementById('relatorioEventoSelect');
    if (relEl) relEl.innerHTML = '<option value="">Selecione...</option>' + EV.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
}

function showPage(nome) {
    fecharModal('eventoModal');
    fecharModal('funcionarioModal');
    fecharModal('qrModal');
    fecharModal('portalModal');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pagina = document.getElementById('page-' + nome);
    if (pagina) pagina.classList.add('active');
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.sidebar nav a').forEach(a => {
        if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${nome}'`)) a.classList.add('active');
    });
    const eventoSelector = document.getElementById('eventoSelectorDashboard');
    if (eventoSelector) eventoSelector.style.display = (nome === 'dashboard') ? 'flex' : 'none';
    if (nome === 'financeiro') atualizarResumoFinanceiroGeral();
    if (nome === 'configuracao') atualizarInterfaceUsuario();
    if (nome === 'relatorios') preencherSelectsEventos();
    closeMenu();
}

function abrirModalEvento() {
    if (!usuarioLogado?.permissoes?.e) { toast('🔒 Sem permissão!'); return; }
    eventoEmEdicao = null;
    document.getElementById('eventoModalTitle').textContent = '📅 Novo Evento';
    limparFormularioEvento();
    abrirModal('eventoModal');
}

function editarEvento(id) {
    if (!usuarioLogado?.permissoes?.e) { toast('🔒 Sem permissão!'); return; }
    eventoEmEdicao = id;
    document.getElementById('eventoModalTitle').textContent = '✏️ Editar Evento';
    const evento = EV.find(e => e.id === id);
    if (!evento) return;
    document.getElementById('eventoNome').value = evento.nome;
    document.getElementById('eventoCliente').value = evento.cliente;
    document.getElementById('eventoDataInicio').value = evento.dataInicio;
    document.getElementById('eventoDataFim').value = evento.dataFim;
    document.getElementById('eventoLocalInput').value = evento.local;
    document.getElementById('eventoClienteUsuario').value = evento.clienteUsuario || '';
    document.getElementById('eventoClienteSenha').value = evento.clienteSenha || '';
    document.getElementById('eventoPatrocinadores').value = evento.patrocinadores || '';
    document.getElementById('eventoObservacoes').value = evento.observacoes || '';
    document.getElementById('eventoValorCobrado').value = evento.valorCobrado || 0;
    document.getElementById('eventoCustoOperacional').value = evento.custoOperacional || 0;
    document.getElementById('eventoValorPago').value = evento.valorPago || 0;
    document.getElementById('eventoVencimento').value = evento.vencimento || '';
    document.getElementById('eventoFormaPagamento').value = evento.formaPagamento || '';
    document.getElementById('eventoParcelas').value = evento.parcelas || 1;
    logoTemporario = evento.logoUrl;
    document.getElementById('logoPreview').innerHTML = evento.logoUrl ? `<img src="${evento.logoUrl}">` : '<span>📷 Upload</span>';
    patrocinadoresTemp = [...(evento.patrocinadoresLogos || [])];
    renderizarPatrocinadores();
    esconderDicas();
    abrirModal('eventoModal');
}

function limparFormularioEvento() {
    ['eventoNome','eventoCliente','eventoDataInicio','eventoDataFim','eventoLocalInput','eventoClienteUsuario','eventoClienteSenha','eventoPatrocinadores','eventoObservacoes'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('eventoValorCobrado').value = '0';
    document.getElementById('eventoCustoOperacional').value = '0';
    document.getElementById('eventoValorPago').value = '0';
    document.getElementById('eventoVencimento').value = '';
    document.getElementById('eventoFormaPagamento').value = '';
    document.getElementById('eventoParcelas').value = '1';
    logoTemporario = null;
    document.getElementById('logoPreview').innerHTML = '<span>📷 Upload</span>';
    patrocinadoresTemp = [];
    renderizarPatrocinadores();
    esconderDicas();
}

function esconderDicas() {
    document.querySelectorAll('.hint-msg').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

function previewLogoEvento(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoTemporario = e.target.result;
            document.getElementById('logoPreview').innerHTML = `<img src="${logoTemporario}">`;
        };
        reader.readAsDataURL(file);
    }
}

function adicionarPatrocinador(event) {
    const files = event.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            patrocinadoresTemp.push(e.target.result);
            renderizarPatrocinadores();
        };
        reader.readAsDataURL(file);
    });
    event.target.value = '';
}

function removerPatrocinador(index) {
    patrocinadoresTemp.splice(index, 1);
    renderizarPatrocinadores();
}

function renderizarPatrocinadores() {
    const container = document.getElementById('patrocinadoresContainer');
    container.innerHTML = patrocinadoresTemp.map((url, i) =>
        `<div class="patrocinador-thumb"><img src="${url}"><button class="remove-btn" onclick="removerPatrocinador(${i})">✕</button></div>`
    ).join('') + '<div class="patrocinador-add" onclick="document.getElementById(\'patrocinadorUpload\').click()">+</div>';
}

function salvarEvento() {
    if (!usuarioLogado?.permissoes?.e) { toast('🔒 Sem permissão!'); return; }
    esconderDicas();
    let temErro = false;
    const campos = [
        { id: 'eventoNome', hint: 'hintNome' },
        { id: 'eventoCliente', hint: 'hintCliente' },
        { id: 'eventoDataInicio', hint: 'hintDataInicio' },
        { id: 'eventoDataFim', hint: 'hintDataFim' },
        { id: 'eventoLocalInput', hint: 'hintLocal' },
        { id: 'eventoClienteUsuario', hint: 'hintClienteUsuario' },
        { id: 'eventoClienteSenha', hint: 'hintClienteSenha' }
    ];
    campos.forEach(c => {
        const el = document.getElementById(c.id);
        if (!el.value.trim()) {
            el.classList.add('input-error');
            document.getElementById(c.hint).style.display = 'block';
            temErro = true;
        }
    });
    if (temErro) {
        toast('⚠️ Preencha todos os campos obrigatórios!');
        document.querySelector('.input-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const dados = {
        nome: document.getElementById('eventoNome').value.trim(),
        cliente: document.getElementById('eventoCliente').value.trim(),
        dataInicio: document.getElementById('eventoDataInicio').value,
        dataFim: document.getElementById('eventoDataFim').value,
        local: document.getElementById('eventoLocalInput').value.trim(),
        clienteUsuario: document.getElementById('eventoClienteUsuario').value.trim(),
        clienteSenha: document.getElementById('eventoClienteSenha').value.trim(),
        patrocinadores: document.getElementById('eventoPatrocinadores').value.trim(),
        patrocinadoresLogos: [...patrocinadoresTemp],
        observacoes: document.getElementById('eventoObservacoes').value.trim(),
        valorCobrado: parseFloat(document.getElementById('eventoValorCobrado').value) || 0,
        custoOperacional: parseFloat(document.getElementById('eventoCustoOperacional').value) || 0,
        valorPago: parseFloat(document.getElementById('eventoValorPago').value) || 0,
        vencimento: document.getElementById('eventoVencimento').value,
        formaPagamento: document.getElementById('eventoFormaPagamento').value,
        parcelas: parseInt(document.getElementById('eventoParcelas').value) || 1
    };

    if (eventoEmEdicao) {
        const ev = EV.find(e => e.id === eventoEmEdicao);
        Object.assign(ev, dados);
        ev.logoUrl = logoTemporario || ev.logoUrl;
        toast('✅ Evento atualizado!');
    } else {
        const novoId = Math.max(...EV.map(e => e.id), 0) + 1;
        EV.push({
            id: novoId,
            ...dados,
            logoUrl: logoTemporario || '',
            visitantes: [],
            totalVisitantes: 0,
            tempoMedio: 0,
            pctMobile: 0,
            statusManual: ''
        });
        toast('✅ Evento criado!');
        eventoSelecionadoId = novoId;
        const link = gerarLinkPortal(EV[EV.length-1]);
        document.getElementById('qrModalLink').textContent = link;
        gerarQRCode('qrModalContainer', link);
        abrirModal('qrModal');
    }

    fecharModal('eventoModal');
    preencherSelectsEventos();
    renderizarEventos();
    salvarDados();
    if (eventoSelecionadoId) {
        document.getElementById('eventoSelect').value = eventoSelecionadoId;
        selecionarEvento();
    }
    atualizarResumoFinanceiroGeral();
    eventoEmEdicao = null;
    logoTemporario = null;
    patrocinadoresTemp = [];
}

function excluirEvento(id) {
    if (!usuarioLogado?.permissoes?.x) { toast('🔒 Sem permissão!'); return; }
    confirmarAcao('Deseja realmente excluir este evento?', () => {
        EV = EV.filter(e => e.id !== id);
        if (eventoSelecionadoId === id) {
            eventoSelecionadoId = null;
            document.getElementById('dashboardContent').style.display = 'none';
            document.getElementById('dashboardEmpty').style.display = 'block';
        }
        preencherSelectsEventos();
        renderizarEventos();
        atualizarResumoFinanceiroGeral();
        salvarDados();
        toast('🗑️ Evento excluído!');
    });
}

function verEvento(id) {
    document.getElementById('eventoSelect').value = id;
    selecionarEvento();
    showPage('dashboard');
}

function selecionarEvento() {
    const id = parseInt(document.getElementById('eventoSelect').value);
    if (!id) {
        eventoSelecionadoId = null;
        document.getElementById('dashboardContent').style.display = 'none';
        document.getElementById('dashboardEmpty').style.display = 'block';
        return;
    }
    eventoSelecionadoId = id;
    const evento = EV.find(e => e.id === id);
    if (!evento) return;
    document.getElementById('dashboardContent').style.display = 'block';
    document.getElementById('dashboardEmpty').style.display = 'none';

    const status = calcularStatusEvento(evento);
    document.getElementById('eventoStatusMini').textContent = status;
    document.getElementById('eventoStatusMini').className = 'badge ' + statusBadgeClass(status);
    document.getElementById('eventoStatusMini').style.display = 'inline-block';

    document.getElementById('totalVisitantes').textContent = evento.totalVisitantes || 0;
    document.getElementById('liveConnected').textContent = (evento.totalVisitantes > 0) ? Math.floor(Math.random() * 50) + 30 : 0;
    document.getElementById('tempoMedio').textContent = (evento.tempoMedio || 0) + 'min';
    document.getElementById('pctMobile').textContent = (evento.pctMobile || 0) + '%';

    const link = gerarLinkPortal(evento);
    document.getElementById('dashboardPortalLink').textContent = link;
    gerarQRCode('dashboardQrContainer', link);
    document.getElementById('dashboardClienteInfo').textContent = `Usuário: ${evento.clienteUsuario || 'N/A'} | Senha: ${evento.clienteSenha || 'N/A'}`;

    const horas = {};
    for (let h = 8; h <= 20; h++) horas[h] = 0;
    if (evento.visitantes) {
        evento.visitantes.forEach(v => {
            const h = v.hora || 8;
            if (horas[h] !== undefined) horas[h]++;
        });
    }
    const max = Math.max(...Object.values(horas), 1);
    document.getElementById('heatmapContainer').innerHTML = Object.entries(horas).map(([h, c]) =>
        `<div class="heatmap-bar" style="height:${Math.max((c/max)*140,4)}px;" title="${h}h: ${c}"></div>`
    ).join('');

    const visitantes = evento.visitantes || [];
    document.getElementById('visitantesList').innerHTML = visitantes.slice(0, 10).map(v =>
        `<div style="display:flex;align-items:center;gap:12px;padding:8px;border-bottom:1px solid rgba(255,255,255,0.04);">
            <div style="width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-weight:600;color:var(--azul);">${escapeHtml(v.nome).charAt(0)}</div>
            <div><strong>${escapeHtml(v.nome)}</strong><br><small style="color:var(--text2);">${escapeHtml(v.email)} • ${escapeHtml(v.whatsapp)}</small></div>
        </div>`
    ).join('');
    document.getElementById('visitantesCount').textContent = evento.totalVisitantes + ' visitantes';

    document.getElementById('visitantesTableFull').innerHTML = visitantes.map(v =>
        `<tr><td><strong>${escapeHtml(v.nome)}</strong></td><td>${escapeHtml(v.email)}</td><td>${escapeHtml(v.whatsapp)}</td><td>${v.acesso}</td><td>${escapeHtml(v.dispositivo || '')}</td></tr>`
    ).join('');

    const ios = Math.floor(Math.random() * 40) + 30;
    const android = Math.floor(Math.random() * 30) + 20;
    const desktop = 100 - ios - android;
    document.getElementById('pieChart').style.background = `conic-gradient(var(--azul) 0% ${ios}%, #40a0ff ${ios}% ${ios+android}%, var(--yellow) ${ios+android}% 100%)`;
}

function gerarQRCode(containerId, link) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
        new QRCode(container, { text: link, width: 120, height: 120, colorDark: '#000', colorLight: '#fff' });
    }
}

function copiarLinkDashboard() {
    const link = document.getElementById('dashboardPortalLink').textContent;
    navigator.clipboard.writeText(link).then(() => toast('📋 Link copiado!'));
}

function atualizarResumoFinanceiroGeral() {
    const totalCobrado = EV.reduce((acc, e) => acc + (e.valorCobrado || 0), 0);
    const totalCusto = EV.reduce((acc, e) => acc + (e.custoOperacional || 0), 0);
    const lucro = totalCobrado - totalCusto;
    document.getElementById('resumoTotalCobrado').textContent = formatarMoeda(totalCobrado);
    document.getElementById('resumoTotalCusto').textContent = formatarMoeda(totalCusto);
    document.getElementById('resumoLucroTotal').textContent = formatarMoeda(lucro);
    document.getElementById('resumoLucroTotal').style.color = lucro >= 0 ? 'var(--green)' : 'var(--red)';
}

function selecionarEventoFinanceiro() {
    const id = parseInt(document.getElementById('eventoSelectFinanceiro').value);
    const content = document.getElementById('financeiroContent');
    const empty = document.getElementById('financeiroEmpty');
    if (!id) {
        content.style.display = 'none';
        empty.style.display = 'block';
        return;
    }
    const evento = EV.find(e => e.id === id);
    if (!evento) return;
    content.style.display = 'block';
    empty.style.display = 'none';

    const p = usuarioLogado?.permissoes || {};
    const semPermissao = !p.f;

    const valorCobrado = evento.valorCobrado || 0;
    const custo = evento.custoOperacional || 0;
    const pago = evento.valorPago || 0;
    const lucro = valorCobrado - custo;
    const margem = valorCobrado > 0 ? (lucro / valorCobrado) * 100 : 0;

    if (semPermissao) {
        ['finValorCobrado','finCustoOperacional','finLucro','finMargem','finValorTotal','finValorPago','finValorPendente'].forEach(id => document.getElementById(id).textContent = 'R$ ••••');
        document.getElementById('finStatusPagamento').innerHTML = '<span class="badge badge-secondary">🔒 Sem permissão</span>';
        document.getElementById('finParcelasTable').innerHTML = '<tr><td colspan="4">🔒</td></tr>';
        return;
    }

    document.getElementById('finValorCobrado').textContent = formatarMoeda(valorCobrado);
    document.getElementById('finCustoOperacional').textContent = formatarMoeda(custo);
    document.getElementById('finCustoOperacional').style.color = 'var(--red)';
    document.getElementById('finLucro').textContent = formatarMoeda(lucro);
    document.getElementById('finLucro').style.color = lucro >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('finMargem').textContent = margem.toFixed(1).replace('.', ',') + '%';

    const sp = statusPagamento(evento);
    document.getElementById('finStatusPagamento').innerHTML = `<span class="badge ${sp.classe}" style="font-size:14px;padding:8px 16px;">${sp.texto}</span>`;

    document.getElementById('finValorTotal').textContent = formatarMoeda(valorCobrado);
    document.getElementById('finValorPago').textContent = formatarMoeda(pago);
    document.getElementById('finValorPago').style.color = 'var(--green)';
    const saldoDevedor = Math.max(0, valorCobrado - pago);
    document.getElementById('finValorPendente').textContent = formatarMoeda(saldoDevedor);
    document.getElementById('finValorPendente').style.color = 'var(--yellow)';
    document.getElementById('finVencimento').textContent = evento.vencimento ? formatarData(evento.vencimento) : 'Não definido';
    document.getElementById('finFormaPagamento').textContent = {
        pix: 'PIX', boleto: 'Boleto', cartao: 'Cartão', transferencia: 'Transferência'
    }[evento.formaPagamento] || 'Não definido';

    const parcelas = evento.parcelas || 1;
    let htmlParcelas = '';
    if (saldoDevedor <= 0) {
        htmlParcelas = '<tr><td colspan="4">✅ Totalmente quitado</td></tr>';
    } else {
        const valorParcela = saldoDevedor / parcelas;
        for (let i = 1; i <= parcelas; i++) {
            htmlParcelas += `<tr><td>${i}ª</td><td>${formatarMoeda(valorParcela)}</td><td>${evento.vencimento ? formatarData(evento.vencimento) : '-'}</td><td><span class="badge badge-warning">Pendente</span></td></tr>`;
        }
    }
    document.getElementById('finParcelasTable').innerHTML = htmlParcelas;
}

function gerarPDF() {
    const id = document.getElementById('relatorioEventoSelect').value;
    if (!id) { alert('⚠️ Selecione um evento!'); return; }
    const evento = EV.find(ev => ev.id === parseInt(id));
    if (evento) gerarPDFEvento(evento);
}

function gerarRelatorioCliente() {
    if (eventoClienteAtual) gerarPDFEvento(eventoClienteAtual);
}

function gerarPDFEvento(evento) {
    const empresaLogo = CFG.logoUrl ? `<img src="${CFG.logoUrl}" style="max-height:60px;" />` : `<strong>${CFG.empresaNome}</strong>`;
    const eventoLogo = evento.logoUrl ? `<img src="${evento.logoUrl}" style="max-height:60px;" />` : '<span style="font-size:24px;">🎪</span>';

    const visitantesRows = (evento.visitantes || []).map(v =>
        `<tr><td>${escapeHtml(v.nome)}</td><td>${escapeHtml(v.email)}</td><td>${escapeHtml(v.whatsapp)}</td><td>${v.acesso}</td></tr>`
    ).join('');

    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 30px; color: #333; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4da8da; padding-bottom: 15px; margin-bottom: 20px;">
            <div>${empresaLogo}</div>
            <div style="text-align: right;"><h2 style="margin:0; color: #4da8da;">${CFG.empresaNome}</h2><small>${CFG.email} | ${CFG.telefoneSuporte}</small></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <div>
                <h1 style="margin:0; font-size: 24px;">${escapeHtml(evento.nome)}</h1>
                <p style="margin:5px 0;">Cliente: ${escapeHtml(evento.cliente)}</p>
                <p style="margin:5px 0;">Período: ${formatarData(evento.dataInicio)} a ${formatarData(evento.dataFim)}</p>
                <p style="margin:5px 0;">Local: ${escapeHtml(evento.local)}</p>
            </div>
            <div>${eventoLogo}</div>
        </div>
        <h3 style="color: #4da8da;">Visitantes (Total: ${evento.totalVisitantes})</h3>
        <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
            <thead><tr style="background: #f0f6fa;"><th style="padding: 10px; border: 1px solid #ddd;">Nome</th><th style="padding: 10px; border: 1px solid #ddd;">E-mail</th><th style="padding: 10px; border: 1px solid #ddd;">WhatsApp</th><th style="padding: 10px; border: 1px solid #ddd;">Horário</th></tr></thead>
            <tbody>${visitantesRows || '<tr><td colspan="4" style="text-align:center;padding:20px;">Nenhum visitante registrado.</td></tr>'}</tbody>
        </table>
        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">Relatório gerado em ${new Date().toLocaleString('pt-BR')} | ${CFG.empresaNome}</div>
    </div>`;

    const elemento = document.createElement('div');
    elemento.innerHTML = html;
    document.body.appendChild(elemento);

    const opt = {
        margin: 5,
        filename: `relatorio_${evento.nome.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(elemento).save().then(() => {
        document.body.removeChild(elemento);
        toast('📄 PDF gerado com sucesso!');
    });
}

function abrirModalFuncionario() {
    if (!usuarioLogado?.permissoes?.g) { toast('🔒 Sem permissão!'); return; }
    funcionarioEmEdicao = null;
    document.getElementById('funcionarioModalTitle').textContent = '👷 Novo Funcionário';
    document.getElementById('funcNome').value = '';
    document.getElementById('funcEmail').value = '';
    document.getElementById('funcNivel').value = 'Técnico';
    document.getElementById('funcSenha').value = '';
    document.getElementById('funcEventos').value = '';
    atualizarPermPadrao();
    abrirModal('funcionarioModal');
}

function editarFuncionario(index) {
    if (!usuarioLogado?.permissoes?.g) { toast('🔒 Sem permissão!'); return; }
    funcionarioEmEdicao = index;
    document.getElementById('funcionarioModalTitle').textContent = '✏️ Editar Funcionário';
    const f = FN[index];
    document.getElementById('funcNome').value = f.nome;
    document.getElementById('funcEmail').value = f.email;
    document.getElementById('funcNivel').value = f.nivel;
    document.getElementById('funcSenha').value = f.senha || '';
    document.getElementById('funcEventos').value = f.eventos || '';
    document.querySelectorAll('#permissoesGroup input[type="checkbox"]').forEach(cb => {
        const label = cb.parentElement.textContent.toLowerCase();
        let checked = false;
        if (label.includes('visualizar')) checked = f.permissoes.v;
        else if (label.includes('dashboard')) checked = f.permissoes.d;
        else if (label.includes('visitantes')) checked = f.permissoes.vi;
        else if (label.includes('editar')) checked = f.permissoes.e;
        else if (label.includes('excluir')) checked = f.permissoes.x;
        else if (label.includes('financeiro')) checked = f.permissoes.f;
        else if (label.includes('gerenciar')) checked = f.permissoes.g;
        else if (label.includes('configuraç')) checked = f.permissoes.c;
        else if (label.includes('relatório')) checked = f.permissoes.r;
        cb.checked = checked;
        cb.parentElement.classList.toggle('checked', checked);
    });
    abrirModal('funcionarioModal');
}

function atualizarPermPadrao() {
    const nivel = document.getElementById('funcNivel').value;
    document.querySelectorAll('#permissoesGroup input[type="checkbox"]').forEach(cb => {
        const label = cb.parentElement.textContent.toLowerCase();
        let checked = nivel === 'Administrador' ? true :
            (label.includes('visualizar') || label.includes('dashboard') || label.includes('visitantes') || label.includes('editar') || label.includes('relatório'));
        cb.checked = checked;
        cb.parentElement.classList.toggle('checked', checked);
    });
}

function salvarFuncionario() {
    const nome = document.getElementById('funcNome').value.trim();
    const email = document.getElementById('funcEmail').value.trim();
    if (!nome || !email) { alert('⚠️ Preencha nome e e-mail!'); return; }
    if (!validarEmail(email)) { alert('⚠️ E-mail inválido!'); return; }

    const permissoes = {};
    document.querySelectorAll('#permissoesGroup input[type="checkbox"]').forEach(cb => {
        const label = cb.parentElement.textContent.toLowerCase();
        if (label.includes('visualizar')) permissoes.v = cb.checked;
        else if (label.includes('dashboard')) permissoes.d = cb.checked;
        else if (label.includes('visitantes')) permissoes.vi = cb.checked;
        else if (label.includes('editar')) permissoes.e = cb.checked;
        else if (label.includes('excluir')) permissoes.x = cb.checked;
        else if (label.includes('financeiro')) permissoes.f = cb.checked;
        else if (label.includes('gerenciar')) permissoes.g = cb.checked;
        else if (label.includes('configuraç')) permissoes.c = cb.checked;
        else if (label.includes('relatório')) permissoes.r = cb.checked;
    });

    const dados = {
        nome, email,
        nivel: document.getElementById('funcNivel').value,
        senha: document.getElementById('funcSenha').value || '123456',
        eventos: document.getElementById('funcEventos').value.trim(),
        permissoes
    };

    if (funcionarioEmEdicao !== null) {
        FN[funcionarioEmEdicao] = dados;
    } else {
        FN.push(dados);
    }
    fecharModal('funcionarioModal');
    renderizarFuncionarios();
    salvarDados();
    toast('✅ Funcionário salvo!');
    funcionarioEmEdicao = null;
}

function excluirFuncionario(index) {
    if (!usuarioLogado?.permissoes?.g) { toast('🔒 Sem permissão!'); return; }
    confirmarAcao('Deseja realmente excluir este funcionário?', () => {
        FN.splice(index, 1);
        renderizarFuncionarios();
        salvarDados();
        toast('🗑️ Funcionário excluído!');
    });
}

function previewLogoConfig(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            configLogoTemp = e.target.result;
            atualizarPreviewLogoConfig();
        };
        reader.readAsDataURL(file);
    }
}

function salvarConfiguracao() {
    CFG.empresaNome = document.getElementById('configEmpresaNome').value.trim() || 'Manos Tech';
    CFG.email = document.getElementById('configEmail').value.trim();
    CFG.telefoneSuporte = document.getElementById('configTelefoneSuporte').value.trim();
    const novoNome = document.getElementById('configAdminNome').value.trim();
    if (novoNome) CFG.adminNome = novoNome;
    const novoEmail = document.getElementById('configAdminEmail').value.trim();
    if (novoEmail && validarEmail(novoEmail)) CFG.adminEmail = novoEmail;
    const novaSenha = document.getElementById('configAdminSenha').value.trim();
    if (novaSenha) {
        if (novaSenha.length < 4) { toast('⚠️ Senha: mínimo 4 caracteres'); return; }
        CFG.adminSenha = novaSenha;
    }
    if (configLogoTemp !== null && configLogoTemp !== undefined) CFG.logoUrl = configLogoTemp;
    atualizarInterfaceUsuario();
    salvarDados();
    toast('✅ Configurações salvas!');
}

function cancelarConfiguracao() {
    carregarDados();
    atualizarInterfaceUsuario();
    showPage('inicio');
    toast('Alterações canceladas.');
}

function abrirAreaClienteEvento(evento) {
    eventoClienteAtual = evento;
    document.getElementById('clienteEventoNome').textContent = evento.nome;
    document.getElementById('clienteLogoHeader').innerHTML = evento.logoUrl ? 
        `<img src="${evento.logoUrl}" style="width:100%;height:100%;object-fit:contain;">` : '🎪';

    const visitantes = evento.visitantes || [];
    const total = visitantes.length;

    const conectados = total > 0 ? Math.floor(Math.random() * 50) + 30 : 0;
    document.getElementById('clienteLiveConnected').textContent = conectados;
    document.getElementById('clienteTotalVisitantes').textContent = total;

    const horas = {};
    for (let h = 8; h <= 20; h++) horas[h] = 0;
    visitantes.forEach(v => { 
        const h = v.hora || 8; 
        if (horas[h] !== undefined) horas[h]++; 
    });
    const max = Math.max(...Object.values(horas), 1);
    document.getElementById('clienteHeatmapContainer').innerHTML = Object.entries(horas).map(([h, c]) =>
        `<div class="heatmap-bar" style="height:${Math.max((c/max)*140,4)}px;" title="${h}h: ${c}"></div>`
    ).join('');

    document.getElementById('clienteVisitantesTable').innerHTML = visitantes.slice(0, 50).map(v =>
        `<tr><td><strong>${escapeHtml(v.nome)}</strong></td><td>${escapeHtml(v.email)}</td><td>${escapeHtml(v.whatsapp)}</td><td>${v.acesso}</td></tr>`
    ).join('');
}

function abrirPortalCat(id) {
    const evento = EV.find(ev => ev.id === id);
    if (!evento) return;
    document.getElementById('portalLogoGrande').innerHTML = evento.logoUrl ? `<img src="${evento.logoUrl}" style="max-width:100%;max-height:100%;object-fit:contain;">` : '<span style="font-size:48px;">🎪</span>';
    const faixa = document.getElementById('carrosselFaixa');
    const logos = evento.patrocinadoresLogos || [];
    if (logos.length > 4) {
        faixa.innerHTML = [...logos, ...logos].map(url => `<img src="${url}" alt="Patrocinador">`).join('');
        faixa.style.animation = 'scrollPatrocinadores 20s linear infinite';
    } else {
        faixa.innerHTML = logos.map(url => `<img src="${url}" alt="Patrocinador">`).join('');
        faixa.style.animation = 'none';
    }
    document.getElementById('portalNome').value = '';
    document.getElementById('portalEmail').value = '';
    document.getElementById('portalWhatsApp').value = '';
    document.getElementById('portalLGPD').checked = false;
    document.getElementById('lgpdError').style.display = 'none';
    abrirModal('portalModal');
}

// CORREÇÃO: formatação livre, sem máscara rígida
function formatWhatsApp(input) {
    // Permite dígitos, +, -, parênteses e espaços. Não força nenhum formato.
    let valor = input.value.replace(/[^\d+\-() ]/g, '');
    input.value = valor;
}

function simularConexao() {
    const nome = document.getElementById('portalNome').value.trim();
    const email = document.getElementById('portalEmail').value.trim();
    const whatsapp = document.getElementById('portalWhatsApp').value.trim();
    if (!nome) { alert('⚠️ Preencha seu nome!'); return; }
    if (!email) { alert('⚠️ Preencha seu e-mail!'); return; }
    
    // Validação flexível: mínimo 7 dígitos, máximo 15 (padrão internacional)
    const digitos = whatsapp.replace(/\D/g, '');
    if (whatsapp && (digitos.length < 7 || digitos.length > 15)) {
        alert('⚠️ Número de WhatsApp inválido. Informe um número com 7 a 15 dígitos (ex: +55 11 91234-5678).');
        return;
    }
    
    if (!document.getElementById('portalLGPD').checked) {
        document.getElementById('lgpdError').style.display = 'block';
        return;
    }
    
    const evento = EV.find(ev => ev.id === eventoSelecionadoId) || eventoClienteAtual;
    if (evento) {
        const agora = new Date();
        evento.visitantes.unshift({
            nome: escapeHtml(nome),
            email: email,
            whatsapp: whatsapp || '(não informado)',
            acesso: agora.toLocaleString('pt-BR'),
            hora: agora.getHours(),
            dispositivo: ['iPhone 15 Pro', 'Samsung S24', 'MacBook Pro'][Math.floor(Math.random() * 3)],
            ip: '192.168.1.' + Math.floor(Math.random() * 255)
        });
        evento.totalVisitantes = evento.visitantes.length;
        salvarDados();
        if (eventoSelecionadoId === evento.id) selecionarEvento();
        if (eventoClienteAtual?.id === evento.id) abrirAreaClienteEvento(evento);
        renderizarEventos();
    }
    fecharModal('portalModal');
    toast('✅ Conectado!');
}

function renderizarEventos() {
    const p = usuarioLogado?.permissoes || {};
    const tbody = document.getElementById('eventosTable');
    if (!tbody) return;
    tbody.innerHTML = EV.map(e => {
        const status = calcularStatusEvento(e);
        const valor = !p.f ? 'R$ ••••' : formatarMoeda(e.valorCobrado || 0);
        let acoes = `<button class="btn btn-xs btn-primary" onclick="verEvento(${e.id})">📊</button>`;
        if (p.e) acoes += `<button class="btn btn-xs btn-ghost" onclick="editarEvento(${e.id})">✏️</button>`;
        acoes += `<button class="btn btn-xs btn-primary" onclick="abrirPortalCat(${e.id})">🌐</button>`;
        if (p.x) acoes += `<button class="btn btn-xs btn-danger" onclick="excluirEvento(${e.id})">🗑️</button>`;
        return `<tr>
            <td><div style="width:34px;height:34px;border-radius:6px;overflow:hidden;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">${e.logoUrl ? `<img src="${e.logoUrl}" style="width:100%;height:100%;object-fit:contain;">` : '🎪'}</div></td>
            <td><strong>${escapeHtml(e.nome)}</strong></td>
            <td>${escapeHtml(e.cliente)}</td>
            <td>${formatarData(e.dataInicio)} a ${formatarData(e.dataFim)}</td>
            <td>${escapeHtml(e.local)}</td>
            <td>${e.totalVisitantes}</td>
            <td>${valor}</td>
            <td><span class="badge ${statusBadgeClass(status)}">${status}</span></td>
            <td>${acoes}</td>
        </tr>`;
    }).join('');
}

function renderizarFuncionarios() {
    const tbody = document.getElementById('funcionariosTable');
    if (!tbody) return;
    tbody.innerHTML = FN.map((f, i) => {
        const perms = [];
        if (f.permissoes.v) perms.push('👁');
        if (f.permissoes.e) perms.push('✏️');
        if (f.permissoes.f) perms.push('💰');
        return `<tr>
            <td><strong>${escapeHtml(f.nome)}</strong></td>
            <td>${escapeHtml(f.email)}</td>
            <td><span class="badge ${f.nivel === 'Administrador' ? 'badge-info' : 'badge-success'}">${f.nivel}</span></td>
            <td>${perms.join(' ') || '-'}</td>
            <td>${escapeHtml(f.eventos || '')}</td>
            <td>
                <button class="btn btn-xs btn-ghost" onclick="editarFuncionario(${i})">✏️</button>
                <button class="btn btn-xs btn-danger" onclick="excluirFuncionario(${i})">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarInterfaceUsuario();
    preencherSelectsEventos();
    renderizarEventos();
    renderizarFuncionarios();
    atualizarResumoFinanceiroGeral();
    aplicarPermissoes();

    document.getElementById('loginPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') fazerLogin();
    });

    document.getElementById('confirmBtnSim').addEventListener('click', () => {
        fecharModal('confirmModal');
        if (typeof callbackConfirmacao === 'function') callbackConfirmacao();
        callbackConfirmacao = null;
    });
    document.getElementById('confirmBtnNao').addEventListener('click', () => {
        fecharModal('confirmModal');
        callbackConfirmacao = null;
    });
});
