// Dashboard
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