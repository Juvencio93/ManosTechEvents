// Área do Cliente
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
    
    toast('✅ Configurações salvas!');
}

function cancelarConfiguracao() {
    carregarDados();
    atualizarInterfaceUsuario();
    showPage('inicio');
    toast('Alterações canceladas.');
}
