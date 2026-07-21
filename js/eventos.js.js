// CRUD de Eventos
function preencherSelectsEventos() {
    const opcoes = EV.map(e => `<option value="${e.id}">${e.nome} - ${e.cliente} (${calcularStatusEvento(e)})</option>`).join('');
    ['eventoSelect', 'eventoSelectFinanceiro'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<option value="">-- Escolha --</option>' + opcoes;
    });
    const relEl = document.getElementById('relatorioEventoSelect');
    if (relEl) relEl.innerHTML = '<option value="">Selecione...</option>' + EV.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
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