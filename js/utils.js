// Utilitários
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
