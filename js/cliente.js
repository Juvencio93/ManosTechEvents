// Área do Cliente – Sincronizada com o Dashboard

async function abrirAreaClienteEvento(evento) {
    eventoClienteAtual = evento;
    document.getElementById('clienteEventoNome').textContent = evento.nome;
    document.getElementById('clienteLogoHeader').innerHTML = evento.logoUrl
        ? `<img src="${evento.logoUrl}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none'">`
        : '🎪';

    let visitantes = [];
    try {
        visitantes = await apiListarVisitantes(evento.id);
    } catch (e) {
        console.warn('Usando dados locais para visitantes');
        visitantes = evento.visitantes || [];
    }

    const total = visitantes.length;
    document.getElementById('clienteTotalVisitantes').textContent = total;
    const conectados = total > 0 ? Math.max(1, Math.floor(total * 0.3)) : 0;
    document.getElementById('clienteLiveConnected').textContent = conectados;

    // Mapa de calor (garantido mesmo que vazio)
    const horas = {};
    for (let h = 8; h <= 20; h++) horas[h] = 0;
    visitantes.forEach(v => {
        const h = v.hora || 8;
        if (horas[h] !== undefined) horas[h]++;
    });
    const max = Math.max(...Object.values(horas), 1);
    const heatmapEl = document.getElementById('clienteHeatmapContainer');
    if (heatmapEl) {
        heatmapEl.innerHTML = Object.entries(horas).map(([h, c]) =>
            `<div class="heatmap-bar" style="height:${Math.max((c / max) * 140, 4)}px;" title="${h}h: ${c}"></div>`
        ).join('');
    }

    // Tabela de visitantes
    const tbody = document.getElementById('clienteVisitantesTable');
    if (tbody) {
        tbody.innerHTML = visitantes.slice(0, 50).map(v =>
            `<tr><td><strong>${escapeHtml(v.nome)}</strong></td><td>${escapeHtml(v.email)}</td><td>${escapeHtml(v.whatsapp)}</td><td>${v.acesso}</td></tr>`
        ).join('');
    }
}

// Atualiza área do cliente se já estiver visível
async function atualizarAreaClienteSeAtiva() {
    if (eventoClienteAtual) {
        await abrirAreaClienteEvento(eventoClienteAtual);
    }
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
    const novaSenha = document.getElementById('configAdminSenha').value.trim();

    if (configLogoTemp !== null && configLogoTemp !== undefined) {
        CFG.logoUrl = configLogoTemp;
    }

    try {
        await apiSalvarConfig(CFG);

        if (sessao?.id) {
            const { error: perfilError } = await supabaseClient
                .from('perfis')
                .update({ nome: CFG.adminNome })
                .eq('id', sessao.id);
            if (perfilError) console.warn('Erro ao atualizar nome no perfil:', perfilError);
        }

        if (usuarioLogado && usuarioLogado.nivel === 'Administrador') {
            usuarioLogado.nome = CFG.adminNome;
            const userEl = document.getElementById('sidebarUserName');
            if (userEl) userEl.textContent = CFG.adminNome.split(' ')[0];
        }

        if (novaSenha) {
            if (novaSenha.length < 4) { toast('⚠️ Senha deve ter no mínimo 4 caracteres'); return; }
            try {
                await apiAlterarSenha(novaSenha);
                document.getElementById('configAdminSenha').value = '';
                toast('🔒 Senha alterada. Você será desconectado para usar a nova senha.');
                setTimeout(() => sairDoSistema(), 2000);
                return;
            } catch (e) {
                toast('❌ Erro ao alterar senha: ' + e.message);
                return;
            }
        }

        atualizarInterfaceUsuario();
        toast('✅ Configurações salvas!');
        showPage('inicio');
    } catch (e) {
        toast('❌ Erro ao salvar configurações: ' + e.message);
    }
}

async function gerarRelatorioCliente() {
    if (!eventoClienteAtual) { alert('Nenhum evento carregado.'); return; }
    let visitantes = [];
    try { visitantes = await apiListarVisitantes(eventoClienteAtual.id); } catch (e) {}
    gerarPDFEvento({ ...eventoClienteAtual, visitantes, totalVisitantes: visitantes.length });
}

function cancelarConfiguracao() {
    carregarDados();
    atualizarInterfaceUsuario();
    showPage('inicio');
    toast('Alterações canceladas.');
}
