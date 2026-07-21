// CRUD de Eventos (adaptado para API)

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

    // CORRIGIDO: Garante que patrocinadoresLogos seja array de strings
    const logos = evento.patrocinadoresLogos || [];
    patrocinadoresTemp = Array.isArray(logos) ? logos.map(item => typeof item === 'string' ? item : (item.url || '')) : [];

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


