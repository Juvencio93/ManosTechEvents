// Área do Cliente – versão final com atualização forçada

async function abrirAreaClienteEvento(evento) {
    console.log('🚀 abrirAreaClienteEvento chamada para:', evento.nome);
    eventoClienteAtual = evento;

    document.getElementById('clienteEventoNome').textContent = evento.nome;
    document.getElementById('clienteLogoHeader').innerHTML = evento.logoUrl
        ? `<img src="${evento.logoUrl}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none'">`
        : '🎪';

    let visitantes = [];
    try {
        visitantes = await apiListarVisitantes(evento.id);
        console.log('📊 Visitantes recebidos:', visitantes);
    } catch (e) {
        console.error('❌ Falha ao buscar visitantes:', e);
        alert('Erro ao carregar visitantes. Usando dados locais.');
        visitantes = evento.visitantes || [];
    }

    const total = visitantes.length;
    document.getElementById('clienteTotalVisitantes').textContent = total;
    document.getElementById('clienteLiveConnected').textContent = total > 0 ? Math.max(1, Math.floor(total * 0.3)) : 0;

    // Mapa de calor
    const horas = {};
    for (let h = 8; h <= 20; h++) horas[h] = 0;
    visitantes.forEach(v => {
        const h = v.hora || 8;
        if (horas[h] !== undefined) horas[h]++;
    });
    const max = Math.max(...Object.values(horas), 1);
    document.getElementById('clienteHeatmapContainer').innerHTML = Object.entries(horas).map(([h, c]) =>
        `<div class="heatmap-bar" style="height:${Math.max((c / max) * 140, 4)}px;" title="${h}h: ${c}"></div>`
    ).join('');

    // Tabela
    document.getElementById('clienteVisitantesTable').innerHTML = visitantes.slice(0, 50).map(v =>
        `<tr><td><strong>${escapeHtml(v.nome)}</strong></td><td>${escapeHtml(v.email)}</td><td>${escapeHtml(v.whatsapp)}</td><td>${v.acesso}</td></tr>`
    ).join('');

    console.log('✅ Área do cliente atualizada. Total:', total);
}

// Configuração
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

async function salvarConfiguracao() {
    CFG.empresaNome = document.getElementById('configEmpresaNome').value.trim() || 'Manos Tech';
    CFG.email = document.getElementById('configEmail').value.trim();
    CFG.telefoneSuporte = document.getElementById('configTelefoneSuporte').value.trim();
    CFG.adminNome = document.getElementById('configAdminNome').value.trim();
    CFG.adminEmail = document.getElementById('configAdminEmail').value.trim();
    // Não salvamos senha aqui
    if (configLogoTemp !== null && configLogoTemp !== undefined) {
        CFG.logoUrl = configLogoTemp;
    }
    try {
        await apiSalvarConfig(CFG);
        atualizarInterfaceUsuario();
        toast('✅ Configurações salvas!');
    } catch (e) {
        toast('❌ Erro ao salvar configurações: ' + e.message);
    }
}

function cancelarConfiguracao() {
    carregarDados();
    atualizarInterfaceUsuario();
    showPage('inicio');
    toast('Alterações canceladas.');
}
async function gerarRelatorioCliente() {
    if (!eventoClienteAtual) {
        alert('Nenhum evento carregado.');
        return;
    }
    // Busca os visitantes atualizados antes de gerar o PDF
    let visitantes = [];
    try {
        visitantes = await apiListarVisitantes(eventoClienteAtual.id);
    } catch (e) {
        console.warn('Usando dados locais para o relatório');
        visitantes = eventoClienteAtual.visitantes || [];
    }
    // Cria uma cópia do evento com os visitantes preenchidos
    const eventoCompleto = { ...eventoClienteAtual, visitantes, totalVisitantes: visitantes.length };
    gerarPDFEvento(eventoCompleto);
}
